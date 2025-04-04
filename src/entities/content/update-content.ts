import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { WP_REST_API_Post } from "wp-types";
import { z } from "zod";
import { fetchWpApi } from "../../lib/api-client.js";
import {
	contentIdSchema,
	contentTypeSchema,
	formatErrorResponse,
} from "./utils.js";

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
		excerpt: z.string().optional().describe("摘要"),
		categories: z.array(z.number()).optional().describe("分类列表"),
		tags: z.array(z.number()).optional().describe("标签列表"),
		featured_media: z.number().optional().describe("特色图片ID"),
		author: z.number().optional().describe("作者ID"),
		slug: z.string().optional().describe("别名"),
		comment_status: z.enum(["open", "closed"]).optional().describe("评论状态"),
		ping_status: z.enum(["open", "closed"]).optional().describe("Ping状态"),
		format: z.string().optional().describe("内容格式"),
		sticky: z.boolean().optional().describe("是否置顶"),
		template: z.string().optional().describe("页面模板"),
		meta: z.record(z.unknown()).optional().describe("元数据"),
	});

// Create tool handler function
export const updateContentHandler = async ({
	type,
	endpoint,
	id,
	title,
	content,
	status,
	excerpt,
	categories,
	tags,
	featured_media,
	author,
	slug,
	comment_status,
	ping_status,
	format,
	sticky,
	template,
	meta,
}: z.infer<typeof updateContentSchema>) => {
	try {
		// Create update payload with all provided fields
		const updateData: Record<string, unknown> = {};
		if (title !== undefined) updateData.title = title;
		if (content !== undefined) updateData.content = content;
		if (status !== undefined) updateData.status = status;
		if (excerpt !== undefined) updateData.excerpt = excerpt;
		if (categories !== undefined) updateData.categories = categories;
		if (tags !== undefined) updateData.tags = tags;
		if (featured_media !== undefined)
			updateData.featured_media = featured_media;
		if (author !== undefined) updateData.author = author;
		if (slug !== undefined) updateData.slug = slug;
		if (comment_status !== undefined)
			updateData.comment_status = comment_status;
		if (ping_status !== undefined) updateData.ping_status = ping_status;
		if (format !== undefined) updateData.format = format;
		if (sticky !== undefined) updateData.sticky = sticky;
		if (template !== undefined) updateData.template = template;
		if (meta !== undefined) updateData.meta = meta;

		// Ensure we have at least one field to update
		if (Object.keys(updateData).length === 0) {
			return {
				content: [
					{
						type: "text" as const,
						text: `更新${type}失败: 请提供至少一个需要更新的字段`,
					},
				],
				isError: true,
			};
		}

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
			excerpt: updateContentSchema.shape.excerpt,
			categories: updateContentSchema.shape.categories,
			tags: updateContentSchema.shape.tags,
			featured_media: updateContentSchema.shape.featured_media,
			author: updateContentSchema.shape.author,
			slug: updateContentSchema.shape.slug,
			comment_status: updateContentSchema.shape.comment_status,
			ping_status: updateContentSchema.shape.ping_status,
			format: updateContentSchema.shape.format,
			sticky: updateContentSchema.shape.sticky,
			template: updateContentSchema.shape.template,
			meta: updateContentSchema.shape.meta,
		},
		updateContentHandler,
	);

	return server;
}
