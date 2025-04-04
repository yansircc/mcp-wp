import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { z } from "zod";
import { fetchWpApi } from "../../lib/api-client";
import {
	advancedTermQuerySchema,
	formatErrorResponse,
	formatTermListResponse,
	prepareApiParams,
	taxonomyTypeSchema,
} from "./utils";

// Define input schema
export const queryTermsSchema = taxonomyTypeSchema.merge(
	advancedTermQuerySchema,
);

// Create handler function
export const queryTermsHandler = async ({
	type,
	endpoint,
	...queryParams
}: z.infer<typeof queryTermsSchema>) => {
	try {
		// Prepare API parameters
		const params = prepareApiParams(queryParams);

		// Call WordPress API
		const terms = await fetchWpApi<any[]>(endpoint, {
			method: "GET",
			params,
			needsAuth: true,
		});

		// Generate human-readable filter information
		const activeFilters: string[] = [];
		if (queryParams.search)
			activeFilters.push(`搜索关键词: ${queryParams.search}`);
		if (queryParams.parent) activeFilters.push(`父项ID: ${queryParams.parent}`);
		if (queryParams.post) activeFilters.push(`文章ID: ${queryParams.post}`);
		if (queryParams.slug) activeFilters.push(`别名: ${queryParams.slug}`);
		if (queryParams.include)
			activeFilters.push(`包含ID: ${queryParams.include.join(",")}`);
		if (queryParams.exclude)
			activeFilters.push(`排除ID: ${queryParams.exclude.join(",")}`);
		if (queryParams.hide_empty !== undefined)
			activeFilters.push(`隐藏空项: ${queryParams.hide_empty}`);
		if (queryParams.meta_key) {
			let metaFilter = `元数据键: ${queryParams.meta_key}`;
			if (queryParams.meta_value) {
				metaFilter += `, 值: ${queryParams.meta_value}`;
				if (queryParams.meta_compare) {
					metaFilter += `, 比较: ${queryParams.meta_compare}`;
				}
			}
			activeFilters.push(metaFilter);
		}

		// Format and return results
		return formatTermListResponse(type, terms, activeFilters);
	} catch (error) {
		return formatErrorResponse("查询", type, error);
	}
};

// Register tool with MCP server
export function registerQueryTermsTool(server: McpServer) {
	server.tool(
		"query-terms",
		{
			type: queryTermsSchema.shape.type,
			endpoint: queryTermsSchema.shape.endpoint,
			page: queryTermsSchema.shape.page,
			per_page: queryTermsSchema.shape.per_page,
			search: queryTermsSchema.shape.search,
			order: queryTermsSchema.shape.order,
			orderby: queryTermsSchema.shape.orderby,
			hide_empty: queryTermsSchema.shape.hide_empty,
			parent: queryTermsSchema.shape.parent,
			post: queryTermsSchema.shape.post,
			slug: queryTermsSchema.shape.slug,
			include: queryTermsSchema.shape.include,
			exclude: queryTermsSchema.shape.exclude,
			meta_key: queryTermsSchema.shape.meta_key,
			meta_value: queryTermsSchema.shape.meta_value,
			meta_compare: queryTermsSchema.shape.meta_compare,
		},
		queryTermsHandler,
	);

	return server;
}
