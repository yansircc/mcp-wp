import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { z } from "zod";
import { fetchWpApi } from "../../lib/api-client.js";
import { formatErrorResponse, themeStylesheetSchema } from "./utils.js";

// Define input schema
export const deleteThemeSchema = themeStylesheetSchema;

// Create tool handler function
export const deleteThemeHandler = async ({
	stylesheet,
}: z.infer<typeof deleteThemeSchema>) => {
	try {
		// First, get theme info to display name after deletion
		let themeName: string;
		try {
			const themeInfo = await fetchWpApi<any>(`/wp/v2/themes/${stylesheet}`, {
				method: "GET",
				needsAuth: true,
			});
			themeName = themeInfo.name;
		} catch (error) {
			// If we can't get the name, just use the stylesheet
			themeName = stylesheet;
		}

		// Delete the theme
		await fetchWpApi<any>(`/wp/v2/themes/${stylesheet}`, {
			method: "DELETE",
			needsAuth: true,
		});

		return {
			content: [
				{
					type: "text" as const,
					text: `主题 "${themeName}" 已成功删除`,
				},
			],
		};
	} catch (error) {
		return formatErrorResponse("删除", error);
	}
};

// Register tool with MCP server
export function registerDeleteThemeTool(server: McpServer) {
	server.tool(
		"delete-theme",
		{
			stylesheet: deleteThemeSchema.shape.stylesheet,
		},
		deleteThemeHandler,
	);

	return server;
}
