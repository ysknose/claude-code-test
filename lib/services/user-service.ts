import { User } from "@/types";
import { readJsonFile } from "@/lib/utils/storage";

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
