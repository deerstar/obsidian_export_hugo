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

		containerEl.createEl("h2", { text: "Hugo 导出设置" });

		new Setting(containerEl)
			.setName("Hugo content 目录路径")
			.setDesc("例如：D:\\myblog\\content\\2025\\ 或 /path/to/hugo/content/2025/（建议以斜杠结尾）")
			.addText((text) =>
				text
					.setPlaceholder("输入 Hugo content 目录路径")
					.setValue(this.plugin.settings.hugoContentPath)
					.onChange(async (value) => {
						this.plugin.settings.hugoContentPath = value.trim();
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("自动序号前缀（文件夹名）")
			.setDesc("导出时扫描目标目录下已有子文件夹的序号前缀，取最大值 + 1，生成如 01_笔记名 的目录。")
			.addToggle((toggle) =>
				toggle.setValue(this.plugin.settings.enableFolderIndexPrefix).onChange(async (value) => {
					this.plugin.settings.enableFolderIndexPrefix = value;
					await this.plugin.saveSettings();
				})
			);

		new Setting(containerEl)
			.setName("序号位数（补零）")
			.setDesc("例如 2 位：01、02；3 位：001、002。")
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
			.setName("序号分隔符")
			.setDesc("序号与笔记名之间的分隔符，例如 '_' 或 '-'。")
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
