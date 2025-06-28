<template>
  <view class="friends-container">
    <!-- 顶部区域 -->
    <view class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="header-top">
        <view class="city-selector" @click="showCityPicker = true">
          <image src="@/static/icons/friend/map-pin.png" class="location-icon" mode="aspectFit" />
          <view class="city-select">
            <text>{{ city }}</text>
            <image src="@/static/icons/friend/chevron-down.png" class="select-arrow" mode="aspectFit" />
          </view>
        </view>
        <view class="search-container">
          <image src="@/static/icons/friend/search.png" class="search-icon" mode="aspectFit" />
          <input v-model="search" class="search-input" placeholder="搜索友伴" />
        </view>
       
      </view>
      
      <!-- 标签栏 -->
      <view class="partner-tabs">
        <view 
          v-for="tab in partnerTabs" 
          :key="tab.id" 
          :class="['partner-tab', {active: activeTab === tab.id}]" 
          @click="activeTab = tab.id"
        >
  
          <text>{{ tab.name }}</text>
        </view>
      </view>
      
      <!-- 筛选选项 -->
      <view class="partner-filters">
        <view class="filter-item" @click="openFilterModal('gender')">
     
          <text>性别</text>
          <image src="@/static/icons/friend/chevron-down.png" class="filter-arrow" mode="aspectFit" />
        </view>
        <view class="filter-item" @click="openFilterModal('distance')">
    
          <text>距离</text>
          <image src="@/static/icons/friend/chevron-down.png" class="filter-arrow" mode="aspectFit" />
        </view>
        <view class="filter-item" @click="openFilterModal('sort')">

          <text>排序</text>
          <image src="@/static/icons/friend/chevron-down.png" class="filter-arrow" mode="aspectFit" />
        </view>
      </view>
    </view>

    <!-- 友伴列表 -->
   <view class="main-content">

    <scroll-view 
      class="partner-list" 
      scroll-y="true"
      @scrolltolower="loadMore"
      refresher-enabled
      :refresher-triggered="isRefreshing"
      @refresherrefresh="onRefresh"
    >
      <view v-for="p in partnersList" :key="p.id" class="partner-card" @click="navigateToDetail(p.id)">
        <view class="avatar-wrapper">
          <image :src="p.avatar" class="avatar" mode="aspectFill" />
          <view v-if="p.online" class="status-dot"></view>
          <view v-if="p.new" class="badge new">新人推荐</view>
        </view>
        <view class="partner-info">
          <view class="partner-name-row">
            <view class="partner-name">
              {{ p.name }}
           
                <image src="@/static/icons/friend/female.png" mode="aspectFit"  class="gender-icon" v-if="p.gender === '女'" />
                <image src="@/static/icons/friend/male.png" class="gender-icon" mode="aspectFit" v-else/>
             
            </view>
            <view class="partner-rate">
              <image src="@/static/icons/friend/star.png" class="rate-icon" mode="aspectFit" />
              <text>{{ p.rate }}</text>
            </view>
          </view>
          <view class="partner-meta">{{ p.age }}岁 · {{ p.height }}cm · {{ p.distance }}km</view>
          <view class="partner-tags">
            <text v-for="(tag, index) in p.visibleTags" :key="index" class="tag">{{ tag }}</text>
            <text v-if="p.extraTags > 0" class="more-tags">+{{ p.extraTags }}</text>
          </view>
          <view class="partner-actions">
            <view class="message-btn" >
              
            </view>
            <view class="schedule-btn" @click.stop="navigateToBooking(p.id)">
              <text>立即邀约</text>
            </view>
          </view>
        </view>
      </view>
      <view style="height: 20rpx;"></view>
    </scroll-view>
   </view>

    <!-- 筛选弹窗 -->
    <view class="filter-modal" v-if="activeModal" @click="closeModal">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">{{ getModalTitle }}</text>
          <view class="close-btn" @click="closeModal">
            <image src="@/static/icons/friend/close.png" class="close-icon" mode="aspectFit" />
          </view>
        </view>
        <view class="modal-body">
          <view 
            v-for="option in getFilterOptions" 
            :key="option.value"
            :class="['filter-option', { selected: isOptionSelected(option.value) }]"
            @click="selectOption(option.value)"
          >
            <view class="option-icon" v-if="option.icon">
              <image :src="option.icon" class="option-icon-img" mode="aspectFit" />
            </view>
            <text class="option-label">{{ option.label }}</text>
            <view class="option-check" v-if="isOptionSelected(option.value)">
              <image src="@/static/icons/friend/check.png" class="check-icon" mode="aspectFit" />
            </view>
          </view>
        </view>
        <view class="modal-footer">
          <button class="reset-btn" @click="resetFilter">重置</button>
          <button class="apply-btn" @click="applyFilter">确定</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// 状态栏高度
