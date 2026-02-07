"use client"

import React from "react"
import { useState, useEffect } from "react"
import PasscodeForm from "./PasscodeForm"
import RevertPasscodeForm from "./RevertPasscodeForm"
import IdeaFilter from "./IdeaFilter"
import DateFilter from "./DateFilter"
import {
  ChevronUp,
  ChevronDown,
  Filter,
  Download,
  Search,
  RotateCcw,
  FileText,
  CheckCircle2,
  Clock,
  TrendingUp,
  Calendar,
  User,
  Building2,
  XCircle,
} from "lucide-react"
import { APPLICATION_NAMES } from "../utils/formConstants"

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
  approverDomainId: string
  approverName: string
  status: string
  implementedDate?: string
  actualSavings?: string
  approvalDateTime?: string
  implementationNotes?: string
  implementationNotesHistory?: Array<{
    note: string
    timestamp: string
    baName: string
    baDomainId: string
  }>
  revertHistory?: Array<{
    revertedBy: string
    revertedByDomainId: string
    revertReason: string
    revertDateTime: string
    previousStatus: string
  }>
  notInScopeReason?: string
  applicationNameHistory?: Array<{
    oldValue: string
    newValue: string
    changedBy: string
    changedByDomainId: string
    changeDateTime: string
  }>
}

