import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loan } from "@/types";
import { toast } from "sonner";

/**
 * 貸出履歴を取得するフック
 */
export function useLoans(params?: { equipmentId?: string; userId?: string }) {
  return useQuery({
    queryKey: ["loans", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.equipmentId) searchParams.set("equipmentId", params.equipmentId);
      if (params?.userId) searchParams.set("userId", params.userId);

      const response = await fetch(`/api/loans?${searchParams.toString()}`);
      if (!response.ok) {
        throw new Error("貸出履歴の取得に失敗しました");
      }
      const data = await response.json();
      return data.data as Loan[];
    },
  });
}

/**
 * 自分の借用状況を取得するフック
 */
export function useMyLoans(userId: string) {
  return useQuery({
    queryKey: ["loans", "my-loans", userId],
    queryFn: async () => {
      const response = await fetch(`/api/loans/my-loans?userId=${userId}`);
      if (!response.ok) {
        throw new Error("借用状況の取得に失敗しました");
      }
      const data = await response.json();
      return data.data as Loan[];
    },
    enabled: !!userId,
  });
}

/**
 * 貸出処理を実行するフック
 */
export function useCreateLoan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ equipmentId, userId }: { equipmentId: string; userId: string }) => {
      const response = await fetch("/api/loans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ equipmentId, userId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "貸出処理に失敗しました");
      }

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loans"] });
      queryClient.invalidateQueries({ queryKey: ["equipment"] });
      toast.success("備品を貸し出しました");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

/**
 * 返却処理を実行するフック
 */
export function useReturnLoan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (loanId: string) => {
      const response = await fetch(`/api/loans/${loanId}/return`, {
        method: "PUT",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "返却処理に失敗しました");
      }

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loans"] });
      queryClient.invalidateQueries({ queryKey: ["equipment"] });
      toast.success("備品を返却しました");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
