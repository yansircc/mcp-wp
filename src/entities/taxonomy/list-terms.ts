import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { z } from "zod";
import { fetchWpApi } from "../../lib/api-client.js";
import {
	formatErrorResponse,
	formatTermListResponse,
	prepareApiParams,
	taxonomyTypeSchema,
	termQuerySchema,
} from "./utils.js";

// Define input schema
export const listTermsSchema = taxonomyTypeSchema.merge(termQuerySchema);

// Create tool handler function
export const listTermsHandler = async ({
	type,
	endpoint,
	...queryParams
}: z.infer<typeof listTermsSchema>) => {
	try {
		// Prepare API parameters
		const params = prepareApiParams(queryParams);

		// Call WordPress API
		const terms = await fetchWpApi<any[]>(endpoint, {
			method: "GET",
			params,
			needsAuth: true,
		});

		// Format response
		return formatTermListResponse(type, terms);
	} catch (error) {
		return formatErrorResponse("获取", type, error);
	}
};

// Register tool with MCP server
export function registerListTermsTool(server: McpServer) {
	server.tool(
		"list-terms",
		{
			type: listTermsSchema.shape.type,
			endpoint: listTermsSchema.shape.endpoint,
			page: listTermsSchema.shape.page,
			per_page: listTermsSchema.shape.per_page,
			search: listTermsSchema.shape.search,
			order: listTermsSchema.shape.order,
			orderby: listTermsSchema.shape.orderby,
			hide_empty: listTermsSchema.shape.hide_empty,
			parent: listTermsSchema.shape.parent,
			post: listTermsSchema.shape.post,
			slug: listTermsSchema.shape.slug,
		},
		listTermsHandler,
	);

	return server;
}
