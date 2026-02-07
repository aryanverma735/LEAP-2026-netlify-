/**
 * Client-side functions to call the migration API routes.
 * These replace the old Firebase-based migration utilities.
 */

export async function previewMigrationChanges(): Promise<{
  totalIdeas: number
  changesPreview: Array<{
    id: string
    collection: string
    currentFunction?: string
    newFunction?: string
    currentFunctionalManager?: string
    newFunctionalManager?: string
  }>
  changesCount: number
}> {
  const res = await fetch("/api/ideas/migrate")
  if (!res.ok) throw new Error("Failed to preview migration")
  return res.json()
}

export async function migrateAllCollections(): Promise<{
  success: boolean
  updatedCount: number
  errors: string[]
  totalIdeas: number
}> {
  const res = await fetch("/api/ideas/migrate", { method: "POST" })
  if (!res.ok) throw new Error("Failed to run migration")
  return res.json()
}
