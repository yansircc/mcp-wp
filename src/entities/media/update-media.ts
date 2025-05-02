import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { fetchWpApi } from '../../lib/api-client.js';
import { MediaItem } from './types.js';
import { formatErrorResponse } from '../content/utils.js';

// Define input schema
export const updateMediaSchema = z.object({
  id: z.number().int().positive().describe('媒体文件ID'),
  title: z.string().optional().describe('标题'),
  status: z.enum(['inherit', 'private']).optional().describe('状态'),
  alt_text: z.string().optional().describe('说明文字'),
  caption: z.string().optional().describe('标题'),
  description: z.string().optional().describe('描述'),
  post: z.number().optional().describe('关联文章ID'),
  author: z.number().optional().describe('作者ID'),
  slug: z.string().optional().describe('别名'),
  comment_status: z.enum(['open', 'closed']).optional().describe('评论状态'),
  ping_status: z.enum(['open', 'closed']).optional().describe('Ping状态'),
});

// Create tool handler function
export const updateMediaHandler = async (
  params: z.infer<typeof updateMediaSchema>
) => {
  try {
    const { id, ...updateData } = params;

    // Ensure we have at least one field to update
    if (Object.keys(updateData).length === 0) {
      return {
        content: [
          {
            type: 'text' as const,
            text: '更新媒体文件失败: 请提供至少一个需要更新的字段',
          },
        ],
        isError: true,
      };
    }

    // Call WordPress API
    const item = await fetchWpApi<MediaItem>(`/wp/v2/media/${id}`, {
      method: 'POST',
      body: JSON.stringify(updateData),
      needsAuth: true,
    });

    // Format response
    return {
      content: [
        {
          type: 'text' as const,
          text: '媒体文件更新成功：',
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
          text: `URL: ${item.source_url}`,
        },
      ],
    };
  } catch (error) {
    return formatErrorResponse('更新', '媒体文件', error);
  }
};

// Register tool with MCP server
export function registerUpdateMediaTool(server: McpServer) {
  server.tool(
    'mcp_remote_wp_update_media',
    {
      id: updateMediaSchema.shape.id,
      title: updateMediaSchema.shape.title,
      status: updateMediaSchema.shape.status,
      alt_text: updateMediaSchema.shape.alt_text,
      caption: updateMediaSchema.shape.caption,
      description: updateMediaSchema.shape.description,
      post: updateMediaSchema.shape.post,
      author: updateMediaSchema.shape.author,
      slug: updateMediaSchema.shape.slug,
      comment_status: updateMediaSchema.shape.comment_status,
      ping_status: updateMediaSchema.shape.ping_status,
    },
    updateMediaHandler
  );

  return server;
}