const statusBarHeight = ref(0)

// 页面数据
const city = ref('南昌市')
const search = ref('')
const hasNewNotifications = ref(false)
const isRefreshing = ref(false)

// 标签栏
const activeTab = ref('recommend')
const partnerTabs = [
  { id: 'recommend', name: '推荐', icon: '@/static/icons/friend/fire.png' },
  { id: 'around', name: '周边', icon: '@/static/icons/friend/location.png' },
  { id: 'matched', name: '匹配', icon: '@/static/icons/friend/heart.png' },
  { id: 'favorites', name: '收藏', icon: '@/static/icons/friend/bookmark.png' }
]

// 筛选相关
const activeModal = ref('')
const genderFilter = ref('all')
const distanceFilter = ref('all')
const sortFilter = ref('recommend')

// 友伴数据
const partnersList = ref([
  { 
    id: 1, 
    name: '若汐', 
    gender: '女', 
    age: 21, 
    weight: 45, 
    height: 168, 
    distance: 3.1, 
    tags: ['古典美人', '温婉如玉', '琴棋书画', '茶艺精通'], 
    rate: 42, 
    avatar: 'https://images.pexels.com/photos/1391498/pexels-photo-1391498.jpeg?auto=compress&cs=tinysrgb&w=120&h=160&fit=crop', 
    online: true, 
    new: true, 
    bookable: true 
  },
  { 
    id: 2, 
    name: '诗韵', 
    gender: '女', 
    age: 23, 
    weight: 48, 
    height: 170, 
    distance: 5.2, 
    tags: ['知书达理', '温文尔雅', '古风汉服', '诗词歌赋'], 
    rate: 28, 
    avatar: 'https://images.pexels.com/photos/1858175/pexels-photo-1858175.jpeg?auto=compress&cs=tinysrgb&w=120&h=160&fit=crop', 
    online: true, 
    new: false, 
    bookable: true 
  },
  { 
    id: 3, 
    name: '思雨', 
    gender: '女', 
    age: 22, 
    weight: 44, 
    height: 162, 
    distance: 4.3, 
    tags: ['江南水乡', '温柔似水', '刺绣手艺', '古典舞蹈'], 
    rate: 36, 
    avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=120&h=160&fit=crop', 
    online: false, 
    new: false, 
    bookable: true 
  },
  { 
    id: 4, 
    name: '君逸', 
    gender: '男', 
    age: 24, 
    weight: 68, 
    height: 187, 
    distance: 2.5, 
    tags: ['翩翩君子', '儒雅风度', '书法造诣', '武术高手'], 
    rate: 19, 
    avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=120&h=160&fit=crop', 
    online: true, 
    new: false, 
    bookable: false 
  },
  { 
    id: 5, 
    name: '墨轩', 
    gender: '男', 
    age: 25, 
    weight: 65, 
    height: 183, 
    distance: 3.8, 
    tags: ['文人墨客', '古典文学', '国画大师', '雅致品味'], 
    rate: 31, 
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=120&h=160&fit=crop', 
    online: true, 
    new: false, 
    bookable: false 
  },
  { 
    id: 6, 
    name: '梦瑶', 
    gender: '女', 
    age: 22, 
    weight: 46, 
    height: 163, 
    distance: 1.7, 
    tags: ['仙气飘飘', '古典美人', '古筝演奏', '诗意生活'], 
    rate: 45, 
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=120&h=160&fit=crop', 
    online: true, 
    new: true, 
    bookable: true 
  },
  { 
    id: 7, 
    name: '清婉', 
    gender: '女', 
    age: 24, 
    weight: 50, 
    height: 172, 
    distance: 4.6, 
    tags: ['清雅脱俗', '兰心蕙质', '花艺师', '香道传人'], 
    rate: 38, 
    avatar: 'https://images.pexels.com/photos/1391498/pexels-photo-1391498.jpeg?auto=compress&cs=tinysrgb&w=120&h=160&fit=crop', 
    online: false, 
    new: false, 
    bookable: true 
  },
  { 
    id: 8, 
    name: '凌风', 
    gender: '男', 
    age: 26, 
    weight: 72, 
    height: 185, 
    distance: 3.9, 
    tags: ['剑眉星目', '潇洒不羁', '太极高手', '古韵音乐'], 
    rate: 27, 
    avatar: 'https://images.pexels.com/photos/1559486/pexels-photo-1559486.jpeg?auto=compress&cs=tinysrgb&w=120&h=160&fit=crop', 
    online: true, 
    new: false, 
    bookable: true 
  },
  { 
    id: 9, 
    name: '雨荷', 
    gender: '女', 
    age: 20, 
    weight: 45, 
    height: 160, 
    distance: 2.2, 
    tags: ['莲花般纯净', '古典乐器', '水墨画', '禅茶一味'], 
    rate: 22, 
    avatar: 'https://images.pexels.com/photos/1462980/pexels-photo-1462980.jpeg?auto=compress&cs=tinysrgb&w=120&h=160&fit=crop', 
    online: false, 
    new: true, 
    bookable: true 
  },
  { 
    id: 10, 
    name: '玉轩', 
    gender: '男', 
    age: 25, 
    weight: 70, 
    height: 182, 
    distance: 5.1, 
    tags: ['温润如玉', '古典文化', '围棋国手', '品茶论道'], 
    rate: 33, 
    avatar: 'https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?auto=compress&cs=tinysrgb&w=120&h=160&fit=crop', 
    online: true, 
    new: false, 
    bookable: false 
  },
  { 
    id: 11, 
    name: '紫烟', 
    gender: '女', 
    age: 23, 
    weight: 47, 
    height: 165, 
    distance: 2.3, 
    tags: ['紫气东来', '古典舞蹈', '丝竹雅乐', '香道精通'], 
    rate: 39, 
    avatar: 'https://images.pexels.com/photos/1542085/pexels-photo-1542085.jpeg?auto=compress&cs=tinysrgb&w=120&h=160&fit=crop', 
    online: true, 
    new: false, 
    bookable: true 
  },
  { 
    id: 12, 
    name: '语嫣', 
    gender: '女', 
    age: 22, 
    weight: 45, 
    height: 168, 
    distance: 3.5, 
    tags: ['巧笑嫣然', '古典诗词', '汉服达人', '传统文化'], 
    rate: 35, 
    avatar: 'https://images.pexels.com/photos/1674752/pexels-photo-1674752.jpeg?auto=compress&cs=tinysrgb&w=120&h=160&fit=crop', 
    online: false, 
    new: true, 
    bookable: true 
  },
  { 
    id: 13, 
    name: '景行', 
    gender: '男', 
    age: 28, 
    weight: 75, 
    height: 186, 
    distance: 4.2, 
    tags: ['高山景行', '儒雅学者', '古典哲学', '琴瑟和鸣'], 
    rate: 40, 
    avatar: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=120&h=160&fit=crop', 
    online: true, 
    new: false, 
    bookable: true 
  },
  { 
    id: 14, 
    name: '芷若', 
    gender: '女', 
    age: 24, 
    weight: 46, 
    height: 163, 
    distance: 5.0, 
    tags: ['白芷若雪', '空谷幽兰', '古典美学', '琴棋书画'], 
    rate: 43, 
    avatar: 'https://images.pexels.com/photos/1832959/pexels-photo-1832959.jpeg?auto=compress&cs=tinysrgb&w=120&h=160&fit=crop', 
    online: true, 
    new: false, 
    bookable: true 
  },
  { 
    id: 15, 
    name: '君临', 
    gender: '男', 
    age: 27, 
    weight: 73, 
    height: 182, 
    distance: 3.7, 
    tags: ['君临天下', '王者风范', '国学底蕴', '武道精神'], 
    rate: 37, 
    avatar: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=120&h=160&fit=crop', 
    online: false, 
    new: false, 
    bookable: true 
  },
  { 
    id: 16, 
    name: '素锦', 
    gender: '女', 
    age: 21, 
    weight: 45, 
    height: 162, 
    distance: 1.9, 
    tags: ['素雅如锦', '古典气质', '传统手工', '诗意栖居'], 
    rate: 31, 
    avatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=120&h=160&fit=crop', 
    online: true, 
    new: true, 
    bookable: true 
  },
  { 
    id: 17, 
    name: '擎宇', 
    gender: '男', 
    age: 26, 
    weight: 72, 
    height: 183, 
    distance: 2.8, 
    tags: ['气宇轩昂', '文武双全', '传统文化', '正能量'], 
    rate: 45, 
    avatar: 'https://images.pexels.com/photos/1845331/pexels-photo-1845331.jpeg?auto=compress&cs=tinysrgb&w=120&h=160&fit=crop', 
    online: true, 
    new: false, 
    bookable: true 
  },
  { 
    id: 18, 
    name: '青柠', 
    gender: '女', 
    age: 25, 
    weight: 48, 
    height: 170, 
    distance: 4.1, 
    tags: ['青春柠檬', '活力四射', '古典与现代', '多才多艺'], 
    rate: 42, 
    avatar: 'https://images.pexels.com/photos/1300402/pexels-photo-1300402.jpeg?auto=compress&cs=tinysrgb&w=120&h=160&fit=crop', 
    online: false, 
    new: false, 
    bookable: true 
  },
  { 
    id: 19, 
    name: '皓月', 
    gender: '男', 
    age: 29, 
    weight: 78, 
    height: 188, 
    distance: 5.4, 
    tags: ['皓月当空', '风度翩翩', '古典文学', '高雅品味'], 
    rate: 39, 
    avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=120&h=160&fit=crop', 
    online: true, 
    new: false, 
    bookable: true 
  },
  { 
    id: 20, 
    name: '星颜', 
    gender: '女', 
    age: 20, 
    weight: 44, 
    height: 158, 
    distance: 2.0, 
    tags: ['星眸善睐', '俏皮可爱', '古风摄影', '甜美系'], 
    rate: 33, 
    avatar: 'https://images.pexels.com/photos/1845331/pexels-photo-1845331.jpeg?auto=compress&cs=tinysrgb&w=120&h=160&fit=crop', 
    online: true, 
    new: true, 
    bookable: true 
  },
  { 
    id: 21, 
    name: '逸尘', 
    gender: '男', 
    age: 27, 
    weight: 75, 
    height: 185, 
    distance: 3.2, 
    tags: ['超凡脱俗', '古典音律', '禅意生活', '品质男神'], 
    rate: 46, 
    avatar: 'https://images.pexels.com/photos/1124724/pexels-photo-1124724.jpeg?auto=compress&cs=tinysrgb&w=120&h=160&fit=crop', 
    online: true, 
    new: false, 
    bookable: true 
  },
  { 
    id: 22, 
    name: '落雪', 
    gender: '女', 
    age: 23, 
    weight: 47, 
    height: 167, 
    distance: 1.8, 
    tags: ['雪花飞舞', '冰清玉洁', '古典舞蹈', '传统文化'], 
    rate: 41, 
    avatar: 'https://images.pexels.com/photos/1821095/pexels-photo-1821095.jpeg?auto=compress&cs=tinysrgb&w=120&h=160&fit=crop', 
    online: false, 
    new: true, 
    bookable: true 
  },
  { 
    id: 23, 
    name: '云深', 
    gender: '男', 
    age: 24, 
    weight: 70, 
    height: 180, 
    distance: 4.5, 
    tags: ['云深不知处', '谦谦君子', '传统武术', '户外达人'], 
    rate: 38, 
    avatar: 'https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg?auto=compress&cs=tinysrgb&w=120&h=160&fit=crop', 
    online: true, 
    new: false, 
    bookable: true 
  },
  { 
    id: 24, 
    name: '梨花', 
    gender: '女', 
    age: 19, 
    weight: 43, 
    height: 159, 
    distance: 2.7, 
    tags: ['梨花带雨', '娇俏可人', '古典制茶', '手工艺人'], 
    rate: 44, 
    avatar: 'https://images.pexels.com/photos/1382734/pexels-photo-1382734.jpeg?auto=compress&cs=tinysrgb&w=120&h=160&fit=crop', 
    online: true, 
    new: true, 
    bookable: true 
  },
  { 
    id: 25, 
    name: '明轩', 
    gender: '男', 
    age: 30, 
    weight: 78, 
    height: 186, 
    distance: 6.1, 
    tags: ['明德惟馨', '成熟稳重', '传统建筑', '文化传承'], 
    rate: 48, 
    avatar: 'https://images.pexels.com/photos/1484794/pexels-photo-1484794.jpeg?auto=compress&cs=tinysrgb&w=120&h=160&fit=crop', 
    online: false, 
    new: false, 
    bookable: true 
  },
  { 
    id: 26, 
    name: '如意', 
    gender: '女', 
    age: 22, 
    weight: 46, 
    height: 164, 
    distance: 3.3, 
    tags: ['称心如意', '舞蹈精灵', '古典芭蕾', '柔美动人'], 
    rate: 39, 
    avatar: 'https://images.pexels.com/photos/1559486/pexels-photo-1559486.jpeg?auto=compress&cs=tinysrgb&w=120&h=160&fit=crop', 
    online: true, 
    new: false, 
    bookable: true 
  },
  { 
    id: 27, 
    name: '瑾瑜', 
    gender: '男', 
    age: 26, 
    weight: 73, 
    height: 184, 
    distance: 2.9, 
    tags: ['怀瑾握瑜', '技术达人', '传统工艺', '现代结合'], 
    rate: 36, 
    avatar: 'https://images.pexels.com/photos/1040882/pexels-photo-1040882.jpeg?auto=compress&cs=tinysrgb&w=120&h=160&fit=crop', 
    online: true, 
    new: false, 
    bookable: true 
  },
  { 
    id: 28, 
    name: '清泉', 
    gender: '女', 
    age: 21, 
    weight: 45, 
    height: 161, 
    distance: 2.4, 
    tags: ['清泉石上', '纯净美好', '游泳健将', '自然系女孩'], 
    rate: 34, 
    avatar: 'https://images.pexels.com/photos/1239288/pexels-photo-1239288.jpeg?auto=compress&cs=tinysrgb&w=120&h=160&fit=crop', 
    online: false, 
    new: true, 
    bookable: true 
  },
  { 
    id: 29, 
    name: '慕容', 
    gender: '男', 
    age: 29, 
    weight: 74, 
    height: 183, 
    distance: 5.5, 
    tags: ['慕容世家', '心理导师', '温暖治愈', '善解人意'], 
    rate: 47, 
    avatar: 'https://images.pexels.com/photos/1758144/pexels-photo-1758144.jpeg?auto=compress&cs=tinysrgb&w=120&h=160&fit=crop', 
    online: true, 
    new: false, 
    bookable: true 
  },
  { 
    id: 30, 
    name: '蝶舞', 
    gender: '女', 
    age: 24, 
    weight: 48, 
    height: 166, 
    distance: 1.5, 
    tags: ['蝶舞翩翩', '艺术创作', '手绘插画', '文艺女神'], 
    rate: 45, 
    avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=120&h=160&fit=crop', 
    online: true, 
    new: true, 
    bookable: true 
  },
  { 
    id: 31, 
    name: '沐风', 
    gender: '男', 
    age: 25, 
    weight: 71, 
    height: 181, 
    distance: 2.1, 
    tags: ['沐风而行', '户外达人', '摄影师', '阳光暖男'], 
    rate: 41, 
    avatar: 'https://images.pexels.com/photos/1542085/pexels-photo-1542085.jpeg?auto=compress&cs=tinysrgb&w=120&h=160&fit=crop', 
    online: true, 
    new: false, 
    bookable: true 
  },
  { 
    id: 32, 
    name: '听雨', 
    gender: '女', 
    age: 23, 
    weight: 47, 
    height: 165, 
    distance: 3.6, 
    tags: ['听雨观花', '文学爱好', '茶道师', '温柔如水'], 
    rate: 43, 
    avatar: 'https://images.pexels.com/photos/1674752/pexels-photo-1674752.jpeg?auto=compress&cs=tinysrgb&w=120&h=160&fit=crop', 
    online: false, 
    new: true, 
    bookable: true 
  },
  { 
    id: 33, 
    name: '星河', 
    gender: '男', 
    age: 27, 
    weight: 73, 
    height: 184, 
    distance: 4.8, 
    tags: ['星河璀璨', '天文爱好', '科技达人', '理性思维'], 
    rate: 39, 
    avatar: 'https://images.pexels.com/photos/1239288/pexels-photo-1239288.jpeg?auto=compress&cs=tinysrgb&w=120&h=160&fit=crop', 
    online: true, 
    new: false, 
    bookable: true 
  },
  { 
    id: 34, 
    name: '晚晴', 
    gender: '女', 
    age: 22, 
    weight: 46, 
    height: 163, 
    distance: 1.9, 
    tags: ['晚晴初现', '瑜伽导师', '健康生活', '内心平静'], 
    rate: 44, 
    avatar: 'https://images.pexels.com/photos/1758144/pexels-photo-1758144.jpeg?auto=compress&cs=tinysrgb&w=120&h=160&fit=crop', 
    online: true, 
    new: true, 
    bookable: true 
  },
  { 
    id: 35, 
    name: '青山', 
    gender: '男', 
    age: 28, 
    weight: 76, 
    height: 186, 
    distance: 5.7, 
    tags: ['青山如黛', '登山爱好', '健身教练', '积极向上'], 
    rate: 46, 
    avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=120&h=160&fit=crop', 
    online: false, 
    new: false, 
    bookable: true 
  },
  { 
    id: 36, 
    name: '柔情', 
    gender: '女', 
    age: 21, 
    weight: 45, 
    height: 160, 
    distance: 2.7, 
    tags: ['柔情似水', '甜美系', '烘焙达人', '温暖治愈'], 
    rate: 42, 
    avatar: 'https://images.pexels.com/photos/1391498/pexels-photo-1391498.jpeg?auto=compress&cs=tinysrgb&w=120&h=160&fit=crop', 
    online: true, 
    new: true, 
    bookable: true 
  },
  { 
    id: 37, 
    name: '墨染', 
    gender: '男', 
    age: 26, 
    weight: 72, 
    height: 182, 
    distance: 3.4, 
    tags: ['墨染青花', '书法家', '传统文化', '艺术气质'], 
    rate: 40, 
    avatar: 'https://images.pexels.com/photos/1484794/pexels-photo-1484794.jpeg?auto=compress&cs=tinysrgb&w=120&h=160&fit=crop', 
    online: true, 
    new: false, 
    bookable: true 
  },
  { 
    id: 38, 
    name: '采薇', 
    gender: '女', 
    age: 24, 
    weight: 48, 
    height: 167, 
    distance: 4.2, 
    tags: ['采薇山间', '自然系', '植物学家', '生活美学'], 
    rate: 37, 
    avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=120&h=160&fit=crop', 
    online: false, 
    new: false, 
    bookable: true 
  },
  { 
    id: 39, 
    name: '风华', 
    gender: '男', 
    age: 29, 
    weight: 74, 
    height: 185, 
    distance: 6.3, 
    tags: ['风华正茂', '商业精英', '成熟稳重', '品味非凡'], 
    rate: 48, 
    avatar: 'https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg?auto=compress&cs=tinysrgb&w=120&h=160&fit=crop', 
    online: true, 
    new: false, 
    bookable: true 
  },
  { 
    id: 40, 
    name: '初见', 
    gender: '女', 
    age: 20, 
    weight: 44, 
    height: 159, 
    distance: 1.6, 
    tags: ['初见倾心', '学生气质', '可爱萝莉', '青春活力'], 
    rate: 35, 
    avatar: 'https://images.pexels.com/photos/1858175/pexels-photo-1858175.jpeg?auto=compress&cs=tinysrgb&w=120&h=160&fit=crop', 
    online: true, 
    new: true, 
    bookable: true 
  }
])

