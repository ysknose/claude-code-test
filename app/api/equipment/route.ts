import { NextRequest, NextResponse } from "next/server";
import { parse } from "valibot";
import {
  getAllEquipment,
  getEquipmentByCategory,
  searchEquipment,
  createEquipment,
} from "@/lib/services/equipment-service";
import { EquipmentSchema } from "@/lib/validations/schemas";
import { Equipment } from "@/types";

/**
 * GET /api/equipment
 * 備品一覧を取得（検索・フィルタリング対応）
 * Feature: company-equipment-management, 要件 2.1, 2.2, 2.3
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    let equipment: Equipment[];

    if (category) {
      equipment = await getEquipmentByCategory(category);
    } else if (search) {
      equipment = await searchEquipment(search);
    } else {
      equipment = await getAllEquipment();
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
 * POST /api/equipment
 * 新しい備品を作成
 * Feature: company-equipment-management, Property 1: 備品登録の完全性, Property 2: 必須フィールドバリデーション
 * 要件 1.1, 1.2, 1.3, 1.4, 1.5
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // バリデーション
    try {
      const validatedData = parse(EquipmentSchema, body);

      // 備品を作成
      const equipment = await createEquipment({
        name: validatedData.name,
        category: validatedData.category,
        description: validatedData.description,
        totalQuantity: validatedData.totalQuantity,
        purchaseDate: validatedData.purchaseDate,
        usefulLife: validatedData.usefulLife,
      });

      return NextResponse.json(
        {
          data: equipment,
          message: "備品を登録しました",
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
    console.error("Error creating equipment:", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "備品の登録に失敗しました",
          details: error,
        },
      },
      { status: 500 }
    );
  }
}
