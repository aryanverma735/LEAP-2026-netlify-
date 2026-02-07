"use client"

interface IdeaDetailsProps {
  isOpen: boolean
  onToggle: () => void
  state: string
  applicationName?: string
  specifyApplicationName?: string
  problemStatement: string
  solution: string
  savingsType: string
  savingsComment: string
  approverName?: string
  approverDomainId?: string
  approvalDateTime?: string
  implementedDate?: string
  status?: string
}

export default function IdeaDetails({
  isOpen,
  onToggle,
  state,
  applicationName,
  specifyApplicationName,
  problemStatement,
  solution,
  savingsType,
  savingsComment,
  approverName,
  approverDomainId,
  approvalDateTime,
  implementedDate,
  status,
}: IdeaDetailsProps) {
  if (!isOpen) return null

  return (
    <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 border-t mt-2 rounded-lg fade-in">
      <div className="grid gap-6 max-w-full">
        {applicationName && (
          <div>
            <h4 className="text-sm font-semibold text-gray-600 mb-2 flex items-center">
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
                <path d="M4 7V4a2 2 0 0 1 2-2h8.5L20 7.5V20a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7z"></path>
                <polyline points="14,2 14,8 20,8"></polyline>
              </svg>
              Application Name
            </h4>
            <p className="mt-1 text-sm text-gray-900">
              {applicationName === "Other" && specifyApplicationName ? specifyApplicationName : applicationName}
            </p>
          </div>
        )}
        <div>
          <h4 className="text-sm font-semibold text-gray-600 mb-2 flex items-center">
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
              <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>
            </svg>
            Problem Statement
          </h4>
          <p className="mt-1 text-sm text-gray-900">{problemStatement}</p>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-gray-600 mb-2 flex items-center">
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
              <path d="M12 3v12"></path>
              <path d="m8 11 4 4 4-4"></path>
              <path d="M8 5H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-4"></path>
            </svg>
            Solution
          </h4>
          <p className="mt-1 text-sm text-gray-900">{solution}</p>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-gray-600 mb-2 flex items-center">
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
              <circle cx="12" cy="12" r="10"></circle>
              <path d="m16 8-8 8"></path>
              <path d="m8 8 8 8"></path>
            </svg>
            Estimated Savings Type
          </h4>
          <p className="mt-1 text-sm text-gray-900">{savingsType}</p>
        </div>
        {savingsComment && (
          <div>
            <h4 className="text-sm font-semibold text-gray-600 mb-2 flex items-center">
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
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
              Additional Savings Details
            </h4>
            <p className="mt-1 text-sm text-gray-900">{savingsComment}</p>
          </div>
        )}
        {(approverName || approverDomainId) && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold text-gray-600 mb-2 flex items-center">
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
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              Approved By
            </h4>
            <p className="mt-1 text-sm text-gray-900">
              {approverName} ({approverDomainId})
            </p>
            {approvalDateTime && (
              <p className="mt-1 text-sm text-gray-600 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-1"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                Approved on: {new Date(approvalDateTime).toLocaleString()}
              </p>
            )}
          </div>
        )}
        {implementedDate && status === "Implemented" && (
          <div>
            <h4 className="text-sm font-semibold text-gray-600 mb-2 flex items-center">
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
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              Implemented Date
            </h4>
            <p className="mt-1 text-sm text-gray-900">{new Date(implementedDate).toLocaleDateString()}</p>
          </div>
        )}
      </div>
    </div>
  )
}
