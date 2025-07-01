<template>
  <scroll-view class="tab-scroll-view" scroll-y="true">
    <view class="workbench-content">
    
      <!-- 上线/下线状态控制 -->
      <view class="status-control">
        <view class="status-card" :class="{ 'online': isOnline }">
          <!-- 左侧：状态信息和头像 -->
          <view class="status-left">
            <!-- 头像显示 -->
            <view class="avatar-container" v-if="applicationInfo && applicationInfo.photos && applicationInfo.photos.length > 0">
              <image :src="applicationInfo.photos[0]" class="avatar-img" mode="aspectFill" />
            </view>
            
            <view class="status-info">
              <view class="status-indicator">
                <view class="status-dot" :class="{ 'active': isOnline }"></view>
                <text class="status-text">{{ isOnline ? '已上线' : '已下线' }}</text>
              </view>
              <text class="status-desc">{{ isOnline ? '正在接单中' : '暂停接单' }}</text>
            </view>
          </view>
          
          <!-- 右侧：切换按钮 -->
          <view class="status-right">
            <view class="toggle-button" :class="{ 'online': isOnline }" @click="toggleStatus">
              <view class="toggle-icon">
                <view class="icon-container">
                  <view class="icon-play" v-if="!isOnline"></view>
                  <view class="icon-pause" v-if="isOnline"></view>
                </view>
              </view>
              <text class="toggle-text">{{ isOnline ? '下线休息' : '开始上线' }}</text>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 位置管理 -->
      <view class="location-management">
        <view class="location-card">
          <view class="location-content">
            <view class="flex-between">
              <view class="location-header">
              <image class="location-icon" src="@/static/icons/partner/dizhi.png" mode="aspectFit" />
              <text class="location-title">当前位置</text>
            </view>
            <view class="location-actions">
              <view class="action-btn refresh-btn" @click="refreshLocation">
                <image class="btn-icon" src="@/static/icons/partner/shuaxin.png" mode="aspectFit" />
                <text class="location-btn-text">刷新位置</text>
              </view>
              <view class="action-btn select-btn" @click="selectLocation">
                <image class="btn-icon" src="@/static/icons/partner/shoudong.png" mode="aspectFit" />
                <text class="location-btn-text">手动选择</text>
              </view>
            </view>
              </view>
           
            <view class="location-info">
              <text class="location-address">{{ currentLocation || '正在获取位置...' }}</text>
              <text class="location-time">{{ locationUpdateTime }}</text>
            </view>
           
          </view>
        </view>
      </view>
      
      <!-- 最近订单 -->
      <view class="recent-orders">
        <view class="section-header">
          <text class="section-title">最近订单</text>
          <text class="view-all" @click="viewAllOrders">查看全部</text>
        </view>
        <view class="empty-orders">
          <view class="empty-icon">📦</view>
          <text class="empty-text">暂无订单</text>
          <text class="empty-desc">开始接单，获得收入</text>
        </view>
      </view>
    </view>
  </scroll-view>

  <!-- 视频上传弹框 -->
  <view v-if="showVideoUploadModal" class="video-upload-overlay" @click="hideVideoUploadModal">
    <view class="video-upload-container" @click.stop>
      <!-- 弹框头部 -->
      <view class="modal-header">
        <view class="header-content">
          <view class="header-icon">🎬</view>
          <view class="header-text">
            <text class="modal-title">上传自我介绍视频</text>
            <text class="modal-subtitle">展示你的专业能力和个人魅力</text>
          </view>
        </view>
        <view class="close-btn" @click="hideVideoUploadModal">
          <text class="close-icon">✕</text>
        </view>
      </view>

      <!-- 弹框内容 -->
      <view class="modal-content">
        <!-- 视频状态显示 -->
        <view class="video-status-section" v-if="applicationInfo && applicationInfo.intro_video_url">
          <view class="status-badge" :class="getStatusBadgeClass(applicationInfo.video_review_status)">
            <text class="status-text">{{ getVideoStatusText(applicationInfo.video_review_status) }}</text>
          </view>
          <text class="status-desc">{{ getVideoStatusDesc(applicationInfo.video_review_status) }}</text>
        </view>

        <!-- 视频预览区域 -->
        <view class="video-preview-section">
          <!-- 已有视频时显示预览 -->
          <view v-if="videoUrl && videoUrl != ''" class="video-preview">
            <video 
              :src="videoUrl" 
              class="preview-video"
              controls
              show-center-play-btn
              show-play-btn
              show-fullscreen-btn
              show-progress
              enable-progress-gesture
            ></video>
            <view class="video-actions">
              <view class="video-action-btn replace-btn" @click="selectVideo">
                <text class="video-btn-text">重新上传</text>
              </view>
            
            </view>
          </view>
          
          <!-- 无视频时显示上传区域 -->
          <view v-else class="video-upload-area" @click="selectVideo">
            <view class="upload-content">
              <view class="upload-icon">📹</view>
              <text class="upload-title">上传自我介绍视频</text>
              <text class="upload-desc">支持MP4格式，时长3-60秒</text>
              <view class="upload-requirements">
                <text class="requirement-item">• 视频时长：3-60秒</text>
                <text class="requirement-item">• 文件大小：不超过500MB</text>
                <text class="requirement-item">• 格式要求：MP4</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 上传进度 -->
        <view v-if="isUploading" class="upload-progress">
          <view class="progress-bar">
            <view class="progress-fill" :style="{ width: uploadProgress + '%' }"></view>
          </view>
          <text class="progress-text">上传中... {{ uploadProgress }}%</text>
        </view>
      </view>

      <!-- 弹框底部 -->
      <view class="modal-footer">
        <view class="footer-actions">
          <view class="cancel-btn" @click="hideVideoUploadModal">
            <text class="modal-btn-text">取消</text>
          </view>
          <view 
            class="submit-btn" 
            :class="{ disabled: !videoUrl || isUploading }"
            @click="submitVideo"
          >
            <text class="modal-btn-text" v-if="applicationInfo && applicationInfo.intro_video_url" >{{ isUploading ? '上传中...' : '重新提交' }}</text>
			<text class="modal-btn-text" v-else >{{ isUploading ? '上传中...' : '提交审核' }}</text>
			
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import { getCurrentLocationAddress, getCacheStatus } from '@/utils/location.js'
import { updateCompanionOnlineStatus, uploadCompanionVideo } from '@/api/user.js'
import { uploadFile, getUploadResult } from '@/api/file.js'
import { processAddress, analyzeAddress } from '@/utils/address.js'

