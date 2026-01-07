import { App, Notice, TFile } from "obsidian";
import * as fs from "fs";
import * as path from "path";

import { extractImageLinks, replaceAllLiteral, rewriteImageLink } from "./imageLinks";
import type { HugoExportSettings } from "../settings";

function isExternalOrDataLink(link: string): boolean {
	const s = link.trim().toLowerCase();
	return s.startsWith("http://") || s.startsWith("https://") || s.startsWith("data:");
}

function getNextFolderIndex(hugoContentPath: string): number {
	try {
		if (!fs.existsSync(hugoContentPath)) return 1;
		const entries = fs.readdirSync(hugoContentPath, { withFileTypes: true });
		let max = 0;
		for (const ent of entries) {
			if (!ent.isDirectory()) continue;
			const name = ent.name;
			// Accept: 01_xxx, 01-xxx, 01.xxx, 01 xxx ...
			const m = /^(\d+)[^0-9]/.exec(name);
			if (!m) continue;
			const n = Number.parseInt(m[1] ?? "", 10);
			if (!Number.isFinite(n)) continue;
			if (n > max) max = n;
		}
		return max + 1;
	} catch {
		return 1;
	}
}

function formatFolderIndex(n: number, digits: number): string {
	const d = Math.min(6, Math.max(1, digits));
	return String(Math.max(0, n)).padStart(d, "0");
}

function computeTargetFolderName(noteName: string, settings: HugoExportSettings): string {
	if (!settings.enableFolderIndexPrefix) return noteName;
	const next = getNextFolderIndex(settings.hugoContentPath);
	const sep = settings.folderIndexSeparator && settings.folderIndexSeparator.trim() !== "" ? settings.folderIndexSeparator : "_";
	const prefix = formatFolderIndex(next, settings.folderIndexDigits);
	return `${prefix}${sep}${noteName}`;
}

export async function exportCurrentNoteToHugo(app: App, settings: HugoExportSettings): Promise<void> {
	const activeFile = app.workspace.getActiveFile();
	if (!activeFile) {
		new Notice("No note is open.");
		return;
	}
	if (!(activeFile instanceof TFile) || activeFile.extension.toLowerCase() !== "md") {
		new Notice("The active file is not a Markdown note.");
		return;
	}
	if (!settings.hugoContentPath || settings.hugoContentPath.trim() === "") {
		new Notice("Please set the hugo content path in settings.");
		return;
	}

	await exportNoteFileToHugo(app, activeFile, settings);
	new Notice("Export succeeded.");
}

export async function exportNoteFileToHugo(app: App, file: TFile, settings: HugoExportSettings): Promise<void> {
	const content = await app.vault.read(file);
	const noteName = file.basename;

	const folderName = computeTargetFolderName(noteName, settings);
	const targetDir = path.join(settings.hugoContentPath, folderName);
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
			fs.writeFileSync(targetImgPath, new Uint8Array(imgBuffer));
			writtenTargets.add(targetImgPath);
		}

		const rewritten = rewriteImageLink(link.original, link.pathRaw, imgFile.name);
		modifiedContent = replaceAllLiteral(modifiedContent, link.original, rewritten);
	}

	const targetFile = path.join(targetDir, "index.md");
	fs.writeFileSync(targetFile, modifiedContent, "utf-8");
}


