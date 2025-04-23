import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerActivatePluginTool } from './activate-plugin.js';
import { registerDeactivatePluginTool } from './deactivate-plugin.js';
import { registerDeletePluginTool } from './delete-plugin.js';
import { registerGetPluginTool } from './get-plugin.js';
import { registerInstallPluginTool } from './install-plugin.js';
import { registerListPluginsTool } from './list-plugins.js';

// Collection of all plugin tool registrators
const pluginToolRegistrators = {
  listPlugins: registerListPluginsTool,
  getPlugin: registerGetPluginTool,
  activatePlugin: registerActivatePluginTool,
  deactivatePlugin: registerDeactivatePluginTool,
  installPlugin: registerInstallPluginTool,
  deletePlugin: registerDeletePluginTool,
};

// Register all plugin-related tools
export function registerPluginTools(server: McpServer): McpServer {
  // Apply all registrators to the server
  for (const registrator of Object.values(pluginToolRegistrators)) {
    registrator(server);
  }
  return server;
}

// Register specific plugin tools
export function registerSpecificPluginTools(
  server: McpServer,
  toolNames: Array<keyof typeof pluginToolRegistrators>
): McpServer {
  for (const name of toolNames) {
    const registrator = pluginToolRegistrators[name];
    registrator(server);
  }
  return server;
}

// Export all tools for individual use
export * from './list-plugins.js';
export * from './get-plugin.js';
export * from './activate-plugin.js';
export * from './deactivate-plugin.js';
export * from './install-plugin.js';
export * from './delete-plugin.js';

// Export tool registrators collection
export { pluginToolRegistrators };
