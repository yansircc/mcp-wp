import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { fetchWpApi } from "../../lib/api-client.js";

// Define structure for WordPress taxonomy response
interface WordPressTaxonomy {
	name: string;
	rest_base?: string;
	hierarchical: boolean;
	description?: string;
}

// Define output format for taxonomies
interface Taxonomy {
	slug: string;
	name: string;
	endpoint: string;
	restBase: string;
	hierarchical: boolean;
	description?: string;
}

// Define input schema (empty - no parameters needed)
export const listTaxonomiesSchema = z.object({});

// Create tool handler function
export const listTaxonomiesHandler = async () => {
	try {
		// Fetch taxonomies from WordPress
		const response = await fetchWpApi<Record<string, WordPressTaxonomy>>(
			"/wp/v2/taxonomies",
			{
				method: "GET",
				needsAuth: true,
			},
		);

		// Format the response
		const taxonomies: Taxonomy[] = Object.entries(response).map(
			([slug, data]) => ({
				slug,
				name: data.name,
				endpoint: data.rest_base
					? `/wp/v2/${data.rest_base}`
					: `/wp/v2/${slug}`,
				restBase: data.rest_base || slug,
				hierarchical: data.hierarchical,
				description: data.description,
			}),
		);

		return {
			content: [
				{
					type: "text" as const,
					text: "可用分类法：",
				},
				...taxonomies.map((taxonomy) => ({
					type: "text" as const,
					text: `类型: ${taxonomy.slug} (${taxonomy.name})
端点: ${taxonomy.endpoint}
层级: ${taxonomy.hierarchical ? "支持层级" : "不支持层级"}${
						taxonomy.description ? `\n描述: ${taxonomy.description}` : ""
					}`,
				})),
				{
					type: "text" as const,
					text: "使用 create-term, get-term-by-id 等工具时，请指定上述的 类型 和 端点。",
				},
			],
		};
	} catch (error) {
		return {
			content: [
				{
					type: "text" as const,
					text: `获取分类法失败: ${
						error instanceof Error ? error.message : String(error)
					}`,
				},
			],
			isError: true,
		};
	}
};

// Register tool with MCP server
export function registerListTaxonomiesTool(server: McpServer) {
	server.tool("list-taxonomies", {}, listTaxonomiesHandler);
	return server;
}
