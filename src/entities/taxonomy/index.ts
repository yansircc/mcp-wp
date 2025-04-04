import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerBulkCreateTermsTool } from "./bulk-create-terms.js";
import { registerBulkDeleteTermsTool } from "./bulk-delete-terms.js";
import { registerCreateTermTool } from "./create-term.js";
import { registerDeleteTermTool } from "./delete-term.js";
import { registerGetTermByIdTool } from "./get-term-by-id.js";
import { registerGetTermBySlugTool } from "./get-term-by-slug.js";
import { registerListTaxonomiesTool } from "./list-taxonomies.js";
import { registerListTermsTool } from "./list-terms.js";
import { registerQueryTermsTool } from "./query-terms.js";
import { registerUpdateTermTool } from "./update-term.js";

// Collection of all taxonomy tool registrators
const taxonomyToolRegistrators = {
	listTaxonomies: registerListTaxonomiesTool,
	listTerms: registerListTermsTool,
	getTerm: registerGetTermByIdTool,
	getTermBySlug: registerGetTermBySlugTool,
	createTerm: registerCreateTermTool,
	updateTerm: registerUpdateTermTool,
	deleteTerm: registerDeleteTermTool,
	bulkCreateTerms: registerBulkCreateTermsTool,
	bulkDeleteTerms: registerBulkDeleteTermsTool,
	queryTerms: registerQueryTermsTool,
};

// Register all taxonomy-related tools
export function registerTaxonomyTools(server: McpServer): McpServer {
	// Apply all registrators to the server
	for (const registrator of Object.values(taxonomyToolRegistrators)) {
		registrator(server);
	}
	return server;
}

// Register specific taxonomy tools
export function registerSpecificTaxonomyTools(
	server: McpServer,
	toolNames: Array<keyof typeof taxonomyToolRegistrators>,
): McpServer {
	for (const name of toolNames) {
		const registrator = taxonomyToolRegistrators[name];
		registrator(server);
	}
	return server;
}

// Export all tools for individual use
export * from "./list-taxonomies.js";
export * from "./list-terms.js";
export * from "./get-term-by-id.js";
export * from "./get-term-by-slug.js";
export * from "./create-term.js";
export * from "./update-term.js";
export * from "./delete-term.js";
export * from "./bulk-create-terms.js";
export * from "./bulk-delete-terms.js";
export * from "./query-terms.js";

// Export tool registrators collection
export { taxonomyToolRegistrators };
