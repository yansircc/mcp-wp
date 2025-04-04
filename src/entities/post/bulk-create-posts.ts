import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { WP_REST_API_Post } from "wp-types";
import { z } from "zod";
import { fetchWpApi } from "../../lib/api-client";

// Define input schema
export const bulkCreatePostsSchema = z.object({
	posts: z
		.array(
			z.object({
				title: z.string().min(1, "标题不能为空").describe("文章标题"),
				content: z.string().min(1, "内容不能为空").describe("文章内容"),
				status: z
					.enum(["publish", "draft", "pending", "private"])
					.optional()
					.default("publish")
					.describe("文章状态"),
			}),
		)
		.min(1, "至少需要一篇文章")
		.describe("文章列表"),
});

// Create tool handler function
export const bulkCreatePostsHandler = async ({
	posts,
}: z.infer<typeof bulkCreatePostsSchema>) => {
	try {
		const createdPosts: WP_REST_API_Post[] = [];

		// Create posts sequentially to ensure proper error handling
		for (const post of posts) {
			const response = await fetchWpApi<WP_REST_API_Post>("/wp/v2/posts", {
				method: "POST",
				body: JSON.stringify(post),
				needsAuth: true,
			});
			createdPosts.push(response);
		}

		return {
			content: [
				{
					type: "text" as const,
					text: `批量创建文章成功！共创建 ${createdPosts.length} 篇文章`,
				},
				{
					type: "text" as const,
					text: createdPosts
						.map((post) => `ID: ${post.id}, 标题: ${post.title.rendered}`)
						.join("\n"),
				},
			],
		};
	} catch (error) {
		return {
			content: [
				{
					type: "text" as const,
					text: `批量创建文章失败: ${error instanceof Error ? error.message : String(error)}`,
				},
			],
			isError: true,
		};
	}
};

// Register tool with MCP server
export function registerBulkCreatePostsTool(server: McpServer) {
	server.tool(
		"bulk-create-posts",
		{
			posts: bulkCreatePostsSchema.shape.posts,
		},
		bulkCreatePostsHandler,
	);

	return server;
}
