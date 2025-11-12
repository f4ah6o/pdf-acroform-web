# PDF AcroForm Web Editor

PDFのAcroFormフィールドを読み込み、Webフォームとして入力し、入力内容を反映したPDFをダウンロードできるシングルページアプリケーション（SPA）です。

## 機能

- ✨ PDFファイルのドラッグ&ドロップアップロード
- 📝 AcroFormフィールドの自動検出と抽出
- 🎨 動的なWebフォームの生成
- ✅ テキスト、チェックボックス、ドロップダウンなど複数のフィールドタイプに対応
- 💾 入力内容を反映したPDFのダウンロード
- 📱 レスポンシブデザイン

## 技術スタック

- **フロントエンド**: Vanilla JavaScript (ES Modules)
- **PDFライブラリ**: [pdf-lib](https://pdf-lib.js.org/) v1.17.1
- **ビルドツール**: Vite v5.0
- **スタイリング**: CSS3

## セットアップ

### 前提条件

- Node.js (v16以上推奨)
- npm または yarn

### インストール

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# 本番ビルド
npm run build

# 本番ビルドのプレビュー
npm run preview
```

## 使い方

1. **PDFのアップロード**
   - 「PDFファイルを選択またはドラッグ&ドロップ」エリアをクリックしてファイルを選択
   - またはPDFファイルをドラッグ&ドロップ

2. **フォームの入力**
   - PDFから抽出されたフォームフィールドが自動的に表示されます
   - 各フィールドに必要な情報を入力

3. **PDFのダウンロード**
   - 「PDFをダウンロード」ボタンをクリック
   - 入力内容が反映されたPDFがダウンロードされます

## 対応フィールドタイプ

- ✅ テキストフィールド (PDFTextField)
- ✅ チェックボックス (PDFCheckBox)
- ✅ ドロップダウン (PDFDropdown)
- ✅ ラジオボタン (PDFRadioGroup)
- ⚠️ ボタンフィールドは表示のみ

## プロジェクト構造

```
pdf-acroform-web/
├── index.html          # メインHTMLファイル
├── main.js             # アプリケーションロジック
├── style.css           # スタイルシート
├── package.json        # プロジェクト設定
└── README.md           # このファイル
```

## 主要な関数

### main.js

- `loadPDF(file)`: PDFファイルを読み込み、AcroFormを抽出
- `extractFormFields(form)`: フォームフィールドを解析してデータ化
- `renderForm()`: 動的にWebフォームを生成
- `handleDownload()`: 入力内容を反映したPDFを生成してダウンロード

## 注意事項

- このアプリケーションはブラウザ上でのみ動作し、サーバーへのアップロードは行いません
- すべての処理はクライアント側で完結するため、プライバシーが保護されます
- AcroFormフィールドを持たないPDFには対応していません

## トラブルシューティング

### PDFにフォームが表示されない

- PDFにAcroFormフィールドが含まれているか確認してください
- Adobe Acrobatなどで「フォームを準備」機能を使用してフォームフィールドを作成できます

### ダウンロードしたPDFが開けない

- pdf-libのバージョンを確認してください
- ブラウザのコンソールでエラーメッセージを確認してください

## ライセンス

ISC

## 貢献

プルリクエストを歓迎します。大きな変更の場合は、まずissueを開いて変更内容を議論してください。

## 参考リンク

- [pdf-lib Documentation](https://pdf-lib.js.org/)
- [Vite Documentation](https://vitejs.dev/)
