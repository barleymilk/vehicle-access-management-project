import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const {
      vehicle_id,
      person_id,
      work_id,
      raw_plate_number,
      raw_vehicle_type,
      raw_person_name,
      raw_person_phone,
      driver_organization,
      passengers,
      purpose,
      notes,
      is_free_pass,
    } = await req.json();

    // 필수 필드 검증
    if (!raw_plate_number || !raw_person_name) {
      return NextResponse.json(
        { error: "차량번호와 운전자명은 필수입니다." },
        { status: 400 }
      );
    }

    // 한국 시간으로 현재 시간 생성
    const now = new Date();
    const kstTime = new Date(now.getTime() + 9 * 60 * 60 * 1000); // UTC+9

    const { data, error } = await supabase.from("AccessRecords").insert({
      vehicle_id,
      person_id,
      work_id,
      raw_plate_number,
      raw_vehicle_type,
      raw_person_name,
      raw_person_phone,
      driver_organization,
      passengers,
      purpose,
      notes,
      is_free_pass,
      created_at: now.toISOString(),
      entered_at: kstTime.toISOString(),
    });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "데이터베이스 저장 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      message: "출입 기록이 성공적으로 저장되었습니다.",
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
