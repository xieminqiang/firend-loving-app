"use strict";
const common_vendor = require("../../../common/vendor.js");
const common_assets = require("../../../common/assets.js");
const utils_location = require("../../../utils/location.js");
const api_user = require("../../../api/user.js");
const api_order = require("../../../api/order.js");
const utils_address = require("../../../utils/address.js");
if (!Math) {
  VideoUploadModal();
}
const VideoUploadModal = () => "./VideoUploadModal.js";
const _sfc_main = {
  __name: "Workbench",
  props: {
    applicationInfo: {
      type: Object,
      default: null
    }
  },
  setup(__props) {
    const props = __props;
    const isOnline = common_vendor.ref(false);
    const currentLocation = common_vendor.ref("");
    const locationUpdateTime = common_vendor.ref("");
    const isInitialized = common_vendor.ref(false);
    const isUpdatingStatus = common_vendor.ref(false);
    const showVideoUploadModal = common_vendor.ref(false);
    const scheduleData = common_vendor.ref([]);
    const scheduleLoading = common_vendor.ref(false);
    const recentOrders = common_vendor.ref([]);
    const recentOrdersLoading = common_vendor.ref(false);
    const isRefreshing = common_vendor.ref(false);
    const hasValidApplicationInfo = common_vendor.computed(() => {
      return props.applicationInfo && typeof props.applicationInfo === "object";
    });
    const getTodayScheduleData = () => {
      if (!scheduleData.value || scheduleData.value.length === 0) {
        return null;
      }
      const todayData = scheduleData.value.find((item) => item.is_today === true);
      return todayData;
    };
    const getTodayAvailableSlots = () => {
      const todayData = getTodayScheduleData();
      if (!todayData || !todayData.schedule) {
        return 0;
      }
      return Object.values(todayData.schedule).filter((status) => status === 1).length;
    };
    const getTodayBookedSlots = () => {
      const todayData = getTodayScheduleData();
      if (!todayData || !todayData.schedule) {
        return 0;
      }
      return Object.values(todayData.schedule).filter((status) => status === 3).length;
    };
    const currentScheduleStatus = common_vendor.computed(() => {
      if (scheduleLoading.value) {
        return "加载中...";
      }
      const todayData = getTodayScheduleData();
      if (!todayData) {
        return "未设置";
      }
      const availableCount = getTodayAvailableSlots();
      const bookedCount = getTodayBookedSlots();
      if (bookedCount > 0) {
        return `${bookedCount}个已约`;
      } else if (availableCount === 48) {
        return "全天可约";
      } else if (availableCount === 0) {
        return "全天休息";
      } else {
        return `${availableCount}个可约`;
      }
    });
    const todaySchedule = common_vendor.computed(() => {
      if (scheduleLoading.value) {
        return "正在加载今日安排...";
      }
      const todayData = getTodayScheduleData();
      if (!todayData) {
        return "今日未设置时间安排";
      }
      const availableCount = getTodayAvailableSlots();
      const bookedCount = getTodayBookedSlots();
      if (bookedCount > 0) {
        return `今日有${bookedCount}个时间点已被预约`;
      } else if (availableCount === 48) {
        return "今日全天可接单";
      } else if (availableCount === 0) {
        return "今日休息，暂停接单";
      } else {
        return `今日可接单 ${availableCount}个时间点`;
      }
    });
    const initOnlineStatus = () => {
      if (hasValidApplicationInfo.value && typeof props.applicationInfo.is_online !== "undefined") {
        isOnline.value = props.applicationInfo.is_online === 1;
        common_vendor.index.__f__("log", "at subPackages/partner/components/Workbench.vue:321", "从applicationInfo获取在线状态:", isOnline.value, "原始值:", props.applicationInfo.is_online);
      } else {
        isOnline.value = false;
        common_vendor.index.__f__("log", "at subPackages/partner/components/Workbench.vue:324", "使用默认在线状态: 下线");
      }
    };
    const initializeComponent = async () => {
      if (isInitialized.value) {
        common_vendor.index.__f__("log", "at subPackages/partner/components/Workbench.vue:331", "组件已经初始化过，跳过重复初始化");
        return;
      }
      common_vendor.index.__f__("log", "at subPackages/partner/components/Workbench.vue:335", "开始初始化Workbench组件");
      await common_vendor.nextTick$1();
      initOnlineStatus();
      getLocationInfo();
      await fetchScheduleData();
      await fetchRecentOrders();
      isInitialized.value = true;
      common_vendor.index.__f__("log", "at subPackages/partner/components/Workbench.vue:353", "Workbench组件初始化完成");
    };
    common_vendor.watch(() => props.applicationInfo, (newVal, oldVal) => {
      common_vendor.index.__f__("log", "at subPackages/partner/components/Workbench.vue:358", "applicationInfo发生变化:", { old: oldVal, new: newVal });
      if (newVal && hasValidApplicationInfo.value) {
        if (isInitialized.value) {
          common_vendor.index.__f__("log", "at subPackages/partner/components/Workbench.vue:363", "组件已初始化，更新在线状态、日期安排数据和最近订单数据");
          initOnlineStatus();
          fetchScheduleData();
          fetchRecentOrders();
        } else {
          initializeComponent();
        }
      }
    }, { immediate: true, deep: true });
    const toggleStatus = async () => {
      if (isUpdatingStatus.value) {
        common_vendor.index.__f__("log", "at subPackages/partner/components/Workbench.vue:377", "正在更新状态，忽略重复点击");
        return;
      }
      const newStatus = !isOnline.value;
      const statusText = newStatus ? "上线" : "下线";
      if (newStatus && hasValidApplicationInfo.value && props.applicationInfo.can_accept_orders === "N") {
        if (!props.applicationInfo.intro_video_url || props.applicationInfo.video_review_status !== "approved") {
          showVideoUploadModal.value = true;
          return;
        }
      }
      common_vendor.index.showModal({
        title: `确认${statusText}`,
        content: newStatus ? "上线后将开始接收订单，确认上线吗？" : "下线后将停止接收订单，确认下线吗？",
        success: async (res) => {
          if (res.confirm) {
            await updateOnlineStatus(newStatus);
          }
        }
      });
    };
    const updateOnlineStatus = async (newStatus) => {
      var _a;
      isUpdatingStatus.value = true;
      try {
        let locationInfo = null;
        if (newStatus) {
          common_vendor.index.showLoading({ title: "获取位置中..." });
          try {
            locationInfo = await utils_location.getCurrentLocationAddress(false);
            common_vendor.index.__f__("log", "at subPackages/partner/components/Workbench.vue:419", "获取位置成功:", locationInfo);
          } catch (error) {
            common_vendor.index.__f__("error", "at subPackages/partner/components/Workbench.vue:421", "获取位置失败:", error);
            common_vendor.index.hideLoading();
            common_vendor.index.showToast({
              title: "获取位置失败，无法上线",
              icon: "none"
            });
            return;
          }
        } else {
          const cacheStatus = utils_location.getCacheStatus();
          if (cacheStatus.hasCache) {
            locationInfo = {
              latitude: cacheStatus.coordinates.latitude,
              longitude: cacheStatus.coordinates.longitude,
              address: cacheStatus.address
            };
          }
        }
        const processedAddress = utils_address.processAddress(locationInfo ? locationInfo.address : "");
        const requestData = {
          is_online: newStatus ? 1 : 0,
          latitude: locationInfo ? locationInfo.latitude : null,
          longitude: locationInfo ? locationInfo.longitude : null,
          location_text: processedAddress
        };
        common_vendor.index.__f__("log", "at subPackages/partner/components/Workbench.vue:453", "准备更新在线状态:", requestData);
        const response = await api_user.updateCompanionOnlineStatus(requestData);
        common_vendor.index.__f__("log", "at subPackages/partner/components/Workbench.vue:458", "在线", response);
        if (response.data && response.data.code === 0) {
          isOnline.value = newStatus;
          if (locationInfo) {
            currentLocation.value = locationInfo.address;
            locationUpdateTime.value = (/* @__PURE__ */ new Date()).toLocaleTimeString();
          }
          common_vendor.index.hideLoading();
          common_vendor.index.showToast({
            title: newStatus ? "已上线，开始接单" : "已下线，暂停接单",
            icon: "none"
          });
          common_vendor.index.__f__("log", "at subPackages/partner/components/Workbench.vue:475", "在线状态更新成功:", response.data);
        } else {
          common_vendor.index.hideLoading();
          common_vendor.index.showToast({
            title: ((_a = response.data) == null ? void 0 : _a.msg) || "状态更新失败",
            icon: "none"
          });
          common_vendor.index.__f__("error", "at subPackages/partner/components/Workbench.vue:483", "在线状态更新失败:", response.data);
        }
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: "网络错误，请重试",
          icon: "none"
        });
        common_vendor.index.__f__("error", "at subPackages/partner/components/Workbench.vue:491", "更新在线状态失败:", error);
      } finally {
        isUpdatingStatus.value = false;
      }
    };
    const getLocationInfo = () => {
      const cacheStatus = utils_location.getCacheStatus();
      if (cacheStatus.hasCache && cacheStatus.isValid) {
        currentLocation.value = cacheStatus.address;
        locationUpdateTime.value = new Date(cacheStatus.timestamp).toLocaleTimeString();
        common_vendor.index.__f__("log", "at subPackages/partner/components/Workbench.vue:505", "使用缓存位置信息:", cacheStatus.address);
        common_vendor.index.__f__("log", "at subPackages/partner/components/Workbench.vue:506", "使用缓存:", cacheStatus);
        updateLocationToServer(cacheStatus.coordinates.latitude, cacheStatus.coordinates.longitude, cacheStatus.address);
        return;
      }
      utils_location.getCurrentLocationAddress(false).then((locationInfo) => {
        currentLocation.value = locationInfo.address;
        locationUpdateTime.value = (/* @__PURE__ */ new Date()).toLocaleTimeString();
        common_vendor.index.__f__("log", "at subPackages/partner/components/Workbench.vue:516", "获取位置成功", locationInfo);
        updateLocationToServer(locationInfo.latitude, locationInfo.longitude, locationInfo.address);
      }).catch((err) => {
        common_vendor.index.__f__("error", "at subPackages/partner/components/Workbench.vue:522", "获取位置失败:", err);
        currentLocation.value = "位置获取失败";
        locationUpdateTime.value = "获取失败";
      });
    };
    const refreshLocation = () => {
      common_vendor.index.showLoading({
        title: "更新位置中"
      });
      utils_location.getCurrentLocationAddress(false).then((locationInfo) => {
        currentLocation.value = locationInfo.address;
        locationUpdateTime.value = (/* @__PURE__ */ new Date()).toLocaleTimeString();
        common_vendor.index.__f__("log", "at subPackages/partner/components/Workbench.vue:540", "位置更新成功", locationInfo);
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: "位置更新成功",
          icon: "none"
        });
        updateLocationToServer(locationInfo.latitude, locationInfo.longitude, locationInfo.address);
      }).catch((err) => {
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: "获取位置失败",
          icon: "none"
        });
        common_vendor.index.__f__("error", "at subPackages/partner/components/Workbench.vue:558", "获取位置失败:", err);
      });
    };
    const updateLocationToServer = async (latitude, longitude, address) => {
      var _a;
      try {
        const processedAddress = utils_address.processAddress(address);
        const requestData = {
          is_online: isOnline.value ? 1 : 0,
          latitude,
          longitude,
          location_text: processedAddress
        };
        common_vendor.index.__f__("log", "at subPackages/partner/components/Workbench.vue:576", "准备更新位置信息到服务器:", requestData);
        common_vendor.index.__f__("log", "at subPackages/partner/components/Workbench.vue:577", "位置描述分析:", utils_address.analyzeAddress(address));
        const response = await api_user.updateCompanionOnlineStatus(requestData);
        if (response.data && response.data.code === 0) {
          common_vendor.index.__f__("log", "at subPackages/partner/components/Workbench.vue:582", "位置信息更新成功:", response.data);
        } else {
          common_vendor.index.__f__("error", "at subPackages/partner/components/Workbench.vue:584", "位置信息更新失败:", (_a = response.data) == null ? void 0 : _a.msg);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at subPackages/partner/components/Workbench.vue:587", "位置信息更新API调用失败:", error);
      }
    };
    const selectLocation = () => {
      common_vendor.index.chooseLocation({
        success: async (res) => {
          const address = res.address || res.name || "已选择位置";
          common_vendor.index.__f__("log", "at subPackages/partner/components/Workbench.vue:597", "手动选择位置", res);
          currentLocation.value = address;
          locationUpdateTime.value = (/* @__PURE__ */ new Date()).toLocaleTimeString();
          await updateLocationToServer(res.latitude, res.longitude, address);
        },
        fail: (err) => {
          if (err.errMsg && err.errMsg.indexOf("cancel") === -1) {
            common_vendor.index.showToast({
              title: "获取位置失败",
              icon: "none"
            });
            common_vendor.index.__f__("error", "at subPackages/partner/components/Workbench.vue:612", "获取位置失败:", err.errMsg);
          }
        }
      });
    };
    const viewAllOrders = () => {
      if (!props.applicationInfo || !props.applicationInfo.id) {
        common_vendor.index.showToast({
          title: "用户信息不完整",
          icon: "none"
        });
        return;
      }
      common_vendor.index.navigateTo({
        url: `/subPackages/partner/order/index?companion_id=${props.applicationInfo.id}`
      });
    };
    const navigateToOrderDetail = (orderId) => {
      common_vendor.index.navigateTo({
        url: `/subPackages/partner/order/detail?orderId=${orderId}`
      });
    };
    const getOrderActions = (status) => {
      const actionMap = {
        2: [
          // 已支付待确认
          { text: "拒绝", action: "reject", type: "secondary" },
          { text: "接单", action: "accept", type: "primary" }
        ],
        3: [
          // 已确认待到达
          { text: "电话联系", action: "contact", type: "secondary" },
          { text: "我已到达服务地点", action: "arrived", type: "primary" }
        ],
        4: [
          // 已到达待开始
          { text: "电话联系", action: "call", type: "secondary" }
        ],
        5: [
          // 服务中
          { text: "电话联系", action: "contact", type: "secondary" },
          { text: "结束服务", action: "end", type: "primary" }
        ]
      };
      return actionMap[status] || [];
    };
    const handleOrderAction = (action, order) => {
      switch (action) {
        case "contact":
          handleContactCustomer(order);
          break;
        case "accept":
          handleAcceptOrder(order);
          break;
        case "reject":
          handleRejectOrder(order);
          break;
        case "arrived":
          handleArrived(order);
          break;
        case "call":
          handleCallCustomer(order);
          break;
        case "end":
          handleEndService(order);
          break;
      }
    };
    const handleContactCustomer = (order) => {
      if (order.user && order.user.phone) {
        common_vendor.index.showModal({
          title: "电话联系",
          content: `是否拨打客户 ${order.user.nick_name} 的电话？`,
          confirmText: "拨打",
          cancelText: "取消",
          success: (res) => {
            if (res.confirm) {
              common_vendor.index.makePhoneCall({
                phoneNumber: order.user.phone
              });
            }
          }
        });
      }
    };
    const handleAcceptOrder = (order) => {
      common_vendor.index.showModal({
        title: "确认接单",
        content: "确定要接受这个订单吗？",
        confirmText: "接单",
        cancelText: "取消",
        success: async (res) => {
          if (res.confirm) {
            try {
              common_vendor.index.showLoading({
                title: "处理中..."
              });
              const response = await api_order.acceptCompanionOrder({
                order_id: order.id,
                companion_id: Number(props.applicationInfo.id)
              });
              if (response.data.code === 0) {
                common_vendor.index.showToast({
                  title: "接单成功",
                  icon: "success"
                });
                await fetchRecentOrders();
              } else {
                throw new Error(response.data.msg || "接单失败");
              }
            } catch (error) {
              common_vendor.index.__f__("error", "at subPackages/partner/components/Workbench.vue:744", "接单失败:", error);
              common_vendor.index.showToast({
                title: error.message || "接单失败",
                icon: "none"
              });
            } finally {
              common_vendor.index.hideLoading();
            }
          }
        }
      });
    };
    const handleRejectOrder = (order) => {
      common_vendor.index.showModal({
        title: "拒绝订单",
        content: "确定要拒绝这个订单吗？",
        confirmText: "拒绝",
        cancelText: "取消",
        success: async (res) => {
          if (res.confirm) {
            try {
              common_vendor.index.showLoading({
                title: "处理中..."
              });
              const response = await api_order.rejectCompanionOrder({
                order_id: order.id,
                companion_id: Number(props.applicationInfo.id)
              });
              if (response.data.code === 0) {
                common_vendor.index.showToast({
                  title: "已拒绝订单",
                  icon: "success"
                });
                await fetchRecentOrders();
              } else {
                throw new Error(response.data.msg || "拒绝订单失败");
              }
            } catch (error) {
              common_vendor.index.__f__("error", "at subPackages/partner/components/Workbench.vue:788", "拒绝订单失败:", error);
              common_vendor.index.showToast({
                title: error.message || "操作失败",
                icon: "none"
              });
            } finally {
              common_vendor.index.hideLoading();
            }
          }
        }
      });
    };
    const handleArrived = (order) => {
      common_vendor.index.showModal({
        title: "确认到达",
        content: "确认您已到达服务地点？",
        confirmText: "确认",
        cancelText: "取消",
        success: async (res) => {
          if (res.confirm) {
            try {
              common_vendor.index.showLoading({
                title: "更新中..."
              });
              const response = await api_order.arrivedCompanionOrder({
                order_id: order.id,
                companion_id: Number(props.applicationInfo.id)
              });
              if (response.data.code === 0) {
                common_vendor.index.showToast({
                  title: "已确认到达",
                  icon: "success"
                });
                await fetchRecentOrders();
              } else {
                throw new Error(response.data.msg || "确认到达失败");
              }
            } catch (error) {
              common_vendor.index.__f__("error", "at subPackages/partner/components/Workbench.vue:832", "确认到达失败:", error);
              common_vendor.index.showToast({
                title: error.message || "操作失败",
                icon: "none"
              });
            } finally {
              common_vendor.index.hideLoading();
            }
          }
        }
      });
    };
    const handleCallCustomer = (order) => {
      if (order.user && order.user.phone) {
        common_vendor.index.showModal({
          title: "电话联系",
          content: `是否拨打客户 ${order.user.nick_name} 的电话？`,
          confirmText: "拨打",
          cancelText: "取消",
          success: (res) => {
            if (res.confirm) {
              common_vendor.index.makePhoneCall({
                phoneNumber: order.user.phone
              });
            }
          }
        });
      }
    };
    const handleEndService = (order) => {
      common_vendor.index.showModal({
        title: "结束服务",
        content: "确定要结束服务吗？",
        confirmText: "结束",
        cancelText: "取消",
        success: async (res) => {
          if (res.confirm) {
            try {
              common_vendor.index.showLoading({
                title: "更新中..."
              });
              const response = await api_order.endCompanionService({
                order_id: order.id,
                companion_id: Number(props.applicationInfo.id)
              });
              if (response.data.code === 0) {
                common_vendor.index.showToast({
                  title: "服务已结束",
                  icon: "success"
                });
                await fetchRecentOrders();
              } else {
                throw new Error(response.data.msg || "结束服务失败");
              }
            } catch (error) {
              common_vendor.index.__f__("error", "at subPackages/partner/components/Workbench.vue:895", "结束服务失败:", error);
              common_vendor.index.showToast({
                title: error.message || "操作失败",
                icon: "none"
              });
            } finally {
              common_vendor.index.hideLoading();
            }
          }
        }
      });
    };
    const hideVideoUploadModal = () => {
      showVideoUploadModal.value = false;
    };
    const handleVideoUploadSuccess = (data) => {
      common_vendor.index.__f__("log", "at subPackages/partner/components/Workbench.vue:915", "视频上传成功:", data);
      common_vendor.index.$emit("applicationStatusChanged", data);
    };
    const fetchScheduleData = async () => {
      var _a;
      if (!hasValidApplicationInfo.value || !props.applicationInfo.id) {
        common_vendor.index.__f__("log", "at subPackages/partner/components/Workbench.vue:923", "applicationInfo不完整，跳过获取日期安排数据");
        return;
      }
      try {
        common_vendor.index.__f__("log", "at subPackages/partner/components/Workbench.vue:930", "开始获取日期安排数据，companion_id:", props.applicationInfo.id);
        const requestData = {
          companion_id: props.applicationInfo.id
        };
        const response = await api_user.getCompanionSchedule(requestData);
        common_vendor.index.__f__("log", "at subPackages/partner/components/Workbench.vue:937", "日期安排数据获取成功:", response);
        if (response.data && response.data.code === 0) {
          scheduleData.value = response.data.data;
          common_vendor.index.__f__("log", "at subPackages/partner/components/Workbench.vue:941", "解析后的日期安排数据:", scheduleData.value);
        } else {
          common_vendor.index.__f__("error", "at subPackages/partner/components/Workbench.vue:943", "获取日期安排数据失败:", (_a = response.data) == null ? void 0 : _a.msg);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at subPackages/partner/components/Workbench.vue:946", "获取日期安排数据接口调用失败:", error);
      } finally {
        scheduleLoading.value = false;
      }
    };
    const fetchRecentOrders = async () => {
      var _a;
      if (!hasValidApplicationInfo.value || !props.applicationInfo.id) {
        common_vendor.index.__f__("log", "at subPackages/partner/components/Workbench.vue:955", "applicationInfo不完整，跳过获取最近订单数据");
        return;
      }
      try {
        common_vendor.index.__f__("log", "at subPackages/partner/components/Workbench.vue:961", "开始获取最近订单数据，companion_id:", props.applicationInfo.id);
        const requestData = {
          companion_id: Number(props.applicationInfo.id),
          page: 1,
          // 只获取第一页
          page_size: 10
          // 获取10条
        };
        const response = await api_order.getCompanionActiveOrders(requestData);
        common_vendor.index.__f__("log", "at subPackages/partner/components/Workbench.vue:968", "最近订单数据获取成功:", response);
        if (response.data && response.data.code === 0) {
          recentOrders.value = response.data.data.list;
          common_vendor.index.__f__("log", "at subPackages/partner/components/Workbench.vue:971", "解析后的最近订单数据:", recentOrders.value);
        } else {
          common_vendor.index.__f__("error", "at subPackages/partner/components/Workbench.vue:973", "获取最近订单数据失败:", (_a = response.data) == null ? void 0 : _a.msg);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at subPackages/partner/components/Workbench.vue:976", "获取最近订单数据接口调用失败:", error);
      } finally {
        recentOrdersLoading.value = false;
      }
    };
    const goToDataSelect = () => {
      if (!props.applicationInfo || !props.applicationInfo.id) {
        common_vendor.index.showToast({
          title: "用户信息不完整",
          icon: "none"
        });
        return;
      }
      common_vendor.index.navigateTo({
        url: `/subPackages/partner/components/DataSelect?companion_id=${props.applicationInfo.id}`
      });
    };
    const refreshScheduleData = async () => {
      await fetchScheduleData();
    };
    const onRefresh = async () => {
      if (isRefreshing.value)
        return;
      isRefreshing.value = true;
      try {
        await Promise.all([
          fetchScheduleData(),
          fetchRecentOrders()
        ]);
        await new Promise((resolve) => setTimeout(resolve, 800));
      } catch (error) {
        common_vendor.index.__f__("error", "at subPackages/partner/components/Workbench.vue:1019", "刷新失败:", error);
      } finally {
        isRefreshing.value = false;
      }
    };
    const onRefreshRestore = () => {
      isRefreshing.value = false;
    };
    const getOrderStatusText = (status) => {
      const statusMap = {
        2: "等待接单",
        3: "我已出发",
        4: "已到达，等待开始服务",
        5: "服务中"
      };
      return statusMap[status] || "未知状态";
    };
    const getOrderStatusClass = (status) => {
      const statusMap = {
        2: "status-pending",
        3: "status-departing",
        4: "status-arrived",
        5: "status-serving"
      };
      return statusMap[status] || "status-default";
    };
    const formatOrderTime = (timeStr) => {
      if (!timeStr)
        return "";
      const date = new Date(timeStr);
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${month}-${day} ${hours}:${minutes}`;
    };
    const formatServiceDateTime = (serviceDate, serviceTime) => {
      if (!serviceDate && !serviceTime)
        return "待确认";
      let result = "";
      if (serviceDate) {
        const date = new Date(serviceDate);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const weekday = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"][date.getDay()];
        result += `${year}-${month}-${day} ${weekday}`;
      }
      if (serviceTime) {
        if (result) {
          result += " ";
        }
        result += serviceTime;
      }
      return result || "待确认";
    };
    common_vendor.onMounted(() => {
      common_vendor.index.__f__("log", "at subPackages/partner/components/Workbench.vue:1097", "Workbench组件mounted，applicationInfo状态:", {
        hasApplicationInfo: !!props.applicationInfo,
        applicationInfo: props.applicationInfo
      });
      if (hasValidApplicationInfo.value) {
        initializeComponent();
      } else {
        common_vendor.index.__f__("log", "at subPackages/partner/components/Workbench.vue:1106", "applicationInfo还未准备好，等待watch触发初始化");
      }
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: __props.applicationInfo && __props.applicationInfo.avatar
      }, __props.applicationInfo && __props.applicationInfo.avatar ? {
        b: __props.applicationInfo.avatar
      } : {}, {
        c: isOnline.value ? 1 : "",
        d: common_vendor.t(isOnline.value ? "已上线" : "已下线"),
        e: common_vendor.t(isOnline.value ? "正在接单中" : "暂停接单"),
        f: common_vendor.t(isOnline.value ? "下线休息" : "开始上线"),
        g: isOnline.value ? 1 : "",
        h: common_vendor.o(toggleStatus),
        i: isOnline.value ? 1 : "",
        j: common_assets._imports_0$9,
        k: common_vendor.o(refreshLocation),
        l: common_assets._imports_1$9,
        m: common_vendor.o(selectLocation),
        n: common_vendor.t(currentLocation.value || "正在获取位置..."),
        o: common_assets._imports_2$6,
        p: common_vendor.t(currentScheduleStatus.value),
        q: scheduleLoading.value ? 1 : "",
        r: common_vendor.t(todaySchedule.value),
        s: common_vendor.t(scheduleLoading.value ? "刷新中..." : "刷新"),
        t: common_vendor.o(refreshScheduleData),
        v: common_vendor.o(goToDataSelect),
        w: common_vendor.o(viewAllOrders),
        x: recentOrdersLoading.value
      }, recentOrdersLoading.value ? {} : recentOrders.value.length === 0 ? {
        z: common_assets._imports_3
      } : {
        A: common_vendor.f(recentOrders.value, (order, k0, i0) => {
          var _a, _b;
          return common_vendor.e({
            a: common_vendor.t(formatOrderTime(order.created_at)),
            b: common_vendor.t(getOrderStatusText(order.status)),
            c: common_vendor.n(getOrderStatusClass(order.status)),
            d: _ctx.$imgBaseUrl + order.service_image_url,
            e: common_vendor.t(order.service_name),
            f: common_vendor.t(order.unit_price),
            g: common_vendor.t(order.unit),
            h: common_vendor.t(order.quantity),
            i: common_vendor.t(order.total_amount),
            j: [2, 3, 4, 5].includes(order.status)
          }, [2, 3, 4, 5].includes(order.status) ? common_vendor.e({
            k: order.status != 2 && order.user
          }, order.status != 2 && order.user ? {
            l: common_vendor.t((_a = order == null ? void 0 : order.user) == null ? void 0 : _a.nick_name),
            m: common_vendor.t((_b = order == null ? void 0 : order.user) == null ? void 0 : _b.phone)
          } : {}, {
            n: common_vendor.t(order.service_address),
            o: common_vendor.t(formatServiceDateTime(order.service_date, order.service_time))
          }) : {}, {
            p: common_vendor.f(getOrderActions(order.status), (action, actionIndex, i1) => {
              return {
                a: common_vendor.t(action.text),
                b: actionIndex,
                c: common_vendor.n(action.type),
                d: common_vendor.o(($event) => handleOrderAction(action.action, order), actionIndex)
              };
            }),
            q: order.id,
            r: common_vendor.o(($event) => navigateToOrderDetail(order.id), order.id)
          });
        })
      }, {
        y: recentOrders.value.length === 0,
        B: isRefreshing.value,
        C: common_vendor.o(onRefresh),
        D: common_vendor.o(onRefreshRestore),
        E: common_vendor.o(hideVideoUploadModal),
        F: common_vendor.o(handleVideoUploadSuccess),
        G: common_vendor.p({
          show: showVideoUploadModal.value,
          applicationInfo: __props.applicationInfo
        })
      });
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-89082ba0"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/subPackages/partner/components/Workbench.js.map
