import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { z } from "zod";
import { fetchWpApi } from "../../lib/api-client.js";
import {
	formatErrorResponse,
	formatUserResponse,
	userIdSchema,
	userUpdateSchema,
} from "./utils.js";

// Input schema for the update user tool - combines ID and update data
export const updateUserInputSchema = userIdSchema.extend({
	...userUpdateSchema.shape,
});

// Handler for updating a user
export const updateUserHandler = async (
	input: z.infer<typeof updateUserInputSchema>,
) => {
	try {
		// Extract ID and prepare update data
		const { id, ...userData } = input;

		// Filter out undefined values from the update data
		const requestBody = Object.fromEntries(
			Object.entries(userData).filter(([_, value]) => value !== undefined),
		);

		// Make sure we have data to update
		if (Object.keys(requestBody).length === 0) {
			throw new Error("No update data provided");
		}

		// Make API request to update user
		const user = await fetchWpApi(`/wp/v2/users/${id}`, {
			method: "PUT",
			body: JSON.stringify(requestBody),
			needsAuth: true,
		});

		// Format and return the response
		return formatUserResponse(user);
	} catch (error) {
		return formatErrorResponse("更新", error);
	}
};

// Register the update user tool
export function registerUpdateUserTool(server: McpServer) {
	server.tool(
		"mcp_wordpress_update_user",
		{
			id: updateUserInputSchema.shape.id,
			username: updateUserInputSchema.shape.username,
			email: updateUserInputSchema.shape.email,
			password: updateUserInputSchema.shape.password,
			name: updateUserInputSchema.shape.name,
			first_name: updateUserInputSchema.shape.first_name,
			last_name: updateUserInputSchema.shape.last_name,
			description: updateUserInputSchema.shape.description,
			locale: updateUserInputSchema.shape.locale,
			roles: updateUserInputSchema.shape.roles,
			url: updateUserInputSchema.shape.url,
			meta: updateUserInputSchema.shape.meta,
		},
		updateUserHandler,
	);

	return server;
}
