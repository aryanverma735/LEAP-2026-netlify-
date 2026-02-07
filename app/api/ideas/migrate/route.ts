import { NextResponse } from "next/server"
import { getAllIdeas, updateIdea } from "@/lib/jsonStorage"

const FUNCTION_MAPPINGS: { [key: string]: string } = {
  "DDO - Sanction": "DDO",
  "DDO - Carelon BH": "DDO",
  "DDO-Sanction": "DDO",
  "PDS - Rework": "Re-work",
  Rework: "Re-work",
  "Entire CA, Terms/Re-work": "Re-work",
  "PCM Medicare": "PCM",
  "L&D": "L&D Offshore",
}

const FUNCTIONAL_MANAGER_MAPPINGS: { [key: string]: string } = {
  "Arun Raj": "Ravindran, Arun Raj",
  "Arun Raj Ravindran": "Ravindran, Arun Raj",
  "Deepa K v s": "K v s, Deepa",
  "Deepa KVS": "K v s, Deepa",
  "Anupam Chatterjee": "Chatterjee, Anupam",
  "Kandaswamy Krishnakumar": "Kandasamy, Krishnakumar",
  "Aparna BN": "Bn, Aparna",
}

export async function GET() {
  // Preview mode
  try {
    const ideas = await getAllIdeas()
    const changesPreview: Array<{
      id: string
      collection: string
      currentFunction?: string
      newFunction?: string
      currentFunctionalManager?: string
      newFunctionalManager?: string
    }> = []

    for (const idea of ideas) {
      const change: any = { id: idea.id, collection: idea.collection }
      let hasChanges = false

      if (idea.function && FUNCTION_MAPPINGS[idea.function]) {
        change.currentFunction = idea.function
        change.newFunction = FUNCTION_MAPPINGS[idea.function]
        hasChanges = true
      }

      if (idea.functionalManager && FUNCTIONAL_MANAGER_MAPPINGS[idea.functionalManager]) {
        change.currentFunctionalManager = idea.functionalManager
        change.newFunctionalManager = FUNCTIONAL_MANAGER_MAPPINGS[idea.functionalManager]
        hasChanges = true
      }

      if (hasChanges) {
        changesPreview.push(change)
      }
    }

    return NextResponse.json({
      totalIdeas: ideas.length,
      changesPreview,
      changesCount: changesPreview.length,
    })
  } catch (error) {
    console.error("Error previewing migration:", error)
    return NextResponse.json({ error: "Failed to preview migration" }, { status: 500 })
  }
}

export async function POST() {
  // Run migration
  try {
    const ideas = await getAllIdeas()
    let updatedCount = 0
    const errors: string[] = []

    for (const idea of ideas) {
      const updates: Partial<typeof idea> = {}
      let needsUpdate = false

      if (idea.function && FUNCTION_MAPPINGS[idea.function]) {
        updates.function = FUNCTION_MAPPINGS[idea.function]
        needsUpdate = true
      }

      if (idea.functionalManager && FUNCTIONAL_MANAGER_MAPPINGS[idea.functionalManager]) {
        updates.functionalManager = FUNCTIONAL_MANAGER_MAPPINGS[idea.functionalManager]
        needsUpdate = true
      }

      if (needsUpdate) {
        const result = await updateIdea(idea.id, updates)
        if (result) {
          updatedCount++
        } else {
          errors.push(`Failed to update idea ${idea.id}`)
        }
      }
    }

    return NextResponse.json({
      success: true,
      updatedCount,
      errors,
      totalIdeas: ideas.length,
    })
  } catch (error) {
    console.error("Error running migration:", error)
    return NextResponse.json({ error: "Failed to run migration" }, { status: 500 })
  }
}
