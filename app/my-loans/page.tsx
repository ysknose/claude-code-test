"use client";

import Link from "next/link";
import { Header } from "@/components/header";
import { useMyLoans, useReturnLoan } from "@/hooks/use-loans";
import { useEquipment } from "@/hooks/use-equipment";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, User } from "lucide-react";
import { format } from "date-fns";

// デモ用のユーザーID（実際のアプリでは認証から取得）
const CURRENT_USER_ID = "00000000-0000-0000-0000-000000000002";

export default function MyLoansPage() {
  const { data: loans = [], isLoading: loansLoading } = useMyLoans(CURRENT_USER_ID);
  const { data: allEquipment = [] } = useEquipment();
  const returnMutation = useReturnLoan();

  // 備品IDから備品情報を取得するマップ
  const equipmentMap = new Map(allEquipment.map((e) => [e.id, e]));

  // 拡張された貸出情報
  const loansWithEquipment = loans.map((loan) => ({
    ...loan,
    equipment: equipmentMap.get(loan.equipmentId),
  }));

  const handleReturn = (loanId: string) => {
    if (confirm("この備品を返却してもよろしいですか？")) {
      returnMutation.mutate(loanId);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">マイページ</h2>
          <p className="text-muted-foreground mt-1">現在借りている備品</p>
        </div>

        {loansLoading ? (
          <div className="text-center py-8">読み込み中...</div>
        ) : loansWithEquipment.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                現在借りている備品はありません
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {loansWithEquipment.map((loan) => (
              <Card key={loan.id}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {loan.equipment ? (
                      <Link
                        href={`/equipment/${loan.equipmentId}`}
                        className="hover:underline"
                      >
                        {loan.equipment.name}
                      </Link>
                    ) : (
                      loan.equipmentId
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">カテゴリ</p>
                    <p className="font-medium">{loan.equipment?.category || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">貸出日</p>
                    <p className="font-medium">
                      {format(new Date(loan.borrowedAt), "yyyy年MM月dd日")}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleReturn(loan.id)}
                      disabled={returnMutation.isPending}
                      variant="outline"
                      className="flex-1"
                    >
                      返却する
                    </Button>
                    {loan.equipment && (
                      <Link href={`/equipment/${loan.equipmentId}`} className="flex-1">
                        <Button variant="secondary" className="w-full">
                          詳細
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
