import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerActivateThemeTool } from "./activate-theme.js";
import { registerDeleteThemeTool } from "./delete-theme.js";
import { registerGetThemeTool } from "./get-theme.js";
import { registerInstallThemeTool } from "./install-theme.js";
import { registerListThemesTool } from "./list-themes.js";

// Collection of all theme tool registrators
const themeToolRegistrators = {
	listThemes: registerListThemesTool,
	getTheme: registerGetThemeTool,
	activateTheme: registerActivateThemeTool,
	installTheme: registerInstallThemeTool,
	deleteTheme: registerDeleteThemeTool,
};

// Register all theme-related tools
export function registerThemeTools(server: McpServer): McpServer {
	// Apply all registrators to the server
	for (const registrator of Object.values(themeToolRegistrators)) {
		registrator(server);
	}
	return server;
}

// Register specific theme tools
export function registerSpecificThemeTools(
	server: McpServer,
	toolNames: Array<keyof typeof themeToolRegistrators>,
): McpServer {
	for (const name of toolNames) {
		const registrator = themeToolRegistrators[name];
		registrator(server);
	}
	return server;
}

// Export all tools for individual use
export * from "./list-themes.js";
export * from "./get-theme.js";
export * from "./activate-theme.js";
export * from "./install-theme.js";
export * from "./delete-theme.js";

// Export tool registrators collection
export { themeToolRegistrators };
