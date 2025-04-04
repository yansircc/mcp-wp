import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { z } from "zod";
import { fetchWpApi } from "../../lib/api-client.js";
import {
	formatErrorResponse,
	formatUpdateResponse,
	updateSettingsSchema,
} from "./utils.js";

// Define input schema
export const updateSettingsInputSchema = updateSettingsSchema;

// Create tool handler function
export const updateSettingsHandler = async (
	settings: z.infer<typeof updateSettingsSchema>,
) => {
	try {
		// Prepare update data (collect only provided fields)
		const updateData: Record<string, unknown> = {};
		const updatedSettings: string[] = [];

		// Process all provided settings
		// General settings
		if (settings.title !== undefined) {
			updateData.title = settings.title;
			updatedSettings.push(`站点标题: ${settings.title}`);
		}
		if (settings.description !== undefined) {
			updateData.description = settings.description;
			updatedSettings.push(`站点副标题: ${settings.description}`);
		}
		if (settings.url !== undefined) {
			updateData.url = settings.url;
			updatedSettings.push(`WordPress 地址: ${settings.url}`);
		}
		if (settings.email !== undefined) {
			updateData.email = settings.email;
			updatedSettings.push(`管理员邮箱: ${settings.email}`);
		}
		if (settings.timezone !== undefined) {
			updateData.timezone = settings.timezone;
			updatedSettings.push(`时区: ${settings.timezone}`);
		}
		if (settings.date_format !== undefined) {
			updateData.date_format = settings.date_format;
			updatedSettings.push(`日期格式: ${settings.date_format}`);
		}
		if (settings.time_format !== undefined) {
			updateData.time_format = settings.time_format;
			updatedSettings.push(`时间格式: ${settings.time_format}`);
		}
		if (settings.start_of_week !== undefined) {
			updateData.start_of_week = settings.start_of_week;
			updatedSettings.push(`每周开始于: ${settings.start_of_week}`);
		}
		if (settings.language !== undefined) {
			updateData.language = settings.language;
			updatedSettings.push(`站点语言: ${settings.language}`);
		}

		// Reading settings
		if (settings.posts_per_page !== undefined) {
			updateData.posts_per_page = settings.posts_per_page;
			updatedSettings.push(`每页显示的文章数: ${settings.posts_per_page}`);
		}
		if (settings.show_on_front !== undefined) {
			updateData.show_on_front = settings.show_on_front;
			updatedSettings.push(
				`首页显示: ${settings.show_on_front === "page" ? "静态页面" : "最新文章"}`,
			);
		}
		if (settings.page_on_front !== undefined) {
			updateData.page_on_front = settings.page_on_front;
			updatedSettings.push(`静态首页ID: ${settings.page_on_front}`);
		}
		if (settings.page_for_posts !== undefined) {
			updateData.page_for_posts = settings.page_for_posts;
			updatedSettings.push(`文章页ID: ${settings.page_for_posts}`);
		}

		// Discussion settings
		if (settings.default_comment_status !== undefined) {
			updateData.default_comment_status = settings.default_comment_status;
			updatedSettings.push(
				`默认评论状态: ${settings.default_comment_status === "open" ? "开启" : "关闭"}`,
			);
		}
		if (settings.default_ping_status !== undefined) {
			updateData.default_ping_status = settings.default_ping_status;
			updatedSettings.push(
				`默认ping状态: ${settings.default_ping_status === "open" ? "开启" : "关闭"}`,
			);
		}

		// Media settings
		if (settings.default_category !== undefined) {
			updateData.default_category = settings.default_category;
			updatedSettings.push(`默认分类目录: ${settings.default_category}`);
		}
		if (settings.default_post_format !== undefined) {
			updateData.default_post_format = settings.default_post_format;
			updatedSettings.push(`默认文章格式: ${settings.default_post_format}`);
		}

		// Permalinks
		if (settings.permalink_structure !== undefined) {
			updateData.permalink_structure = settings.permalink_structure;
			updatedSettings.push(`永久链接结构: ${settings.permalink_structure}`);
		}

		// Site identity
		if (settings.site_icon !== undefined) {
			updateData.site_icon = settings.site_icon;
			updatedSettings.push(`站点图标ID: ${settings.site_icon}`);
		}
		if (settings.site_logo !== undefined) {
			updateData.site_logo = settings.site_logo;
			updatedSettings.push(`站点LOGO ID: ${settings.site_logo}`);
		}

		// Check if we have any settings to update
		if (Object.keys(updateData).length === 0) {
			return {
				content: [
					{
						type: "text" as const,
						text: "未提供任何设置更新。请提供至少一个需要更新的设置项。",
					},
				],
				isError: true,
			};
		}

		// Send the update request
		await fetchWpApi<any>("/wp/v2/settings", {
			method: "POST",
			body: JSON.stringify(updateData),
			needsAuth: true,
		});

		// Return success response
		return formatUpdateResponse(updatedSettings);
	} catch (error) {
		return formatErrorResponse("更新", error);
	}
};

// Register tool with MCP server
export function registerUpdateSettingsTool(server: McpServer) {
	server.tool(
		"update-settings",
		{
			title: updateSettingsSchema.shape.title,
			description: updateSettingsSchema.shape.description,
			url: updateSettingsSchema.shape.url,
			email: updateSettingsSchema.shape.email,
			timezone: updateSettingsSchema.shape.timezone,
			date_format: updateSettingsSchema.shape.date_format,
			time_format: updateSettingsSchema.shape.time_format,
			start_of_week: updateSettingsSchema.shape.start_of_week,
			language: updateSettingsSchema.shape.language,
			posts_per_page: updateSettingsSchema.shape.posts_per_page,
			show_on_front: updateSettingsSchema.shape.show_on_front,
			page_on_front: updateSettingsSchema.shape.page_on_front,
			page_for_posts: updateSettingsSchema.shape.page_for_posts,
			default_comment_status: updateSettingsSchema.shape.default_comment_status,
			default_ping_status: updateSettingsSchema.shape.default_ping_status,
			default_category: updateSettingsSchema.shape.default_category,
			default_post_format: updateSettingsSchema.shape.default_post_format,
			permalink_structure: updateSettingsSchema.shape.permalink_structure,
			site_icon: updateSettingsSchema.shape.site_icon,
			site_logo: updateSettingsSchema.shape.site_logo,
		},
		updateSettingsHandler,
	);

	return server;
}