// 处理标签显示
const processedPartnersList = computed(function() {
  return partnersList.value.map(function(partner) {
    const visibleTags = partner.tags.slice(0, 3)
    const extraTags = partner.tags.length > 3 ? partner.tags.length - 3 : 0
    return {
      ...partner,
      visibleTags,
      extraTags
    }
  })
})

// 获取弹窗标题
const getModalTitle = computed(function() {
  const titles = {
    gender: '选择性别',
    distance: '选择距离',
    sort: '排序方式'
  }
  return titles[activeModal.value] || ''
})

// 获取筛选选项
const getFilterOptions = computed(function() {
  const options = {
    gender: [
      { value: 'all', label: '不限' },
      { value: 'female', label: '女生', icon: '/static/icons/friend/female.png' },
      { value: 'male', label: '男生', icon: '/static/icons/friend/male.png' }
    ],
    distance: [
      { value: 'all', label: '不限距离' },
      { value: '1km', label: '1公里以内' },
      { value: '3km', label: '3公里以内' },
      { value: '5km', label: '5公里以内' },
      { value: '10km', label: '10公里以内' }
    ],
    sort: [
      { value: 'recommend', label: '推荐排序', icon: '/static/icons/friend/thumbs-up.png' },
      { value: 'distance', label: '距离最近', icon: '/static/icons/friend/location.png' },
      { value: 'rating', label: '评分最高', icon: '/static/icons/friend/star.png' },
      { value: 'new', label: '最新加入', icon: '/static/icons/friend/bolt.png' }
    ]
  }
  return options[activeModal.value] || []
})