export default function ApprovedIdeas() {
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [isAuthenticated, setIsAuthenticated] = useState(false)
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
  const [expandedRows, setExpandedRows] = useState<{ [key: string]: boolean }>({})
  const [showFilters, setShowFilters] = useState(false)
  const [showDateFilters, setShowDateFilters] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [focusedIdea, setFocusedIdea] = useState<Idea | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [showRevertForm, setShowRevertForm] = useState<string | null>(null)
  const [revertReason, setRevertReason] = useState("")
  const [implementationNote, setImplementationNote] = useState("")
  const [editingNotes, setEditingNotes] = useState<string | null>(null)
  const [notInScopeReason, setNotInScopeReason] = useState("")
  const [showNotInScopeForm, setShowNotInScopeForm] = useState<string | null>(null)
  const [editingApplicationName, setEditingApplicationName] = useState<string | null>(null)
  const [newApplicationName, setNewApplicationName] = useState("")
  const [newSpecifyApplicationName, setNewSpecifyApplicationName] = useState("")

  useEffect(() => {
    if (isAuthenticated) {
      const fetchIdeas = async () => {
        const res = await fetch("/api/ideas?collection=approvedIdeas")
        const data = await res.json()
        setIdeas(data.ideas || [])
      }
      fetchIdeas()
    }
  }, [isAuthenticated])

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    if (newStatus === "Not in Scope") {
      setShowNotInScopeForm(id)
      return
    }

    try {
      const res = await fetch(`/api/ideas/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error("Failed to update status")
      setIdeas(ideas.map((idea) => (idea.id === id ? { ...idea, status: newStatus } : idea)))
    } catch (error) {
      console.error("Error updating idea status:", error)
    }
  }

  const handleNotInScope = async (ideaId: string, reason: string) => {
    if (!reason.trim()) {
      alert("Please provide a reason for marking this idea as 'Not in Scope'.")
      return
    }

    try {
      const res = await fetch(`/api/ideas/${ideaId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "Not in Scope",
          notInScopeReason: reason,
          notInScopeDateTime: new Date().toISOString(),
        }),
      })
      if (!res.ok) throw new Error("Failed to update status")
      setIdeas(
        ideas.map((idea) =>
          idea.id === ideaId ? { ...idea, status: "Not in Scope", notInScopeReason: reason } : idea,
        ),
      )
      setShowNotInScopeForm(null)
      setNotInScopeReason("")
    } catch (error) {
      console.error("Error updating idea status:", error)
      alert("Error updating status. Please try again.")
    }
  }

  const handleApplicationNameUpdate = async (ideaId: string, oldValue: string) => {
    const finalAppName =
      newApplicationName === "Other" && newSpecifyApplicationName ? newSpecifyApplicationName : newApplicationName

    if (!finalAppName.trim()) {
      alert("Please provide an application name.")
      return
    }

    try {
      const idea = ideas.find((i) => i.id === ideaId)
      if (!idea) return

      const historyEntry = {
        oldValue: oldValue,
        newValue: finalAppName,
        changedBy: "Business Analyst", // You can make this dynamic
        changedByDomainId: "SYSTEM", // You can make this dynamic
        changeDateTime: new Date().toISOString(),
      }

      const res = await fetch(`/api/ideas/${ideaId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationName: newApplicationName,
          specifyApplicationName: newApplicationName === "Other" ? newSpecifyApplicationName : "",
          applicationNameHistory: [...(idea.applicationNameHistory || []), historyEntry],
        }),
      })
      if (!res.ok) throw new Error("Failed to update application name")

      setIdeas(
        ideas.map((i) =>
          i.id === ideaId
            ? {
                ...i,
                applicationName: newApplicationName,
                specifyApplicationName: newApplicationName === "Other" ? newSpecifyApplicationName : "",
                applicationNameHistory: [...(i.applicationNameHistory || []), historyEntry],
              }
            : i,
        ),
      )

      setEditingApplicationName(null)
      setNewApplicationName("")
      setNewSpecifyApplicationName("")
    } catch (error) {
      console.error("Error updating application name:", error)
      alert("Error updating application name. Please try again.")
    }
  }

  const handleImplementationUpdate = async (id: string, implementedDate: string, actualSavings: string) => {
    const idea = ideas.find((i) => i.id === id)
    if (idea?.status === "Implemented" && !implementedDate) {
      alert("Implemented Date is required when status is set to Implemented.")
      return
    }

    if (implementedDate && new Date(implementedDate) > new Date()) {
      alert("Implemented Date cannot be in the future.")
      return
    }

    try {
      const res = await fetch(`/api/ideas/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ implementedDate, actualSavings }),
      })
      if (!res.ok) throw new Error("Failed to update implementation details")
      setIdeas(ideas.map((idea) => (idea.id === id ? { ...idea, implementedDate, actualSavings } : idea)))
    } catch (error) {
      console.error("Error updating implementation details:", error)
    }
  }

  const handleRevertIdea = async (ideaId: string, baInfo: { domainId: string; name: string }) => {
    if (!revertReason.trim()) {
      alert("Please provide a reason for reverting this idea.")
      return
    }

    try {
      const idea = ideas.find((i) => i.id === ideaId)
      if (!idea) return

      const res = await fetch(`/api/ideas/${ideaId}/revert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          revertedBy: baInfo.name,
          revertedByDomainId: baInfo.domainId,
          revertReason: revertReason,
        }),
      })
      if (!res.ok) throw new Error("Failed to revert idea")

      setIdeas(ideas.filter((i) => i.id !== ideaId))
      setShowRevertForm(null)
      setRevertReason("")
      setFocusedIdea(null)

      alert("Idea has been reverted back to Business Analyst Review.")
    } catch (error) {
      console.error("Error reverting idea:", error)
      alert("Error reverting idea. Please try again.")
    }
  }

  const handleAddImplementationNote = async (
    ideaId: string,
    note: string,
    baInfo: { domainId: string; name: string },
  ) => {
    if (!note.trim()) return

    try {
      const idea = ideas.find((i) => i.id === ideaId)
      if (!idea) return

      const noteEntry = {
        note: note.trim(),
        timestamp: new Date().toISOString(),
        baName: baInfo.name,
        baDomainId: baInfo.domainId,
      }

      const updatedHistory = [...(idea.implementationNotesHistory || []), noteEntry]

      const res = await fetch(`/api/ideas/${ideaId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          implementationNotes: note.trim(),
          implementationNotesHistory: updatedHistory,
        }),
      })
      if (!res.ok) throw new Error("Failed to add implementation note")

      setIdeas(
        ideas.map((i) =>
          i.id === ideaId ? { ...i, implementationNotes: note.trim(), implementationNotesHistory: updatedHistory } : i,
        ),
      )

      setImplementationNote("")
      setEditingNotes(null)
    } catch (error) {
      console.error("Error adding implementation note:", error)
      alert("Error adding note. Please try again.")
    }
  }

  const filteredIdeas = ideas
    .filter((idea) => {
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
    .sort((a, b) => new Date(b.submissionDateTime).getTime() - new Date(a.submissionDateTime).getTime())

  const handleExport = () => {
    try {
      setIsExporting(true)

      const ideasToExport =
        showFilters || searchTerm || dateFilter.startDate || dateFilter.endDate ? filteredIdeas : ideas

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
        "Idea Name",
        "Problem Statement",
        "Solution",
        "Savings Type",
        "Savings Comment",
        "Submission Date",
        "Approver Name",
        "Approver Domain ID",
        "Approval Date/Time",
        "Status",
        "Implemented Date",
        "Actual Savings",
        "Implementation Notes",
        "Revert History",
      ]

      const csvRows = [
        headers.map((header) => escapeCSV(header)).join(","),
        ...ideasToExport.map((idea) => {
          const revertHistoryText =
            idea.revertHistory
              ?.map((r) => `${r.revertDateTime}: ${r.revertedBy} (${r.revertedByDomainId}) - ${r.revertReason}`)
              .join("; ") || ""

          const rowData = [
            idea.ideaId || "",
            idea.associateName || "",
            idea.associateDomainId || "",
            idea.function || "",
            idea.teamLead || "",
            idea.functionalManager || "",
            idea.state || "",
            idea.ideaName || "",
            idea.problemStatement || "",
            idea.solution || "",
            idea.savingsType || "",
            idea.savingsComment || "",
            idea.submissionDateTime || "",
            idea.approverName || "",
            idea.approverDomainId || "",
            idea.approvalDateTime || "",
            idea.status || "",
            idea.implementedDate || "",
            idea.actualSavings || "",
            idea.implementationNotes || "",
            revertHistoryText,
          ]
          return rowData.map((field) => escapeCSV(field)).join(",")
        }),
      ]

      const csvContent = csvRows.join("\n")
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", `approved_ideas_${new Date().toISOString().slice(0, 10)}.csv`)
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

  if (!isAuthenticated) {
    return <PasscodeForm onCorrectPasscode={() => setIsAuthenticated(true)} />
  }

  // Statistics
  const stats = {
    total: ideas.length,
    inProgress: ideas.filter((idea) => idea.status === "In Progress").length,
    implemented: ideas.filter((idea) => idea.status === "Implemented").length,
    notInScope: ideas.filter((idea) => idea.status === "Not in Scope").length,
    withNotes: ideas.filter((idea) => idea.implementationNotes).length,
  }

  // If an idea is focused, show a detailed view
  if (focusedIdea) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
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
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
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
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Status Card */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  Status & Progress
                </h3>
                <div className="space-y-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Approved By</span>
                    <p className="font-semibold text-gray-800">{focusedIdea.approverName}</p>
                    <p className="text-sm text-gray-600">({focusedIdea.approverDomainId})</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Approval Date</span>
                    <p className="font-medium text-gray-800">
                      {focusedIdea.approvalDateTime ? new Date(focusedIdea.approvalDateTime).toLocaleString() : "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Status</label>
                    <select
                      value={focusedIdea.status}
                      onChange={(e) => handleStatusChange(focusedIdea.id, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="In Progress">In Progress</option>
                      <option value="Implemented">Implemented</option>
                      <option value="Not in Scope">Not in Scope</option>
                    </select>
                  </div>

                  {focusedIdea.status === "Implemented" && (
                    <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Implementation Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={focusedIdea.implementedDate || ""}
                          max={new Date().toISOString().split("T")[0]}
                          onChange={(e) =>
                            handleImplementationUpdate(focusedIdea.id, e.target.value, focusedIdea.actualSavings || "")
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Actual Savings</label>
                        <input
                          type="text"
                          placeholder="Enter actual savings"
                          value={focusedIdea.actualSavings || ""}
                          onChange={(e) =>
                            handleImplementationUpdate(
                              focusedIdea.id,
                              focusedIdea.implementedDate || "",
                              e.target.value,
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Application Name Section - Add this before Implementation Notes */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-blue-600" />
                    Application Information
                  </h3>
                  <button
                    onClick={() => {
                      setEditingApplicationName(focusedIdea.id)
                      setNewApplicationName(focusedIdea.applicationName || "")
                      setNewSpecifyApplicationName(focusedIdea.specifyApplicationName || "")
                    }}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    Edit Application
                  </button>
                </div>

                {editingApplicationName === focusedIdea.id ? (
                  <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <select
                      value={newApplicationName}
                      onChange={(e) => setNewApplicationName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Application</option>
                      {APPLICATION_NAMES.map((app) => (
                        <option key={app} value={app}>
                          {app}
                        </option>
                      ))}
                    </select>

                    {newApplicationName === "Other" && (
                      <input
                        type="text"
                        value={newSpecifyApplicationName}
                        onChange={(e) => setNewSpecifyApplicationName(e.target.value)}
                        placeholder="Specify application name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApplicationNameUpdate(focusedIdea.id, focusedIdea.applicationName || "")}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={() => {
                          setEditingApplicationName(null)
                          setNewApplicationName("")
                          setNewSpecifyApplicationName("")
                        }}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Current Application</span>
                      <p className="font-semibold text-gray-800">
                        {focusedIdea.applicationName === "Other" && focusedIdea.specifyApplicationName
                          ? focusedIdea.specifyApplicationName
                          : focusedIdea.applicationName || "Not specified"}
                      </p>
                    </div>

                    {focusedIdea.applicationNameHistory && focusedIdea.applicationNameHistory.length > 0 && (
                      <div>
                        <span className="text-sm font-medium text-gray-500">Change History</span>
                        <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                          {focusedIdea.applicationNameHistory.map((change, index) => (
                            <div key={index} className="text-xs bg-gray-50 p-2 rounded border-l-2 border-blue-400">
                              <p>
                                <strong>From:</strong> {change.oldValue} → <strong>To:</strong> {change.newValue}
                              </p>
                              <p className="text-gray-500">
                                Changed by {change.changedBy} ({change.changedByDomainId}) on{" "}
                                {new Date(change.changeDateTime).toLocaleString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Implementation Notes - Show for all approved ideas */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    Implementation Notes
                  </h3>
                  <button
                    onClick={() => setEditingNotes(focusedIdea.id)}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    Add Note
                  </button>
                </div>

                {editingNotes === focusedIdea.id && (
                  <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <textarea
                      value={implementationNote}
                      onChange={(e) => setImplementationNote(e.target.value)}
                      placeholder="Add implementation notes..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      rows={3}
                    />
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => {
                          if (implementationNote.trim()) {
                            handleAddImplementationNote(focusedIdea.id, implementationNote, {
                              domainId: "SYSTEM",
                              name: "Business Analyst",
                            })
                          }
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        Save Note
                      </button>
                      <button
                        onClick={() => {
                          setEditingNotes(null)
                          setImplementationNote("")
                        }}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {focusedIdea.implementationNotesHistory && focusedIdea.implementationNotesHistory.length > 0 ? (
                    focusedIdea.implementationNotesHistory.map((note, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg border-l-4 border-blue-400">
                        <p className="text-sm text-gray-800 whitespace-pre-line">{note.note}</p>
                        <div className="mt-2 text-xs text-gray-500 flex items-center gap-2">
                          <User className="h-3 w-3" />
                          <span>
                            {note.baName} ({note.baDomainId})
                          </span>
                          <Calendar className="h-3 w-3 ml-2" />
                          <span>{new Date(note.timestamp).toLocaleString()}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm text-center py-4">No implementation notes yet.</p>
                  )}
                </div>
              </div>

              {focusedIdea.status === "Not in Scope" && focusedIdea.notInScopeReason && (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Reason for Not in Scope</h4>
                  <p className="text-sm text-gray-800 whitespace-pre-line">{focusedIdea.notInScopeReason}</p>
                </div>
              )}

              {/* Revert Action */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl shadow-lg border border-yellow-200 p-6">
                <h3 className="text-lg font-bold text-yellow-800 mb-2 flex items-center gap-2">
                  <RotateCcw className="h-5 w-5" />
                  Revert Idea
                </h3>
                <p className="text-sm text-yellow-700 mb-4">
                  Send this idea back to Business Analyst Review for re-evaluation.
                </p>
                <button
                  onClick={() => setShowRevertForm(focusedIdea.id)}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-2 px-4 rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all transform hover:scale-105"
                >
                  Revert to BA Review
                </button>
              </div>
            </div>
          </div>

          {/* Revert History */}
          {focusedIdea.revertHistory && focusedIdea.revertHistory.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Revert History</h3>
              <div className="space-y-3">
                {focusedIdea.revertHistory.map((revert, index) => (
                  <div key={index} className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <span className="text-sm font-medium text-gray-500">Reverted by</span>
                        <p className="font-semibold text-gray-800">
                          {revert.revertedBy} ({revert.revertedByDomainId})
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Date</span>
                        <p className="font-medium text-gray-800">{new Date(revert.revertDateTime).toLocaleString()}</p>
                      </div>
                      <div className="md:col-span-2">
                        <span className="text-sm font-medium text-gray-500">Reason</span>
                        <p className="text-gray-700 whitespace-pre-line">{revert.revertReason}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Revert Form Modal */}
          {showRevertForm === focusedIdea.id && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-md w-full mx-4">
                <h3 className="text-xl font-bold mb-4 text-gray-800">Revert Idea</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason for Reverting (Required)
                    </label>
                    <textarea
                      value={revertReason}
                      onChange={(e) => setRevertReason(e.target.value)}
                      placeholder="Please provide a detailed reason for reverting this idea..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 resize-none"
                      rows={4}
                      required
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowRevertForm("auth")}
                      className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-2 px-4 rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all"
                      disabled={!revertReason.trim()}
                    >
                      Continue to Authentication
                    </button>
                    <button
                      onClick={() => {
                        setShowRevertForm(null)
                        setRevertReason("")
                      }}
                      className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Revert Authentication */}
          {showRevertForm === "auth" && (
            <RevertPasscodeForm
              onCorrectPasscode={(baInfo) => handleRevertIdea(focusedIdea.id, baInfo)}
              onCancel={() => {
                setShowRevertForm(null)
                setRevertReason("")
              }}
            />
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Approved Ideas</h1>
            <p className="text-gray-600">Manage and track approved innovation ideas</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                showFilters
                  ? "bg-blue-600 text-white shadow-lg"
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
                  ? "bg-blue-600 text-white shadow-lg"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Ideas</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
              <Building2 className="h-8 w-8 text-blue-200" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm">In Progress</p>
                <p className="text-3xl font-bold">{stats.inProgress}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-200" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Implemented</p>
                <p className="text-3xl font-bold">{stats.implemented}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-200" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-gray-500 to-gray-600 text-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-100 text-sm">Not in Scope</p>
                <p className="text-3xl font-bold">{stats.notInScope}</p>
              </div>
              <XCircle className="h-8 w-8 text-gray-200" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">With Notes</p>
                <p className="text-3xl font-bold">{stats.withNotes}</p>
              </div>
              <FileText className="h-8 w-8 text-purple-200" />
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
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                <span className="font-semibold text-gray-700">Filtered Results:</span>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-bold">
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
                    Implementation
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Savings
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
                          className="text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors"
                        >
                          {idea.ideaName}
                        </button>
                      </td>
                      <td className="px-4 py-4">
                        <select
                          value={idea.status}
                          onChange={(e) => handleStatusChange(idea.id, e.target.value)}
                          className={`text-xs px-2 py-1 rounded-full border-0 font-medium ${
                            idea.status === "Implemented"
                              ? "bg-green-100 text-green-800"
                              : idea.status === "Not in Scope"
                                ? "bg-gray-100 text-gray-800"
                                : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          <option value="In Progress">In Progress</option>
                          <option value="Implemented">Implemented</option>
                          <option value="Not in Scope">Not in Scope</option>
                        </select>
                      </td>
                      <td className="px-4 py-4">
                        {idea.status === "Implemented" ? (
                          <input
                            type="date"
                            value={idea.implementedDate || ""}
                            onChange={(e) =>
                              handleImplementationUpdate(idea.id, e.target.value, idea.actualSavings || "")
                            }
                            className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          />
                        ) : (
                          <span className="text-gray-400 text-xs">Not implemented</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {idea.status === "Implemented" ? (
                          <input
                            type="text"
                            placeholder="Actual Savings"
                            value={idea.actualSavings || ""}
                            onChange={(e) =>
                              handleImplementationUpdate(idea.id, idea.implementedDate || "", e.target.value)
                            }
                            className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 w-24"
                          />
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-1">
                          <button
                            onClick={() => setFocusedIdea(idea)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Search className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setShowRevertForm(idea.id)}
                            className="p-2 text-yellow-600 hover:bg-yellow-100 rounded-lg transition-colors"
                            title="Revert to BA Review"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedRows[idea.id] && (
                      <tr>
                        <td colSpan={9} className="px-0 py-0">
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
                                <h4 className="font-semibold text-gray-700 mb-2">Approved By</h4>
                                <p className="text-sm text-gray-600">
                                  {idea.approverName} ({idea.approverDomainId})
                                </p>
                              </div>
                              {idea.implementationNotes && (
                                <div>
                                  <h4 className="font-semibold text-gray-700 mb-2">Latest Implementation Note</h4>
                                  <p className="text-sm text-gray-600">{idea.implementationNotes}</p>
                                </div>
                              )}
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

        {/* Revert Form Modal for table actions */}
        {showRevertForm && showRevertForm !== "auth" && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-md w-full mx-4">
              <h3 className="text-xl font-bold mb-4 text-gray-800">Revert Idea</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Reverting (Required)
                  </label>
                  <textarea
                    value={revertReason}
                    onChange={(e) => setRevertReason(e.target.value)}
                    placeholder="Please provide a detailed reason for reverting this idea..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 resize-none"
                    rows={4}
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowRevertForm("auth")}
                    className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-2 px-4 rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all"
                    disabled={!revertReason.trim()}
                  >
                    Continue to Authentication
                  </button>
                  <button
                    onClick={() => {
                      setShowRevertForm(null)
                      setRevertReason("")
                    }}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Revert Authentication */}
        {showRevertForm === "auth" && (
          <RevertPasscodeForm
            onCorrectPasscode={(baInfo) => {
              const ideaId =
                Object.keys(expandedRows).find((id) => showRevertForm === id) ||
                filteredIdeas.find((idea) => showRevertForm === idea.id)?.id
              if (ideaId) {
                handleRevertIdea(ideaId, baInfo)
              }
            }}
            onCancel={() => {
              setShowRevertForm(null)
              setRevertReason("")
            }}
          />
        )}
      </div>
      {/* Not in Scope Form Modal */}
      {showNotInScopeForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Mark as Not in Scope</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Not in Scope (Required)
                </label>
                <textarea
                  value={notInScopeReason}
                  onChange={(e) => setNotInScopeReason(e.target.value)}
                  placeholder="Please provide a detailed reason why this idea is not in scope..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 resize-none"
                  rows={4}
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleNotInScope(showNotInScopeForm, notInScopeReason)}
                  className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white py-2 px-4 rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all"
                  disabled={!notInScopeReason.trim()}
                >
                  Confirm Not in Scope
                </button>
                <button
                  onClick={() => {
                    setShowNotInScopeForm(null)
                    setNotInScopeReason("")
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