// 定义props
const props = defineProps({
  applicationInfo: {
    type: Object,
    default: null
  }
})

// 状态管理
const isOnline = ref(false)
const currentLocation = ref('')
const locationUpdateTime = ref('')
const isInitialized = ref(false)
const isUpdatingStatus = ref(false) // 防止重复点击

// 视频上传相关状态
const showVideoUploadModal = ref(false)
const videoUrl = ref('')
const isUploading = ref(false)
const uploadProgress = ref(0)

// 计算属性：检查applicationInfo是否有效
const hasValidApplicationInfo = computed(() => {
  return props.applicationInfo && typeof props.applicationInfo === 'object'
})

// 从applicationInfo中获取默认的在线状态
const initOnlineStatus = () => {
  if (hasValidApplicationInfo.value && typeof props.applicationInfo.is_online !== 'undefined') {
    isOnline.value = props.applicationInfo.is_online === 1
    console.log('从applicationInfo获取在线状态:', isOnline.value, '原始值:', props.applicationInfo.is_online)
  } else {
    isOnline.value = false
    console.log('使用默认在线状态: 下线')
  }
}

// 初始化组件
const initializeComponent = async () => {
  if (isInitialized.value) {
    console.log('组件已经初始化过，跳过重复初始化')
    return
  }
  
  console.log('开始初始化Workbench组件')
  
  // 等待下一个tick确保DOM更新
  await nextTick()
  
  // 初始化在线状态
  initOnlineStatus()
  
  // 获取位置信息（不强制刷新）
  getLocationInfo()
  
  isInitialized.value = true
  console.log('Workbench组件初始化完成')
}

// 监听applicationInfo变化
watch(() => props.applicationInfo, (newVal, oldVal) => {
  console.log('applicationInfo发生变化:', { old: oldVal, new: newVal })
  
  if (newVal && hasValidApplicationInfo.value) {
    // 如果组件已经初始化过，只更新在线状态
    if (isInitialized.value) {
      console.log('组件已初始化，只更新在线状态')
      initOnlineStatus()
    } else {
      // 首次初始化
      initializeComponent()
    }
  }
}, { immediate: true, deep: true })

// 切换上线/下线状态
const toggleStatus = async () => {
  if (isUpdatingStatus.value) {
    console.log('正在更新状态，忽略重复点击')
    return
  }
  
  const newStatus = !isOnline.value
  const statusText = newStatus ? '上线' : '下线'
  
  // 检查是否需要上传视频
  if (newStatus && hasValidApplicationInfo.value && props.applicationInfo.can_accept_orders === 'N') {
    // 检查是否已有视频且已通过审核
    if (!props.applicationInfo.intro_video_url || props.applicationInfo.video_review_status !== 'approved') {
      // 显示视频上传弹框
      showVideoUploadModal.value = true
      // 如果有现有视频，显示在预览区域
      if (props.applicationInfo.intro_video_url) {
        videoUrl.value = props.applicationInfo.intro_video_url
      }
      return
    }
  }
  
  uni.showModal({
    title: `确认${statusText}`,
    content: newStatus ? '上线后将开始接收订单，确认上线吗？' : '下线后将停止接收订单，确认下线吗？',
    success: async (res) => {
      if (res.confirm) {
        await updateOnlineStatus(newStatus)
      }
    }
  })
}

