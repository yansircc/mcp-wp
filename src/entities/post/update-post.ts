import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { WP_REST_API_Post } from "wp-types";
import { z } from "zod";
import { fetchWpApi } from "../../lib/api-client";

// Define input schema
export const updatePostSchema = z.object({
	id: z.number().int().positive().describe("文章ID"),
	title: z.string().optional().describe("文章标题"),
	content: z.string().optional().describe("文章内容"),
	status: z
		.enum(["publish", "draft", "pending", "private"])
		.optional()
		.describe("文章状态"),
});

// Create tool handler function
export const updatePostHandler = async ({
	id,
	title,
	content,
	status,
}: z.infer<typeof updatePostSchema>) => {
	try {
		// Validate that at least one field is provided
		if (title === undefined && content === undefined && status === undefined) {
			return {
				content: [
					{
						type: "text" as const,
						text: "更新文章失败: 至少需要提供 title, content 或 status 中的一个",
					},
				],
				isError: true,
			};
		}

		// Create update payload with only the fields that are provided
		const updateData: Record<string, unknown> = {};
		if (title !== undefined) updateData.title = title;
		if (content !== undefined) updateData.content = content;
		if (status !== undefined) updateData.status = status;

		const response = await fetchWpApi<WP_REST_API_Post>(`/wp/v2/posts/${id}`, {
			method: "PUT",
			body: JSON.stringify(updateData),
			needsAuth: true,
		});

		return {
			content: [
				{
					type: "text" as const,
					text: `文章更新成功！ID: ${response.id}, 标题: ${response.title.rendered}`,
				},
			],
		};
	} catch (error) {
		return {
			content: [
				{
					type: "text" as const,
					text: `更新文章失败: ${error instanceof Error ? error.message : String(error)}`,
				},
			],
			isError: true,
		};
	}
};

// Register tool with MCP server
export function registerUpdatePostTool(server: McpServer) {
	server.tool(
		"update-post",
		{
			id: updatePostSchema.shape.id,
			title: updatePostSchema.shape.title,
			content: updatePostSchema.shape.content,
			status: updatePostSchema.shape.status,
		},
		updatePostHandler,
	);

	return server;
}
