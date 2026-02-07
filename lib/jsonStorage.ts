import { getStore } from "@netlify/blobs"
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

function getIdeasStore() {
  return getStore(STORE_NAME, { consistency: "strong" })
}

async function readIdeas(): Promise<Idea[]> {
  const store = getIdeasStore()
  const data = await store.get(IDEAS_KEY, { type: "json" })
  if (!data) {
    return []
  }
  return data as Idea[]
}

async function writeIdeas(ideas: Idea[]): Promise<void> {
  const store = getIdeasStore()
  await store.setJSON(IDEAS_KEY, ideas)
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