// 更新在线状态到服务器
const updateOnlineStatus = async (newStatus) => {
  isUpdatingStatus.value = true
  
  try {
    // 获取当前位置信息
    let locationInfo = null
    
    if (newStatus) {
      // 上线时需要获取位置信息
      uni.showLoading({ title: '获取位置中...' })
      
      try {
        locationInfo = await getCurrentLocationAddress(false) // 强制刷新位置
        console.log('获取位置成功:', locationInfo)
      } catch (error) {
        console.error('获取位置失败:', error)
        uni.hideLoading()
        uni.showToast({
          title: '获取位置失败，无法上线',
          icon: 'none'
        })
        return
      }
    } else {
      // 下线时可以使用缓存的位置信息
      const cacheStatus = getCacheStatus()
      if (cacheStatus.hasCache) {
        locationInfo = {
          latitude: cacheStatus.coordinates.latitude,
          longitude: cacheStatus.coordinates.longitude,
          address: cacheStatus.address
        }
      }
    }
    
    // 处理地址字符串
    const processedAddress = processAddress(locationInfo ? locationInfo.address : '')
    
    // 准备请求数据
    const requestData = {
      is_online: newStatus ? 1 : 0,
      latitude: locationInfo ? locationInfo.latitude : null,
      longitude: locationInfo ? locationInfo.longitude : null,
      location_text: processedAddress
    }
    
    // 添加详细的调试信息
    console.log('准备更新在线状态:', requestData)
    console.log('位置描述分析:', analyzeAddress(locationInfo ? locationInfo.address : ''))
    
    // 调用API更新状态
    const response = await updateCompanionOnlineStatus(requestData)
    
    if (response.data && response.data.code === 0) {
      // 更新成功
      isOnline.value = newStatus
      
      // 更新位置显示
      if (locationInfo) {
        currentLocation.value = locationInfo.address
        locationUpdateTime.value = new Date().toLocaleTimeString()
      }
      
      uni.hideLoading()
      uni.showToast({
        title: newStatus ? '已上线，开始接单' : '已下线，暂停接单',
       icon: 'none'
      })
      
      console.log('在线状态更新成功:', response.data)
    } else {
      // 更新失败
      uni.hideLoading()
      uni.showToast({
        title: response.data?.msg || '状态更新失败',
       icon: 'none'
      })
      console.error('在线状态更新失败:', response.data)
    }
  } catch (error) {
    uni.hideLoading()
    uni.showToast({
      title: '网络错误，请重试',
       icon: 'none'
    })
    console.error('更新在线状态失败:', error)
  } finally {
    isUpdatingStatus.value = false
  }
}

// 获取位置信息（不强制刷新）
const getLocationInfo = () => {
  const cacheStatus = getCacheStatus()
  
  // 如果有有效缓存，直接使用
  if (cacheStatus.hasCache && cacheStatus.isValid) {
    currentLocation.value = cacheStatus.address
    locationUpdateTime.value = new Date(cacheStatus.timestamp).toLocaleTimeString()
    console.log('使用缓存位置信息:', cacheStatus.address)
    console.log('使用缓存:', cacheStatus)
    if (isOnline.value) {
      updateLocationToServer(cacheStatus.coordinates.latitude, cacheStatus.coordinates.longitude, cacheStatus.address)
    }
    return
  }
  
  // 没有有效缓存时，获取位置
  getCurrentLocationAddress(false)
    .then(locationInfo => {
      currentLocation.value = locationInfo.address
      locationUpdateTime.value = new Date().toLocaleTimeString()
      console.log('获取位置成功', locationInfo)
      
      // 如果用户已上线，更新位置信息到服务器
      if (isOnline.value) {
        updateLocationToServer(locationInfo.latitude, locationInfo.longitude, locationInfo.address)
      }
    })
    .catch(err => {
      console.error('获取位置失败:', err)
      // 如果获取失败，显示默认信息
      currentLocation.value = '位置获取失败'
      locationUpdateTime.value = '获取失败'
    })
}

// 刷新位置
const refreshLocation = () => {
  uni.showLoading({
    title: '更新位置中'
  })
  
  getCurrentLocationAddress(false) // 不强制刷新
    .then(locationInfo => {
      // 更新显示
      currentLocation.value = locationInfo.address
      locationUpdateTime.value = new Date().toLocaleTimeString()
      console.log('位置更新成功', locationInfo)
      uni.hideLoading()
      uni.showToast({
        title: '位置更新成功',
        icon: 'none'
      })
      
      // 如果用户已上线，更新位置信息到服务器
      if (isOnline.value) {
        updateLocationToServer(locationInfo.latitude, locationInfo.longitude, locationInfo.address)
      }
    })
    .catch(err => {
      uni.hideLoading()
      uni.showToast({
        title: '获取位置失败',
        icon: 'none'
      })
      console.error('获取位置失败:', err)
    })
}

