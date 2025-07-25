<template>
  <div class="orders-page">
    <!-- 顶部导航栏 -->
    <div class="nav-bar">
      <div class="nav-back" @click="goBack">
        <i class="fas fa-chevron-left"></i>
      </div>
      <div class="nav-title">我的订单</div>
      <div class="nav-actions">
        <i class="fas fa-search" @click="showSearch = !showSearch"></i>
      </div>
    </div>

    <!-- 搜索栏 -->
    <div class="search-bar" v-if="showSearch">
      <div class="search-input-wrapper">
        <i class="fas fa-search search-icon"></i>
        <input 
          type="text" 
          class="search-input" 
          placeholder="搜索订单号/服务名称/友伴姓名"
          v-model="searchText"
        />
        <i class="fas fa-times-circle clear-icon" v-if="searchText" @click="searchText = ''"></i>
      </div>
      <div class="search-tags" v-if="recentSearches.length > 0">
        <div class="tag-label">最近搜索:</div>
        <div class="tags-container">
          <div 
            v-for="(tag, index) in recentSearches" 
            :key="index"
            class="search-tag"
            @click="searchText = tag"
          >
            {{ tag }}
          </div>
        </div>
      </div>
    </div>

    <!-- 订单状态筛选 -->
    <div class="order-filter">
      <div 
        v-for="item in filterOptions" 
        :key="item.status"
        :class="['filter-item', { active: currentStatus === item.status }]"
        @click="setFilter(item.status)"
      >
        {{ item.label }}
        <div class="filter-indicator" v-if="currentStatus === item.status"></div>
      </div>
    </div>

    <!-- 订单列表 -->
    <div class="orders-list" v-if="filteredOrders.length > 0">
      <div 
        v-for="order in filteredOrders" 
        :key="order.id"
        class="order-card"
        @click="viewOrderDetail(order.id)"
      >
        <!-- 订单头部信息 -->
        <div class="order-header">
          <div class="order-left">
            <div class="partner-avatar">
              <img :src="order.partnerAvatar" alt="头像" />
              <div class="partner-rating" v-if="order.partnerRating">
                {{ order.partnerRating }}
                <i class="fas fa-star"></i>
              </div>
            </div>
            <div class="partner-info">
              <div class="partner-name">{{ order.partnerName }} 
                <span class="partner-badge" v-if="order.isSuperPartner">超级友伴</span>
              </div>
              <div class="order-time">{{ order.createTime }}</div>
            </div>
          </div>
          <div :class="['order-status', `status-${order.status}`]">
            {{ getStatusText(order.status) }}
          </div>
        </div>

        <!-- 订单内容 -->
        <div class="order-content">
          <div class="service-info">
            <div class="service-name">{{ order.serviceName }}</div>
            <div class="service-price">¥{{ order.price.toFixed(2) }}</div>
          </div>
          
          <!-- 服务标签 -->
          <div class="service-tags" v-if="order.tags && order.tags.length > 0">
            <span class="service-tag" v-for="(tag, index) in order.tags" :key="index">{{ tag }}</span>
          </div>

          <div class="service-details">
            <div class="detail-item">
              <span class="detail-label">时长：</span>
              <span class="detail-value">{{ order.duration }}小时</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">预约时间：</span>
              <span class="detail-value">{{ order.appointmentTime }}</span>
            </div>
            <div class="detail-item" v-if="order.location">
              <span class="detail-label">服务地点：</span>
              <span class="detail-value">{{ order.location }}</span>
            </div>
            <div class="detail-item" v-if="order.orderNote">
              <span class="detail-label">备注：</span>
              <span class="detail-value note-text">{{ order.orderNote }}</span>
            </div>
          </div>

          <!-- 进度展示 -->
          <div class="order-progress" v-if="order.status === 'in-progress' && order.progress">
            <div class="progress-header">
              <span>服务进度</span>
              <span>{{ order.progress }}%</span>
            </div>
            <div class="progress-bar">
              <div class="progress-inner" :style="{width: order.progress + '%'}"></div>
            </div>
          </div>
        </div>

        <!-- 订单底部操作 -->
        <div class="order-footer">
          <div class="order-amount">
            <span class="amount-label">实付款</span>
            <span class="amount-value">¥{{ order.totalAmount.toFixed(2) }}</span>
            <span class="amount-detail" v-if="order.discount > 0">已优惠¥{{ order.discount.toFixed(2) }}</span>
          </div>
          <div class="order-actions">
            <!-- 根据状态显示不同按钮 -->
            <template v-if="order.status === 'pending'">
              <div class="countdown" v-if="order.expireTime">
                <span class="countdown-label">支付剩余时间:</span>
                <span class="countdown-value">{{ order.expireTime }}</span>
              </div>
              <button class="action-btn cancel-btn" @click.stop="cancelOrder(order.id)">取消订单</button>
              <button class="action-btn primary-btn" @click.stop="payOrder(order.id)">立即支付</button>
            </template>
            <template v-else-if="order.status === 'to-serve'">
              <button class="action-btn default-btn" @click.stop="contactPartner(order.id)">
                <i class="fas fa-comment-alt"></i> 联系友伴
              </button>
              <button class="action-btn primary-btn" @click.stop="modifyOrder(order.id)">修改订单</button>
            </template>
            <template v-else-if="order.status === 'in-progress'">
              <button class="action-btn default-btn" @click.stop="contactPartner(order.id)">
                <i class="fas fa-comment-alt"></i> 联系友伴
              </button>
              <button class="action-btn primary-btn" @click.stop="confirmComplete(order.id)">确认完成</button>
            </template>
            <template v-else-if="order.status === 'completed'">
              <button class="action-btn default-btn" @click.stop="orderAgain(order.id)">再次预约</button>
              <button class="action-btn primary-btn" @click.stop="viewOrderDetail(order.id)">查看详情</button>
            </template>
            <template v-else-if="order.status === 'to-review'">
              <button class="action-btn default-btn" @click.stop="orderAgain(order.id)">再次预约</button>
              <button class="action-btn primary-btn" @click.stop="writeReview(order.id)">
                <i class="fas fa-star"></i> 立即评价
              </button>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态展示 -->
    <div class="empty-state" v-else>
      <div class="empty-icon">
        <i class="fas fa-clipboard-list"></i>
      </div>
      <div class="empty-text">暂无相关订单</div>
      <div class="empty-subtext">您可以在首页寻找合适的服务</div>
      <button class="explore-btn" @click="goToHome">
        <i class="fas fa-compass"></i> 去探索服务
      </button>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';

