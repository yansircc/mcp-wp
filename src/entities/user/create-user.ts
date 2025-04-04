import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { z } from "zod";
import { fetchWpApi } from "../../lib/api-client.js";
import {
	formatErrorResponse,
	formatUserResponse,
	userDataSchema,
} from "./utils.js";

// Input schema for the create user tool
export const createUserInputSchema = userDataSchema;

// Handler for creating a user
export const createUserHandler = async (
	input: z.infer<typeof createUserInputSchema>,
) => {
	try {
		// Prepare request body (filter out undefined values)
		const requestBody = Object.fromEntries(
			Object.entries({
				username: input.username,
				email: input.email,
				password: input.password,
				name: input.name,
				first_name: input.first_name,
				last_name: input.last_name,
				description: input.description,
				locale: input.locale,
				roles: input.roles,
				url: input.url,
				meta: input.meta,
			}).filter(([_, value]) => value !== undefined),
		);

		// Make API request to create user
		const user = await fetchWpApi("/wp/v2/users", {
			method: "POST",
			body: JSON.stringify(requestBody),
			needsAuth: true,
		});

		// Format and return the response
		return formatUserResponse(user);
	} catch (error) {
		return formatErrorResponse("创建", error);
	}
};

// Register the create user tool
export function registerCreateUserTool(server: McpServer) {
	server.tool(
		"mcp_wordpress_create_user",
		{
			username: createUserInputSchema.shape.username,
			email: createUserInputSchema.shape.email,
			password: createUserInputSchema.shape.password,
			name: createUserInputSchema.shape.name,
			first_name: createUserInputSchema.shape.first_name,
			last_name: createUserInputSchema.shape.last_name,
			description: createUserInputSchema.shape.description,
			locale: createUserInputSchema.shape.locale,
			roles: createUserInputSchema.shape.roles,
			url: createUserInputSchema.shape.url,
			meta: createUserInputSchema.shape.meta,
		},
		createUserHandler,
	);

	return server;
}
