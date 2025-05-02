import { z } from 'zod';

// Basic response content type for text output
export type TextContent = {
  type: 'text';
  text: string;
};

// Define schema for basic plugin operations
export const pluginSchema = z.object({
  // No specific parameters needed for basic plugin operations
});

// Schema for plugin status filter
export const pluginStatusSchema = z.object({
  status: z
    .enum(['active', 'inactive', 'all'])
    .default('all')
    .describe('插件状态过滤'),
});

// Schema for plugin activation or deactivation
export const pluginActionSchema = z.object({
  plugin: z.string().describe('插件文件路径（相对于插件目录）'),
});

// Schema for plugin installation from WordPress.org
export const pluginInstallSchema = z.object({
  slug: z.string().describe('WordPress.org 插件目录中的插件别名'),
});

// Schema for plugin deletion
export const pluginDeleteSchema = z.object({
  plugin: z.string().describe('插件文件路径（相对于插件目录）'),
});

// Format plugin response for individual plugin
export const formatPluginResponse = (plugin: any) => {
  return {
    content: [
      {
        type: 'text' as const,
        text: `插件: ${plugin.name} (${plugin.plugin})
版本: ${plugin.version || '未知'}
状态: ${plugin.status === 'active' ? '已激活' : '未激活'}
作者: ${plugin.author || '未知'}
描述: ${plugin.description || '无描述'}`,
      },
    ],
  };
};

// Format plugin list response
export const formatPluginListResponse = (plugins: any[]) => {
  return {
    content: [
      {
        type: 'text' as const,
        text: `已找到 ${plugins.length} 个插件：`,
      },
      ...plugins.map((plugin) => ({
        type: 'text' as const,
        text: `${plugin.status === 'active' ? '✓ ' : ''}${plugin.name} (${
          plugin.plugin
        }) - ${plugin.version || '未知版本'}${
          plugin.description ? `\n${plugin.description}` : ''
        }`,
      })),
    ],
  };
};

// Format error response
export const formatErrorResponse = (action: string, error: unknown) => {
  return {
    content: [
      {
        type: 'text' as const,
        text: `插件${action}失败: ${
          error instanceof Error ? error.message : String(error)
        }`,
      },
    ],
    isError: true,
  };
};
