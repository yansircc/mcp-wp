import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { fetchWpApi } from "../../lib/api-client.js";
import { formatErrorResponse, taxonomyTypeSchema, termIdSchema } from "./utils.js";

// Define input schema
export const deleteTermSchema = taxonomyTypeSchema.merge(termIdSchema).extend({
	force: z
		.boolean()
		.optional()
		.default(false)
		.describe("是否强制删除（跳过回收站）"),
});

// Create tool handler function
export const deleteTermHandler = async ({
	type,
	endpoint,
	id,
	force,
}: z.infer<typeof deleteTermSchema>) => {
	try {
		await fetchWpApi(`${endpoint}/${id}`, {
			method: "DELETE",
			params: { force: force ? "true" : "false" },
			needsAuth: true,
		});

		return {
			content: [
				{
					type: "text" as const,
					text: `${type}项删除成功！ID: ${id}`,
				},
			],
		};
	} catch (error) {
		return formatErrorResponse("删除", type, error);
	}
};

// Register tool with MCP server
export function registerDeleteTermTool(server: McpServer) {
	server.tool(
		"delete-term",
		{
			type: deleteTermSchema.shape.type,
			endpoint: deleteTermSchema.shape.endpoint,
			id: deleteTermSchema.shape.id,
			force: deleteTermSchema.shape.force,
		},
		deleteTermHandler,
	);

	return server;
}
