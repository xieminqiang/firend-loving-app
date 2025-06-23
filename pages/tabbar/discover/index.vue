<template>
  <view class="discover-container">
    <!-- 顶部固定区域 -->
    <view class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="header-top">
        <view class="search-container" v-show="isSearchActive">
            <image src="@/static/icons/friend/search.png" class="search-icon" mode="aspectFit" />
            <input 
              type="text" 
              v-model="searchText" 
              placeholder="搜索内容、用户或标签" 
              class="search-input"
              ref="searchInput"
              @input="filterFeeds"
            />
          
          </view>
      
      </view>
    </view>

    <!-- 搜索无结果提示 -->
    <view class="no-results" v-if="searchText && filteredFeeds.length === 0">
      <image src="@/static/icons/friend/search.png" class="no-results-icon" mode="aspectFit" />
      <text class="no-results-text">没有找到与"{{ searchText }}"相关的内容</text>
      <view class="clear-search-btn" @click="clearSearch">
        <text>清除搜索</text>
      </view>
    </view>

    <!-- 主要内容区域 -->
    <view class="main-content">
      <scroll-view 
        class="feed-scroll" 
        scroll-y="true"
        refresher-enabled
        :refresher-triggered="isRefreshing"
        @refresherrefresh="onRefresh"
      >
        <view class="feed-list">
          <view v-for="feed in filteredFeeds" :key="feed.id" class="feed-card">
            <view class="feed-header">
              <image :src="feed.avatar" class="avatar" mode="aspectFill" />
              <view class="feed-user">
                <view class="feed-name">{{ feed.name }}</view>
                <view class="feed-tags">
                  <text v-for="tag in feed.tags" :key="tag" class="tag">{{ tag }}</text>
                </view>
              </view>
            </view>
            
            <view class="feed-content">
              <text class="feed-text">{{ feed.text }}</text>
              <image v-if="feed.img" :src="feed.img" class="feed-img" mode="aspectFill" />
              <view v-if="feed.video" class="feed-video" @click="playVideo(feed)">
                <image 
                  v-if="feed.videoThumbnail" 
                  :src="feed.videoThumbnail" 
                  class="video-thumbnail" 
                  mode="aspectFill" 
                />
                <view class="video-overlay">
                  <view class="play-button">
                    <image src="@/static/icons/friend/play.png" class="play-icon" mode="aspectFit" />
                  </view>
                  <view class="video-duration">02:35</view>
                </view>
              </view>
            </view>
            
            <view class="feed-actions">
              <view class="action-left">
                <view class="like-btn" @click="handleLike(feed)" :class="{ 'liked': feed.isLiked }">
                  <image src="@/static/icons/friend/heart.png" class="action-icon" mode="aspectFit" />
                  <text class="action-text">{{ feed.likes }}</text>
                </view>
                <view class="comment-btn" @click="openCommentModal(feed)">
                  <image src="@/static/icons/friend/message.png" class="action-icon" mode="aspectFit" />
                  <text class="action-text">{{ feed.comments }}</text>
                </view>
              </view>
              <view class="action-right">
                <view class="reward-btn" @click="openRewardModal(feed)">
                  <image src="@/static/icons/friend/gift.png" class="action-icon" mode="aspectFit" />
                  <text class="action-text">打赏</text>
                </view>
                <view class="invite-btn" @click="navigateToBooking(feed)">
                  <image src="@/static/icons/friend/calendar.png" class="action-icon" mode="aspectFit" />
                  <text class="action-text">立即邀约</text>
                </view>
              </view>
            </view>
          </view>
        </view>
        <view style="height: 40rpx;"></view>
      </scroll-view>
    </view>

    <!-- 打赏弹窗 -->
    <view class="modal-overlay" v-if="showRewardModal" @click="closeRewardModal">
      <view class="reward-modal" @click.stop>
        <!-- 顶部装饰 -->
        <view class="reward-top-decoration">
          <view class="decoration-circle"></view>
          <view class="decoration-circle"></view>
          <view class="decoration-circle"></view>
        </view>
        
        <!-- 头部 -->
  
        <!-- 主要内容 -->
        <view class="reward-main">
          <view class="reward-title">
            <image src="@/static/icons/friend/heart.png" class="title-heart" mode="aspectFit" />
            <text class="title-text">打赏支持 {{selectedFeed && selectedFeed.name || ''}}</text>
            <image src="@/static/icons/friend/heart.png" class="title-heart" mode="aspectFit" />
          </view>
          
          <!-- 金额卡片 -->
          <view class="amount-cards">
            <view 
              v-for="amount in rewardAmounts" 
              :key="amount.value" 
              class="amount-card"
              @click="selectAmount(amount.value)"
              :class="{ selected: selectedAmount === amount.value }"
            >
              <view class="card-content">
                <text class="amount-number">{{ amount.value }}</text>
                <text class="amount-currency">元</text>
              </view>
              <text class="amount-desc">{{ amount.label }}</text>
              <view class="card-glow" v-if="selectedAmount === amount.value"></view>
            </view>
          </view>
          
          <!-- 自定义金额 -->
          <view class="custom-amount-section">
            <text class="custom-label">自定义金额</text>
            <view class="custom-input-wrapper" :class="{ selected: selectedAmount === 0 && customAmount }">
              <text class="currency-prefix">¥</text>
              <input 
                type="number" 
                v-model="customAmount" 
                placeholder="输入金额" 
                class="custom-amount-input"
                @focus="selectAmount(0)"
              />
            </view>
          </view>
          
          <!-- 留言 -->
          <view >
            <text class="message-label">留言鼓励 <text class="optional-text">(选填)</text></text>
            <textarea 
              v-model="rewardMessage" 
              placeholder="写下你的鼓励话语..." 
              class="message-textarea"
              maxlength="30"
            ></textarea>
            <text class="char-counter">{{ rewardMessage.length }}/30</text>
          </view>
        </view>
        
        <!-- 底部 -->
        <view class="reward-bottom">
          <view class="total-section">
            <text class="total-label">打赏金额</text>
            <text class="total-amount">¥{{ finalAmount }}</text>
          </view>
          <view class="confirm-button" @click="confirmReward">
            <view class="button-content">
              <image src="@/static/icons/friend/heart.png" class="button-icon" mode="aspectFit" />
              <text class="button-text">确认打赏</text>
            </view>
            <view class="button-shine"></view>
          </view>
        </view>
      </view>
    </view>

    <!-- 评论弹窗 -->
    <view class="modal-overlay" v-if="showCommentModal" @click="closeCommentModal">
      <view class="modal-container comment-modal" @click.stop>
        <view class="modal-header">
          <text class="modal-title">评论</text>
          <view class="close-btn" @click="closeCommentModal">
            <image src="@/static/icons/friend/close.png" class="close-icon" mode="aspectFit" />
          </view>
        </view>
        
        <view class="modal-content">
          <view class="comment-post">
            <view class="post-info">
              <image :src="selectedFeed && selectedFeed.avatar || ''" class="post-avatar" mode="aspectFill" />
              <view class="post-details">
                <text class="post-name">{{ selectedFeed && selectedFeed.name || '' }}</text>
                <text class="post-preview">{{ getPostPreview() }}</text>
              </view>
            </view>
          </view>
          
          <view class="comment-list" v-if="commentList.length > 0">
            <view v-for="(comment, index) in commentList" :key="index" class="comment-item">
              <image :src="comment.avatar" class="comment-avatar" mode="aspectFill" />
              <view class="comment-content">
                <text class="comment-name">{{ comment.name }}</text>
                <text class="comment-text">{{ comment.text }}</text>
                <view class="comment-meta">
                  <text class="comment-time">{{ comment.time }}</text>
                  <view class="comment-reply-btn" @click="replyToComment(comment)">
                    <text>回复</text>
                  </view>
                </view>
              </view>
            </view>
          </view>
          
          <view class="no-comments" v-else>
            <image src="@/static/icons/friend/message.png" class="no-comments-icon" mode="aspectFit" />
            <text class="no-comments-text">还没有评论，快来说点什么吧</text>
          </view>
        </view>
        
        <view class="modal-footer">
          <view class="comment-input-container">
            <input 
              type="text" 
              v-model="commentText" 
              :placeholder="getCommentPlaceholder()" 
              class="comment-input"
            />
            <view class="send-comment-btn" @click="sendComment" :class="{ disabled: !commentText.trim() }">
              <text class="send-icon">→</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 点赞成功提示 -->
    <view class="like-toast" v-if="showLikeToast">
      <image src="@/static/icons/friend/heart.png" class="toast-icon" mode="aspectFit" />
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// 状态栏高度
const statusBarHeight = ref(0)

