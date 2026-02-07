import { randomUUID } from "crypto"

const STORE_NAME = "ideas"
const IDEAS_KEY = "all-ideas"

export interface Idea {
  id: string
  collection: "pendingIdeas" | "approvedIdeas" | "rejectedIdeas"
  ideaId: string
  associateDomainId: string
  associateName: string
  function: string
  teamLead: string
  functionalManager: string
  state: string
  applicationName?: string
  specifyApplicationName?: string
  ideaName: string
  problemStatement: string
  solution: string
  savingsType: string
  savingsComment: string
  submissionDateTime: string
  approverDomainId?: string
  approverName?: string
  status?: string
  implementedDate?: string
  rejectedDate?: string
  actualSavings?: string
  rejectionComment?: string
  approvalDateTime?: string
  notInScopeReason?: string
  notInScopeDateTime?: string
  implementationNotes?: string
  implementationNotesHistory?: Array<{
    note: string
    timestamp: string
    baName: string
    baDomainId: string
  }>
  revertHistory?: Array<{
    revertedBy: string
    revertedByDomainId: string
    revertReason: string
    revertDateTime: string
    previousStatus: string
  }>
  applicationNameHistory?: Array<{
    oldValue: string
    newValue: string
    changedBy: string
    changedByDomainId: string
    changeDateTime: string
  }>
}

// ---------------------------------------------------------------------------
// Storage backend abstraction
// Uses Netlify Blobs when running on Netlify, otherwise falls back to
// in-memory storage so the app works in local dev / Vercel / v0 previews.
// ---------------------------------------------------------------------------

let useNetlifyBlobs: boolean | null = null // null = not yet determined
let netlifyStore: ReturnType<typeof import("@netlify/blobs").getStore> | null = null

// In-memory fallback
let memoryStore: Idea[] = []

async function getNetlifyStore() {
  if (netlifyStore) return netlifyStore
  try {
    const { getStore } = await import("@netlify/blobs")
    const store = getStore(STORE_NAME, { consistency: "strong" })
    // Probe with a lightweight read to verify the context is valid
    await store.get(IDEAS_KEY)
    netlifyStore = store
    useNetlifyBlobs = true
    return store
  } catch {
    useNetlifyBlobs = false
    return null
  }
}

async function readIdeas(): Promise<Idea[]> {
  // Fast path – if we already know the backend
  if (useNetlifyBlobs === true && netlifyStore) {
    try {
      const data = await netlifyStore.get(IDEAS_KEY, { type: "json" })
      return (data as Idea[]) ?? []
    } catch {
      // Store became unavailable; fall through to memory
      useNetlifyBlobs = false
      netlifyStore = null
    }
  }

  if (useNetlifyBlobs === null) {
    const store = await getNetlifyStore()
    if (store) {
      const data = await store.get(IDEAS_KEY, { type: "json" })
      return (data as Idea[]) ?? []
    }
  }

  // Fallback: in-memory storage
  return [...memoryStore]
}

async function writeIdeas(ideas: Idea[]): Promise<void> {
  if (useNetlifyBlobs === true && netlifyStore) {
    try {
      await netlifyStore.setJSON(IDEAS_KEY, ideas)
      return
    } catch {
      useNetlifyBlobs = false
      netlifyStore = null
    }
  }

  if (useNetlifyBlobs === null) {
    const store = await getNetlifyStore()
    if (store) {
      await store.setJSON(IDEAS_KEY, ideas)
      return
    }
  }

  // Fallback: in-memory storage
  memoryStore = [...ideas]
}

// --- Public API ---

export async function getAllIdeas(): Promise<Idea[]> {
  return readIdeas()
}

export async function getIdeasByCollection(
  collectionName: "pendingIdeas" | "approvedIdeas" | "rejectedIdeas"
): Promise<Idea[]> {
  const ideas = await readIdeas()
  return ideas.filter((idea) => idea.collection === collectionName)
}

export async function getIdeaById(id: string): Promise<Idea | undefined> {
  const ideas = await readIdeas()
  return ideas.find((idea) => idea.id === id)
}

export async function addIdea(
  data: Omit<Idea, "id">,
): Promise<Idea> {
  const ideas = await readIdeas()
  const newIdea: Idea = {
    ...data,
    id: randomUUID(),
  }
  ideas.push(newIdea)
  await writeIdeas(ideas)
  return newIdea
}

export async function updateIdea(id: string, updates: Partial<Idea>): Promise<Idea | null> {
  const ideas = await readIdeas()
  const index = ideas.findIndex((idea) => idea.id === id)
  if (index === -1) return null
  ideas[index] = { ...ideas[index], ...updates }
  await writeIdeas(ideas)
  return ideas[index]
}

export async function deleteIdea(id: string): Promise<boolean> {
  const ideas = await readIdeas()
  const index = ideas.findIndex((idea) => idea.id === id)
  if (index === -1) return false
  ideas.splice(index, 1)
  await writeIdeas(ideas)
  return true
}

export async function moveIdea(
  id: string,
  toCollection: "pendingIdeas" | "approvedIdeas" | "rejectedIdeas",
  extraFields?: Partial<Idea>
): Promise<Idea | null> {
  const ideas = await readIdeas()
  const index = ideas.findIndex((idea) => idea.id === id)
  if (index === -1) return null
  ideas[index] = {
    ...ideas[index],
    ...extraFields,
    collection: toCollection,
  }
  await writeIdeas(ideas)
  return ideas[index]
}
