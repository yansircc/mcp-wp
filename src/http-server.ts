import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import express, { type Request, type Response } from "express";
import { registerAllTools } from "./entities/index.js";

// Create the MCP server
const server = new McpServer({
	name: "WordPress",
	version: "1.0.0",
});

// Add WordPress tools
registerAllTools(server);

// Setup Express server with SSE
const app = express();
const PORT = process.env.PORT || 3000;

// Store active transports by session ID
const transports: Record<string, SSEServerTransport> = {};

app.get("/sse", async (_: Request, res: Response) => {
	const transport = new SSEServerTransport("/messages", res);
	transports[transport.sessionId] = transport;

	res.on("close", () => {
		delete transports[transport.sessionId];
	});

	await server.connect(transport);
});

app.post("/messages", async (req: Request, res: Response) => {
	const sessionId = req.query.sessionId as string;
	const transport = transports[sessionId];

	if (transport) {
		await transport.handlePostMessage(req, res);
	} else {
		res.status(400).send("No transport found for sessionId");
	}
});

app.listen(PORT, () => {
	console.log(`HTTP server running on port ${PORT}`);
});
