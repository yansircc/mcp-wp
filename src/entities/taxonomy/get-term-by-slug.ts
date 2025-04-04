import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { fetchWpApi } from "../../lib/api-client";
import {
	formatErrorResponse,
	formatTermResponse,
	taxonomyTypeSchema,
} from "./utils";

// Define input schema
export const getTermBySlugSchema = taxonomyTypeSchema.extend({
	slug: z.string().min(1).describe("分类项别名"),
});

// Create tool handler function
export const getTermBySlugHandler = async ({
	type,
	endpoint,
	slug,
}: z.infer<typeof getTermBySlugSchema>) => {
	try {
		// WordPress API doesn't have a direct endpoint for fetching by slug,
		// so we need to query and filter
		const terms = await fetchWpApi<any[]>(endpoint, {
			method: "GET",
			params: { slug },
			needsAuth: true,
		});

		if (terms.length === 0) {
			return {
				content: [
					{
						type: "text" as const,
						text: `未找到别名为 "${slug}" 的${type}项。`,
					},
				],
				isError: true,
			};
		}

		// Return the first match (should be the only one)
		return formatTermResponse(type, terms[0]);
	} catch (error) {
		return formatErrorResponse("获取", type, error);
	}
};

// Register tool with MCP server
export function registerGetTermBySlugTool(server: McpServer) {
	server.tool(
		"get-term-by-slug",
		{
			type: getTermBySlugSchema.shape.type,
			endpoint: getTermBySlugSchema.shape.endpoint,
			slug: getTermBySlugSchema.shape.slug,
		},
		getTermBySlugHandler,
	);

	return server;
}
