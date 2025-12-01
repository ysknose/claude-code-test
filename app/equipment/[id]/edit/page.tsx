"use client";

import { use } from "react";
import { Header } from "@/components/header";
import { useEquipmentById } from "@/hooks/use-equipment";
import { EquipmentForm } from "@/components/equipment-form";

export default function EditEquipmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: equipment, isLoading } = useEquipmentById(id);

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

      <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
        <EquipmentForm mode="edit" initialData={equipment} />
      </main>
    </div>
  );
}
