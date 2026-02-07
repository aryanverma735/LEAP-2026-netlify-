"use client"

import React from "react"
import { useState, useEffect } from "react"
import IdeaFilter from "./IdeaFilter"
import DateFilter from "./DateFilter"
import {
  ChevronUp,
  ChevronDown,
  Filter,
  Download,
  Search,
  Calendar,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock,
  Building2,
  BarChart3,
  RotateCcw,
} from "lucide-react"

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
  approverDomainId?: string
  approverName?: string
  status?: string
  implementedDate?: string
  rejectedDate?: string
  actualSavings?: string
  rejectionComment?: string
  approvalDateTime?: string
  notInScopeReason?: string
  revertHistory?: Array<{
    revertedBy: string
    revertedByDomainId: string
    revertReason: string
    revertDateTime: string
    previousStatus: string
  }>
}

export default function AllIdeas() {
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [filter, setFilter] = useState({
    associateName: "",
    associateDomainId: "",
    teamLead: "",
    functionalManager: "",
  })
  const [dateFilter, setDateFilter] = useState({
    startDate: "",
    endDate: "",
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [expandedRows, setExpandedRows] = useState<{ [key: string]: boolean }>({})
  const [showFilters, setShowFilters] = useState(false)
  const [showDateFilters, setShowDateFilters] = useState(false)
  const [focusedIdea, setFocusedIdea] = useState<Idea | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [excludeReverted, setExcludeReverted] = useState(true)

  useEffect(() => {
    const fetchIdeas = async () => {
      const res = await fetch("/api/ideas")
      const data = await res.json()

      const approvedIdeas: Idea[] = (data.approvedIdeas || [])
      const rejectedIdeas: Idea[] = (data.rejectedIdeas || [])
      const pendingIdeas: Idea[] = (data.pendingIdeas || []).map((idea: Idea) => ({
        ...idea,
        status: idea.status || "Pending",
      }))

      setIdeas([...approvedIdeas, ...rejectedIdeas, ...pendingIdeas])
    }
    fetchIdeas()
  }, [])

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const getStatusPriority = (idea: Idea) => {
    // Check if reverted
    if (idea.revertHistory && idea.revertHistory.length > 0) return 7 // Lowest priority

    if (idea.status === "Implemented") return 5
    if (idea.status === "Not in Scope") return 6
    if (idea.status && idea.status !== "Pending") return 4 // Approved/In Progress
    if (idea.rejectionComment) return 8 // Rejected
    return 1 // Pending/New
  }

  const getStatusText = (idea: Idea) => {
    if (idea.revertHistory && idea.revertHistory.length > 0) return "Reverted"
    if (idea.status === "Implemented") return "Implemented"
    if (idea.status === "Not in Scope") return "Not in Scope"
    if (idea.status && idea.status !== "Pending") return idea.status
    if (idea.rejectionComment) return "Rejected"
    return "Pending"
  }

  const filteredIdeas = ideas
    .filter((idea) => {
      // Exclude reverted filter
      if (excludeReverted && idea.revertHistory && idea.revertHistory.length > 0) {
        return false
      }

      const matchesTextFilter =
        (idea.associateName?.toLowerCase() || "").includes(filter.associateName.toLowerCase()) &&
        (idea.associateDomainId?.toLowerCase() || "").includes(filter.associateDomainId.toLowerCase()) &&
        (idea.teamLead?.toLowerCase() || "").includes(filter.teamLead.toLowerCase()) &&
        (idea.functionalManager?.toLowerCase() || "").includes(filter.functionalManager.toLowerCase()) &&
        (searchTerm === "" ||
          Object.values(idea).some(
            (value) => typeof value === "string" && value.toLowerCase().includes(searchTerm.toLowerCase()),
          ))

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

      return matchesTextFilter && matchesDateFilter
    })
    .sort((a, b) => {
      // First sort by status priority
      const priorityA = getStatusPriority(a)
      const priorityB = getStatusPriority(b)

      if (priorityA !== priorityB) {
        return priorityA - priorityB
      }

      // Then by last updated (submission time for now)
      return new Date(b.submissionDateTime).getTime() - new Date(a.submissionDateTime).getTime()
    })

  const handleExport = () => {
    try {
      setIsExporting(true)

      const ideasToExport =
        showFilters || searchTerm || dateFilter.startDate || dateFilter.endDate ? filteredIdeas : ideas

      console.log(`Exporting ${ideasToExport.length} ideas out of ${ideas.length} total ideas`)

      const escapeCSV = (field: any) => {
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
        "Submission Date",
        "Approver Name",
        "Approver Domain ID",
        "Status",
        "Approval Date/Time",
        "Implemented/Rejected Date",
        "Actual Savings",
        "Rejection Reason",
        "Not In Scope Reason",
        "Revert History",
      ]

      const csvRows = [
        headers.map((header) => escapeCSV(header)).join(","),
        ...ideasToExport.map((idea) => {
          const rowData = [
            idea.ideaId || "",
            idea.associateName || "",
            idea.associateDomainId || "",
            idea.function || "",
            idea.teamLead || "",
            idea.functionalManager || "",
            idea.state || "",
            idea.applicationName || "",
            idea.specifyApplicationName || "",
            idea.ideaName || "",
            idea.problemStatement || "",
            idea.solution || "",
            idea.savingsType || "",
            idea.savingsComment || "",
            idea.submissionDateTime || "",
            idea.approverName || "",
            idea.approverDomainId || "",
            getStatusText(idea),
            idea.approvalDateTime || "",
            idea.implementedDate || idea.rejectedDate || "",
            idea.actualSavings || "",
            idea.rejectionComment || "",
            idea.notInScopeReason || "",
            idea.revertHistory ? JSON.stringify(idea.revertHistory) : "",
          ]
          return rowData.map((field) => escapeCSV(field)).join(",")
        }),
      ]

      const csvContent = csvRows.join("\n")
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", `all_ideas_${new Date().toISOString().slice(0, 10)}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      setIsExporting(false)
    } catch (error) {
      console.error("Error exporting ideas:", error)
      alert("An error occurred while exporting ideas. Please try again.")
      setIsExporting(false)
    }
  }

  // Statistics
  const stats = {
    total: ideas.length,
    approved: ideas.filter((idea) => idea.status && idea.status !== "Pending" && !idea.rejectionComment).length,
    rejected: ideas.filter((idea) => idea.rejectionComment).length,
    pending: ideas.filter((idea) => idea.status === "Pending" || (!idea.status && !idea.rejectionComment)).length,
    implemented: ideas.filter((idea) => idea.status === "Implemented").length,
    notInScope: ideas.filter((idea) => idea.status === "Not in Scope").length,
    reverted: ideas.filter((idea) => idea.revertHistory && idea.revertHistory.length > 0).length,
    filtered: filteredIdeas.length,
  }

  // If an idea is focused, show a detailed view
  if (focusedIdea) {
    const getStatusColor = (idea: Idea) => {
      if (idea.status === "Implemented") return "text-green-600"
      if (idea.status === "Pending" || (!idea.status && !idea.rejectionComment)) return "text-yellow-600"
      if (idea.status && idea.status !== "Pending") return "text-blue-600"
      return "text-red-600"
    }

    const getStatusBadge = (idea: Idea) => {
      if (idea.status === "Implemented") return "bg-green-100 text-green-800"
      if (idea.status === "Pending" || (!idea.status && !idea.rejectionComment)) return "bg-yellow-100 text-yellow-800"
      if (idea.status && idea.status !== "Pending") return "bg-blue-100 text-blue-800"
      return "bg-red-100 text-red-800"
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
        <div className="container mx-auto px-4 py-8 space-y-6">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => setFocusedIdea(null)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
            >
              <ChevronUp className="h-4 w-4" /> Back to List
            </button>
            <div className="text-center flex-grow">
              <h1 className="text-2xl font-bold text-gray-800">{focusedIdea.ideaName}</h1>
              <p className="text-gray-600">ID: {focusedIdea.ideaId}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Idea Details Card */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-500 to-cyan-600 p-6 text-white">
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
                  {focusedIdea.actualSavings && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Actual Savings</span>
                      <p className="font-semibold text-green-600">{focusedIdea.actualSavings}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Status Information */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-indigo-600" />
                  Status Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Current Status</span>
                    <div className="mt-1">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(focusedIdea)}`}>
                        {getStatusText(focusedIdea)}
                      </span>
                    </div>
                  </div>

                  {focusedIdea.approverName && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Reviewed By</span>
                      <p className="font-semibold text-gray-800">{focusedIdea.approverName}</p>
                      <p className="text-sm text-gray-600">({focusedIdea.approverDomainId})</p>
                    </div>
                  )}

                  {focusedIdea.approvalDateTime && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Approval Date</span>
                      <p className="font-medium text-gray-800">
                        {new Date(focusedIdea.approvalDateTime).toLocaleString()}
                      </p>
                    </div>
                  )}

                  {focusedIdea.implementedDate && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Implementation Date</span>
                      <p className="font-medium text-gray-800">
                        {new Date(focusedIdea.implementedDate).toLocaleString()}
                      </p>
                    </div>
                  )}

                  {focusedIdea.rejectedDate && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Rejection Date</span>
                      <p className="font-medium text-gray-800">{new Date(focusedIdea.rejectedDate).toLocaleString()}</p>
                    </div>
                  )}

                  {focusedIdea.rejectionComment && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Rejection Reason</span>
                      <div className="mt-2 p-3 bg-red-50 rounded-lg border border-red-200">
                        <p className="text-gray-700 whitespace-pre-line text-sm">{focusedIdea.rejectionComment}</p>
                      </div>
                    </div>
                  )}

                  {focusedIdea.notInScopeReason && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Not In Scope Reason</span>
                      <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-gray-700 whitespace-pre-line text-sm">{focusedIdea.notInScopeReason}</p>
                      </div>
                    </div>
                  )}

                  {focusedIdea.revertHistory && focusedIdea.revertHistory.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Revert History</span>
                      <div className="mt-2 p-3 bg-orange-50 rounded-lg border border-orange-200">
                        <ul className="list-disc pl-6">
                          {focusedIdea.revertHistory.map((revert, index) => (
                            <li key={index}>
                              <p className="text-gray-700 whitespace-pre-line text-sm">
                                Reverted by {revert.revertedBy} ({revert.revertedByDomainId}) on{" "}
                                {new Date(revert.revertDateTime).toLocaleString()} - Reason: {revert.revertReason}
                              </p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">All Ideas</h1>
            <p className="text-gray-600">Comprehensive view of all innovation ideas</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setExcludeReverted(!excludeReverted)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                excludeReverted
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              <XCircle className="h-4 w-4" />
              Exclude Reverted
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                showFilters
                  ? "bg-indigo-600 text-white shadow-lg"
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
                  ? "bg-indigo-600 text-white shadow-lg"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              <Calendar className="h-4 w-4" />
              Date Filter
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all transform hover:scale-105 shadow-lg"
              disabled={isExporting}
            >
              <Download className="h-4 w-4" />
              {isExporting ? "Exporting..." : "Export"}
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white p-4 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-xs">Total Ideas</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Building2 className="h-6 w-6 text-indigo-200" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-xs">Approved</p>
                <p className="text-2xl font-bold">{stats.approved}</p>
              </div>
              <CheckCircle2 className="h-6 w-6 text-green-200" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-xs">Rejected</p>
                <p className="text-2xl font-bold">{stats.rejected}</p>
              </div>
              <XCircle className="h-6 w-6 text-red-200" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-4 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-xs">Pending</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
              <Clock className="h-6 w-6 text-yellow-200" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-4 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-xs">Implemented</p>
                <p className="text-2xl font-bold">{stats.implemented}</p>
              </div>
              <TrendingUp className="h-6 w-6 text-emerald-200" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-gray-500 to-gray-600 text-white p-4 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-100 text-xs">Not in Scope</p>
                <p className="text-2xl font-bold">{stats.notInScope}</p>
              </div>
              <XCircle className="h-6 w-6 text-gray-200" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-xs">Reverted</p>
                <p className="text-2xl font-bold">{stats.reverted}</p>
              </div>
              <RotateCcw className="h-6 w-6 text-orange-200" />
            </div>
          </div>
        </div>

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
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
        <div className="bg-gradient-to-r from-indigo-50 to-cyan-50 rounded-2xl p-6 mb-6 border border-indigo-200">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-700">Total Ideas:</span>
                <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full font-bold">{ideas.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-700">Filtered Results:</span>
                <span className="bg-cyan-100 text-cyan-800 px-3 py-1 rounded-full font-bold">
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

        {/* Ideas Table */}
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
                    Status
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredIdeas.map((idea) => (
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
                          className="text-indigo-600 hover:text-indigo-800 font-medium hover:underline transition-colors"
                        >
                          {idea.ideaName}
                        </button>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            getStatusText(idea) === "Implemented"
                              ? "bg-green-100 text-green-800"
                              : getStatusText(idea) === "Not in Scope"
                                ? "bg-gray-100 text-gray-800"
                                : getStatusText(idea) === "Reverted"
                                  ? "bg-orange-100 text-orange-800"
                                  : getStatusText(idea) === "Pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : getStatusText(idea) === "Rejected"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {getStatusText(idea)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700">
                        {idea.implementedDate
                          ? new Date(idea.implementedDate).toLocaleDateString()
                          : idea.rejectedDate
                            ? new Date(idea.rejectedDate).toLocaleDateString()
                            : idea.approvalDateTime
                              ? new Date(idea.approvalDateTime).toLocaleDateString()
                              : idea.submissionDateTime
                                ? new Date(idea.submissionDateTime).toLocaleDateString()
                                : ""}
                      </td>
                      <td className="px-4 py-4">
                        <button
                          onClick={() => setFocusedIdea(idea)}
                          className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Search className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                    {expandedRows[idea.id] && (
                      <tr className="border-b">
                        <td colSpan={8} className="py-0 px-0">
                          <div className="bg-gradient-to-r from-indigo-50 to-cyan-50 p-6 border-t">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <h4 className="text-sm font-semibold text-gray-700 mb-2">Problem Statement</h4>
                                <p className="text-sm text-gray-800 leading-relaxed">{idea.problemStatement}</p>
                              </div>
                              <div>
                                <h4 className="text-sm font-semibold text-gray-700 mb-2">Solution</h4>
                                <p className="text-sm text-gray-800 leading-relaxed">{idea.solution}</p>
                              </div>
                              {idea.status ? (
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Approved By</h4>
                                  <p className="text-sm text-gray-800">
                                    {idea.approverName} ({idea.approverDomainId})
                                  </p>
                                </div>
                              ) : (
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Rejected By</h4>
                                  <p className="text-sm text-gray-800">
                                    {idea.approverName} ({idea.approverDomainId})
                                  </p>
                                </div>
                              )}
                              {idea.rejectionComment && (
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Rejection Reason</h4>
                                  <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                                    <p className="text-sm text-gray-800">{idea.rejectionComment}</p>
                                  </div>
                                </div>
                              )}
                              {idea.notInScopeReason && (
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Not In Scope Reason</h4>
                                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <p className="text-sm text-gray-800">{idea.notInScopeReason}</p>
                                  </div>
                                </div>
                              )}
                              {idea.revertHistory && idea.revertHistory.length > 0 && (
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Revert History</h4>
                                  <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                                    <ul className="list-disc pl-6">
                                      {idea.revertHistory.map((revert, index) => (
                                        <li key={index}>
                                          <p className="text-sm text-gray-800">
                                            Reverted by {revert.revertedBy} ({revert.revertedByDomainId}) on{" "}
                                            {new Date(revert.revertDateTime).toLocaleString()} - Reason:{" "}
                                            {revert.revertReason}
                                          </p>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="mt-4 flex justify-end">
                              <button
                                onClick={() => setFocusedIdea(idea)}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
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

        {filteredIdeas.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No ideas found</h3>
            <p className="text-gray-600">Try adjusting your filters or search terms.</p>
          </div>
        )}
      </div>
    </div>
  )
}
