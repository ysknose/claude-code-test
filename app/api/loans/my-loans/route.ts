import { NextRequest, NextResponse } from "next/server";
import { getActiveLoansByUserId } from "@/lib/services/loan-service";

/**
 * GET /api/loans/my-loans
 * 現在の借用状況を取得
 * Feature: company-equipment-management, Property 17: 現在の借用リストの正確性
 * 要件 7.1, 7.2
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "ユーザーIDが必要です",
          },
        },
        { status: 400 }
      );
    }

    const loans = await getActiveLoansByUserId(userId);

    return NextResponse.json({ data: loans });
  } catch (error) {
    console.error("Error fetching my loans:", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "借用状況の取得に失敗しました",
          details: error,
        },
      },
      { status: 500 }
    );
  }
}
