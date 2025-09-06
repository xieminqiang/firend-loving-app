import { http } from '@/config/http.js'

/**
 * 获取动态列表
 * @param {Object} params - 请求参数
 * @param {string} params.list_type - 列表类型 (trends/love)
 * @param {string} params.location - 位置信息
 * @param {number} params.page - 页码
 * @param {number} params.page_size - 每页数量
 * @returns {Promise} 返回动态列表数据
 */
export const getMomentsList = (params) => {
	return http({
		url: '/front/get/moments/list/with-companion',
		method: 'POST',
		data: params
	})
}

/**
 * 获取动态请求列表
 * @returns {Promise} 返回动态请求列表数据
 */
export const getMomentsRequest = () => {
	return http({
		url: '/front/get/moments/request',
		method: 'GET'
	})
}

/**
 * 发布动态
 * @param {Object} params - 请求参数
 * @param {string} params.content - 动态内容
 * @param {number} params.status - 动态状态 (1-5)
 * @param {string} params.location - 发布动态的定位（经纬度）
 * @param {string} params.location_desc - 发布动态的定位描述
 * @param {number} params.image_count - 图片数量
 * @param {number} params.video_count - 视频数量
 * @param {Array} params.media_list - 媒体文件列表
 * @param {Array} params.topics - 话题列表
 * @param {Array} params.object_keys - 对象键列表
 * @returns {Promise} 返回发布结果
 */
export const pushMoments = (params) => {
	return http({
		url: '/front/push/moments',
		method: 'POST',
		data: params
	})
}

/**
 * 点赞动态
 * @param {Object} params - 请求参数
 * @param {string} params.target_id - 动态ID
 * @returns {Promise} 返回点赞结果
 */
export const praiseMoment = (params) => {
	return http({
		url: '/front/praise/moment',
		method: 'POST',
		data: params
	})
}

/**
 * 获取动态详情
 * @param {Object} params - 请求参数
 * @param {string} params.moments_id - 动态ID
 * @returns {Promise} 返回动态详情数据
 */
export const getMomentsDetail = (params) => {
	return http({
		url: '/front/get/moments/detail/with-companion',
		method: 'POST',
		data: params
	})
}

/**
 * 发布动态评论
 * @param {Object} params - 请求参数
 * @param {string} params.moments_id - 动态ID
 * @param {string} params.reply_comments_id - 评论ID（可选）
 * @param {string} params.content - 评论内容
 * @param {string} params.location - 评论定位（可选）
 * @param {string} params.location_desc - 评论定位描述（可选）
 * @returns {Promise} 返回发布评论结果
 */
export const pushMomentComment = (params) => {
	return http({
		url: '/front/push/moment/comment',
		method: 'POST',
		data: params
	})
}

/**
 * 获取动态评论列表
 * @param {Object} params - 请求参数
 * @param {string} params.moments_id - 动态ID
 * @param {number} params.page - 页码
 * @param {number} params.page_size - 每页数量
 * @returns {Promise} 返回评论列表数据
 */
export const getMomentCommentList = (params) => {
	return http({
		url: '/front/get/moment/comment/list',
		method: 'POST',
		data: params
	})
}

/**
 * 获取更多动态评论列表
 * @param {Object} params - 请求参数
 * @param {string} params.comments_id - 评论ID
 * @param {number} params.page - 页码
 * @param {number} params.page_size - 每页数量
 * @returns {Promise} 返回更多评论列表数据
 */
export const getMoreMomentCommentList = (params) => {
	return http({
		url: '/front/get/more/moment/comment/list',
		method: 'POST',
		data: params
	})
}

/**
 * 获取友伴师动态列表
 * @param {Object} params - 请求参数
 * @param {number} params.companion_id - 友伴师ID
 * @param {number} params.page - 页码
 * @param {number} params.page_size - 每页数量
 * @returns {Promise} 返回友伴师动态列表数据
 */
export const getMomentsByCompanion = (params) => {
	return http({
		url: '/front/get/moments/by-companion',
		method: 'POST',
		data: params
	})
}

