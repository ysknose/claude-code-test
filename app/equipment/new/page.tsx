"use client";

import { Header } from "@/components/header";
import { EquipmentForm } from "@/components/equipment-form";

export default function NewEquipmentPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
        <EquipmentForm mode="create" />
      </main>
    </div>
  );
}
