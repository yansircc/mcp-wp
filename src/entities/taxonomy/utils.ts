import { z } from "zod";

// Schema for taxonomy type specification
export const taxonomyTypeSchema = z.object({
	type: z
		.string()
		.min(1)
		.describe("分类法类型 (如 category, post_tag 或自定义分类法)"),
	endpoint: z
		.string()
		.min(1)
		.describe("WordPress REST API 端点路径 (如 /wp/v2/categories)"),
});

// Schema for creating/updating terms
export const termDataSchema = z.object({
	name: z.string().min(1, "名称不能为空").describe("分类项名称"),
	slug: z.string().optional().describe("别名，URL友好的名称"),
	description: z.string().optional().describe("描述"),
	parent: z.number().int().positive().optional().describe("父分类项ID"),
	meta: z.record(z.unknown()).optional().describe("元数据"),
});

// Schema for term identification
export const termIdSchema = z.object({
	id: z.number().int().positive().describe("分类项ID"),
});

// Schema for listing/querying terms
export const termQuerySchema = z.object({
	page: z.number().int().positive().optional().default(1).describe("页码"),
	per_page: z
		.number()
		.int()
		.positive()
		.optional()
		.default(10)
		.describe("每页数量（最大100）"),
	search: z.string().optional().describe("搜索关键词"),
	order: z.enum(["asc", "desc"]).optional().default("asc").describe("排序方向"),
	orderby: z
		.enum(["name", "id", "slug", "count"])
		.optional()
		.default("name")
		.describe("排序字段"),
	hide_empty: z.boolean().optional().describe("是否隐藏空分类项"),
	parent: z.number().int().optional().describe("父分类项ID"),
	post: z.number().int().optional().describe("相关文章ID"),
	slug: z.string().optional().describe("按别名筛选"),
});

// Schema for advanced term querying
export const advancedTermQuerySchema = termQuerySchema.extend({
	include: z
		.array(z.number().int().positive())
		.optional()
		.describe("包含的分类项ID列表"),
	exclude: z
		.array(z.number().int().positive())
		.optional()
		.describe("排除的分类项ID列表"),
	meta_key: z.string().optional().describe("元数据键名"),
	meta_value: z.string().optional().describe("元数据值"),
	meta_compare: z
		.enum(["=", "!=", ">", ">=", "<", "<=", "LIKE", "NOT LIKE", "IN", "NOT IN"])
		.optional()
		.describe("元数据比较操作符"),
});

// Helper function to format response for term list
export function formatTermListResponse(
	type: string,
	terms: any[],
	filters?: string[],
): {
	content: Array<{ type: "text"; text: string }>;
	isError?: boolean;
} {
	if (terms.length === 0) {
		return {
			content: [
				{
					type: "text" as const,
					text: `没有找到符合条件的${type}项。`,
				},
			],
		};
	}

	return {
		content: [
			{
				type: "text" as const,
				text: `找到 ${terms.length} 个${type}项${filters && filters.length > 0 ? `（筛选条件：${filters.join("; ")}）` : ""}：`,
			},
			...terms.map((term) => ({
				type: "text" as const,
				text: `ID: ${term.id}, 名称: ${term.name}, 别名: ${term.slug}${term.count !== undefined ? `, 文章数: ${term.count}` : ""}`,
			})),
		],
	};
}

// Helper function to format single term response
export function formatTermResponse(
	type: string,
	term: any,
): {
	content: Array<{ type: "text"; text: string }>;
	isError?: boolean;
} {
	return {
		content: [
			{
				type: "text" as const,
				text: `${type}项信息：`,
			},
			{
				type: "text" as const,
				text: `ID: ${term.id}`,
			},
			{
				type: "text" as const,
				text: `名称: ${term.name}`,
			},
			{
				type: "text" as const,
				text: `别名: ${term.slug}`,
			},
			...(term.description
				? [
						{
							type: "text" as const,
							text: `描述: ${term.description}`,
						},
					]
				: []),
			...(term.parent
				? [
						{
							type: "text" as const,
							text: `父项ID: ${term.parent}`,
						},
					]
				: []),
			...(term.count !== undefined
				? [
						{
							type: "text" as const,
							text: `文章数: ${term.count}`,
						},
					]
				: []),
			...(term.meta && Object.keys(term.meta).length > 0
				? [
						{
							type: "text" as const,
							text: `元数据: ${JSON.stringify(term.meta, null, 2)}`,
						},
					]
				: []),
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
