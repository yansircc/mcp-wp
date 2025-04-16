import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { fetchWpApi } from '../../lib/api-client.js';
import { MediaItem } from './types.js';
import { formatErrorResponse } from '../content/utils.js';

// Define input schema
export const deleteMediaSchema = z.object({
  id: z.number().int().positive().describe('媒体文件ID'),
  force: z.boolean().optional().default(false).describe('是否强制删除'),
});

// Create tool handler function
export const deleteMediaHandler = async (
  params: z.infer<typeof deleteMediaSchema>
) => {
  try {
    // Call WordPress API
    const item = await fetchWpApi<MediaItem>(`/wp/v2/media/${params.id}`, {
      method: 'DELETE',
      params: {
        force: params.force ? '1' : '0',
      },
      needsAuth: true,
    });

    // Format response
    return {
      content: [
        {
          type: 'text' as const,
          text: '媒体文件删除成功：',
        },
        {
          type: 'text' as const,
          text: `ID: ${item.id}`,
        },
        {
          type: 'text' as const,
          text: `标题: ${item.title.rendered}`,
        },
      ],
    };
  } catch (error) {
    return formatErrorResponse('删除', '媒体文件', error);
  }
};

// Register tool with MCP server
export function registerDeleteMediaTool(server: McpServer) {
  server.tool(
    'mcp_remote_wp_delete_media',
    {
      id: deleteMediaSchema.shape.id,
      force: deleteMediaSchema.shape.force,
    },
    deleteMediaHandler
  );

  return server;
}
