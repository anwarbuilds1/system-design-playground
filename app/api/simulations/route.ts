import { NextRequest, NextResponse } from "next/server";
import { runSimulation } from "@/lib/simulation/engine";
import type { Architecture, Requirements } from "@/types/architecture";

export async function POST(request: NextRequest) {
  let body: { architecture?: Architecture; requirements?: Requirements };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { architecture, requirements } = body;
  if (!architecture || !requirements) {
    return NextResponse.json({ error: "architecture and requirements are required." }, { status: 400 });
  }

  try {
    const { validation, result } = runSimulation(architecture, requirements);
    if (!validation.valid || !result) {
      return NextResponse.json({ validation, result: null }, { status: 200 });
    }
    return NextResponse.json({
      validation,
      result,
      score: result.score,
      metrics: result.metrics,
      bottlenecks: result.bottlenecks,
      warnings: result.warnings,
      recommendations: result.commendations,
    });
  } catch {
    return NextResponse.json({ error: "Simulation failed to run." }, { status: 500 });
  }
}
