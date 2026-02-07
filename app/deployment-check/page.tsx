"use client"

import { useState } from "react"
import { checkDeploymentIssues } from "../utils/deployment-check"

export default function DeploymentCheckPage() {
  const [checkResult, setCheckResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const runCheck = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await checkDeploymentIssues()
      setCheckResult(result)
    } catch (err) {
      setError(`Error running checks: ${err.message}`)
      console.error("Error running deployment checks:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Deployment Troubleshooting</h1>

      <div className="card mb-6">
        <h2 className="text-xl font-semibold mb-4">Run Deployment Checks</h2>
        <button onClick={runCheck} disabled={loading} className="btn-primary">
          {loading ? "Running Checks..." : "Run Checks"}
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-6">{error}</div>}

      {checkResult && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Check Results</h2>
          <div className="mb-4">
            <span className="font-medium">Timestamp:</span> {checkResult.timestamp}
          </div>

          {checkResult.hasIssues ? (
            <div>
              <div className="text-red-600 font-semibold mb-2">Found {checkResult.issues.length} issues:</div>
              <ul className="list-disc pl-5 space-y-1">
                {checkResult.issues.map((issue: string, index: number) => (
                  <li key={index} className="text-red-600">
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="text-green-600 font-semibold">No issues detected!</div>
          )}
        </div>
      )}

      <div className="card mt-6">
        <h2 className="text-xl font-semibold mb-4">Common Deployment Issues</h2>

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg">JSON Storage</h3>
            <p>
              Ensure the <code>data/ideas.json</code> file exists and is writable by the server process.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-lg">Build Errors</h3>
            <p>Check your build logs for any TypeScript errors or other build failures.</p>
          </div>

          <div>
            <h3 className="font-semibold text-lg">API Routes</h3>
            <p>Verify that the API routes under <code>/api/ideas/</code> are accessible and returning data correctly.</p>
          </div>

          <div>
            <h3 className="font-semibold text-lg">File Permissions</h3>
            <p>Ensure the server has read/write permissions to the <code>data/</code> directory.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
