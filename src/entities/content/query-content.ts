import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { WP_REST_API_Posts } from "wp-types";
import type { z } from "zod";
import { fetchWpApi } from "../../lib/api-client";
import {
	advancedContentQuerySchema,
	contentTypeSchema,
	formatContentListResponse,
	formatErrorResponse,
	prepareApiParams,
} from "./utils";

// Define input schema
export const queryContentSchema = contentTypeSchema.merge(
	advancedContentQuerySchema,
);

// Create handler function
export const queryContentHandler = async ({
	type,
	endpoint,
	...queryParams
}: z.infer<typeof queryContentSchema>) => {
	try {
		// Prepare API parameters
		const params = prepareApiParams(queryParams);

		// Call WordPress API
		const items = await fetchWpApi<WP_REST_API_Posts>(endpoint, {
			method: "GET",
			params,
			needsAuth: true,
		});

		// Generate human-readable filter information
		const activeFilters: string[] = [];
		if (queryParams.search) activeFilters.push(`关键词: ${queryParams.search}`);
		if (queryParams.author) activeFilters.push(`作者ID: ${queryParams.author}`);
		if (queryParams.after)
			activeFilters.push(`发布日期晚于: ${queryParams.after}`);
		if (queryParams.before)
			activeFilters.push(`发布日期早于: ${queryParams.before}`);
		if (queryParams.categories) {
			activeFilters.push(
				`分类: ${
					Array.isArray(queryParams.categories)
						? queryParams.categories.join(",")
						: queryParams.categories
				}`,
			);
		}
		if (queryParams.tags) {
			activeFilters.push(
				`标签: ${
					Array.isArray(queryParams.tags)
						? queryParams.tags.join(",")
						: queryParams.tags
				}`,
			);
		}

		// Format and return results
		return formatContentListResponse(type, items, activeFilters);
	} catch (error) {
		return formatErrorResponse("查询", type, error);
	}
};

// Register tool with MCP server
export function registerQueryContentTool(server: McpServer) {
	server.tool(
		"query-content",
		{
			type: queryContentSchema.shape.type,
			endpoint: queryContentSchema.shape.endpoint,
			page: queryContentSchema.shape.page,
			per_page: queryContentSchema.shape.per_page,
			order: queryContentSchema.shape.order,
			orderby: queryContentSchema.shape.orderby,
			status: queryContentSchema.shape.status,
			search: queryContentSchema.shape.search,
			after: queryContentSchema.shape.after,
			before: queryContentSchema.shape.before,
			author: queryContentSchema.shape.author,
			author_exclude: queryContentSchema.shape.author_exclude,
			categories: queryContentSchema.shape.categories,
			categories_exclude: queryContentSchema.shape.categories_exclude,
			tags: queryContentSchema.shape.tags,
			tags_exclude: queryContentSchema.shape.tags_exclude,
			include: queryContentSchema.shape.include,
			exclude: queryContentSchema.shape.exclude,
			sticky: queryContentSchema.shape.sticky,
			slug: queryContentSchema.shape.slug,
		},
		queryContentHandler,
	);

	return server;
}