export default {
  name: 'OrdersPage',
  
  setup() {
    const router = useRouter();
    const route = useRoute();
    
    // 搜索相关
    const showSearch = ref(false);
    const searchText = ref('');
    const recentSearches = ref(['家居顾问', '摄影师', '心理咨询']);
    
    // 筛选状态
    const currentStatus = ref(route.query.status || 'all');
    const filterOptions = [
      { label: '全部', status: 'all' },
      { label: '待付款', status: 'pending' },
      { label: '待服务', status: 'to-serve' },
      { label: '进行中', status: 'in-progress' },
      { label: '已完成', status: 'completed' },
      { label: '待评价', status: 'to-review' }
    ];
    
    // 模拟订单数据
    const orders = ref([
      {
        id: 'O20230001',
        partnerName: '小王',
        partnerAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80',
        partnerRating: 4.9,
        isSuperPartner: true,
        serviceName: '家居顾问 - 高级套餐',
        tags: ['专业指导', '首次优惠'],
        createTime: '2023-09-01 14:30',
        status: 'pending',
        price: 150,
        duration: 2,
        appointmentTime: '2023-09-10 10:00',
        location: '用户指定地点',
        totalAmount: 300,
        discount: 50,
        expireTime: '23:45:30'
      },
      {
        id: 'O20230002',
        partnerName: '张琳',
        partnerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80',
        partnerRating: 4.8,
        serviceName: '摄影师 - 人像写真',
        tags: ['室外拍摄', '提供化妆'],
        createTime: '2023-08-25 09:15',
        status: 'to-serve',
        price: 200,
        duration: 1.5,
        appointmentTime: '2023-09-05 14:00',
        location: '市中心摄影棚',
        totalAmount: 300,
        discount: 0
      },
      {
        id: 'O20230003',
        partnerName: '李明',
        partnerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
        partnerRating: 4.7,
        serviceName: 'K歌达人 - 专业指导',
        tags: ['一对一指导', '录音'],
        createTime: '2023-08-20 18:30',
        status: 'in-progress',
        price: 120,
        duration: 3,
        appointmentTime: '2023-09-02 19:00',
        location: '城西KTV',
        totalAmount: 360,
        discount: 0,
        progress: 75,
        orderNote: '需要提前准备歌单'
      },
      {
        id: 'O20230004',
        partnerName: '王芳',
        partnerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
        partnerRating: 5.0,
        isSuperPartner: true,
        serviceName: '心理咨询 - 标准课程',
        tags: ['资深心理师', '保密咨询'],
        createTime: '2023-08-15 10:00',
        status: 'completed',
        price: 300,
        duration: 1,
        appointmentTime: '2023-08-20 15:30',
        location: '线上视频',
        totalAmount: 300,
        discount: 0
      },
      {
        id: 'O20230005',
        partnerName: '陈磊',
        partnerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80',
        partnerRating: 4.6,
        serviceName: '健身教练 - 私人定制',
        tags: ['器械训练', '体能提升'],
        createTime: '2023-08-10 08:45',
        status: 'to-review',
        price: 180,
        duration: 1.5,
        appointmentTime: '2023-08-18 10:00',
        location: '悦动健身中心',
        totalAmount: 270,
        discount: 0
      },
      {
        id: 'O20230006',
        partnerName: '赵雪',
        partnerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80',
        partnerRating: 4.9,
        isSuperPartner: true,
        serviceName: '中医推拿 - 全身舒缓',
        tags: ['推拿按摩', '专业技师'],
        createTime: '2023-08-05 15:20',
        status: 'completed',
        price: 288,
        duration: 1.5,
        appointmentTime: '2023-08-07 16:00',
        location: '康复理疗中心',
        totalAmount: 288,
        discount: 30
      },
      {
        id: 'O20230007',
        partnerName: '郭峰',
        partnerAvatar: 'https://images.unsplash.com/photo-1566753323558-f4e0952af115?auto=format&fit=crop&w=100&q=80',
        partnerRating: 4.7,
        serviceName: '钢琴家教 - 入门课程',
        tags: ['初级教学', '考级辅导'],
        createTime: '2023-07-30 09:10',
        status: 'completed',
        price: 200,
        duration: 2,
        appointmentTime: '2023-08-02 15:00',
        location: '用户指定地点',
        totalAmount: 400,
        discount: 50
      },
      {
        id: 'O20230008',
        partnerName: '周杰',
        partnerAvatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=100&q=80',
        partnerRating: 4.5,
        serviceName: 'DJ打碟 - 派对活动',
        tags: ['现场表演', '设备齐全'],
        createTime: '2023-07-20 18:00',
        status: 'completed',
        price: 500,
        duration: 4,
        appointmentTime: '2023-07-25 20:00',
        location: '蓝调酒吧',
        totalAmount: 2000,
        discount: 200
      }
    ]);
    
    // 根据筛选和搜索条件过滤订单
    const filteredOrders = computed(() => {
      return orders.value.filter(order => {
        // 状态筛选
        if (currentStatus.value !== 'all' && order.status !== currentStatus.value) {
          return false;
        }
        
        // 搜索筛选
        if (searchText.value) {
          const searchLower = searchText.value.toLowerCase();
          return order.id.toLowerCase().includes(searchLower) || 
                 order.serviceName.toLowerCase().includes(searchLower) ||
                 order.partnerName.toLowerCase().includes(searchLower);
        }
        
        return true;
      });
    });
    
    // 获取状态显示文本
    const getStatusText = (status) => {
      const statusMap = {
        'pending': '待付款',
        'to-serve': '待服务',
        'in-progress': '进行中',
        'completed': '已完成',
        'to-review': '待评价',
        'cancelled': '已取消'
      };
      return statusMap[status] || '未知状态';
    };
    
    // 设置筛选条件
    const setFilter = (status) => {
      currentStatus.value = status;
    };
    
    // 导航方法
    const goBack = () => {
      router.back();
    };
    
    const goToHome = () => {
      router.push('/');
    };
    
    // 订单操作方法
    const viewOrderDetail = (orderId) => {
      console.log('查看订单详情', orderId);
      router.push(`/order-detail/${orderId}`);
    };
    
    const cancelOrder = (orderId) => {
      console.log('取消订单', orderId);
      alert(`取消订单: ${orderId}`);
    };
    
    const payOrder = (orderId) => {
      console.log('支付订单', orderId);
      alert(`支付订单: ${orderId}`);
    };
    
    const contactPartner = (orderId) => {
      console.log('联系友伴', orderId);
      alert(`联系友伴: ${orderId}`);
    };
    
    const modifyOrder = (orderId) => {
      console.log('修改订单', orderId);
      alert(`修改订单: ${orderId}`);
    };
    
    const confirmComplete = (orderId) => {
      console.log('确认完成', orderId);
      alert(`确认完成: ${orderId}`);
    };
    
    const orderAgain = (orderId) => {
      console.log('再次预约', orderId);
      alert(`再次预约: ${orderId}`);
    };
    
    const writeReview = (orderId) => {
      console.log('写评价', orderId);
      alert(`写评价: ${orderId}`);
    };
    
    return {
      showSearch,
      searchText,
      recentSearches,
      currentStatus,
      filterOptions,
      filteredOrders,
      getStatusText,
      setFilter,
      goBack,
      goToHome,
      viewOrderDetail,
      cancelOrder,
      payOrder,
      contactPartner,
      modifyOrder,
      confirmComplete,
      orderAgain,
      writeReview
    };
  }
};
</script>

