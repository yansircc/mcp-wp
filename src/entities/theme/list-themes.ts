import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { z } from "zod";
import { fetchWpApi } from "../../lib/api-client.js";
import {
	formatErrorResponse,
	formatThemeListResponse,
	themeStatusSchema,
} from "./utils.js";

// Define input schema
export const listThemesSchema = themeStatusSchema;

// Create tool handler function
export const listThemesHandler = async ({
	status = "all",
}: z.infer<typeof listThemesSchema>) => {
	try {
		// Fetch themes from WordPress
		const themes = await fetchWpApi<any[]>("/wp/v2/themes", {
			method: "GET",
			needsAuth: true,
		});

		// Filter themes by status if needed
		let filteredThemes = themes;
		if (status !== "all") {
			filteredThemes = themes.filter((theme) => theme.status === status);
		}

		// Format the response
		return formatThemeListResponse(filteredThemes);
	} catch (error) {
		return formatErrorResponse("列表获取", error);
	}
};

// Register tool with MCP server
export function registerListThemesTool(server: McpServer) {
	server.tool(
		"list-themes",
		{
			status: listThemesSchema.shape.status,
		},
		listThemesHandler,
	);

	return server;
}
