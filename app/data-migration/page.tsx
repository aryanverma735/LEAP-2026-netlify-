"use client"

import { useState } from "react"
import { migrateAllCollections, previewMigrationChanges } from "../utils/dataMigration"
import { Database, Play, Eye, CheckCircle, XCircle, AlertTriangle } from "lucide-react"

export default function DataMigrationPage() {
  const [migrationResult, setMigrationResult] = useState<any>(null)
  const [previewResult, setPreviewResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [previewLoading, setPreviewLoading] = useState(false)

  const runPreview = async () => {
    setPreviewLoading(true)
    try {
      const result = await previewMigrationChanges()
      setPreviewResult(result)
      console.log("Preview result:", result)
    } catch (error) {
      console.error("Error running preview:", error)
      alert(`Error running preview: ${error.message}`)
    } finally {
      setPreviewLoading(false)
    }
  }

  const runMigration = async () => {
    if (!confirm("Are you sure you want to run the data migration? This will update existing records in the JSON storage.")) {
      return
    }

    setLoading(true)
    try {
      const result = await migrateAllCollections()
      setMigrationResult(result)
      console.log("Migration result:", result)
    } catch (error) {
      console.error("Error running migration:", error)
      alert(`Error running migration: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-t-2xl">
        <div className="flex items-center gap-3 mb-4">
          <Database className="h-8 w-8" />
          <h1 className="text-3xl font-bold">Data Migration Tool</h1>
        </div>
        <p className="text-blue-100">Standardize function and functional manager names across all collections</p>
      </div>

      <div className="bg-white rounded-b-2xl shadow-xl p-8 space-y-8">
        {/* Migration Mappings Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Function Standardization</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">DDO - Sanction, DDO - Carelon BH, DDO-Sanction</span>
                <span className="font-medium">→ DDO</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">PDS - Rework, Rework, Entire CA, Terms/Re-work</span>
                <span className="font-medium">→ Re-work</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">PCM Medicare</span>
                <span className="font-medium">→ PCM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">L&D</span>
                <span className="font-medium">→ L&D Offshore</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Functional Manager Standardization</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Arun Raj, Arun Raj Ravindran</span>
                <span className="font-medium">→ Ravindran, Arun Raj</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Deepa K v s, Deepa KVS</span>
                <span className="font-medium">→ K v s, Deepa</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Anupam Chatterjee</span>
                <span className="font-medium">→ Chatterjee, Anupam</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Kandaswamy Krishnakumar</span>
                <span className="font-medium">→ Kandasamy, Krishnakumar</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Aparna BN</span>
                <span className="font-medium">→ Bn, Aparna</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={runPreview}
            disabled={previewLoading}
            className="btn-secondary flex items-center gap-2 px-6 py-3"
          >
            {previewLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                Previewing...
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                Preview Changes
              </>
            )}
          </button>

          <button
            onClick={runMigration}
            disabled={loading}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Running Migration...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Run Migration
              </>
            )}
          </button>
        </div>

        {/* Preview Results */}
        {previewResult && (
          <div className="card bg-blue-50">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
              <Eye className="h-5 w-5 text-blue-600" />
              Preview Results
            </h3>

            <div className="mb-6">
              <h4 className="font-medium text-gray-700 mb-2">
                {previewResult.totalIdeas} total ideas
              </h4>

              {previewResult.changesCount > 0 ? (
                <div className="space-y-2">
                  <p className="text-sm text-blue-600 font-medium">
                    {previewResult.changesCount} ideas will be updated:
                  </p>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {previewResult.changesPreview.map((change: any, index: number) => (
                      <div key={index} className="text-xs bg-white p-2 rounded border">
                        <div className="font-mono text-gray-600">ID: {change.id} ({change.collection})</div>
                        {change.currentFunction && (
                          <div>
                            {"Function: \""}{change.currentFunction}{"\" → \""}{change.newFunction}{"\""}
                          </div>
                        )}
                        {change.currentFunctionalManager && (
                          <div>
                            {"Manager: \""}{change.currentFunctionalManager}{"\" → \""}{change.newFunctionalManager}{"\""}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-600">No changes needed.</p>
              )}
            </div>
          </div>
        )}

        {/* Migration Results */}
        {migrationResult && (
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
              {migrationResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              Migration Results
            </h3>

            <div className="mb-4 p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Updated {migrationResult.updatedCount} out of {migrationResult.totalIdeas} ideas</span>
              </div>

              {migrationResult.errors && migrationResult.errors.length > 0 && (
                <div className="mt-2">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-700">Errors:</span>
                  </div>
                  <ul className="text-xs text-red-600 space-y-1 ml-6">
                    {migrationResult.errors.map((error: string, index: number) => (
                      <li key={index}>{"• "}{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700">
                Migration completed! All data has been standardized according to the specified mappings.
              </p>
            </div>
          </div>
        )}

        {/* Warning */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <span className="font-medium text-yellow-800">Important Notes:</span>
          </div>
          <ul className="text-sm text-yellow-700 space-y-1 ml-6">
            <li>{"• This migration will update existing records in the JSON storage"}</li>
            <li>{"• Use \"Preview Changes\" first to see what will be updated"}</li>
            <li>{"• The migration is irreversible, so please backup your data if needed"}</li>
            <li>{"• All ideas across all collections will be updated"}</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
