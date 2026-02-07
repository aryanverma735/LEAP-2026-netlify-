"use client"

import SubmissionForm from "./components/SubmissionForm"

export default function SubmissionFormPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-8">
      <div className="container mx-auto px-4">
        <SubmissionForm />
      </div>
    </div>
  )
}
