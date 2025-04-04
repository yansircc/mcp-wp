#!/usr/bin/env node

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { server } from "./index.js";

const transport = new StdioServerTransport();

server.connect(transport).catch((error) => {
	console.error("Error running server:", error);
	process.exit(1);
});
