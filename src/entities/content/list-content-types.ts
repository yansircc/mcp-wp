import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { fetchWpApi } from "../../lib/api-client.js";

// Define structure for WordPress content type response
interface WordPressContentType {
	name: string;
	rest_base?: string;
	supports: Record<string, boolean>;
	description?: string;
}

// Define output format for content types
interface ContentType {
	slug: string;
	name: string;
	endpoint: string;
	restBase: string;
	supports: string[];
	description?: string;
}

// Define input schema (empty - no parameters needed)
export const listContentTypesSchema = z.object({});

// Create tool handler function
export const listContentTypesHandler = async () => {
	try {
		// Fetch content types from WordPress
		const response = await fetchWpApi<Record<string, WordPressContentType>>(
			"/wp/v2/types",
			{
				method: "GET",
				needsAuth: true,
			},
		);

		// Format the response
		const contentTypes: ContentType[] = Object.entries(response).map(
			([slug, data]) => ({
				slug,
				name: data.name,
				endpoint: data.rest_base
					? `/wp/v2/${data.rest_base}`
					: `/wp/v2/${slug}`,
				restBase: data.rest_base || slug,
				supports: Object.keys(data.supports || {}).filter(
					(key) => data.supports[key] === true,
				),
				description: data.description,
			}),
		);

		return {
			content: [
				{
					type: "text" as const,
					text: "可用内容类型：",
				},
				...contentTypes.map((type) => ({
					type: "text" as const,
					text: `类型: ${type.slug} (${type.name})
端点: ${type.endpoint}
支持功能: ${type.supports.join(", ")}${
						type.description ? `\n描述: ${type.description}` : ""
					}`,
				})),
				{
					type: "text" as const,
					text: "使用 create-content, get-content-by-id 等工具时，请指定上述的 类型 和 端点。",
				},
			],
		};
	} catch (error) {
		return {
			content: [
				{
					type: "text" as const,
					text: `获取内容类型失败: ${
						error instanceof Error ? error.message : String(error)
					}`,
				},
			],
			isError: true,
		};
	}
};

// Register tool with MCP server
export function registerListContentTypesTool(server: McpServer) {
	server.tool("list-content-types", {}, listContentTypesHandler);
	return server;
}
