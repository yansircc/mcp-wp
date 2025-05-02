import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerListMediaTool } from './list-media.js';
import { registerGetMediaByIdTool } from './get-media-by-id.js';
import { registerCreateMediaTool } from './create-media.js';
import { registerUpdateMediaTool } from './update-media.js';
import { registerDeleteMediaTool } from './delete-media.js';
import { registerEditMediaMetadataTool } from './edit-media-metadata.js';

export * from './types.js';

export function registerMediaTools(server: McpServer): McpServer {
  return registerEditMediaMetadataTool(
    registerDeleteMediaTool(
      registerUpdateMediaTool(
        registerCreateMediaTool(
          registerGetMediaByIdTool(registerListMediaTool(server))
        )
      )
    )
  );
}
