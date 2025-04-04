import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { fetchWpApi } from "../../lib/api-client";

// Define input schema
export const bulkDeletePostsSchema = z.object({
	ids: z
		.array(z.number().int().positive())
		.min(1, "至少需要一个文章ID")
		.describe("文章ID列表"),
	force: z
		.boolean()
		.optional()
		.default(false)
		.describe("是否强制删除（跳过回收站）"),
});

// Create tool handler function
export const bulkDeletePostsHandler = async ({
	ids,
	force,
}: z.infer<typeof bulkDeletePostsSchema>) => {
	try {
		const results = [];
		const failedIds = [];

		// Delete posts sequentially to ensure proper error handling
		for (const id of ids) {
			try {
				const response = await fetchWpApi(`/wp/v2/posts/${id}`, {
					method: "DELETE",
					params: { force: force ? "true" : "false" },
					needsAuth: true,
				});
				results.push({ id, success: true });
			} catch (error) {
				failedIds.push(id);
				results.push({
					id,
					success: false,
					error: error instanceof Error ? error.message : String(error),
				});
			}
		}

		const successCount = results.filter((r) => r.success).length;

		if (failedIds.length === 0) {
			return {
				content: [
					{
						type: "text" as const,
						text: `批量删除文章成功！共删除 ${successCount} 篇文章`,
					},
				],
			};
		}

		return {
			content: [
				{
					type: "text" as const,
					text: `批量删除部分成功。成功: ${successCount}/${ids.length}`,
				},
				{
					type: "text" as const,
					text: `失败的文章ID: ${failedIds.join(", ")}`,
				},
			],
			isError: failedIds.length === ids.length, // Only mark as error if all failed
		};
	} catch (error) {
		return {
			content: [
				{
					type: "text" as const,
					text: `批量删除文章失败: ${error instanceof Error ? error.message : String(error)}`,
				},
			],
			isError: true,
		};
	}
};

// Register tool with MCP server
export function registerBulkDeletePostsTool(server: McpServer) {
	server.tool(
		"bulk-delete-posts",
		{
			ids: bulkDeletePostsSchema.shape.ids,
			force: bulkDeletePostsSchema.shape.force,
		},
		bulkDeletePostsHandler,
	);

	return server;
}
