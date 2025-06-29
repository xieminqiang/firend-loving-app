"use strict";
const common_vendor = require("../../../common/vendor.js");
const common_assets = require("../../../common/assets.js");
const utils_location = require("../../../utils/location.js");
const _sfc_main = {
  __name: "Workbench",
  props: {
    applicationInfo: {
      type: Object,
      default: null
    }
  },
  setup(__props) {
    const isOnline = common_vendor.ref(false);
    const currentLocation = common_vendor.ref("");
    const locationUpdateTime = common_vendor.ref("");
    const locationCache = common_vendor.ref({
      latitude: null,
      longitude: null,
      address: ""
    });
    const toggleStatus = () => {
      if (!isOnline.value) {
        common_vendor.index.showModal({
          title: "确认上线",
          content: "上线后将开始接收订单，确认上线吗？",
          success: (res) => {
            if (res.confirm) {
              isOnline.value = true;
              refreshLocation();
              common_vendor.index.showToast({
                title: "已上线，开始接单",
                icon: "success"
              });
            }
          }
        });
      } else {
        common_vendor.index.showModal({
          title: "确认下线",
          content: "下线后将停止接收订单，确认下线吗？",
          success: (res) => {
            if (res.confirm) {
              isOnline.value = false;
              common_vendor.index.showToast({
                title: "已下线，暂停接单",
                icon: "success"
              });
            }
          }
        });
      }
    };
    const refreshLocation = () => {
      common_vendor.index.showLoading({
        title: "获取位置中..."
      });
      utils_location.getCurrentLocationAddress().then((locationInfo) => {
        locationCache.value.latitude = locationInfo.latitude;
        locationCache.value.longitude = locationInfo.longitude;
        locationCache.value.address = locationInfo.address;
        currentLocation.value = locationInfo.address;
        locationUpdateTime.value = (/* @__PURE__ */ new Date()).toLocaleTimeString();
        common_vendor.index.__f__("log", "at subPackages/partner/components/Workbench.vue:159", "位置更新成功", locationInfo);
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: "位置更新成功",
          icon: "success"
        });
        if (isOnline.value) {
          updateLocationToServer(locationInfo.latitude, locationInfo.longitude, locationInfo.address);
        }
      }).catch((err) => {
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: "获取位置失败",
          icon: "error"
        });
        common_vendor.index.__f__("error", "at subPackages/partner/components/Workbench.vue:177", "获取位置失败:", err);
      });
    };
    const updateLocationToServer = (latitude, longitude, address) => {
      ({
        is_online: isOnline.value ? 1 : 0,
        latitude,
        longitude,
        location_text: address
      });
    };
    const selectLocation = () => {
      common_vendor.index.chooseLocation({
        success: (res) => {
          const address = res.address || res.name || "已选择位置";
          locationCache.value.latitude = res.latitude;
          locationCache.value.longitude = res.longitude;
          locationCache.value.address = address;
          currentLocation.value = address;
          locationUpdateTime.value = (/* @__PURE__ */ new Date()).toLocaleTimeString();
          if (isOnline.value) {
            updateLocationToServer(res.latitude, res.longitude, address);
          }
        },
        fail: (err) => {
          if (err.errMsg && err.errMsg.indexOf("cancel") === -1) {
            common_vendor.index.showToast({
              title: "获取位置失败",
              icon: "error"
            });
            common_vendor.index.__f__("error", "at subPackages/partner/components/Workbench.vue:232", "获取位置失败:", err.errMsg);
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
    common_vendor.onMounted(() => {
      refreshLocation();
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
        h: common_vendor.t(isOnline.value ? "下线" : "上线"),
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
        s: common_vendor.o(viewAllOrders)
      });
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-89082ba0"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/subPackages/partner/components/Workbench.js.map
