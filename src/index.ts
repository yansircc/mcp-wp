import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerContentTools } from "./entities/content";
import { registerAllTools } from "./entities/index.js";
import { registerTaxonomyTools } from "./entities/taxonomy";

// Create the MCP server
const server = new McpServer({
	name: "MCP Demo Server",
	version: "1.0.0",
});

// 注册所有工具
registerAllTools(server);

// Register all content-related tools
registerContentTools(server);

// Register all taxonomy-related tools
registerTaxonomyTools(server);

// Check if this is being run directly or imported as a module
const isMainModule = process.argv[1] === import.meta.url.substring(7);

// Start the server if this is the main module
if (isMainModule) {
	console.log("Starting MCP Demo Server...");
	const transport = new StdioServerTransport();
	server.connect(transport).catch((error) => {
		console.error("Error running server:", error);
		process.exit(1);
	});
}

// Export for programmatic usage
export { server };
