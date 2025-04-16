import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { fetchWpApi } from '../../lib/api-client.js';
import { MediaItem } from './types.js';
import { formatErrorResponse } from '../content/utils.js';

// Define input schema
export const editMediaMetadataSchema = z.object({
  id: z.number().int().positive().describe('媒体文件ID'),
  alt_text: z.string().optional().describe('说明文字'),
  caption: z.string().optional().describe('标题'),
  description: z.string().optional().describe('描述'),
  title: z.string().optional().describe('标题'),
});

// Create tool handler function
export const editMediaMetadataHandler = async (
  params: z.infer<typeof editMediaMetadataSchema>
) => {
  try {
    const { id, ...metadata } = params;

    // Ensure we have at least one field to update
    if (Object.keys(metadata).length === 0) {
      return {
        content: [
          {
            type: 'text' as const,
            text: '更新媒体文件元数据失败: 请提供至少一个需要更新的字段',
          },
        ],
        isError: true,
      };
    }

    // Call WordPress API
    const item = await fetchWpApi<MediaItem>(`/wp/v2/media/${id}`, {
      method: 'POST',
      body: JSON.stringify(metadata),
      needsAuth: true,
    });

    // Format response
    return {
      content: [
        {
          type: 'text' as const,
          text: '媒体文件元数据更新成功：',
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
          text: `说明文字: ${item.alt_text}`,
        },
        {
          type: 'text' as const,
          text: `描述: ${item.description.rendered}`,
        },
      ],
    };
  } catch (error) {
    return formatErrorResponse('更新', '媒体文件元数据', error);
  }
};

// Register tool with MCP server
export function registerEditMediaMetadataTool(server: McpServer) {
  server.tool(
    'mcp_remote_wp_edit_media_metadata',
    {
      id: editMediaMetadataSchema.shape.id,
      alt_text: editMediaMetadataSchema.shape.alt_text,
      caption: editMediaMetadataSchema.shape.caption,
      description: editMediaMetadataSchema.shape.description,
      title: editMediaMetadataSchema.shape.title,
    },
    editMediaMetadataHandler
  );

  return server;
}
