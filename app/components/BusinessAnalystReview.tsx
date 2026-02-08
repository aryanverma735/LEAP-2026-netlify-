"use client"

import React from "react"
import { useState, useEffect } from "react"
import PasscodeForm from "./PasscodeForm"
import IdeaFilter from "./IdeaFilter"
import DateFilter from "./DateFilter"
import {
  ChevronUp,
  ChevronDown,
  Filter,
  User,
  Download,
  CheckCircle,
  XCircle,
  X,
  Search,
  AlertTriangle,
  Calendar,
  TrendingUp,
  Building2,
  FileText,
  Loader,
  RefreshCw,
} from "lucide-react"
import { businessAnalysts, getBAByDomainId, getBAByName } from "../utils/businessAnalysts"

interface Idea {
  id: string
  ideaId: string
  associateDomainId: string
  associateName: string
  function: string
  teamLead: string
  functionalManager: string
  state: string
  applicationName?: string
  specifyApplicationName?: string
  ideaName: string
  problemStatement: string
  solution: string
  savingsType: string
  savingsComment: string
  submissionDateTime: string
  revertHistory?: Array<{
    revertedBy: string
    revertedByDomainId: string
    revertReason: string
    revertDateTime: string
    previousStatus: string
  }>
}

export default function BusinessAnalystReview() {
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [approverData, setApproverData] = useState({ domainId: "", name: "", selectedFromDropdown: "" })
  const [rejectionComment, setRejectionComment] = useState("")
  const [currentIdeaId, setCurrentIdeaId] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null) // tracks idea id being acted on
  const [actionError, setActionError] = useState<string | null>(null)
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)
  const [filter, setFilter] = useState({
    associateName: "",
    associateDomainId: "",
    teamLead: "",
    functionalManager: "",
    applicationName: "",
    specifyApplicationName: "",
  })
  const [dateFilter, setDateFilter] = useState({
    startDate: "",
    endDate: "",
  })
  const [expandedRows, setExpandedRows] = useState<{ [key: string]: boolean }>({})
  const [showFilters, setShowFilters] = useState(false)
  const [showDateFilters, setShowDateFilters] = useState(false)
  const [showBAInfo, setShowBAInfo] = useState(true)
  const [focusedIdea, setFocusedIdea] = useState<Idea | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const fetchIdeas = async () => {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch("/api/ideas?collection=pendingIdeas")
      if (!res.ok) throw new Error("Failed to fetch pending ideas")
      const data = await res.json()
      const fetchedIdeas: Idea[] = data.ideas || []

      setIdeas(fetchedIdeas)

      if (fetchedIdeas.length === 0) {
        setError("No pending ideas found. Ideas may be in other collections or not yet submitted.")
      }
    } catch (err: any) {
      console.error("Error fetching ideas:", err)
      setError(`Failed to fetch ideas: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchIdeas()
    }
  }, [isAuthenticated])

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const handleBASelection = (value: string) => {
    const ba = getBAByDomainId(value) || getBAByName(value)
    if (ba) {
      setApproverData({
        domainId: ba.domainId,
        name: ba.name,
        selectedFromDropdown: value,
      })
    }
  }

  const handleApprove = async (id: string) => {
    if (!approverData.domainId || !approverData.name) {
      setActionError("Please select or enter Approver Domain ID and Name before approving.")
      return
    }

    setActionLoading(id)
    setActionError(null)
    setActionSuccess(null)

    try {
      const res = await fetch(`/api/ideas/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          approverDomainId: approverData.domainId,
          approverName: approverData.name,
        }),
      })

      if (!res.ok) {
        let errorMsg = "Failed to approve idea"
        try {
          const data = await res.json()
          errorMsg = data.error || errorMsg
        } catch {
          // non-JSON response
        }
        throw new Error(errorMsg)
      }

      setIdeas(ideas.filter((idea) => idea.id !== id))
      setCurrentIdeaId(null)
      setFocusedIdea(null)
      setActionSuccess("Idea approved successfully!")
      setTimeout(() => setActionSuccess(null), 4000)
    } catch (error) {
      const message = error instanceof Error ? error.message : "An unexpected error occurred"
      console.error("Error approving idea:", message)
      setActionError(message)
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (id: string) => {
    if (!approverData.domainId || !approverData.name || !rejectionComment) {
      setActionError("Please enter Approver Domain ID, Name, and Rejection Comment before rejecting.")
      return
    }

    setActionLoading(id)
    setActionError(null)
    setActionSuccess(null)

    try {
      const res = await fetch(`/api/ideas/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          approverDomainId: approverData.domainId,
          approverName: approverData.name,
          rejectionComment,
        }),
      })

      if (!res.ok) {
        let errorMsg = "Failed to reject idea"
        try {
          const data = await res.json()
          errorMsg = data.error || errorMsg
        } catch {
          // non-JSON response
        }
        throw new Error(errorMsg)
      }

      setIdeas(ideas.filter((idea) => idea.id !== id))
      setRejectionComment("")
      setCurrentIdeaId(null)
      setFocusedIdea(null)
      setActionSuccess("Idea rejected successfully!")
      setTimeout(() => setActionSuccess(null), 4000)
    } catch (error) {
      const message = error instanceof Error ? error.message : "An unexpected error occurred"
      console.error("Error rejecting idea:", message)
      setActionError(message)
    } finally {
      setActionLoading(null)
    }
  }

  const handleApproverDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setApproverData((prev) => ({ ...prev, [name]: value }))
  }

  const handleExport = () => {
    const escapeCSV = (field) => {
      if (field === null || field === undefined) return '""'
      const stringField = String(field).replace(/"/g, '""')
      const cleanField = stringField.replace(/\n|\r/g, " ")
      return `"${cleanField}"`
    }

    const headers = [
      "Idea Id",
      "Associate Name",
      "Associate Domain ID",
      "Function",
      "Team Lead",
      "Functional Manager",
      "State",
      "Application Name",
      "Specify Application Name",
      "Idea Name",
      "Problem Statement",
      "Solution",
      "Savings Type",
      "Savings Comment",
      "Submission Date/Time",
      "Revert History",
    ]

    const csvRows = [
      headers.map((header) => escapeCSV(header)).join(","),
      ...filteredIdeas.map((idea) => {
        const revertHistoryText =
          idea.revertHistory
            ?.map(
              (r) =>
                `${r.revertDateTime}: ${r.revertedBy} (${r.revertedByDomainId}) - ${r.revertReason} (From: ${r.previousStatus})`,
            )
            .join("; ") || ""

        return [
          idea.ideaId,
          idea.associateName,
          idea.associateDomainId,
          idea.function,
          idea.teamLead,
          idea.functionalManager,
          idea.state,
          idea.applicationName || "",
          idea.specifyApplicationName || "",
          idea.ideaName,
          idea.problemStatement,
          idea.solution,
          idea.savingsType,
          idea.savingsComment,
          idea.submissionDateTime,
          revertHistoryText,
        ]
          .map((field) => escapeCSV(field))
          .join(",")
      }),
    ]

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `pending_ideas_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Filter ideas based on search, filters, and date
  const filteredIdeas = ideas
    .filter((idea) => {
      // Text filters - only apply if filter values are not empty
      const matchesTextFilter =
        (filter.associateName === "" ||
          idea.associateName.toLowerCase().includes(filter.associateName.toLowerCase())) &&
        (filter.associateDomainId === "" ||
          idea.associateDomainId.toLowerCase().includes(filter.associateDomainId.toLowerCase())) &&
        (filter.teamLead === "" || idea.teamLead.toLowerCase().includes(filter.teamLead.toLowerCase())) &&
        (filter.functionalManager === "" ||
          idea.functionalManager.toLowerCase().includes(filter.functionalManager.toLowerCase())) &&
        (filter.applicationName === "" ||
          (idea.applicationName &&
            idea.applicationName.toLowerCase().includes(filter.applicationName.toLowerCase()))) &&
        (filter.specifyApplicationName === "" ||
          (idea.specifyApplicationName &&
            idea.specifyApplicationName.toLowerCase().includes(filter.specifyApplicationName.toLowerCase())))

      // Search term filter - only apply if search term is not empty
      const matchesSearch =
        searchTerm === "" ||
        Object.values(idea).some(
          (value) => typeof value === "string" && value.toLowerCase().includes(searchTerm.toLowerCase()),
        )

      // Date filter - only apply if dates are set
      const matchesDateFilter = (() => {
        if (!dateFilter.startDate && !dateFilter.endDate) return true

        const ideaDate = new Date(idea.submissionDateTime)
        const startDate = dateFilter.startDate ? new Date(dateFilter.startDate) : null
        const endDate = dateFilter.endDate ? new Date(dateFilter.endDate + "T23:59:59") : null

        if (startDate && endDate) {
          return ideaDate >= startDate && ideaDate <= endDate
        } else if (startDate) {
          return ideaDate >= startDate
        } else if (endDate) {
          return ideaDate <= endDate
        }
        return true
      })()

      return matchesTextFilter && matchesSearch && matchesDateFilter
    })
    .sort((a, b) => new Date(b.submissionDateTime).getTime() - new Date(a.submissionDateTime).getTime())

  // Separate reverted and new ideas
  const revertedIdeas = filteredIdeas.filter((idea) => idea.revertHistory && idea.revertHistory.length > 0)
  const newIdeas = filteredIdeas.filter((idea) => !idea.revertHistory || idea.revertHistory.length === 0)

  // Statistics
  const stats = {
    total: ideas.length,
    new: newIdeas.length,
    reverted: revertedIdeas.length,
    filtered: filteredIdeas.length,
  }

  if (!isAuthenticated) {
    return <PasscodeForm onCorrectPasscode={() => setIsAuthenticated(true)} />
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-gray-600">Loading pending ideas...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-800 mb-2">Error Loading Ideas</h2>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={fetchIdeas}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors mx-auto"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  // If an idea is focused, show a detailed view
  if (focusedIdea) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <div className="container mx-auto px-4 py-8 space-y-6">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => setFocusedIdea(null)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
            >
              <ChevronUp className="h-4 w-4" /> Back to List
            </button>
            <div className="text-center flex-grow">
              <h1 className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
                {focusedIdea.ideaName}
                {focusedIdea.revertHistory && focusedIdea.revertHistory.length > 0 && (
                  <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                    REVERTED
                  </span>
                )}
              </h1>
              <p className="text-gray-600">ID: {focusedIdea.ideaId}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Idea Details Card */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 to-blue-600 p-6 text-white">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Building2 className="h-6 w-6" />
                    Idea Details
                  </h2>
                </div>
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium text-gray-500">Submitted By</span>
                        <p className="font-semibold text-gray-800">{focusedIdea.associateName}</p>
                        <p className="text-sm text-gray-600">({focusedIdea.associateDomainId})</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Function</span>
                        <p className="font-medium text-gray-800">{focusedIdea.function}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Team Lead</span>
                        <p className="font-medium text-gray-800">{focusedIdea.teamLead}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Application Name</span>
                        <p className="font-medium text-gray-800">{focusedIdea.applicationName || "Not specified"}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Specify Application Name</span>
                        <p className="font-medium text-gray-800">
                          {focusedIdea.specifyApplicationName || "Not specified"}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium text-gray-500">Functional Manager</span>
                        <p className="font-medium text-gray-800">{focusedIdea.functionalManager}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">State</span>
                        <p className="font-medium text-gray-800">{focusedIdea.state}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Submission Date</span>
                        <p className="font-medium text-gray-800">
                          {new Date(focusedIdea.submissionDateTime).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Revert History */}
              {focusedIdea.revertHistory && focusedIdea.revertHistory.length > 0 && (
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl shadow-lg border border-yellow-200 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="h-6 w-6 text-yellow-600" />
                    <h3 className="text-xl font-bold text-yellow-800">Revert History</h3>
                  </div>
                  <div className="space-y-4">
                    {focusedIdea.revertHistory.map((revert, index) => (
                      <div key={index} className="bg-white p-4 rounded-lg border-l-4 border-yellow-400 shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <span className="text-sm font-medium text-gray-500">Reverted by</span>
                            <p className="font-semibold text-gray-800">
                              {revert.revertedBy} ({revert.revertedByDomainId})
                            </p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-500">Date</span>
                            <p className="font-medium text-gray-800">
                              {new Date(revert.revertDateTime).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-500">Previous Status</span>
                            <p className="font-medium text-gray-800">{revert.previousStatus}</p>
                          </div>
                          <div className="md:col-span-2">
                            <span className="text-sm font-medium text-gray-500">Reason</span>
                            <p className="text-gray-700 whitespace-pre-line mt-1">{revert.revertReason}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Problem & Solution */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Problem Statement</h3>
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed">{focusedIdea.problemStatement}</p>
                </div>
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Solution</h3>
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed">{focusedIdea.solution}</p>
                </div>
              </div>

              {/* Savings Information */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Savings Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Savings Type</span>
                    <p className="font-semibold text-gray-800">{focusedIdea.savingsType}</p>
                  </div>
                  {focusedIdea.savingsComment && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Additional Details</span>
                      <p className="text-gray-700 whitespace-pre-line">{focusedIdea.savingsComment}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Business Analyst Information */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  Business Analyst Information
                </h3>
                <div className="space-y-4">
                  <select
                    value={approverData.selectedFromDropdown}
                    onChange={(e) => handleBASelection(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Business Analyst</option>
                    {businessAnalysts.map((ba) => (
                      <option key={ba.domainId} value={ba.domainId}>
                        {ba.name} ({ba.domainId})
                      </option>
                    ))}
                  </select>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Approver Domain ID</label>
                      <input
                        type="text"
                        name="domainId"
                        placeholder="Approver Domain ID"
                        value={approverData.domainId}
                        onChange={handleApproverDataChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Approver Name</label>
                      <input
                        type="text"
                        name="name"
                        placeholder="Approver Name"
                        value={approverData.name}
                        onChange={handleApproverDataChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Notification Banners */}
              {actionError && (
                <div role="alert" className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
                  <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                  <p className="flex-1 text-sm text-red-700">{actionError}</p>
                  <button type="button" onClick={() => setActionError(null)} className="shrink-0 text-red-500 hover:text-red-700" aria-label="Dismiss error">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
              {actionSuccess && (
                <div role="status" className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
                  <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                  <p className="flex-1 text-sm text-green-700">{actionSuccess}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => handleApprove(focusedIdea.id)}
                  disabled={!!actionLoading}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-4 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {actionLoading === focusedIdea.id ? (
                    <Loader className="h-5 w-5 animate-spin" />
                  ) : (
                    <CheckCircle className="h-5 w-5" />
                  )}{" "}
                  Approve Idea
                </button>

                <button
                  onClick={() => {
                    setCurrentIdeaId(focusedIdea.id)
                    setRejectionComment("")
                  }}
                  disabled={!!actionLoading}
                  className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-4 rounded-lg hover:from-red-600 hover:to-red-700 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <XCircle className="h-5 w-5" /> Prepare Rejection
                </button>
              </div>

              {currentIdeaId === focusedIdea.id && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-red-800 mb-4">Rejection Details</h3>
                  <textarea
                    placeholder="Rejection comment (required for rejection)"
                    value={rejectionComment}
                    onChange={(e) => setRejectionComment(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                    rows={4}
                    required
                  />
                  <button
                    onClick={() => handleReject(focusedIdea.id)}
                    disabled={!!actionLoading}
                    className="w-full mt-4 bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-4 rounded-lg hover:from-red-600 hover:to-red-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {actionLoading === focusedIdea.id ? (
                      <Loader className="h-5 w-5 animate-spin" />
                    ) : (
                      <XCircle className="h-5 w-5" />
                    )}{" "}
                    Confirm Rejection
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Business Analyst Review</h1>
            <p className="text-gray-600">Review and evaluate pending innovation ideas</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                showFilters
                  ? "bg-purple-600 text-white shadow-lg"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              <Filter className="h-4 w-4" />
              Filters
            </button>
            <button
              onClick={() => setShowDateFilters(!showDateFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                showDateFilters
                  ? "bg-purple-600 text-white shadow-lg"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              <Calendar className="h-4 w-4" />
              Date Filter
            </button>
            <button
              onClick={() => setShowBAInfo(!showBAInfo)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                showBAInfo
                  ? "bg-purple-600 text-white shadow-lg"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              <User className="h-4 w-4" />
              BA Info
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all transform hover:scale-105 shadow-lg"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
            <button
              onClick={fetchIdeas}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Total Ideas</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
              <Building2 className="h-8 w-8 text-purple-200" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">New Ideas</p>
                <p className="text-3xl font-bold">{stats.new}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-200" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm">Reverted Ideas</p>
                <p className="text-3xl font-bold">{stats.reverted}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-200" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Filtered Results</p>
                <p className="text-3xl font-bold">{stats.filtered}</p>
              </div>
              <Search className="h-8 w-8 text-green-200" />
            </div>
          </div>
        </div>

        {/* Notification Banners */}
        {actionError && (
          <div role="alert" className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
            <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
            <p className="flex-1 text-sm text-red-700">{actionError}</p>
            <button type="button" onClick={() => setActionError(null)} className="shrink-0 text-red-500 hover:text-red-700" aria-label="Dismiss error">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        {actionSuccess && (
          <div role="status" className="mb-6 flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
            <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
            <p className="flex-1 text-sm text-green-700">{actionSuccess}</p>
          </div>
        )}

        {/* Business Analyst Information */}
        {showBAInfo && (
          <div className="mb-6">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                Business Analyst Information
              </h3>
              <div className="space-y-4">
                <select
                  value={approverData.selectedFromDropdown}
                  onChange={(e) => handleBASelection(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="">Select Business Analyst</option>
                  {businessAnalysts.map((ba) => (
                    <option key={ba.domainId} value={ba.domainId}>
                      {ba.name} ({ba.domainId})
                    </option>
                  ))}
                </select>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="domainId"
                    placeholder="Approver Domain ID"
                    value={approverData.domainId}
                    onChange={handleApproverDataChange}
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    required
                  />
                  <input
                    type="text"
                    name="name"
                    placeholder="Approver Name"
                    value={approverData.name}
                    onChange={handleApproverDataChange}
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        {showFilters && (
          <div className="mb-6">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Filter Ideas</h3>
                <div className="relative w-full max-w-md ml-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search all fields..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </div>
              <IdeaFilter filter={filter} setFilter={setFilter} />
            </div>
          </div>
        )}

        {/* Date Filters */}
        {showDateFilters && (
          <div className="mb-6">
            <DateFilter
              startDate={dateFilter.startDate}
              endDate={dateFilter.endDate}
              onStartDateChange={(date) => setDateFilter((prev) => ({ ...prev, startDate: date }))}
              onEndDateChange={(date) => setDateFilter((prev) => ({ ...prev, endDate: date }))}
              onClear={() => setDateFilter({ startDate: "", endDate: "" })}
            />
          </div>
        )}

        {/* Results Summary */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 mb-6 border border-purple-200">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-700">Total Ideas:</span>
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-bold">{ideas.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-700">New Ideas:</span>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-bold">{newIdeas.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-700">Reverted Ideas:</span>
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-bold">
                  {revertedIdeas.length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-700">Filtered Results:</span>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-bold">
                  {filteredIdeas.length}
                </span>
              </div>
            </div>
            {(dateFilter.startDate || dateFilter.endDate) && (
              <div className="text-sm text-gray-600">
                📅 Date Range: {dateFilter.startDate || "Start"} to {dateFilter.endDate || "End"}
              </div>
            )}
          </div>
        </div>

        {/* No Ideas Message */}
        {ideas.length === 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 text-center">
            <FileText className="h-16 w-16 text-blue-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-blue-800 mb-2">No Pending Ideas</h3>
            <p className="text-blue-700 mb-4">
              There are currently no ideas pending review. Ideas will appear here once they are submitted.
            </p>
            <button
              onClick={fetchIdeas}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh to Check Again
            </button>
          </div>
        )}

        {/* Reverted Ideas Section */}
        {revertedIdeas.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
              <h2 className="text-xl font-bold text-yellow-800">Reverted Ideas (Require Re-evaluation)</h2>
            </div>
            <div className="bg-white rounded-2xl shadow-lg border-2 border-yellow-200 overflow-hidden">
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 px-6 py-4 border-b border-yellow-200">
                <p className="text-yellow-800 font-medium">
                  These ideas have been reverted and need immediate attention
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-yellow-50">
                    <tr>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-12"></th>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Idea ID
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Associate
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Function
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Idea Name
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Last Reverted
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-yellow-200">
                    {revertedIdeas.map((idea) => (
                      <React.Fragment key={idea.id}>
                        <tr className="hover:bg-yellow-25 transition-colors">
                          <td className="px-4 py-4">
                            <button
                              onClick={() => toggleRow(idea.id)}
                              className="p-1 hover:bg-yellow-200 rounded-full transition-colors"
                            >
                              {expandedRows[idea.id] ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </button>
                          </td>
                          <td className="px-4 py-4 text-sm font-medium text-gray-900">{idea.ideaId}</td>
                          <td className="px-4 py-4 text-sm text-gray-700">{idea.associateName}</td>
                          <td className="px-4 py-4 text-sm text-gray-700">{idea.function}</td>
                          <td className="px-4 py-4">
                            <button
                              onClick={() => setFocusedIdea(idea)}
                              className="text-purple-600 hover:text-purple-800 font-medium hover:underline transition-colors"
                            >
                              {idea.ideaName}
                            </button>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-700">
                            {idea.revertHistory &&
                              idea.revertHistory.length > 0 &&
                              new Date(
                                idea.revertHistory[idea.revertHistory.length - 1].revertDateTime,
                              ).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleApprove(idea.id)}
                                disabled={!!actionLoading}
                                className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Approve"
                              >
                                {actionLoading === idea.id ? <Loader className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                              </button>
                              <button
                                onClick={() => setFocusedIdea(idea)}
                                className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                                title="Review"
                              >
                                <Search className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setCurrentIdeaId(idea.id)
                                  setRejectionComment("")
                                }}
                                disabled={!!actionLoading}
                                className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Reject"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            </div>
                            {currentIdeaId === idea.id && (
                              <div className="mt-3 space-y-2">
                                <textarea
                                  placeholder="Rejection comment (required)"
                                  value={rejectionComment}
                                  onChange={(e) => setRejectionComment(e.target.value)}
                                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-red-500 focus:border-red-500 resize-none"
                                  rows={3}
                                  required
                                />
                                <button
                                  onClick={() => handleReject(idea.id)}
                                  disabled={!!actionLoading}
                                  className="w-full bg-red-600 text-white py-1 px-2 rounded text-xs hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {actionLoading === idea.id ? "Rejecting..." : "Confirm Rejection"}
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                        {expandedRows[idea.id] && (
                          <tr>
                            <td colSpan={7} className="px-0 py-0">
                              <div className="bg-yellow-50 p-6 border-t border-yellow-200">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                                  <div>
                                    <h4 className="font-semibold text-gray-700 mb-2">Problem Statement</h4>
                                    <p className="text-sm text-gray-600 leading-relaxed">{idea.problemStatement}</p>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-gray-700 mb-2">Solution</h4>
                                    <p className="text-sm text-gray-600 leading-relaxed">{idea.solution}</p>
                                  </div>
                                </div>
                                {idea.revertHistory && idea.revertHistory.length > 0 && (
                                  <div className="mb-4">
                                    <h4 className="font-semibold text-gray-700 mb-2">Latest Revert Reason</h4>
                                    <div className="bg-white p-4 rounded-lg border-l-4 border-yellow-400">
                                      <p className="text-sm text-gray-800">
                                        {idea.revertHistory[idea.revertHistory.length - 1].revertReason}
                                      </p>
                                      <p className="text-xs text-gray-500 mt-2">
                                        By: {idea.revertHistory[idea.revertHistory.length - 1].revertedBy} on{" "}
                                        {new Date(
                                          idea.revertHistory[idea.revertHistory.length - 1].revertDateTime,
                                        ).toLocaleString()}
                                      </p>
                                    </div>
                                  </div>
                                )}
                                <div className="flex justify-end">
                                  <button
                                    onClick={() => setFocusedIdea(idea)}
                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                                  >
                                    View Full Details & History
                                  </button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* New Ideas Section */}
        {newIdeas.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FileText className="h-6 w-6 text-blue-600" />
              New Ideas
            </h2>
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-12"></th>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Idea ID
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Associate
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Function
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Idea Name
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Submission Date
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {newIdeas.map((idea) => (
                      <React.Fragment key={idea.id}>
                        <tr className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-4">
                            <button
                              onClick={() => toggleRow(idea.id)}
                              className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                            >
                              {expandedRows[idea.id] ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </button>
                          </td>
                          <td className="px-4 py-4 text-sm font-medium text-gray-900">{idea.ideaId}</td>
                          <td className="px-4 py-4 text-sm text-gray-700">{idea.associateName}</td>
                          <td className="px-4 py-4 text-sm text-gray-700">{idea.function}</td>
                          <td className="px-4 py-4">
                            <button
                              onClick={() => setFocusedIdea(idea)}
                              className="text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors"
                            >
                              {idea.ideaName}
                            </button>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-700">
                            {new Date(idea.submissionDateTime).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleApprove(idea.id)}
                                disabled={!!actionLoading}
                                className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Approve"
                              >
                                {actionLoading === idea.id ? <Loader className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                              </button>
                              <button
                                onClick={() => setFocusedIdea(idea)}
                                className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                                title="Review"
                              >
                                <Search className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setCurrentIdeaId(idea.id)
                                  setRejectionComment("")
                                }}
                                disabled={!!actionLoading}
                                className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Reject"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            </div>
                            {currentIdeaId === idea.id && (
                              <div className="mt-3 space-y-2">
                                <textarea
                                  placeholder="Rejection comment (required)"
                                  value={rejectionComment}
                                  onChange={(e) => setRejectionComment(e.target.value)}
                                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-red-500 focus:border-red-500 resize-none"
                                  rows={3}
                                  required
                                />
                                <button
                                  onClick={() => handleReject(idea.id)}
                                  disabled={!!actionLoading}
                                  className="w-full bg-red-600 text-white py-1 px-2 rounded text-xs hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {actionLoading === idea.id ? "Rejecting..." : "Confirm Rejection"}
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                        {expandedRows[idea.id] && (
                          <tr>
                            <td colSpan={7} className="px-0 py-0">
                              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-t">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div>
                                    <h4 className="font-semibold text-gray-700 mb-2">Problem Statement</h4>
                                    <p className="text-sm text-gray-600 leading-relaxed">{idea.problemStatement}</p>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-gray-700 mb-2">Solution</h4>
                                    <p className="text-sm text-gray-600 leading-relaxed">{idea.solution}</p>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-gray-700 mb-2">Savings Type</h4>
                                    <p className="text-sm text-gray-600">{idea.savingsType}</p>
                                  </div>
                                  {idea.savingsComment && (
                                    <div>
                                      <h4 className="font-semibold text-gray-700 mb-2">Savings Comment</h4>
                                      <p className="text-sm text-gray-600">{idea.savingsComment}</p>
                                    </div>
                                  )}
                                  <div>
                                    <h4 className="font-semibold text-gray-700 mb-2">Application Name</h4>
                                    <p className="text-sm text-gray-600">{idea.applicationName || "Not specified"}</p>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-gray-700 mb-2">Specify Application Name</h4>
                                    <p className="text-sm text-gray-600">
                                      {idea.specifyApplicationName || "Not specified"}
                                    </p>
                                  </div>
                                </div>
                                <div className="mt-4 flex justify-end">
                                  <button
                                    onClick={() => setFocusedIdea(idea)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                                  >
                                    View Full Details
                                  </button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