// 更新位置信息到服务器
const updateLocationToServer = async (latitude, longitude, address) => {
  if (!isOnline.value) {
    console.log('用户未上线，不更新位置信息')
    return
  }
  
  try {
    // 处理地址字符串
    const processedAddress = processAddress(address)
    
    const requestData = {
      is_online: isOnline.value ? 1 : 0,
      latitude: latitude,
      longitude: longitude,
      location_text: processedAddress
    }
    
    console.log('准备更新位置信息到服务器:', requestData)
    console.log('位置描述分析:', analyzeAddress(address))
    
    const response = await updateCompanionOnlineStatus(requestData)
    
    if (response.data && response.data.code === 0) {
      console.log('位置信息更新成功:', response.data)
    } else {
      console.error('位置信息更新失败:', response.data?.msg)
    }
  } catch (error) {
    console.error('位置信息更新API调用失败:', error)
  }
}

// 手动选择位置
const selectLocation = () => {
  // #ifdef MP-WEIXIN
  uni.chooseLocation({
    success: async (res) => {
      const address = res.address || res.name || '已选择位置'
      console.log('手动选择位置', res)
      
      // 更新显示
      currentLocation.value = address
      locationUpdateTime.value = new Date().toLocaleTimeString()
      
      // 如果用户已上线，更新位置信息到服务器
      if (isOnline.value) {
        await updateLocationToServer(res.latitude, res.longitude, address)
      }
    },
    fail: (err) => {
      if (err.errMsg && err.errMsg.indexOf('cancel') === -1) {
        uni.showToast({
          title: '获取位置失败',
          icon: 'none'
        })
        console.error('获取位置失败:', err.errMsg)
      }
    }
  })
  // #endif
  // #ifndef MP-WEIXIN
  uni.showToast({
    title: '请在微信小程序中使用地图选点',
    icon: 'none'
  })
  // #endif
}

// 查看全部订单
const viewAllOrders = () => {
  uni.showToast({
    title: '订单列表功能开发中',
    icon: 'none'
  })
}

// 视频上传相关方法
const hideVideoUploadModal = () => {
  showVideoUploadModal.value = false
  // 重置视频上传状态
  if (!props.applicationInfo?.intro_video_url) {
    videoUrl.value = ''
  }
  isUploading.value = false
  uploadProgress.value = 0
}

const selectVideo = () => {
  // 重置当前选择的视频URL
  videoUrl.value = ''
  
  uni.chooseVideo({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    maxDuration: 60,
    camera: 'back',
    success: async (res) => {
      const tempFilePath = res.tempFilePath
      const duration = res.duration
      const size = res.size
      
      // 验证视频时长
      if (duration < 3 || duration > 60) {
        uni.showToast({
          title: '视频时长必须在3-60秒之间',
          icon: 'none'
        })
        return
      }
      
      // 验证文件大小（500MB = 500 * 1024 * 1024 bytes）
      if (size > 500 * 1024 * 1024) {
        uni.showToast({
          title: '视频文件大小不能超过500MB',
          icon: 'none'
        })
        return
      }
      
      // 显示上传进度
      uni.showLoading({
        title: '上传中...',
        mask: true
      })
      
      try {
        // 获取文件信息
        const fileInfo = await getFileInfo(tempFilePath)
        
        // 上传文件
        const uploadResult = await uploadFile({
          filePath: tempFilePath,
          name: `intro_video_${Date.now()}.${fileInfo.extension}`
        })
        
        // 解析上传结果
        const fileData = getUploadResult(uploadResult)
        if (!fileData || !fileData.url) {
          throw new Error('上传结果解析失败')
        }
        
        // 设置视频URL
        videoUrl.value = "https://sygx-server-bucket-admin.oss-cn-shanghai.aliyuncs.com" + fileData.url
        uni.hideLoading()
        // 提交视频审核
        // const response = await uploadCompanionVideo({
        //   intro_video_url: videoUrl.value
        // })
        
        // if (response.data && response.data.code === 0) {
        //   uni.hideLoading()
        //   uni.showToast({
        //     title: '视频上传成功，等待审核',
        //     icon: 'success'
        //   })
          
        //   // 发送事件通知父组件刷新数据
        //   uni.$emit('applicationStatusChanged', {
        //     type: 'video_uploaded',
        //     message: '视频上传成功，等待审核'
        //   })
        // } else {
        //   uni.hideLoading()
        //   uni.showToast({
        //     title: response.data?.msg || '上传失败',
        //     icon: 'none'
        //   })
        // }
      } catch (error) {
        uni.hideLoading()
        console.error('视频上传失败:', error)
        uni.showToast({
          title: '上传失败，请重试',
          icon: 'none'
        })
      }
    },
    fail: (error) => {
      console.error('选择视频失败:', error)
      if (error.errMsg && !error.errMsg.includes('cancel')) {
        uni.showToast({
          title: '选择视频失败',
          icon: 'none'
        })
      }
    }
  })
}

