import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const PLUGIN_ID = "exporthugo";

const rootDir = process.cwd();
const outDir = path.join(rootDir, "release", PLUGIN_ID);

const filesToCopy = ["main.js", "manifest.json", "styles.css"];

fs.mkdirSync(outDir, { recursive: true });

for (const fileName of filesToCopy) {
	const src = path.join(rootDir, fileName);
	const dst = path.join(outDir, fileName);

	if (!fs.existsSync(src)) {
		throw new Error(`Missing required file: ${fileName}. Did you run "npm run build" first?`);
	}

	fs.copyFileSync(src, dst);
}

console.log(`Packaged plugin to: ${outDir}`);


