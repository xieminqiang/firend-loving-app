import { http } from '@/config/http.js'

/**
 * 获取平台服务列表（分页）
 * @param {Object} params 
 * @param {Number} params.page 页码，默认1
 * @param {Number} params.page_size 每页数量，默认10
 * @param {Number} params.category 服务分类: 0=全部, 1=服务, 2=娱乐, 3=运动
 * @returns Promise
 */
export const getPlatformServicesList = (params = {}) => {
  return http({
    url: '/home/page/services',
    method: 'GET',
    data: params
  })
}

/**
 * 获取热门推荐服务（首页使用）
 * @param {Object} params 
 * @param {Number} params.category 服务分类: 0=全部, 1=服务, 2=娱乐, 3=运动
 * @param {Number} params.page_size 每页数量，默认6
 * @returns Promise
 */
export const getHotRecommendServices = (params = {}) => {
  return getPlatformServicesList({
    page: 1,
    page_size: params.page_size || 6,
    category: params.category || 0
  })
}
