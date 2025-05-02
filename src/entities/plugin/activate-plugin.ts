import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { z } from 'zod';
import { fetchWpApi } from '../../lib/api-client.js';
import { formatErrorResponse, pluginActionSchema } from './utils.js';

// Define input schema
export const activatePluginSchema = pluginActionSchema;

// Create tool handler function
export const activatePluginHandler = async ({
  plugin,
}: z.infer<typeof activatePluginSchema>) => {
  try {
    // Activate plugin in WordPress
    await fetchWpApi(`/wp/v2/plugins/${encodeURIComponent(plugin)}`, {
      method: 'POST',
      needsAuth: true,
      body: JSON.stringify({ status: 'active' }),
    });

    // Return success response
    return {
      content: [
        {
          type: 'text' as const,
          text: `插件 "${plugin}" 已成功激活`,
        },
      ],
    };
  } catch (error) {
    return formatErrorResponse('激活', error);
  }
};

// Register tool with MCP server
export function registerActivatePluginTool(server: McpServer) {
  server.tool(
    'activate-plugin',
    {
      plugin: activatePluginSchema.shape.plugin,
    },
    activatePluginHandler
  );

  return server;
}
