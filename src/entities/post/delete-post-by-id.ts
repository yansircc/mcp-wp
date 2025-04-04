import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { fetchWpApi } from "../../lib/api-client";

// Define input schema
export const deletePostByIdSchema = z.object({
	id: z.number().int().positive().describe("文章ID"),
	force: z
		.boolean()
		.optional()
		.default(false)
		.describe("是否强制删除（跳过回收站）"),
});

// Create tool handler function
export const deletePostByIdHandler = async ({
	id,
	force,
}: z.infer<typeof deletePostByIdSchema>) => {
	try {
		const response = await fetchWpApi(`/wp/v2/posts/${id}`, {
			method: "DELETE",
			params: { force: force ? "true" : "false" },
			needsAuth: true,
		});

		return {
			content: [
				{
					type: "text" as const,
					text: `文章删除成功！ID: ${id}`,
				},
			],
		};
	} catch (error) {
		return {
			content: [
				{
					type: "text" as const,
					text: `删除文章失败: ${error instanceof Error ? error.message : String(error)}`,
				},
			],
			isError: true,
		};
	}
};

// Register tool with MCP server
export function registerDeletePostByIdTool(server: McpServer) {
	server.tool(
		"delete-post-by-id",
		{
			id: deletePostByIdSchema.shape.id,
			force: deletePostByIdSchema.shape.force,
		},
		deletePostByIdHandler,
	);

	return server;
}
