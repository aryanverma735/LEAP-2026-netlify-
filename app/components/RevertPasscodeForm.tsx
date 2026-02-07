"use client"

import type React from "react"
import { useState } from "react"
import { X, AlertTriangle, ArrowLeft } from "lucide-react"
import { businessAnalysts } from "@/app/utils/businessAnalysts"

interface RevertPasscodeFormProps {
  onSubmit: (passcode: string, comment: string, businessAnalyst: string) => void
  onCancel: () => void
  isLoading?: boolean
}

export default function RevertPasscodeForm({ onSubmit, onCancel, isLoading = false }: RevertPasscodeFormProps) {
  const [passcode, setPasscode] = useState("")
  const [comment, setComment] = useState("")
  const [businessAnalyst, setBusinessAnalyst] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!passcode.trim()) {
      setError("Please enter the passcode")
      return
    }

    if (!comment.trim()) {
      setError("Please provide a reason for reverting")
      return
    }

    if (!businessAnalyst) {
      setError("Please select a Business Analyst")
      return
    }

    if (comment.trim().length < 10) {
      setError("Please provide a more detailed reason (at least 10 characters)")
      return
    }

    onSubmit(passcode.trim(), comment.trim(), businessAnalyst)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6" />
              <h2 className="text-xl font-bold">Revert to Business Analyst Review</h2>
            </div>
            <button
              onClick={onCancel}
              className="p-1 hover:bg-red-600 rounded-full transition-colors"
              disabled={isLoading}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-red-800 mb-1">Important Notice</h3>
                <p className="text-sm text-red-700">
                  This action will revert the idea back to Business Analyst Review status. This should only be done in
                  exceptional circumstances and requires proper authorization.
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="businessAnalyst" className="block text-sm font-medium text-gray-700 mb-2">
              Select Business Analyst <span className="text-red-500">*</span>
            </label>
            <select
              id="businessAnalyst"
              value={businessAnalyst}
              onChange={(e) => setBusinessAnalyst(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              disabled={isLoading}
              required
            >
              <option value="">Choose a Business Analyst...</option>
              {businessAnalysts.map((analyst) => (
                <option key={analyst.domainId} value={analyst.domainId}>
                  {analyst.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="passcode" className="block text-sm font-medium text-gray-700 mb-2">
              Authorization Passcode <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              id="passcode"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Enter revert passcode"
              disabled={isLoading}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Contact your administrator if you don't have the revert passcode
            </p>
          </div>

          <div>
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Reverting <span className="text-red-500">*</span>
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
              placeholder="Please provide a detailed explanation for why this idea needs to be reverted back to Business Analyst Review..."
              disabled={isLoading}
              required
            />
            <p className="text-xs text-gray-500 mt-1">{comment.length}/500 characters (minimum 10 required)</p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              <ArrowLeft className="h-4 w-4" />
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Processing...
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4" />
                  Revert Idea
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
