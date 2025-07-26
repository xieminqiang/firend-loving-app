"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const stores_city = require("../../stores/city.js");
const _sfc_main = {
  __name: "CitySelector",
  emits: ["click"],
  setup(__props, { emit: __emit }) {
    const emit = __emit;
    const cityStore = stores_city.useCityStore();
    const currentCity = common_vendor.computed(() => cityStore.currentCity);
    const handleClick = () => {
      emit("click");
    };
    return (_ctx, _cache) => {
      return {
        a: common_assets._imports_0$8,
        b: common_vendor.t(currentCity.value),
        c: common_assets._imports_1$1,
        d: common_vendor.o(handleClick)
      };
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-e1a05edf"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/common/CitySelector.js.map