const deleteVideo = () => {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除当前视频吗？删除后需要重新上传。',
    success: async (res) => {
      if (res.confirm) {
        try {
          // 调用删除视频接口（这里可以调用一个清空视频URL的接口）
          const response = await uploadCompanionVideo({
            intro_video_url: ''
          })
          
          // 如果执行到这里，说明请求成功且没有业务错误
          uni.showToast({
            title: '视频删除成功',
            icon: 'success'
          })
          
          // 发送事件通知父组件刷新数据
          uni.$emit('applicationStatusChanged', {
            type: 'video_deleted',
            message: '视频删除成功'
          })
          
        } catch (error) {
          console.error('删除视频失败:', error)
          // 网络错误或其他未处理的错误
          if (!error.data) {
            uni.showToast({
              title: '删除失败，请重试',
              icon: 'none'
            })
          }
        }
      }
    }
  })
}

const submitVideo = async () => {
  if (!videoUrl.value) {
    uni.showToast({
      title: '请先选择视频',
      icon: 'none'
    })
    return
  }
  
  if (isUploading.value) {
    return
  }
  
  try {
    uni.showLoading({ title: '提交审核中...' })
    
    const response = await uploadCompanionVideo({
      intro_video_url: videoUrl.value
    })
    
    // 如果执行到这里，说明请求成功且没有业务错误
    uni.hideLoading()
    uni.showToast({
      title: '视频提交成功，等待审核',
      icon: 'success'
    })
    
    // 关闭弹框
    hideVideoUploadModal()
    
    // 发送事件通知父组件刷新申请信息
    uni.$emit('applicationStatusChanged', {
      type: 'video_uploaded',
      message: '视频已提交审核'
    })
    
  } catch (error) {
    uni.hideLoading()
    console.error('提交视频失败:', error)
    // 网络错误或其他未处理的错误
    if (!error.data) {
      uni.showToast({
        title: '提交失败，请重试',
        icon: 'none'
      })
    }
  }
}

// 获取文件信息
const getFileInfo = (filePath) => {
  return new Promise((resolve, reject) => {
    uni.getFileInfo({
      filePath: filePath,
      success: (res) => {
        // 从文件路径中提取扩展名
        const extension = filePath.split('.').pop().toLowerCase()
        resolve({
          size: res.size,
          extension: extension
        })
      },
      fail: (error) => {
        console.error('获取文件信息失败:', error)
        // 如果获取文件信息失败，使用默认扩展名
        const extension = filePath.split('.').pop().toLowerCase() || 'mp4'
        resolve({
          size: 0,
          extension: extension
        })
      }
    })
  })
}

// 获取视频状态文本
const getVideoStatusText = (status) => {
  switch (status) {
    case 'pending':
      return '待审核'
    case 'approved':
      return '已通过'
    case 'rejected':
      return '已拒绝'
    default:
      return '未知状态'
  }
}

// 获取视频状态描述
const getVideoStatusDesc = (status) => {
  switch (status) {
    case 'pending':
      return '您的视频正在审核中，请耐心等待'
    case 'approved':
      return '视频审核已通过，可以正常上线接单'
    case 'rejected':
      return props.applicationInfo.remark != "" ? ('原因：' + props.applicationInfo.remark):'视频审核未通过，请重新上传'
    default:
      return '请上传自我介绍视频'
  }
}

// 获取状态标签样式类
const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'pending':
      return 'status-pending'
    case 'approved':
      return 'status-approved'
    case 'rejected':
      return 'status-rejected'
    default:
      return ''
  }
}

// 页面加载时的处理
onMounted(() => {
  console.log('Workbench组件mounted，applicationInfo状态:', {
    hasApplicationInfo: !!props.applicationInfo,
    applicationInfo: props.applicationInfo
  })
  
  // 如果applicationInfo已经存在，立即初始化
  if (hasValidApplicationInfo.value) {
    initializeComponent()
  } else {
    console.log('applicationInfo还未准备好，等待watch触发初始化')
  }
})
</script>

<style lang="scss" scoped>
.tab-scroll-view {
  height: 100%;
  background: #F7F8FA;
}

.workbench-content {
  padding: 32rpx;
}

.workbench-header {
  margin-bottom: 32rpx;
}

.workbench-title {
  font-size: 46rpx;
  font-weight: 700;
  color: #1A1A1A;
  display: block;
 
}

.workbench-subtitle {
  font-size: 28rpx;
  color: #1A1A1A;
  display: block;
}

// 状态控制样式
.status-control {
  margin-bottom: 32rpx;
}