<style scoped>
.orders-page {
  background-color: #f5f7fa;
  min-height: 100vh;
  padding-bottom: 20px;
}

/* 顶部导航栏 */
.nav-bar {
  position: sticky;
  top: 0;
  left: 0;
  width: 100%;
  height: 50px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  box-sizing: border-box;
}

.nav-back {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #f0f2fd;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #6366f1;
}

.nav-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.nav-actions {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6366f1;
  cursor: pointer;
}

/* 搜索栏 */
.search-bar {
  padding: 12px 16px;
  background: white;
  border-bottom: 1px solid #eee;
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  background: #f0f2fd;
  border-radius: 24px;
  padding: 8px 12px;
  position: relative;
}

.search-icon {
  color: #6366f1;
  margin-right: 8px;
  font-size: 14px;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 14px;
  color: #333;
  outline: none;
}

.clear-icon {
  color: #999;
  cursor: pointer;
  font-size: 14px;
}

/* 搜索标签 */
.search-tags {
  margin-top: 12px;
  display: flex;
  align-items: center;
}

.tag-label {
  font-size: 13px;
  color: #666;
  margin-right: 8px;
}

.tags-container {
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
  gap: 8px;
}

.search-tag {
  padding: 4px 10px;
  background: #f0f2fd;
  border-radius: 12px;
  font-size: 12px;
  color: #6366f1;
  white-space: nowrap;
  cursor: pointer;
}

