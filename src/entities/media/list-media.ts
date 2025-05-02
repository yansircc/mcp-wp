import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { fetchWpApi } from '../../lib/api-client.js';
import { MediaItem } from './types.js';
import { formatErrorResponse } from '../content/utils.js';

// Define input schema
export const listMediaSchema = z.object({
  page: z.number().optional().default(1).describe('页码'),
  per_page: z.number().optional().default(10).describe('每页数量（最大100）'),
  search: z.string().optional().describe('搜索关键词'),
  media_type: z
    .enum(['image', 'video', 'audio', 'application'])
    .optional()
    .describe('媒体类型'),
  order: z
    .enum(['asc', 'desc'])
    .optional()
    .default('desc')
    .describe('排序方向'),
  orderby: z
    .enum([
      'author',
      'date',
      'id',
      'include',
      'modified',
      'parent',
      'relevance',
      'slug',
      'title',
    ])
    .optional()
    .default('date')
    .describe('排序字段'),
});

// Create tool handler function
export const listMediaHandler = async (
  params: z.infer<typeof listMediaSchema>
) => {
  try {
    // Call WordPress API
    const items = await fetchWpApi<MediaItem[]>('/wp/v2/media', {
      method: 'GET',
      params,
      needsAuth: true,
    });

    // Format response
    if (items.length === 0) {
      return {
        content: [
          {
            type: 'text' as const,
            text: '没有找到符合条件的媒体文件。',
          },
        ],
      };
    }

    return {
      content: [
        {
          type: 'text' as const,
          text: `找到 ${items.length} 个媒体文件：`,
        },
        ...items.map((item) => ({
          type: 'text' as const,
          text: `ID: ${item.id}, 标题: ${item.title.rendered}, 类型: ${item.media_type}, URL: ${item.source_url}`,
        })),
      ],
    };
  } catch (error) {
    return formatErrorResponse('获取', '媒体文件', error);
  }
};

// Register tool with MCP server
export function registerListMediaTool(server: McpServer) {
  server.tool(
    'mcp_remote_wp_list_media',
    {
      page: listMediaSchema.shape.page,
      per_page: listMediaSchema.shape.per_page,
      search: listMediaSchema.shape.search,
      media_type: listMediaSchema.shape.media_type,
      order: listMediaSchema.shape.order,
      orderby: listMediaSchema.shape.orderby,
    },
    listMediaHandler
  );

  return server;
}
