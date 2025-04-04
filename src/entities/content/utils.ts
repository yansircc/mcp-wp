import type { WP_REST_API_Post, WP_REST_API_Posts } from "wp-types";
import { z } from "zod";

// Schema for content type specification
export const contentTypeSchema = z.object({
	type: z.string().min(1).describe("内容类型 (如 post, page 或自定义类型)"),
	endpoint: z
		.string()
		.min(1)
		.describe("WordPress REST API 端点路径 (如 /wp/v2/posts)"),
});

// Schema for creating/updating content
export const contentDataSchema = z.object({
	title: z.string().min(1, "标题不能为空").describe("标题"),
	content: z.string().min(1, "内容不能为空").describe("内容"),
	status: z
		.enum(["publish", "draft", "pending", "private"])
		.optional()
		.default("publish")
		.describe("状态"),
});

// Schema for listing/querying content
export const contentQuerySchema = z.object({
	page: z.number().int().positive().optional().default(1).describe("页码"),
	per_page: z
		.number()
		.int()
		.positive()
		.optional()
		.default(10)
		.describe("每页数量（最大100）"),
	status: z
		.enum(["publish", "draft", "pending", "private", "any"])
		.optional()
		.default("publish")
		.describe("状态"),
	search: z.string().optional().describe("搜索关键词"),
	order: z
		.enum(["asc", "desc"])
		.optional()
		.default("desc")
		.describe("排序方向"),
	orderby: z
		.enum(["date", "title", "id", "author", "modified", "relevance"])
		.optional()
		.default("date")
		.describe("排序字段"),
});

// Schema for identifying content
export const contentIdSchema = z.object({
	id: z.number().int().positive().describe("ID"),
});

// Schema for deletion options
export const contentDeleteSchema = z.object({
	force: z
		.boolean()
		.optional()
		.default(false)
		.describe("是否强制删除（跳过回收站）"),
});

// Schema for advanced querying (superset of basic query schema)
export const advancedContentQuerySchema = contentQuerySchema.extend({
	orderby: z
		.enum([
			"date",
			"title",
			"id",
			"author",
			"modified",
			"relevance",
			"slug",
			"include",
			"menu_order",
		])
		.optional()
		.default("date")
		.describe("排序字段"),

	// Date filtering
	after: z
		.string()
		.optional()
		.describe("发布日期晚于（ISO8601格式：YYYY-MM-DDTHH:MM:SS）"),
	before: z
		.string()
		.optional()
		.describe("发布日期早于（ISO8601格式：YYYY-MM-DDTHH:MM:SS）"),

	// Author filtering
	author: z.number().int().positive().optional().describe("作者ID"),
	author_exclude: z
		.number()
		.int()
		.positive()
		.optional()
		.describe("排除的作者ID"),

	// Taxonomy filtering - note: some post types might not support these
	categories: z
		.union([z.number().int().positive(), z.array(z.number().int().positive())])
		.optional()
		.describe("分类ID或ID数组"),
	categories_exclude: z
		.union([z.number().int().positive(), z.array(z.number().int().positive())])
		.optional()
		.describe("排除的分类ID或ID数组"),
	tags: z
		.union([z.number().int().positive(), z.array(z.number().int().positive())])
		.optional()
		.describe("标签ID或ID数组"),
	tags_exclude: z
		.union([z.number().int().positive(), z.array(z.number().int().positive())])
		.optional()
		.describe("排除的标签ID或ID数组"),

	// Advanced inclusion/exclusion
	include: z.array(z.number().int().positive()).optional().describe("包含的ID"),
	exclude: z.array(z.number().int().positive()).optional().describe("排除的ID"),
	sticky: z.boolean().optional().describe("是否只包含置顶内容"),

	// Slug filtering
	slug: z.string().optional().describe("别名(slug)"),
});

// Helper function to format response based on content type
export function formatContentListResponse(
	type: string,
	items: WP_REST_API_Posts,
	filters?: string[],
): {
	content: Array<{ type: "text"; text: string }>;
	isError?: boolean;
} {
	if (items.length === 0) {
		return {
			content: [
				{
					type: "text" as const,
					text: `没有找到符合条件的${type}。`,
				},
			],
		};
	}

	return {
		content: [
			{
				type: "text" as const,
				text: `找到 ${items.length} 个${type}${filters && filters.length > 0 ? `（筛选条件：${filters.join("; ")}）` : ""}：`,
			},
			...items.map((item) => ({
				type: "text" as const,
				text: `ID: ${item.id}, 标题: ${item.title.rendered}, 状态: ${item.status}, 发布时间: ${item.date}`,
			})),
		],
	};
}

// Helper function to format single content response
export function formatContentResponse(
	type: string,
	item: WP_REST_API_Post,
): {
	content: Array<{ type: "text"; text: string }>;
	isError?: boolean;
} {
	return {
		content: [
			{
				type: "text" as const,
				text: `${type}信息：`,
			},
			{
				type: "text" as const,
				text: `ID: ${item.id}`,
			},
			{
				type: "text" as const,
				text: `标题: ${item.title.rendered}`,
			},
			{
				type: "text" as const,
				text: `状态: ${item.status}`,
			},
			{
				type: "text" as const,
				text: `创建时间: ${item.date}`,
			},
			{
				type: "text" as const,
				text: `内容: ${item.content.rendered}`,
			},
		],
	};
}

// Helper function to generate error response
export function formatErrorResponse(
	action: string,
	type: string,
	error: unknown,
): {
	content: Array<{ type: "text"; text: string }>;
	isError: true;
} {
	return {
		content: [
			{
				type: "text" as const,
				text: `${action}${type}失败: ${error instanceof Error ? error.message : String(error)}`,
			},
		],
		isError: true,
	};
}

// Helper function to convert object to API parameters
export function prepareApiParams(
	params: Record<string, unknown>,
): Record<string, string> {
	const apiParams: Record<string, string> = {};

	for (const [key, value] of Object.entries(params)) {
		if (value === undefined) continue;

		// Handle array parameters (convert to comma-separated string)
		if (Array.isArray(value)) {
			apiParams[key] = value.join(",");
		}
		// Handle boolean (convert to string "true"/"false")
		else if (typeof value === "boolean") {
			apiParams[key] = value.toString();
		}
		// Handle dates and other strings/numbers (convert to string)
		else {
			apiParams[key] = String(value);
		}
	}

	return apiParams;
}
