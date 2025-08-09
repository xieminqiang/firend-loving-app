"use strict";
const common_vendor = require("../../../common/vendor.js");
const api_user = require("../../../api/user.js");
const _sfc_main = {
  __name: "DataSelect",
  setup(__props) {
    const companion_id = common_vendor.ref(null);
    const loading = common_vendor.ref(true);
    const selectedDay = common_vendor.ref(0);
    const scheduleData = common_vendor.ref([]);
    const timeGridHeight = common_vendor.ref(0);
    const originalScheduleData = common_vendor.ref([]);
    const weekDays = common_vendor.ref([
      { key: "monday", name: "周一" },
      { key: "tuesday", name: "周二" },
      { key: "wednesday", name: "周三" },
      { key: "thursday", name: "周四" },
      { key: "friday", name: "周五" },
      { key: "saturday", name: "周六" },
      { key: "sunday", name: "周日" }
    ]);
    const getPageParams = () => {
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      const options = currentPage.options;
      if (options.companion_id) {
        companion_id.value = parseInt(options.companion_id);
        common_vendor.index.__f__("log", "at subPackages/partner/components/DataSelect.vue:107", "获取到companion_id:", companion_id.value);
      } else {
        common_vendor.index.__f__("error", "at subPackages/partner/components/DataSelect.vue:109", "未获取到companion_id参数");
        common_vendor.index.showToast({
          title: "参数错误",
          icon: "none"
        });
      }
    };
    const callScheduleAPI = async () => {
      var _a;
      if (!companion_id.value) {
        common_vendor.index.__f__("error", "at subPackages/partner/components/DataSelect.vue:120", "companion_id为空，无法调用接口");
        return;
      }
      try {
        common_vendor.index.__f__("log", "at subPackages/partner/components/DataSelect.vue:125", "开始调用getCompanionSchedule接口，companion_id:", companion_id.value);
        let obj = {
          "companion_id": companion_id.value
        };
        common_vendor.index.__f__("log", "at subPackages/partner/components/DataSelect.vue:130", "obj:", obj);
        const response = await api_user.getCompanionSchedule(obj);
        common_vendor.index.__f__("log", "at subPackages/partner/components/DataSelect.vue:132", "接口调用成功:", response);
        if (response.data && response.data.code === 0) {
          scheduleData.value = response.data.data;
          originalScheduleData.value = JSON.parse(JSON.stringify(response.data.data));
          common_vendor.index.__f__("log", "at subPackages/partner/components/DataSelect.vue:138", "解析后的数据:", scheduleData.value);
          setDefaultSelectedDay();
        } else {
          common_vendor.index.showToast({
            title: ((_a = response.data) == null ? void 0 : _a.msg) || "获取数据失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at subPackages/partner/components/DataSelect.vue:149", "接口调用失败:", error);
        common_vendor.index.showToast({
          title: "网络错误",
          icon: "none"
        });
      } finally {
        loading.value = false;
      }
    };
    const setDefaultSelectedDay = () => {
      const todayData = scheduleData.value.find((item) => item.is_today === true);
      if (todayData) {
        selectedDay.value = todayData.day_of_week - 1;
        common_vendor.index.__f__("log", "at subPackages/partner/components/DataSelect.vue:167", "设置为今天:", todayData.day_of_week, "选中索引:", selectedDay.value);
      } else {
        selectedDay.value = 0;
        common_vendor.index.__f__("log", "at subPackages/partner/components/DataSelect.vue:171", "未找到今天数据，默认选中周一");
      }
    };
    const selectDay = (index) => {
      if (selectedDay.value !== index) {
        resetCurrentDayData();
      }
      selectedDay.value = index;
    };
    const resetCurrentDayData = () => {
      const currentDayOfWeek = selectedDay.value + 1;
      const originalDayData = originalScheduleData.value.find((item) => item.day_of_week === currentDayOfWeek);
      const currentDayData = scheduleData.value.find((item) => item.day_of_week === currentDayOfWeek);
      if (originalDayData && currentDayData) {
        currentDayData.schedule = JSON.parse(JSON.stringify(originalDayData.schedule));
        common_vendor.index.__f__("log", "at subPackages/partner/components/DataSelect.vue:193", "重置星期数据:", currentDayOfWeek, "为原始状态");
      }
    };
    const isToday = (index) => {
      const dayOfWeek = index + 1;
      const dayData = scheduleData.value.find((item) => item.day_of_week === dayOfWeek);
      return dayData ? dayData.is_today : false;
    };
    const getSelectedDayName = () => {
      return weekDays.value[selectedDay.value].name;
    };
    const getCurrentDaySchedule = () => {
      const dayOfWeek = selectedDay.value + 1;
      const dayData = scheduleData.value.find((item) => item.day_of_week === dayOfWeek);
      return dayData ? dayData.schedule : {};
    };
    const getDayStatus = (index) => {
      const dayOfWeek = index + 1;
      const dayData = scheduleData.value.find((item) => item.day_of_week === dayOfWeek);
      if (!dayData)
        return "未设置";
      const schedule = dayData.schedule;
      const availableCount = Object.values(schedule).filter((v) => v === 1).length;
      const bookedCount = Object.values(schedule).filter((v) => v === 3).length;
      let statusText = "";
      if (bookedCount > 0) {
        statusText = `${bookedCount}个已约`;
      } else if (availableCount === 48) {
        statusText = "全天可约";
      } else if (availableCount === 0) {
        statusText = "全天休息";
      } else {
        statusText = `${availableCount}个可约`;
      }
      if (dayData.is_today) {
        statusText = statusText;
      }
      return statusText;
    };
    const getTimeSlotClass = (status) => {
      switch (status) {
        case 1:
          return "available";
        case 2:
          return "unavailable";
        case 3:
          return "booked";
        default:
          return "unavailable";
      }
    };
    const getStatusText = (status) => {
      switch (status) {
        case 1:
          return "可约";
        case 2:
          return "休息";
        case 3:
          return "已约";
        default:
          return "休息";
      }
    };
    const toggleTimeSlot = (timeKey) => {
      const dayOfWeek = selectedDay.value + 1;
      const dayData = scheduleData.value.find((item) => item.day_of_week === dayOfWeek);
      if (!dayData)
        return;
      const currentStatus = dayData.schedule[timeKey];
      if (currentStatus === 3) {
        common_vendor.index.showToast({
          title: "已约时间段不能修改",
          icon: "none"
        });
        return;
      }
      dayData.schedule[timeKey] = currentStatus === 1 ? 2 : 1;
    };
    const setAllAvailable = () => {
      const dayOfWeek = selectedDay.value + 1;
      const dayData = scheduleData.value.find((item) => item.day_of_week === dayOfWeek);
      if (!dayData)
        return;
      Object.keys(dayData.schedule).forEach((timeKey) => {
        if (dayData.schedule[timeKey] !== 3) {
          dayData.schedule[timeKey] = 1;
        }
      });
    };
    const setAllUnavailable = () => {
      const dayOfWeek = selectedDay.value + 1;
      const dayData = scheduleData.value.find((item) => item.day_of_week === dayOfWeek);
      if (!dayData)
        return;
      Object.keys(dayData.schedule).forEach((timeKey) => {
        if (dayData.schedule[timeKey] !== 3) {
          dayData.schedule[timeKey] = 2;
        }
      });
    };
    const saveSchedule = async () => {
      var _a;
      if (!companion_id.value) {
        common_vendor.index.showToast({
          title: "用户信息不完整",
          icon: "none"
        });
        return;
      }
      const dayOfWeek = selectedDay.value + 1;
      const dayData = scheduleData.value.find((item) => item.day_of_week === dayOfWeek);
      if (!dayData) {
        common_vendor.index.showToast({
          title: "未找到当前星期的数据",
          icon: "none"
        });
        return;
      }
      const originalDayData = originalScheduleData.value.find((item) => item.day_of_week === dayOfWeek);
      if (originalDayData && JSON.stringify(originalDayData.schedule) === JSON.stringify(dayData.schedule)) {
        common_vendor.index.showToast({
          title: "没有修改内容",
          icon: "none"
        });
        return;
      }
      const saveData = {
        companion_id: companion_id.value,
        day_of_week: dayOfWeek,
        schedule: dayData.schedule
      };
      common_vendor.index.__f__("log", "at subPackages/partner/components/DataSelect.vue:354", "准备保存的数据:", saveData);
      try {
        common_vendor.index.showLoading({
          title: "保存中..."
        });
        const response = await api_user.saveCompanionSchedule(saveData);
        common_vendor.index.hideLoading();
        if (response.data && response.data.code === 0) {
          const originalIndex = originalScheduleData.value.findIndex((item) => item.day_of_week === dayOfWeek);
          if (originalIndex !== -1) {
            originalScheduleData.value[originalIndex] = JSON.parse(JSON.stringify(dayData));
          }
          common_vendor.index.showToast({
            title: "保存成功",
            icon: "success"
          });
          common_vendor.index.__f__("log", "at subPackages/partner/components/DataSelect.vue:376", "保存成功:", response.data);
        } else {
          common_vendor.index.showToast({
            title: ((_a = response.data) == null ? void 0 : _a.msg) || "保存失败",
            icon: "none"
          });
          common_vendor.index.__f__("error", "at subPackages/partner/components/DataSelect.vue:382", "保存失败:", response.data);
        }
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: "网络错误，请重试",
          icon: "none"
        });
        common_vendor.index.__f__("error", "at subPackages/partner/components/DataSelect.vue:390", "保存接口调用失败:", error);
      }
    };
    const calculateTimeGridHeight = () => {
      const systemInfo = common_vendor.index.getSystemInfoSync();
      const screenHeight = systemInfo.windowHeight;
      timeGridHeight.value = screenHeight - 10;
      common_vendor.index.__f__("log", "at subPackages/partner/components/DataSelect.vue:404", "timeGridHeight.value:", timeGridHeight.value);
      common_vendor.index.createSelectorQuery().select(".time-grid-header").boundingClientRect((rect) => {
        if (rect) {
          timeGridHeight.value = timeGridHeight.value - rect.bottom;
        }
      }).exec();
      common_vendor.index.createSelectorQuery().select(".bottom-fixed").boundingClientRect((rect) => {
        if (rect) {
          common_vendor.index.__f__("log", "at subPackages/partner/components/DataSelect.vue:419", "rect:", rect.height);
          timeGridHeight.value = timeGridHeight.value - rect.height;
        }
      }).exec();
    };
    common_vendor.onMounted(() => {
      common_vendor.index.__f__("log", "at subPackages/partner/components/DataSelect.vue:431", "DataSelect组件mounted");
      getPageParams();
      callScheduleAPI();
      calculateTimeGridHeight();
    });
    return (_ctx, _cache) => {
      return {
        a: common_vendor.f(weekDays.value, (day, index, i0) => {
          return {
            a: common_vendor.t(day.name),
            b: common_vendor.t(getDayStatus(index)),
            c: day.key,
            d: selectedDay.value === index ? 1 : "",
            e: isToday(index) ? 1 : "",
            f: common_vendor.o(($event) => selectDay(index), day.key)
          };
        }),
        b: common_vendor.t(getSelectedDayName()),
        c: common_vendor.o(setAllAvailable),
        d: common_vendor.o(setAllUnavailable),
        e: common_vendor.f(getCurrentDaySchedule(), (timeSlot, timeKey, i0) => {
          return {
            a: common_vendor.t(timeKey),
            b: common_vendor.t(getStatusText(timeSlot)),
            c: timeKey,
            d: common_vendor.n(getTimeSlotClass(timeSlot)),
            e: common_vendor.o(($event) => toggleTimeSlot(timeKey), timeKey)
          };
        }),
        f: timeGridHeight.value + "px",
        g: common_vendor.o(saveSchedule)
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-7b3497a4"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/subPackages/partner/components/DataSelect.js.map
