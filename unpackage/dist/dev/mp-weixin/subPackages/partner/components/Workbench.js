"use strict";
const common_vendor = require("../../../common/vendor.js");
const common_assets = require("../../../common/assets.js");
const utils_location = require("../../../utils/location.js");
const api_user = require("../../../api/user.js");
const api_file = require("../../../api/file.js");
const utils_address = require("../../../utils/address.js");
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
    const videoUrl = common_vendor.ref("");
    const isUploading = common_vendor.ref(false);
    const uploadProgress = common_vendor.ref(0);
    const hasValidApplicationInfo = common_vendor.computed(() => {
      return props.applicationInfo && typeof props.applicationInfo === "object";
    });
    const initOnlineStatus = () => {
      if (hasValidApplicationInfo.value && typeof props.applicationInfo.is_online !== "undefined") {
        isOnline.value = props.applicationInfo.is_online === 1;
        common_vendor.index.__f__("log", "at subPackages/partner/components/Workbench.vue:215", "从applicationInfo获取在线状态:", isOnline.value, "原始值:", props.applicationInfo.is_online);
      } else {
        isOnline.value = false;
        common_vendor.index.__f__("log", "at subPackages/partner/components/Workbench.vue:218", "使用默认在线状态: 下线");
      }
    };
    const initializeComponent = async () => {
      if (isInitialized.value) {
        common_vendor.index.__f__("log", "at subPackages/partner/components/Workbench.vue:225", "组件已经初始化过，跳过重复初始化");
        return;
      }
      common_vendor.index.__f__("log", "at subPackages/partner/components/Workbench.vue:229", "开始初始化Workbench组件");
      await common_vendor.nextTick$1();
      initOnlineStatus();
      getLocationInfo();
      isInitialized.value = true;
      common_vendor.index.__f__("log", "at subPackages/partner/components/Workbench.vue:241", "Workbench组件初始化完成");
    };
    common_vendor.watch(() => props.applicationInfo, (newVal, oldVal) => {
      common_vendor.index.__f__("log", "at subPackages/partner/components/Workbench.vue:246", "applicationInfo发生变化:", { old: oldVal, new: newVal });
      if (newVal && hasValidApplicationInfo.value) {
        if (isInitialized.value) {
          common_vendor.index.__f__("log", "at subPackages/partner/components/Workbench.vue:251", "组件已初始化，只更新在线状态");
          initOnlineStatus();
        } else {
          initializeComponent();
        }
      }
    }, { immediate: true, deep: true });
    const toggleStatus = async () => {
      if (isUpdatingStatus.value) {
        common_vendor.index.__f__("log", "at subPackages/partner/components/Workbench.vue:263", "正在更新状态，忽略重复点击");
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
            common_vendor.index.__f__("log", "at subPackages/partner/components/Workbench.vue:309", "获取位置成功:", locationInfo);
          } catch (error) {
            common_vendor.index.__f__("error", "at subPackages/partner/components/Workbench.vue:311", "获取位置失败:", error);
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
        common_vendor.index.__f__("log", "at subPackages/partner/components/Workbench.vue:343", "准备更新在线状态:", requestData);
        common_vendor.index.__f__("log", "at subPackages/partner/components/Workbench.vue:344", "位置描述分析:", utils_address.analyzeAddress(locationInfo ? locationInfo.address : ""));
        const response = await api_user.updateCompanionOnlineStatus(requestData);
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
          common_vendor.index.__f__("log", "at subPackages/partner/components/Workbench.vue:365", "在线状态更新成功:", response.data);
        } else {
          common_vendor.index.hideLoading();
          common_vendor.index.showToast({
            title: ((_a = response.data) == null ? void 0 : _a.msg) || "状态更新失败",
            icon: "none"
          });
          common_vendor.index.__f__("error", "at subPackages/partner/components/Workbench.vue:373", "在线状态更新失败:", response.data);
        }
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: "网络错误，请重试",
          icon: "none"
        });
        common_vendor.index.__f__("error", "at subPackages/partner/components/Workbench.vue:381", "更新在线状态失败:", error);
      } finally {
        isUpdatingStatus.value = false;
      }
    };
    const getLocationInfo = () => {
      const cacheStatus = utils_location.getCacheStatus();
      if (cacheStatus.hasCache && cacheStatus.isValid) {
        currentLocation.value = cacheStatus.address;
        locationUpdateTime.value = new Date(cacheStatus.timestamp).toLocaleTimeString();
        common_vendor.index.__f__("log", "at subPackages/partner/components/Workbench.vue:395", "使用缓存位置信息:", cacheStatus.address);
        common_vendor.index.__f__("log", "at subPackages/partner/components/Workbench.vue:396", "使用缓存:", cacheStatus);
        if (isOnline.value) {
          updateLocationToServer(cacheStatus.coordinates.latitude, cacheStatus.coordinates.longitude, cacheStatus.address);
        }
        return;
      }
      utils_location.getCurrentLocationAddress(false).then((locationInfo) => {
        currentLocation.value = locationInfo.address;
        locationUpdateTime.value = (/* @__PURE__ */ new Date()).toLocaleTimeString();
        common_vendor.index.__f__("log", "at subPackages/partner/components/Workbench.vue:408", "获取位置成功", locationInfo);
        if (isOnline.value) {
          updateLocationToServer(locationInfo.latitude, locationInfo.longitude, locationInfo.address);
        }
      }).catch((err) => {
        common_vendor.index.__f__("error", "at subPackages/partner/components/Workbench.vue:416", "获取位置失败:", err);
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
        common_vendor.index.__f__("log", "at subPackages/partner/components/Workbench.vue:434", "位置更新成功", locationInfo);
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
        common_vendor.index.__f__("error", "at subPackages/partner/components/Workbench.vue:452", "获取位置失败:", err);
      });
    };
    const updateLocationToServer = async (latitude, longitude, address) => {
      var _a;
      if (!isOnline.value) {
        common_vendor.index.__f__("log", "at subPackages/partner/components/Workbench.vue:459", "用户未上线，不更新位置信息");
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
        common_vendor.index.__f__("log", "at subPackages/partner/components/Workbench.vue:474", "准备更新位置信息到服务器:", requestData);
        common_vendor.index.__f__("log", "at subPackages/partner/components/Workbench.vue:475", "位置描述分析:", utils_address.analyzeAddress(address));
        const response = await api_user.updateCompanionOnlineStatus(requestData);
        if (response.data && response.data.code === 0) {
          common_vendor.index.__f__("log", "at subPackages/partner/components/Workbench.vue:480", "位置信息更新成功:", response.data);
        } else {
          common_vendor.index.__f__("error", "at subPackages/partner/components/Workbench.vue:482", "位置信息更新失败:", (_a = response.data) == null ? void 0 : _a.msg);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at subPackages/partner/components/Workbench.vue:485", "位置信息更新API调用失败:", error);
      }
    };
    const selectLocation = () => {
      common_vendor.index.chooseLocation({
        success: async (res) => {
          const address = res.address || res.name || "已选择位置";
          common_vendor.index.__f__("log", "at subPackages/partner/components/Workbench.vue:495", "手动选择位置", res);
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
            common_vendor.index.__f__("error", "at subPackages/partner/components/Workbench.vue:512", "获取位置失败:", err.errMsg);
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
      var _a;
      showVideoUploadModal.value = false;
      if (!((_a = props.applicationInfo) == null ? void 0 : _a.intro_video_url)) {
        videoUrl.value = "";
      }
      isUploading.value = false;
      uploadProgress.value = 0;
    };
    const selectVideo = () => {
      videoUrl.value = "";
      common_vendor.index.chooseVideo({
        count: 1,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        maxDuration: 60,
        camera: "back",
        success: async (res) => {
          const tempFilePath = res.tempFilePath;
          const duration = res.duration;
          const size = res.size;
          if (duration < 3 || duration > 60) {
            common_vendor.index.showToast({
              title: "视频时长必须在3-60秒之间",
              icon: "none"
            });
            return;
          }
          if (size > 500 * 1024 * 1024) {
            common_vendor.index.showToast({
              title: "视频文件大小不能超过500MB",
              icon: "none"
            });
            return;
          }
          common_vendor.index.showLoading({
            title: "上传中...",
            mask: true
          });
          try {
            const fileInfo = await getFileInfo(tempFilePath);
            const uploadResult = await api_file.uploadFile({
              filePath: tempFilePath,
              name: `intro_video_${Date.now()}.${fileInfo.extension}`
            });
            const fileData = api_file.getUploadResult(uploadResult);
            if (!fileData || !fileData.url) {
              throw new Error("上传结果解析失败");
            }
            videoUrl.value = "https://sygx-server-bucket-admin.oss-cn-shanghai.aliyuncs.com" + fileData.url;
            common_vendor.index.hideLoading();
          } catch (error) {
            common_vendor.index.hideLoading();
            common_vendor.index.__f__("error", "at subPackages/partner/components/Workbench.vue:628", "视频上传失败:", error);
            common_vendor.index.showToast({
              title: "上传失败，请重试",
              icon: "none"
            });
          }
        },
        fail: (error) => {
          common_vendor.index.__f__("error", "at subPackages/partner/components/Workbench.vue:636", "选择视频失败:", error);
          if (error.errMsg && !error.errMsg.includes("cancel")) {
            common_vendor.index.showToast({
              title: "选择视频失败",
              icon: "none"
            });
          }
        }
      });
    };
    const submitVideo = async () => {
      if (!videoUrl.value) {
        common_vendor.index.showToast({
          title: "请先选择视频",
          icon: "none"
        });
        return;
      }
      if (isUploading.value) {
        return;
      }
      try {
        common_vendor.index.showLoading({ title: "提交审核中..." });
        const response = await api_user.uploadCompanionVideo({
          intro_video_url: videoUrl.value
        });
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: "视频提交成功，等待审核",
          icon: "success"
        });
        hideVideoUploadModal();
        common_vendor.index.$emit("applicationStatusChanged", {
          type: "video_uploaded",
          message: "视频已提交审核"
        });
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("error", "at subPackages/partner/components/Workbench.vue:724", "提交视频失败:", error);
        if (!error.data) {
          common_vendor.index.showToast({
            title: "提交失败，请重试",
            icon: "none"
          });
        }
      }
    };
    const getFileInfo = (filePath) => {
      return new Promise((resolve, reject) => {
        common_vendor.index.getFileInfo({
          filePath,
          success: (res) => {
            const extension = filePath.split(".").pop().toLowerCase();
            resolve({
              size: res.size,
              extension
            });
          },
          fail: (error) => {
            common_vendor.index.__f__("error", "at subPackages/partner/components/Workbench.vue:749", "获取文件信息失败:", error);
            const extension = filePath.split(".").pop().toLowerCase() || "mp4";
            resolve({
              size: 0,
              extension
            });
          }
        });
      });
    };
    const getVideoStatusText = (status) => {
      switch (status) {
        case "pending":
          return "待审核";
        case "approved":
          return "已通过";
        case "rejected":
          return "已拒绝";
        default:
          return "未知状态";
      }
    };
    const getVideoStatusDesc = (status) => {
      switch (status) {
        case "pending":
          return "您的视频正在审核中，请耐心等待";
        case "approved":
          return "视频审核已通过，可以正常上线接单";
        case "rejected":
          return props.applicationInfo.remark != "" ? "原因：" + props.applicationInfo.remark : "视频审核未通过，请重新上传";
        default:
          return "请上传自我介绍视频";
      }
    };
    const getStatusBadgeClass = (status) => {
      switch (status) {
        case "pending":
          return "status-pending";
        case "approved":
          return "status-approved";
        case "rejected":
          return "status-rejected";
        default:
          return "";
      }
    };
    common_vendor.onMounted(() => {
      common_vendor.index.__f__("log", "at subPackages/partner/components/Workbench.vue:805", "Workbench组件mounted，applicationInfo状态:", {
        hasApplicationInfo: !!props.applicationInfo,
        applicationInfo: props.applicationInfo
      });
      if (hasValidApplicationInfo.value) {
        initializeComponent();
      } else {
        common_vendor.index.__f__("log", "at subPackages/partner/components/Workbench.vue:814", "applicationInfo还未准备好，等待watch触发初始化");
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
        l: common_assets._imports_0$6,
        m: common_assets._imports_1$6,
        n: common_vendor.o(refreshLocation),
        o: common_assets._imports_2$4,
        p: common_vendor.o(selectLocation),
        q: common_vendor.t(currentLocation.value || "正在获取位置..."),
        r: common_vendor.t(locationUpdateTime.value),
        s: common_vendor.o(viewAllOrders),
        t: showVideoUploadModal.value
      }, showVideoUploadModal.value ? common_vendor.e({
        v: common_vendor.o(hideVideoUploadModal),
        w: __props.applicationInfo && __props.applicationInfo.intro_video_url
      }, __props.applicationInfo && __props.applicationInfo.intro_video_url ? {
        x: common_vendor.t(getVideoStatusText(__props.applicationInfo.video_review_status)),
        y: common_vendor.n(getStatusBadgeClass(__props.applicationInfo.video_review_status)),
        z: common_vendor.t(getVideoStatusDesc(__props.applicationInfo.video_review_status))
      } : {}, {
        A: videoUrl.value && videoUrl.value != ""
      }, videoUrl.value && videoUrl.value != "" ? {
        B: videoUrl.value,
        C: common_vendor.o(selectVideo)
      } : {
        D: common_vendor.o(selectVideo)
      }, {
        E: isUploading.value
      }, isUploading.value ? {
        F: uploadProgress.value + "%",
        G: common_vendor.t(uploadProgress.value)
      } : {}, {
        H: common_vendor.o(hideVideoUploadModal),
        I: __props.applicationInfo && __props.applicationInfo.intro_video_url
      }, __props.applicationInfo && __props.applicationInfo.intro_video_url ? {
        J: common_vendor.t(isUploading.value ? "上传中..." : "重新提交")
      } : {
        K: common_vendor.t(isUploading.value ? "上传中..." : "提交审核")
      }, {
        L: !videoUrl.value || isUploading.value ? 1 : "",
        M: common_vendor.o(submitVideo),
        N: common_vendor.o(() => {
        }),
        O: common_vendor.o(hideVideoUploadModal)
      }) : {});
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-89082ba0"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/subPackages/partner/components/Workbench.js.map
