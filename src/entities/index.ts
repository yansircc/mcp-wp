import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerContentTools } from './content/index.js';
import { registerSettingsTools } from './settings/index.js';
import { registerTaxonomyTools } from './taxonomy/index.js';
import { registerThemeTools } from './theme/index.js';
import { registerUserTools } from './user/index.js';
import { registerMediaTools } from './media/index.js';

// 注册所有工具的函数
export function registerAllTools(server: McpServer): McpServer {
  // 注册 WordPress 内容工具
  registerContentTools(server);

  // 注册 WordPress 分类工具
  registerTaxonomyTools(server);

  // 注册 WordPress 用户工具
  registerUserTools(server);

  // 注册 WordPress 主题工具
  registerThemeTools(server);

  // 注册 WordPress 设置工具
  registerSettingsTools(server);

  // 注册 WordPress 媒体库工具
  registerMediaTools(server);

  return server;
}

export * from './content/index.js';
export * from './settings/index.js';
export * from './taxonomy/index.js';
export * from './theme/index.js';
export * from './user/index.js';
export * from './media/index.js';