// 获取系统信息
onMounted(() => {
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight || 0
  console.log('发现页面加载完成')
})

// 搜索相关
const isSearchActive = ref(false)
const searchText = ref('')
const searchInput = ref(null)
const isRefreshing = ref(false)

// 模态框状态
const showRewardModal = ref(false)
const showCommentModal = ref(false)
const selectedFeed = ref(null)
const showLikeToast = ref(false)

// 打赏相关
const selectedAmount = ref(10)
const customAmount = ref('')
const rewardMessage = ref('')
const paymentMethod = ref('weixin')

const rewardAmounts = [
  { value: 5, label: '小额鼓励' },
  { value: 10, label: '感谢分享' },
  { value: 20, label: '诚挚感谢' },
  { value: 50, label: '大力支持' }
]

// 评论相关
const commentText = ref('')
const replyTo = ref(null)
const commentList = ref([
  {
    name: '星河',
    avatar: 'https://images.unsplash.com/photo-1546961329-78bef0414d7c?w=500&auto=format&fit=crop&q=60',
    text: '看起来好好吃！是在哪家店啊？下次想去试试。',
    time: '刚刚',
    id: 1
  },
  {
    name: '小天',
    avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=500&auto=format&fit=crop&q=60',
    text: '照片拍得真好，有专业摄影师的感觉！',
    time: '10分钟前',
    id: 2
  }
])