// 判断选项是否被选中
const isOptionSelected = (value) => {
  const filters = {
    gender: genderFilter,
    distance: distanceFilter,
    sort: sortFilter
  }
  return filters[activeModal.value].value === value
}

// 选择选项
const selectOption = (value) => {
  const filters = {
    gender: genderFilter,
    distance: distanceFilter,
    sort: sortFilter
  }
  filters[activeModal.value].value = value
}

// 打开筛选弹窗
const openFilterModal = (modalType) => {
  activeModal.value = modalType
}

// 关闭筛选弹窗
const closeModal = () => {
  activeModal.value = ''
}

// 重置筛选
const resetFilter = () => {
  const filters = {
    gender: genderFilter,
    distance: distanceFilter,
    sort: sortFilter
  }
  filters[activeModal.value].value = 'all'
}

// 应用筛选
const applyFilter = () => {
  // 这里可以根据筛选条件过滤数据
  console.log('应用筛选:', {
    gender: genderFilter.value,
    distance: distanceFilter.value,
    sort: sortFilter.value
  })
  closeModal()
}

// 导航到通知页面
const navigateToNotifications = () => {
  uni.navigateTo({
    url: '/pages/notifications/index'
  })
}

// 导航到聊天页面
const navigateToChat = (partnerId) => {
  const partner = partnersList.value.find(p => p.id === partnerId)
  if (partner) {
    uni.navigateTo({
      url: `/pages/chat/index?id=${partnerId}&name=${partner.name}&avatar=${partner.avatar}`
    })
  }
}

