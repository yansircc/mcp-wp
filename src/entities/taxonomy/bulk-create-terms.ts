import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { fetchWpApi } from "../../lib/api-client.js";
import {
	formatErrorResponse,
	taxonomyTypeSchema,
	termDataSchema,
} from "./utils.js";

// Define input schema
const termItemSchema = termDataSchema;

export const bulkCreateTermsSchema = taxonomyTypeSchema.extend({
	items: z
		.array(termItemSchema)
		.min(1, "至少需要一个分类项")
		.describe("分类项列表"),
});

// Create tool handler function
export const bulkCreateTermsHandler = async ({
	type,
	endpoint,
	items,
}: z.infer<typeof bulkCreateTermsSchema>) => {
	try {
		const createdTerms: any[] = [];
		const errors: any[] = [];

		// Create terms sequentially to ensure proper error handling
		for (const item of items) {
			try {
				const response = await fetchWpApi<any>(endpoint, {
					method: "POST",
					body: JSON.stringify(item),
					needsAuth: true,
				});
				createdTerms.push(response);
			} catch (error) {
				errors.push({
					term: item.name,
					error: error instanceof Error ? error.message : String(error),
				});
			}
		}

		if (errors.length === 0) {
			return {
				content: [
					{
						type: "text" as const,
						text: `批量创建${type}项成功！共创建 ${createdTerms.length} 个${type}项`,
					},
					{
						type: "text" as const,
						text: createdTerms
							.map((term) => `ID: ${term.id}, 名称: ${term.name}`)
							.join("\n"),
					},
				],
			};
		}

		if (createdTerms.length === 0) {
			// All terms failed
			return {
				content: [
					{
						type: "text" as const,
						text: `批量创建${type}项失败！所有操作都遇到了错误：`,
					},
					{
						type: "text" as const,
						text: errors
							.map((err) => `分类项 "${err.term}": ${err.error}`)
							.join("\n"),
					},
				],
				isError: true,
			};
		}

		// Some succeeded, some failed
		return {
			content: [
				{
					type: "text" as const,
					text: `批量创建${type}项部分成功。成功: ${createdTerms.length}/${items.length}`,
				},
				{
					type: "text" as const,
					text: `创建成功的项：\n${createdTerms
						.map((term) => `ID: ${term.id}, 名称: ${term.name}`)
						.join("\n")}`,
				},
				{
					type: "text" as const,
					text: `失败的项：\n${errors
						.map((err) => `分类项 "${err.term}": ${err.error}`)
						.join("\n")}`,
				},
			],
			isError: false, // Partial success
		};
	} catch (error) {
		return formatErrorResponse("批量创建", type, error);
	}
};

// Register tool with MCP server
export function registerBulkCreateTermsTool(server: McpServer) {
	server.tool(
		"bulk-create-terms",
		{
			type: bulkCreateTermsSchema.shape.type,
			endpoint: bulkCreateTermsSchema.shape.endpoint,
			items: bulkCreateTermsSchema.shape.items,
		},
		bulkCreateTermsHandler,
	);

	return server;
}
