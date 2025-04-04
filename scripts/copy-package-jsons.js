import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sourceDir = path.join(__dirname, "..", "src", "entities");
const destDir = path.join(__dirname, "..", "dist", "entities");

// Create the destination directory if it doesn't exist
if (!fs.existsSync(destDir)) {
	fs.mkdirSync(destDir, { recursive: true });
}

// Helper function to copy package.json files recursively
function copyPackageJsonFiles(source, dest) {
	const entities = fs.readdirSync(source, { withFileTypes: true });

	for (const entity of entities) {
		const sourcePath = path.join(source, entity.name);
		const destPath = path.join(dest, entity.name);

		if (entity.isDirectory()) {
			// Create destination directory if it doesn't exist
			if (!fs.existsSync(destPath)) {
				fs.mkdirSync(destPath, { recursive: true });
			}

			// Check for package.json in this directory
			const packageJsonPath = path.join(sourcePath, "package.json");
			if (fs.existsSync(packageJsonPath)) {
				fs.copyFileSync(packageJsonPath, path.join(destPath, "package.json"));
				console.log(`Copied package.json to ${destPath}`);
			}

			// Recursively process subdirectories
			copyPackageJsonFiles(sourcePath, destPath);
		}
	}
}

copyPackageJsonFiles(sourceDir, destDir);
console.log("All package.json files copied successfully!");
