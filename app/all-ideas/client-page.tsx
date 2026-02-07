"use client"

import AllIdeas from "../components/AllIdeas"

export default function AllIdeasClientPage() {
  return (
    <div className="flex flex-col pb-8">
      <h1 className="text-3xl font-bold mb-6">All Ideas</h1>
      <div>
        <AllIdeas />
      </div>
    </div>
  )
}
