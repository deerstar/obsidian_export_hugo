import { App, Notice, TFile } from "obsidian";
import * as fs from "fs";
import * as path from "path";

import { extractImageLinks, replaceAllLiteral, rewriteImageLink } from "./imageLinks";

function isExternalOrDataLink(link: string): boolean {
	const s = link.trim().toLowerCase();
	return s.startsWith("http://") || s.startsWith("https://") || s.startsWith("data:");
}

export async function exportCurrentNoteToHugo(app: App, hugoContentPath: string): Promise<void> {
	const activeFile = app.workspace.getActiveFile();
	if (!activeFile) {
		new Notice("没有打开的笔记");
		return;
	}
	if (!(activeFile instanceof TFile) || activeFile.extension.toLowerCase() !== "md") {
		new Notice("当前文件不是 Markdown 笔记");
		return;
	}
	if (!hugoContentPath || hugoContentPath.trim() === "") {
		new Notice("请先在设置中配置 Hugo content 目录路径");
		return;
	}

	await exportNoteFileToHugo(app, activeFile, hugoContentPath);
	new Notice("导出成功！");
}

export async function exportNoteFileToHugo(app: App, file: TFile, hugoContentPath: string): Promise<void> {
	const content = await app.vault.read(file);
	const noteName = file.basename;

	const targetDir = path.join(hugoContentPath, noteName);
	if (!fs.existsSync(targetDir)) {
		fs.mkdirSync(targetDir, { recursive: true });
	}

	const links = extractImageLinks(content);
	let modifiedContent = content;

	const writtenTargets = new Set<string>();

	for (const link of links) {
		if (!link.pathForResolve || isExternalOrDataLink(link.pathForResolve)) continue;

		const imgFile = app.metadataCache.getFirstLinkpathDest(link.pathForResolve, file.path);
		if (!imgFile || !(imgFile instanceof TFile)) continue;

		const targetImgPath = path.join(targetDir, imgFile.name);

		if (!writtenTargets.has(targetImgPath)) {
			const imgBuffer = await app.vault.readBinary(imgFile);
			fs.writeFileSync(targetImgPath, Buffer.from(imgBuffer));
			writtenTargets.add(targetImgPath);
		}

		const rewritten = rewriteImageLink(link.original, link.pathRaw, imgFile.name);
		modifiedContent = replaceAllLiteral(modifiedContent, link.original, rewritten);
	}

	const targetFile = path.join(targetDir, "index.md");
	fs.writeFileSync(targetFile, modifiedContent, "utf-8");
}


