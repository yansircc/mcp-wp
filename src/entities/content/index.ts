import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerBulkCreateContentTool } from "./bulk-create-content.js";
import { registerBulkDeleteContentTool } from "./bulk-delete-content.js";
import { registerCreateContentTool } from "./create-content.js";
import { registerDeleteContentByIdTool } from "./delete-content-by-id.js";
import { registerGetContentByIdTool } from "./get-content-by-id.js";
import { registerListContentTool } from "./list-content.js";
import { registerListContentTypesTool } from "./list-content-types.js";
import { registerQueryContentTool } from "./query-content.js";
import { registerUpdateContentTool } from "./update-content.js";

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
export * from "./create-content.js";
export * from "./bulk-create-content.js";
export * from "./delete-content-by-id.js";
export * from "./bulk-delete-content.js";
export * from "./get-content-by-id.js";
export * from "./list-content.js";
export * from "./list-content-types.js";
export * from "./query-content.js";
export * from "./update-content.js";

// Export tool registrators collection
export { contentToolRegistrators };
