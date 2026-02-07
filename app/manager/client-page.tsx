"use client"

import BusinessAnalystReview from "../components/BusinessAnalystReview"

export default function BusinessAnalystClientPage() {
  return (
    <div className="flex flex-col pb-8">
      <h1 className="text-3xl font-bold mb-6">Business Analyst Review</h1>
      <div>
        <BusinessAnalystReview />
      </div>
    </div>
  )
}
