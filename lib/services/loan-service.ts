import { Loan } from "@/types";
import { readJsonFile, updateJsonFile } from "@/lib/utils/storage";
import { getEquipmentById, updateEquipmentQuantity } from "./equipment-service";

const LOAN_FILE = "loans.json";

/**
 * すべての貸出記録を取得する
 * Feature: company-equipment-management, 要件 6.1
 */
export async function getAllLoans(): Promise<Loan[]> {
  return await readJsonFile<Loan>(LOAN_FILE);
}

/**
 * IDで貸出記録を取得する
 */
export async function getLoanById(id: string): Promise<Loan | null> {
  const loans = await readJsonFile<Loan>(LOAN_FILE);
  return loans.find((l) => l.id === id) || null;
}

/**
 * 備品IDで貸出履歴をフィルタリングする
 * Feature: company-equipment-management, Property 14: 備品別履歴フィルタリング
 * 要件 6.2
 */
export async function getLoansByEquipmentId(equipmentId: string): Promise<Loan[]> {
  const loans = await readJsonFile<Loan>(LOAN_FILE);
  return loans
    .filter((l) => l.equipmentId === equipmentId)
    .sort((a, b) => new Date(b.borrowedAt).getTime() - new Date(a.borrowedAt).getTime());
}

/**
 * ユーザーIDで貸出履歴をフィルタリングする
 * Feature: company-equipment-management, Property 15: ユーザー別履歴フィルタリング
 * 要件 6.3
 */
export async function getLoansByUserId(userId: string): Promise<Loan[]> {
  const loans = await readJsonFile<Loan>(LOAN_FILE);
  return loans
    .filter((l) => l.userId === userId)
    .sort((a, b) => new Date(b.borrowedAt).getTime() - new Date(a.borrowedAt).getTime());
}

/**
 * ユーザーが現在借りている備品を取得する
 * Feature: company-equipment-management, Property 17: 現在の借用リストの正確性
 * 要件 7.1
 */
export async function getActiveLoansByUserId(userId: string): Promise<Loan[]> {
  const loans = await readJsonFile<Loan>(LOAN_FILE);
  return loans.filter((l) => l.userId === userId && l.status === "active");
}

/**
 * 貸出処理を実行する
 * Feature: company-equipment-management, Property 7: 貸出時の在庫減少, Property 8: 貸出記録の完全性
 * 要件 3.1, 3.2, 3.3
 */
export async function createLoan(
  equipmentId: string,
  userId: string
): Promise<{ success: boolean; loan?: Loan; error?: string }> {
  // 備品の存在と在庫を確認
  const equipment = await getEquipmentById(equipmentId);
  if (!equipment) {
    return { success: false, error: "備品が見つかりません" };
  }

  if (equipment.availableQuantity <= 0) {
    return { success: false, error: "在庫切れです" };
  }

  // 貸出記録を作成
  const newLoan: Loan = {
    id: crypto.randomUUID(),
    equipmentId,
    userId,
    borrowedAt: new Date(),
    returnedAt: null,
    status: "active",
  };

  await updateJsonFile<Loan>(LOAN_FILE, (data) => [...data, newLoan]);

  // 在庫数を減らす
  await updateEquipmentQuantity(equipmentId, -1);

  return { success: true, loan: newLoan };
}

/**
 * 返却処理を実行する
 * Feature: company-equipment-management, Property 9: 返却時の在庫増加, Property 10: 無効な返却の拒否
 * 要件 4.1, 4.2, 4.3
 */
export async function returnLoan(
  loanId: string
): Promise<{ success: boolean; loan?: Loan; error?: string }> {
  let returnedLoan: Loan | null = null;
  let equipmentId: string | null = null;

  await updateJsonFile<Loan>(LOAN_FILE, (data) => {
    const index = data.findIndex((l) => l.id === loanId);
    if (index === -1) {
      return data;
    }

    const loan = data[index];
    if (loan.status === "returned") {
      return data;
    }

    equipmentId = loan.equipmentId;
    returnedLoan = {
      ...loan,
      returnedAt: new Date(),
      status: "returned",
    };

    const newData = [...data];
    newData[index] = returnedLoan;
    return newData;
  });

  if (!returnedLoan) {
    return { success: false, error: "貸出記録が見つかりません" };
  }

  if (equipmentId) {
    // 在庫数を増やす
    await updateEquipmentQuantity(equipmentId, 1);
  }

  return { success: true, loan: returnedLoan };
}

/**
 * 特定の備品に貸出中の記録があるか確認する
 * Feature: company-equipment-management, Property 12: 貸出中備品の削除制約
 * 要件 5.2
 */
export async function hasActiveLoans(equipmentId: string): Promise<boolean> {
  const loans = await readJsonFile<Loan>(LOAN_FILE);
  return loans.some((l) => l.equipmentId === equipmentId && l.status === "active");
}
