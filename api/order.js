import { http } from '@/config/http.js'

// 创建订单
export const createOrder = (data) => {
  return http({
    url: '/front/order/create',
    method: 'POST',
    data
  })
}
