import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { fetchWpApi } from "../../lib/api-client";
import {
	formatErrorResponse,
	formatSettingsResponse,
	getSettingsSchema,
} from "./utils";

// Define input schema (reusing from utils)
export const getSettingsInputSchema = getSettingsSchema;

// Create tool handler function
export const getSettingsHandler = async () => {
	try {
		// Fetch settings from WordPress
		const settings = await fetchWpApi<any>("/wp/v2/settings", {
			method: "GET",
			needsAuth: true,
		});

		// Format the response
		return formatSettingsResponse(settings);
	} catch (error) {
		return formatErrorResponse("获取", error);
	}
};

// Register tool with MCP server
export function registerGetSettingsTool(server: McpServer) {
	server.tool("get-settings", {}, getSettingsHandler);

	return server;
}
