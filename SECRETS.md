# GitHub Secrets Setup

このアプリケーションをGitHub Pagesにデプロイするには、以下のSecretsをリポジトリに設定する必要があります。

## 必要なSecrets

GitHubリポジトリの「Settings」→「Secrets and variables」→「Actions」から以下を設定してください:

1. **VITE_API_KEY**
   - Google Gemini APIキー
   - 既存の設定

2. **VITE_GOOGLE_SEARCH_API_KEY**
   - Google Custom Search API キー
   - [Google Cloud Console](https://console.cloud.google.com/)で取得

3. **VITE_GOOGLE_SEARCH_ENGINE_ID**
   - Programmable Search Engine ID
   - [Programmable Search Engine](https://programmablesearchengine.google.com/)で作成

## ローカル開発環境

ローカルで開発する場合は、プロジェクトルートに `.env` ファイルを作成し、以下の内容を記述してください:

```
VITE_API_KEY=your_gemini_api_key_here
VITE_GOOGLE_SEARCH_API_KEY=your_google_custom_search_api_key_here
VITE_GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id_here
```

`.env.example` をコピーして使用することもできます。
