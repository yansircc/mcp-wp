import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { z } from "zod";
import { fetchWpApi } from "../../lib/api-client.js";
import { formatErrorResponse, themeActivationSchema } from "./utils.js";

// Define input schema
export const activateThemeSchema = themeActivationSchema;

// Create tool handler function
export const activateThemeHandler = async ({
	stylesheet,
}: z.infer<typeof activateThemeSchema>) => {
	try {
		// Activate theme in WordPress
		const response = await fetchWpApi<any>(`/wp/v2/themes/${stylesheet}`, {
			method: "POST",
			body: JSON.stringify({ status: "active" }),
			needsAuth: true,
		});

		return {
			content: [
				{
					type: "text" as const,
					text: `成功激活主题: ${response.name} (${response.stylesheet})`,
				},
			],
		};
	} catch (error) {
		return formatErrorResponse("激活", error);
	}
};

// Register tool with MCP server
export function registerActivateThemeTool(server: McpServer) {
	server.tool(
		"activate-theme",
		{
			stylesheet: activateThemeSchema.shape.stylesheet,
		},
		activateThemeHandler,
	);

	return server;
}