// 动态数据
const feeds = ref([
  { 
    id: 1, 
    name: '清欢', 
    avatar: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=500', 
    text: '今天去了一家超棒的日料店，环境优雅，服务周到，最重要的是食材新鲜，强烈推荐给大家！', 
    tags: ['美食', '日料', '探店'], 
    img: 'https://images.pexels.com/photos/357756/pexels-photo-357756.jpeg?auto=compress&cs=tinysrgb&w=500', 
    likes: 128, 
    comments: 32,
    isLiked: false 
  },
  { 
    id: 2, 
    name: '鹿鹿', 
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=500', 
    text: '周末和朋友一起去了新开的咖啡厅，环境超赞，咖啡也很香醇，分享给大家～', 
    tags: ['咖啡', '探店', '生活'], 
    video: true,
    videoThumbnail: 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=500',
    likes: 256, 
    comments: 48,
    isLiked: false 
  },
  { 
    id: 3, 
    name: 'Lucky', 
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=500', 
    text: '今天天气真好，去公园散步，拍了一些美美的照片，分享给大家～', 
    tags: ['生活', '摄影', '日常'], 
    img: 'https://images.pexels.com/photos/414612/pexels-photo-414612.jpeg?auto=compress&cs=tinysrgb&w=500', 
    likes: 89, 
    comments: 15,
    isLiked: false
  },
  { 
    id: 4, 
    name: '星辰', 
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=500', 
    text: '周末爬山看日出，那一刻所有的疲惫都烟消云散，大自然的力量真的很治愈！', 
    tags: ['旅行', '户外', '日出'], 
    img: 'https://images.pexels.com/photos/96622/pexels-photo-96622.jpeg?auto=compress&cs=tinysrgb&w=500', 
    likes: 324, 
    comments: 67,
    isLiked: false 
  },
  { 
    id: 5, 
    name: '小柠檬', 
    avatar: 'https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg?auto=compress&cs=tinysrgb&w=500', 
    text: '自己做的柠檬蛋糕终于成功了！酸甜可口，卖相也不错，下次可以试试其他口味～', 
    tags: ['烘焙', '美食', 'DIY'], 
    img: 'https://images.pexels.com/photos/1126359/pexels-photo-1126359.jpeg?auto=compress&cs=tinysrgb&w=500', 
    likes: 156, 
    comments: 28,
    isLiked: false 
  },
  { 
    id: 6, 
    name: '流年', 
    avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=500', 
    text: '今天读完了《百年孤独》，感触很深，马尔克斯的文字真的有一种神奇的魔力...', 
    tags: ['阅读', '文学', '感悟'], 
    img: 'https://images.pexels.com/photos/46274/pexels-photo-46274.jpeg?auto=compress&cs=tinysrgb&w=500', 
    likes: 201, 
    comments: 42,
    isLiked: false 
  },
  { 
    id: 7, 
    name: '青柠', 
    avatar: 'https://images.pexels.com/photos/1758144/pexels-photo-1758144.jpeg?auto=compress&cs=tinysrgb&w=500', 
    text: '晨跑5公里完成！虽然累但是心情超棒，运动真的是最好的解压方式～', 
    tags: ['运动', '跑步', '健康'], 
    video: true,
    videoThumbnail: 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=500',
    likes: 178, 
    comments: 35,
    isLiked: false 
  },
  { 
    id: 8, 
    name: '墨染', 
    avatar: 'https://images.pexels.com/photos/1499327/pexels-photo-1499327.jpeg?auto=compress&cs=tinysrgb&w=500', 
    text: '第一次尝试画水彩，虽然不够完美，但是享受这个过程就很棒了！', 
    tags: ['绘画', '水彩', '艺术'], 
    img: 'https://images.pexels.com/photos/1143754/pexels-photo-1143754.jpeg?auto=compress&cs=tinysrgb&w=500', 
    likes: 134, 
    comments: 23,
    isLiked: false 
  },
  { 
    id: 9, 
    name: '微光', 
    avatar: 'https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?auto=compress&cs=tinysrgb&w=500', 
    text: '海边的落日真的太美了，一个人静静地看着太阳慢慢落下，心情都变得平静了', 
    tags: ['海边', '落日', '治愈'], 
    img: 'https://images.pexels.com/photos/189349/pexels-photo-189349.jpeg?auto=compress&cs=tinysrgb&w=500', 
    likes: 445, 
    comments: 78,
    isLiked: false 
  },
  { 
    id: 10, 
    name: '糖果', 
    avatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=500', 
    text: '学会了新的编发技巧，感觉自己美美哒！女孩子就是要多尝试不同的造型～', 
    tags: ['美妆', '编发', '造型'], 
    video: true,
    videoThumbnail: 'https://images.pexels.com/photos/1319460/pexels-photo-1319460.jpeg?auto=compress&cs=tinysrgb&w=500',
    likes: 267, 
    comments: 54,
    isLiked: false 
  },
  { 
    id: 11, 
    name: '夜雨', 
    avatar: 'https://images.pexels.com/photos/1484794/pexels-photo-1484794.jpeg?auto=compress&cs=tinysrgb&w=500', 
    text: '深夜的城市别有一番风味，霓虹灯下的街道总是让人想起很多故事...', 
    tags: ['夜景', '城市', '摄影'], 
    img: 'https://images.pexels.com/photos/378570/pexels-photo-378570.jpeg?auto=compress&cs=tinysrgb&w=500', 
    likes: 312, 
    comments: 61,
    isLiked: false 
  },
  { 
    id: 12, 
    name: '晨曦', 
    avatar: 'https://images.pexels.com/photos/1385472/pexels-photo-1385472.jpeg?auto=compress&cs=tinysrgb&w=500', 
    text: '今天的早餐特别用心，营养搭配也很均衡，美好的一天从健康早餐开始～', 
    tags: ['早餐', '健康', '营养'], 
    img: 'https://images.pexels.com/photos/103124/pexels-photo-103124.jpeg?auto=compress&cs=tinysrgb&w=500', 
    likes: 189, 
    comments: 31,
    isLiked: false 
  },
  { 
    id: 13, 
    name: '南风', 
    avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=500', 
    text: '古镇的慢时光让人很放松，走在青石板路上，仿佛穿越到了另一个时代', 
    tags: ['古镇', '旅行', '慢生活'], 
    img: 'https://images.pexels.com/photos/1563356/pexels-photo-1563356.jpeg?auto=compress&cs=tinysrgb&w=500', 
    likes: 398, 
    comments: 72,
    isLiked: false 
  },
  { 
    id: 14, 
    name: '薄荷', 
    avatar: 'https://images.pexels.com/photos/1687675/pexels-photo-1687675.jpeg?auto=compress&cs=tinysrgb&w=500', 
    text: '今天学会了一道新菜，味道竟然比想象中的好！看来我的厨艺有进步～', 
    tags: ['美食', '烹饪', '学习'], 
    video: true,
    videoThumbnail: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=500',
    likes: 145, 
    comments: 26,
    isLiked: false 
  },
  { 
    id: 15, 
    name: '暖阳', 
    avatar: 'https://images.pexels.com/photos/1239288/pexels-photo-1239288.jpeg?auto=compress&cs=tinysrgb&w=500', 
    text: '瑜伽课结束，整个人都放松了很多，身心的平衡真的很重要～', 
    tags: ['瑜伽', '健康', '放松'], 
    img: 'https://images.pexels.com/photos/317157/pexels-photo-317157.jpeg?auto=compress&cs=tinysrgb&w=500', 
    likes: 223, 
    comments: 38,
    isLiked: false 
  },
  { 
    id: 16, 
    name: '月影', 
    avatar: 'https://images.pexels.com/photos/1674752/pexels-photo-1674752.jpeg?auto=compress&cs=tinysrgb&w=500', 
    text: '夜空中的满月真的很美，配上这首钢琴曲，整个夜晚都变得诗意了', 
    tags: ['夜空', '月亮', '音乐'], 
    img: 'https://images.pexels.com/photos/1440476/pexels-photo-1440476.jpeg?auto=compress&cs=tinysrgb&w=500', 
    likes: 356, 
    comments: 65,
    isLiked: false 
  },
  { 
    id: 17, 
    name: '浅夏', 
    avatar: 'https://images.pexels.com/photos/1542085/pexels-photo-1542085.jpeg?auto=compress&cs=tinysrgb&w=500', 
    text: '花市淘到了很多好看的多肉植物，小小的生命力总是让人感到治愈～', 
    tags: ['植物', '多肉', '生活'], 
    img: 'https://images.pexels.com/photos/1164985/pexels-photo-1164985.jpeg?auto=compress&cs=tinysrgb&w=500', 
    likes: 167, 
    comments: 29,
    isLiked: false 
  },
  { 
    id: 18, 
    name: '青空', 
    avatar: 'https://images.pexels.com/photos/1559486/pexels-photo-1559486.jpeg?auto=compress&cs=tinysrgb&w=500', 
    text: '博物馆的展览真的很棒，每一件文物都有自己的故事，历史的厚重感扑面而来', 
    tags: ['博物馆', '文化', '历史'], 
    img: 'https://images.pexels.com/photos/1058397/pexels-photo-1058397.jpeg?auto=compress&cs=tinysrgb&w=500', 
    likes: 278, 
    comments: 47,
    isLiked: false 
  },
  { 
    id: 19, 
    name: '柠夏', 
    avatar: 'https://images.pexels.com/photos/1722198/pexels-photo-1722198.jpeg?auto=compress&cs=tinysrgb&w=500', 
    text: '今天的滑板课终于学会了一个新动作！虽然摔了很多次，但是成功的那一刻太爽了！', 
    tags: ['滑板', '运动', '挑战'], 
    video: true,
    videoThumbnail: 'https://images.pexels.com/photos/416978/pexels-photo-416978.jpeg?auto=compress&cs=tinysrgb&w=500',
    likes: 234, 
    comments: 43,
    isLiked: false 
  },
  { 
    id: 20, 
    name: '星河', 
    avatar: 'https://images.pexels.com/photos/1386604/pexels-photo-1386604.jpeg?auto=compress&cs=tinysrgb&w=500', 
    text: '山顶的星空真的震撼到我了，远离城市的光污染，满天繁星就在眼前✨', 
    tags: ['星空', '户外', '天文'], 
    img: 'https://images.pexels.com/photos/1252890/pexels-photo-1252890.jpeg?auto=compress&cs=tinysrgb&w=500', 
    likes: 512, 
    comments: 89,
    isLiked: false 
  },
  { 
    id: 21, 
    name: '梧桐', 
    avatar: 'https://images.pexels.com/photos/1310522/pexels-photo-1310522.jpeg?auto=compress&cs=tinysrgb&w=500', 
    text: '手工制作的陶艺作品完成了，虽然有些不完美，但这就是手作的魅力～', 
    tags: ['手工', '陶艺', 'DIY'], 
    img: 'https://images.pexels.com/photos/1090638/pexels-photo-1090638.jpeg?auto=compress&cs=tinysrgb&w=500', 
    likes: 198, 
    comments: 34,
    isLiked: false 
  },
  { 
    id: 22, 
    name: '初见', 
    avatar: 'https://images.pexels.com/photos/1468379/pexels-photo-1468379.jpeg?auto=compress&cs=tinysrgb&w=500', 
    text: '今天的街头音乐表演真的很棒，音乐让整条街都变得有活力了！', 
    tags: ['音乐', '街头', '艺术'], 
    video: true,
    videoThumbnail: 'https://images.pexels.com/photos/995301/pexels-photo-995301.jpeg?auto=compress&cs=tinysrgb&w=500',
    likes: 287, 
    comments: 52,
    isLiked: false 
  },
  { 
    id: 23, 
    name: '云朵', 
    avatar: 'https://images.pexels.com/photos/1832323/pexels-photo-1832323.jpeg?auto=compress&cs=tinysrgb&w=500', 
    text: '下午茶时光，一本好书配上一杯香茶，这就是我理想中的慢生活～', 
    tags: ['下午茶', '阅读', '慢生活'], 
    img: 'https://images.pexels.com/photos/1251175/pexels-photo-1251175.jpeg?auto=compress&cs=tinysrgb&w=500', 
    likes: 165, 
    comments: 28,
    isLiked: false 
  }
])

