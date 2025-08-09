"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const api_order = require("../../api/order.js");
if (!Array) {
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  _easycom_uni_popup2();
}
const _easycom_uni_popup = () => "../../uni_modules/uni-popup/components/uni-popup/uni-popup.js";
if (!Math) {
  _easycom_uni_popup();
}
const _sfc_main = {
  __name: "submit",
  setup(__props) {
    const params = common_vendor.ref({});
    const serviceTime = common_vendor.ref("");
    const travelMethod = common_vendor.ref("taxi");
    const quantity = common_vendor.ref(1);
    const roundTripFare = common_vendor.ref(0);
    const totalDistance = common_vendor.ref(0);
    const orderNotes = common_vendor.ref("");
    const showTimePicker = common_vendor.ref(false);
    const availableSchedule = common_vendor.ref([]);
    const selectedDayIndex = common_vendor.ref(0);
    const selectedTimeSlot = common_vendor.ref(null);
    const dayScrollLeft = common_vendor.ref(0);
    const dayScrollWithAnimation = common_vendor.ref(false);
    const timePickerPopup = common_vendor.ref(null);
    const selectedAddress = common_vendor.ref("请选择地址");
    const selectedLocation = common_vendor.ref(null);
    const serviceInfo = common_vendor.ref({});
    const totalPrice = common_vendor.computed(() => {
      var _a, _b;
      const servicePrice = ((_b = (_a = serviceInfo.value) == null ? void 0 : _a.price_info) == null ? void 0 : _b.unit_price) * quantity.value || 0;
      const total = servicePrice + roundTripFare.value;
      return Number(total.toFixed(2));
    });
    const loadServiceInfo = async () => {
      var _a;
      try {
        const { service_id, level_order, companion_id, price_template_id } = params.value;
        if (!service_id || !level_order || !companion_id || !price_template_id) {
          common_vendor.index.__f__("warn", "at subPackages/order/submit.vue:221", "缺少必要的参数");
          return;
        }
        const response = await api_order.getServiceInfo({
          service_id: Number(service_id),
          level_order: Number(level_order),
          companion_id: Number(companion_id),
          price_template_id: Number(price_template_id)
        });
        common_vendor.index.__f__("log", "at subPackages/order/submit.vue:231", "response.data", response.data);
        if (response.data.code === 0) {
          const data = response.data.data;
          serviceInfo.value = data;
          const minQuantity = ((_a = data == null ? void 0 : data.price_info) == null ? void 0 : _a.min_quantity) || 1;
          quantity.value = minQuantity;
        } else {
          throw new Error(response.data.msg || "获取服务信息失败");
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at subPackages/order/submit.vue:244", "加载服务信息失败:", error);
        common_vendor.index.showToast({
          title: error.message || "加载服务信息失败",
          icon: "none"
        });
      }
    };
    const selectAddress = () => {
      common_vendor.index.chooseLocation({
        success: async (res) => {
          const address = res.address || res.name || "已选择位置";
          common_vendor.index.__f__("log", "at subPackages/order/submit.vue:258", "手动选择位置", res);
          selectedAddress.value = address;
          selectedLocation.value = {
            latitude: res.latitude,
            longitude: res.longitude,
            address
          };
          await calculateOrderDistance(res.latitude, res.longitude);
        },
        fail: (err) => {
          if (err.errMsg && err.errMsg.indexOf("cancel") === -1) {
            common_vendor.index.showToast({
              title: "获取位置失败",
              icon: "none"
            });
            common_vendor.index.__f__("error", "at subPackages/order/submit.vue:278", "获取位置失败:", err.errMsg);
          }
        }
      });
    };
    const selectServiceTime = () => {
      if (availableSchedule.value.length === 0) {
        common_vendor.index.showToast({
          title: "暂无可用时间",
          icon: "none"
        });
        return;
      }
      selectedDayIndex.value = getFirstAvailableDayIndex();
      showTimePicker.value = true;
      common_vendor.nextTick$1(() => {
        dayScrollWithAnimation.value = false;
        dayScrollLeft.value = 0;
        timePickerPopup.value.open();
      });
    };
    const switchDay = (index) => {
      selectedDayIndex.value = index;
      selectedTimeSlot.value = null;
      dayScrollWithAnimation.value = true;
      common_vendor.nextTick$1(() => {
        const itemWidth = common_vendor.index.upx2px(140);
        const containerWidth = common_vendor.index.getWindowInfo().windowWidth;
        const padding = common_vendor.index.upx2px(40);
        const availableWidth = containerWidth - padding;
        const visibleItems = Math.floor(availableWidth / itemWidth * 0.8);
        if (index > 2) {
          const scrollPos = Math.max(0, index * itemWidth - visibleItems * itemWidth / 3);
          dayScrollLeft.value = scrollPos;
        } else {
          dayScrollLeft.value = 0;
        }
        setTimeout(() => {
          dayScrollWithAnimation.value = false;
        }, 300);
      });
    };
    const selectTimeSlot = (timeSlot) => {
      if (timeSlot.status !== 1)
        return;
      selectedTimeSlot.value = timeSlot;
      const selectedDay = availableSchedule.value[selectedDayIndex.value];
      serviceTime.value = `${selectedDay.day_name} ${selectedDay.date} ${timeSlot.time}`;
      timePickerPopup.value.close();
      showTimePicker.value = false;
    };
    const getFirstAvailableDayIndex = () => {
      if (availableSchedule.value.length === 0)
        return 0;
      for (let i = 0; i < availableSchedule.value.length; i++) {
        const daySchedule = availableSchedule.value[i];
        const timeSlots = (daySchedule == null ? void 0 : daySchedule.time_slots) || [];
        const hasAvailableSlots = timeSlots.some((slot) => slot.status === 1);
        if (hasAvailableSlots) {
          return i;
        }
      }
      return 0;
    };
    const getCurrentDayTimeSlots = () => {
      var _a;
      if (availableSchedule.value.length === 0)
        return [];
      return ((_a = availableSchedule.value[selectedDayIndex.value]) == null ? void 0 : _a.time_slots) || [];
    };
    const selectTravelMethod = (method) => {
      travelMethod.value = method;
    };
    const increaseQuantity = () => {
      quantity.value++;
    };
    const decreaseQuantity = () => {
      var _a, _b;
      const minQuantity = ((_b = (_a = serviceInfo.value) == null ? void 0 : _a.price_info) == null ? void 0 : _b.min_quantity) || 1;
      if (quantity.value > minQuantity) {
        quantity.value--;
      }
    };
    const calculateOrderDistance = async (userLatitude, userLongitude) => {
      var _a, _b;
      try {
        const requestData = {
          companion_id: Number(params.value.companion_id),
          user_latitude: userLatitude,
          user_longitude: userLongitude
        };
        common_vendor.index.__f__("log", "at subPackages/order/submit.vue:414", "计算距离请求参数:", requestData);
        const response = await api_order.calculateDistance(requestData);
        if (response.data && response.data.code === 0) {
          const result = response.data.data;
          common_vendor.index.__f__("log", "at subPackages/order/submit.vue:420", "距离计算结果:", result);
          if (result.distance !== void 0) {
            totalDistance.value = result.distance;
          }
          if (result.transport_fee !== void 0) {
            roundTripFare.value = Number((result.transport_fee * 2).toFixed(2));
          }
        } else {
          common_vendor.index.__f__("error", "at subPackages/order/submit.vue:433", "计算距离失败:", (_a = response.data) == null ? void 0 : _a.msg);
          common_vendor.index.showToast({
            title: ((_b = response.data) == null ? void 0 : _b.msg) || "计算距离失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at subPackages/order/submit.vue:440", "计算距离接口调用失败:", error);
        common_vendor.index.showToast({
          title: "计算距离失败，请重试",
          icon: "none"
        });
      }
    };
    const submitOrder = async () => {
      var _a, _b;
      if (selectedAddress.value === "请选择地址") {
        common_vendor.index.showToast({
          title: "请先选择服务地址",
          icon: "none"
        });
        return;
      }
      if (!serviceTime.value) {
        common_vendor.index.showToast({
          title: "请先选择服务时间",
          icon: "none"
        });
        return;
      }
      const timeMatch = serviceTime.value.match(/(\d{4}-\d{2}-\d{2})\s+(.+)/);
      if (!timeMatch) {
        common_vendor.index.showToast({
          title: "服务时间格式错误",
          icon: "none"
        });
        return;
      }
      const serviceDate = timeMatch[1];
      const serviceTimeSlot = timeMatch[2];
      const orderData = {
        companion_id: Number(params.value.companion_id),
        service_id: Number(params.value.service_id),
        level_order: Number(params.value.level_order),
        price_template_id: Number(params.value.price_template_id),
        quantity: quantity.value,
        service_address: selectedAddress.value,
        service_date: serviceDate,
        service_time: serviceTimeSlot,
        remark: orderNotes.value,
        user_latitude: (_a = selectedLocation.value) == null ? void 0 : _a.latitude,
        user_longitude: (_b = selectedLocation.value) == null ? void 0 : _b.longitude
      };
      common_vendor.index.__f__("log", "at subPackages/order/submit.vue:504", "提交订单数据:", orderData);
      common_vendor.index.showLoading({
        title: "提交中..."
      });
      try {
        const response = await api_order.createOrderV2(orderData);
        if (response.data.code === 0) {
          common_vendor.index.__f__("log", "at subPackages/order/submit.vue:515", "订单创建成功:", response.data);
          try {
            const orderParamsData = {
              order_id: response.data.data.order_id,
              payment_method: 1
            };
            const paramsResponse = await api_order.orderParams(orderParamsData);
            if (paramsResponse.data.code === 0) {
              common_vendor.index.requestPayment({
                provider: "wxpay",
                ...paramsResponse.data.data.pay_params,
                success: (res) => {
                  common_vendor.index.__f__("log", "at subPackages/order/submit.vue:531", "支付成功", res);
                  common_vendor.index.showToast({
                    title: "支付成功",
                    icon: "success"
                  });
                  setTimeout(() => {
                    common_vendor.index.navigateTo({
                      url: `/subPackages/order/index?refresh=true`
                    });
                  }, 1500);
                },
                fail: (err) => {
                  common_vendor.index.__f__("error", "at subPackages/order/submit.vue:544", "支付失败", JSON.stringify(err));
                  common_vendor.index.showToast({
                    title: "支付失败",
                    icon: "none"
                  });
                }
              });
            } else {
              throw new Error(paramsResponse.data.msg || "获取支付参数失败");
            }
          } catch (error) {
            common_vendor.index.__f__("error", "at subPackages/order/submit.vue:555", "获取支付参数失败:", error);
            common_vendor.index.showToast({
              title: error.message || "获取支付参数失败",
              icon: "none"
            });
          }
        } else {
          throw new Error(response.data.msg || "创建订单失败");
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at subPackages/order/submit.vue:565", "提交订单失败:", error);
        common_vendor.index.showToast({
          title: error.message || "提交订单失败",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    };
    common_vendor.onMounted(() => {
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      params.value = currentPage.options || {};
      common_vendor.index.__f__("log", "at subPackages/order/submit.vue:581", "订单提交页面参数:", params.value);
      loadServiceInfo();
      if (params.value.companion_id) {
        api_order.getCompanionAvailableSchedule(Number(params.value.companion_id)).then((response) => {
          common_vendor.index.__f__("log", "at subPackages/order/submit.vue:590", "友伴师可用时间安排:", response);
          if (response.data && response.data.code === 0) {
            availableSchedule.value = response.data.data.schedule || [];
            if (availableSchedule.value.length > 0) {
              selectedDayIndex.value = getFirstAvailableDayIndex();
            }
          }
        }).catch((error) => {
          common_vendor.index.__f__("error", "at subPackages/order/submit.vue:600", "获取友伴师可用时间安排失败:", error);
        });
      }
    });
    return (_ctx, _cache) => {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l;
      return common_vendor.e({
        a: common_assets._imports_0$7,
        b: common_vendor.t(selectedAddress.value),
        c: selectedAddress.value !== "请选择地址" ? 1 : "",
        d: common_assets._imports_0,
        e: common_vendor.o(selectAddress),
        f: common_vendor.t(serviceTime.value),
        g: common_assets._imports_0,
        h: common_vendor.o(selectServiceTime),
        i: travelMethod.value === "taxi"
      }, travelMethod.value === "taxi" ? {} : {}, {
        j: travelMethod.value === "taxi" ? 1 : "",
        k: common_vendor.o(($event) => selectTravelMethod("taxi")),
        l: (_a = serviceInfo.value) == null ? void 0 : _a.service
      }, ((_b = serviceInfo.value) == null ? void 0 : _b.service) ? {
        m: _ctx.$imgBaseUrl + ((_d = (_c = serviceInfo.value) == null ? void 0 : _c.service) == null ? void 0 : _d.image_url),
        n: common_vendor.t((_f = (_e = serviceInfo.value) == null ? void 0 : _e.service) == null ? void 0 : _f.name),
        o: common_vendor.t((_h = (_g = serviceInfo.value) == null ? void 0 : _g.price_info) == null ? void 0 : _h.unit_price),
        p: common_vendor.t((_j = (_i = serviceInfo.value) == null ? void 0 : _i.price_info) == null ? void 0 : _j.unit),
        q: common_vendor.t(params.value.nickname),
        r: common_assets._imports_2$5,
        s: quantity.value <= (((_l = (_k = serviceInfo.value) == null ? void 0 : _k.price_info) == null ? void 0 : _l.min_quantity) || 1) ? 1 : "",
        t: common_vendor.o(decreaseQuantity),
        v: common_vendor.t(quantity.value),
        w: common_assets._imports_3$4,
        x: common_vendor.o(increaseQuantity)
      } : {}, {
        y: common_vendor.t(roundTripFare.value.toFixed(2)),
        z: common_vendor.t(totalDistance.value),
        A: orderNotes.value,
        B: common_vendor.o(($event) => orderNotes.value = $event.detail.value),
        C: common_vendor.t(totalPrice.value.toFixed(2)),
        D: common_vendor.o(submitOrder),
        E: common_vendor.f(availableSchedule.value, (day, index, i0) => {
          return {
            a: common_vendor.t(day.day_name),
            b: common_vendor.t(day.date),
            c: index,
            d: selectedDayIndex.value === index ? 1 : "",
            e: common_vendor.o(($event) => switchDay(index), index)
          };
        }),
        F: dayScrollLeft.value,
        G: dayScrollWithAnimation.value,
        H: common_vendor.f(getCurrentDayTimeSlots(), (timeSlot, index, i0) => {
          return {
            a: common_vendor.t(timeSlot.time),
            b: index,
            c: timeSlot.status === 1 ? 1 : "",
            d: timeSlot.status === 2 ? 1 : "",
            e: selectedTimeSlot.value === timeSlot ? 1 : "",
            f: common_vendor.o(($event) => selectTimeSlot(timeSlot), index)
          };
        }),
        I: common_vendor.sr(timePickerPopup, "d71fedd4-0", {
          "k": "timePickerPopup"
        }),
        J: common_vendor.o(($event) => showTimePicker.value = false),
        K: common_vendor.p({
          type: "bottom",
          ["mask-click"]: true,
          round: "20"
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-d71fedd4"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/subPackages/order/submit.js.map