/* 订单状态筛选 */
.order-filter {
  display: flex;
  background: white;
  padding: 0 8px;
  overflow-x: auto;
  position: sticky;
  top: 50px;
  z-index: 99;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.filter-item {
  flex-shrink: 0;
  padding: 12px 16px;
  font-size: 13px;
  color: #666;
  position: relative;
  cursor: pointer;
  white-space: nowrap;
  display: flex;
  align-items: center;
}

.filter-item.active {
  color: #6366f1;
  font-weight: 600;
}

.filter-indicator {
  position: absolute;
  bottom: 0;
  left: 20%;
  width: 60%;
  height: 3px;
  background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: 3px;
}

/* 订单列表 */
.orders-list {
  padding: 12px 16px;
}

.order-card {
  background: white;
  border-radius: 12px;
  margin-bottom: 16px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

/* 订单头部 */
.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.order-left {
  display: flex;
  align-items: center;
}

.partner-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 12px;
  border: 1px solid #eee;
  position: relative;
}

.partner-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.partner-rating {
  position: absolute;
  bottom: -2px;
  right: -2px;
  background: #ffbb00;
  color: white;
  border-radius: 10px;
  font-size: 10px;
  padding: 1px 4px;
  display: flex;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  font-weight: 600;
}

.partner-rating i {
  font-size: 8px;
  margin-left: 2px;
}

.partner-name {
  font-size: 15px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
}

.partner-badge {
  font-size: 10px;
  background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  padding: 2px 6px;
  border-radius: 10px;
  margin-left: 6px;
}

.order-time {
  font-size: 12px;
  color: #999;
}

.order-status {
  font-size: 14px;
  font-weight: 500;
}

.status-pending {
  color: #f59e0b;
}

.status-to-serve {
  color: #6366f1;
}

.status-in-progress {
  color: #3b82f6;
}

.status-completed {
  color: #10b981;
}

.status-to-review {
  color: #ec4899;
}

.status-cancelled {
  color: #9ca3af;
}

/* 订单内容 */
.order-content {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.service-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.service-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.service-price {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

/* 服务标签 */
.service-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}

.service-tag {
  background: #f0f2fd;
  border-radius: 10px;
  padding: 2px 8px;
  font-size: 11px;
  color: #6366f1;
}

.service-details {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.detail-item {
  font-size: 13px;
  color: #666;
}

.detail-label {
  color: #999;
  margin-right: 4px;
}

.note-text {
  color: #777;
  font-style: italic;
}

/* 进度条 */
.order-progress {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed #eee;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #666;
  margin-bottom: 6px;
}

.progress-bar {
  height: 6px;
  background: #f0f2fd;
  border-radius: 3px;
  overflow: hidden;
}

.progress-inner {
  height: 100%;
  background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: 3px;
}

/* 订单底部 */
.order-footer {
  padding: 16px;
}

.order-amount {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-bottom: 16px;
}

.amount-label {
  font-size: 14px;
  color: #666;
  margin-right: 8px;
}

.amount-value {
  font-size: 18px;
  font-weight: 600;
  color: #f43f5e;
}

.amount-detail {
  font-size: 12px;
  color: #999;
  margin-left: 8px;
}

.order-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.countdown {
  padding: 4px 8px;
  background: #fff5f5;
  color: #f43f5e;
  border-radius: 10px;
  font-size: 12px;
  margin-right: auto;
}

.countdown-label {
  margin-right: 4px;
}

.countdown-value {
  font-weight: 600;
}

.action-btn {
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  display: flex;
  align-items: center;
}

.action-btn i {
  margin-right: 4px;
}

.cancel-btn {
  border: 1px solid #d1d5db;
  background: white;
  color: #6b7280;
}

.default-btn {
  border: 1px solid #d1d5db;
  background: white;
  color: #6b7280;
}

.primary-btn {
  background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.2);
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 24px;
  text-align: center;
}

.empty-icon {
  width: 70px;
  height: 70px;
  background: #f0f2fd;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6366f1;
  font-size: 30px;
  margin-bottom: 16px;
  box-shadow: 0 4px 10px rgba(99, 102, 241, 0.15);
}

.empty-text {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.empty-subtext {
  font-size: 14px;
  color: #999;
  margin-bottom: 24px;
}

.explore-btn {
  background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  border: none;
  border-radius: 24px;
  padding: 12px 24px;
  font-size: 15px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
  cursor: pointer;
  display: flex;
  align-items: center;
}

.explore-btn i {
  margin-right: 6px;
}

/* 最后增加滚动条隐藏样式 */
::-webkit-scrollbar {
  display: none;
}
</style> 