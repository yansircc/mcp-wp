# MCP Currency Converter

A simple Model Context Protocol (MCP) server that provides a USD to CNY currency conversion tool with a fixed exchange rate of 7.3.

## Installation

```bash
# Using npm
npm install mcp-currency-converter

# Using yarn
yarn add mcp-currency-converter

# Using bun
bun install mcp-currency-converter
```

## Using as a dependency

```typescript
// Import the server
import { server } from "mcp-currency-converter";

// Connect to your own transport
import { YourTransport } from "./your-transport.js";
const transport = new YourTransport();
await server.connect(transport);

// Or use programmatically
const toolResponse = await server.callTool("usd-to-cny", { amount: 100 });
console.log(toolResponse);
```

## Building

```bash
bun run build
```

## Running

### Stdio Mode (Command Line)

```bash
bun start
```

### HTTP Server Mode

This mode exposes the MCP server over HTTP with Server-Sent Events (SSE):

```bash
bun run start:http
```

The server will run on port 3000 by default. You can set a different port using the PORT environment variable:

```bash
PORT=8080 bun run start:http
```

Endpoints:
- SSE Connection: `GET /sse`
- Message Endpoint: `POST /messages?sessionId=<your-session-id>`

## Usage

This MCP server provides a single tool:

### usd-to-cny

Converts a USD amount to CNY using a fixed exchange rate of 7.3.

**Parameters:**
- `amount`: A positive number representing the USD amount to convert

**Example Response:**
```
100 USD = 730.00 CNY (rate: 7.3)
```

## Testing with MCP Inspector

You can test this server using the [MCP Inspector](https://github.com/modelcontextprotocol/inspector). Run the server and then connect the inspector to it.

### Testing Stdio Mode

1. Start the server: `bun start`
2. Open the MCP Inspector
3. Select the server type (localhost stdio)
4. Connect to the server
5. Use the "Call Tool" tab to test the usd-to-cny tool

### Testing HTTP Mode

1. Start the HTTP server: `bun run start:http`
2. Open the MCP Inspector
3. Select the server type (HTTP with SSE)
4. Set the SSE URL to `http://localhost:3000/sse`
5. Set the Message URL to `http://localhost:3000/messages`
6. Connect to the server
7. Use the "Call Tool" tab to test the usd-to-cny tool

## License

MIT 