import { App, PluginSettingTab, Setting } from "obsidian";
import HugoExportPlugin from "./main";

export interface HugoExportSettings {
	hugoContentPath: string;
	enableFolderIndexPrefix: boolean;
	folderIndexDigits: number;
	folderIndexSeparator: string;
}

export const DEFAULT_SETTINGS: HugoExportSettings = {
	hugoContentPath: "",
	enableFolderIndexPrefix: false,
	folderIndexDigits: 2,
	folderIndexSeparator: "_",
};

export class HugoExportSettingTab extends PluginSettingTab {
	plugin: HugoExportPlugin;

	constructor(app: App, plugin: HugoExportPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl).setName("Export").setHeading();

		new Setting(containerEl)
			.setName("Hugo content path")
			.setDesc("For example, d:\\myblog\\content\\2025\\ or /path/to/hugo/content/2025/ (ending slash recommended).")
			.addText((text) =>
				text
					.setPlaceholder("Enter hugo content path")
					.setValue(this.plugin.settings.hugoContentPath)
					.onChange(async (value) => {
						this.plugin.settings.hugoContentPath = value.trim();
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Auto numeric prefix for folder name")
			.setDesc("Scans existing subfolders and uses the next index (max + 1), e.g. 01_mynote.")
			.addToggle((toggle) =>
				toggle.setValue(this.plugin.settings.enableFolderIndexPrefix).onChange(async (value) => {
					this.plugin.settings.enableFolderIndexPrefix = value;
					await this.plugin.saveSettings();
				})
			);

		new Setting(containerEl)
			.setName("Index digits (zero padded)")
			.setDesc("Example: 2 digits -> 01, 02; 3 digits -> 001, 002.")
			.addText((text) =>
				text
					.setPlaceholder("2")
					.setValue(String(this.plugin.settings.folderIndexDigits))
					.onChange(async (value) => {
						const n = Number.parseInt(value, 10);
						if (!Number.isFinite(n)) return;
						this.plugin.settings.folderIndexDigits = Math.min(6, Math.max(1, n));
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Index separator")
			.setDesc("Separator between the index and note name, e.g. '_' or '-'.")
			.addText((text) =>
				text
					.setPlaceholder("_")
					.setValue(this.plugin.settings.folderIndexSeparator)
					.onChange(async (value) => {
						this.plugin.settings.folderIndexSeparator = value || "_";
						await this.plugin.saveSettings();
					})
			);
	}
}
