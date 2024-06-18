require('dotenv').config();
const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold
} = require("@google/generative-ai");
const { GoogleAIFileManager } = require("@google/generative-ai/files");

const app = express();
const port = 3001;

app.use(cors()); // Enable CORS for all routes

const upload = multer({ dest: 'uploads/' });

const apiKey = "AIzaSyDhfeanHiRbyV0Vyrp7_YSgfvN5NTzY_PI";
const genAI = new GoogleGenerativeAI(apiKey);
const fileManager = new GoogleAIFileManager(apiKey);

async function uploadToGemini(filePath, mimeType) {
  const uploadResult = await fileManager.uploadFile(filePath, {
    mimeType,
    displayName: path.basename(filePath),
  });
  const file = uploadResult.file;
  console.log(`Uploaded file ${file.displayName} as: ${file.name}`);
  return file;
}


safety_settings = [
    {
    "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
    "threshold": "BLOCK_NONE"
    },
    {
    "category": "HARM_CATEGORY_HATE_SPEECH",
    "threshold": "BLOCK_NONE"
    },
    {
    "category": "HARM_CATEGORY_HARASSMENT",
    "threshold": "BLOCK_NONE"
    },
    {
    "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
    "threshold": "BLOCK_NONE"
    }
]

const safetySetting = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_UNSPECIFIED,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DEROGATORY,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_TOXICITY,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_VIOLENCE,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUAL,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  }
];

const model = genAI.getGenerativeModel({model: "gemini-1.5-flash", safetySetting });

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain"
//   safetySettings: [
//     {
//       category: HarmCategory.HARM_CATEGORY_DEROGATORY,
//       threshold: HarmBlockThreshold.BLOCK_HIGH_AND_ABOVE,
//     },
//     {
//       category: HarmCategory.HARM_CATEGORY_TOXICITY,
//       threshold: HarmBlockThreshold.BLOCK_HIGH_AND_ABOVE,
//     }
//     ]
};

app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).send('No file uploaded.');
    }

    const uploadedFile = await uploadToGemini(file.path, file.mimetype);
    const chatSession = model.startChat({
      generationConfig,
      safety_settings,
      history: [
        {
          role: "user",
          parts: [
            { text: "Classify the damage on the car naming the part that is damaged, the location of the damage, if the car is drivable and an estimation of cost of repair , make them short bullet points." },
          ],
        },
        {
          role: "model",
          parts: [
            { text: "Please provide me with the images of the cars you want me to classify. I need to see the images to assess the damage and provide a comment on its extent." },
          ],
        },
        {
          role: "user",
          parts: [
            {
              fileData: {
                mimeType: uploadedFile.mimeType,
                fileUri: uploadedFile.uri,
              },
            },
          ],
        },
      ],
    });

    const result = await chatSession.sendMessage("INSERT_INPUT_HERE");
    res.json({ response: result.response.text() });
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while processing the request.');
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
