"use client"

import RejectedIdeas from "../components/RejectedIdeas"

export default function RejectedIdeasClientPage() {
  return (
    <div className="flex flex-col pb-8">
      <h1 className="text-3xl font-bold mb-6">Rejected Ideas</h1>
      <RejectedIdeas />
    </div>
  )
}
