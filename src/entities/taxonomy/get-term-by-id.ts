import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { z } from "zod";
import { fetchWpApi } from "../../lib/api-client";
import {
	formatErrorResponse,
	formatTermResponse,
	taxonomyTypeSchema,
	termIdSchema,
} from "./utils";

// Define input schema
export const getTermByIdSchema = taxonomyTypeSchema.merge(termIdSchema);

// Create tool handler function
export const getTermByIdHandler = async ({
	type,
	endpoint,
	id,
}: z.infer<typeof getTermByIdSchema>) => {
	try {
		const term = await fetchWpApi<any>(`${endpoint}/${id}`, {
			method: "GET",
			needsAuth: true,
		});

		return formatTermResponse(type, term);
	} catch (error) {
		return formatErrorResponse("获取", type, error);
	}
};

// Register tool with MCP server
export function registerGetTermByIdTool(server: McpServer) {
	server.tool(
		"get-term-by-id",
		{
			type: getTermByIdSchema.shape.type,
			endpoint: getTermByIdSchema.shape.endpoint,
			id: getTermByIdSchema.shape.id,
		},
		getTermByIdHandler,
	);

	return server;
}