const filteredFeeds = ref([...feeds.value])

// 计算属性
const finalAmount = computed(() => {
  if (customAmount.value && customAmount.value > 0) {
    return customAmount.value
  }
  return selectedAmount.value
})

// 搜索功能
const toggleSearch = () => {
  isSearchActive.value = !isSearchActive.value
  if (isSearchActive.value) {
    setTimeout(() => {
      if (searchInput.value) {
        searchInput.value.focus()
      }
    }, 100)
  } else {
    clearSearch()
  }
}

const filterFeeds = () => {
  if (searchText.value.trim() === '') {
    filteredFeeds.value = feeds.value
  } else {
    filteredFeeds.value = feeds.value.filter(feed => {
      return (
        feed.name.toLowerCase().includes(searchText.value.toLowerCase()) ||
        feed.text.toLowerCase().includes(searchText.value.toLowerCase()) ||
        feed.tags.some(tag => tag.toLowerCase().includes(searchText.value.toLowerCase()))
      )
    })
  }
}

const clearSearch = () => {
  searchText.value = ''
  filterFeeds()
}

const onRefresh = () => {
  isRefreshing.value = true
  setTimeout(() => {
    isRefreshing.value = false
  }, 1000)
}

// 点赞功能
const handleLike = (feed) => {
  feed.isLiked = !feed.isLiked
  
  if (feed.isLiked) {
    feed.likes++
    showLikeToast.value = true
    setTimeout(() => {
      showLikeToast.value = false
    }, 1000)
  } else {
    feed.likes--
  }
}