.status-card {
  background: #FFFFFF;
  border-radius: 20rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
  border: 1rpx solid #f0f0f0;
  transition: all 0.3s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  overflow: hidden;
  
  &.online {
    background: linear-gradient(135deg, rgba(115, 99, 255, 0.05) 0%, rgba(255, 105, 222, 0.05) 100%);
    border-color: #7363FF;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4rpx;
      background: linear-gradient(135deg, #7363FF 0%, #FF69DE 100%);
    }
  }
  
  &:active {
    transform: translateY(2rpx);
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
  }
}

.status-left {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0; // 防止flex子元素溢出
}

.status-info {
  margin-left: 20rpx;
  flex: 1;
  min-width: 0; // 防止文本溢出
}

.status-indicator {
  display: flex;
  align-items: center;
  margin-bottom: 8rpx;
}

.status-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background: #CCCCCC;
  margin-right: 12rpx;
  transition: all 0.3s ease;
  position: relative;
  
  &.active {
    background: #4CAF50;
    box-shadow: 0 0 8rpx rgba(76, 175, 80, 0.4);
    
    &::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 8rpx;
      height: 8rpx;
      background: #FFFFFF;
      border-radius: 50%;
    }
  }
}

.status-text {
  font-size: 32rpx;
  font-weight: 600;
  color: #1A1A1A;
  white-space: nowrap;
}

.status-desc {
  font-size: 24rpx;
  color: #666666;
  display: block;
  white-space: nowrap;
}

// 头像样式
.avatar-container {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  overflow: hidden;
  border: 3rpx solid #7363FF;
  box-shadow: 0 4rpx 12rpx rgba(115, 99, 255, 0.3);
  flex-shrink: 0;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 50%;
    box-shadow: inset 0 0 0 1rpx rgba(255, 255, 255, 0.3);
  }
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.status-right {
  display: flex;
  align-items: center;
  margin-left: 20rpx;
  flex-shrink: 0;
}

.toggle-button {
  background: linear-gradient(135deg, #7363FF 0%, #FF69DE 100%);
  border-radius: 50rpx;
  padding: 20rpx 32rpx;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 120rpx;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s ease;
  }
  
  &.online {
    background: linear-gradient(135deg, #F44336 0%, #FF5722 100%);
    
    &::before {
      left: 100%;
    }
    
    .toggle-icon {
      transform: scale(1.1);
    }
    
    .icon-play {
      transform: scale(0.8);
    }
    
    .icon-pause::before,
    .icon-pause::after {
      transform: scale(1.2);
    }
  }
  
  &:active {
    transform: scale(0.96);
    
    &::before {
      left: 100%;
    }
    
    .toggle-icon {
      transform: scale(0.9);
    }
  }
}

.toggle-icon {
  margin-right: 8rpx;
  transition: transform 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-container {
  width: 32rpx;
  height: 32rpx;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-play {
  width: 0;
  height: 0;
  border-left: 12rpx solid #FFFFFF;
  border-top: 8rpx solid transparent;
  border-bottom: 8rpx solid transparent;
  margin-left: 2rpx;
  transition: all 0.3s ease;
}

.icon-pause {
  display: flex;
  gap: 4rpx;
  align-items: center;
  justify-content: center;
}

.icon-pause::before,
.icon-pause::after {
  content: '';
  width: 4rpx;
  height: 16rpx;
  background: #FFFFFF;
  border-radius: 2rpx;
  transition: all 0.3s ease;
}

.toggle-text {
  color: #FFFFFF;
  font-size: 26rpx;
  font-weight: 600;
  text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.1);
}

// 位置管理样式
.location-management {
  margin-bottom: 32rpx;
}

.location-card {
  background: #FFFFFF;
  border-radius: 20rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
  border: 1rpx solid #f0f0f0;
}

.location-content {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.location-header {
  display: flex;
  align-items: center;
}

.location-icon {
  width: 32rpx;
  height: 32rpx;
  margin-right: 12rpx;
  display: inline-block;
  vertical-align: middle;
}

.location-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #1A1A1A;
}

.location-info {
  margin-top: 20rpx;
}

.location-address {
  font-size: 26rpx;
  color: #1A1A1A;
  display: block;
  margin-bottom: 8rpx;
  line-height: 1.4;
}

.location-time {
  font-size: 22rpx;
  color: #999999;
  display: block;
}

.location-actions {
  display: flex;
  flex-direction: row;
  gap: 16rpx;
  margin-top: 8rpx;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12rpx 20rpx;
  border-radius: 10rpx;
  border: 1rpx solid #E5E5E5;
  background: #F7F8FA;
  transition: all 0.2s ease;
  white-space: nowrap;
  
  &:active {
    transform: scale(0.96);
    background: #F0F0F0;
  }
}

.refresh-btn {
  border-color: #5AC8FA;
  background: rgba(90, 200, 250, 0.1);
}

.select-btn {
  border-color: #FF9500;
  background: rgba(255, 149, 0, 0.1);
}

.btn-icon {
  width: 28rpx;
  height: 28rpx;
  margin-right: 8rpx;
  display: inline-block;
  vertical-align: middle;
}

.location-btn-text {
  font-size: 24rpx;
  color: #1A1A1A;
  font-weight: 500;
}

.recent-orders {
  background: #FFFFFF;
  border-radius: 20rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
  border: 1rpx solid #f0f0f0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1A1A1A;
}

.view-all {
  font-size: 24rpx;
  color: #7363FF;
  font-weight: 500;
}

.empty-orders {
  text-align: center;
  padding: 60rpx 0;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 24rpx;
  display: block;
  opacity: 0.6;
}

.empty-text {
  font-size: 28rpx;
  color: #1A1A1A;
  font-weight: 500;
  display: block;
  margin-bottom: 8rpx;
}

.empty-desc {
  font-size: 24rpx;
  color: #666666;
  display: block;
}

// 视频上传弹框样式
.video-upload-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8rpx);
  -webkit-backdrop-filter: blur(8rpx);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { 
    transform: translateY(100rpx);
    opacity: 0;
  }
  to { 
    transform: translateY(0);
    opacity: 1;
  }
}

