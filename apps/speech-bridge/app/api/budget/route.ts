import { NextResponse } from "next/server";
import { getBudgetStatus } from "@/lib/budget";
import { getRegistryStatus } from "@/lib/registry";

export async function GET() {
  const budget = getBudgetStatus();
  const models = getRegistryStatus();

  return NextResponse.json({
    budget,
    models: {
      active: models.filter((m) => m.ready).map((m) => m.id),
      training: models.filter((m) => m.status === "training").map((m) => m.id),
      planned: models.filter((m) => m.status === "planned").map((m) => m.id),
    },
  });
}
