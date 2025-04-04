import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import express, { type Request, type Response } from "express";
import { z } from "zod";

// Fixed exchange rate: 1 USD = 7.3 CNY
const USD_TO_CNY_RATE = 7.3;

// Create the MCP server
const server = new McpServer({
	name: "Currency Converter",
	version: "1.0.0",
});

// Add USD to CNY conversion tool
server.tool(
	"usd-to-cny",
	{ amount: z.number().positive() },
	async ({ amount }: { amount: number }) => {
		const convertedAmount = amount * USD_TO_CNY_RATE;

		return {
			content: [
				{
					type: "text",
					text: `${amount} USD = ${convertedAmount.toFixed(2)} CNY (rate: ${USD_TO_CNY_RATE})`,
				},
			],
		};
	},
);

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
