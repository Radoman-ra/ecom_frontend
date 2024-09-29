import apiClient from './api'

export const fetchProducts = async (params: any) => {
  const response = await apiClient.get('/products', { params })
  return response.data
}

export const createProduct = async (productData: any) => {
  const response = await apiClient.post('/products', productData)
  return response.data
}
