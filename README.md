# MealMatch - レシピ発見・献立プランニングアプリ

MealMatchは、ユーザーがレシピを発見し、週間献立を自動生成できるアプリケーションです。

## 特徴

- 🔍 レシピ発見とスワイプ機能
- 📅 自動週間献立生成
- 🛒 ショッピングリスト作成
- 👨‍💼 管理者ダッシュボード
- 🔐 ユーザー認証システム

## 環境設定

### 環境変数

`.env.local` ファイルを作成して以下の環境変数を設定してください：

```env
# Database
DATABASE_URL="file:./dev.db"

# Admin Account Configuration
ADMIN_EMAIL=admin@maalmatch.com
ADMIN_NAME=Administrator
ADMIN_PASSWORD=admin1234
ADMIN_ROLE=admin

# Rakuten API (Optional)
RAKUTEN_APPLICATION_ID=your_rakuten_app_id_here
RAKUTEN_AFFILIATE_ID=your_affiliate_id_here

# Next.js
NEXTAUTH_SECRET=your-nextauth-secret-here
NEXTAUTH_URL=http://localhost:3000
```

### 管理者アカウント設定

管理者アカウントは環境変数で設定できます：

- `ADMIN_EMAIL`: 管理者のメールアドレス（デフォルト: admin@maalmatch.com）
- `ADMIN_NAME`: 管理者の表示名（デフォルト: Administrator）
- `ADMIN_PASSWORD`: 管理者のパスワード（デフォルト: admin1234）
- `ADMIN_ROLE`: 管理者の権限レベル（デフォルト: admin）

⚠️ **セキュリティ**: 本番環境では必ずデフォルトパスワードを変更してください！

## セットアップ手順

1. **依存関係のインストール**
   ```bash
   npm install
   ```

2. **環境変数の設定**
   ```bash
   # .env.localファイルを作成
   cp .env.example .env.local
   # 必要に応じて値を編集
   ```

3. **データベースの初期化**
   ```bash
   npx prisma db push
   npx prisma generate
   ```

4. **管理者ユーザーの作成**
   ```bash
   npm run db:seed
   ```

5. **開発サーバーの起動**
   ```bash
   npm run dev
   ```

## 管理者機能

### アクセス方法
1. 環境変数で設定したadmin情報でログイン
2. ホームページの「管理者ダッシュボード」ボタンをクリック
3. または直接 `/users` にアクセス

### 利用可能な機能
- **概要**: システム統計の表示
- **ユーザー管理**: 全ユーザーの一覧表示・削除
- **レシピ管理**: レシピの追加・削除・一覧表示
  - 個別レシピ追加
  - CSVファイル一括インポート
  - JSONテキスト一括インポート
  - **楽天レシピAPI検索・インポート**
- **アクティビティ監視**: ユーザー活動の監視

### 楽天レシピAPI機能

楽天レシピAPIを使用してリアルタイムでレシピを検索・インポートできます：

#### 設定方法
1. [楽天ウェブサービス](https://webservice.rakuten.co.jp/)でアプリケーションIDを取得
2. 環境変数 `RAKUTEN_APPLICATION_ID` に設定
3. 管理者ダッシュボードの「一括インポート」→「楽天レシピ」タブで利用可能

#### 機能
- **キーワード検索**: 料理名や食材で楽天レシピを検索
- **プレビュー**: 検索結果をサムネイル付きで表示
- **選択インポート**: 必要なレシピのみを選択してインポート
- **重複チェック**: 既存レシピとの重複を自動回避
- **モックデータ**: APIキー未設定時はサンプルデータで動作確認可能

#### 使用方法
1. 管理者ダッシュボード → レシピ管理 → 一括インポート
2. 「楽天レシピ」タブを選択
3. 検索キーワードを入力（例：「唐揚げ」「パスタ」「カレー」）
4. 検索結果から必要なレシピを選択
5. 「インポート」ボタンでデータベースに保存

## API エンドポイント

### 認証
- `POST /api/auth/login` - ログイン
- `POST /api/auth/signup` - ユーザー登録
- `POST /api/auth/logout` - ログアウト
- `GET /api/auth/me` - 現在のユーザー情報

### 管理者専用（要admin権限）
- `GET /api/admin/users` - ユーザー一覧
- `DELETE /api/admin/users/[id]` - ユーザー削除
- `GET /api/admin/recipes` - レシピ一覧
- `POST /api/admin/recipes` - レシピ追加
- `DELETE /api/admin/recipes/[id]` - レシピ削除
- `GET /api/admin/stats` - 統計情報

### レシピ
- `GET /api/recipes/ranking` - 人気レシピ一覧
- `GET /api/saved-recipes` - 保存済みレシピ
- `POST /api/saved-recipes` - レシピ保存

### 献立
- `GET /api/meal-plans` - 献立プラン一覧

## 技術スタック

- **フロントエンド**: Next.js 15, React 19, TypeScript
- **バックエンド**: Next.js API Routes
- **データベース**: SQLite + Prisma ORM
- **認証**: Custom authentication with session management
- **UI**: Tailwind CSS + shadcn/ui components
- **API**: Rakuten Recipe API integration

## デプロイ

### 環境変数の設定
本番環境では以下の環境変数を必ず設定してください：

```env
DATABASE_URL="your_production_database_url"
ADMIN_EMAIL="your_secure_admin_email"
ADMIN_PASSWORD="your_secure_admin_password"
NEXTAUTH_SECRET="your_secure_nextauth_secret"
NEXTAUTH_URL="https://your-domain.com"
```

### セキュリティ考慮事項
- デフォルトのadminパスワードを変更
- 本番環境用の強力なパスワードとシークレットを使用
- HTTPS接続の使用を推奨

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。 