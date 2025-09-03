import { Mastra } from "@mastra/core";

import { sqlGeneratorAgent } from "./agents/sql-generator";
import { sqlExecutorAgent } from "./agents/sql-executor";

export const mastra = new Mastra({
  agents: { sqlGeneratorAgent, sqlExecutorAgent },
});
