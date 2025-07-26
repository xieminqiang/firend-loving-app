"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const stores_user = require("../../stores/user.js");
const api_order = require("../../api/order.js");
const _sfc_main = {
  __name: "index",
  setup(__props) {
    stores_user.useUserStore();
    const currentStatus = common_vendor.ref("all");
    const isRefreshing = common_vendor.ref(false);
    const isLoading = common_vendor.ref(false);
    const isLoadingMore = common_vendor.ref(false);
    const hasMore = common_vendor.ref(true);
    const page = common_vendor.ref(1);
    const pageSize = common_vendor.ref(20);
    const orderListCache = common_vendor.ref({});
    const orderList = common_vendor.ref([]);
    const statusTabs = common_vendor.ref([
      { label: "全部", value: "all", count: 0 },
      { label: "待付款", value: "pending_payment", count: 0 },
      { label: "待服务", value: "pending_service", count: 0 },
      { label: "进行中", value: "in_service", count: 0 },
      { label: "已完成", value: "completed", count: 0 }
    ]);
    common_vendor.onLoad((options) => {
      common_vendor.index.__f__("log", "at subPackages/order/index.vue:138", "订单页面接收到的参数:", options);
      if (options.status) {
        common_vendor.index.__f__("log", "at subPackages/order/index.vue:140", "设置订单状态为:", options.status);
        currentStatus.value = options.status;
        page.value = 1;
        hasMore.value = true;
        orderList.value = [];
        delete orderListCache.value[options.status];
      } else {
        common_vendor.index.__f__("log", "at subPackages/order/index.vue:149", "没有传递状态参数，使用默认状态: all");
        currentStatus.value = "all";
      }
      common_vendor.index.__f__("log", "at subPackages/order/index.vue:154", "onLoad中加载数据，当前状态:", currentStatus.value);
      loadOrderList();
    });
    common_vendor.watch(currentStatus, (newStatus, oldStatus) => {
      common_vendor.index.__f__("log", "at subPackages/order/index.vue:160", "状态变化:", oldStatus, "->", newStatus);
    });
    const switchStatus = async (status) => {
      if (currentStatus.value === status)
        return;
      currentStatus.value = status;
      if (orderListCache.value[status]) {
        orderList.value = orderListCache.value[status].list;
        page.value = orderListCache.value[status].page;
        hasMore.value = orderListCache.value[status].hasMore;
      } else {
        page.value = 1;
        hasMore.value = true;
        orderList.value = [];
        try {
          await loadOrderList();
        } catch (error) {
          common_vendor.index.__f__("error", "at subPackages/order/index.vue:184", "切换状态失败:", error);
        }
      }
    };
    const loadOrderList = async () => {
      if (isLoading.value)
        return;
      isLoading.value = true;
      try {
        const params = {
          page: page.value,
          page_size: pageSize.value,
          status_group: currentStatus.value
        };
        const response = await api_order.getOrderList(params);
        common_vendor.index.__f__("log", "at subPackages/order/index.vue:203", "response.data", response.data);
        if (response.data.code === 0) {
          const { list, total } = response.data.data;
          if (page.value === 1) {
            orderList.value = list || [];
            updateCurrentStatusCount(total);
          } else {
            orderList.value.push(...list || []);
          }
          hasMore.value = orderList.value.length < total;
          orderListCache.value[currentStatus.value] = {
            list: [...orderList.value],
            page: page.value,
            hasMore: hasMore.value
          };
        } else {
          throw new Error(response.msg || "获取订单列表失败");
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at subPackages/order/index.vue:228", "加载订单列表失败:", error);
        common_vendor.index.showToast({
          title: error.message || "加载失败",
          icon: "none"
        });
      } finally {
        isLoading.value = false;
      }
    };
    const updateCurrentStatusCount = (total) => {
      const currentTab = statusTabs.value.find((tab) => tab.value === currentStatus.value);
      if (currentTab) {
        currentTab.count = total || 0;
      }
    };
    const onRefresh = async () => {
      if (isRefreshing.value)
        return;
      isRefreshing.value = true;
      page.value = 1;
      hasMore.value = true;
      delete orderListCache.value[currentStatus.value];
      try {
        await loadOrderList();
        await new Promise((resolve) => setTimeout(resolve, 800));
      } catch (error) {
        common_vendor.index.__f__("error", "at subPackages/order/index.vue:279", "刷新失败:", error);
      } finally {
        isRefreshing.value = false;
      }
    };
    const onRefreshRestore = () => {
      isRefreshing.value = false;
    };
    const loadMore = async () => {
      if (isLoadingMore.value || !hasMore.value)
        return;
      isLoadingMore.value = true;
      page.value++;
      try {
        await loadOrderList();
      } catch (error) {
        common_vendor.index.__f__("error", "at subPackages/order/index.vue:299", "加载更多失败:", error);
        page.value--;
      } finally {
        isLoadingMore.value = false;
      }
    };
    const getStatusClass = (status) => {
      const statusMap = {
        1: "status-pending",
        // 待付款
        2: "status-to-serve",
        // 待服务（已支付待确认）
        3: "status-to-serve",
        // 待服务（已确认待到达）
        4: "status-to-serve",
        // 待服务（已到达待开始）
        5: "status-in-progress",
        // 进行中
        6: "status-completed",
        // 已完成
        7: "status-cancelled",
        // 已取消
        8: "status-refunded"
        // 已退款
      };
      return statusMap[status] || "status-default";
    };
    const getStatusText = (status) => {
      const statusMap = {
        1: "待付款",
        2: "待服务",
        3: "待服务",
        4: "待服务",
        5: "进行中",
        6: "已完成",
        7: "已取消",
        8: "已退款"
      };
      return statusMap[status] || "未知状态";
    };
    const getAmountLabel = (status) => {
      if (status === 1) {
        return "需付款：";
      } else if (status === 2 || status === 3 || status === 4 || status === 5 || status === 6) {
        return "实付款：";
      } else {
        return "订单金额：";
      }
    };
    const getOrderActions = (status) => {
      const actionMap = {
        1: [
          // 待付款
          { text: "取消订单", action: "cancel", type: "secondary" },
          { text: "立即支付", action: "pay", type: "primary" }
        ],
        2: [
          // 待服务（已支付待确认）
          { text: "取消订单", action: "cancel", type: "secondary" },
          { text: "联系友伴", action: "contact", type: "primary" }
        ],
        3: [
          // 待服务（已确认待到达）
          { text: "取消订单", action: "cancel", type: "secondary" },
          { text: "联系友伴", action: "contact", type: "primary" }
        ],
        4: [
          // 待服务（已到达待开始）
          { text: "取消订单", action: "cancel", type: "secondary" },
          { text: "联系友伴", action: "contact", type: "primary" }
        ],
        5: [
          // 进行中
          { text: "续钟", action: "extend", type: "primary" },
          { text: "联系友伴", action: "contact", type: "secondary" }
        ],
        6: [
          // 已完成
          { text: "再次预约", action: "rebook", type: "primary" }
        ],
        7: [
          // 已取消
          { text: "删除订单", action: "delete", type: "secondary" }
        ],
        8: [
          // 已退款
          { text: "删除订单", action: "delete", type: "secondary" }
        ]
      };
      return actionMap[status] || [];
    };
    const handleOrderAction = (action, order) => {
      switch (action) {
        case "cancel":
          handleCancelOrder(order);
          break;
        case "pay":
          handlePayOrder(order);
          break;
        case "contact":
          handleContactPartner(order);
          break;
        case "extend":
          handleExtendOrder(order);
          break;
        case "rebook":
          handleRebookOrder(order);
          break;
        case "review":
          handleReviewOrder(order);
          break;
        case "delete":
          handleDeleteOrder(order);
          break;
      }
    };
    const handleCancelOrder = (order) => {
      common_vendor.index.showModal({
        title: "取消订单",
        content: "确定要取消这个订单吗？",
        confirmText: "确定取消",
        cancelText: "再想想",
        success: async (res) => {
          if (res.confirm) {
            try {
              common_vendor.index.showLoading({
                title: "取消中..."
              });
              const cancelData = {
                order_id: order.id,
                cancel_reason: "用户取消"
              };
              const response = await api_order.cancelOrder(cancelData);
              if (response.data.code === 0) {
                common_vendor.index.showToast({
                  title: "订单已取消",
                  icon: "success"
                });
                onRefresh();
              } else {
                throw new Error(response.data.msg || "取消订单失败");
              }
            } catch (error) {
              common_vendor.index.__f__("error", "at subPackages/order/index.vue:444", "取消订单失败:", error);
              common_vendor.index.showToast({
                title: error.message || "取消订单失败",
                icon: "none"
              });
            } finally {
              common_vendor.index.hideLoading();
            }
          }
        }
      });
    };
    const handlePayOrder = (order) => {
      common_vendor.index.navigateTo({
        url: `/subPackages/order/payment?orderId=${order.id}`
      });
    };
    const handleContactPartner = (order) => {
      if (order.companion_id) {
        common_vendor.index.showModal({
          title: "联系友伴师",
          content: `是否拨打友伴师 #${order.companion_id} 的电话？`,
          confirmText: "拨打",
          cancelText: "取消",
          success: (res) => {
            if (res.confirm) {
              common_vendor.index.makePhoneCall({
                phoneNumber: "13800138000"
              });
            }
          }
        });
      }
    };
    const handleExtendOrder = (order) => {
      common_vendor.index.navigateTo({
        url: `/subPackages/order/extend?orderId=${order.id}`
      });
    };
    const handleRebookOrder = (order) => {
      common_vendor.index.navigateTo({
        url: `/subPackages/order/rebook?orderId=${order.id}`
      });
    };
    const handleReviewOrder = (order) => {
      common_vendor.index.navigateTo({
        url: `/subPackages/order/review?orderId=${order.id}`
      });
    };
    const handleDeleteOrder = (order) => {
      common_vendor.index.showModal({
        title: "删除订单",
        content: "确定要删除这个订单吗？删除后不可恢复。",
        confirmText: "删除",
        cancelText: "取消",
        success: async (res) => {
          if (res.confirm) {
            try {
              orderList.value = orderList.value.filter((o) => o.id !== order.id);
              common_vendor.index.showToast({
                title: "订单已删除",
                icon: "success"
              });
            } catch (error) {
              common_vendor.index.showToast({
                title: error.message || "删除失败",
                icon: "none"
              });
            }
          }
        }
      });
    };
    const navigateToDetail = (orderId) => {
      common_vendor.index.navigateTo({
        url: `/subPackages/order/detail?orderId=${orderId}`
      });
    };
    const formatTime = (timeStr) => {
      const date = new Date(timeStr);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.f(statusTabs.value, (tab, index, i0) => {
          return {
            a: common_vendor.t(tab.label),
            b: index,
            c: currentStatus.value === tab.value ? 1 : "",
            d: common_vendor.o(($event) => switchStatus(tab.value), index)
          };
        }),
        b: orderList.value.length === 0 && !isLoading.value
      }, orderList.value.length === 0 && !isLoading.value ? {
        c: common_assets._imports_0
      } : common_vendor.e({
        d: common_vendor.f(orderList.value, (order, k0, i0) => {
          return {
            a: common_vendor.t(order.service_name),
            b: common_vendor.t(getStatusText(order.status)),
            c: common_vendor.n(getStatusClass(order.status)),
            d: _ctx.$imgBaseUrl + order.service_image_url,
            e: common_vendor.t(order.unit_price),
            f: common_vendor.t(order.unit),
            g: common_vendor.t(order.quantity),
            h: common_vendor.t(getAmountLabel(order.status)),
            i: common_vendor.t(order.total_amount),
            j: common_vendor.t(formatTime(order.created_at)),
            k: common_vendor.f(getOrderActions(order.status), (action, actionIndex, i1) => {
              return {
                a: common_vendor.t(action.text),
                b: actionIndex,
                c: common_vendor.n(action.type),
                d: common_vendor.o(($event) => handleOrderAction(action.action, order), actionIndex)
              };
            }),
            l: order.id,
            m: common_vendor.o(($event) => navigateToDetail(order.id), order.id)
          };
        }),
        e: hasMore.value && orderList.value.length > 0
      }, hasMore.value && orderList.value.length > 0 ? common_vendor.e({
        f: isLoadingMore.value
      }, isLoadingMore.value ? {} : {}) : {}), {
        g: isRefreshing.value,
        h: common_vendor.o(onRefresh),
        i: common_vendor.o(onRefreshRestore),
        j: common_vendor.o(loadMore)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-c7cccef5"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/subPackages/order/index.js.map
