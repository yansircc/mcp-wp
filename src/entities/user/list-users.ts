import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { z } from "zod";
import { env } from "../../env";
import { fetchWpApi } from "../../lib/api-client";
import {
	formatErrorResponse,
	formatUserListResponse,
	userListQuerySchema,
} from "./utils";

// Input schema for the list users tool
export const listUsersInputSchema = userListQuerySchema;

// Handler for listing users
export const listUsersHandler = async (
	input: z.infer<typeof listUsersInputSchema>,
) => {
	try {
		// Create params for API request
		const params: Record<string, string | number | string[]> = {};

		// Add pagination parameters
		if (input.page) params.page = input.page;
		if (input.per_page) params.per_page = input.per_page;

		// Add filtering and sorting parameters
		if (input.search) params.search = input.search;
		if (input.order) params.order = input.order;
		if (input.orderby) params.orderby = input.orderby;

		// Add roles filtering
		if (input.roles) params.roles = input.roles;

		// Make API request
		const users = await fetchWpApi<any[]>("/wp/v2/users", {
			needsAuth: true,
			params,
		});

		// Since we can't directly access headers from fetchWpApi,
		// make a separate fetch to get the headers for total count
		const url = new URL(`${env.WORDPRESS_API_URL}/wp-json/wp/v2/users`);
		if (params) {
			for (const [key, value] of Object.entries(params)) {
				if (Array.isArray(value)) {
					url.searchParams.append(key, value.join(","));
				} else if (value !== undefined && value !== null) {
					url.searchParams.set(key, String(value));
				}
			}
		}

		// Make a HEAD request to get headers without fetching the full response body
		const headResponse = await fetch(url.toString(), {
			method: "HEAD",
			headers: {
				Authorization: `Basic ${btoa(`${env.WORDPRESS_USERNAME}:${env.WORDPRESS_APPLICATION_PASSWORD}`)}`,
			},
		});

		// Get total count from headers
		const totalItems = Number.parseInt(
			headResponse.headers.get("X-WP-Total") || "0",
			10,
		);

		// Format and return the response
		return formatUserListResponse(
			users,
			totalItems,
			input.page || 1,
			input.per_page || 10,
		);
	} catch (error) {
		return formatErrorResponse("列表获取", error);
	}
};

// Register the list users tool
export function registerListUsersTool(server: McpServer) {
	server.tool(
		"mcp_wordpress_list_users",
		{
			page: listUsersInputSchema.shape.page,
			per_page: listUsersInputSchema.shape.per_page,
			search: listUsersInputSchema.shape.search,
			order: listUsersInputSchema.shape.order,
			orderby: listUsersInputSchema.shape.orderby,
			roles: listUsersInputSchema.shape.roles,
		},
		listUsersHandler,
	);

	return server;
}