// 打赏功能
const openRewardModal = (feed) => {
  selectedFeed.value = feed
  showRewardModal.value = true
}

const closeRewardModal = () => {
  showRewardModal.value = false
  selectedAmount.value = 10
  customAmount.value = ''
  rewardMessage.value = ''
}

const selectAmount = (value) => {
  selectedAmount.value = value
  if (value > 0) {
    customAmount.value = ''
  }
}

const confirmReward = () => {
  uni.showToast({
    title: `成功打赏了 ${selectedFeed.value.name} ${finalAmount.value}元！`,
    icon: 'success'
  })
  closeRewardModal()
}

// 评论功能
const openCommentModal = (feed) => {
  selectedFeed.value = feed
  showCommentModal.value = true
}

const closeCommentModal = () => {
  showCommentModal.value = false
  commentText.value = ''
  replyTo.value = null
}

const replyToComment = (comment) => {
  replyTo.value = comment
}

const sendComment = () => {
  if (!commentText.value.trim()) return
  
  const newComment = {
    name: '我',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=500&auto=format&fit=crop&q=60',
    text: replyTo.value ? `@${replyTo.value.name} ${commentText.value}` : commentText.value,
    time: '刚刚',
    id: Date.now()
  }
  
  commentList.value.unshift(newComment)
  
  if (selectedFeed.value) {
    selectedFeed.value.comments++
  }
  
  commentText.value = ''
  replyTo.value = null
}

// 导航功能
const navigateToBooking = (feed) => {
  uni.navigateTo({
    url: `/subPackages/booking/pages/index?partnerId=${feed.id}&name=${feed.name}&avatar=${feed.avatar}`
  })
}

const playVideo = (feed) => {
  console.log('播放视频:', feed.id)
}

const getPostPreview = () => {
  if (selectedFeed.value) {
    return selectedFeed.value.text.substring(0, 50) + (selectedFeed.value.text.length > 50 ? '...' : '')
  }
  return ''
}

const getCommentPlaceholder = () => {
  if (replyTo.value) {
    return `回复 ${replyTo.value.name}`
  }
  return '添加评论...'
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.discover-container {
  min-height: 100vh;
  background-color: $bg-color-secondary;
}

.header {
  
  background: linear-gradient(135deg, $bg-color-primary 0%, rgba(247, 248, 250, 0.95) 100%);
  padding: 20rpx 24rpx;
  border-bottom: none;
  box-shadow: 0 6rpx 24rpx rgba(130, 160, 216, 0.05);
  border-radius: 0 0 32rpx 32rpx;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(20rpx);
  -webkit-backdrop-filter: blur(20rpx);

  position: sticky;
  top: 0;
  z-index: $z-index-fixed;
}

.header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding-bottom: 24rpx;
  
}

.title-container {
  flex: 1;
}

.page-title {
  font-size: $font-size-xl;
  font-weight: 600;
  color: $text-color-primary;
}

.search-container {
  display: flex;
  align-items: center;
  background-color: $bg-color-secondary;
  border-radius: $border-radius-lg;
  padding: $spacing-sm;

  width: 450rpx;
  box-sizing: border-box;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20rpx);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.search-icon {
  width: 32rpx;
  height: 32rpx;
  margin-right: $spacing-sm;
}

.search-input {
  flex: 1;
  font-size: $font-size-base;
  color: $text-color-primary;
  background: transparent;
  border: none;
  outline: none;
}

.clear-search {
  padding: $spacing-xs;
}

.clear-icon {
  width: 24rpx;
  height: 24rpx;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
}

.search-btn, .filter-btn {
  width: 72rpx;
  height: 72rpx;
  background-color: $bg-color-secondary;
  border-radius: $border-radius-round;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all $animation-duration-base;
}

.search-btn:active, .filter-btn:active {
  background-color: $primary-hover;
}

.action-icon {
  width: 28rpx;
  height: 28rpx;
  filter: drop-shadow(0 2rpx 4rpx rgba(0, 0, 0, 0.1));
}

.reward-btn .action-icon,
.invite-btn .action-icon {
  width: 28rpx;
  height: 28rpx;
}

.reward-btn .action-text,
.invite-btn .action-text {
  font-weight: 500;
}

.action-text {
  font-size: $font-size-sm;
  font-weight: 500;
  letter-spacing: 0.5rpx;
}

.like-btn:active,
.comment-btn:active {
  transform: translateY(1rpx) scale(0.98);
}

.reward-btn:active,
.invite-btn:active {
  transform: translateY(2rpx) scale(0.96);
}

