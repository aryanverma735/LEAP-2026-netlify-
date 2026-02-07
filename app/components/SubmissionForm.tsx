"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getEmployeeData } from "../utils/excelData"
import { FUNCTIONS, TEAM_LEADS, FUNCTIONAL_MANAGERS, SAVINGS_TYPES, APPLICATION_NAMES } from "../utils/formConstants"
import { User, Building, Users, Briefcase, FileText, Lightbulb, DollarSign, MessageSquare, Send } from "lucide-react"

export default function SubmissionForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    ideaId: "",
    associateDomainId: "",
    associateName: "",
    function: "",
    teamLead: "",
    functionalManager: "",
    state: "",
    applicationName: "",
    specifyApplicationName: "",
    ideaName: "",
    problemStatement: "",
    solution: "",
    savingsType: "",
    savingsComment: "",
    submissionDateTime: "",
  })

  useEffect(() => {
    const generateUniqueIdeaId = () => {
      const timestamp = Date.now().toString(36)
      const randomStr = Math.random().toString(36).substring(2, 7)
      return `IDEA-${timestamp}-${randomStr}`.toUpperCase()
    }

    setFormData((prev) => ({ ...prev, ideaId: generateUniqueIdeaId() }))
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prevState) => ({ ...prevState, [name]: value }))

    if (name === "associateDomainId") {
      const employeeData = getEmployeeData(value)
      if (employeeData) {
        setFormData((prev) => ({
          ...prev,
          associateName: employeeData.associateName,
          function: employeeData.function,
          teamLead: employeeData.teamLead,
          functionalManager: employeeData.functionalLeader,
        }))
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const submissionData = {
        ...formData,
        submissionDateTime: new Date().toISOString(),
      }
      const res = await fetch("/api/ideas/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Submission failed")
      }
      router.push("/submission-success")
    } catch (error) {
      console.error("Error submitting idea:", error)
      alert("Error submitting idea. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-8 rounded-t-2xl">
        <div className="flex items-center gap-3 mb-4">
          <Lightbulb className="h-8 w-8" />
          <h1 className="text-3xl font-bold">Submit Your Innovative Idea</h1>
        </div>
        <p className="text-purple-100">Share your creative solutions and help us improve our processes and services</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-b-2xl shadow-xl p-8 space-y-8">
        {/* Personal Information Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="h-5 w-5 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-800">Personal Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="ideaId" className="block text-sm font-medium text-gray-700">
                Idea ID
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  id="ideaId"
                  name="ideaId"
                  required
                  readOnly
                  className="form-input pl-10 bg-gray-50 cursor-not-allowed"
                  value={formData.ideaId}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="associateDomainId" className="block text-sm font-medium text-gray-700">
                Associate Domain ID <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  id="associateDomainId"
                  name="associateDomainId"
                  required
                  className="form-input pl-10 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  value={formData.associateDomainId}
                  onChange={handleChange}
                  placeholder="Enter your domain ID"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="associateName" className="block text-sm font-medium text-gray-700">
                Associate Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  id="associateName"
                  name="associateName"
                  required
                  className="form-input pl-10 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  value={formData.associateName}
                  onChange={handleChange}
                  placeholder="Your full name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                State <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  id="state"
                  name="state"
                  required
                  className="form-input pl-10 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="Your state"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Organizational Information Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Building className="h-5 w-5 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-800">Organizational Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label htmlFor="function" className="block text-sm font-medium text-gray-700">
                Function <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  id="function"
                  name="function"
                  required
                  className="form-select pl-10 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  value={formData.function}
                  onChange={handleChange}
                >
                  <option value="">Select Function</option>
                  {FUNCTIONS.map((func) => (
                    <option key={func} value={func}>
                      {func}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="teamLead" className="block text-sm font-medium text-gray-700">
                Team Lead <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  id="teamLead"
                  name="teamLead"
                  required
                  className="form-select pl-10 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  value={formData.teamLead}
                  onChange={handleChange}
                >
                  <option value="">Select Team Lead</option>
                  {TEAM_LEADS.map((lead) => (
                    <option key={lead} value={lead}>
                      {lead}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="functionalManager" className="block text-sm font-medium text-gray-700">
                Functional Manager <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  id="functionalManager"
                  name="functionalManager"
                  required
                  className="form-select pl-10 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  value={formData.functionalManager}
                  onChange={handleChange}
                >
                  <option value="">Select Functional Manager</option>
                  {FUNCTIONAL_MANAGERS.map((manager) => (
                    <option key={manager} value={manager}>
                      {manager}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Application Information Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Building className="h-5 w-5 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-800">Application Information</h2>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <label htmlFor="applicationName" className="block text-sm font-medium text-gray-700">
                Application Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  id="applicationName"
                  name="applicationName"
                  required
                  className="form-select pl-10 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  value={formData.applicationName}
                  onChange={handleChange}
                >
                  <option value="">Select Application</option>
                  {APPLICATION_NAMES.map((app) => (
                    <option key={app} value={app}>
                      {app}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {formData.applicationName === "Other" && (
              <div className="space-y-2">
                <label htmlFor="specifyApplicationName" className="block text-sm font-medium text-gray-700">
                  Specify Application Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    id="specifyApplicationName"
                    name="specifyApplicationName"
                    required
                    className="form-input pl-10 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    value={formData.specifyApplicationName}
                    onChange={handleChange}
                    placeholder="Enter the application name"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Idea Details Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="h-5 w-5 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-800">Idea Details</h2>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="ideaName" className="block text-sm font-medium text-gray-700">
                Idea Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lightbulb className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  id="ideaName"
                  name="ideaName"
                  required
                  className="form-input pl-10 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  value={formData.ideaName}
                  onChange={handleChange}
                  placeholder="Give your idea a compelling name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="problemStatement" className="block text-sm font-medium text-gray-700">
                Problem Statement <span className="text-red-500">*</span>
              </label>
              <textarea
                id="problemStatement"
                name="problemStatement"
                required
                rows={4}
                className="form-textarea focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                value={formData.problemStatement}
                onChange={handleChange}
                placeholder="Describe the problem or challenge you've identified..."
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="solution" className="block text-sm font-medium text-gray-700">
                Proposed Solution <span className="text-red-500">*</span>
              </label>
              <textarea
                id="solution"
                name="solution"
                required
                rows={4}
                className="form-textarea focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                value={formData.solution}
                onChange={handleChange}
                placeholder="Explain your proposed solution in detail..."
              />
            </div>
          </div>
        </div>

        {/* Savings Information Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="h-5 w-5 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-800">Savings Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="savingsType" className="block text-sm font-medium text-gray-700">
                Estimated Savings Type <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  id="savingsType"
                  name="savingsType"
                  required
                  className="form-select pl-10 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  value={formData.savingsType}
                  onChange={handleChange}
                >
                  <option value="">Select savings type</option>
                  {SAVINGS_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="savingsComment" className="block text-sm font-medium text-gray-700">
                Additional Savings Details
                <span className="text-gray-500 text-xs ml-1">(Optional)</span>
              </label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <textarea
                  id="savingsComment"
                  name="savingsComment"
                  rows={6}
                  className="form-textarea pl-10 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 min-h-[150px]"
                  value={formData.savingsComment}
                  onChange={handleChange}
                  placeholder="Provide additional details about expected savings..."
                />
                <button
                  type="button"
                  onClick={() => {
                    // Add maximize functionality here
                    const textarea = document.getElementById("savingsComment") as HTMLTextAreaElement
                    if (textarea.style.position === "fixed") {
                      // Restore normal view
                      textarea.style.cssText = ""
                      textarea.rows = 6
                      textarea.className =
                        "form-textarea pl-10 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 min-h-[150px]"
                    } else {
                      // Maximize view
                      textarea.style.cssText = `
                        position: fixed !important;
                        top: 10% !important;
                        left: 10% !important;
                        width: 80% !important;
                        height: 70% !important;
                        z-index: 1000 !important;
                        background: white !important;
                        border: 2px solid #8b5cf6 !important;
                        border-radius: 12px !important;
                        padding: 20px !important;
                        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
                      `
                      textarea.rows = 20
                    }
                  }}
                  className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                  </svg>
                </button>
              </div>
              <div className="text-xs text-gray-500">{formData.savingsComment.length} characters</div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-6 border-t border-gray-200">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3 shadow-lg"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Submitting Your Idea...
              </>
            ) : (
              <>
                <Send className="h-5 w-5" />
                Submit Your Idea
              </>
            )}
          </button>
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>
            All fields marked with <span className="text-red-500">*</span> are required
          </p>
        </div>
      </form>
    </div>
  )
}
