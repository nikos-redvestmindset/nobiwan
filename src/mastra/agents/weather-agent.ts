import { openai } from "@ai-sdk/openai";
import { Agent } from "@mastra/core/agent";
import { weatherTool } from "../tools/weather-tool";

export const weatherAgent = new Agent({
  name: "WeatherAgent",
  description: "Answers weather questions and can fetch simple mocked weather.",
  instructions:
    "You are a concise weather assistant. Prefer using the weather tool when a location is provided.",
  model: openai("gpt-4o-mini"),
  tools: { weatherTool },
});