.no-results {
  text-align: center;
  padding: $spacing-xxl $spacing-base;
  margin: $spacing-base;
  background-color: $bg-color-primary;
  border-radius: $border-radius-lg;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.no-results-icon {
  width: 96rpx;
  height: 96rpx;
  margin-bottom: $spacing-base;
  opacity: 0.5;
}

.no-results-text {
  font-size: $font-size-base;
  color: $text-color-secondary;
  margin-bottom: $spacing-base;
}

.clear-search-btn {
  background-color: $primary-color;
  color: $text-color-white;
  padding: $spacing-sm $spacing-base;
  border-radius: $border-radius-lg;
  font-size: $font-size-sm;
}

.main-content {
  flex: 1;
}

.feed-scroll {
  height: calc(100vh - 200rpx);
}

.feed-list {
  padding: 20rpx $spacing-base;
}

.feed-card {
  background-color: $bg-color-primary;
  border-radius: $border-radius-lg;
  padding: $spacing-base;
  margin-bottom: $spacing-base;
  box-shadow: $box-shadow-light;
  transition: all $animation-duration-base;
}

.feed-card:active {
  transform: translateY(-4rpx);
  box-shadow: $box-shadow-medium;
}

.feed-header {
  display: flex;
  align-items: center;
  margin-bottom: $spacing-base;
}

.avatar {
  width: 88rpx;
  height: 88rpx;
  border-radius: $border-radius-round;
  margin-right: $spacing-sm;
  border: 4rpx solid $bg-color-secondary;
}

.feed-user {
  flex: 1;
}

.feed-name {
  font-size: $font-size-lg;
  font-weight: 600;
  color: $text-color-primary;
  margin-bottom: $spacing-xs;
}

.feed-tags {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-xs;
}

.tag {
  font-size: $font-size-xs;
  background-color: rgba($primary-color, 0.1);
  color: $primary-color;
  padding: 4rpx $spacing-sm;
  border-radius: $border-radius-lg;
}

.feed-content {
  margin-bottom: $spacing-base;
}

.feed-text {
  font-size: $font-size-base;
  line-height: 1.6;
  color: $text-color-primary;
  margin-bottom: $spacing-base;
}

.feed-img {
  width: 100%;
  border-radius: $border-radius-base;
  margin-bottom: $spacing-sm;
}

.feed-video {
  width: 100%;
  height: 400rpx;
  border-radius: $border-radius-base;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  cursor: pointer;
}

.video-thumbnail {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}

.video-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.play-button {
  width: 120rpx;
  height: 120rpx;
  background: rgba(0, 0, 0,0.5);
  border-radius: $border-radius-round;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.2);
  transition: all $animation-duration-base;
}

.play-button:active {
  transform: scale(0.95);
  background: rgba(0, 0, 0,0.2);
}

.play-icon {
  width: 60rpx;
  height: 60rpx;
  margin-left: 8rpx;
}

.video-duration {
  position: absolute;
  bottom: 16rpx;
  right: 16rpx;
  background: rgba(0, 0, 0, 0.7);
  color: $text-color-white;
  padding: 8rpx 16rpx;
  border-radius: $border-radius-base;
  font-size: $font-size-xs;
  font-weight: 500;
}

.feed-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx $spacing-base;
  border-top: 1rpx solid $border-color-light;
  background: linear-gradient(135deg, rgba(247, 248, 250, 0.5) 0%, rgba(255, 255, 255, 0.8) 100%);
  backdrop-filter: blur(8rpx);
  border-radius: 0 0 $border-radius-lg $border-radius-lg;
  margin: 0 (-$spacing-base) (-$spacing-base);
}

.action-left, .action-right {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.like-btn, .comment-btn, .reward-btn, .invite-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 20rpx;
  border-radius: 24rpx;
  transition: all $animation-duration-base;
  font-size: $font-size-sm;
  min-width: 120rpx;
  justify-content: center;
}

.like-btn, .comment-btn {
  background-color: transparent;
  color: $text-color-secondary;
  border: 1rpx solid $border-color-light;
}

.like-btn.liked {
  color: $highlight-color;
  background: linear-gradient(135deg, rgba(255, 105, 222, 0.1) 0%, rgba(255, 105, 222, 0.05) 100%);
  border-color: $highlight-color;
}

.reward-btn {
  background-color: transparent;
  color: $text-color-secondary;
  font-weight: 500;
  border: 1rpx solid $border-color-light;
  border-radius: 24rpx;
  transition: all $animation-duration-base;
}

.reward-btn:active {
  background-color: rgba($primary-color, 0.05);
  border-color: $primary-color;
  color: $primary-color;
  transform: translateY(1rpx) scale(0.98);
}

.invite-btn {
  background: linear-gradient(135deg, #7363FF 0%, #667eea 50%, #FF69DE 100%);
  color: #ffffff;
  font-weight: 600;
  box-shadow: 0 4rpx 12rpx rgba(115, 99, 255, 0.3);
  border-radius: 24rpx;
  position: relative;
  overflow: hidden;
}

.invite-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, 
    rgba(255, 255, 255, 0) 0%, 
    rgba(255, 255, 255, 0.3) 50%, 
    rgba(255, 255, 255, 0) 100%);
  transition: left 0.6s ease;
}

.invite-btn:active::before {
  left: 100%;
}

.invite-btn::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 120%;
  height: 120%;
  background: radial-gradient(ellipse at center, rgba(115, 99, 255, 0.2) 0%, transparent 70%);
  transform: translate(-50%, -50%);
  border-radius: 50%;
  z-index: -1;
  animation: inviteGlow 3s ease-in-out infinite alternate 1s;
}

@keyframes inviteGlow {
  0% { opacity: 0.3; transform: translate(-50%, -50%) scale(0.8); }
  100% { opacity: 0.6; transform: translate(-50%, -50%) scale(1.1); }
}

.invite-btn:active {
  transform: translateY(1rpx);
  box-shadow: 0 2rpx 8rpx rgba(115, 99, 255, 0.4);
}

// 模态框样式
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: $z-index-modal;
  box-sizing: border-box;
}

.reward-modal {
  width: 90%;
  max-width: 640rpx;
  background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 32rpx;
  overflow: hidden;
  animation: modalSlideUp 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.15), 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
  position: relative;
}

@keyframes modalSlideUp {
  from {
    transform: translateY(100rpx) scale(0.95);
    opacity: 0;
  }
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

.reward-top-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 8rpx;
  background: linear-gradient(90deg, $primary-color 0%, #667eea 50%, $highlight-color 100%);
  z-index: 1;
}

.decoration-circle {
  position: absolute;
  width: 16rpx;
  height: 16rpx;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  top: -4rpx;
}

.decoration-circle:nth-child(1) { left: 20%; }
.decoration-circle:nth-child(2) { left: 50%; }
.decoration-circle:nth-child(3) { left: 80%; }

.reward-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 24rpx 0rpx 24rpx;
  background: linear-gradient(135deg, rgba($primary-color, 0.05) 0%, rgba(255, 255, 255, 0.8) 100%);
  position: relative;
}

.reward-user-section {
  display: flex;
  align-items: center;
  flex: 1;
}

.avatar-container {
  position: relative;
  margin-right: $spacing-base;
}