// 导航到预约页面
const navigateToBooking = (partnerId) => {
  const partner = partnersList.value.find(p => p.id === partnerId)
  if (partner) {
    uni.navigateTo({
      url: `/pages/booking/index?id=${partnerId}&name=${partner.name}&avatar=${partner.avatar}`
    })
  }
}

// 导航到详情页
const navigateToDetail = (partnerId) => {
  uni.navigateTo({
    url: `/pages/partner/detail?id=${partnerId}`
  })
}

// 加载更多
const loadMore = () => {
  console.log('加载更多数据')
}

// 下拉刷新
const onRefresh = () => {
  isRefreshing.value = true
  setTimeout(() => {
    isRefreshing.value = false
  }, 1000)
}

onMounted(() => {
  // 获取状态栏高度
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight
})
</script>

<style lang="scss" scoped>
@import "@/styles/variables.scss";


.friends-container {
  height: 100vh;
  background-color: $bg-color-secondary;
  display: flex;
  flex-direction: column;
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
}

.header-top {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 20rpx;
  padding-right: 180rpx;
}

.city-selector {
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, rgba(130, 160, 216, 0.1) 0%, rgba(167, 188, 231, 0.06) 100%);
  border-radius: 32rpx;
  padding: 6rpx 12rpx;
  border: 1rpx solid rgba(130, 160, 216, 0.12);
  box-shadow: 0 2rpx 8rpx rgba(130, 160, 216, 0.08);
}

