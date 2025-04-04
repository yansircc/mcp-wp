import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { WP_REST_API_Post } from "wp-types";
import type { z } from "zod";
import { fetchWpApi } from "../../lib/api-client.js";
import {
	contentIdSchema,
	contentTypeSchema,
	formatContentResponse,
	formatErrorResponse,
} from "./utils.js";

// Define input schema
export const getContentByIdSchema = contentTypeSchema.merge(contentIdSchema);

// Create tool handler function
export const getContentByIdHandler = async ({
	type,
	endpoint,
	id,
}: z.infer<typeof getContentByIdSchema>) => {
	try {
		const content = await fetchWpApi<WP_REST_API_Post>(`${endpoint}/${id}`, {
			method: "GET",
			needsAuth: true,
		});

		return formatContentResponse(type, content);
	} catch (error) {
		return formatErrorResponse("获取", type, error);
	}
};

// Register tool with MCP server
export function registerGetContentByIdTool(server: McpServer) {
	server.tool(
		"get-content-by-id",
		{
			type: getContentByIdSchema.shape.type,
			endpoint: getContentByIdSchema.shape.endpoint,
			id: getContentByIdSchema.shape.id,
		},
		getContentByIdHandler,
	);

	return server;
}
