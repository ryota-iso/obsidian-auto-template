import {
  App,
  ButtonComponent,
  Modal,
  Notice,
  Plugin,
  PluginSettingTab,
  Setting,
  TFile,
  TFolder,
} from "obsidian";

interface AutoTemplateSettings {
  templatePath: string;
  enabled: boolean;
}

const DEFAULT_SETTINGS: AutoTemplateSettings = {
  templatePath: "",
  enabled: true,
};

export default class AutoTemplatePlugin extends Plugin {
  settings: AutoTemplateSettings;

  async onload() {
    console.log("[Auto Template] Loading Auto Template plugin");
    await this.loadSettings();

    // 設定タブを追加
    this.addSettingTab(new AutoTemplateSettingTab(this.app, this));

    // ファイル作成イベントを監視
    this.registerEvent(
      this.app.vault.on("create", (file) => {
        if (file instanceof TFile && file.extension === "md") {
          this.applyTemplateToNewFile(file);
        }
      }),
    );
  }

  onunload() {
    console.log("[Auto Template] Unloading Auto Template plugin");
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  /**
   * ファイルにテンプレートを適用
   * @param file 対象ファイル
   * @param forceApply 強制適用フラグ（trueの場合、ファイルが空でなくても適用）
   */
  async applyTemplateToNewFile(file: TFile, forceApply = false) {
    if (!this.settings.enabled) return;

    if (!this.settings.templatePath) {
      new Notice("テンプレートが選択されていません。設定から選択してください。");
      return;
    }

    try {
      const templateContent = await this.getTemplateContents(this.settings.templatePath);
      if (!templateContent) {
        return;
      }

      // テンプレート変数を処理
      const processedContent = this.processTemplateVariables(templateContent);

      const fileContent = await this.app.vault.read(file);

      if (fileContent.trim() === "" || forceApply) {
        await this.app.vault.modify(file, processedContent);
        new Notice("テンプレートを適用しました");
      }
    } catch (error) {
      console.error("[Auto Template] Error applying template:", error);
      new Notice("テンプレート適用中にエラーが発生しました");
    }
  }

  /**
   * テンプレート内の変数を処理
   */
  processTemplateVariables(templateContent: string): string {
    // 日付変数を処理
    templateContent = this.processDateVariables(templateContent);

    // 将来的に他の変数タイプも追加可能

    return templateContent;
  }

  /**
   * テンプレート内の日付変数を処理
   */
  processDateVariables(templateContent: string): string {
    const dateRegex = /{{date:([^}]*)}}/g;
    const now = new Date();
    return templateContent.replace(dateRegex, (match, format) => {
      return this.formatDate(now, format);
    });
  }

  /**
   * 日付をフォーマット
   */
  formatDate(date: Date, format: string): string {
    // 年のフォーマット
    format = format.replace(/YYYY/g, date.getFullYear().toString());
    format = format.replace(/YY/g, date.getFullYear().toString().slice(-2));

    // 月のフォーマット
    format = format.replace(/MM/g, (date.getMonth() + 1).toString().padStart(2, "0"));
    format = format.replace(/M/g, (date.getMonth() + 1).toString());

    // 日のフォーマット
    format = format.replace(/DD/g, date.getDate().toString().padStart(2, "0"));
    format = format.replace(/D/g, date.getDate().toString());

    // 時間のフォーマット
    format = format.replace(/HH/g, date.getHours().toString().padStart(2, "0"));
    format = format.replace(/H/g, date.getHours().toString());
    format = format.replace(/hh/g, (date.getHours() % 12 || 12).toString().padStart(2, "0"));
    format = format.replace(/h/g, (date.getHours() % 12 || 12).toString());

    // 分と秒のフォーマット
    format = format.replace(/mm/g, date.getMinutes().toString().padStart(2, "0"));
    format = format.replace(/m/g, date.getMinutes().toString());
    format = format.replace(/ss/g, date.getSeconds().toString().padStart(2, "0"));
    format = format.replace(/s/g, date.getSeconds().toString());

    // 午前/午後
    format = format.replace(/a/g, date.getHours() < 12 ? "午前" : "午後");
    format = format.replace(/A/g, date.getHours() < 12 ? "AM" : "PM");

    // 曜日
    const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
    const weekdaysEn = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const weekdaysShortEn = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    format = format.replace(/dddd/g, weekdaysEn[date.getDay()]);
    format = format.replace(/ddd/g, weekdaysShortEn[date.getDay()]);
    format = format.replace(/dd/g, weekdays[date.getDay()]);

    // 日本語表記
    format = format.replace(/年/g, date.getFullYear().toString() + "年");
    format = format.replace(/月/g, (date.getMonth() + 1).toString() + "月");
    format = format.replace(/日/g, date.getDate().toString() + "日");
    format = format.replace(/曜/g, weekdays[date.getDay()] + "曜日");

    return format;
  }

