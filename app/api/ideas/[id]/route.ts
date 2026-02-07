import { NextResponse } from "next/server"
import { getIdeaById, updateIdea, deleteIdea, moveIdea } from "@/lib/jsonStorage"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const idea = await getIdeaById(id)
    if (!idea) {
      return NextResponse.json({ error: "Idea not found" }, { status: 404 })
    }
    return NextResponse.json({ idea })
  } catch (error) {
    console.error("Error fetching idea:", error)
    return NextResponse.json({ error: "Failed to fetch idea" }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const updated = await updateIdea(id, body)
    if (!updated) {
      return NextResponse.json({ error: "Idea not found" }, { status: 404 })
    }
    return NextResponse.json({ success: true, idea: updated })
  } catch (error) {
    console.error("Error updating idea:", error)
    return NextResponse.json({ error: "Failed to update idea" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const deleted = await deleteIdea(id)
    if (!deleted) {
      return NextResponse.json({ error: "Idea not found" }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting idea:", error)
    return NextResponse.json({ error: "Failed to delete idea" }, { status: 500 })
  }
}
