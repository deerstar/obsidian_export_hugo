import { App, PluginSettingTab, Setting } from "obsidian";
import HugoExportPlugin from "./main";

export interface HugoExportSettings {
	hugoContentPath: string;
}

export const DEFAULT_SETTINGS: HugoExportSettings = {
	hugoContentPath: "",
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
	}
}
