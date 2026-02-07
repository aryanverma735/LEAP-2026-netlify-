"use client"

import { useState, useEffect } from "react"
import { Bar, Doughnut, Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js"
import {
  BarChart3,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Users,
  Briefcase,
  Building,
  Search,
  Calendar,
} from "lucide-react"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement)

type EmployeeData = {
  [domainId: string]: {
    associateName: string
    function: string
    teamLead: string
    functionalLeader: string
  }
}

interface DashboardStats {
  totalIdeas: number
  approvedIdeas: number
  rejectedIdeas: number
  pendingIdeas: number
  ideasPerTeamLead: { [key: string]: { approved: number; rejected: number; pending: number } }
  ideasPerFunctionalManager: { [key: string]: { approved: number; rejected: number; pending: number } }
  ideasPerFunction: { [key: string]: { approved: number; rejected: number; pending: number } }
  monthlySubmissions: { [key: string]: number }
  implementedIdeas: number
  inProgressIdeas: number
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalIdeas: 0,
    approvedIdeas: 0,
    rejectedIdeas: 0,
    pendingIdeas: 0,
    ideasPerTeamLead: {},
    ideasPerFunctionalManager: {},
    ideasPerFunction: {},
    monthlySubmissions: {},
    implementedIdeas: 0,
    inProgressIdeas: 0,
  })
  const [activeTab, setActiveTab] = useState<"function" | "teamLead" | "functionalManager">("function")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchStats = async () => {
      const res = await fetch("/api/ideas")
      const data = await res.json()

      const approvedIdeas = data.approvedIdeas || []
      const rejectedIdeas = data.rejectedIdeas || []
      const pendingIdeas = data.pendingIdeas || []

      const allIdeas = [...approvedIdeas, ...rejectedIdeas, ...pendingIdeas]

      const ideasPerTeamLead: { [key: string]: { approved: number; rejected: number; pending: number } } = {}
      const ideasPerFunctionalManager: { [key: string]: { approved: number; rejected: number; pending: number } } = {}
      const ideasPerFunction: { [key: string]: { approved: number; rejected: number; pending: number } } = {}
      const monthlySubmissions: { [key: string]: number } = {}

      let implementedIdeas = 0
      let inProgressIdeas = 0

      // Process all ideas for monthly submissions
      allIdeas.forEach((idea) => {
        if (idea.submissionDateTime) {
          const date = new Date(idea.submissionDateTime)
          const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`
          monthlySubmissions[monthYear] = (monthlySubmissions[monthYear] || 0) + 1
        }
      })

      approvedIdeas.forEach((idea) => {
        // Count implemented vs in progress
        if (idea.status === "Implemented") {
          implementedIdeas++
        } else {
          inProgressIdeas++
        }

        // Process team lead stats
        ideasPerTeamLead[idea.teamLead] = ideasPerTeamLead[idea.teamLead] || { approved: 0, rejected: 0, pending: 0 }
        ideasPerTeamLead[idea.teamLead].approved++

        // Process functional manager stats
        ideasPerFunctionalManager[idea.functionalManager] = ideasPerFunctionalManager[idea.functionalManager] || {
          approved: 0,
          rejected: 0,
          pending: 0,
        }
        ideasPerFunctionalManager[idea.functionalManager].approved++

        // Process function stats
        ideasPerFunction[idea.function] = ideasPerFunction[idea.function] || { approved: 0, rejected: 0, pending: 0 }
        ideasPerFunction[idea.function].approved++
      })

      rejectedIdeas.forEach((idea) => {
        ideasPerTeamLead[idea.teamLead] = ideasPerTeamLead[idea.teamLead] || { approved: 0, rejected: 0, pending: 0 }
        ideasPerTeamLead[idea.teamLead].rejected++

        ideasPerFunctionalManager[idea.functionalManager] = ideasPerFunctionalManager[idea.functionalManager] || {
          approved: 0,
          rejected: 0,
          pending: 0,
        }
        ideasPerFunctionalManager[idea.functionalManager].rejected++

        ideasPerFunction[idea.function] = ideasPerFunction[idea.function] || { approved: 0, rejected: 0, pending: 0 }
        ideasPerFunction[idea.function].rejected++
      })

      pendingIdeas.forEach((idea) => {
        ideasPerTeamLead[idea.teamLead] = ideasPerTeamLead[idea.teamLead] || { approved: 0, rejected: 0, pending: 0 }
        ideasPerTeamLead[idea.teamLead].pending++

        ideasPerFunctionalManager[idea.functionalManager] = ideasPerFunctionalManager[idea.functionalManager] || {
          approved: 0,
          rejected: 0,
          pending: 0,
        }
        ideasPerFunctionalManager[idea.functionalManager].pending++

        ideasPerFunction[idea.function] = ideasPerFunction[idea.function] || { approved: 0, rejected: 0, pending: 0 }
        ideasPerFunction[idea.function].pending++
      })

      setStats({
        totalIdeas: allIdeas.length,
        approvedIdeas: approvedIdeas.length,
        rejectedIdeas: rejectedIdeas.length,
        pendingIdeas: pendingIdeas.length,
        ideasPerTeamLead,
        ideasPerFunctionalManager,
        ideasPerFunction,
        monthlySubmissions,
        implementedIdeas,
        inProgressIdeas,
      })
    }

    fetchStats()
  }, [])

  // Prepare data for status distribution chart
  const statusChartData = {
    labels: ["Approved", "Rejected", "Pending"],
    datasets: [
      {
        label: "Ideas",
        data: [stats.approvedIdeas, stats.rejectedIdeas, stats.pendingIdeas],
        backgroundColor: ["rgba(34, 197, 94, 0.8)", "rgba(239, 68, 68, 0.8)", "rgba(234, 179, 8, 0.8)"],
        borderColor: ["rgba(34, 197, 94, 1)", "rgba(239, 68, 68, 1)", "rgba(234, 179, 8, 1)"],
        borderWidth: 1,
      },
    ],
  }

  // Prepare data for implementation status chart
  const implementationChartData = {
    labels: ["Implemented", "In Progress"],
    datasets: [
      {
        label: "Approved Ideas",
        data: [stats.implementedIdeas, stats.inProgressIdeas],
        backgroundColor: ["rgba(59, 130, 246, 0.8)", "rgba(168, 85, 247, 0.8)"],
        borderColor: ["rgba(59, 130, 246, 1)", "rgba(168, 85, 247, 1)"],
        borderWidth: 1,
      },
    ],
  }

  // Prepare data for monthly submissions chart
  const monthlyLabels = Object.keys(stats.monthlySubmissions).sort((a, b) => {
    const [monthA, yearA] = a.split("/").map(Number)
    const [monthB, yearB] = b.split("/").map(Number)
    return yearA !== yearB ? yearA - yearB : monthA - monthB
  })

  const monthlyData = monthlyLabels.map((month) => stats.monthlySubmissions[month])

  const monthlyChartData = {
    labels: monthlyLabels,
    datasets: [
      {
        label: "Submissions",
        data: monthlyData,
        borderColor: "rgba(147, 51, 234, 1)",
        backgroundColor: "rgba(147, 51, 234, 0.2)",
        tension: 0.3,
        fill: true,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: false,
      },
    },
  }

  // Get the active data based on the selected tab
  const getActiveData = () => {
    switch (activeTab) {
      case "function":
        return stats.ideasPerFunction
      case "teamLead":
        return stats.ideasPerTeamLead
      case "functionalManager":
        return stats.ideasPerFunctionalManager
      default:
        return stats.ideasPerFunction
    }
  }

  // Filter the active data based on search term
  const filteredData = Object.entries(getActiveData())
    .filter(([key]) => key.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      const totalA = a[1].approved + a[1].rejected + a[1].pending
      const totalB = b[1].approved + b[1].rejected + b[1].pending
      return totalB - totalA // Sort by total ideas (descending)
    })

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-purple-600 to-purple-700 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Total Ideas</p>
              <p className="text-3xl font-bold mt-1">{stats.totalIdeas}</p>
            </div>
            <div className="bg-purple-500 p-3 rounded-full">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-600 to-green-700 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Approved Ideas</p>
              <p className="text-3xl font-bold mt-1">{stats.approvedIdeas}</p>
            </div>
            <div className="bg-green-500 p-3 rounded-full">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-600 to-red-700 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">Rejected Ideas</p>
              <p className="text-3xl font-bold mt-1">{stats.rejectedIdeas}</p>
            </div>
            <div className="bg-red-500 p-3 rounded-full">
              <XCircle className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">Pending Ideas</p>
              <p className="text-3xl font-bold mt-1">{stats.pendingIdeas}</p>
            </div>
            <div className="bg-yellow-400 p-3 rounded-full">
              <Clock className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution Chart */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-purple-600" />
            Idea Status Distribution
          </h3>
          <div className="h-64">
            <Bar data={statusChartData} options={chartOptions} />
          </div>
        </div>

        {/* Implementation Status Chart */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
            Implementation Status
          </h3>
          <div className="h-64 flex items-center justify-center">
            <Doughnut
              data={implementationChartData}
              options={{
                ...chartOptions,
                cutout: "60%",
              }}
            />
          </div>
        </div>

        {/* Monthly Submissions Chart */}
        <div className="bg-white p-6 rounded-xl shadow-md lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-purple-600" />
            Monthly Idea Submissions
          </h3>
          <div className="h-64">
            <Line
              data={monthlyChartData}
              options={{
                ...chartOptions,
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      precision: 0,
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Detailed Analysis Section */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 md:mb-0">Detailed Analysis</h3>
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder={`Search ${activeTab === "teamLead" ? "Team Leads" : activeTab === "functionalManager" ? "Functional Managers" : "Functions"}`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full md:w-64"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>

            {/* Tab Buttons */}
            <div className="flex space-x-2 bg-gray-100 p-1 rounded-md">
              <button
                onClick={() => setActiveTab("function")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "function"
                    ? "bg-white text-purple-700 shadow-sm"
                    : "text-gray-600 hover:text-purple-700"
                }`}
              >
                <Briefcase className="h-4 w-4 inline mr-1" />
                Functions
              </button>
              <button
                onClick={() => setActiveTab("teamLead")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "teamLead"
                    ? "bg-white text-purple-700 shadow-sm"
                    : "text-gray-600 hover:text-purple-700"
                }`}
              >
                <Users className="h-4 w-4 inline mr-1" />
                Team Leads
              </button>
              <button
                onClick={() => setActiveTab("functionalManager")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "functionalManager"
                    ? "bg-white text-purple-700 shadow-sm"
                    : "text-gray-600 hover:text-purple-700"
                }`}
              >
                <Building className="h-4 w-4 inline mr-1" />
                Functional Managers
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {activeTab === "teamLead"
                    ? "Team Lead"
                    : activeTab === "functionalManager"
                      ? "Functional Manager"
                      : "Function"}
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  <span className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                    Approved
                  </span>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  <span className="flex items-center">
                    <XCircle className="h-4 w-4 text-red-500 mr-1" />
                    Rejected
                  </span>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 text-yellow-500 mr-1" />
                    Pending
                  </span>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Total
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Distribution
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.map(([key, count]) => {
                const total = count.approved + count.rejected + count.pending
                return (
                  <tr key={key} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{key}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {count.approved}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        {count.rejected}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        {count.pending}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                        {total}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-green-500 h-2.5 rounded-l-full"
                          style={{ width: `${(count.approved / total) * 100}%`, display: "inline-block" }}
                        ></div>
                        <div
                          className="bg-red-500 h-2.5"
                          style={{ width: `${(count.rejected / total) * 100}%`, display: "inline-block" }}
                        ></div>
                        <div
                          className="bg-yellow-500 h-2.5 rounded-r-full"
                          style={{ width: `${(count.pending / total) * 100}%`, display: "inline-block" }}
                        ></div>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
