import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerGetSettingsTool } from "./get-settings.js";
import { registerUpdateSettingsTool } from "./update-settings.js";

// Collection of all settings tool registrators
const settingsToolRegistrators = {
	getSettings: registerGetSettingsTool,
	updateSettings: registerUpdateSettingsTool,
};

// Register all settings-related tools
export function registerSettingsTools(server: McpServer): McpServer {
	// Apply all registrators to the server
	for (const registrator of Object.values(settingsToolRegistrators)) {
		registrator(server);
	}
	return server;
}

// Register specific settings tools
export function registerSpecificSettingsTools(
	server: McpServer,
	toolNames: Array<keyof typeof settingsToolRegistrators>,
): McpServer {
	for (const name of toolNames) {
		const registrator = settingsToolRegistrators[name];
		registrator(server);
	}
	return server;
}

// Export all tools for individual use
export * from "./get-settings.js";
export * from "./update-settings.js";

// Export tool registrators collection
export { settingsToolRegistrators };
