import apiClient from './api'

export const login = async (credentials: any) => {
  const response = await apiClient.post('/auth/login', credentials)
  return response.data
}

export const register = async (userData: any) => {
  const response = await apiClient.post('/auth/register', userData)
  return response.data
}
