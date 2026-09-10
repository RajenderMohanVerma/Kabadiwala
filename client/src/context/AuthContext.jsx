import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../services/api'

const AuthContext = createContext(null)
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const token = localStorage.getItem('kabadivala_token')
    if (!token) return setLoading(false)
    api.get('/auth/me').then(({ data }) => setUser(data.data.user)).catch(() => localStorage.removeItem('kabadivala_token')).finally(() => setLoading(false))
  }, [])
  const value = useMemo(() => ({
    user, loading,
    async login(credentials) { const { data } = await api.post('/auth/login', credentials); localStorage.setItem('kabadivala_token', data.data.token); setUser(data.data.user); return data },
    async register(details) { const { data } = await api.post('/auth/register', details); localStorage.setItem('kabadivala_token', data.data.token); setUser(data.data.user); return data },
    logout() { localStorage.removeItem('kabadivala_token'); setUser(null) }
  }), [user, loading])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
export const useAuth = () => useContext(AuthContext)