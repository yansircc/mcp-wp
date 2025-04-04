import { z } from "zod";

// Basic response content type for text output
export type TextContent = {
	type: "text";
	text: string;
};

// Define schema for getting WordPress settings
export const getSettingsSchema = z.object({
	// No specific parameters needed for getting settings
});

// Define schema for updating WordPress settings
export const updateSettingsSchema = z.object({
	// General settings
	title: z.string().optional().describe("站点标题"),
	description: z.string().optional().describe("站点副标题"),
	url: z.string().url().optional().describe("WordPress 地址"),
	email: z.string().email().optional().describe("管理员邮箱"),
	timezone: z.string().optional().describe("时区"),
	date_format: z.string().optional().describe("日期格式"),
	time_format: z.string().optional().describe("时间格式"),
	start_of_week: z
		.number()
		.min(0)
		.max(6)
		.optional()
		.describe("每周开始于（0=周日）"),
	language: z.string().optional().describe("站点语言"),

	// Reading settings
	posts_per_page: z
		.number()
		.int()
		.positive()
		.optional()
		.describe("每页显示的文章数"),
	show_on_front: z.enum(["posts", "page"]).optional().describe("首页显示"),
	page_on_front: z
		.number()
		.int()
		.nonnegative()
		.optional()
		.describe("静态首页ID"),
	page_for_posts: z
		.number()
		.int()
		.nonnegative()
		.optional()
		.describe("文章页ID"),

	// Discussion settings
	default_comment_status: z
		.enum(["open", "closed"])
		.optional()
		.describe("默认评论状态"),
	default_ping_status: z
		.enum(["open", "closed"])
		.optional()
		.describe("默认ping状态"),

	// Media settings
	default_category: z
		.number()
		.int()
		.positive()
		.optional()
		.describe("默认分类目录"),
	default_post_format: z.string().optional().describe("默认文章格式"),

	// Permalinks
	permalink_structure: z.string().optional().describe("永久链接结构"),

	// Site identity
	site_icon: z.number().int().nonnegative().optional().describe("站点图标"),
	site_logo: z.number().int().nonnegative().optional().describe("站点LOGO"),
});

// Format settings response
export const formatSettingsResponse = (settings: any) => {
	return {
		content: [
			{
				type: "text" as const,
				text: "WordPress 设置：",
			},
			{
				type: "text" as const,
				text: `站点标题: ${settings.title}
站点副标题: ${settings.description || "未设置"}
站点地址: ${settings.url}
管理员邮箱: ${settings.email}
时区: ${settings.timezone_string || settings.timezone || "未设置"}
日期格式: ${settings.date_format || "未设置"}
时间格式: ${settings.time_format || "未设置"}`,
			},
			{
				type: "text" as const,
				text: `首页显示: ${settings.show_on_front === "page" ? "静态页面" : "最新文章"}
每页文章数: ${settings.posts_per_page || "未设置"}`,
			},
			{
				type: "text" as const,
				text: `默认评论状态: ${settings.default_comment_status === "open" ? "开启" : "关闭"}
默认ping状态: ${settings.default_ping_status === "open" ? "开启" : "关闭"}
默认分类目录: ${settings.default_category || "未设置"}
默认文章格式: ${settings.default_post_format || "标准"}`,
			},
		],
	};
};

// Format update response
export const formatUpdateResponse = (updated: string[]) => {
	return {
		content: [
			{
				type: "text" as const,
				text: "WordPress 设置已更新！已更新以下设置：",
			},
			{
				type: "text" as const,
				text: updated.join("\n"),
			},
		],
	};
};

// Format error response
export const formatErrorResponse = (action: string, error: unknown) => {
	return {
		content: [
			{
				type: "text" as const,
				text: `WordPress 设置${action}失败: ${
					error instanceof Error ? error.message : String(error)
				}`,
			},
		],
		isError: true,
	};
};
