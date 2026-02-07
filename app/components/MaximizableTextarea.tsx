"use client"

import type React from "react"
import { useState } from "react"
import { Maximize2, Minimize2 } from "lucide-react"

interface MaximizableTextareaProps {
  id: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  placeholder?: string
  className?: string
  rows?: number
  required?: boolean
  label?: string
}

export default function MaximizableTextarea({
  id,
  name,
  value,
  onChange,
  placeholder,
  className = "",
  rows = 6,
  required = false,
  label,
}: MaximizableTextareaProps) {
  const [isMaximized, setIsMaximized] = useState(false)

  const toggleMaximize = () => {
    setIsMaximized(!isMaximized)
  }

  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <textarea
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={isMaximized ? 20 : rows}
          required={required}
          className={`
            w-full px-3 py-2 border border-gray-300 rounded-lg 
            focus:ring-2 focus:ring-purple-500 focus:border-purple-500 
            resize-none transition-all duration-200
            ${isMaximized ? "min-h-[500px]" : "min-h-[150px]"}
            ${className}
          `}
        />

        <button
          type="button"
          onClick={toggleMaximize}
          className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 transition-colors bg-white rounded shadow-sm"
          title={isMaximized ? "Minimize" : "Maximize"}
        >
          {isMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </button>
      </div>

      <div className="flex justify-between items-center text-xs text-gray-500">
        <span>{value.length} characters</span>
        {isMaximized && <span className="text-blue-600">Press Esc to minimize or click the minimize button</span>}
      </div>

      {/* Full-screen overlay when maximized */}
      {isMaximized && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={toggleMaximize}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">{label || "Edit Text"}</h3>
              <button
                onClick={toggleMaximize}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Minimize2 className="h-5 w-5" />
              </button>
            </div>

            <textarea
              value={value}
              onChange={onChange}
              placeholder={placeholder}
              className="flex-1 w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
              autoFocus
            />

            <div className="flex justify-between items-center mt-4">
              <span className="text-sm text-gray-500">{value.length} characters</span>
              <button
                onClick={toggleMaximize}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
