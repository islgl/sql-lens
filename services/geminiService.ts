import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeSqlDiff = async (original: string, modified: string): Promise<AnalysisResult> => {
  if (!original || !modified) {
    throw new Error("Both original and modified SQL are required for analysis.");
  }

  const ai = getClient();
  
  const prompt = `
    Compare the following two SQL queries and provide a structured analysis of the changes.
    
    ORIGINAL SQL:
    ${original}
    
    MODIFIED SQL:
    ${modified}
    
    Provide the output in JSON format with the following fields:
    - summary: A concise natural language explanation of what changed functionally.
    - impact: Potential impact of this change (e.g., performance, data integrity, result set changes).
    - optimizationTips: An array of short tips if the modified query can be improved further (max 3 tips).
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          impact: { type: Type.STRING },
          optimizationTips: { 
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        }
      }
    }
  });

  if (response.text) {
    return JSON.parse(response.text) as AnalysisResult;
  }
  
  throw new Error("Failed to generate analysis");
};
