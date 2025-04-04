import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.join(__dirname, "..", "src");

// Regex pattern to match relative imports without extensions
const importPattern = /from\s+["'](\.[^"']*?)["']/g;

function processFile(filePath) {
	// Skip non-TypeScript files
	if (!filePath.endsWith(".ts")) return;

	console.log(`Processing ${filePath}`);
	let content = fs.readFileSync(filePath, "utf8");
	let modified = false;

	// Replace all relative imports without extensions
	content = content.replace(importPattern, (match, importPath) => {
		// Skip if already has an extension or is a directory import
		if (importPath.endsWith(".js") || importPath.endsWith("/")) return match;

		modified = true;
		return `from "${importPath}.js"`;
	});

	if (modified) {
		fs.writeFileSync(filePath, content);
		console.log(`  Updated imports in ${filePath}`);
	}
}

function processDirectory(directory) {
	const items = fs.readdirSync(directory, { withFileTypes: true });

	for (const item of items) {
		const fullPath = path.join(directory, item.name);

		if (item.isDirectory()) {
			processDirectory(fullPath);
		} else {
			processFile(fullPath);
		}
	}
}

// Start processing
processDirectory(srcDir);
console.log("Import paths updated successfully!");
