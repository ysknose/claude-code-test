import { NextRequest, NextResponse } from "next/server";
import { parse } from "valibot";
import {
  getAllLoans,
  getLoansByEquipmentId,
  getLoansByUserId,
  createLoan,
} from "@/lib/services/loan-service";
import { LoanSchema } from "@/lib/validations/schemas";

/**
 * GET /api/loans
 * 貸出履歴を取得（フィルタリング対応）
 * Feature: company-equipment-management, Property 14: 備品別履歴フィルタリング, Property 15: ユーザー別履歴フィルタリング
 * 要件 6.1, 6.2, 6.3
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const equipmentId = searchParams.get("equipmentId");
    const userId = searchParams.get("userId");

    let loans;

    if (equipmentId) {
      loans = await getLoansByEquipmentId(equipmentId);
    } else if (userId) {
      loans = await getLoansByUserId(userId);
    } else {
      loans = await getAllLoans();
      // 日付降順でソート
      loans.sort(
        (a, b) => new Date(b.borrowedAt).getTime() - new Date(a.borrowedAt).getTime()
      );
    }

    return NextResponse.json({ data: loans });
  } catch (error) {
    console.error("Error fetching loans:", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "貸出履歴の取得に失敗しました",
          details: error,
        },
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/loans
 * 貸出処理を実行
 * Feature: company-equipment-management, Property 7: 貸出時の在庫減少, Property 8: 貸出記録の完全性
 * 要件 3.1, 3.2, 3.3
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // バリデーション
    try {
      const validatedData = parse(LoanSchema, body);

      // 貸出処理を実行
      const result = await createLoan(validatedData.equipmentId, validatedData.userId);

      if (!result.success) {
        // ビジネスルール違反
        if (result.error === "在庫切れです") {
          return NextResponse.json(
            {
              error: {
                code: "RESOURCE_UNAVAILABLE",
                message: result.error,
              },
            },
            { status: 409 }
          );
        }

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

      return NextResponse.json(
        {
          data: result.loan,
          message: "備品を貸し出しました",
        },
        { status: 201 }
      );
    } catch (validationError: any) {
      // バリデーションエラー
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "入力データが不正です",
            details: validationError.issues || validationError.message,
          },
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error creating loan:", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "貸出処理に失敗しました",
          details: error,
        },
      },
      { status: 500 }
    );
  }
}
