import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerBulkCreateContentTool } from "./bulk-create-content";
import { registerBulkDeleteContentTool } from "./bulk-delete-content";
import { registerCreateContentTool } from "./create-content";
import { registerDeleteContentByIdTool } from "./delete-content-by-id";
import { registerGetContentByIdTool } from "./get-content-by-id";
import { registerListContentTool } from "./list-content";
import { registerListContentTypesTool } from "./list-content-types";
import { registerQueryContentTool } from "./query-content";
import { registerUpdateContentTool } from "./update-content";

// Collection of all content tool registrators
const contentToolRegistrators = {
	createContent: registerCreateContentTool,
	bulkCreateContent: registerBulkCreateContentTool,
	getContentById: registerGetContentByIdTool,
	updateContent: registerUpdateContentTool,
	deleteContentById: registerDeleteContentByIdTool,
	bulkDeleteContent: registerBulkDeleteContentTool,
	listContent: registerListContentTool,
	queryContent: registerQueryContentTool,
	listContentTypes: registerListContentTypesTool,
};

// Register all content-related tools
export function registerContentTools(server: McpServer): McpServer {
	// Apply all registrators to the server
	for (const registrator of Object.values(contentToolRegistrators)) {
		registrator(server);
	}
	return server;
}

// Register specific content tools
export function registerSpecificContentTools(
	server: McpServer,
	toolNames: Array<keyof typeof contentToolRegistrators>,
): McpServer {
	for (const name of toolNames) {
		const registrator = contentToolRegistrators[name];
		registrator(server);
	}
	return server;
}

// Export all tools for individual use
export * from "./create-content";
export * from "./bulk-create-content";
export * from "./delete-content-by-id";
export * from "./bulk-delete-content";
export * from "./get-content-by-id";
export * from "./list-content";
export * from "./list-content-types";
export * from "./query-content";
export * from "./update-content";

// Export tool registrators collection
export { contentToolRegistrators };
