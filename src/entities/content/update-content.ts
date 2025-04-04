import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { WP_REST_API_Post } from "wp-types";
import { z } from "zod";
import { fetchWpApi } from "../../lib/api-client";
import {
	contentIdSchema,
	contentTypeSchema,
	formatErrorResponse,
} from "./utils";

// Define input schema with optional update fields
export const updateContentSchema = contentTypeSchema
	.merge(contentIdSchema)
	.extend({
		title: z.string().optional().describe("标题"),
		content: z.string().optional().describe("内容"),
		status: z
			.enum(["publish", "draft", "pending", "private"])
			.optional()
			.describe("状态"),
	});

// Create tool handler function
export const updateContentHandler = async ({
	type,
	endpoint,
	id,
	title,
	content,
	status,
}: z.infer<typeof updateContentSchema>) => {
	try {
		// Validate that at least one field is provided
		if (title === undefined && content === undefined && status === undefined) {
			return {
				content: [
					{
						type: "text" as const,
						text: `更新${type}失败: 至少需要提供 title, content 或 status 中的一个`,
					},
				],
				isError: true,
			};
		}

		// Create update payload with only the fields that are provided
		const updateData: Record<string, unknown> = {};
		if (title !== undefined) updateData.title = title;
		if (content !== undefined) updateData.content = content;
		if (status !== undefined) updateData.status = status;

		const response = await fetchWpApi<WP_REST_API_Post>(`${endpoint}/${id}`, {
			method: "PUT",
			body: JSON.stringify(updateData),
			needsAuth: true,
		});

		return {
			content: [
				{
					type: "text" as const,
					text: `${type}更新成功！ID: ${response.id}, 标题: ${response.title.rendered}`,
				},
			],
		};
	} catch (error) {
		return formatErrorResponse("更新", type, error);
	}
};

// Register tool with MCP server
export function registerUpdateContentTool(server: McpServer) {
	server.tool(
		"update-content",
		{
			type: updateContentSchema.shape.type,
			endpoint: updateContentSchema.shape.endpoint,
			id: updateContentSchema.shape.id,
			title: updateContentSchema.shape.title,
			content: updateContentSchema.shape.content,
			status: updateContentSchema.shape.status,
		},
		updateContentHandler,
	);

	return server;
}