.location-icon {
  width: 32rpx;
  height: 32rpx;
  margin-right: 6rpx;
}

.city-select {
  display: flex;
  align-items: center;
  color: $text-color-primary;
  font-size: 24rpx;
  font-weight: 600;
}

.select-arrow {
  width: 24rpx;
  height: 24rpx;
  margin-left: 6rpx;
}

.search-container {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 16rpx;
  top: 50%;
  transform: translateY(-50%);
  width: 28rpx;
  height: 28rpx;
  opacity: 0.5;
}

.search-input {
  width: 100%;
  padding: 0rpx 16rpx 0rpx 48rpx;
  border: none;
  background: rgba(130, 160, 216, 0.08);
  border-radius: 32rpx;
  font-size: 24rpx;
  color: $text-color-primary;
  height: 64rpx;
  box-sizing: border-box;
  line-height: 64rpx;
  
  &::placeholder {
    color: rgba(130, 160, 216, 0.6);
    font-size: 24rpx;
  }
}

.notification-btn {
  position: relative;
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(130, 160, 216, 0.1);
  border-radius: 50%;
}

.notification-icon {
  width: 36rpx;
  height: 36rpx;
}

.notification-badge {
  position: absolute;
  top: 8rpx;
  right: 8rpx;
  width: 16rpx;
  height: 16rpx;
  background: $highlight-color;
  border-radius: 50%;
  border: 2rpx solid $bg-color-primary;
}

