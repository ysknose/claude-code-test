import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Equipment } from "@/types";
import { toast } from "sonner";

/**
 * 備品一覧を取得するフック
 */
export function useEquipment(params?: { category?: string; search?: string }) {
  return useQuery({
    queryKey: ["equipment", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.category) searchParams.set("category", params.category);
      if (params?.search) searchParams.set("search", params.search);

      const response = await fetch(`/api/equipment?${searchParams.toString()}`);
      if (!response.ok) {
        throw new Error("備品の取得に失敗しました");
      }
      const data = await response.json();
      return data.data as Equipment[];
    },
  });
}

/**
 * 備品詳細を取得するフック
 */
export function useEquipmentById(id: string) {
  return useQuery({
    queryKey: ["equipment", id],
    queryFn: async () => {
      const response = await fetch(`/api/equipment/${id}`);
      if (!response.ok) {
        throw new Error("備品の取得に失敗しました");
      }
      const data = await response.json();
      return data.data as Equipment;
    },
    enabled: !!id,
  });
}

/**
 * 備品を作成するフック
 */
export function useCreateEquipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (equipment: Omit<Equipment, "id" | "createdAt" | "updatedAt" | "availableQuantity">) => {
      const response = await fetch("/api/equipment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(equipment),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "備品の登録に失敗しました");
      }

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["equipment"] });
      toast.success("備品を登録しました");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

/**
 * 備品を更新するフック
 */
export function useUpdateEquipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...equipment
    }: Partial<Equipment> & { id: string }) => {
      const response = await fetch(`/api/equipment/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(equipment),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "備品の更新に失敗しました");
      }

      return await response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["equipment"] });
      queryClient.invalidateQueries({ queryKey: ["equipment", variables.id] });
      toast.success("備品を更新しました");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

/**
 * 備品を削除するフック
 */
export function useDeleteEquipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/equipment/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "備品の削除に失敗しました");
      }

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["equipment"] });
      toast.success("備品を削除しました");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
