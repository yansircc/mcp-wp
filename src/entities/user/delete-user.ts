import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { fetchWpApi } from "../../lib/api-client.js";
import { formatErrorResponse, userIdSchema } from "./utils.js";

// Input schema for the delete user tool - ID and optional force delete and reassign
export const deleteUserInputSchema = userIdSchema.extend({
	force: z.boolean().optional().default(false).describe("是否强制删除"),
	reassign: z.number().int().positive().optional().describe("重新分配给用户ID"),
});

// Handler for deleting a user
export const deleteUserHandler = async (
	input: z.infer<typeof deleteUserInputSchema>,
) => {
	try {
		// Prepare params for API request
		const params: Record<string, string | number> = {};
		if (input.force) params.force = "true";
		if (input.reassign) params.reassign = input.reassign;

		// Make API request to delete user
		const result = await fetchWpApi<any>(`/wp/v2/users/${input.id}`, {
			method: "DELETE",
			needsAuth: true,
			params,
		});

		// Return success response
		return {
			content: [
				{
					type: "text" as const,
					text: `用户删除成功: ID ${input.id}${result.previous ? ` (用户名: ${result.previous.username})` : ""}`,
				},
			],
		};
	} catch (error) {
		return formatErrorResponse("删除", error);
	}
};

// Register the delete user tool
export function registerDeleteUserTool(server: McpServer) {
	server.tool(
		"mcp_wordpress_delete_user",
		{
			id: deleteUserInputSchema.shape.id,
			force: deleteUserInputSchema.shape.force,
			reassign: deleteUserInputSchema.shape.reassign,
		},
		deleteUserHandler,
	);

	return server;
}
