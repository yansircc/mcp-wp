import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { fetchWpApi } from "../../lib/api-client";
import { formatErrorResponse, taxonomyTypeSchema, termIdSchema } from "./utils";

// Define input schema with optional update fields
export const updateTermSchema = taxonomyTypeSchema.merge(termIdSchema).extend({
	name: z.string().optional().describe("分类项名称"),
	slug: z.string().optional().describe("别名，URL友好的名称"),
	description: z.string().optional().describe("描述"),
	parent: z.number().int().positive().optional().describe("父分类项ID"),
	meta: z.record(z.unknown()).optional().describe("元数据"),
});

// Create tool handler function
export const updateTermHandler = async ({
	type,
	endpoint,
	id,
	name,
	slug,
	description,
	parent,
	meta,
}: z.infer<typeof updateTermSchema>) => {
	try {
		// Validate that at least one field is provided
		if (
			name === undefined &&
			slug === undefined &&
			description === undefined &&
			parent === undefined &&
			meta === undefined
		) {
			return {
				content: [
					{
						type: "text" as const,
						text: `更新${type}失败: 至少需要提供 name, slug, description, parent 或 meta 中的一个`,
					},
				],
				isError: true,
			};
		}

		// Create update payload with only the fields that are provided
		const updateData: Record<string, unknown> = {};
		if (name !== undefined) updateData.name = name;
		if (slug !== undefined) updateData.slug = slug;
		if (description !== undefined) updateData.description = description;
		if (parent !== undefined) updateData.parent = parent;
		if (meta !== undefined) updateData.meta = meta;

		const response = await fetchWpApi<any>(`${endpoint}/${id}`, {
			method: "PUT",
			body: JSON.stringify(updateData),
			needsAuth: true,
		});

		return {
			content: [
				{
					type: "text" as const,
					text: `${type}项更新成功！ID: ${response.id}, 名称: ${response.name}`,
				},
			],
		};
	} catch (error) {
		return formatErrorResponse("更新", type, error);
	}
};

// Register tool with MCP server
export function registerUpdateTermTool(server: McpServer) {
	server.tool(
		"update-term",
		{
			type: updateTermSchema.shape.type,
			endpoint: updateTermSchema.shape.endpoint,
			id: updateTermSchema.shape.id,
			name: updateTermSchema.shape.name,
			slug: updateTermSchema.shape.slug,
			description: updateTermSchema.shape.description,
			parent: updateTermSchema.shape.parent,
			meta: updateTermSchema.shape.meta,
		},
		updateTermHandler,
	);

	return server;
}
