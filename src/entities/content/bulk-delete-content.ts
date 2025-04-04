import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { fetchWpApi } from "../../lib/api-client";
import {
	contentDeleteSchema,
	contentTypeSchema,
	formatErrorResponse,
} from "./utils";

// Define input schema
export const bulkDeleteContentSchema = contentTypeSchema.extend({
	ids: z
		.array(z.number().int().positive())
		.min(1, "至少需要一个ID")
		.describe("ID列表，至少填入一个ID"),
	...contentDeleteSchema.shape,
});

// Create tool handler function
export const bulkDeleteContentHandler = async ({
	type,
	endpoint,
	ids,
	force,
}: z.infer<typeof bulkDeleteContentSchema>) => {
	try {
		const results = [];
		const failedIds = [];

		// Delete items sequentially to ensure proper error handling
		for (const id of ids) {
			try {
				const response = await fetchWpApi(`${endpoint}/${id}`, {
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
						text: `批量删除${type}成功！共删除 ${successCount} 个${type}`,
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
					text: `失败的ID: ${failedIds.join(", ")}`,
				},
			],
			isError: failedIds.length === ids.length, // Only mark as error if all failed
		};
	} catch (error) {
		return formatErrorResponse("批量删除", type, error);
	}
};

// Register tool with MCP server
export function registerBulkDeleteContentTool(server: McpServer) {
	server.tool(
		"bulk-delete-content",
		{
			type: bulkDeleteContentSchema.shape.type,
			endpoint: bulkDeleteContentSchema.shape.endpoint,
			ids: bulkDeleteContentSchema.shape.ids,
			force: bulkDeleteContentSchema.shape.force,
		},
		bulkDeleteContentHandler,
	);

	return server;
}
