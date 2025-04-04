#!/usr/bin/env node

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { server } from "./index.js";

console.log("Starting Currency Converter MCP server (CLI)...");
console.log("Fixed exchange rate: USD to CNY = 7.3");

const transport = new StdioServerTransport();

server.connect(transport).catch((error) => {
	console.error("Error running server:", error);
	process.exit(1);
});
