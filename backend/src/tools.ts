import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { Model } from "./constants/index.constant";
import envConfig from "./config/env.config";
import { TavilySearch } from "@langchain/tavily";
import { zodToJsonSchema } from "zod-to-json-schema";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { RunnableLambda } from "@langchain/core/runnables";
import { HumanMessage, AIMessage, ToolMessage } from "@langchain/core/messages";

const llm = new ChatGoogleGenerativeAI({
  model: Model.Gemini25FlashLite,
  temperature: 0,
  apiKey: envConfig.GEMINI_API_KEY,
});

const tavilySearch = new TavilySearch({
  maxResults: 5,
  topic: "general",
  tavilyApiKey: envConfig.TAVILY_API_KEY,
});

const talvilyTool = tool(
  async ({ query }) => {
    const result = await tavilySearch.invoke({ query: query });
    console.log("Tavily Search Result:", result);
    return result;
  },
  {
    name: "tavily-search",
    description:
      "Highly capable search tool that retrieves real-time information from the web. Use this tool to answer questions about current weather, news, events, facts, and any other up-to-date information. Always use this tool when the user asks about anything that requires current/live data.",
    schema: z.object({
      query: z
        .string()
        .describe(
          "The search query string. For weather queries, format as 'weather in [location]'",
        ),
    }),
  },
);

const chain = llm.bindTools([talvilyTool]);

const toolChain = RunnableLambda.from(async (userInput: string) => {
  const messages: Array<HumanMessage | AIMessage | ToolMessage> = [
    new HumanMessage({
      content: `You are a helpful assistant with access to tools. When the user asks for real-time information (weather, news, current facts, etc.), you MUST use the tavily-search tool to get the latest information. Always acknowledge when you're using tools to fetch information for the user.\n\nUser query: ${userInput}`,
    }),
  ];

  // Step 1: Get initial response from LLM with tools
  const aiMessage = await chain.invoke(messages);
  console.log("AI Message:", aiMessage);

  // Step 2: Check if the LLM called any tools
  if (!aiMessage.tool_calls || aiMessage.tool_calls.length === 0) {
    console.log("No tool calls made by LLM");
    return aiMessage;
  }

  // Step 3: Execute tool calls
  messages.push(aiMessage);
  const toolResults = [];
  for (const toolCall of aiMessage.tool_calls) {
    console.log("Executing tool call:", toolCall.name, toolCall.args);
    const result = await talvilyTool.invoke(toolCall.args as { query: string });
    console.log("Tool Result:", result);
    toolResults.push(
      new ToolMessage({
        content: JSON.stringify(result),
        tool_call_id: toolCall.id || "tool-call",
        name: toolCall.name,
      }),
    );
  }

  // Step 4: Pass tool results back to LLM for final response
  messages.push(...toolResults);
  const finalResult = await chain.invoke(messages);
  console.log("Final Result:", finalResult);

  return finalResult;
});

async function main() {
  const result = await toolChain.invoke(
    "What is the current weather in Nepal?",
  );

  console.log("Final Result:", result);
}

main().catch((error) => {
  console.error("Error in main execution:", error);
});