.video-upload-container {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(247, 248, 250, 0.95) 100%);
  backdrop-filter: blur(20rpx);
  -webkit-backdrop-filter: blur(20rpx);
  border-radius: 32rpx;
  width: 85%;
  max-width: 640rpx;
  max-height: 80vh;
  box-shadow: 0 20rpx 60rpx rgba(115, 99, 255, 0.2);
  border: 1rpx solid rgba(115, 99, 255, 0.1);
  animation: slideUp 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 32rpx 32rpx 24rpx;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  position: relative;
  border-bottom: 1rpx solid rgba(115, 99, 255, 0.1);
}

.header-content {
  display: flex;
  align-items: center;
  flex: 1;
}

.header-icon {
  width: 60rpx;
  height: 60rpx;
  background: linear-gradient(135deg, rgba(115, 99, 255, 0.1) 0%, rgba(255, 105, 222, 0.1) 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  margin-right: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(115, 99, 255, 0.2);
}

.header-text {
  flex: 1;
}

.modal-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1A1A1A;
  margin-bottom: 8rpx;
  display: block;
  line-height: 1.3;
}

.modal-subtitle {
  font-size: 24rpx;
  color: #666666;
  display: block;
  line-height: 1.4;
}

.close-btn {
  width: 48rpx;
  height: 48rpx;
  background: linear-gradient(135deg, rgba(115, 99, 255, 0.1) 0%, rgba(255, 255, 255, 0.8) 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  color: #666666;
  font-weight: 600;
  transition: all 0.3s;
  border: 1rpx solid rgba(115, 99, 255, 0.15);
  flex-shrink: 0;
  
  &:active {
    transform: scale(0.9);
    background: linear-gradient(135deg, rgba(115, 99, 255, 0.15) 0%, rgba(255, 255, 255, 0.9) 100%);
  }
}

.close-icon {
  font-size: 24rpx;
  font-weight: 600;
}

.modal-content {
  flex: 1;
  padding: 24rpx 32rpx;
  overflow-y: auto;
}

.video-status-section {
  margin-bottom: 32rpx;
  padding: 20rpx;
  background: linear-gradient(135deg, rgba(115, 99, 255, 0.05) 0%, rgba(255, 105, 222, 0.05) 100%);
  border-radius: 16rpx;
  border: 1rpx solid rgba(115, 99, 255, 0.1);
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  margin-bottom: 12rpx;
  font-size: 24rpx;
  font-weight: 600;
  
  &.status-pending {
    background: linear-gradient(135deg, rgba(255, 149, 0, 0.1) 0%, rgba(255, 149, 0, 0.2) 100%);
    color: #FF9500;
    border: 1rpx solid rgba(255, 149, 0, 0.3);
  }
  
  &.status-approved {
    background: linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.2) 100%);
    color: #4CAF50;
    border: 1rpx solid rgba(76, 175, 80, 0.3);
  }
  
  &.status-rejected {
    background: linear-gradient(135deg, rgba(244, 67, 54, 0.1) 0%, rgba(244, 67, 54, 0.2) 100%);
    color: #F44336;
    border: 1rpx solid rgba(244, 67, 54, 0.3);
  }
}

.status-text {
  font-size: 24rpx;
  font-weight: 600;
}

.status-desc {
  font-size: 24rpx;
  color: #666666;
  line-height: 1.4;
  display: block;
}

.video-preview-section {
  margin-bottom: 32rpx;
}

.video-preview {
  position: relative;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
  margin-bottom: 20rpx;
}

