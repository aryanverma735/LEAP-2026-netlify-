/**
 * Utility to check for common deployment issues
 * This can be imported and run during development to identify potential problems
 */

export async function checkDeploymentIssues() {
  const issues: string[] = []

  // Check API connection by fetching ideas
  try {
    const res = await fetch("/api/ideas?collection=pendingIdeas")
    if (res.ok) {
      console.log("API connection successful")
    } else {
      issues.push(`API returned status ${res.status}`)
    }
  } catch (error: any) {
    console.error("API connection failed:", error)
    issues.push(`API connection error: ${error.message}`)
  }

  return {
    hasIssues: issues.length > 0,
    issues,
    timestamp: new Date().toISOString(),
  }
}
