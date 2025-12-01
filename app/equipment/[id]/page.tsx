"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/header";
import { useEquipmentById, useDeleteEquipment } from "@/hooks/use-equipment";
import { useCreateLoan, useLoans } from "@/hooks/use-loans";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Trash2, ArrowLeft } from "lucide-react";
import { format } from "date-fns";

// デモ用のユーザーID（実際のアプリでは認証から取得）
const CURRENT_USER_ID = "00000000-0000-0000-0000-000000000002";

export default function EquipmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const { data: equipment, isLoading } = useEquipmentById(id);
  const { data: loans = [] } = useLoans({ equipmentId: id });
  const deleteMutation = useDeleteEquipment();
  const loanMutation = useCreateLoan();

  const handleDelete = () => {
    if (confirm("この備品を削除してもよろしいですか？")) {
      deleteMutation.mutate(id, {
        onSuccess: () => {
          router.push("/equipment");
        },
      });
    }
  };

  const handleLoan = () => {
    loanMutation.mutate({
      equipmentId: id,
      userId: CURRENT_USER_ID,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>読み込み中...</p>
      </div>
    );
  }

  if (!equipment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>備品が見つかりません</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Link href="/equipment">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              一覧に戻る
            </Button>
          </Link>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{equipment.name}</CardTitle>
                <div className="flex gap-2">
                  <Link href={`/equipment/${id}/edit`}>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-2" />
                      編集
                    </Button>
                  </Link>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDelete}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    削除
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">カテゴリ</p>
                  <p className="font-medium">{equipment.category}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">在庫状況</p>
                  <p className="font-medium">
                    {equipment.availableQuantity} / {equipment.totalQuantity}
                    {equipment.availableQuantity === 0 && (
                      <span className="ml-2 text-destructive">(在庫切れ)</span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">購入日</p>
                  <p className="font-medium">
                    {format(new Date(equipment.purchaseDate), "yyyy年MM月dd日")}
                  </p>
                </div>
                {equipment.usefulLife && (
                  <div>
                    <p className="text-sm text-muted-foreground">耐用年数</p>
                    <p className="font-medium">{equipment.usefulLife}年</p>
                  </div>
                )}
              </div>

              {equipment.description && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">説明</p>
                  <p className="whitespace-pre-wrap">{equipment.description}</p>
                </div>
              )}

              <div>
                <Button
                  onClick={handleLoan}
                  disabled={equipment.availableQuantity === 0 || loanMutation.isPending}
                  className="w-full sm:w-auto"
                >
                  借りる
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>貸出履歴</CardTitle>
            </CardHeader>
            <CardContent>
              {loans.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  貸出履歴がありません
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>貸出日</TableHead>
                      <TableHead>返却日</TableHead>
                      <TableHead>ステータス</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loans.map((loan) => (
                      <TableRow key={loan.id}>
                        <TableCell>
                          {format(new Date(loan.borrowedAt), "yyyy/MM/dd HH:mm")}
                        </TableCell>
                        <TableCell>
                          {loan.returnedAt
                            ? format(new Date(loan.returnedAt), "yyyy/MM/dd HH:mm")
                            : "-"}
                        </TableCell>
                        <TableCell>
                          {loan.status === "active" ? (
                            <span className="text-blue-600">貸出中</span>
                          ) : (
                            <span className="text-muted-foreground">返却済み</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
