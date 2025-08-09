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
    url: '/front/user/wx',
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
    url: '/front/user/center/info',
    method: 'GET'
  })
}

export const getApplicatioInfo = () => {
  return http({
    url: '/front/companion/application/my',
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
    url: `/front/companion/services/cities?${queryParams}`,
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
    url: '/front/companion/application',
    method: 'POST',
    data
  })
}

/**
 * 更新友伴师上线/下线状态
 * @param {Object} data - 在线状态信息
 * @param {number} data.is_online - 在线状态：0=下线，1=上线
 * @param {number} data.latitude - 纬度
 * @param {number} data.longitude - 经度
 * @param {string} data.location_text - 位置描述
 * @returns {Promise} API响应
 */
export function updateCompanionOnlineStatus(data) {
  return http({
    url: '/front/companion/online-status',
    method: 'POST',
    data
  })
}

/**
 * 获取友伴师在线状态信息
 * @returns {Promise} API响应
 */
export function getCompanionOnlineStatus() {
  return http({
    url: '/front/companion/online-status',
    method: 'GET'
  })
}

/**
 * 更新用户信息
 * @param {Object} data - 用户信息数据
 * @returns {Promise} 返回更新结果
 */
export const updateUserInfo = (data) => {
  return http({
    url: '/front/user/update',
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
    url: '/front/user/logout',
    method: 'POST'
  })
}

/**
 * 上传友伴师自我介绍视频
 * @param {Object} data - 视频上传数据
 * @param {string} data.intro_video_url - 自我介绍视频地址
 * @returns {Promise} 返回上传结果
 */
export const uploadCompanionVideo = (data) => {
  return http({
    url: '/front/companion/video/upload',
    method: 'POST',
    data
  })
}

/**
 * 获取个性标签列表
 * @param {Object} params - 查询参数
 * @param {number} params.tag_type - 标签类型：4=个性特质，5=我的爱好，6=外貌风格，7=专业技能，8=热门推荐
 * @param {string} params.keyword - 搜索关键词（可选）
 * @param {number} params.page - 页码，默认1
 * @param {number} params.pageSize - 每页数量，默认20
 * @returns {Promise} 返回标签列表
 */
export const getPersonalityTags = (params) => {
  console.log('getPersonalityTags 调用开始', params)
  
  // 手动构建查询字符串，兼容小程序环境
  const queryParts = []
  if (params.tag_type) queryParts.push(`tag_type=${params.tag_type}`)
  if (params.keyword) queryParts.push(`keyword=${encodeURIComponent(params.keyword)}`)
  if (params.page) queryParts.push(`page=${params.page}`)
  if (params.pageSize) queryParts.push(`pageSize=${params.pageSize}`)
  
  const queryString = queryParts.join('&')
  const url = queryString ? `/front/service/tags?${queryString}` : '/front/service/tags'
  
  console.log('构建的URL:', url)
  console.log('查询字符串:', queryString)
  
  return http({
    url: url,
    method: 'GET'
  })
}

/**
 * 获取热门个性标签
 * @param {Object} params - 查询参数
 * @param {number} params.tag_type - 标签类型（可选）
 * @param {number} params.limit - 返回数量，默认20
 * @returns {Promise} 返回热门标签列表
 */
export const getPopularPersonalityTags = (data) => {
  return http({
    url: '/front/service/tags/popular',
    method: 'GET',
    data
  })
}

/**
 * 更新友伴师申请信息
 * @param {Object} data - 申请数据
 * @returns {Promise} 返回更新结果
 */
export const updateCompanionApplication = (data) => {
  return http({
    url: '/front/companion/application',
    method: 'PUT',
    data
  })
}

/**
 * 获取服务等级列表
 * @returns {Promise} 返回服务等级列表
 */
export const getServiceLevels = () => {
  return http({
    url: '/front/companion/service-levels',
    method: 'GET'
  })
}

/**
 * 获取友伴师时间安排
 * @param {Object} params - 请求参数
 * @param {number} params.companion_id - 友伴师ID
 * @returns {Promise} 返回时间安排信息
 */
export const getCompanionSchedule = (data) => {
  return http({
    url: '/front/companion/schedule',
    method: 'GET',
    data
  })
}

/**
 * 保存友伴师时间安排
 * @param {Object} data - 时间安排数据
 * @param {number} data.companion_id - 友伴师ID
 * @param {number} data.day_of_week - 星期几 (1-7)
 * @param {Object} data.schedule - 时间安排对象 { "00:00": 1, "00:30": 2, ... }
 * @returns {Promise} 返回保存结果
 */
export const saveCompanionSchedule = (data) => {
  return http({
    url: '/front/companion/schedule',
    method: 'PUT',
    data
  })
}