// 脚本用于生成dist目录下的package.json文件
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 读取主package.json文件
const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));

// 创建dist目录的package.json
const distPackageJson = {
	type: "module",
	exports: {
		".": "./index.js",
		"./server": "./index.js",
		"./entities/*": "./entities/*.js",
		"./lib/*": "./lib/*.js",
	},
};

// 确保dist目录存在
if (!fs.existsSync("dist")) {
	fs.mkdirSync("dist");
}

// 写入dist/package.json
fs.writeFileSync(
	path.join("dist", "package.json"),
	JSON.stringify(distPackageJson, null, 2),
);

console.log("生成 dist/package.json 成功");
