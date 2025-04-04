import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerContentTools } from "./content";
import { registerSettingsTools } from "./settings";
import { registerTaxonomyTools } from "./taxonomy";
import { registerThemeTools } from "./theme";
import { registerUserTools } from "./user";

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

	return server;
}
