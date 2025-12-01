"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Equipment } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCreateEquipment, useUpdateEquipment } from "@/hooks/use-equipment";

interface EquipmentFormProps {
  initialData?: Equipment;
  mode: "create" | "edit";
}

export function EquipmentForm({ initialData, mode }: EquipmentFormProps) {
  const router = useRouter();
  const createMutation = useCreateEquipment();
  const updateMutation = useUpdateEquipment();

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    category: initialData?.category || "",
    description: initialData?.description || "",
    totalQuantity: initialData?.totalQuantity || 1,
    purchaseDate: initialData?.purchaseDate
      ? new Date(initialData.purchaseDate).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    usefulLife: initialData?.usefulLife || undefined,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "備品名は必須です";
    } else if (formData.name.length > 100) {
      newErrors.name = "備品名は100文字以内である必要があります";
    }

    if (!formData.category.trim()) {
      newErrors.category = "カテゴリは必須です";
    } else if (formData.category.length > 50) {
      newErrors.category = "カテゴリは50文字以内である必要があります";
    }

    if (formData.description.length > 500) {
      newErrors.description = "説明は500文字以内である必要があります";
    }

    if (formData.totalQuantity < 0) {
      newErrors.totalQuantity = "数量は0以上である必要があります";
    } else if (formData.totalQuantity > 10000) {
      newErrors.totalQuantity = "数量は10000以下である必要があります";
    }

    if (!formData.purchaseDate) {
      newErrors.purchaseDate = "購入日は必須です";
    }

    if (formData.usefulLife !== undefined) {
      if (formData.usefulLife < 1) {
        newErrors.usefulLife = "耐用年数は1年以上である必要があります";
      } else if (formData.usefulLife > 100) {
        newErrors.usefulLife = "耐用年数は100年以下である必要があります";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const data = {
      ...formData,
      purchaseDate: new Date(formData.purchaseDate),
      usefulLife: formData.usefulLife || undefined,
    };

    if (mode === "create") {
      createMutation.mutate(data, {
        onSuccess: () => {
          router.push("/equipment");
        },
      });
    } else if (initialData) {
      updateMutation.mutate(
        {
          id: initialData.id,
          ...data,
        },
        {
          onSuccess: () => {
            router.push(`/equipment/${initialData.id}`);
          },
        }
      );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{mode === "create" ? "備品登録" : "備品編集"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">備品名 *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="例: ノートPC"
            />
            {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
          </div>

          <div>
            <Label htmlFor="category">カテゴリ *</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="例: 電子機器"
            />
            {errors.category && (
              <p className="text-sm text-destructive mt-1">{errors.category}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">説明</Label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="備品の説明を入力してください"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
            {errors.description && (
              <p className="text-sm text-destructive mt-1">{errors.description}</p>
            )}
          </div>

          <div>
            <Label htmlFor="totalQuantity">数量 *</Label>
            <Input
              id="totalQuantity"
              type="number"
              value={formData.totalQuantity}
              onChange={(e) =>
                setFormData({ ...formData, totalQuantity: Number(e.target.value) })
              }
              min="0"
              max="10000"
            />
            {errors.totalQuantity && (
              <p className="text-sm text-destructive mt-1">{errors.totalQuantity}</p>
            )}
          </div>

          <div>
            <Label htmlFor="purchaseDate">購入日 *</Label>
            <Input
              id="purchaseDate"
              type="date"
              value={formData.purchaseDate}
              onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
              max={new Date().toISOString().split("T")[0]}
            />
            {errors.purchaseDate && (
              <p className="text-sm text-destructive mt-1">{errors.purchaseDate}</p>
            )}
          </div>

          <div>
            <Label htmlFor="usefulLife">耐用年数（年）</Label>
            <Input
              id="usefulLife"
              type="number"
              value={formData.usefulLife || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  usefulLife: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              min="1"
              max="100"
              placeholder="任意"
            />
            {errors.usefulLife && (
              <p className="text-sm text-destructive mt-1">{errors.usefulLife}</p>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {mode === "create" ? "登録" : "更新"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              キャンセル
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
