import { NextResponse } from "next/server"
import { getIdeasByCollection, getAllIdeas } from "@/lib/jsonStorage"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const collectionParam = searchParams.get("collection")

    if (
      collectionParam === "pendingIdeas" ||
      collectionParam === "approvedIdeas" ||
      collectionParam === "rejectedIdeas"
    ) {
      const ideas = await getIdeasByCollection(collectionParam)
      return NextResponse.json({ ideas })
    }

    if (collectionParam === "all") {
      const ideas = await getAllIdeas()
      return NextResponse.json({ ideas })
    }

    // Default: return all ideas grouped
    const pending = await getIdeasByCollection("pendingIdeas")
    const approved = await getIdeasByCollection("approvedIdeas")
    const rejected = await getIdeasByCollection("rejectedIdeas")

    return NextResponse.json({
      pendingIdeas: pending,
      approvedIdeas: approved,
      rejectedIdeas: rejected,
    })
  } catch (error) {
    console.error("Error fetching ideas:", error)
    return NextResponse.json(
      { error: "Failed to fetch ideas" },
      { status: 500 }
    )
  }
}
