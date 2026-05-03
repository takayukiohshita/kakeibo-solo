# 家計ノート — ひとり暮らし向け家計管理アプリ

## Vercelへのデプロイ手順

### 1. GitHubにリポジトリを作成
1. https://github.com/new でリポジトリを作成（例: `kakeibo-solo`）
2. 以下のコマンドを実行:

```bash
cd kakeibo-solo
git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin https://github.com/あなたのID/kakeibo-solo.git
git push -u origin main
```

### 2. Vercelにデプロイ
1. https://vercel.com にアクセス（GitHubアカウントでログイン）
2. 「Add New → Project」をクリック
3. 作成したGitHubリポジトリを選択
4. Framework Preset: **Next.js** が自動検出されます
5. 「Deploy」ボタンをクリック
6. 数分でデプロイ完了 → `https://kakeibo-solo.vercel.app` のようなURLが発行されます

### ローカルで動かす場合

```bash
npm install
npm run dev
```

→ http://localhost:3000 でアクセスできます

## データ保存について
- ブラウザの `localStorage` に保存されます
- 同じデバイス・ブラウザで開く限りデータは保持されます
- デバイスをまたいだ同期は対応していません
