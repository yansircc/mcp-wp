import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { z } from "zod";
import { fetchWpApi } from "../../lib/api-client";
import { formatErrorResponse, themeInstallSchema } from "./utils";

// Define input schema
export const installThemeSchema = themeInstallSchema;

// Create tool handler function
export const installThemeHandler = async ({
	slug,
}: z.infer<typeof installThemeSchema>) => {
	try {
		// Install theme from WordPress.org repository
		const response = await fetchWpApi<any>("/wp/v2/themes", {
			method: "POST",
			body: JSON.stringify({ slug }),
			needsAuth: true,
		});

		return {
			content: [
				{
					type: "text" as const,
					text: `主题安装成功: ${response.name} (${response.stylesheet})
版本: ${response.version || "未知"}
作者: ${response.author || "未知"}`,
				},
			],
		};
	} catch (error) {
		return formatErrorResponse("安装", error);
	}
};

// Register tool with MCP server
export function registerInstallThemeTool(server: McpServer) {
	server.tool(
		"install-theme",
		{
			slug: installThemeSchema.shape.slug,
		},
		installThemeHandler,
	);

	return server;
}
