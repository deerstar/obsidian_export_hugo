export type ImageLink = {
	original: string;
	pathRaw: string;
	pathForResolve: string;
};

function stripWikiAliasAndAnchor(pathRaw: string): string {
	const beforeAlias = pathRaw.split("|")[0] ?? pathRaw;
	const beforeAnchor = beforeAlias.split("#")[0] ?? beforeAlias;
	return beforeAnchor.trim();
}

export function extractImageLinks(markdown: string): ImageLink[] {
	const links: ImageLink[] = [];

	// Markdown image: ![alt](path ...optionalTitle)
	// - Supports both ![](path) and ![](<path with spaces>)
	const mdAngle = /!\[[^\]]*?\]\(\s*<([^>]+)>\s*([^)]*)\)/g;
	let match: RegExpExecArray | null;
	while ((match = mdAngle.exec(markdown)) !== null) {
		const pathRaw = (match[1] ?? "").trim();
		links.push({
			original: match[0],
			pathRaw,
			pathForResolve: stripWikiAliasAndAnchor(pathRaw),
		});
	}

	const mdNormal = /!\[[^\]]*?\]\(\s*([^\s)]+)\s*([^)]*)\)/g;
	while ((match = mdNormal.exec(markdown)) !== null) {
		const pathRaw = (match[1] ?? "").trim();
		links.push({
			original: match[0],
			pathRaw,
			pathForResolve: stripWikiAliasAndAnchor(pathRaw),
		});
	}

	// Obsidian embed (wikilink): ![[image.png]] or ![[image.png|alias]]
	const wiki = /!\[\[(.*?)\]\]/g;
	while ((match = wiki.exec(markdown)) !== null) {
		const pathRaw = (match[1] ?? "").trim();
		links.push({
			original: match[0],
			pathRaw,
			pathForResolve: stripWikiAliasAndAnchor(pathRaw),
		});
	}

	return links;
}

export function rewriteImageLink(original: string, pathRaw: string, newFileName: string): string {
	// Replace only the file path portion we parsed; keep any alias/anchor/title portion intact.
	return original.replace(pathRaw, newFileName);
}

export function replaceAllLiteral(haystack: string, needle: string, replacement: string): string {
	if (needle === "") return haystack;
	return haystack.split(needle).join(replacement);
}


