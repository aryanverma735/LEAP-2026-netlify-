import { NextResponse } from "next/server"
import { moveIdea, getIdeaById } from "@/lib/jsonStorage"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const idea = await getIdeaById(id)
    if (!idea) {
      return NextResponse.json({ error: "Idea not found" }, { status: 404 })
    }

    if (!body.revertedBy || !body.revertedByDomainId || !body.revertReason) {
      return NextResponse.json(
        { error: "Revert details are required (revertedBy, revertedByDomainId, revertReason)" },
        { status: 400 }
      )
    }

    const previousStatus = idea.collection === "approvedIdeas" ? "Approved" : "Rejected"

    const revertEntry = {
      revertedBy: body.revertedBy,
      revertedByDomainId: body.revertedByDomainId,
      revertReason: body.revertReason,
      revertDateTime: new Date().toISOString(),
      previousStatus,
    }

    const updated = await moveIdea(id, "pendingIdeas", {
      revertHistory: [...(idea.revertHistory || []), revertEntry],
    })

    return NextResponse.json({ success: true, idea: updated })
  } catch (error) {
    console.error("Error reverting idea:", error)
    return NextResponse.json({ error: "Failed to revert idea" }, { status: 500 })
  }
}