.reward-avatar {
  width: 96rpx;
  height: 96rpx;
  border-radius: $border-radius-round;
  box-shadow: 0 8rpx 24rpx rgba($primary-color, 0.2);
}

.avatar-border {
  position: absolute;
  top: -4rpx;
  left: -4rpx;
  width: calc(100% + 8rpx);
  height: calc(100% + 8rpx);
  border: 3rpx solid transparent;
  border-radius: $border-radius-round;
  background: linear-gradient(45deg, $primary-color, $highlight-color) border-box;
  -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: destination-out;
  animation: avatarGlow 2s ease-in-out infinite alternate;
}

@keyframes avatarGlow {
  0% { opacity: 0.6; }
  100% { opacity: 1; }
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: $font-size-lg;
  font-weight: 700;
  color: $text-color-primary;

  background: linear-gradient(45deg, $text-color-primary, $primary-color);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.reward-badge {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
  background: linear-gradient(135deg, rgba($warning-color, 0.1) 0%, rgba($highlight-color, 0.1) 100%);
  padding: 6rpx 12rpx;
  border-radius: 20rpx;
  border: 1rpx solid rgba($warning-color, 0.2);
}

.badge-icon {
  width: 20rpx;
  height: 20rpx;
}

.badge-text {
  font-size: $font-size-xs;
  color: $warning-color;
  font-weight: 600;
}

.close-button {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: $border-radius-round;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10rpx);
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
  transition: all $animation-duration-base;
}

.close-button:active {
  transform: scale(0.95);
  background: rgba(255, 255, 255, 0.7);
}

.close-icon {
  width: 24rpx;
  height: 24rpx;
}

.reward-main {
  padding: $spacing-sm $spacing-base;
}

.reward-title {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: $spacing-base;
  padding: $spacing-sm 0;
}

.title-heart {
  width: 28rpx;
  height: 28rpx;
  animation: heartBeat 1.5s ease-in-out infinite alternate;
}

@keyframes heartBeat {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.title-text {
  font-size: $font-size-lg;
  font-weight: 700;
  background: linear-gradient(45deg, $primary-color, $highlight-color);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0 $spacing-sm;
}

.amount-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: $spacing-sm;
  margin-bottom: $spacing-base;
}

.amount-card {
  position: relative;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 2rpx solid $border-color-light;
  border-radius: 16rpx;
  padding: $spacing-sm;
  text-align: center;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  overflow: hidden;
}

.amount-card:active {
  transform: translateY(-2rpx);
}

.amount-card.selected {
  border-color: $primary-color;
  background: linear-gradient(135deg, rgba($primary-color, 0.1) 0%, rgba($highlight-color, 0.05) 100%);
  transform: translateY(-4rpx);
  box-shadow: 0 12rpx 32rpx rgba($primary-color, 0.2);
}

.card-content {
  display: flex;
  align-items: baseline;
  justify-content: center;
  margin-bottom: $spacing-xs;
}

.amount-number {
  font-size: 48rpx;
  font-weight: 800;
  color: $text-color-primary;
  line-height: 1;
}

.amount-card.selected .amount-number {
  background: linear-gradient(45deg, $primary-color, $highlight-color);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.amount-currency {
  font-size: $font-size-base;
  color: $text-color-secondary;
  margin-left: 4rpx;
}

.amount-desc {
  font-size: $font-size-sm;
  color: $text-color-secondary;
  font-weight: 500;
}

.amount-card.selected .amount-desc {
  color: $primary-color;
}

.card-glow {
  position: absolute;
  top: -2rpx;
  left: -2rpx;
  right: -2rpx;
  bottom: -2rpx;
  background: linear-gradient(45deg, $primary-color, $highlight-color);
  border-radius: 22rpx;
  z-index: -1;
  opacity: 0.3;
  animation: cardGlow 2s ease-in-out infinite alternate;
}

@keyframes cardGlow {
  0% { opacity: 0.2; }
  100% { opacity: 0.4; }
}

.custom-amount-section {
  margin-bottom: $spacing-base;
}

.custom-label {
  font-size: $font-size-base;
  font-weight: 600;
  color: $text-color-primary;
  margin-bottom: $spacing-xs;
  display: block;
}

.custom-input-wrapper {
  display: flex;
  align-items: center;
  background: $bg-color-secondary;
  border: 2rpx solid $border-color-light;
  border-radius: $border-radius-base;
  padding: $spacing-sm $spacing-base;
  transition: all $animation-duration-base;
}

.custom-input-wrapper.selected {
  border-color: $primary-color;
  background: rgba($primary-color, 0.05);
}

.currency-prefix {
  font-size: $font-size-base;
  font-weight: 600;
  color: $primary-color;
  margin-right: $spacing-xs;
}

.custom-amount-input {
  flex: 1;
  font-size: $font-size-base;
  font-weight: 600;
  color: $text-color-primary;
  background: transparent;
  border: none;
  outline: none;
  text-align: left;
}

.message-label {
  font-size: $font-size-base;
  font-weight: 600;
  color: $text-color-primary;
  margin-bottom: $spacing-xs;
  display: block;
}

.optional-text {
  font-size: $font-size-xs;
  color: $text-color-placeholder;
  font-weight: normal;
}

.message-textarea {
  width: 100%;
   height: 120rpx;
  padding: $spacing-sm;
  border: 2rpx solid $border-color-light;
  border-radius: $border-radius-base;
  font-size: $font-size-sm;
  line-height: 1.4;
  resize: none;
  background: $bg-color-secondary;
  transition: all $animation-duration-base;
  box-sizing: border-box;
  margin-bottom: $spacing-xs;
}

.message-textarea:focus {
  border-color: $primary-color;
  background: $bg-color-primary;
}

.char-counter {
  font-size: $font-size-xs;
  color: $text-color-placeholder;
  text-align: right;
  display: block;
}

.reward-bottom {
  padding: $spacing-sm $spacing-base $spacing-base;
  background: linear-gradient(135deg, rgba($primary-color, 0.02) 0%, rgba(255, 255, 255, 0.8) 100%);

}

.total-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-sm;
  padding: $spacing-sm;
  background: rgba(255, 255, 255, 0.6);
  border-radius: $border-radius-base;
  backdrop-filter: blur(10rpx);
}

