import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { z } from "zod";
import { fetchWpApi } from "../../lib/api-client.js";
import {
	formatErrorResponse,
	taxonomyTypeSchema,
	termDataSchema,
} from "./utils.js";

// Define input schema
export const createTermSchema = taxonomyTypeSchema.merge(termDataSchema);

// Create tool handler function
export const createTermHandler = async ({
	type,
	endpoint,
	name,
	slug,
	description,
	parent,
	meta,
}: z.infer<typeof createTermSchema>) => {
	try {
		// Build request payload
		const payload: Record<string, unknown> = { name };
		if (slug !== undefined) payload.slug = slug;
		if (description !== undefined) payload.description = description;
		if (parent !== undefined) payload.parent = parent;
		if (meta !== undefined) payload.meta = meta;

		// Send request to WordPress API
		const response = await fetchWpApi<any>(endpoint, {
			method: "POST",
			body: JSON.stringify(payload),
			needsAuth: true,
		});

		return {
			content: [
				{
					type: "text" as const,
					text: `${type}项创建成功！ID: ${response.id}, 名称: ${response.name}`,
				},
			],
		};
	} catch (error) {
		return formatErrorResponse("创建", type, error);
	}
};

// Register tool with MCP server
export function registerCreateTermTool(server: McpServer) {
	server.tool(
		"create-term",
		{
			type: createTermSchema.shape.type,
			endpoint: createTermSchema.shape.endpoint,
			name: createTermSchema.shape.name,
			slug: createTermSchema.shape.slug,
			description: createTermSchema.shape.description,
			parent: createTermSchema.shape.parent,
			meta: createTermSchema.shape.meta,
		},
		createTermHandler,
	);

	return server;
}