.preview-video {
  width: 100%;
  height: 300rpx;
  object-fit: cover;
  background: #000000;
}

.video-actions {
  position: absolute;
  top: 16rpx;
  right: 16rpx;
  display: flex;
  gap: 12rpx;
}

.video-action-btn {
  padding: 12rpx 20rpx;
  border-radius: 24rpx;
  font-size: 22rpx;
  font-weight: 500;
  transition: all 0.3s ease;
  backdrop-filter: blur(10rpx);
  -webkit-backdrop-filter: blur(10rpx);
  
  &.replace-btn {
    background: rgba(115, 99, 255, 0.9);
    color: #FFFFFF;
    border: 1rpx solid rgba(255, 255, 255, 0.2);
  }
  
  &.delete-btn {
    background: rgba(244, 67, 54, 0.9);
    color: #FFFFFF;
    border: 1rpx solid rgba(255, 255, 255, 0.2);
  }
  
  &:active {
    transform: scale(0.95);
  }
}

.video-btn-text {
  font-size: 22rpx;
  font-weight: 500;
}

.video-upload-area {
  border: 3rpx dashed rgba(115, 99, 255, 0.3);
  border-radius: 20rpx;
  background: linear-gradient(135deg, rgba(115, 99, 255, 0.02) 0%, rgba(255, 105, 222, 0.02) 100%);
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:active {
    transform: scale(0.98);
    border-color: #7363FF;
    background: linear-gradient(135deg, rgba(115, 99, 255, 0.05) 0%, rgba(255, 105, 222, 0.05) 100%);
  }
}

.upload-content {
  padding: 60rpx 40rpx;
  text-align: center;
}

.upload-icon {
  font-size: 80rpx;
  margin-bottom: 24rpx;
  display: block;
  opacity: 0.8;
}

.upload-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1A1A1A;
  margin-bottom: 12rpx;
  display: block;
}

.upload-desc {
  font-size: 26rpx;
  color: #666666;
  margin-bottom: 24rpx;
  display: block;
}

.upload-requirements {
  text-align: left;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12rpx;
  padding: 20rpx;
  border: 1rpx solid rgba(115, 99, 255, 0.1);
}

.requirement-item {
  font-size: 22rpx;
  color: #666666;
  margin-bottom: 8rpx;
  display: block;
  line-height: 1.4;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.upload-progress {
  margin-bottom: 24rpx;
}

.progress-bar {
  background: rgba(115, 99, 255, 0.1);
  border-radius: 12rpx;
  height: 8rpx;
  overflow: hidden;
  margin-bottom: 12rpx;
  position: relative;
}

.progress-fill {
  background: linear-gradient(135deg, #7363FF 0%, #FF69DE 100%);
  height: 100%;
  border-radius: 12rpx;
  transition: width 0.3s ease;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    animation: shimmer 2s infinite;
  }
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.progress-text {
  font-size: 24rpx;
  color: #1A1A1A;
  font-weight: 500;
  text-align: center;
  display: block;
}

.modal-footer {
  padding: 24rpx 32rpx 32rpx;
  border-top: 1rpx solid rgba(115, 99, 255, 0.1);
  background: rgba(255, 255, 255, 0.8);
}

.footer-actions {
  display: flex;
  gap: 20rpx;
}

.cancel-btn {
  flex: 1;
  height: 80rpx;
  background: linear-gradient(135deg, rgba(248, 249, 254, 0.8) 0%, rgba(240, 240, 240, 0.8) 100%);
  border: 1rpx solid rgba(115, 99, 255, 0.2);
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  font-weight: 500;
  color: #666666;
  transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
  backdrop-filter: blur(10rpx);
  -webkit-backdrop-filter: blur(10rpx);
  
  &:active {
    transform: scale(0.96);
    background: linear-gradient(135deg, rgba(240, 240, 240, 0.9) 0%, rgba(230, 230, 230, 0.9) 100%);
  }
}

.submit-btn {
  flex: 2;
  height: 80rpx;
  background: linear-gradient(135deg, #7363FF 0%, #FF69DE 100%);
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  font-weight: 600;
  color: #FFFFFF;
  transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
  box-shadow: 0 6rpx 20rpx rgba(115, 99, 255, 0.3);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s ease;
  }
  
  &.disabled {
    background: linear-gradient(135deg, #CCCCCC 0%, #BBBBBB 100%);
    box-shadow: 0 3rpx 12rpx rgba(0, 0, 0, 0.1);
    color: #999999;
    
    &::before {
      display: none;
    }
  }
  
  &:active:not(.disabled) {
    transform: scale(0.96);
    box-shadow: 0 4rpx 16rpx rgba(115, 99, 255, 0.4);
    
    &::before {
      left: 100%;
    }
  }
}

.modal-btn-text {
  font-size: 28rpx;
  font-weight: 600;
  position: relative;
  z-index: 2;
}
</style> 