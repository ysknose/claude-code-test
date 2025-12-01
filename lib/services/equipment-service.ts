import { Equipment } from "@/types";
import { readJsonFile, updateJsonFile, writeJsonFile } from "@/lib/utils/storage";

const EQUIPMENT_FILE = "equipment.json";

/**
 * すべての備品を取得する
 * Feature: company-equipment-management, 要件 2.1
 */
export async function getAllEquipment(): Promise<Equipment[]> {
  return await readJsonFile<Equipment>(EQUIPMENT_FILE);
}

/**
 * IDで備品を取得する
 * Feature: company-equipment-management, Property 3: 備品登録のラウンドトリップ
 */
export async function getEquipmentById(id: string): Promise<Equipment | null> {
  const equipment = await readJsonFile<Equipment>(EQUIPMENT_FILE);
  return equipment.find((e) => e.id === id) || null;
}

/**
 * カテゴリで備品をフィルタリングする
 * Feature: company-equipment-management, Property 4: カテゴリフィルタリングの正確性
 * 要件 2.2
 */
export async function getEquipmentByCategory(category: string): Promise<Equipment[]> {
  const equipment = await readJsonFile<Equipment>(EQUIPMENT_FILE);
  return equipment.filter((e) => e.category === category);
}

/**
 * 検索キーワードで備品を検索する
 * Feature: company-equipment-management, Property 5: 検索結果の一致性
 * 要件 2.3
 */
export async function searchEquipment(keyword: string): Promise<Equipment[]> {
  const equipment = await readJsonFile<Equipment>(EQUIPMENT_FILE);
  const lowerKeyword = keyword.toLowerCase();
  return equipment.filter((e) => e.name.toLowerCase().includes(lowerKeyword));
}

/**
 * 新しい備品を作成する
 * Feature: company-equipment-management, Property 1: 備品登録の完全性
 * 要件 1.1, 1.3, 1.4
 */
export async function createEquipment(
  equipment: Omit<Equipment, "id" | "createdAt" | "updatedAt" | "availableQuantity">
): Promise<Equipment> {
  const newEquipment: Equipment = {
    ...equipment,
    id: crypto.randomUUID(),
    availableQuantity: equipment.totalQuantity,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await updateJsonFile<Equipment>(EQUIPMENT_FILE, (data) => [...data, newEquipment]);

  return newEquipment;
}

/**
 * 備品を更新する
 * Feature: company-equipment-management, Property 11: 備品更新の永続化
 * 要件 5.1
 */
export async function updateEquipment(
  id: string,
  updates: Partial<Omit<Equipment, "id" | "createdAt" | "updatedAt" | "availableQuantity">>
): Promise<Equipment | null> {
  let updatedEquipment: Equipment | null = null;

  await updateJsonFile<Equipment>(EQUIPMENT_FILE, (data) => {
    const index = data.findIndex((e) => e.id === id);
    if (index === -1) return data;

    updatedEquipment = {
      ...data[index],
      ...updates,
      updatedAt: new Date(),
    };

    const newData = [...data];
    newData[index] = updatedEquipment;
    return newData;
  });

  return updatedEquipment;
}

/**
 * 備品を削除する
 * Feature: company-equipment-management, Property 13: 備品削除の完全性
 * 要件 5.3
 */
export async function deleteEquipment(id: string): Promise<boolean> {
  let deleted = false;

  await updateJsonFile<Equipment>(EQUIPMENT_FILE, (data) => {
    const index = data.findIndex((e) => e.id === id);
    if (index === -1) return data;

    deleted = true;
    return data.filter((e) => e.id !== id);
  });

  return deleted;
}

/**
 * 備品の在庫数を更新する（内部使用）
 */
export async function updateEquipmentQuantity(
  id: string,
  change: number
): Promise<Equipment | null> {
  let updatedEquipment: Equipment | null = null;

  await updateJsonFile<Equipment>(EQUIPMENT_FILE, (data) => {
    const index = data.findIndex((e) => e.id === id);
    if (index === -1) return data;

    updatedEquipment = {
      ...data[index],
      availableQuantity: data[index].availableQuantity + change,
      updatedAt: new Date(),
    };

    const newData = [...data];
    newData[index] = updatedEquipment;
    return newData;
  });

  return updatedEquipment;
}
