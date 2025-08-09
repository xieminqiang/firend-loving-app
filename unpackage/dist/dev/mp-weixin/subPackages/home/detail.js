"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const api_home = require("../../api/home.js");
const _sfc_main = {
  __name: "detail",
  setup(__props) {
    const params = common_vendor.ref({});
    const loading = common_vendor.ref(true);
    const error = common_vendor.ref("");
    const serviceDetail = common_vendor.ref({});
    const priceTemplate = common_vendor.ref({});
    common_vendor.onMounted(() => {
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      params.value = currentPage.options || {};
      common_vendor.index.__f__("log", "at subPackages/home/detail.vue:133", "详情页参数:", params.value);
      if (!params.value.id) {
        error.value = "缺少服务ID参数";
        loading.value = false;
        return;
      }
      loadData();
    });
    const loadData = async () => {
      loading.value = true;
      error.value = "";
      try {
        const serviceRes = await api_home.getServiceDetail(params.value.id);
        if (serviceRes.data && serviceRes.data.code === 0) {
          serviceDetail.value = serviceRes.data.data;
          const templateId = params.value.price_template_id || serviceDetail.value.price_template_id;
          if (templateId) {
            common_vendor.index.__f__("log", "at subPackages/home/detail.vue:159", "加载价格模板详情, ID:", templateId);
            try {
              const templateRes = await api_home.getPriceTemplateDetail(templateId);
              if (templateRes.data && templateRes.data.code === 0) {
                priceTemplate.value = templateRes.data.data;
                common_vendor.index.__f__("log", "at subPackages/home/detail.vue:164", "价格模板加载成功:", priceTemplate.value);
              } else {
                common_vendor.index.__f__("warn", "at subPackages/home/detail.vue:166", "价格模板接口返回错误:", templateRes.data);
              }
            } catch (templateError) {
              common_vendor.index.__f__("warn", "at subPackages/home/detail.vue:169", "获取价格模板失败:", templateError);
            }
          } else {
            common_vendor.index.__f__("log", "at subPackages/home/detail.vue:172", "没有价格模板ID，跳过价格模板加载");
          }
        } else {
          throw new Error(serviceRes.data && serviceRes.data.message || "获取服务详情失败");
        }
      } catch (err) {
        common_vendor.index.__f__("error", "at subPackages/home/detail.vue:179", "加载数据失败:", err);
        error.value = err.message || "加载失败，请重试";
      } finally {
        loading.value = false;
      }
    };
    const goBack = () => {
      common_vendor.index.navigateBack();
    };
    const onImageError = () => {
      common_vendor.index.__f__("log", "at subPackages/home/detail.vue:193", "图片加载失败");
    };
    const previewImage = () => {
      if (serviceDetail.value && serviceDetail.value.image_url) {
        const imgBaseUrl = "https://sygx-server-bucket-admin.oss-cn-shanghai.aliyuncs.com";
        const imageUrl = serviceDetail.value.image_url.startsWith("http") ? serviceDetail.value.image_url : imgBaseUrl + serviceDetail.value.image_url;
        common_vendor.index.__f__("log", "at subPackages/home/detail.vue:206", "预览图片URL:", imageUrl);
        common_vendor.index.previewImage({
          urls: [imageUrl],
          current: imageUrl,
          success: () => {
            common_vendor.index.__f__("log", "at subPackages/home/detail.vue:212", "图片预览成功");
          },
          fail: (err) => {
            common_vendor.index.__f__("error", "at subPackages/home/detail.vue:215", "图片预览失败:", err);
            common_vendor.index.showToast({
              title: "图片预览失败",
              icon: "none"
            });
          }
        });
      } else {
        common_vendor.index.showToast({
          title: "图片加载中，请稍后再试",
          icon: "none"
        });
      }
    };
    const bookService = () => {
      common_vendor.index.navigateTo({
        url: `/subPackages/friend/friend-select?service_id=${serviceDetail.value.id}`
      });
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: loading.value
      }, loading.value ? {} : !error.value ? common_vendor.e({
        c: common_assets._imports_0$3,
        d: common_vendor.o(goBack),
        e: _ctx.$imgBaseUrl + serviceDetail.value.image_url,
        f: common_vendor.o(onImageError),
        g: common_vendor.o(previewImage),
        h: common_vendor.t(serviceDetail.value.name || "服务详情"),
        i: serviceDetail.value.min_price
      }, serviceDetail.value.min_price ? common_vendor.e({
        j: common_vendor.t(serviceDetail.value.min_price),
        k: priceTemplate.value.unit
      }, priceTemplate.value.unit ? {
        l: common_vendor.t(priceTemplate.value.unit)
      } : {}) : {}, {
        m: serviceDetail.value.tags && serviceDetail.value.tags.length > 0
      }, serviceDetail.value.tags && serviceDetail.value.tags.length > 0 ? {
        n: common_vendor.f(serviceDetail.value.tags, (tag, k0, i0) => {
          return {
            a: common_vendor.t(tag),
            b: tag
          };
        })
      } : {}, {
        o: priceTemplate.value && priceTemplate.value.levels && priceTemplate.value.levels.length > 0
      }, priceTemplate.value && priceTemplate.value.levels && priceTemplate.value.levels.length > 0 ? {
        p: common_assets._imports_1$6,
        q: common_vendor.f(priceTemplate.value.levels, (level, k0, i0) => {
          return common_vendor.e({
            a: common_vendor.t(level.level_name),
            b: level.level_order <= 2
          }, level.level_order <= 2 ? {
            c: common_vendor.t(level.level_order === 1 ? "入门" : "推荐")
          } : {}, {
            d: common_vendor.t(level.price),
            e: common_vendor.t(level.unit),
            f: level.id
          });
        })
      } : {}, {
        r: common_assets._imports_2$3,
        s: common_vendor.t(serviceDetail.value.description || "暂无详细说明")
      }) : {}, {
        b: !error.value,
        t: !loading.value && !error.value
      }, !loading.value && !error.value ? {
        v: common_vendor.o(bookService)
      } : {}, {
        w: error.value
      }, error.value ? {
        x: common_assets._imports_3,
        y: common_vendor.t(error.value),
        z: common_vendor.o(loadData)
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-5b390ea8"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/subPackages/home/detail.js.map
