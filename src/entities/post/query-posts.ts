import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { WP_REST_API_Posts } from "wp-types";
import { z } from "zod";
import { fetchWpApi } from "../../lib/api-client";

// Define input schema with comprehensive query options
export const queryPostsSchema = z.object({
	// Basic pagination
	page: z.number().int().positive().optional().default(1).describe("页码"),
	per_page: z
		.number()
		.int()
		.positive()
		.optional()
		.default(10)
		.describe("每页数量（最大100）"),

	// Sorting options
	order: z
		.enum(["asc", "desc"])
		.optional()
		.default("desc")
		.describe("排序方向"),
	orderby: z
		.enum([
			"date",
			"title",
			"id",
			"author",
			"modified",
			"relevance",
			"slug",
			"include",
			"menu_order",
		])
		.optional()
		.default("date")
		.describe("排序字段"),

	// Content filtering
	status: z
		.enum(["publish", "draft", "pending", "private", "future", "any"])
		.optional()
		.default("publish")
		.describe("文章状态"),
	search: z.string().optional().describe("搜索关键词"),

	// Date filtering
	after: z
		.string()
		.optional()
		.describe("发布日期晚于（ISO8601格式：YYYY-MM-DDTHH:MM:SS）"),
	before: z
		.string()
		.optional()
		.describe("发布日期早于（ISO8601格式：YYYY-MM-DDTHH:MM:SS）"),

	// Author filtering
	author: z.number().int().positive().optional().describe("作者ID"),
	author_exclude: z
		.number()
		.int()
		.positive()
		.optional()
		.describe("排除的作者ID"),

	// Taxonomy filtering
	categories: z
		.union([z.number().int().positive(), z.array(z.number().int().positive())])
		.optional()
		.describe("分类ID或ID数组"),
	categories_exclude: z
		.union([z.number().int().positive(), z.array(z.number().int().positive())])
		.optional()
		.describe("排除的分类ID或ID数组"),
	tags: z
		.union([z.number().int().positive(), z.array(z.number().int().positive())])
		.optional()
		.describe("标签ID或ID数组"),
	tags_exclude: z
		.union([z.number().int().positive(), z.array(z.number().int().positive())])
		.optional()
		.describe("排除的标签ID或ID数组"),

	// Advanced inclusion/exclusion
	include: z
		.array(z.number().int().positive())
		.optional()
		.describe("包含的文章ID"),
	exclude: z
		.array(z.number().int().positive())
		.optional()
		.describe("排除的文章ID"),
	sticky: z.boolean().optional().describe("是否只包含置顶文章"),

	// Slug filtering
	slug: z.string().optional().describe("文章别名(slug)"),
});

// Create handler function
export const queryPostsHandler = async (
	params: z.infer<typeof queryPostsSchema>,
) => {
	try {
		// Prepare API parameters - convert arrays to comma-separated strings
		const apiParams: Record<string, string> = {};

		// Process parameters, converting them to formats expected by WP API
		for (const [key, value] of Object.entries(params)) {
			if (value === undefined) continue;

			// Handle array parameters (convert to comma-separated string)
			if (Array.isArray(value)) {
				apiParams[key] = value.join(",");
			}
			// Handle boolean (convert to string "true"/"false")
			else if (typeof value === "boolean") {
				apiParams[key] = value.toString();
			}
			// Handle dates and other strings/numbers (convert to string)
			else {
				apiParams[key] = String(value);
			}
		}

		// Call WordPress API
		const posts = await fetchWpApi<WP_REST_API_Posts>("/wp/v2/posts", {
			method: "GET",
			params: apiParams,
			needsAuth: true,
		});

		if (posts.length === 0) {
			return {
				content: [
					{
						type: "text" as const,
						text: "没有找到符合条件的文章。",
					},
				],
			};
		}

		// Generate human-readable filter information
		const activeFilters: string[] = [];
		if (params.search) activeFilters.push(`关键词: ${params.search}`);
		if (params.author) activeFilters.push(`作者ID: ${params.author}`);
		if (params.after) activeFilters.push(`发布日期晚于: ${params.after}`);
		if (params.before) activeFilters.push(`发布日期早于: ${params.before}`);
		if (params.categories)
			activeFilters.push(
				`分类: ${Array.isArray(params.categories) ? params.categories.join(",") : params.categories}`,
			);
		if (params.tags)
			activeFilters.push(
				`标签: ${Array.isArray(params.tags) ? params.tags.join(",") : params.tags}`,
			);

		// Return results
		return {
			content: [
				{
					type: "text" as const,
					text: `找到 ${posts.length} 篇文章${activeFilters.length > 0 ? `（筛选条件：${activeFilters.join("; ")}）` : ""}：`,
				},
				...posts.map((post) => ({
					type: "text" as const,
					text: `ID: ${post.id}, 标题: ${post.title.rendered}, 状态: ${post.status}, 发布时间: ${post.date}`,
				})),
			],
		};
	} catch (error) {
		return {
			content: [
				{
					type: "text" as const,
					text: `查询文章失败: ${error instanceof Error ? error.message : String(error)}`,
				},
			],
			isError: true,
		};
	}
};

// Register tool with MCP server
export function registerQueryPostsTool(server: McpServer) {
	server.tool(
		"query-posts",
		{
			page: queryPostsSchema.shape.page,
			per_page: queryPostsSchema.shape.per_page,
			order: queryPostsSchema.shape.order,
			orderby: queryPostsSchema.shape.orderby,
			status: queryPostsSchema.shape.status,
			search: queryPostsSchema.shape.search,
			after: queryPostsSchema.shape.after,
			before: queryPostsSchema.shape.before,
			author: queryPostsSchema.shape.author,
			author_exclude: queryPostsSchema.shape.author_exclude,
			categories: queryPostsSchema.shape.categories,
			categories_exclude: queryPostsSchema.shape.categories_exclude,
			tags: queryPostsSchema.shape.tags,
			tags_exclude: queryPostsSchema.shape.tags_exclude,
			include: queryPostsSchema.shape.include,
			exclude: queryPostsSchema.shape.exclude,
			sticky: queryPostsSchema.shape.sticky,
			slug: queryPostsSchema.shape.slug,
		},
		queryPostsHandler,
	);

	return server;
}
