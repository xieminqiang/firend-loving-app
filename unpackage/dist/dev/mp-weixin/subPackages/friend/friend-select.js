"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const api_friends = require("../../api/friends.js");
require("../../config/http.js");
const stores_level = require("../../stores/level.js");
const stores_city = require("../../stores/city.js");
if (!Array) {
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  _easycom_uni_popup2();
}
const _easycom_uni_popup = () => "../../uni_modules/uni-popup/components/uni-popup/uni-popup.js";
if (!Math) {
  (CitySelector + CityPicker + _easycom_uni_popup)();
}
const CitySelector = () => "../../components/common/CitySelector.js";
const CityPicker = () => "../../components/common/CityPicker.js";
const _sfc_main = {
  __name: "friend-select",
  setup(__props) {
    const statusBarHeight = common_vendor.ref(0);
    common_vendor.ref(null);
    const safeAreaRight = common_vendor.ref(0);
    const search = common_vendor.ref("");
    const isRefreshing = common_vendor.ref(false);
    const showCityPicker = common_vendor.ref(false);
    const serviceId = common_vendor.ref("");
    const latitude = common_vendor.computed(() => {
      var _a;
      return ((_a = cityStore.userLocation) == null ? void 0 : _a.latitude) || null;
    });
    const longitude = common_vendor.computed(() => {
      var _a;
      return ((_a = cityStore.userLocation) == null ? void 0 : _a.longitude) || null;
    });
    common_vendor.ref(false);
    const cityStore = stores_city.useCityStore();
    common_vendor.computed(() => cityStore.cityList);
    common_vendor.computed(() => cityStore.currentCity);
    const partnersList = common_vendor.ref([]);
    const total = common_vendor.ref(0);
    const currentPage = common_vendor.ref(1);
    const pageSize = common_vendor.ref(20);
    const loading = common_vendor.ref(false);
    const hasMore = common_vendor.ref(true);
    const dataLoaded = common_vendor.ref(false);
    const levelStore = stores_level.useLevelStore();
    const processedPartnersList = common_vendor.computed(function() {
      return partnersList.value.map(function(partner) {
        const visibleTags = partner.tags ? partner.tags.slice(0, 3) : [];
        const extraTags = partner.tags && partner.tags.length > 3 ? partner.tags.length - 3 : 0;
        return {
          ...partner,
          visibleTags,
          extraTags
        };
      });
    });
    const servicePopup = common_vendor.ref(null);
    const currentPartnerServices = common_vendor.ref([]);
    const currentPartner = common_vendor.ref(null);
    const scrollTop = common_vendor.ref(0);
    const openServicePopup = async (partner) => {
      currentPartner.value = partner;
      try {
        const requestParams = {
          city_code: cityStore.currentCityCode,
          application_id: partner.id
        };
        if (latitude.value && longitude.value) {
          requestParams.latitude = parseFloat(latitude.value);
          requestParams.longitude = parseFloat(longitude.value);
        }
        const response = await api_friends.getCityServices(requestParams);
        if (response.data && response.data.code === 0) {
          const data = response.data.data;
          if (data && data.services && data.services.length > 0) {
            currentPartnerServices.value = data.services.map((service) => ({
              title: service.service_name,
              img: "https://sygx-server-bucket-admin.oss-cn-shanghai.aliyuncs.com" + service.service_image_url || "",
              tags: service.service_tags || [],
              price: service.price,
              service_id: service.service_id,
              price_template_id: service.price_template_id || "",
              unit: service.unit,
              min_quantity: service.min_quantity
            }));
          } else {
            currentPartnerServices.value = [];
          }
        } else {
          currentPartnerServices.value = [];
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at subPackages/friend/friend-select.vue:245", "获取服务信息失败:", error);
        currentPartnerServices.value = [];
      }
      servicePopup.value.open();
    };
    const closeServicePopup = () => {
      servicePopup.value.close();
    };
    const goToSubmit = (item) => {
      common_vendor.index.__f__("log", "at subPackages/friend/friend-select.vue:259", "选择服务:", item);
      closeServicePopup();
      let url = `/subPackages/order/submit?service_id=${item.service_id}&price_template_id=${item.price_template_id || ""}&companion_id=${currentPartner.value.id}&level_order=${currentPartner.value.level_order || ""}&nickname=${currentPartner.value.name}`;
      if (serviceId.value) {
        url += `&original_service_id=${serviceId.value}`;
      }
      common_vendor.index.navigateTo({
        url
      });
    };
    const navigateToDetail = (partnerId) => {
      let url = "/subPackages/friend/detail?id=" + partnerId + "&city_code=" + cityStore.currentCityCode;
      if (latitude.value && longitude.value) {
        url += "&latitude=" + latitude.value + "&longitude=" + longitude.value;
      }
      common_vendor.index.navigateTo({
        url
      });
    };
    const searchCompanionsData = async (isRefresh = false) => {
      var _a;
      if (loading.value)
        return;
      loading.value = true;
      try {
        const params = {
          page: isRefresh ? 1 : currentPage.value,
          page_size: pageSize.value
        };
        if (cityStore.currentCityCode) {
          params.city_code = cityStore.currentCityCode;
        }
        if (search.value && search.value.trim()) {
          params.nickname = search.value.trim();
        }
        if (latitude.value && longitude.value) {
          params.latitude = latitude.value;
          params.longitude = longitude.value;
        }
        if (serviceId.value) {
          params.service_id = serviceId.value;
        }
        common_vendor.index.__f__("log", "at subPackages/friend/friend-select.vue:372", "搜索参数:", params);
        const response = await api_friends.searchCompanions(params);
        common_vendor.index.__f__("log", "at subPackages/friend/friend-select.vue:376", "API完整响应:", response);
        if (response.data && response.data.code === 0) {
          const data = response.data.data;
          if (data && data.list) {
            const newData = data.list.map((item) => ({
              id: item.id,
              name: item.nickname,
              gender: item.gender,
              age: item.age,
              height: item.height,
              weight: item.weight,
              distance: item.distance,
              tags: item.tags || [],
              services: (() => {
                if (typeof item.services === "string") {
                  try {
                    return JSON.parse(item.services);
                  } catch (e) {
                    common_vendor.index.__f__("error", "at subPackages/friend/friend-select.vue:395", "解析services JSON失败:", e);
                    return [];
                  }
                }
                return item.services || [];
              })(),
              // 安全解析JSON字符串数组
              avatar: item.avatar,
              online: item.is_online === 1,
              bookable: item.can_accept_orders === "Y"
            }));
            if (isRefresh) {
              partnersList.value = newData;
              currentPage.value = 1;
            } else {
              partnersList.value = [...partnersList.value, ...newData];
              currentPage.value++;
            }
            total.value = data.total || 0;
            hasMore.value = newData.length === pageSize.value;
            common_vendor.index.__f__("log", "at subPackages/friend/friend-select.vue:417", "搜索成功，共获取", newData.length, "条数据，总数:", total.value);
            if (newData.length === 0 && isRefresh) {
            }
          } else {
            common_vendor.index.__f__("log", "at subPackages/friend/friend-select.vue:428", "API返回数据为空");
            if (isRefresh) {
              partnersList.value = [];
              total.value = 0;
            }
          }
        } else {
          common_vendor.index.__f__("error", "at subPackages/friend/friend-select.vue:436", "API返回错误:", response.data);
          const errorMsg = ((_a = response.data) == null ? void 0 : _a.message) || "搜索失败";
          common_vendor.index.showToast({
            title: errorMsg,
            icon: "none",
            duration: 2e3
          });
          if (isRefresh) {
            partnersList.value = [];
            total.value = 0;
          }
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at subPackages/friend/friend-select.vue:450", "搜索伴友师失败:", error);
        common_vendor.index.__f__("error", "at subPackages/friend/friend-select.vue:451", "错误详情:", error.response || error);
        let errorMsg = "搜索失败，请重试";
        if (error.response && error.response.data) {
          errorMsg = error.response.data.message || errorMsg;
        }
        common_vendor.index.showToast({
          title: errorMsg,
          icon: "none",
          duration: 2e3
        });
        if (isRefresh) {
          partnersList.value = [];
          total.value = 0;
        }
      } finally {
        loading.value = false;
        dataLoaded.value = true;
      }
    };
    const loadMore = () => {
      if (!loading.value && hasMore.value) {
        searchCompanionsData(false);
      }
    };
    const onRefresh = async () => {
      isRefreshing.value = true;
      await searchCompanionsData(true);
      await new Promise((resolve) => setTimeout(resolve, 800));
      isRefreshing.value = false;
    };
    const onSearchInput = () => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        searchCompanionsData(true);
      }, 500);
    };
    let searchTimer = null;
    const handleBack = () => {
      common_vendor.index.navigateBack({
        delta: 1
      });
    };
    const onCitySelected = async (index) => {
      common_vendor.index.vibrateShort({
        type: "light"
      });
      await searchCompanionsData(true);
    };
    common_vendor.onMounted(async () => {
      const pages = getCurrentPages();
      const currentPage2 = pages[pages.length - 1];
      const options = currentPage2.options || {};
      if (options.service_id) {
        serviceId.value = options.service_id;
        common_vendor.index.__f__("log", "at subPackages/friend/friend-select.vue:531", "接收到的服务ID:", serviceId.value);
      }
      const systemInfo = common_vendor.index.getSystemInfoSync();
      statusBarHeight.value = systemInfo.statusBarHeight;
      const menuButtonInfo = common_vendor.index.getMenuButtonBoundingClientRect();
      menuButtonInfo.value = menuButtonInfo;
      const screenWidth = systemInfo.screenWidth;
      const menuButtonRight = menuButtonInfo.right;
      safeAreaRight.value = screenWidth - menuButtonRight + 24;
      await levelStore.fetchServiceLevels();
      await cityStore.initCityData();
      await searchCompanionsData(true);
    });
    common_vendor.onUnmounted(() => {
      if (searchTimer) {
        clearTimeout(searchTimer);
      }
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_assets._imports_0$3,
        b: common_vendor.o(handleBack),
        c: common_vendor.o(($event) => showCityPicker.value = true),
        d: common_assets._imports_1,
        e: common_vendor.o([($event) => search.value = $event.detail.value, onSearchInput]),
        f: search.value,
        g: safeAreaRight.value + "px",
        h: statusBarHeight.value + "px",
        i: loading.value && !dataLoaded.value
      }, loading.value && !dataLoaded.value ? {} : processedPartnersList.value.length > 0 ? {
        k: common_vendor.f(processedPartnersList.value, (p, k0, i0) => {
          return common_vendor.e({
            a: p.avatar,
            b: p.online
          }, p.online ? {} : {}, {
            c: common_vendor.t(p.name),
            d: p.gender === "女"
          }, p.gender === "女" ? {
            e: common_assets._imports_2
          } : {
            f: common_assets._imports_3$1
          }, {
            g: common_vendor.t(p.age),
            h: common_vendor.t(p.height),
            i: common_vendor.t(p.weight),
            j: common_vendor.t(p.distance),
            k: common_vendor.f(p.visibleTags, (tag, index, i1) => {
              return {
                a: common_vendor.t(tag),
                b: index
              };
            }),
            l: p.extraTags > 0
          }, p.extraTags > 0 ? {
            m: common_vendor.t(p.extraTags)
          } : {}, {
            n: common_vendor.o(($event) => openServicePopup(p), p.id),
            o: p.id,
            p: common_vendor.o(($event) => navigateToDetail(p.id), p.id)
          });
        }),
        l: common_assets._imports_4
      } : dataLoaded.value && processedPartnersList.value.length === 0 ? {
        n: common_assets._imports_3
      } : {}, {
        j: processedPartnersList.value.length > 0,
        m: dataLoaded.value && processedPartnersList.value.length === 0,
        o: common_vendor.o(loadMore),
        p: isRefreshing.value,
        q: common_vendor.o(onRefresh),
        r: common_vendor.o(onCitySelected),
        s: common_vendor.o(($event) => showCityPicker.value = $event),
        t: common_vendor.p({
          visible: showCityPicker.value
        }),
        v: common_assets._imports_6,
        w: common_vendor.o(closeServicePopup),
        x: currentPartnerServices.value.length > 0
      }, currentPartnerServices.value.length > 0 ? {
        y: common_vendor.f(currentPartnerServices.value, (item, k0, i0) => {
          return {
            a: item.img,
            b: common_vendor.t(item.title),
            c: common_vendor.f(item.tags, (tag, k1, i1) => {
              return {
                a: common_vendor.t(tag),
                b: tag
              };
            }),
            d: common_vendor.t(item.price),
            e: common_vendor.t(item.unit || "小时"),
            f: common_vendor.o(($event) => goToSubmit(item), item.title),
            g: item.title
          };
        })
      } : {
        z: common_assets._imports_3
      }, {
        A: scrollTop.value,
        B: common_vendor.sr(servicePopup, "b8e59853-2", {
          "k": "servicePopup"
        }),
        C: common_vendor.o(closeServicePopup),
        D: common_vendor.p({
          type: "bottom",
          ["mask-click"]: true,
          round: "20",
          ["safe-area"]: false
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-b8e59853"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/subPackages/friend/friend-select.js.map
