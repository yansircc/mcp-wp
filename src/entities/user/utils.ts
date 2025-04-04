import { z } from "zod";

// Basic response content type for text output
export type TextContent = {
	type: "text";
	text: string;
};

// Schema for pagination and common query parameters
export const userListQuerySchema = z.object({
	page: z.number().int().positive().optional().default(1).describe("页码"),
	per_page: z
		.number()
		.int()
		.positive()
		.max(100)
		.optional()
		.default(10)
		.describe("每页数量"),
	search: z.string().optional().describe("搜索关键词"),
	order: z.enum(["asc", "desc"]).optional().default("asc").describe("排序方向"),
	orderby: z
		.enum(["id", "name", "registered_date", "email"])
		.optional()
		.default("id")
		.describe("排序字段"),
	roles: z.array(z.string()).or(z.string()).optional().describe("用户角色过滤"),
});

// Schema for getting a user by ID
export const userIdSchema = z.object({
	id: z.number().int().positive().describe("用户ID"),
});

// Schema for creating/updating a user
export const userDataSchema = z.object({
	username: z.string().min(1).describe("用户名"),
	email: z.string().email().describe("电子邮箱"),
	password: z.string().min(6).describe("密码"),
	name: z.string().optional().describe("显示名称"),
	first_name: z.string().optional().describe("名"),
	last_name: z.string().optional().describe("姓"),
	roles: z.array(z.string()).or(z.string()).optional().describe("用户角色"),
	description: z.string().optional().describe("个人简介"),
	locale: z.string().optional().describe("语言设置"),
	url: z.string().url().optional().describe("网站"),
	meta: z.record(z.unknown()).optional().describe("元数据"),
});

// Schema for updating a user (all fields optional)
export const userUpdateSchema = z.object({
	username: z.string().min(1).optional().describe("用户名"),
	email: z.string().email().optional().describe("电子邮箱"),
	password: z.string().min(6).optional().describe("密码"),
	name: z.string().optional().describe("显示名称"),
	first_name: z.string().optional().describe("名"),
	last_name: z.string().optional().describe("姓"),
	roles: z.array(z.string()).or(z.string()).optional().describe("用户角色"),
	description: z.string().optional().describe("个人简介"),
	locale: z.string().optional().describe("语言设置"),
	url: z.string().url().optional().describe("网站"),
	meta: z.record(z.unknown()).optional().describe("元数据"),
});

// Format single user response
export const formatUserResponse = (user: any) => {
	return {
		content: [
			{
				type: "text" as const,
				text: `用户ID: ${user.id}
用户名: ${user.username || user.slug}
邮箱: ${user.email}
显示名称: ${user.name}
角色: ${Array.isArray(user.roles) ? user.roles.join(", ") : user.roles || "未知"}
${user.first_name ? `名: ${user.first_name}` : ""}
${user.last_name ? `姓: ${user.last_name}` : ""}
${user.description ? `简介: ${user.description}` : ""}
${user.url ? `网站: ${user.url}` : ""}
注册时间: ${new Date(user.registered_date || user.date).toLocaleString()}`,
			},
		],
	};
};

// Format user list response
export const formatUserListResponse = (
	users: any[],
	total: number,
	page: number,
	perPage: number,
) => {
	return {
		content: [
			{
				type: "text" as const,
				text: `用户列表 (第 ${page} 页, 共 ${Math.ceil(total / perPage)} 页, 总计 ${total} 名用户)`,
			},
			...users.map((user) => ({
				type: "text" as const,
				text: `ID: ${user.id} - ${user.name} (${user.username || user.slug})
邮箱: ${user.email}
角色: ${Array.isArray(user.roles) ? user.roles.join(", ") : user.roles || "未知"}`,
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
				text: `用户${action}失败: ${
					error instanceof Error ? error.message : String(error)
				}`,
			},
		],
		isError: true,
	};
};
