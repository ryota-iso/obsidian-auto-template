# Auto Template

新規に作成した Markdown ノートへ、選択したテンプレートを自動挿入する Obsidian プラグインです。
コア「テンプレート」のフォルダ内からテンプレートを指定し、{{date:YYYY-MM-DD}} などの日付変数を展開して適用します。

### Building the plugin

```bash
# Install dependencies
pnpm install

# Build the plugin
pnpm run build
```

