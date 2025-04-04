import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { z } from "zod";
import { fetchWpApi } from "../../lib/api-client";
import {
	contentDeleteSchema,
	contentIdSchema,
	contentTypeSchema,
	formatErrorResponse,
} from "./utils";

// Define input schema
export const deleteContentByIdSchema = contentTypeSchema
	.merge(contentIdSchema)
	.merge(contentDeleteSchema);

// Create tool handler function
export const deleteContentByIdHandler = async ({
	type,
	endpoint,
	id,
	force,
}: z.infer<typeof deleteContentByIdSchema>) => {
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
					text: `${type}删除成功！ID: ${id}`,
				},
			],
		};
	} catch (error) {
		return formatErrorResponse("删除", type, error);
	}
};

// Register tool with MCP server
export function registerDeleteContentByIdTool(server: McpServer) {
	server.tool(
		"delete-content-by-id",
		{
			type: deleteContentByIdSchema.shape.type,
			endpoint: deleteContentByIdSchema.shape.endpoint,
			id: deleteContentByIdSchema.shape.id,
			force: deleteContentByIdSchema.shape.force,
		},
		deleteContentByIdHandler,
	);

	return server;
}
