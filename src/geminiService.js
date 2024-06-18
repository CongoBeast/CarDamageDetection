// src/geminiService.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/files";

const apiKey = "AIzaSyDhfeanHiRbyV0Vyrp7_YSgfvN5NTzY_PI";
const genAI = new GoogleGenerativeAI(apiKey);
const fileManager = new GoogleAIFileManager(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

export async function uploadToGemini(path, mimeType) {
  const uploadResult = await fileManager.uploadFile(path, {
    mimeType,
    displayName: path,
  });
  return uploadResult.file;
}

export async function classifyDamage(file) {
  const chatSession = model.startChat({
    generationConfig,
    history: [
      {
        role: "user",
        parts: [
          { text: "I want you to classify the damage on different cars based on the image and comment on the extent of the damage." },
        ],
      },
      {
        role: "model",
        parts: [
          {
            text: "Please provide me with the images of the cars you want me to classify. I need to see the images to assess the damage and provide a comment on its extent.",
          },
        ],
      },
      {
        role: "user",
        parts: [
          {
            fileData: {
              mimeType: file.mimeType,
              fileUri: file.uri,
            },
          },
        ],
      },
    ],
  });

  const result = await chatSession.sendMessage("Classify the damage.");
  return result.response.text();
}
