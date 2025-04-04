import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { fetchWpApi } from "../../lib/api-client.js";
import { formatErrorResponse, taxonomyTypeSchema } from "./utils.js";

// Define input schema
export const bulkDeleteTermsSchema = taxonomyTypeSchema.extend({
	ids: z
		.array(z.number().int().positive())
		.min(1, "至少需要一个ID")
		.describe("ID列表，至少填入一个ID"),
	force: z
		.boolean()
		.optional()
		.default(false)
		.describe("是否强制删除（跳过回收站）"),
});

// Create tool handler function
export const bulkDeleteTermsHandler = async ({
	type,
	endpoint,
	ids,
	force,
}: z.infer<typeof bulkDeleteTermsSchema>) => {
	try {
		const results = [];
		const failedIds = [];

		// Delete terms sequentially to ensure proper error handling
		for (const id of ids) {
			try {
				await fetchWpApi(`${endpoint}/${id}`, {
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
						text: `批量删除${type}项成功！共删除 ${successCount} 个${type}项`,
					},
				],
			};
		}

		if (successCount === 0) {
			return {
				content: [
					{
						type: "text" as const,
						text: `批量删除${type}项失败！所有操作都遇到了错误。`,
					},
					{
						type: "text" as const,
						text: `失败的ID: ${failedIds.join(", ")}`,
					},
				],
				isError: true,
			};
		}

		// Partial success
		return {
			content: [
				{
					type: "text" as const,
					text: `批量删除部分成功。成功: ${successCount}/${ids.length}`,
				},
				{
					type: "text" as const,
					text: `失败的ID: ${failedIds.join(", ")}`,
				},
			],
			isError: false,
		};
	} catch (error) {
		return formatErrorResponse("批量删除", type, error);
	}
};

// Register tool with MCP server
export function registerBulkDeleteTermsTool(server: McpServer) {
	server.tool(
		"bulk-delete-terms",
		{
			type: bulkDeleteTermsSchema.shape.type,
			endpoint: bulkDeleteTermsSchema.shape.endpoint,
			ids: bulkDeleteTermsSchema.shape.ids,
			force: bulkDeleteTermsSchema.shape.force,
		},
		bulkDeleteTermsHandler,
	);

	return server;
}
