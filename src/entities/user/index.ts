import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerCreateUserTool } from "./create-user.js";
import { registerDeleteUserTool } from "./delete-user.js";
import { registerGetUserTool } from "./get-user.js";
import { registerListUsersTool } from "./list-users.js";
import { registerUpdateUserTool } from "./update-user.js";

// Register all user tools
export function registerUserTools(server: McpServer) {
	registerListUsersTool(server);
	registerGetUserTool(server);
	registerCreateUserTool(server);
	registerUpdateUserTool(server);
	registerDeleteUserTool(server);

	return server;
}
