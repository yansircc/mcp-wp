import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { z } from 'zod';
import { fetchWpApi } from '../../lib/api-client.js';
import { formatErrorResponse, pluginInstallSchema } from './utils.js';

// Define input schema
export const installPluginSchema = pluginInstallSchema;

// Plugin response type
interface PluginResponse {
  name: string;
  plugin: string;
  status: string;
  version: string;
  author?: string;
  description?: string;
}

// Create tool handler function
export const installPluginHandler = async ({
  slug,
}: z.infer<typeof installPluginSchema>) => {
  try {
    // Install plugin from WordPress.org
    const response = await fetchWpApi<PluginResponse>(`/wp/v2/plugins`, {
      method: 'POST',
      needsAuth: true,
      body: JSON.stringify({ slug }),
    });

    // Return success response
    return {
      content: [
        {
          type: 'text' as const,
          text: `插件 "${response.name}" (${response.plugin}) 已成功安装`,
        },
      ],
    };
  } catch (error) {
    return formatErrorResponse('安装', error);
  }
};

// Register tool with MCP server
export function registerInstallPluginTool(server: McpServer) {
  server.tool(
    'install-plugin',
    {
      slug: installPluginSchema.shape.slug,
    },
    installPluginHandler
  );

  return server;
}
