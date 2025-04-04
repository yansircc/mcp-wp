import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { z } from "zod";
import { fetchWpApi } from "../../lib/api-client.js";
import {
	formatErrorResponse,
	formatThemeResponse,
	themeStylesheetSchema,
} from "./utils.js";

// Define input schema
export const getThemeSchema = themeStylesheetSchema;

// Create tool handler function
export const getThemeHandler = async ({
	stylesheet,
}: z.infer<typeof getThemeSchema>) => {
	try {
		// Fetch theme details from WordPress
		const theme = await fetchWpApi<any>(`/wp/v2/themes/${stylesheet}`, {
			method: "GET",
			needsAuth: true,
		});

		// Format the response
		return formatThemeResponse(theme);
	} catch (error) {
		return formatErrorResponse("详情获取", error);
	}
};

// Register tool with MCP server
export function registerGetThemeTool(server: McpServer) {
	server.tool(
		"get-theme",
		{
			stylesheet: getThemeSchema.shape.stylesheet,
		},
		getThemeHandler,
	);

	return server;
}
