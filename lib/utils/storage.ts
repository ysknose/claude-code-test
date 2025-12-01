import { promises as fs } from "node:fs";
import path from "node:path";

/**
 * JSONファイルからデータを読み込む
 * Feature: company-equipment-management
 */
export async function readJsonFile<T>(filename: string): Promise<T[]> {
  try {
    const filePath = path.join(process.cwd(), "data", filename);
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data) as T[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      // ファイルが存在しない場合は空配列を返す
      return [];
    }
    throw error;
  }
}

/**
 * JSONファイルにデータを書き込む
 * Feature: company-equipment-management, Property 1: 備品登録の完全性
 */
export async function writeJsonFile<T>(filename: string, data: T[]): Promise<void> {
  try {
    const filePath = path.join(process.cwd(), "data", filename);
    // データディレクトリが存在しない場合は作成
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    // JSON形式でファイルに書き込み
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error(`Error writing to ${filename}:`, error);
    throw error;
  }
}

/**
 * JSONファイルを更新する（読み込み→変更→書き込み）
 * Feature: company-equipment-management
 */
export async function updateJsonFile<T>(
  filename: string,
  updater: (data: T[]) => T[]
): Promise<T[]> {
  try {
    const data = await readJsonFile<T>(filename);
    const updatedData = updater(data);
    await writeJsonFile(filename, updatedData);
    return updatedData;
  } catch (error) {
    console.error(`Error updating ${filename}:`, error);
    throw error;
  }
}
