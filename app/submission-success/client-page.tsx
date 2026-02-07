"use client"

import Link from "next/link"

export default function SubmissionSuccessClientPage() {
  return (
    <div className="max-w-md mx-auto text-center card py-12">
      <div className="mb-6 flex justify-center">
        <div className="rounded-full bg-green-100 p-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-green-600"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
      </div>
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Submission Successful!</h1>
      <p className="text-gray-600 mb-8">Your idea has been submitted for review. Thank you for your contribution!</p>
      <Link href="/" className="btn-primary inline-flex items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mr-2"
        >
          <path d="M12 5v14"></path>
          <path d="M5 12h14"></path>
        </svg>
        Submit another idea
      </Link>
    </div>
  )
}
