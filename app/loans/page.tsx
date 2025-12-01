"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/header";
import { useLoans } from "@/hooks/use-loans";
import { useEquipment } from "@/hooks/use-equipment";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { History, Package } from "lucide-react";
import { format } from "date-fns";
import { Loan, Equipment } from "@/types";

export default function LoansPage() {
  const [equipmentFilter, setEquipmentFilter] = useState<string>("all");

  const { data: loans = [], isLoading: loansLoading } = useLoans({
    equipmentId: equipmentFilter !== "all" ? equipmentFilter : undefined,
  });
  const { data: allEquipment = [] } = useEquipment();

  // 備品IDから備品情報を取得するマップ
  const equipmentMap = new Map(allEquipment.map((e) => [e.id, e]));

  // 拡張された貸出情報
  const loansWithEquipment = loans.map((loan) => ({
    ...loan,
    equipment: equipmentMap.get(loan.equipmentId),
  }));

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">貸出履歴</h2>
        </div>

        <div className="mb-6 flex gap-4">
          <Select value={equipmentFilter} onValueChange={setEquipmentFilter}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="備品で絞り込み" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべて</SelectItem>
              {allEquipment.map((equipment) => (
                <SelectItem key={equipment.id} value={equipment.id}>
                  {equipment.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loansLoading ? (
          <div className="text-center py-8">読み込み中...</div>
        ) : loansWithEquipment.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            貸出履歴がありません
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>備品名</TableHead>
                  <TableHead>カテゴリ</TableHead>
                  <TableHead>貸出日</TableHead>
                  <TableHead>返却日</TableHead>
                  <TableHead>ステータス</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loansWithEquipment.map((loan) => (
                  <TableRow key={loan.id}>
                    <TableCell>
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
                    </TableCell>
                    <TableCell>{loan.equipment?.category || "-"}</TableCell>
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
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                          貸出中
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600">
                          返却済み
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {loan.equipment && (
                        <Link href={`/equipment/${loan.equipmentId}`}>
                          <Button variant="outline" size="sm">
                            詳細
                          </Button>
                        </Link>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </main>
    </div>
  );
}
