"use strict";
const common_vendor = require("../../../common/vendor.js");
const common_assets = require("../../../common/assets.js");
const api_home = require("../../../api/home.js");
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const statusBarHeight = common_vendor.ref(0);
    const navBarHeight = common_vendor.ref(44);
    common_vendor.onMounted(async () => {
      const systemInfo = common_vendor.index.getSystemInfoSync();
      statusBarHeight.value = systemInfo.statusBarHeight || 0;
      navBarHeight.value = 44;
      bannerTimer = setInterval(() => {
        nextBanner();
      }, 5e3);
      await loadCityList();
      await loadSingleTabData(serviceTab.value);
    });
    const cityList = common_vendor.ref([]);
    const cityIndex = common_vendor.ref(0);
    const city = common_vendor.computed(() => {
      var _a;
      if (cityList.value.length > 0) {
        return ((_a = cityList.value[cityIndex.value]) == null ? void 0 : _a.name) || "选择城市";
      }
      return "选择城市";
    });
    const currentCityCode = common_vendor.computed(() => {
      var _a;
      if (cityList.value.length > 0) {
        return ((_a = cityList.value[cityIndex.value]) == null ? void 0 : _a.code) || null;
      }
      return null;
    });
    const loadCityList = async () => {
      try {
        const response = await api_home.getCityList();
        if (response.data && response.data.code === 0 && response.data.data) {
          cityList.value = response.data.data.map((city2) => ({
            name: city2.name,
            code: city2.city_code
            // 保持字段名一致
          }));
          if (cityList.value.length > 0) {
            cityIndex.value = 0;
          }
          common_vendor.index.__f__("log", "at pages/tabbar/home/index.vue:237", "城市列表加载成功:", cityList.value);
        } else {
          common_vendor.index.__f__("warn", "at pages/tabbar/home/index.vue:239", "获取城市列表失败，使用默认城市列表");
          cityList.value = [];
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/tabbar/home/index.vue:246", "获取城市列表失败:", error);
        cityList.value = [];
      }
    };
    const currentBanner = common_vendor.ref(0);
    const serviceTab = common_vendor.ref("服务");
    const serviceTabs = ["服务", "娱乐", "运动"];
    let bannerTimer = null;
    common_vendor.onUnmounted(() => {
      if (bannerTimer) {
        clearInterval(bannerTimer);
      }
    });
    function nextBanner() {
      if (currentBanner.value < banners.length - 1) {
        currentBanner.value++;
      } else {
        currentBanner.value = 0;
      }
    }
    const banners = [
      {
        title: "友伴招募",
        subtitle: "挑战高薪 | 男女不限",
        img: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80"
      },
      {
        title: "监督举报",
        subtitle: "平台禁止私下交易",
        img: "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80"
      },
      {
        title: "全国热招",
        subtitle: "城市独家运营商",
        img: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80"
      }
    ];
    const allServiceItems = common_vendor.ref({
      "服务": [],
      "娱乐": [],
      "运动": []
    });
    const dataLoaded = common_vendor.ref({
      "服务": false,
      "娱乐": false,
      "运动": false
    });
    const dataLoading = common_vendor.ref({
      "服务": false,
      "娱乐": false,
      "运动": false
    });
    const loadSingleTabData = async (tab, forceRefresh = false) => {
      if (dataLoaded.value[tab] && !dataLoading.value[tab] && !forceRefresh) {
        common_vendor.index.__f__("log", "at pages/tabbar/home/index.vue:331", `${tab}数据已缓存，跳过加载`);
        return;
      }
      dataLoading.value[tab] = true;
      common_vendor.index.__f__("log", "at pages/tabbar/home/index.vue:336", `开始加载${tab}服务数据，当前城市代码:`, currentCityCode.value, forceRefresh ? "(强制刷新)" : "");
      try {
        const requestParams = {
          category: getTabCategoryId(tab),
          page_size: 10,
          city_code: currentCityCode.value
          // 传递当前选中城市的代码
        };
        common_vendor.index.__f__("log", "at pages/tabbar/home/index.vue:345", `${tab}服务请求参数:`, requestParams);
        const response = await api_home.getHotRecommendServices(requestParams);
        if (response.data && response.data.code === 0 && response.data.data && response.data.data.list) {
          allServiceItems.value[tab] = response.data.data.list.map((item) => ({
            id: item.id,
            name: item.name,
            desc: item.description,
            tags: item.tags || [],
            img: item.image_url || "/static/images/service-default.png",
            min_price: item.min_price || 0,
            unit: item.unit || "次"
            // 添加单位字段
          }));
          common_vendor.index.__f__("log", "at pages/tabbar/home/index.vue:361", `${tab}服务数据加载成功，共${allServiceItems.value[tab].length}条`);
        } else {
          allServiceItems.value[tab] = [];
          common_vendor.index.__f__("log", "at pages/tabbar/home/index.vue:365", `${tab}服务数据为空`);
        }
        dataLoaded.value[tab] = true;
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/tabbar/home/index.vue:369", `获取${tab}服务数据失败:`, error);
        allServiceItems.value[tab] = [];
        dataLoaded.value[tab] = true;
      } finally {
        dataLoading.value[tab] = false;
      }
    };
    const loadAllServicesData = async () => {
      common_vendor.index.__f__("log", "at pages/tabbar/home/index.vue:380", "重新加载所有选项卡数据");
      Object.keys(dataLoaded.value).forEach((tab) => {
        dataLoaded.value[tab] = false;
      });
      await loadSingleTabData(serviceTab.value);
    };
    const getTabCategoryId = (tabName) => {
      switch (tabName) {
        case "服务":
          return 1;
        case "娱乐":
          return 2;
        case "运动":
          return 3;
        default:
          return 0;
      }
    };
    const currentTabIndex = common_vendor.ref(0);
    const switchServiceTab = async (tab) => {
      const oldTab = serviceTab.value;
      serviceTab.value = tab;
      currentTabIndex.value = serviceTabs.indexOf(tab);
      if (oldTab !== tab && !dataLoaded.value[tab]) {
        await loadSingleTabData(tab);
      }
    };
    const onSwiperChange = (e) => {
      const index = e.detail.current;
      currentTabIndex.value = index;
      serviceTab.value = serviceTabs[index];
    };
    const getTabServiceItems = (tab) => {
      return allServiceItems.value[tab] || [];
    };
    let touchStartX = 0;
    let touchEndX = 0;
    function onTouchStart(e) {
      touchStartX = e.touches[0].clientX;
    }
    function onTouchMove(e) {
      touchEndX = e.touches[0].clientX;
    }
    function onTouchEnd() {
      if (touchEndX === 0)
        return;
      if (touchEndX - touchStartX > 50 && currentBanner.value > 0) {
        currentBanner.value--;
      } else if (touchStartX - touchEndX > 50 && currentBanner.value < banners.length - 1) {
        currentBanner.value++;
      }
      touchStartX = 0;
      touchEndX = 0;
    }
    function navigateToServiceDetail(serviceId) {
      common_vendor.index.__f__("log", "at pages/tabbar/home/index.vue:452", "跳转到服务详情页, ID:", serviceId);
      common_vendor.index.navigateTo({
        url: `/subPackages/home/detail?id=${serviceId}`
      });
    }
    const refreshing = common_vendor.ref(false);
    const isRefreshing = common_vendor.ref(false);
    const onRefresh = async (tab) => {
      if (isRefreshing.value || tab !== serviceTab.value) {
        return;
      }
      isRefreshing.value = true;
      refreshing.value = true;
      try {
        common_vendor.index.__f__("log", "at pages/tabbar/home/index.vue:483", `下拉刷新${tab}选项卡数据`);
        await loadSingleTabData(tab, true);
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/tabbar/home/index.vue:486", "刷新失败:", error);
      } finally {
        refreshing.value = false;
        isRefreshing.value = false;
      }
    };
    const onRefreshRestore = () => {
      refreshing.value = false;
      isRefreshing.value = false;
    };
    const showCityPicker = common_vendor.ref(false);
    function selectCity(index) {
      const oldCityIndex = cityIndex.value;
      cityIndex.value = index;
      showCityPicker.value = false;
      if (oldCityIndex !== index) {
        loadAllServicesData();
      }
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_assets._imports_0,
        b: common_vendor.t(city.value),
        c: common_assets._imports_1,
        d: common_vendor.o(($event) => showCityPicker.value = true),
        e: statusBarHeight.value + "px",
        f: common_vendor.f(banners, (b, idx, i0) => {
          return {
            a: b.img,
            b: common_vendor.t(b.title),
            c: common_vendor.t(b.subtitle),
            d: idx
          };
        }),
        g: `translateX(-${currentBanner.value * 100}%)`,
        h: common_vendor.f(banners, (_, index, i0) => {
          return {
            a: index,
            b: common_vendor.n({
              active: currentBanner.value === index
            }),
            c: common_vendor.o(($event) => currentBanner.value = index, index)
          };
        }),
        i: common_vendor.o(onTouchStart),
        j: common_vendor.o(onTouchMove),
        k: common_vendor.o(onTouchEnd),
        l: common_vendor.f(serviceTabs, (tab, k0, i0) => {
          return common_vendor.e({
            a: common_vendor.t(tab),
            b: serviceTab.value === tab
          }, serviceTab.value === tab ? {} : {}, {
            c: tab,
            d: common_vendor.n({
              active: serviceTab.value === tab
            }),
            e: common_vendor.o(($event) => switchServiceTab(tab), tab)
          });
        }),
        m: common_vendor.f(serviceTabs, (tab, k0, i0) => {
          return common_vendor.e({
            a: getTabServiceItems(tab).length > 0
          }, getTabServiceItems(tab).length > 0 ? {
            b: common_vendor.f(getTabServiceItems(tab), (item, k1, i1) => {
              return {
                a: _ctx.$imgBaseUrl + item.img,
                b: common_vendor.t(item.name),
                c: common_vendor.f(item.tags, (tag, k2, i2) => {
                  return {
                    a: common_vendor.t(tag),
                    b: tag
                  };
                }),
                d: common_vendor.t(item.min_price || 0),
                e: common_vendor.t(item.unit),
                f: item.id,
                g: common_vendor.o(($event) => navigateToServiceDetail(item.id), item.id)
              };
            })
          } : {
            c: common_assets._imports_5,
            d: common_vendor.t(tab)
          }, {
            e: common_vendor.o(($event) => onRefresh(tab), tab),
            f: common_vendor.o(onRefreshRestore, tab),
            g: tab
          });
        }),
        n: refreshing.value,
        o: currentTabIndex.value,
        p: common_vendor.o(onSwiperChange),
        q: showCityPicker.value
      }, showCityPicker.value ? {
        r: common_vendor.o(($event) => showCityPicker.value = false),
        s: common_vendor.f(cityList.value, (cityItem, index, i0) => {
          return common_vendor.e({
            a: common_vendor.t(cityItem.name),
            b: cityIndex.value === index
          }, cityIndex.value === index ? {} : {}, {
            c: index,
            d: common_vendor.n({
              active: cityIndex.value === index
            }),
            e: common_vendor.o(($event) => selectCity(index), index)
          });
        }),
        t: common_vendor.o(() => {
        }),
        v: common_vendor.o(($event) => showCityPicker.value = false)
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-30d82312"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/tabbar/home/index.js.map
