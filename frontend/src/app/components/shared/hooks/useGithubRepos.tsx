import { useState, useEffect } from "react"
import api from "../../../services/api"

export function useGithubRepos() {
  const [githubRepos, setGithubRepos] = useState<any[]>([])
  const [loading, setLoading]         = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get("/api/github/repos")
        setGithubRepos(data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  return { githubRepos, loading }
}