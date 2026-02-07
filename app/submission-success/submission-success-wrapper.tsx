"use client"

import Link from "next/link"

export default function SubmissionSuccessWrapper() {
  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold mb-4">Submission Successful!</h1>
      <p className="mb-4">Your idea has been submitted for review.</p>
      <Link href="/" className="text-purple-600 hover:text-purple-800">
        Submit another idea
      </Link>
    </div>
  )
}
