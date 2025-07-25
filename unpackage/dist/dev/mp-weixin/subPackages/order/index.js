"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const stores_user = require("../../stores/user.js");
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
        id: "O20230001",
        partnerName: "小王",
        partnerAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80",
        partnerRating: 4.9,
        isSuperPartner: true,
        serviceName: "家居顾问 - 高级套餐",
        tags: ["专业指导", "首次优惠"],
        createTime: "2023-09-01 14:30",
        status: "pending",
        price: 150,
        duration: 2,
        appointmentTime: "2023-09-10 10:00",
        location: "用户指定地点",
        totalAmount: 300,
        discount: 50,
        expireTime: "23:45:30",
        orderNote: ""
      },
      {
        id: "O20230002",
        partnerName: "张琳",
        partnerAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80",
        partnerRating: 4.8,
        serviceName: "摄影师 - 人像写真",
        tags: ["室外拍摄", "提供化妆"],
        createTime: "2023-08-25 09:15",
        status: "to-serve",
        price: 200,
        duration: 1.5,
        appointmentTime: "2023-09-05 14:00",
        location: "市中心摄影棚",
        totalAmount: 300,
        discount: 0,
        orderNote: ""
      },
      {
        id: "O20230003",
        partnerName: "李明",
        partnerAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80",
        partnerRating: 4.7,
        serviceName: "K歌达人 - 专业指导",
        tags: ["一对一指导", "录音"],
        createTime: "2023-08-20 18:30",
        status: "in-progress",
        price: 120,
        duration: 3,
        appointmentTime: "2023-09-02 19:00",
        location: "城西KTV",
        totalAmount: 360,
        discount: 0,
        progress: 75,
        orderNote: "需要提前准备歌单"
      },
      {
        id: "O20230004",
        partnerName: "王芳",
        partnerAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80",
        partnerRating: 5,
        isSuperPartner: true,
        serviceName: "心理咨询 - 标准课程",
        tags: ["资深心理师", "保密咨询"],
        createTime: "2023-08-15 10:00",
        status: "completed",
        price: 300,
        duration: 1,
        appointmentTime: "2023-08-20 15:30",
        location: "线上视频",
        totalAmount: 300,
        discount: 0,
        orderNote: ""
      },
      {
        id: "O20230005",
        partnerName: "陈磊",
        partnerAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80",
        partnerRating: 4.6,
        serviceName: "健身教练 - 私人定制",
        tags: ["器械训练", "体能提升"],
        createTime: "2023-08-10 08:45",
        status: "to-review",
        price: 180,
        duration: 1.5,
        appointmentTime: "2023-08-18 10:00",
        location: "悦动健身中心",
        totalAmount: 270,
        discount: 0,
        orderNote: ""
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
        common_vendor.index.__f__("error", "at subPackages/order/index.vue:329", "加载订单列表失败:", error);
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
        common_vendor.index.__f__("error", "at subPackages/order/index.vue:360", "刷新失败:", error);
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
        common_vendor.index.__f__("error", "at subPackages/order/index.vue:380", "加载更多失败:", error);
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
    const handleModifyOrder = (order) => {
      common_vendor.index.__f__("log", "at subPackages/order/index.vue:413", "修改订单", order.id);
      common_vendor.index.showToast({
        title: "修改订单功能开发中",
        icon: "none"
      });
    };
    const handleConfirmComplete = (order) => {
      common_vendor.index.__f__("log", "at subPackages/order/index.vue:421", "确认完成", order.id);
      common_vendor.index.showModal({
        title: "确认完成",
        content: "确认服务已完成吗？",
        confirmText: "确认",
        cancelText: "取消",
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.showToast({
              title: "服务已完成",
              icon: "success"
            });
            onRefresh();
          }
        }
      });
    };
    const handleOrderAgain = (order) => {
      common_vendor.index.__f__("log", "at subPackages/order/index.vue:441", "再次预约", order.id);
      common_vendor.index.showToast({
        title: "再次预约功能开发中",
        icon: "none"
      });
    };
    const handleCancelOrder = (order) => {
      common_vendor.index.showModal({
        title: "取消订单",
        content: `确定要取消订单 ${order.id} 吗？`,
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
      common_vendor.index.__f__("log", "at subPackages/order/index.vue:471", "支付订单", order.id);
      common_vendor.index.showToast({
        title: "支付功能开发中",
        icon: "none"
      });
    };
    const handleContactPartner = (order) => {
      common_vendor.index.showModal({
        title: "联系友伴师",
        content: `是否拨打 ${order.partnerName} 的电话？`,
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
    };
    const handleReviewOrder = (order) => {
      common_vendor.index.__f__("log", "at subPackages/order/index.vue:516", "评价订单", order.id);
      common_vendor.index.showToast({
        title: "评价功能开发中",
        icon: "none"
      });
    };
    const navigateToDetail = (orderId) => {
      common_vendor.index.__f__("log", "at subPackages/order/index.vue:525", "查看订单详情", orderId);
      common_vendor.index.showToast({
        title: "订单详情功能开发中",
        icon: "none"
      });
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
          return common_vendor.e({
            a: order.partnerAvatar,
            b: order.partnerRating
          }, order.partnerRating ? {
            c: common_vendor.t(order.partnerRating)
          } : {}, {
            d: common_vendor.t(order.partnerName),
            e: order.isSuperPartner
          }, order.isSuperPartner ? {} : {}, {
            f: common_vendor.t(order.createTime),
            g: common_vendor.t(getStatusText(order.status)),
            h: common_vendor.n(getStatusClass(order.status)),
            i: common_vendor.t(order.serviceName),
            j: common_vendor.t(order.price.toFixed(2)),
            k: order.tags && order.tags.length > 0
          }, order.tags && order.tags.length > 0 ? {
            l: common_vendor.f(order.tags, (tag, index, i1) => {
              return {
                a: common_vendor.t(tag),
                b: index
              };
            })
          } : {}, {
            m: common_vendor.t(order.duration),
            n: common_vendor.t(order.appointmentTime),
            o: order.location
          }, order.location ? {
            p: common_vendor.t(order.location)
          } : {}, {
            q: order.orderNote
          }, order.orderNote ? {
            r: common_vendor.t(order.orderNote)
          } : {}, {
            s: order.status === "in-progress" && order.progress
          }, order.status === "in-progress" && order.progress ? {
            t: common_vendor.t(order.progress),
            v: order.progress + "%"
          } : {}, {
            w: common_vendor.t(order.totalAmount.toFixed(2)),
            x: order.discount > 0
          }, order.discount > 0 ? {
            y: common_vendor.t(order.discount.toFixed(2))
          } : {}, {
            z: order.status === "pending"
          }, order.status === "pending" ? common_vendor.e({
            A: order.expireTime
          }, order.expireTime ? {
            B: common_vendor.t(order.expireTime)
          } : {}, {
            C: common_vendor.o(($event) => handleCancelOrder(order), order.id),
            D: common_vendor.o(($event) => handlePayOrder(order), order.id)
          }) : order.status === "to-serve" ? {
            F: common_vendor.o(($event) => handleContactPartner(order), order.id),
            G: common_vendor.o(($event) => handleModifyOrder(order), order.id)
          } : order.status === "in-progress" ? {
            I: common_vendor.o(($event) => handleContactPartner(order), order.id),
            J: common_vendor.o(($event) => handleConfirmComplete(order), order.id)
          } : order.status === "completed" ? {
            L: common_vendor.o(($event) => handleOrderAgain(order), order.id),
            M: common_vendor.o(($event) => navigateToDetail(order.id), order.id)
          } : order.status === "to-review" ? {
            O: common_vendor.o(($event) => handleOrderAgain(order), order.id),
            P: common_vendor.o(($event) => handleReviewOrder(order), order.id)
          } : {}, {
            E: order.status === "to-serve",
            H: order.status === "in-progress",
            K: order.status === "completed",
            N: order.status === "to-review",
            Q: order.id,
            R: common_vendor.o(($event) => navigateToDetail(order.id), order.id)
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
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-c7cccef5"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/subPackages/order/index.js.map
