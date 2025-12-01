import { NextRequest, NextResponse } from "next/server";
import { returnLoan } from "@/lib/services/loan-service";

/**
 * PUT /api/loans/[id]/return
 * 返却処理を実行
 * Feature: company-equipment-management, Property 9: 返却時の在庫増加, Property 10: 無効な返却の拒否
 * 要件 4.1, 4.2, 4.3
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 返却処理を実行
    const result = await returnLoan(id);

    if (!result.success) {
      return NextResponse.json(
        {
          error: {
            code: "NOT_FOUND",
            message: result.error,
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: result.loan,
      message: "備品を返却しました",
    });
  } catch (error) {
    console.error("Error returning loan:", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "返却処理に失敗しました",
          details: error,
        },
      },
      { status: 500 }
    );
  }
}
