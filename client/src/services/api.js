import axios from 'axios'

const apiBaseUrl = import.meta.env.VITE_API_URL || (import.meta.env.PROD
  ? 'https://kabadivala-api.onrender.com/api'
  : 'http://localhost:5000/api')

export const api = axios.create({
  baseURL: apiBaseUrl,
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('kabadivala_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use((response) => response, (error) => {
  if (error.response?.status === 401) localStorage.removeItem('kabadivala_token')
  return Promise.reject(error)
})
