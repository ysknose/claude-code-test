import { NextRequest, NextResponse } from "next/server";
import { parse } from "valibot";
import {
  getEquipmentById,
  updateEquipment,
  deleteEquipment,
} from "@/lib/services/equipment-service";
import { hasActiveLoans } from "@/lib/services/loan-service";
import { EquipmentSchema } from "@/lib/validations/schemas";

/**
 * GET /api/equipment/[id]
 * 備品詳細を取得
 * Feature: company-equipment-management, Property 6: 備品詳細の完全性
 * 要件 2.4
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const equipment = await getEquipmentById(id);

    if (!equipment) {
      return NextResponse.json(
        {
          error: {
            code: "NOT_FOUND",
            message: "備品が見つかりません",
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: equipment });
  } catch (error) {
    console.error("Error fetching equipment:", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "備品の取得に失敗しました",
          details: error,
        },
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/equipment/[id]
 * 備品を更新
 * Feature: company-equipment-management, Property 11: 備品更新の永続化
 * 要件 5.1
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // バリデーション（部分的な更新を許可）
    try {
      const validatedData = parse(EquipmentSchema, body);

      // 備品を更新
      const equipment = await updateEquipment(id, {
        name: validatedData.name,
        category: validatedData.category,
        description: validatedData.description,
        totalQuantity: validatedData.totalQuantity,
        purchaseDate: validatedData.purchaseDate,
        usefulLife: validatedData.usefulLife,
      });

      if (!equipment) {
        return NextResponse.json(
          {
            error: {
              code: "NOT_FOUND",
              message: "備品が見つかりません",
            },
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        data: equipment,
        message: "備品を更新しました",
      });
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
    console.error("Error updating equipment:", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "備品の更新に失敗しました",
          details: error,
        },
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/equipment/[id]
 * 備品を削除
 * Feature: company-equipment-management, Property 12: 貸出中備品の削除制約, Property 13: 備品削除の完全性
 * 要件 5.2, 5.3
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 貸出中かチェック
    const isLoaned = await hasActiveLoans(id);
    if (isLoaned) {
      return NextResponse.json(
        {
          error: {
            code: "BUSINESS_RULE_VIOLATION",
            message: "貸出中の備品は削除できません",
          },
        },
        { status: 422 }
      );
    }

    // 備品を削除
    const deleted = await deleteEquipment(id);
    if (!deleted) {
      return NextResponse.json(
        {
          error: {
            code: "NOT_FOUND",
            message: "備品が見つかりません",
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "備品を削除しました",
    });
  } catch (error) {
    console.error("Error deleting equipment:", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "備品の削除に失敗しました",
          details: error,
        },
      },
      { status: 500 }
    );
  }
}
