import { EditorView } from "@codemirror/view";
import { Extension } from "@codemirror/state";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";

const oneLightColors = {
  chalky: "#abb2bf",
  coral: "#e06c75",
  cyan: "#56b6c2",
  invalid: "#ffffff",
  ivory: "#abb2bf",
  stone: "#abb2bf", // Foreground
  malibu: "#61afef",
  sage: "#98c379",
  whiskey: "#d19a66",
  violet: "#c678dd",
  darkBackground: "#282c34",
  highlightBackground: "#2c313a",
  background: "#fafafa",
  tooltipBackground: "#353a42",
  selection: "#e5e5e6",
  cursor: "#528bff",
};

export const oneLightTheme = EditorView.theme(
  {
    "&": {
      color: "#383a42", // One Light Foreground
      backgroundColor: "#fafafa", // One Light Background
    },
    ".cm-content": {
      caretColor: "#528bff",
    },
    "&.cm-focused .cm-cursor": {
      borderLeftColor: "#528bff",
    },
    "&.cm-focused .cm-selectionBackground, ::selection": {
      backgroundColor: "#e5e5e6",
    },
    ".cm-gutters": {
      backgroundColor: "#fafafa",
      color: "#9d9d9f",
      border: "none",
    },
    ".cm-activeLineGutter": {
      backgroundColor: "#f2f2f2",
    },
    ".cm-activeLine": {
      backgroundColor: "#f2f2f2",
    },
  },
  { dark: false }
);

export const oneLightHighlightStyle = HighlightStyle.define([
  { tag: t.keyword, color: "#a626a4" }, // Purple
  {
    tag: [t.name, t.deleted, t.character, t.propertyName, t.macroName],
    color: "#e45649",
  }, // Red
  { tag: [t.function(t.variableName), t.labelName], color: "#4078f2" }, // Blue
  { tag: [t.color, t.constant(t.name), t.standard(t.name)], color: "#d19a66" }, // Orange
  { tag: [t.definition(t.name), t.separator], color: "#383a42" },
  {
    tag: [
      t.typeName,
      t.className,
      t.number,
      t.changed,
      t.annotation,
      t.modifier,
      t.self,
      t.namespace,
    ],
    color: "#986801",
  }, // Orange/Yellow
  {
    tag: [
      t.operator,
      t.operatorKeyword,
      t.url,
      t.escape,
      t.regexp,
      t.link,
      t.special(t.string),
    ],
    color: "#56b6c2",
  }, // Cyan
  { tag: [t.meta, t.comment], color: "#a0a1a7", fontStyle: "italic" }, // Grey
  { tag: t.strong, fontWeight: "bold" },
  { tag: t.emphasis, fontStyle: "italic" },
  { tag: t.strikethrough, textDecoration: "line-through" },
  { tag: t.link, color: "#56b6c2", textDecoration: "underline" },
  { tag: t.heading, fontWeight: "bold", color: "#e45649" },
  { tag: [t.atom, t.bool, t.special(t.variableName)], color: "#d19a66" }, // Orange
  { tag: [t.processingInstruction, t.string, t.inserted], color: "#50a14f" }, // Green
  { tag: t.invalid, color: "#ffffff" },
]);

export const oneLight: Extension = [
  oneLightTheme,
  syntaxHighlighting(oneLightHighlightStyle),
];
