"use client"

import ApprovedIdeas from "../components/ApprovedIdeas"

export default function ApprovedIdeasClientPage() {
  return (
    <div className="flex flex-col pb-8">
      <h1 className="text-3xl font-bold mb-6">Approved Ideas</h1>
      <ApprovedIdeas />
    </div>
  )
}
