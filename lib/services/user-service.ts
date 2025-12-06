import { User } from "@/types";
import { readJsonFile, updateJsonFile } from "@/lib/utils/storage";
import bcrypt from "bcryptjs";

const USER_FILE = "users.json";

/**
 * すべてのユーザーを取得する
 */
export async function getAllUsers(): Promise<User[]> {
  return await readJsonFile<User>(USER_FILE);
}

/**
 * IDでユーザーを取得する
 */
export async function getUserById(id: string): Promise<User | null> {
  const users = await readJsonFile<User>(USER_FILE);
  return users.find((u) => u.id === id) || null;
}

/**
 * メールアドレスでユーザーを取得する
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  const users = await readJsonFile<User>(USER_FILE);
  return users.find((u) => u.email === email) || null;
}

/**
 * パスワードを検証する
 */
export async function verifyPassword(
  password: string,
  passwordHash: string
): Promise<boolean> {
  return await bcrypt.compare(password, passwordHash);
}

/**
 * パスワードをハッシュ化する
 */
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

/**
 * 新規ユーザーを作成する
 */
export async function createUser(
  name: string,
  email: string,
  password: string,
  role: "user" | "admin" = "user"
): Promise<User> {
  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    throw new Error("このメールアドレスは既に登録されています");
  }

  const passwordHash = await hashPassword(password);
  const newUser: User = {
    id: crypto.randomUUID(),
    name,
    email,
    role,
    passwordHash,
  };

  await updateJsonFile<User>(USER_FILE, (users) => [...users, newUser]);
  return newUser;
}

/**
 * ユーザーのパスワードを更新する
 */
export async function updatePassword(
  userId: string,
  newPassword: string
): Promise<void> {
  const passwordHash = await hashPassword(newPassword);
  await updateJsonFile<User>(USER_FILE, (users) =>
    users.map((user) =>
      user.id === userId ? { ...user, passwordHash } : user
    )
  );
}
