import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { WP_REST_API_Post } from "wp-types";
import { z } from "zod";
import { fetchWpApi } from "../../lib/api-client";

// 定义输入参数模式
export const createPostSchema = z.object({
	title: z.string().min(1, "标题不能为空").describe("文章标题"),
	content: z.string().min(1, "内容不能为空").describe("文章内容"),
	status: z
		.enum(["publish", "draft", "pending", "private"])
		.optional()
		.default("publish")
		.describe("文章状态"),
});

// 创建工具处理函数
export const createPostHandler = async ({
	title,
	content,
	status,
}: z.infer<typeof createPostSchema>) => {
	try {
		const response = await fetchWpApi<WP_REST_API_Post>("/wp/v2/posts", {
			method: "POST",
			body: JSON.stringify({ title, content, status }),
			needsAuth: true,
		});

		return {
			content: [
				{
					type: "text" as const,
					text: `文章创建成功！ID: ${response.id}, 标题: ${response.title.rendered}`,
				},
			],
		};
	} catch (error) {
		return {
			content: [
				{
					type: "text" as const,
					text: `创建文章失败: ${error instanceof Error ? error.message : String(error)}`,
				},
			],
			isError: true,
		};
	}
};

// 注册工具到MCP服务器的辅助函数
export function registerCreatePostTool(server: McpServer) {
	server.tool(
		"create-post",
		{
			title: createPostSchema.shape.title,
			content: createPostSchema.shape.content,
			status: createPostSchema.shape.status,
		},
		createPostHandler,
	);

	return server;
}
