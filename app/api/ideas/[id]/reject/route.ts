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

    if (!body.approverDomainId || !body.approverName || !body.rejectionComment) {
      return NextResponse.json(
        { error: "Approver domain ID, name, and rejection comment are required" },
        { status: 400 }
      )
    }

    const updated = await moveIdea(id, "rejectedIdeas", {
      approverDomainId: body.approverDomainId,
      approverName: body.approverName,
      rejectionComment: body.rejectionComment,
      status: "Rejected",
      rejectedDate: new Date().toISOString(),
    })

    return NextResponse.json({ success: true, idea: updated })
  } catch (error) {
    console.error("Error rejecting idea:", error)
    return NextResponse.json({ error: "Failed to reject idea" }, { status: 500 })
  }
}
