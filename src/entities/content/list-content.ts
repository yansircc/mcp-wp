import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { WP_REST_API_Posts } from "wp-types";
import type { z } from "zod";
import { fetchWpApi } from "../../lib/api-client.js";
import {
	contentQuerySchema,
	contentTypeSchema,
	formatContentListResponse,
	formatErrorResponse,
	prepareApiParams,
} from "./utils.js";

// Define input schema
export const listContentSchema = contentTypeSchema.merge(contentQuerySchema);

// Create tool handler function
export const listContentHandler = async ({
	type,
	endpoint,
	...queryParams
}: z.infer<typeof listContentSchema>) => {
	try {
		// Prepare API parameters
		const params = prepareApiParams(queryParams);

		// Call WordPress API
		const items = await fetchWpApi<WP_REST_API_Posts>(endpoint, {
			method: "GET",
			params,
			needsAuth: true,
		});

		// Format response
		return formatContentListResponse(type, items);
	} catch (error) {
		return formatErrorResponse("获取", type, error);
	}
};

// Register tool with MCP server
export function registerListContentTool(server: McpServer) {
	server.tool(
		"list-content",
		{
			type: listContentSchema.shape.type,
			endpoint: listContentSchema.shape.endpoint,
			page: listContentSchema.shape.page,
			per_page: listContentSchema.shape.per_page,
			status: listContentSchema.shape.status,
			search: listContentSchema.shape.search,
			order: listContentSchema.shape.order,
			orderby: listContentSchema.shape.orderby,
		},
		listContentHandler,
	);

	return server;
}
