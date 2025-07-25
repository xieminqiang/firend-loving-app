"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const stores_user = require("../../stores/user.js");
const _sfc_main = {
  __name: "detail",
  setup(__props) {
    stores_user.useUserStore();
    const currentStatus = common_vendor.ref("all");
    const isRefreshing = common_vendor.ref(false);
    const isLoading = common_vendor.ref(false);
    const isLoadingMore = common_vendor.ref(false);
    const hasMore = common_vendor.ref(true);
    const page = common_vendor.ref(1);
    const pageSize = common_vendor.ref(10);
    const orderList = common_vendor.ref([]);
    const statusTabs = common_vendor.ref([
      { label: "全部", value: "all", count: 0 },
      { label: "待付款", value: "pending", count: 0 },
      { label: "待服务", value: "to-serve", count: 0 },
      { label: "进行中", value: "in-progress", count: 0 },
      { label: "已完成", value: "completed", count: 0 },
      { label: "待评价", value: "to-review", count: 0 }
    ]);
    const mockOrders = [
      {
        id: 1,
        orderNo: "SBX20241201001",
        status: "pending",
        createTime: "2024-12-01 14:30:00",
        serviceName: "陪伴聊天",
        serviceDesc: "专业陪伴，温暖聊天",
        serviceImage: "/static/images/empty.png",
        duration: 60,
        price: 100,
        totalAmount: 100,
        partner: null
      },
      {
        id: 2,
        orderNo: "SBX20241201002",
        status: "to-serve",
        createTime: "2024-12-01 15:00:00",
        serviceName: "约会陪伴",
        serviceDesc: "浪漫约会，美好回忆",
        serviceImage: "/static/images/empty.png",
        duration: 120,
        price: 200,
        totalAmount: 200,
        partner: {
          name: "小美",
          avatar: "/static/images/empty.png",
          rating: 4.8,
          orderCount: 156
        }
      },
      {
        id: 3,
        orderNo: "SBX20241201003",
        status: "in-progress",
        createTime: "2024-12-01 16:00:00",
        serviceName: "逛街陪伴",
        serviceDesc: "购物达人，时尚搭配",
        serviceImage: "/static/images/empty.png",
        duration: 90,
        price: 150,
        totalAmount: 150,
        partner: {
          name: "小丽",
          avatar: "/static/images/empty.png",
          rating: 4.9,
          orderCount: 89
        }
      },
      {
        id: 4,
        orderNo: "SBX20241201004",
        status: "completed",
        createTime: "2024-12-01 17:00:00",
        serviceName: "电影陪伴",
        serviceDesc: "观影体验，情感交流",
        serviceImage: "/static/images/empty.png",
        duration: 150,
        price: 180,
        totalAmount: 180,
        partner: {
          name: "小芳",
          avatar: "/static/images/empty.png",
          rating: 4.7,
          orderCount: 234
        }
      },
      {
        id: 5,
        orderNo: "SBX20241201005",
        status: "to-review",
        createTime: "2024-12-01 18:00:00",
        serviceName: "咖啡陪伴",
        serviceDesc: "轻松聊天，心情愉悦",
        serviceImage: "/static/images/empty.png",
        duration: 60,
        price: 80,
        totalAmount: 80,
        partner: {
          name: "小雅",
          avatar: "/static/images/empty.png",
          rating: 4.6,
          orderCount: 67
        }
      }
    ];
    common_vendor.onMounted(() => {
      loadOrderList();
      updateStatusCounts();
    });
    const switchStatus = (status) => {
      currentStatus.value = status;
      page.value = 1;
      hasMore.value = true;
      orderList.value = [];
      loadOrderList();
    };
    const loadOrderList = async () => {
      if (isLoading.value)
        return;
      isLoading.value = true;
      try {
        await new Promise((resolve) => setTimeout(resolve, 1e3));
        let filteredOrders = mockOrders;
        if (currentStatus.value !== "all") {
          filteredOrders = mockOrders.filter((order) => order.status === currentStatus.value);
        }
        const start = (page.value - 1) * pageSize.value;
        const end = start + pageSize.value;
        const pageOrders = filteredOrders.slice(start, end);
        if (page.value === 1) {
          orderList.value = pageOrders;
        } else {
          orderList.value.push(...pageOrders);
        }
        hasMore.value = pageOrders.length === pageSize.value;
      } catch (error) {
        common_vendor.index.__f__("error", "at subPackages/order/detail.vue:273", "加载订单列表失败:", error);
        common_vendor.index.showToast({
          title: "加载失败",
          icon: "none"
        });
      } finally {
        isLoading.value = false;
      }
    };
    const updateStatusCounts = () => {
      statusTabs.value.forEach((tab) => {
        if (tab.value === "all") {
          tab.count = mockOrders.length;
        } else {
          tab.count = mockOrders.filter((order) => order.status === tab.value).length;
        }
      });
    };
    const onRefresh = async () => {
      isRefreshing.value = true;
      page.value = 1;
      hasMore.value = true;
      try {
        await loadOrderList();
        updateStatusCounts();
      } catch (error) {
        common_vendor.index.__f__("error", "at subPackages/order/detail.vue:304", "刷新失败:", error);
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
        common_vendor.index.__f__("error", "at subPackages/order/detail.vue:324", "加载更多失败:", error);
        page.value--;
      } finally {
        isLoadingMore.value = false;
      }
    };
    const getStatusClass = (status) => {
      const statusMap = {
        "pending": "status-pending",
        "to-serve": "status-to-serve",
        "in-progress": "status-in-progress",
        "completed": "status-completed",
        "to-review": "status-to-review"
      };
      return statusMap[status] || "status-default";
    };
    const getStatusText = (status) => {
      const statusMap = {
        "pending": "待付款",
        "to-serve": "待服务",
        "in-progress": "进行中",
        "completed": "已完成",
        "to-review": "待评价"
      };
      return statusMap[status] || "未知状态";
    };
    const getOrderActions = (status) => {
      const actionMap = {
        "pending": [
          { text: "取消订单", action: "cancel", type: "secondary" },
          { text: "立即支付", action: "pay", type: "primary" }
        ],
        "to-serve": [
          { text: "取消订单", action: "cancel", type: "secondary" },
          { text: "联系友伴师", action: "contact", type: "primary" }
        ],
        "in-progress": [
          { text: "续钟", action: "extend", type: "primary" },
          { text: "联系友伴师", action: "contact", type: "secondary" }
        ],
        "completed": [
          { text: "再次预约", action: "rebook", type: "primary" }
        ],
        "to-review": [
          { text: "立即评价", action: "review", type: "primary" }
        ]
      };
      return actionMap[status] || [];
    };
    const handleOrderAction = (action, order) => {
      switch (action) {
        case "cancel":
          handleCancelOrder();
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
      }
    };
    const handleCancelOrder = (order) => {
      common_vendor.index.showModal({
        title: "取消订单",
        content: "确定要取消这个订单吗？",
        confirmText: "确定取消",
        cancelText: "再想想",
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.showToast({
              title: "订单已取消",
              icon: "success"
            });
            onRefresh();
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
      if (order.partner) {
        common_vendor.index.showModal({
          title: "联系友伴师",
          content: `是否拨打 ${order.partner.name} 的电话？`,
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
    const navigateToDetail = (orderId) => {
      common_vendor.index.navigateTo({
        url: `/subPackages/order/detail?orderId=${orderId}`
      });
    };
    const formatTime = (timeStr) => {
      const date = new Date(timeStr);
      const now = /* @__PURE__ */ new Date();
      const diff = now - date;
      if (diff < 6e4) {
        return "刚刚";
      }
      if (diff < 36e5) {
        return `${Math.floor(diff / 6e4)}分钟前`;
      }
      if (diff < 864e5) {
        return `${Math.floor(diff / 36e5)}小时前`;
      }
      return date.toLocaleDateString();
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.f(statusTabs.value, (tab, index, i0) => {
          return common_vendor.e({
            a: common_vendor.t(tab.label),
            b: tab.count > 0
          }, tab.count > 0 ? {
            c: common_vendor.t(tab.count)
          } : {}, {
            d: index,
            e: currentStatus.value === tab.value ? 1 : "",
            f: common_vendor.o(($event) => switchStatus(tab.value), index)
          });
        }),
        b: orderList.value.length === 0 && !isLoading.value
      }, orderList.value.length === 0 && !isLoading.value ? {
        c: common_assets._imports_0
      } : common_vendor.e({
        d: common_vendor.f(orderList.value, (order, k0, i0) => {
          return common_vendor.e({
            a: common_vendor.t(order.orderNo),
            b: common_vendor.t(formatTime(order.createTime)),
            c: common_vendor.t(getStatusText(order.status)),
            d: common_vendor.n(getStatusClass(order.status)),
            e: order.serviceImage,
            f: common_vendor.t(order.serviceName),
            g: common_vendor.t(order.serviceDesc),
            h: common_vendor.t(order.duration),
            i: common_vendor.t(order.price),
            j: order.partner
          }, order.partner ? {
            k: order.partner.avatar,
            l: common_vendor.t(order.partner.name),
            m: common_vendor.t(order.partner.rating),
            n: common_vendor.t(order.partner.orderCount)
          } : {}, {
            o: common_vendor.t(order.totalAmount),
            p: common_vendor.f(getOrderActions(order.status), (action, actionIndex, i1) => {
              return {
                a: common_vendor.t(action.text),
                b: actionIndex,
                c: common_vendor.n(action.type),
                d: common_vendor.o(($event) => handleOrderAction(action.action, order), actionIndex)
              };
            }),
            q: order.id,
            r: common_vendor.o(($event) => navigateToDetail(order.id), order.id)
          });
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
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-c0a82bfd"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/subPackages/order/detail.js.map
