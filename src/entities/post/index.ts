import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerBulkCreatePostsTool } from "./bulk-create-posts";
import { registerBulkDeletePostsTool } from "./bulk-delete-posts";
import { registerCreatePostTool } from "./create-post";
import { registerDeletePostByIdTool } from "./delete-post-by-id";
import { registerGetPostByIdTool } from "./get-post-by-id";
import { registerListPostsTool } from "./list-posts";
import { registerQueryPostsTool } from "./query-posts";
import { registerUpdatePostTool } from "./update-post";

// Collection of all post tool registrators
const postToolRegistrators = {
	createPost: registerCreatePostTool,
	bulkCreatePosts: registerBulkCreatePostsTool,
	getPostById: registerGetPostByIdTool,
	updatePost: registerUpdatePostTool,
	deletePostById: registerDeletePostByIdTool,
	bulkDeletePosts: registerBulkDeletePostsTool,
	listPosts: registerListPostsTool,
	queryPosts: registerQueryPostsTool,
};

// Register all post-related tools
export function registerPostTools(server: McpServer): McpServer {
	// Apply all registrators to the server
	for (const registrator of Object.values(postToolRegistrators)) {
		registrator(server);
	}
	return server;
}

// Register specific post tools
export function registerSpecificPostTools(
	server: McpServer,
	toolNames: Array<keyof typeof postToolRegistrators>,
): McpServer {
	for (const name of toolNames) {
		const registrator = postToolRegistrators[name];
		registrator(server);
	}
	return server;
}

// Export all tools for individual use
export * from "./create-post";
export * from "./bulk-create-posts";
export * from "./delete-post-by-id";
export * from "./bulk-delete-posts";
export * from "./get-post-by-id";
export * from "./list-posts";
export * from "./query-posts";
export * from "./update-post";

// Export tool registrators collection
export { postToolRegistrators };
