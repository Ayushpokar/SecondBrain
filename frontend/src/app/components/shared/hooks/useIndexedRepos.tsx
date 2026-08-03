import { useState, useEffect } from "react"
import api from "../../../services/api"

export function useIndexedRepos() {
  const [indexedRepos, setIndexedRepos] = useState<any[]>([])
  const [loading, setLoading]           = useState(true)

  const refetch = async () => {
    try {
      const { data } = await api.get("/api/repos")
      console.log(data)
      setIndexedRepos(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refetch() }, [])

  return { indexedRepos, loading, refetch }
}