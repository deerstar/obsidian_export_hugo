import { Notice, Plugin } from "obsidian";

import { exportCurrentNoteToHugo } from "./hugoExport/exporter";
import { DEFAULT_SETTINGS, HugoExportSettings, HugoExportSettingTab } from "./settings";

export default class HugoExportPlugin extends Plugin {
	settings: HugoExportSettings;

	async onload() {
		await this.loadSettings();

		this.addRibbonIcon("upload", "Export to hugo", async () => {
			await this.runExport();
		});

		this.addCommand({
			id: "export-current-note-to-hugo",
			name: "Export current note to hugo (page bundle)",
			callback: async () => {
				await this.runExport();
			},
		});

		this.addSettingTab(new HugoExportSettingTab(this.app, this));
	}

	private async runExport(): Promise<void> {
		try {
			await exportCurrentNoteToHugo(this.app, this.settings);
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : String(err);
			new Notice("Export failed: " + message);
			console.error(err);
		}
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, (await this.loadData()) as Partial<HugoExportSettings>);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
