import * as v from 'valibot';

/**
 * 備品作成・更新時のバリデーションスキーマ
 * Feature: company-equipment-management, Property 2: 必須フィールドバリデーション
 */
export const EquipmentSchema = v.object({
  name: v.pipe(
    v.string('備品名は文字列である必要があります'),
    v.trim(),
    v.minLength(1, '備品名は必須です'),
    v.maxLength(100, '備品名は100文字以内である必要があります')
  ),
  category: v.pipe(
    v.string('カテゴリは文字列である必要があります'),
    v.trim(),
    v.minLength(1, 'カテゴリは必須です'),
    v.maxLength(50, 'カテゴリは50文字以内である必要があります')
  ),
  description: v.pipe(
    v.string('説明は文字列である必要があります'),
    v.maxLength(500, '説明は500文字以内である必要があります')
  ),
  totalQuantity: v.pipe(
    v.number('数量は数値である必要があります'),
    v.integer('数量は整数である必要があります'),
    v.minValue(0, '数量は0以上である必要があります'),
    v.maxValue(10000, '数量は10000以下である必要があります')
  ),
  purchaseDate: v.pipe(
    v.union([v.date(), v.string()], '購入日は日付である必要があります'),
    v.transform((val) => (typeof val === 'string' ? new Date(val) : val)),
    v.maxValue(new Date(), '購入日は未来の日付にできません')
  ),
  usefulLife: v.optional(
    v.pipe(
      v.number('耐用年数は数値である必要があります'),
      v.integer('耐用年数は整数である必要があります'),
      v.minValue(1, '耐用年数は1年以上である必要があります'),
      v.maxValue(100, '耐用年数は100年以下である必要があります')
    )
  ),
});

/**
 * 貸出作成時のバリデーションスキーマ
 */
export const LoanSchema = v.object({
  equipmentId: v.pipe(
    v.string('備品IDは文字列である必要があります'),
    v.uuid('有効な備品IDが必要です')
  ),
  userId: v.pipe(
    v.string('ユーザーIDは文字列である必要があります'),
    v.uuid('有効なユーザーIDが必要です')
  ),
});

/**
 * EquipmentSchema の型を推論
 */
export type EquipmentInput = v.InferInput<typeof EquipmentSchema>;
export type EquipmentOutput = v.InferOutput<typeof EquipmentSchema>;

/**
 * LoanSchema の型を推論
 */
export type LoanInput = v.InferInput<typeof LoanSchema>;
export type LoanOutput = v.InferOutput<typeof LoanSchema>;

/**
 * ログインフォームのバリデーションスキーマ
 */
export const LoginSchema = v.object({
  email: v.pipe(
    v.string('メールアドレスは文字列である必要があります'),
    v.trim(),
    v.email('有効なメールアドレスを入力してください')
  ),
  password: v.pipe(
    v.string('パスワードは文字列である必要があります'),
    v.minLength(8, 'パスワードは8文字以上である必要があります')
  ),
});

/**
 * 新規登録フォームのバリデーションスキーマ
 */
export const RegisterSchema = v.object({
  name: v.pipe(
    v.string('名前は文字列である必要があります'),
    v.trim(),
    v.minLength(1, '名前は必須です'),
    v.maxLength(100, '名前は100文字以内である必要があります')
  ),
  email: v.pipe(
    v.string('メールアドレスは文字列である必要があります'),
    v.trim(),
    v.email('有効なメールアドレスを入力してください')
  ),
  password: v.pipe(
    v.string('パスワードは文字列である必要があります'),
    v.minLength(8, 'パスワードは8文字以上である必要があります'),
    v.maxLength(100, 'パスワードは100文字以内である必要があります')
  ),
  confirmPassword: v.string('確認用パスワードは文字列である必要があります'),
});

/**
 * パスワードリセットフォームのバリデーションスキーマ
 */
export const ResetPasswordSchema = v.object({
  email: v.pipe(
    v.string('メールアドレスは文字列である必要があります'),
    v.trim(),
    v.email('有効なメールアドレスを入力してください')
  ),
  newPassword: v.pipe(
    v.string('新しいパスワードは文字列である必要があります'),
    v.minLength(8, 'パスワードは8文字以上である必要があります'),
    v.maxLength(100, 'パスワードは100文字以内である必要があります')
  ),
  confirmPassword: v.string('確認用パスワードは文字列である必要があります'),
});

/**
 * LoginSchema の型を推論
 */
export type LoginInput = v.InferInput<typeof LoginSchema>;
export type LoginOutput = v.InferOutput<typeof LoginSchema>;

/**
 * RegisterSchema の型を推論
 */
export type RegisterInput = v.InferInput<typeof RegisterSchema>;
export type RegisterOutput = v.InferOutput<typeof RegisterSchema>;

/**
 * ResetPasswordSchema の型を推論
 */
export type ResetPasswordInput = v.InferInput<typeof ResetPasswordSchema>;
export type ResetPasswordOutput = v.InferOutput<typeof ResetPasswordSchema>;
