import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const { vehicle_id } = await req.json();

  if (!vehicle_id) {
    return NextResponse.json(
      { error: "vehicle_id is required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("Vehicles")
    .select("*")
    .eq("id", vehicle_id);

  if (error) {
    console.error("Error fetching vehicle info:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
