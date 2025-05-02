import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { z } from 'zod';
import { fetchWpApi } from '../../lib/api-client.js';
import { formatErrorResponse, pluginDeleteSchema } from './utils.js';

// Define input schema
export const deletePluginSchema = pluginDeleteSchema;

// Create tool handler function
export const deletePluginHandler = async ({
  plugin,
}: z.infer<typeof deletePluginSchema>) => {
  try {
    // Delete plugin from WordPress
    await fetchWpApi(`/wp/v2/plugins/${encodeURIComponent(plugin)}`, {
      method: 'DELETE',
      needsAuth: true,
    });

    // Return success response
    return {
      content: [
        {
          type: 'text' as const,
          text: `插件 "${plugin}" 已成功删除`,
        },
      ],
    };
  } catch (error) {
    return formatErrorResponse('删除', error);
  }
};

// Register tool with MCP server
export function registerDeletePluginTool(server: McpServer) {
  server.tool(
    'delete-plugin',
    {
      plugin: deletePluginSchema.shape.plugin,
    },
    deletePluginHandler
  );

  return server;
}
