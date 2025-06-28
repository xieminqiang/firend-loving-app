/**
 * 用户相关 API 接口
 */
import { http } from '@/config/http.js'

/**
 * 微信授权登录
 * @param {Object} data - 登录数据
 * @param {string} data.code - 微信登录code
 * @param {string} data.encryptedData - 加密数据（可选）
 * @param {string} data.iv - 初始向量（可选）
 * @param {string} data.signature - 数据签名（可选）
 * @param {string} data.rawData - 原始数据（可选）
 * @returns {Promise} 返回登录结果
 */
export const wxLogin = (data) => {
  return http({
    url: '/user/wx',
    method: 'POST',
    data
  })
}

/**
 * 获取用户信息
 * @returns {Promise} 返回用户信息
 */
export const getUserInfo = () => {
  return http({
    url: '/user/center/info',
    method: 'GET'
  })
}

/**
 * 获取指定城市的服务列表
 * @param {Array} cityCodes - 城市代码列表
 * @returns {Promise} 返回服务列表
 */
export const getServicesByCities = (cityCodes) => {
  const queryParams = cityCodes.map(code => `city_codes=${code}`).join('&')
  return http({
    url: `/companion/services/cities?${queryParams}`,
    method: 'GET'
  })
}

/**
 * 创建伴侣申请
 * @param {Object} data - 申请数据
 * @returns {Promise} 返回创建结果
 */
export const createCompanionApplication = (data) => {
  return http({
    url: '/companion/application',
    method: 'POST',
    data
  })
}


/**
 * 更新用户信息
 * @param {Object} data - 用户信息数据
 * @returns {Promise} 返回更新结果
 */
export const updateUserInfo = (data) => {
  return http({
    url: '/user/update',
    method: 'PUT',
    data
  })
}

/**
 * 用户退出登录
 * @returns {Promise} 返回退出结果
 */
export const logout = () => {
  return http({
    url: '/user/logout',
    method: 'POST'
  })
}