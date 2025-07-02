import { http } from '@/config/http.js'

/**
 * 获取服务详情
 * @param {Number} id 服务ID
 * @returns Promise
 */
export const getServiceDetail = (id) => {
  return http({
    url: `/front/service/detail/${id}`,
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
    url: `/front/price-template/detail/${id}`,
    method: 'GET'
  })
}
/**
 * 获取热门推荐服务（首页使用）
 * @param {Object} params 
 * @param {Number} params.category 服务分类: 0=全部, 1=服务, 2=娱乐, 3=运动
 * @param {Number} params.page_size 每页数量，默认6
 * @param {Number} params.city_code 城市代码，可选，用于筛选该城市可用的服务
 * @returns Promise
 */
export const getHotRecommendServices = (params = {}) => {
  return getPlatformServicesList({
    page: 1,
    page_size: params.page_size || 6,
    category: params.category || 0,
    city_code: params.city_code
  })
}
/**
 * 获取平台服务列表（分页）
 * @param {Object} params 
 * @param {Number} params.page 页码，默认1
 * @param {Number} params.page_size 每页数量，默认10
 * @param {Number} params.category 服务分类: 0=全部, 1=服务, 2=娱乐, 3=运动
 * @param {Number} params.city_code 城市代码，可选，用于筛选该城市可用的服务
 * @returns Promise
 */
export const getPlatformServicesList = (params = {}) => {
  return http({
    url: '/front/home/page/services',
    method: 'GET',
    data: params
  })
}

/**
 * 获取城市列表
 * @returns Promise
 */
export const getCityList = () => {
  return http({
    url: '/front/cities',
    method: 'GET'
  })
}

