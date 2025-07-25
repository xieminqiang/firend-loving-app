import { http } from '@/config/http.js'

/**
 * 搜索伴友师
 * @param {Object} params 
 * @param {String} params.nickname 用户名搜索关键词
 * @param {String} params.city_code 城市代码（单个，兼容旧版本）
 * @param {Array<Number>} params.city_codes 城市代码列表（多选）
 * @param {String} params.gender 性别：男, 女
 * @param {Number} params.is_online 在线状态：0=离线, 1=在线
 * @param {Number} params.level_order 级别排序
 * @param {Number} params.latitude 用户当前纬度
 * @param {Number} params.longitude 用户当前经度
 * @param {Number} params.page 页码，默认1
 * @param {Number} params.page_size 每页数量，默认20，最大50
 * @returns Promise
 */
export const searchCompanions = (params = {}) => {
  // 过滤掉undefined和null的参数
  const cleanParams = {}
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
      cleanParams[key] = params[key]
    }
  })
  
  console.log('API调用参数:', cleanParams)
  
  return http({
    url: '/front/companion/search',
    method: 'GET',
    data: cleanParams
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

/**
 * 获取城市服务信息
 * @param {Object} params 
 * @param {String} params.city_code 城市代码
 * @param {String} params.application_id 申请ID
 * @returns Promise
 */
export const getCityServices = (params = {}) => {
  // 过滤掉undefined和null的参数
  const cleanParams = {}
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
      cleanParams[key] = params[key]
    }
  })
  
  console.log('获取城市服务API调用参数:', cleanParams)
  
  return http({
    url: '/front/companion/city-services',
    method: 'GET',
    data: cleanParams
  })
}
