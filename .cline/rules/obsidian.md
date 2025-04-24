# Obsidian Plugin向けのAPIとデザイントークン

## API
node_modules/obsidian.d.tsをもとに利用すべきAPIを判断する

下記は頻出のAPI
#### コア
- **`App`** — Vault や Workspace などアプリ全体の状態にアクセスする入口。
- **`Plugin`** — `main.ts` で継承して実装するメインクラス（`onload()` / `onunload()`、各種ヘルパーが利用可）。
- **`Workspace`** — ペイン（ビュー）の管理、アクティブビュー取得、リボンアイコン追加など。
- **`Vault`** — ファイル／フォルダ（`TFile` / `TFolder`）の CRUD。
- `MetadataCache` — 見出し・タグなどのインメモリ解析結果を取得。
- `FileManager` — ファイル操作の高レベル API（ゴミ箱送り、添付保存など）。

#### UI コンポーネント
- **`Modal`** / `SuggestModal<T>` / `FuzzySuggestModal<T>` — モーダル／サジェスト UI を簡単に実装。
- **`AbstractInputSuggest<T>`**（詳細は後述） — 入力欄にオートコンプリートを追加する汎用ベースクラス。
- `PopoverSuggest<T>` — サジェスト UI のさらに低レイヤー基底クラス。
- `SettingTab` / `Setting` / `ButtonComponent` / `ToggleComponent` など — 設定画面用 UI。
- `Component` / `BaseComponent` — ライフサイクル管理（`load` / `unload`）と子コンポーネントのツリー管理に便利。

#### エディタ関連
- **`MarkdownView`** — アクティブな Markdown ビュー。`view.editor` で CodeMirror ラッパー `Editor` にアクセス。
- `Editor` — テキスト挿入・削除・選択取得・スクロール制御など。
- `EditorSuggest<T>` — Markdown エディタ用の自動補完プラグインを実装する際に使用。

#### イベント／キーボード
- `Keymap` — グローバルショートカット定義。
- `Scope` — フォーカス中コンポーネントごとのキーバインド分離。
- `EventRef` — `registerEvent()` で返るハンドラ参照。プラグイン unload 時に自動で解除。
