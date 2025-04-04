import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { WP_REST_API_Post } from "wp-types";
import { z } from "zod";
import { fetchWpApi } from "../../lib/api-client.js";
import {
	contentDataSchema,
	contentTypeSchema,
	formatErrorResponse,
} from "./utils.js";

// Define input schema
const contentItemSchema = contentDataSchema;

export const bulkCreateContentSchema = contentTypeSchema.extend({
	items: z
		.array(contentItemSchema)
		.min(1, "至少需要一个内容项")
		.describe("内容项列表"),
});

// Create tool handler function
export const bulkCreateContentHandler = async ({
	type,
	endpoint,
	items,
}: z.infer<typeof bulkCreateContentSchema>) => {
	try {
		const createdItems: WP_REST_API_Post[] = [];

		// Create items sequentially to ensure proper error handling
		for (const item of items) {
			const response = await fetchWpApi<WP_REST_API_Post>(endpoint, {
				method: "POST",
				body: JSON.stringify(item),
				needsAuth: true,
			});
			createdItems.push(response);
		}

		return {
			content: [
				{
					type: "text" as const,
					text: `批量创建${type}成功！共创建 ${createdItems.length} 个${type}`,
				},
				{
					type: "text" as const,
					text: createdItems
						.map((item) => `ID: ${item.id}, 标题: ${item.title.rendered}`)
						.join("\n"),
				},
			],
		};
	} catch (error) {
		return formatErrorResponse("批量创建", type, error);
	}
};

// Register tool with MCP server
export function registerBulkCreateContentTool(server: McpServer) {
	server.tool(
		"bulk-create-content",
		{
			type: bulkCreateContentSchema.shape.type,
			endpoint: bulkCreateContentSchema.shape.endpoint,
			items: bulkCreateContentSchema.shape.items,
		},
		bulkCreateContentHandler,
	);

	return server;
}
