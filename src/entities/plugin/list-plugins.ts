import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { z } from 'zod';
import { fetchWpApi } from '../../lib/api-client.js';
import {
  formatErrorResponse,
  formatPluginListResponse,
  pluginStatusSchema,
} from './utils.js';

// Define input schema
export const listPluginsSchema = pluginStatusSchema;

// Create tool handler function
export const listPluginsHandler = async ({
  status = 'all',
}: z.infer<typeof listPluginsSchema>) => {
  try {
    // Fetch plugins from WordPress
    const plugins = await fetchWpApi<any[]>('/wp/v2/plugins', {
      method: 'GET',
      needsAuth: true,
    });

    // Filter plugins by status if needed
    let filteredPlugins = plugins;
    if (status !== 'all') {
      filteredPlugins = plugins.filter(
        (plugin) =>
          (status === 'active' && plugin.status === 'active') ||
          (status === 'inactive' && plugin.status !== 'active')
      );
    }

    // Format the response
    return formatPluginListResponse(filteredPlugins);
  } catch (error) {
    return formatErrorResponse('列表获取', error);
  }
};

// Register tool with MCP server
export function registerListPluginsTool(server: McpServer) {
  server.tool(
    'list-plugins',
    {
      status: listPluginsSchema.shape.status,
    },
    listPluginsHandler
  );

  return server;
}
