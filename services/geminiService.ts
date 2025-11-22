import { GoogleGenerativeAI, SchemaType, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { MenuAnalysisResult } from "../types";

// Validate API Key immediately
const apiKey = import.meta.env.VITE_API_KEY;

// Initialize Gemini Client
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

const analysisSchema = {
  type: SchemaType.OBJECT,
  properties: {
    cuisineType: {
      type: SchemaType.STRING,
      description: "The general cuisine type of the menu in Japanese (e.g., イタリア料理, タイ料理, 居酒屋). Do not use English."
    },
    dishes: {
      type: SchemaType.ARRAY,
      description: "List of identified dishes from the menu.",
      items: {
        type: SchemaType.OBJECT,
        properties: {
          originalName: { type: SchemaType.STRING, description: "The name of the dish as it appears on the menu (keep original language)." },
          translatedName: { type: SchemaType.STRING, description: "Natural Japanese translation of the dish name." },
          description: { type: SchemaType.STRING, description: "A brief, simple Japanese description of the dish (max 30 chars)." },
          price: {
            type: SchemaType.STRING,
            description: "The price string as found on the menu including symbol (e.g., '$15.00', '€12', '250 THB'). Return empty string if not found."
          },
          estimatedYen: {
            type: SchemaType.INTEGER,
            description: "Estimated price in Japanese Yen (JPY) calculated based on the currency and an approximate current exchange rate. Return 0 if price is not found."
          }
        },
        required: ["originalName", "translatedName", "description", "price", "estimatedYen"]
      }
    }
  },
  required: ["cuisineType", "dishes"]
};

export const analyzeMenuImage = async (base64Image: string): Promise<MenuAnalysisResult> => {
  if (!genAI || !apiKey) {
    throw new Error("API_KEY_MISSING");
  }

  try {
    // Use gemini-1.5-flash for speed and cost
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
      },
      // Relax safety settings to prevent blocking food content
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
      ],
      systemInstruction: "You are a fast travel food guide. Analyze the menu image. Output strictly in Japanese. \n1. Identify dishes, translate names to Japanese, and provide very brief Japanese descriptions.\n2. Ensure the cuisine type is a standard Japanese term.\n3. Extract the price for each dish.\n4. Convert the price to Japanese Yen (JPY) using an approximate current exchange rate."
    });

    // Remove the data:image/jpeg;base64, prefix if present for the SDK
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64Data,
          mimeType: "image/jpeg",
        },
      },
      "Analyze this menu image. Extract dishes. Output in JSON format."
    ]);

    const text = result.response.text();
    if (!text) throw new Error("No response from AI");

    // Robust JSON extraction: Find the first '{' and last '}'
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');

    if (firstBrace === -1 || lastBrace === -1) {
      throw new Error("Invalid JSON response: No JSON object found");
    }

    const cleanedText = text.substring(firstBrace, lastBrace + 1);

    return JSON.parse(cleanedText) as MenuAnalysisResult;
  } catch (error) {
    console.error("Error analyzing menu:", error);
    throw error;
  }
};

export const generateDishImage = async (dishDescription: string): Promise<string> => {
  if (!apiKey) {
    throw new Error("API_KEY_MISSING");
  }

  try {
    // Using REST API for Imagen 3 to ensure browser compatibility
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:generateImages?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: `A delicious, professional food photography shot of: ${dishDescription}. High resolution, appetizing lighting, centered composition, shallow depth of field.`,
          numberOfImages: 1,
          aspectRatio: '1:1'
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `HTTP Error: ${response.status}`);
    }

    const data = await response.json();
    const imageBytes = data.generatedImages?.[0]?.image?.imageBytes;

    if (!imageBytes) throw new Error("Failed to generate image");

    return `data:image/jpeg;base64,${imageBytes}`;
  } catch (error) {
    console.error("Error generating dish image:", error);
    throw error;
  }
};
