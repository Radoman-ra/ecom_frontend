import apiClient from './api'

export const fetchOrders = async () => {
  const response = await apiClient.get('/orders')
  return response.data
}

interface OrderProductCreate {
  productId: string
  quantity: number
}

interface OrderCreate {
  products: OrderProductCreate[]
  status?: string
}

export const createOrder = async (orderData: OrderCreate) => {
  const response = await apiClient.post('/orders', orderData)
  return response.data
}
