import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { z } from 'zod';
import { fetchWpApi } from '../../lib/api-client.js';
import {
  formatErrorResponse,
  formatPluginResponse,
  pluginActionSchema,
} from './utils.js';

// Define input schema
export const getPluginSchema = pluginActionSchema;

// Create tool handler function
export const getPluginHandler = async ({
  plugin,
}: z.infer<typeof getPluginSchema>) => {
  try {
    // Fetch plugin details from WordPress
    const pluginDetails = await fetchWpApi<any>(
      `/wp/v2/plugins/${encodeURIComponent(plugin)}`,
      {
        method: 'GET',
        needsAuth: true,
      }
    );

    // Format the response
    return formatPluginResponse(pluginDetails);
  } catch (error) {
    return formatErrorResponse('详情获取', error);
  }
};

// Register tool with MCP server
export function registerGetPluginTool(server: McpServer) {
  server.tool(
    'get-plugin',
    {
      plugin: getPluginSchema.shape.plugin,
    },
    getPluginHandler
  );

  return server;
}
