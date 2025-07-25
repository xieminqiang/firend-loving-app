import { http } from '@/config/http.js'

// 创建订单
export const createOrder = (data) => {
  return http({
    url: '/front/order/create',
    method: 'POST',
    data
  })
}

// 获取订单列表
export const getOrderList = (params) => {
  return http({
    url: '/front/order/list',
    method: 'POST',
    data: params
  })
}

// 订单创建成功
export const orderParams = (data) => {
  return http({
    url: '/front/order/params',
    method: 'POST',
    data
  })
}
