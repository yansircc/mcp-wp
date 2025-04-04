import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerContentTools } from "./content";
import { registerTaxonomyTools } from "./taxonomy";

// 注册所有工具的函数
export function registerAllTools(server: McpServer): McpServer {
	// 注册 WordPress 内容工具
	registerContentTools(server);

	// 注册 WordPress 分类工具
	registerTaxonomyTools(server);

	return server;
}
