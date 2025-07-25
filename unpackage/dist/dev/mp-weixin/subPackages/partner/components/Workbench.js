"use strict";
const common_vendor = require("../../../common/vendor.js");
const common_assets = require("../../../common/assets.js");
const utils_location = require("../../../utils/location.js");
const api_user = require("../../../api/user.js");
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
    const hasValidApplicationInfo = common_vendor.computed(() => {
      return props.applicationInfo && typeof props.applicationInfo === "object";
    });
    const initOnlineStatus = () => {
      if (hasValidApplicationInfo.value && typeof props.applicationInfo.is_online !== "undefined") {
        isOnline.value = props.applicationInfo.is_online === 1;
        common_vendor.index.__f__("log", "at subPackages/partner/components/Workbench.vue:125", "从applicationInfo获取在线状态:", isOnline.value, "原始值:", props.applicationInfo.is_online);
      } else {
        isOnline.value = false;
        common_vendor.index.__f__("log", "at subPackages/partner/components/Workbench.vue:128", "使用默认在线状态: 下线");
      }
    };
    const initializeComponent = async () => {
      if (isInitialized.value) {
        common_vendor.index.__f__("log", "at subPackages/partner/components/Workbench.vue:135", "组件已经初始化过，跳过重复初始化");
        return;
      }
      common_vendor.index.__f__("log", "at subPackages/partner/components/Workbench.vue:139", "开始初始化Workbench组件");
      await common_vendor.nextTick$1();
      initOnlineStatus();
      getLocationInfo();
      isInitialized.value = true;
      common_vendor.index.__f__("log", "at subPackages/partner/components/Workbench.vue:151", "Workbench组件初始化完成");
    };
    common_vendor.watch(() => props.applicationInfo, (newVal, oldVal) => {
      common_vendor.index.__f__("log", "at subPackages/partner/components/Workbench.vue:156", "applicationInfo发生变化:", { old: oldVal, new: newVal });
      if (newVal && hasValidApplicationInfo.value) {
        if (isInitialized.value) {
          common_vendor.index.__f__("log", "at subPackages/partner/components/Workbench.vue:161", "组件已初始化，只更新在线状态");
          initOnlineStatus();
        } else {
          initializeComponent();
        }
      }
    }, { immediate: true, deep: true });
    const toggleStatus = async () => {
      if (isUpdatingStatus.value) {
        common_vendor.index.__f__("log", "at subPackages/partner/components/Workbench.vue:173", "正在更新状态，忽略重复点击");
        return;
      }
      const newStatus = !isOnline.value;
      const statusText = newStatus ? "上线" : "下线";
      if (newStatus && hasValidApplicationInfo.value && props.applicationInfo.can_accept_orders === "N") {
        if (!props.applicationInfo.intro_video_url || props.applicationInfo.video_review_status !== "approved") {
          showVideoUploadModal.value = true;
          if (props.applicationInfo.intro_video_url) {
            videoUrl.value = props.applicationInfo.intro_video_url;
          }
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
            common_vendor.index.__f__("log", "at subPackages/partner/components/Workbench.vue:219", "获取位置成功:", locationInfo);
          } catch (error) {
            common_vendor.index.__f__("error", "at subPackages/partner/components/Workbench.vue:221", "获取位置失败:", error);
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
        common_vendor.index.__f__("log", "at subPackages/partner/components/Workbench.vue:253", "准备更新在线状态:", requestData);
        const response = await api_user.updateCompanionOnlineStatus(requestData);
        common_vendor.index.__f__("log", "at subPackages/partner/components/Workbench.vue:258", "在线", response);
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
          common_vendor.index.__f__("log", "at subPackages/partner/components/Workbench.vue:275", "在线状态更新成功:", response.data);
        } else {
          common_vendor.index.hideLoading();
          common_vendor.index.showToast({
            title: ((_a = response.data) == null ? void 0 : _a.msg) || "状态更新失败",
            icon: "none"
          });
          common_vendor.index.__f__("error", "at subPackages/partner/components/Workbench.vue:283", "在线状态更新失败:", response.data);
        }
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: "网络错误，请重试",
          icon: "none"
        });
        common_vendor.index.__f__("error", "at subPackages/partner/components/Workbench.vue:291", "更新在线状态失败:", error);
      } finally {
        isUpdatingStatus.value = false;
      }
    };
    const getLocationInfo = () => {
      const cacheStatus = utils_location.getCacheStatus();
      if (cacheStatus.hasCache && cacheStatus.isValid) {
        currentLocation.value = cacheStatus.address;
        locationUpdateTime.value = new Date(cacheStatus.timestamp).toLocaleTimeString();
        common_vendor.index.__f__("log", "at subPackages/partner/components/Workbench.vue:305", "使用缓存位置信息:", cacheStatus.address);
        common_vendor.index.__f__("log", "at subPackages/partner/components/Workbench.vue:306", "使用缓存:", cacheStatus);
        if (isOnline.value) {
          updateLocationToServer(cacheStatus.coordinates.latitude, cacheStatus.coordinates.longitude, cacheStatus.address);
        }
        return;
      }
      utils_location.getCurrentLocationAddress(false).then((locationInfo) => {
        currentLocation.value = locationInfo.address;
        locationUpdateTime.value = (/* @__PURE__ */ new Date()).toLocaleTimeString();
        common_vendor.index.__f__("log", "at subPackages/partner/components/Workbench.vue:318", "获取位置成功", locationInfo);
        if (isOnline.value) {
          updateLocationToServer(locationInfo.latitude, locationInfo.longitude, locationInfo.address);
        }
      }).catch((err) => {
        common_vendor.index.__f__("error", "at subPackages/partner/components/Workbench.vue:326", "获取位置失败:", err);
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
        common_vendor.index.__f__("log", "at subPackages/partner/components/Workbench.vue:344", "位置更新成功", locationInfo);
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: "位置更新成功",
          icon: "none"
        });
        if (isOnline.value) {
          updateLocationToServer(locationInfo.latitude, locationInfo.longitude, locationInfo.address);
        }
      }).catch((err) => {
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: "获取位置失败",
          icon: "none"
        });
        common_vendor.index.__f__("error", "at subPackages/partner/components/Workbench.vue:362", "获取位置失败:", err);
      });
    };
    const updateLocationToServer = async (latitude, longitude, address) => {
      var _a;
      if (!isOnline.value) {
        common_vendor.index.__f__("log", "at subPackages/partner/components/Workbench.vue:369", "用户未上线，不更新位置信息");
        return;
      }
      try {
        const processedAddress = utils_address.processAddress(address);
        const requestData = {
          is_online: isOnline.value ? 1 : 0,
          latitude,
          longitude,
          location_text: processedAddress
        };
        common_vendor.index.__f__("log", "at subPackages/partner/components/Workbench.vue:384", "准备更新位置信息到服务器:", requestData);
        common_vendor.index.__f__("log", "at subPackages/partner/components/Workbench.vue:385", "位置描述分析:", utils_address.analyzeAddress(address));
        const response = await api_user.updateCompanionOnlineStatus(requestData);
        if (response.data && response.data.code === 0) {
          common_vendor.index.__f__("log", "at subPackages/partner/components/Workbench.vue:390", "位置信息更新成功:", response.data);
        } else {
          common_vendor.index.__f__("error", "at subPackages/partner/components/Workbench.vue:392", "位置信息更新失败:", (_a = response.data) == null ? void 0 : _a.msg);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at subPackages/partner/components/Workbench.vue:395", "位置信息更新API调用失败:", error);
      }
    };
    const selectLocation = () => {
      common_vendor.index.chooseLocation({
        success: async (res) => {
          const address = res.address || res.name || "已选择位置";
          common_vendor.index.__f__("log", "at subPackages/partner/components/Workbench.vue:405", "手动选择位置", res);
          currentLocation.value = address;
          locationUpdateTime.value = (/* @__PURE__ */ new Date()).toLocaleTimeString();
          if (isOnline.value) {
            await updateLocationToServer(res.latitude, res.longitude, address);
          }
        },
        fail: (err) => {
          if (err.errMsg && err.errMsg.indexOf("cancel") === -1) {
            common_vendor.index.showToast({
              title: "获取位置失败",
              icon: "none"
            });
            common_vendor.index.__f__("error", "at subPackages/partner/components/Workbench.vue:422", "获取位置失败:", err.errMsg);
          }
        }
      });
    };
    const viewAllOrders = () => {
      common_vendor.index.showToast({
        title: "订单列表功能开发中",
        icon: "none"
      });
    };
    const hideVideoUploadModal = () => {
      showVideoUploadModal.value = false;
    };
    const handleVideoUploadSuccess = (data) => {
      common_vendor.index.__f__("log", "at subPackages/partner/components/Workbench.vue:450", "视频上传成功:", data);
      common_vendor.index.$emit("applicationStatusChanged", data);
    };
    common_vendor.onMounted(() => {
      common_vendor.index.__f__("log", "at subPackages/partner/components/Workbench.vue:459", "Workbench组件mounted，applicationInfo状态:", {
        hasApplicationInfo: !!props.applicationInfo,
        applicationInfo: props.applicationInfo
      });
      if (hasValidApplicationInfo.value) {
        initializeComponent();
      } else {
        common_vendor.index.__f__("log", "at subPackages/partner/components/Workbench.vue:468", "applicationInfo还未准备好，等待watch触发初始化");
      }
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: __props.applicationInfo && __props.applicationInfo.photos && __props.applicationInfo.photos.length > 0
      }, __props.applicationInfo && __props.applicationInfo.photos && __props.applicationInfo.photos.length > 0 ? {
        b: __props.applicationInfo.photos[0]
      } : {}, {
        c: isOnline.value ? 1 : "",
        d: common_vendor.t(isOnline.value ? "已上线" : "已下线"),
        e: common_vendor.t(isOnline.value ? "正在接单中" : "暂停接单"),
        f: !isOnline.value
      }, !isOnline.value ? {} : {}, {
        g: isOnline.value
      }, isOnline.value ? {} : {}, {
        h: common_vendor.t(isOnline.value ? "下线休息" : "开始上线"),
        i: isOnline.value ? 1 : "",
        j: common_vendor.o(toggleStatus),
        k: isOnline.value ? 1 : "",
        l: common_assets._imports_0$7,
        m: common_assets._imports_1$8,
        n: common_vendor.o(refreshLocation),
        o: common_assets._imports_2$5,
        p: common_vendor.o(selectLocation),
        q: common_vendor.t(currentLocation.value || "正在获取位置..."),
        r: common_vendor.t(locationUpdateTime.value),
        s: common_vendor.o(viewAllOrders),
        t: common_vendor.o(hideVideoUploadModal),
        v: common_vendor.o(handleVideoUploadSuccess),
        w: common_vendor.p({
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
