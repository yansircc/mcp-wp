import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerActivateThemeTool } from "./activate-theme";
import { registerDeleteThemeTool } from "./delete-theme";
import { registerGetThemeTool } from "./get-theme";
import { registerInstallThemeTool } from "./install-theme";
import { registerListThemesTool } from "./list-themes";

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
export * from "./list-themes";
export * from "./get-theme";
export * from "./activate-theme";
export * from "./install-theme";
export * from "./delete-theme";

// Export tool registrators collection
export { themeToolRegistrators };