.partner-tabs {
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin-bottom: 20rpx;
  padding: 0 20rpx;
}

.partner-tab {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding: 16rpx 24rpx;
  font-size: 26rpx;
  color: $text-color-secondary;
  position: relative;
  flex: 1;
  
  &.active {
    color: $primary-color;
    font-weight: 600;
    
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 40rpx;
      height: 4rpx;
      background: linear-gradient(90deg, $primary-color 0%, $highlight-color 100%);
      border-radius: 2rpx;
    }
  }
}

.tab-icon {
  width: 32rpx;
  height: 32rpx;
}

.partner-filters {
  display: flex;
  justify-content: space-around;
  padding: 16rpx 0;
  border-top: 1rpx solid rgba(130, 160, 216, 0.1);
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 24rpx;
  color: $text-color-secondary;
}

.filter-icon {
  width: 28rpx;
  height: 28rpx;
}

.filter-arrow {
  width: 24rpx;
  height: 24rpx;
}
.main-content {
		flex: 1;
		display: flex;
		overflow: hidden;
		box-sizing: border-box;

	}
.partner-list {
 

  box-sizing: border-box;
}

.partner-card {
  display: flex;
  padding: 24rpx;
  background: $bg-color-primary;
  border-radius: 24rpx;
 
  box-sizing: border-box;
  box-shadow: 0 4rpx 16rpx rgba(130, 160, 216, 0.08);

  margin: 20rpx;
}

.avatar-wrapper {
  position: relative;
  margin-right: 24rpx;
}

.avatar {
  width: 160rpx;
  height: 200rpx;
  border-radius: 16rpx;
}

.status-dot {
  position: absolute;
  right: 8rpx;
  bottom: 8rpx;
  width: 16rpx;
  height: 16rpx;
  background: $success-color;
  border: 2rpx solid $bg-color-primary;
  border-radius: 50%;
}

