/**
 * 文件上传相关 API 接口
 */
import { http } from '@/config/http.js'
import config from '@/config/config.js';
 // const baseURL = 'http://192.168.1.11:8883/v1'

const baseURL =  process.env.NODE_ENV === 'development' ? config.development.baseUrl : config.production.baseUrl;
/**
 * 上传文件
 * @param {Object} fileData - 文件数据
 * @param {string} fileData.filePath - 文件路径
 * @param {string} fileData.name - 文件名称
 * @returns {Promise} 返回上传结果
 */
export const uploadFile = (fileData) => {
  return new Promise((resolve, reject) => {
	  console.log('开始上传文件:', fileData)

	   console.log('开始上传文件:eeee', baseURL + '/file/upload')
    uni.uploadFile({
      url: baseURL+ '/file/upload',
      filePath: fileData.filePath,
      name: 'file',
      header: {
        'Authorization': uni.getStorageSync('token') || ''
      },
      success: (res) => {
        try {
          const data = JSON.parse(res.data)
          if (data.code === 0) {
            resolve(data)
          } else {
            reject(new Error(data.message || '上传失败'))
          }
        } catch (error) {
          console.error('响应数据解析失败:', error, res.data)
          reject(new Error('响应数据解析失败'))
        }
      },
      fail: (error) => {
        console.error('网络请求失败:', error)
        reject(new Error('网络请求失败'))
      }
    })
  })
}

/**
 * 批量上传文件
 * @param {Array} fileList - 文件列表
 * @returns {Promise} 返回批量上传结果
 */
export const uploadFiles = async (fileList) => {
  const uploadPromises = fileList.map(fileData => uploadFile(fileData))
  return Promise.all(uploadPromises)
}

/**
 * 获取文件上传结果
 * @param {Object} uploadResult - 上传结果
 * @returns {Object} 文件信息
 */
export const getUploadResult = (uploadResult) => {
  if (uploadResult && uploadResult.data) {
    return {
      objectKey: uploadResult.data.object_key,
      url: uploadResult.data.url,
      cover: uploadResult.data.cover,
      isVideo: uploadResult.data.is_video
    }
  }
  return null
} 