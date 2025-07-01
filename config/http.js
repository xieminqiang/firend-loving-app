/**
 * 添加拦截器:
 *   拦截 request 请求
 *   拦截 uploadFile 文件上传
 *
 * TODO:
 *   1. 非 http 开头需拼接地址
 *   2. 请求超时
 *   3. 添加小程序端请求头标识
 *   4. 添加 token 请求头标识
 */

import { useUserStore } from '@/stores/user.js'
import config from '@/config/config.js';
 // const baseURL = 'http://192.168.1.11:8883/v1'

const baseURL =  process.env.NODE_ENV === 'development' ? config.development.baseUrl : config.production.baseUrl;
// https://api.aipointer.com/rest/v1
 //const baseURL = 'https://gxj.aipointer.com/gxj/v1';
// 添加拦截器e
const httpInterceptor = {
  // 拦截前触发
  invoke(options) {
    // 1. 非 http 开头需拼接地址
    if (!options.url.startsWith('http')) {
      options.url = baseURL + options.url
    }
    // 2. 请求超时, 默认 60s
    options.timeout = 600000
    // 3. 添加小程序端请求头标识
    options.header = {
      ...options.header,
      'source-client': 'miniapp',
    }
    // 4. 添加 token 请求头标识
    const userStore = useUserStore()
    const token = userStore.userInfo?.access_token
    if (token) {
      options.header.Authorization = 'Bearer ' + token
    }
  },
}

uni.addInterceptor('request', httpInterceptor)
uni.addInterceptor('uploadFile', httpInterceptor)

/**
 * 请求函数
 * @param  UniApp.RequestOptions
 * @returns Promise
 *  1. 返回 Promise 对象
 *  2. 获取数据成功
 *    2.1 提取核心数据 res.data
 *    2.2 添加类型，支持泛型
 *  3. 获取数据失败
 *    3.1 401错误  -> 清理用户信息，跳转到登录页
 *    3.2 其他错误 -> 根据后端错误信息轻提示
 *    3.3 网络错误 -> 提示用户换网络
 */

// 2.2 添加类型，支持泛型
export const http = (options) => {
  // 1. 返回 Promise 对象
  return new Promise((resolve, reject) => {
    uni.request({
      ...options,
      // 响应成功
      success(res) {
        // 状态码 2xx， axios 就是这样设计的
		
        if (res.statusCode >= 200 && res.statusCode < 300) {
          // 2.1 提取核心数据 res.data
		     console.log("222")
          
          // 检查业务错误码
          if (res.data && res.data.code !== undefined && res.data.code !== 0) {
            // 业务错误，显示错误信息并reject
            uni.showToast({
              icon: 'none',
              title: res.data.msg || '请求失败',
            })
            reject(res)
            return
          }
		
          resolve(res)
		   
        } else if (res.statusCode === 401) {
          // 401错误  -> 清理用户信息，跳转到登录页
          // const userStore = useUserStore()
          // userStore.clearUserInfo()
          // //跳转到我的页面
          // uni.switchTab({
          //   url: '/pages/my/index'
          // })
		
          // 提示用户登录
          uni.showToast({
            icon: 'none',
            title: '请先登录',
          })
          reject(res)
        } else {
          // 其他错误 -> 根据后端错误信息轻提示
          uni.showToast({
            icon: 'none',
            title: (res.data).msg || '请求错误',
          })
          reject(res)
        }
      },
      // 响应失败
      fail(err) {
        uni.showToast({
          icon: 'none',
          title: '网络错误，换个网络试试',
        })
        reject(err)
      },
    })
  })
}
export const httpWx = (options) => {
  // 1. 返回 Promise 对象
  return new Promise((resolve, reject) => {
    uni.request({
      ...options,
      // 响应成功
      success(res) {
        // 状态码 2xx， axios 就是这样设计的
        if (res.statusCode >= 200 && res.statusCode < 300) {
          // 2.1 提取核心数据 res.data
          
          // 检查业务错误码
          if (res.data && res.data.code !== undefined && res.data.code !== 0) {
            // 业务错误，显示错误信息并reject
            uni.showToast({
              icon: 'none',
              title: res.data.msg || '请求失败',
            })
            reject(res)
            return
          }
          
          resolve(res)
        } else if (res.statusCode === 401) {
         
        } else {
          // 其他错误 -> 根据后端错误信息轻提示
          uni.showToast({
            icon: 'none',
            title: (res.data).msg || '请求错误',
          })
          reject(res)
        }
      },
      // 响应失败
      fail(err) {
        uni.showToast({
          icon: 'none',
          title: '网络错误，换个网络试试',
        })
        reject(err)
      },
    })
  })
}
