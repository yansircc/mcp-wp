import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { fetchWpApi } from '../../lib/api-client.js';
import { MediaItem } from './types.js';
import { formatErrorResponse } from '../content/utils.js';

// Define input schema
export const getMediaByIdSchema = z.object({
  id: z.number().int().positive().describe('ID'),
});

// Create tool handler function
export const getMediaByIdHandler = async (
  params: z.infer<typeof getMediaByIdSchema>
) => {
  try {
    // Call WordPress API
    const item = await fetchWpApi<MediaItem>(`/wp/v2/media/${params.id}`, {
      method: 'GET',
      needsAuth: true,
    });

    // Format response
    return {
      content: [
        {
          type: 'text' as const,
          text: '媒体文件信息：',
        },
        {
          type: 'text' as const,
          text: `ID: ${item.id}`,
        },
        {
          type: 'text' as const,
          text: `标题: ${item.title.rendered}`,
        },
        {
          type: 'text' as const,
          text: `类型: ${item.media_type}`,
        },
        {
          type: 'text' as const,
          text: `MIME类型: ${item.mime_type}`,
        },
        {
          type: 'text' as const,
          text: `URL: ${item.source_url}`,
        },
        {
          type: 'text' as const,
          text: `上传时间: ${item.date}`,
        },
        {
          type: 'text' as const,
          text: `描述: ${item.description.rendered}`,
        },
        {
          type: 'text' as const,
          text: `说明文字: ${item.alt_text}`,
        },
      ],
    };
  } catch (error) {
    return formatErrorResponse('获取', '媒体文件', error);
  }
};

// Register tool with MCP server
export function registerGetMediaByIdTool(server: McpServer) {
  server.tool(
    'mcp_remote_wp_get_media',
    {
      id: getMediaByIdSchema.shape.id,
    },
    getMediaByIdHandler
  );

  return server;
}
