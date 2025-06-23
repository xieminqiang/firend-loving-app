import { http } from '@/config/http.js'

/**
 * 获取服务详情
 * @param {Number} id 服务ID
 * @returns Promise
 */
export const getServiceDetail = (id) => {
  return http({
    url: `/service/detail/${id}`,
    method: 'GET'
  })
}

/**
 * 获取价格模板详情
 * @param {Number} id 价格模板ID
 * @returns Promise
 */
export const getPriceTemplateDetail = (id) => {
  return http({
    url: `/price-template/detail/${id}`,
    method: 'GET'
  })
}