  /**
   * テンプレートファイルの一覧を取得
   */
  getTemplateFiles(): TFile[] {
    const templateFolder = this.getTemplateFolder();
    if (!templateFolder || !(templateFolder instanceof TFolder)) {
      return [];
    }

    const files: TFile[] = [];
    const folderContents = templateFolder.children;

    for (const item of folderContents) {
      if (item instanceof TFile && item.extension === "md") {
        files.push(item);
      }
    }

    return files;
  }

  /**
   * テンプレートフォルダを取得
   */
  getTemplateFolder(): TFolder | null {
    const templateFolderPath = this.getTemplateFolderPath();
    if (!templateFolderPath) {
      return null;
    }

    const folder = this.app.vault.getAbstractFileByPath(templateFolderPath);
    return folder instanceof TFolder ? folder : null;
  }

  /**
   * テンプレートフォルダのパスを取得
   */
  getTemplateFolderPath(): string | null {
    // @ts-ignore - Obsidianの内部APIにアクセス
    const templatePlugin = this.app.internalPlugins.plugins["templates"];
    if (templatePlugin && templatePlugin.enabled) {
      // @ts-ignore - テンプレートプラグインの設定にアクセス
      const templateSettings = templatePlugin.instance.options;
      return templateSettings.folder;
    }

    return null;
  }

  /**
   * テンプレートの内容を取得
   */
  async getTemplateContents(templatePath: string): Promise<string | null> {
    try {
      const templateFile = this.app.vault.getAbstractFileByPath(templatePath);
      if (templateFile instanceof TFile) {
        return await this.app.vault.read(templateFile);
      }
      return null;
    } catch (error) {
      console.error("[Auto Template] Error reading template:", error);
      new Notice("テンプレートの読み込みに失敗しました");
      return null;
    }
  }
}

/**
 * 確認ダイアログ用のモーダル
 */
class ConfirmationModal extends Modal {
  private result: (confirmed: boolean) => void;
  private message: string;

  constructor(app: App, message: string, result: (confirmed: boolean) => void) {
    super(app);
    this.message = message;
    this.result = result;
  }

  onOpen() {
    const { contentEl } = this;

    contentEl.createEl("h2", { text: "確認" });
    contentEl.createEl("p", { text: this.message });

    const buttonContainer = contentEl.createDiv();
    buttonContainer.addClass("auto-template-modal-buttons");

    // キャンセルボタン
    new ButtonComponent(buttonContainer).setButtonText("キャンセル").onClick(() => {
      this.result(false);
      this.close();
    });

    // 確認ボタン
    new ButtonComponent(buttonContainer)
      .setButtonText("OK")
      .setCta() // Call to Action スタイルを適用
      .onClick(() => {
        this.result(true);
        this.close();
      });
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}

class AutoTemplateSettingTab extends PluginSettingTab {
  plugin: AutoTemplatePlugin;

  constructor(app: App, plugin: AutoTemplatePlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();
    containerEl.addClass("auto-template-settings");

    containerEl.createEl("h2", { text: "Auto Template 設定" });

    new Setting(containerEl)
      .setName("有効化")
      .setDesc("プラグインを有効または無効にします")
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.enabled).onChange(async (value) => {
          this.plugin.settings.enabled = value;
          await this.plugin.saveSettings();
        }),
      );

    this.createTemplateSelector(containerEl);
  }

  /**
   * テンプレート選択用のドロップダウンを作成
   */
  createTemplateSelector(containerEl: HTMLElement) {
    const templateFiles = this.plugin.getTemplateFiles();
    const templateFolderPath = this.plugin.getTemplateFolderPath();

    if (!templateFolderPath) {
      new Setting(containerEl)
        .setName("テンプレートフォルダが設定されていません")
        .setDesc(
          "Obsidianの設定でテンプレートフォルダを設定してください。" +
            "コアプラグインの「テンプレート」またはコミュニティプラグインの「Templater」が必要です。",
        );
      return;
    }

    if (templateFiles.length === 0) {
      new Setting(containerEl)
        .setName("テンプレートが見つかりません")
        .setDesc(
          `テンプレートフォルダ (${templateFolderPath}) にテンプレートファイルを追加してください。`,
        );
      return;
    }

    new Setting(containerEl)
      .setName("テンプレート")
      .setDesc("新規ノート作成時に適用するテンプレートを選択")
      .addDropdown((dropdown) => {
        dropdown.addOption("", "テンプレートを選択");

        for (const templateFile of templateFiles) {
          dropdown.addOption(templateFile.path, templateFile.basename);
        }

        dropdown.setValue(this.plugin.settings.templatePath);
        dropdown.onChange(async (value) => {
          this.plugin.settings.templatePath = value;
          await this.plugin.saveSettings();
        });
      });
  }
}
