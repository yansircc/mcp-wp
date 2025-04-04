import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
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

// Convenience function to convert USD to CNY
export function convertUsdToCny(amount: number): number {
	return amount * USD_TO_CNY_RATE;
}

// Check if this is being run directly or imported as a module
const isMainModule = process.argv[1] === import.meta.url.substring(7);

// Start the server if this is the main module
if (isMainModule) {
	console.log("Starting Currency Converter MCP server...");
	const transport = new StdioServerTransport();
	server.connect(transport).catch((error) => {
		console.error("Error running server:", error);
		process.exit(1);
	});
}

// Export for programmatic usage
export { server, USD_TO_CNY_RATE };
