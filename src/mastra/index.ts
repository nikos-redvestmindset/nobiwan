import { Mastra } from "@mastra/core";

import { sqlGenBaseAgent } from "./agents/sql-gen-base";
import { sqlExecutorAgent } from "./agents/sql-executor";
import { sqlWithSchemaAgent } from "./agents/sql-gen-with-schema";

export const mastra = new Mastra({
  agents: { sqlGenBaseAgent, sqlWithSchemaAgent, sqlExecutorAgent },
});