.total-label {
  font-size: $font-size-base;
  color: $text-color-secondary;
  font-weight: 500;
}

.total-amount {
  font-size: 48rpx;
  font-weight: 800;
  background: linear-gradient(45deg, $primary-color, $highlight-color);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.confirm-button {
  position: relative;
  width: 100%;
  background: linear-gradient(135deg, $primary-color 0%, $highlight-color 100%);
  color: $text-color-white;
  padding: 24rpx;
  border-radius: 20rpx;
  font-size: $font-size-base;
  font-weight: 700;
  text-align: center;
  box-shadow: 0 8rpx 24rpx rgba($primary-color, 0.4);
  transition: all $animation-duration-base;
  overflow: hidden;
  box-sizing: border-box;
}

.confirm-button:active {
  transform: translateY(2rpx);
  box-shadow: 0 4rpx 12rpx rgba($primary-color, 0.4);
}

.button-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-sm;
  position: relative;
  z-index: 1;
}

.button-icon {
  width: 28rpx;
  height: 28rpx;
  animation: buttonHeartBeat 1s ease-in-out infinite;
}

@keyframes buttonHeartBeat {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.button-text {
  font-size: $font-size-base;
  font-weight: 700;
}

.button-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, 
    rgba(255, 255, 255, 0) 0%, 
    rgba(255, 255, 255, 0.3) 50%, 
    rgba(255, 255, 255, 0) 100%);
  animation: buttonShine 3s ease-in-out infinite;
}

@keyframes buttonShine {
  0% { left: -100%; }
  50% { left: 100%; }
  100% { left: 100%; }
}

// 评论相关样式
.modal-container {
  width: 90%;
  max-width: 640rpx;
  background-color: $bg-color-primary;
  border-radius: $border-radius-xl;
  overflow: hidden;
  animation: modalSlideUp 0.3s ease;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $spacing-base;
  border-bottom: 1rpx solid $border-color-light;
  background-color: $bg-color-primary;
}

.modal-title {
  font-size: $font-size-lg;
  font-weight: 600;
  color: $text-color-primary;
}

.close-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: $border-radius-round;
  background-color: $bg-color-secondary;
  transition: all $animation-duration-base;
}

.close-btn:active {
  background-color: $border-color-light;
}

.modal-content {
  padding: $spacing-base;
  max-height: 60vh;
  overflow-y: auto;
}

.modal-footer {
  padding: $spacing-base;
  border-top: 1rpx solid $border-color-light;
  background-color: $bg-color-secondary;
}

.comment-modal {
  max-height: 80vh;
  background-color: #ffffff;
  box-sizing: border-box;

 
  padding: 0;
}

.comment-post {
  margin-bottom: $spacing-base;
  padding-bottom: $spacing-base;
  border-bottom: 1rpx solid $border-color-light;

}

.post-info {
  display: flex;
  align-items: flex-start;
}

.post-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: $border-radius-round;
  margin-right: $spacing-sm;
}

.post-details {
  flex: 1;
}

.post-name {
  font-size: $font-size-base;
  font-weight: 600;
  color: $text-color-primary;
  margin-bottom: $spacing-xs;
}

.post-preview {
  font-size: $font-size-sm;
  color: $text-color-secondary;
  line-height: 1.5;
}

.comment-list {
  margin-bottom: $spacing-base;
}

.comment-item {
  display: flex;
  margin-bottom: $spacing-base;
}

.comment-avatar {
  width: 64rpx;
  height: 64rpx;
  border-radius: $border-radius-round;
  margin-right: $spacing-sm;
}

.comment-content {
  flex: 1;
}

.comment-name {
  font-size: $font-size-sm;
  font-weight: 600;
  color: $text-color-primary;
  margin-bottom: $spacing-xs;
}

.comment-text {
  font-size: $font-size-sm;
  color: $text-color-primary;
  line-height: 1.5;
  margin-bottom: $spacing-xs;
}

.comment-meta {
  display: flex;
  align-items: center;
  gap: $spacing-base;
}

.comment-time {
  font-size: $font-size-xs;
  color: $text-color-placeholder;
}

.comment-reply-btn {
  font-size: $font-size-xs;
  color: $primary-color;
  padding: $spacing-xs;
}

.no-comments {
  text-align: center;
  padding: $spacing-xxl 0;
  color: $text-color-secondary;
}

.no-comments-icon {
  width: 80rpx;
  height: 80rpx;
  margin-bottom: $spacing-base;
  opacity: 0.5;
}

.no-comments-text {
  font-size: $font-size-sm;
}

.comment-input-container {
  display: flex;
  align-items: center;
  background-color: $bg-color-primary;
  border-radius: $border-radius-lg;
  padding: $spacing-sm;
  border: 2rpx solid $border-color-light;
}

.comment-input {
  flex: 1;
  font-size: $font-size-sm;
  color: $text-color-primary;
  background: transparent;
  border: none;
  outline: none;
}

.send-comment-btn {
  width: 64rpx;
  height: 64rpx;
  background-color: $primary-color;
  border-radius: $border-radius-round;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all $animation-duration-base;
}

.send-comment-btn.disabled {
  background-color: $bg-color-tertiary;
}

.send-icon {
  font-size: 24rpx;
  color: $text-color-white;
}

// 点赞提示
.like-toast {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 120rpx;
  height: 120rpx;
  background-color: rgba(0, 0, 0, 0.7);
  border-radius: $border-radius-round;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: $z-index-popup;
  animation: likeToast 1s forwards;
}

@keyframes likeToast {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.5);
  }
  20% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1.2);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(1.5);
  }
}

.toast-icon {
  width: 60rpx;
  height: 60rpx;
}
</style> 