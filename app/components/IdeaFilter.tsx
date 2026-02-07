"use client"

import type React from "react"

interface IdeaFilterProps {
  filter: {
    associateName: string
    associateDomainId: string
    teamLead: string
    functionalManager: string
  }
  setFilter: React.Dispatch<
    React.SetStateAction<{
      associateName: string
      associateDomainId: string
      teamLead: string
      functionalManager: string
    }>
  >
}

export default function IdeaFilter({ filter, setFilter }: IdeaFilterProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFilter((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
          className="input-icon"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
        <input
          type="text"
          name="associateName"
          placeholder="Filter by Associate Name"
          value={filter.associateName}
          onChange={handleChange}
          className="form-input pl-10"
        />
      </div>
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
          className="input-icon"
        >
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
          <path d="M8 12h8"></path>
          <path d="M12 8v8"></path>
        </svg>
        <input
          type="text"
          name="associateDomainId"
          placeholder="Filter by Domain ID"
          value={filter.associateDomainId}
          onChange={handleChange}
          className="form-input pl-10"
        />
      </div>
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
          className="input-icon"
        >
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
        <input
          type="text"
          name="teamLead"
          placeholder="Filter by Team Lead"
          value={filter.teamLead}
          onChange={handleChange}
          className="form-input pl-10"
        />
      </div>
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
          className="input-icon"
        >
          <rect width="18" height="18" x="3" y="3" rx="2"></rect>
          <path d="M9 3v18"></path>
          <path d="M14 15h4"></path>
          <path d="M14 9h4"></path>
          <path d="M14 12h4"></path>
        </svg>
        <input
          type="text"
          name="functionalManager"
          placeholder="Filter by Functional Manager"
          value={filter.functionalManager}
          onChange={handleChange}
          className="form-input pl-10"
        />
      </div>
    </div>
  )
}
