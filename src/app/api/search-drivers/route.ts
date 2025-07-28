import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { vehicle_id } = await req.json();

    if (!vehicle_id) {
      return NextResponse.json(
        { error: "vehicle_id is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase.rpc("get_people_by_vehicle", {
      p_vehicle_id: vehicle_id,
    });

    if (error) {
      console.error("Error fetching people:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
