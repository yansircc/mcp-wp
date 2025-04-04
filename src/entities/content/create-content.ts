import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { WP_REST_API_Post } from "wp-types";
import type { z } from "zod";
import { fetchWpApi } from "../../lib/api-client.js";
import {
	contentDataSchema,
	contentTypeSchema,
	formatErrorResponse,
} from "./utils.js";

// Define input schema
export const createContentSchema = contentTypeSchema.merge(contentDataSchema);

// Create tool handler function
export const createContentHandler = async ({
	type,
	endpoint,
	title,
	content,
	status,
}: z.infer<typeof createContentSchema>) => {
	try {
		const response = await fetchWpApi<WP_REST_API_Post>(endpoint, {
			method: "POST",
			body: JSON.stringify({ title, content, status }),
			needsAuth: true,
		});

		return {
			content: [
				{
					type: "text" as const,
					text: `${type}创建成功！ID: ${response.id}, 标题: ${response.title.rendered}`,
				},
			],
		};
	} catch (error) {
		return formatErrorResponse("创建", type, error);
	}
};

// Register tool with MCP server
export function registerCreateContentTool(server: McpServer) {
	server.tool(
		"create-content",
		{
			type: createContentSchema.shape.type,
			endpoint: createContentSchema.shape.endpoint,
			title: createContentSchema.shape.title,
			content: createContentSchema.shape.content,
			status: createContentSchema.shape.status,
		},
		createContentHandler,
	);

	return server;
}
