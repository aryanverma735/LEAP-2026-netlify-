"use client"

import type React from "react"

import { useState } from "react"

interface PasscodeFormProps {
  onCorrectPasscode: () => void
}

export default function PasscodeForm({ onCorrectPasscode }: PasscodeFormProps) {
  const [passcode, setPasscode] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (passcode === "9695") {
      onCorrectPasscode()
    } else {
      setError("Incorrect passcode. Please try again.")
    }
  }

  return (
    <div className="max-w-md mx-auto card">
      <h2 className="text-xl font-bold mb-6 text-center text-gray-800">Authentication Required</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="passcode" className="block text-sm font-medium text-gray-700 mb-1">
            Enter Manager Passcode
          </label>
          <div className="relative">
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
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            >
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            <input
              type="password"
              id="passcode"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="form-input pl-10"
              required
            />
          </div>
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button type="submit" className="btn-primary w-full flex justify-center py-3">
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
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
            <polyline points="10 17 15 12 10 7"></polyline>
            <line x1="15" x2="3" y1="12" y2="12"></line>
          </svg>
          Submit
        </button>
      </form>
    </div>
  )
}
