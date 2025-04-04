import { z } from "zod";

// Basic response content type for text output
export type TextContent = {
	type: "text";
	text: string;
};

// Define schema for basic theme operations
export const themeSchema = z.object({
	// No specific parameters needed for listing themes
});

// Schema for theme status filter
export const themeStatusSchema = z.object({
	status: z
		.enum(["active", "inactive", "all"])
		.default("all")
		.describe("主题状态过滤"),
});

// Schema for theme activation
export const themeActivationSchema = z.object({
	stylesheet: z.string().describe("主题标识符（样式表路径）"),
});

// Schema for theme deletion or installation
export const themeStylesheetSchema = z.object({
	stylesheet: z.string().describe("主题标识符（样式表路径）"),
});

// Schema for theme installation from WordPress.org
export const themeInstallSchema = z.object({
	slug: z.string().describe("WordPress.org 主题目录中的主题别名"),
});

// Format theme response for individual theme
export const formatThemeResponse = (theme: any) => {
	return {
		content: [
			{
				type: "text" as const,
				text: `主题: ${theme.name} (${theme.stylesheet})
版本: ${theme.version || "未知"}
状态: ${theme.status === "active" ? "激活" : "未激活"}
作者: ${theme.author || "未知"}
描述: ${theme.description || "无描述"}
${theme.screenshot ? `预览图: ${theme.screenshot}` : ""}`,
			},
		],
	};
};

// Format theme list response
export const formatThemeListResponse = (themes: any[]) => {
	return {
		content: [
			{
				type: "text" as const,
				text: `已找到 ${themes.length} 个主题：`,
			},
			...themes.map((theme) => ({
				type: "text" as const,
				text: `${theme.status === "active" ? "✓ " : ""}${theme.name} (${
					theme.stylesheet
				}) - ${theme.version || "未知版本"}${
					theme.description ? `\n${theme.description}` : ""
				}`,
			})),
		],
	};
};

// Format error response
export const formatErrorResponse = (action: string, error: unknown) => {
	return {
		content: [
			{
				type: "text" as const,
				text: `主题${action}失败: ${
					error instanceof Error ? error.message : String(error)
				}`,
			},
		],
		isError: true,
	};
};
