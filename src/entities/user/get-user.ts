import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { z } from "zod";
import { fetchWpApi } from "../../lib/api-client";
import { formatErrorResponse, formatUserResponse, userIdSchema } from "./utils";

// Input schema for the get user tool
export const getUserInputSchema = userIdSchema;

// Handler for getting a single user by ID
export const getUserHandler = async (
	input: z.infer<typeof getUserInputSchema>,
) => {
	try {
		// Make API request to get user by ID
		const user = await fetchWpApi(`/wp/v2/users/${input.id}`, {
			needsAuth: true,
		});

		// Format and return the response
		return formatUserResponse(user);
	} catch (error) {
		return formatErrorResponse("获取", error);
	}
};

// Register the get user tool
export function registerGetUserTool(server: McpServer) {
	server.tool(
		"mcp_wordpress_get_user",
		{
			id: getUserInputSchema.shape.id,
		},
		getUserHandler,
	);

	return server;
}
