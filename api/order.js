import { http } from '@/config/http.js'

// 创建订单
export const createOrder = (data) => {
  return http({
    url: '/front/order/create',
    method: 'POST',
    data
  })
}

// 创建订单 v2
export const createOrderV2 = (data) => {
  return http({
    url: '/front/order/create-v2',
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

// 取消订单
export const cancelOrder = (data) => {
  return http({
    url: '/front/order/cancel',
    method: 'POST',
    data
  })
}

// 删除订单
export const deleteOrder = (data) => {
  return http({
    url: '/front/order/delete',
    method: 'POST',
    data
  })
}

// 删除友伴订单
export const deleteCompanionOrder = (data) => {
  return http({
    url: '/front/companion/order/delete',
    method: 'POST',
    data
  })
}

// 申请退款
export const applyRefund = (data) => {
  return http({
    url: '/front/refund/apply',
    method: 'POST',
    data
  })
}

// 申请退款（出发后）
export const applyRefundAfterDeparture = (data) => {
  return http({
    url: '/front/refund/apply-after-departure',
    method: 'POST',
    data
  })
}

// 获取友伴订单列表
export const getCompanionOrderList = (params) => {
  // 确保companion_id存在
  if (!params.companion_id) {
    console.warn('getCompanionOrderList: companion_id is required')
  }
  
  return http({
    url: '/front/companion/order/list',
    method: 'POST',
    data: params
  })
}

// 获取友伴订单详情
export const getCompanionOrderDetail = (params) => {
  // 确保order_id和companion_id存在
  if (!params.order_id) {
    console.warn('getCompanionOrderDetail: order_id is required')
  }
  if (!params.companion_id) {
    console.warn('getCompanionOrderDetail: companion_id is required')
  }
  
  return http({
    url: '/front/companion/order/detail',
    method: 'POST',
    data: params
  })
}

// 友伴接单
export const acceptCompanionOrder = (data) => {
  return http({
    url: '/front/companion/order/accept',
    method: 'POST',
    data
  })
}

// 友伴拒绝订单
export const rejectCompanionOrder = (data) => {
  return http({
    url: '/front/companion/order/reject',
    method: 'POST',
    data
  })
}

// 友伴确认到达
export const arrivedCompanionOrder = (data) => {
  return http({
    url: '/front/companion/order/arrived',
    method: 'POST',
    data
  })
}

// 友伴开始服务
export const startCompanionService = (data) => {
  return http({
    url: '/front/companion/order/start',
    method: 'POST',
    data
  })
}

// 友伴结束服务
export const endCompanionService = (data) => {
  return http({
    url: '/front/companion/order/end',
    method: 'POST',
    data
  })
}

// 友伴确认出发
export const departCompanionOrder = (data) => {
  return http({
    url: '/front/companion/order/departure',
    method: 'POST',
    data
  })
}

// 获取订单数量统计
export const getOrderCount = () => {
  return http({
    url: '/front/order/count',
    method: 'POST'
  })
}

// 开始计时服务
export const startService = (data) => {
  return http({
    url: '/front/order/start-service',
    method: 'POST',
    data
  })
}

// 获取订单详情
export const getOrderDetail = (params) => {
  return http({
    url: '/front/order/detail',
    method: 'POST',
    data: params
  })
}

// 获取服务信息
export const getServiceInfo = (params) => {
  return http({
    url: '/front/order/service-info',
    method: 'POST',
    data: params
  })
}

// 计算距离
export const calculateDistance = (params) => {
  return http({
    url: '/front/order/calculate-distance',
    method: 'POST',
    data: params
  })
}

// 获取友伴师可用时间安排
export const getCompanionAvailableSchedule = (companion_id) => {
  return http({
    url: '/front/companion/available-schedule',
    method: 'GET',
    data: { companion_id }
  })
}

// 获取友伴活跃订单（最近订单）
export const getCompanionActiveOrders = (data) => {
  return http({
    url: '/front/companion/order/active',
    method: 'POST',
    data
  })
}
