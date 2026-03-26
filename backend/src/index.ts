import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { Model } from "./constants/index.constant";
import envConfig from "./config/env.config";

const llm = new ChatGoogleGenerativeAI({
  model: Model.Gemini25Flash,
  temperature: 0,
  apiKey: envConfig.GEMINI_API_KEY,
});

const main = async () => {
  const response = await llm.invoke([
    {
      role: "system",
      content: "Translate this message to French",
    },
    {
      role: "human",
      content: "Hello, how are you?",
    },
  ]);

  console.log("Model response:", response.content);
};

main().catch((error) => {
  console.error("Failed to invoke model:", error);
  process.exitCode = 1;
});
