import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { WP_REST_API_Post } from "wp-types";
import { z } from "zod";
import { fetchWpApi } from "../../lib/api-client";

// Define input schema
export const getPostByIdSchema = z.object({
	id: z.number().int().positive().describe("文章ID"),
});

// Create tool handler function
export const getPostByIdHandler = async ({
	id,
}: z.infer<typeof getPostByIdSchema>) => {
	try {
		const post = await fetchWpApi<WP_REST_API_Post>(`/wp/v2/posts/${id}`, {
			method: "GET",
			needsAuth: true,
		});

		return {
			content: [
				{
					type: "text" as const,
					text: "文章信息：",
				},
				{
					type: "text" as const,
					text: `ID: ${post.id}`,
				},
				{
					type: "text" as const,
					text: `标题: ${post.title.rendered}`,
				},
				{
					type: "text" as const,
					text: `状态: ${post.status}`,
				},
				{
					type: "text" as const,
					text: `创建时间: ${post.date}`,
				},
				{
					type: "text" as const,
					text: `内容: ${post.content.rendered}`,
				},
			],
		};
	} catch (error) {
		return {
			content: [
				{
					type: "text" as const,
					text: `获取文章失败: ${error instanceof Error ? error.message : String(error)}`,
				},
			],
			isError: true,
		};
	}
};

// Register tool with MCP server
export function registerGetPostByIdTool(server: McpServer) {
	server.tool(
		"get-post-by-id",
		{
			id: getPostByIdSchema.shape.id,
		},
		getPostByIdHandler,
	);

	return server;
}
