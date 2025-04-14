import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { z } from 'zod';
import { fetchWpApi } from '../../lib/api-client.js';
import { formatErrorResponse, pluginActionSchema } from './utils.js';

// Define input schema
export const deactivatePluginSchema = pluginActionSchema;

// Create tool handler function
export const deactivatePluginHandler = async ({
  plugin,
}: z.infer<typeof deactivatePluginSchema>) => {
  try {
    // Deactivate plugin in WordPress
    await fetchWpApi(`/wp/v2/plugins/${encodeURIComponent(plugin)}`, {
      method: 'POST',
      needsAuth: true,
      body: JSON.stringify({ status: 'inactive' }),
    });

    // Return success response
    return {
      content: [
        {
          type: 'text' as const,
          text: `插件 "${plugin}" 已成功停用`,
        },
      ],
    };
  } catch (error) {
    return formatErrorResponse('停用', error);
  }
};

// Register tool with MCP server
export function registerDeactivatePluginTool(server: McpServer) {
  server.tool(
    'deactivate-plugin',
    {
      plugin: deactivatePluginSchema.shape.plugin,
    },
    deactivatePluginHandler
  );

  return server;
}
