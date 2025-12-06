/**
 * 備品（Equipment）の型定義
 */
export interface Equipment {
  id: string; // 一意のID（UUID）
  name: string; // 備品名（必須）
  category: string; // カテゴリ（必須）
  description: string; // 説明
  totalQuantity: number; // 総数量
  availableQuantity: number; // 利用可能数量
  purchaseDate: Date; // 購入日（必須）
  usefulLife?: number; // 耐用年数（年単位、オプション）
  createdAt: Date; // 登録日時
  updatedAt: Date; // 更新日時
}

/**
 * 貸出記録（Loan）の型定義
 */
export interface Loan {
  id: string; // 一意のID（UUID）
  equipmentId: string; // 備品ID
  userId: string; // ユーザーID
  borrowedAt: Date; // 貸出日時
  returnedAt: Date | null; // 返却日時（未返却の場合null）
  status: "active" | "returned"; // ステータス
}

/**
 * ユーザー（User）の型定義
 */
export interface User {
  id: string; // 一意のID（UUID）
  name: string; // ユーザー名
  email: string; // メールアドレス
  role: "user" | "admin"; // 役割
  passwordHash: string; // パスワードハッシュ
}

/**
 * API エラーレスポンスの型定義
 */
export interface ErrorResponse {
  error: {
    code: string; // エラーコード
    message: string; // ユーザー向けメッセージ
    details?: unknown; // 追加の詳細情報
  };
}

/**
 * API 成功レスポンスの型定義
 */
export interface SuccessResponse<T> {
  data: T;
  message?: string;
}
