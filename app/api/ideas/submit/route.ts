import { NextResponse } from "next/server"
import { addIdea } from "@/lib/jsonStorage"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const requiredFields = [
      "ideaId",
      "associateDomainId",
      "associateName",
      "function",
      "teamLead",
      "functionalManager",
      "state",
      "ideaName",
      "problemStatement",
      "solution",
      "savingsType",
    ]

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    const newIdea = await addIdea({
      collection: "pendingIdeas",
      ideaId: body.ideaId,
      associateDomainId: body.associateDomainId,
      associateName: body.associateName,
      function: body.function,
      teamLead: body.teamLead,
      functionalManager: body.functionalManager,
      state: body.state,
      applicationName: body.applicationName || "",
      specifyApplicationName: body.specifyApplicationName || "",
      ideaName: body.ideaName,
      problemStatement: body.problemStatement,
      solution: body.solution,
      savingsType: body.savingsType,
      savingsComment: body.savingsComment || "",
      submissionDateTime: body.submissionDateTime || new Date().toISOString(),
    })

    return NextResponse.json({ success: true, idea: newIdea }, { status: 201 })
  } catch (error) {
    console.error("Error submitting idea:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      { error: `Failed to submit idea: ${errorMessage}` },
      { status: 500 }
    )
  }
}
