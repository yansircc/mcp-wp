import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { fetchWpApi } from '../../lib/api-client.js';
import { MediaItem } from './types.js';
import { formatErrorResponse } from '../content/utils.js';

// Define input schema
export const createMediaSchema = z.object({
  file: z.instanceof(File).or(z.instanceof(Blob)).describe('文件'),
  title: z.string().optional().describe('标题'),
  status: z
    .enum(['inherit', 'private'])
    .optional()
    .default('inherit')
    .describe('状态'),
  alt_text: z.string().optional().describe('说明文字'),
  caption: z.string().optional().describe('标题'),
  description: z.string().optional().describe('描述'),
  post: z.number().optional().describe('关联文章ID'),
  author: z.number().optional().describe('作者ID'),
});

// Create tool handler function
export const createMediaHandler = async (
  params: z.infer<typeof createMediaSchema>
) => {
  try {
    const formData = new FormData();
    formData.append('file', params.file);

    const { file, ...data } = params;
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, String(value));
      }
    });

    // Call WordPress API
    const item = await fetchWpApi<MediaItem>('/wp/v2/media', {
      method: 'POST',
      body: formData,
      needsAuth: true,
    });

    // Format response
    return {
      content: [
        {
          type: 'text' as const,
          text: '媒体文件上传成功：',
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
    return formatErrorResponse('上传', '媒体文件', error);
  }
};

// Register tool with MCP server
export function registerCreateMediaTool(server: McpServer) {
  server.tool(
    'mcp_remote_wp_create_media',
    {
      file: createMediaSchema.shape.file,
      title: createMediaSchema.shape.title,
      status: createMediaSchema.shape.status,
      alt_text: createMediaSchema.shape.alt_text,
      caption: createMediaSchema.shape.caption,
      description: createMediaSchema.shape.description,
      post: createMediaSchema.shape.post,
      author: createMediaSchema.shape.author,
    },
    createMediaHandler
  );

  return server;
}
