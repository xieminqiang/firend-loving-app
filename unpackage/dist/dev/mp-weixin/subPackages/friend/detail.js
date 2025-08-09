"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const api_friends = require("../../api/friends.js");
const stores_level = require("../../stores/level.js");
const _sfc_main = {
  __name: "detail",
  setup(__props) {
    const params = common_vendor.ref({});
    const levelStore = stores_level.useLevelStore();
    const tabs = ["提供项目", "TA的动态", "客户评价"];
    const activeTab = common_vendor.ref(0);
    function switchTab(idx) {
      activeTab.value = idx;
    }
    const user = common_vendor.ref({});
    const banners = common_vendor.ref([]);
    const services = common_vendor.ref([]);
    const currentLevel = common_vendor.computed(() => {
      if (!user.value.level_order || !levelStore.sortedServiceLevels.length) {
        return null;
      }
      return levelStore.sortedServiceLevels.find((level) => level.level_order === user.value.level_order);
    });
    const comments = [];
    const goToSubmit = (item) => {
      common_vendor.index.navigateTo({
        url: `/subPackages/order/submit?service_id=${item.service_id}&price_template_id=${item.price_template_id || ""}&companion_id=${params.value.id}&level_order=${user.value.level_order || ""}&nickname=${user.value.nickname}`
      });
    };
    const getCityServicesData = async () => {
      var _a;
      try {
        const requestParams = {
          city_code: params.value.city_code,
          application_id: params.value.id
        };
        if (params.value.latitude && params.value.longitude) {
          requestParams.latitude = parseFloat(params.value.latitude);
          requestParams.longitude = parseFloat(params.value.longitude);
        }
        const response = await api_friends.getCityServices(requestParams);
        common_vendor.index.__f__("log", "at subPackages/friend/detail.vue:194", "城市服务信息响应:", response);
        if (response.data && response.data.code === 0) {
          const data = response.data.data;
          common_vendor.index.__f__("log", "at subPackages/friend/detail.vue:199", "城市服务数据:", data);
          if (data) {
            user.value = {
              avatar: data.avatar,
              nickname: data.nickname || "未知用户",
              verified: true,
              age: data.age,
              weight: data.weight,
              height: data.height,
              distance: data.distance,
              tags: data.tags || [],
              // 添加用户标签
              level_order: data.level_order,
              // 添加等级序号
              levelIcon: "",
              // 先设为空，通过computed获取
              gender: data.gender || ""
              // 添加性别字段
            };
            if (data.photos && data.photos.length > 0) {
              banners.value = data.photos.map((photo) => ({
                img: photo
              }));
            }
            if (data.services && data.services.length > 0) {
              services.value = data.services.map((service) => ({
                title: service.service_name,
                img: "https://sygx-server-bucket-admin.oss-cn-shanghai.aliyuncs.com" + service.service_image_url || "",
                tags: service.service_tags,
                price: service.price,
                service_id: service.service_id,
                price_template_id: service.price_template_id || "",
                unit: service.unit,
                min_quantity: service.min_quantity
              }));
            }
          }
        } else {
          common_vendor.index.__f__("error", "at subPackages/friend/detail.vue:242", "获取城市服务失败:", ((_a = response.data) == null ? void 0 : _a.message) || "未知错误");
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at subPackages/friend/detail.vue:245", "获取城市服务异常:", error);
      }
    };
    common_vendor.onMounted(async () => {
      await levelStore.fetchServiceLevels();
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      params.value = currentPage.options || {};
      common_vendor.index.__f__("log", "at subPackages/friend/detail.vue:260", "页面参数:", params.value);
      common_vendor.index.__f__("log", "at subPackages/friend/detail.vue:261", "经纬度参数:", {
        latitude: params.value.latitude,
        longitude: params.value.longitude
      });
      if (params.value.id && params.value.city_code) {
        getCityServicesData();
      }
    });
    return (_ctx, _cache) => {
      var _a, _b, _c, _d;
      return common_vendor.e({
        a: user.value.avatar,
        b: common_vendor.t(user.value.nickname),
        c: user.value.verified && currentLevel.value
      }, user.value.verified && currentLevel.value ? {
        d: (_a = currentLevel.value) == null ? void 0 : _a.icon_url
      } : {}, {
        e: (_b = currentLevel.value) == null ? void 0 : _b.level_name
      }, ((_c = currentLevel.value) == null ? void 0 : _c.level_name) ? {
        f: common_vendor.t((_d = currentLevel.value) == null ? void 0 : _d.level_name)
      } : {}, {
        g: user.value.tags && user.value.tags.length > 0
      }, user.value.tags && user.value.tags.length > 0 ? {
        h: common_vendor.f(user.value.tags, (tag, k0, i0) => {
          return {
            a: common_vendor.t(tag),
            b: tag
          };
        })
      } : {}, {
        i: user.value.gender === "女" ? "/static/icons/friend/white_nv.png" : "/static/icons/friend/white_nan.png",
        j: common_vendor.t(user.value.age),
        k: common_vendor.t(user.value.weight),
        l: common_vendor.t(user.value.height),
        m: user.value.distance !== ""
      }, user.value.distance !== "" ? {
        n: common_assets._imports_0$5,
        o: common_vendor.t(user.value.distance)
      } : {}, {
        p: common_vendor.f(banners.value, (item, idx, i0) => {
          return {
            a: item.img,
            b: idx
          };
        }),
        q: common_assets._imports_1$8,
        r: common_assets._imports_2$4,
        s: common_assets._imports_3$3,
        t: common_vendor.f(tabs, (tab, idx, i0) => {
          return common_vendor.e({
            a: common_vendor.t(tab),
            b: activeTab.value === idx
          }, activeTab.value === idx ? {} : {}, {
            c: tab,
            d: common_vendor.n({
              active: activeTab.value === idx
            }),
            e: common_vendor.o(($event) => switchTab(idx), tab)
          });
        }),
        v: services.value.length > 0
      }, services.value.length > 0 ? {
        w: common_vendor.f(services.value, (item, k0, i0) => {
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
        x: common_assets._imports_3
      }, {
        y: activeTab.value === 0,
        z: common_assets._imports_3,
        A: activeTab.value === 1,
        B: comments.length > 0
      }, comments.length > 0 ? {
        C: common_vendor.f(comments, (comment, idx, i0) => {
          return {
            a: comment.avatar,
            b: common_vendor.t(comment.name),
            c: common_vendor.f(5, (n, k1, i1) => {
              return {
                a: n,
                b: common_vendor.n({
                  filled: n <= comment.stars
                })
              };
            }),
            d: common_vendor.t(comment.stars >= 4 ? "好评" : "中评"),
            e: common_vendor.f(comment.tags, (tag, k1, i1) => {
              return {
                a: common_vendor.t(tag),
                b: tag
              };
            }),
            f: common_vendor.t(comment.content),
            g: common_vendor.t(comment.date),
            h: idx
          };
        })
      } : {
        D: common_assets._imports_3
      }, {
        E: activeTab.value === 2
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-21c5b98b"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/subPackages/friend/detail.js.map
