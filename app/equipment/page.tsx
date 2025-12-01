"use client";

import { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/header";
import { useEquipment } from "@/hooks/use-equipment";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { Equipment } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Package, Plus, Search } from "lucide-react";
import { format } from "date-fns";

export default function EquipmentPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [sorting, setSorting] = useState<SortingState>([]);

  const { data: equipment = [], isLoading } = useEquipment({
    search: search || undefined,
    category: category !== "all" ? category : undefined,
  });

  const columns: ColumnDef<Equipment>[] = [
    {
      accessorKey: "name",
      header: "備品名",
      cell: ({ row }) => (
        <Link
          href={`/equipment/${row.original.id}`}
          className="font-medium hover:underline"
        >
          {row.original.name}
        </Link>
      ),
    },
    {
      accessorKey: "category",
      header: "カテゴリ",
    },
    {
      accessorKey: "availableQuantity",
      header: "在庫数",
      cell: ({ row }) => (
        <div>
          {row.original.availableQuantity} / {row.original.totalQuantity}
        </div>
      ),
    },
    {
      accessorKey: "purchaseDate",
      header: "購入日",
      cell: ({ row }) => format(new Date(row.original.purchaseDate), "yyyy/MM/dd"),
    },
    {
      id: "actions",
      header: "操作",
      cell: ({ row }) => (
        <Link href={`/equipment/${row.original.id}`}>
          <Button variant="outline" size="sm">
            詳細
          </Button>
        </Link>
      ),
    },
  ];

  const table = useReactTable({
    data: equipment,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  // カテゴリの一覧を取得
  const categories = Array.from(new Set(equipment.map((e) => e.category)));

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">備品一覧</h2>
          <Link href="/equipment/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              新規登録
            </Button>
          </Link>
        </div>
        <div className="mb-6 flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="備品名で検索..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="カテゴリで絞り込み" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべて</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="text-center py-8">読み込み中...</div>
        ) : equipment.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            備品が見つかりませんでした
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
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
