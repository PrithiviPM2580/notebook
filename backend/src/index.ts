import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { Model } from "./constants/index.constant";
import envConfig from "./config/env.config";

const llm = new ChatGoogleGenerativeAI({
  model: Model.Gemini25Flash,
  temperature: 0,
  apiKey: envConfig.GEMINI_API_KEY,
});

async () => {
  const response = await llm.invoke([
    {
      role: "system",
      content: "Translate this message to the Franch",
    },
    {
      role: "human",
      content: "Hello, how are you?",
    },
  ]);

  console.log(response);
};
