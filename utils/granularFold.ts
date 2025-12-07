import { foldService, syntaxTree } from "@codemirror/language";
import { SyntaxNode } from "@lezer/common";

const isFoldableNode = (node: SyntaxNode, state: any) => {
  const start = node.from;
  const end = node.to;

  // Must span at least 2 lines
  const startLine = state.doc.lineAt(start).number;
  const endLine = state.doc.lineAt(end).number;
  if (endLine <= startLine) return false;

  // Check for parentheses
  const firstChar = state.sliceDoc(start, start + 1);
  const lastChar = state.sliceDoc(end - 1, end);

  if (firstChar === "(" && lastChar === ")") return true;

  // Check for CASE ... END
  // We can loosely check node names if we knew them (e.g. "CaseExpression")
  // Or check first word
  const firstWordMatch = state
    .sliceDoc(start, Math.min(end, start + 10))
    .match(/^\w+/);
  if (firstWordMatch) {
    const word = firstWordMatch[0].toUpperCase();
    if (["CASE", "BEGIN", "CREATE", "SELECT", "WITH"].includes(word))
      return true;
  }

  return false;
};

export const granularFold = foldService.of((state, lineStart, lineEnd) => {
  const tree = syntaxTree(state);
  let bestRange: { from: number; to: number } | null = null;

  // We want to find a node that starts on this line
  // and is a "good" candidate for folding.
  // We prefer larger nodes if they start on this line, but usually innermost is handled by deeper calls?
  // Actually fold gutter looks for fold *starting* at this line.

  tree.iterate({
    from: lineStart,
    to: lineEnd,
    enter: (node) => {
      // Node must start within the line range (typically lineStart is start of line, lineEnd is end of line)
      if (node.from < lineStart || node.from > lineEnd) return;

      // Check if foldable
      if (isFoldableNode(node, state)) {
        // Determine fold range.
        // For parens (), we fold inside: ( ... ) -> (...)
        // range: from + 1, to - 1

        // For CASE END, we might fold from end of first line to END?
        // Simplest is to fold everything after the "header" of the block.

        const text = state.sliceDoc(node.from, node.to);
        if (text.startsWith("(") && text.endsWith(")")) {
          bestRange = { from: node.from + 1, to: node.to - 1 };
        } else {
          // For keywords, we might try to just fold the whole block except the first token?
          // Or better, fold from end of first line.
          const nodeEndLine = state.doc.lineAt(node.to).number;
          const nodeStartLine = state.doc.lineAt(node.from).number;

          if (nodeEndLine > nodeStartLine) {
            // Fold from end of start line to end of node
            const lineContentEnd = state.doc.lineAt(node.from).to;
            if (lineContentEnd < node.to) {
              bestRange = { from: lineContentEnd, to: node.to };
            }
          }
        }
      }
    },
  });

  return bestRange;
});
