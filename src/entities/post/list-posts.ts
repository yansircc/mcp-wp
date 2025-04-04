import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { WP_REST_API_Posts } from "wp-types";
import { z } from "zod";
import { fetchWpApi } from "../../lib/api-client";

// Define input schema
export const listPostsSchema = z.object({
	page: z.number().int().positive().optional().default(1).describe("页码"),
	per_page: z
		.number()
		.int()
		.positive()
		.optional()
		.default(10)
		.describe("每页数量（最大100）"),
	status: z
		.enum(["publish", "draft", "pending", "private", "any"])
		.optional()
		.default("publish")
		.describe("文章状态"),
	search: z.string().optional().describe("搜索关键词"),
	order: z
		.enum(["asc", "desc"])
		.optional()
		.default("desc")
		.describe("排序方向"),
	orderby: z
		.enum(["date", "title", "id", "author", "modified", "relevance"])
		.optional()
		.default("date")
		.describe("排序字段"),
});

// Create tool handler function
export const listPostsHandler = async ({
	page,
	per_page,
	status,
	search,
	order,
	orderby,
}: z.infer<typeof listPostsSchema>) => {
	try {
		// Build query parameters
		const params: Record<string, string> = {};

		// Ensure we convert values to strings and only add defined parameters
		if (page !== undefined) params.page = String(page);
		if (per_page !== undefined) params.per_page = String(per_page);
		if (status !== undefined) params.status = status;
		if (order !== undefined) params.order = order;
		if (orderby !== undefined) params.orderby = orderby;
		if (search) params.search = search;

		const posts = await fetchWpApi<WP_REST_API_Posts>("/wp/v2/posts", {
			method: "GET",
			params,
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

		return {
			content: [
				{
					type: "text" as const,
					text: `找到 ${posts.length} 篇文章：`,
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
					text: `获取文章列表失败: ${error instanceof Error ? error.message : String(error)}`,
				},
			],
			isError: true,
		};
	}
};

// Register tool with MCP server
export function registerListPostsTool(server: McpServer) {
	server.tool(
		"list-posts",
		{
			page: listPostsSchema.shape.page,
			per_page: listPostsSchema.shape.per_page,
			status: listPostsSchema.shape.status,
			search: listPostsSchema.shape.search,
			order: listPostsSchema.shape.order,
			orderby: listPostsSchema.shape.orderby,
		},
		listPostsHandler,
	);

	return server;
}