.badge {
  position: absolute;
  top: 8rpx;
  left: 8rpx;
  padding: 4rpx 12rpx;
  border-radius: 16rpx;
  font-size: 20rpx;
  color: $bg-color-primary;
  
  &.new {
    background: linear-gradient(90deg, $highlight-color 0%, #FF8A65 100%);
  }
}

.partner-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.partner-name-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8rpx;
}

.partner-name {
  font-size: 32rpx;
  font-weight: 600;
  color: $text-color-primary;
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.gender {
  width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  
  
}

.gender-icon {
  width: 36rpx;
  height: 36rpx;
}

.partner-rate {
  display: flex;
  align-items: center;
  gap: 4rpx;
  color: $warning-color;
  font-size: 24rpx;
}

.rate-icon {
  width: 24rpx;
  height: 24rpx;
}

.partner-meta {
  font-size: 24rpx;
  color: $text-color-secondary;
  margin-bottom: 12rpx;
}

.partner-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  margin-bottom: 16rpx;
}

.tag {
  padding: 4rpx 12rpx;
  background: rgba(108, 117, 125, 0.08);
  border-radius: 16rpx;
  font-size: 22rpx;
  color: #495057;
}

.more-tags {
  font-size: 22rpx;
  color: $text-color-secondary;
}

.partner-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.message-btn, .schedule-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 24rpx;
  font-size: 22rpx;
  font-weight: 500;
  box-sizing: border-box;
  transition: all 0.2s ease;
  
  &:active {
    transform: scale(0.96);
  }
}

.message-btn {
  width: 48rpx;
  height: 48rpx;
  background: transparent;
  border: none;
  border-radius: 50%;
  
  &:active {
    transform: scale(0.9);
  }
}

.chat-icon {
  width: 48rpx;
  height: 48rpx;
}

.schedule-btn {
  padding: 12rpx 20rpx;
  background: linear-gradient(135deg, #7363FF 0%, #667eea 50%, #FF69DE 100%);
  color: #ffffff;
  font-weight: 600;
  box-shadow: 0 4rpx 12rpx rgba(115, 99, 255, 0.3);
  border-radius: 99999rpx;
  position: relative;
  overflow: hidden;
  gap: 6rpx;
  min-height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:active {
    transform: translateY(1rpx);
    box-shadow: 0 2rpx 8rpx rgba(115, 99, 255, 0.4);
  }
  
  &::before {
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
  
  &:active::before {
    left: 100%;
  }
  
  &::after {
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
}

@keyframes inviteGlow {
  0% { opacity: 0.3; transform: translate(-50%, -50%) scale(0.8); }
  100% { opacity: 0.6; transform: translate(-50%, -50%) scale(1.1); }
}

.action-icon {
  width: 20rpx;
  height: 20rpx;
  margin-right: 6rpx;
}

.filter-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8rpx);
  -webkit-backdrop-filter: blur(8rpx);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
}

.modal-content {
  width: 100%;
  background: $bg-color-primary;
  border-radius: 32rpx 32rpx 0 0;
  overflow: hidden;
  animation: slideUp 0.3s ease-out;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx;
  border-bottom: 1rpx solid rgba(130, 160, 216, 0.1);
}

.modal-title {
  font-size: 32rpx;
  font-weight: 600;
  color: $text-color-primary;
}

.close-btn {
  padding: 8rpx;
}

.close-icon {
  width: 32rpx;
  height: 32rpx;
}

.modal-body {
  padding: 24rpx 32rpx;
  max-height: 60vh;
  overflow-y: auto;
}

.filter-option {
  display: flex;
  align-items: center;
  padding: 24rpx 0;
  gap: 16rpx;
  
  &.selected {
    background: rgba(130, 160, 216, 0.05);
  }
}

.option-icon {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(130, 160, 216, 0.1);
}

.option-icon-img {
  width: 28rpx;
  height: 28rpx;
}

.option-label {
  flex: 1;
  font-size: 28rpx;
  color: $text-color-primary;
}

.check-icon {
  width: 32rpx;
  height: 32rpx;
}

.modal-footer {
  display: flex;
  gap: 24rpx;
  padding: 24rpx 32rpx;
  border-top: 1rpx solid rgba(130, 160, 216, 0.1);
}

.reset-btn, .apply-btn {
  flex: 1;
  height: 80rpx;
  border-radius: 40rpx;
  font-size: 28rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.reset-btn {
  background: rgba(130, 160, 216, 0.1);
  color: $text-color-secondary;
}

.apply-btn {
  background: linear-gradient(135deg, $primary-color 0%, $highlight-color 100%);
  color: $bg-color-primary;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}
</style> 