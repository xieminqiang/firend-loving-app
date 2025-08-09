"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const stores_user = require("../../stores/user.js");
const stores_city = require("../../stores/city.js");
const api_order = require("../../api/order.js");
const _sfc_main = {
  __name: "index",
  setup(__props) {
    stores_user.useUserStore();
    const cityStore = stores_city.useCityStore();
    const currentStatus = common_vendor.ref("all");
    const currentTabIndex = common_vendor.ref(0);
    const isRefreshing = common_vendor.ref(false);
    const isLoading = common_vendor.ref(false);
    const isLoadingMore = common_vendor.ref(false);
    const hasMore = common_vendor.ref(true);
    const page = common_vendor.ref(1);
    const pageSize = common_vendor.ref(20);
    const orderListCache = common_vendor.ref({});
    const orderListData = common_vendor.ref({
      "all": [],
      "pending_payment": [],
      "pending_service": [],
      "in_service": [],
      "completed": [],
      "cancelled": [],
      "refunded": [],
      "refunding": []
    });
    let swiperChangeTimer = null;
    common_vendor.onUnmounted(() => {
      if (swiperChangeTimer) {
        clearTimeout(swiperChangeTimer);
      }
    });
    const statusTabs = common_vendor.ref([
      { label: "全部", value: "all", count: 0 },
      { label: "待付款", value: "pending_payment", count: 0 },
      { label: "待服务", value: "pending_service", count: 0 },
      { label: "进行中", value: "in_service", count: 0 },
      { label: "已完成", value: "completed", count: 0 }
      // { label: '已取消', value: 'cancelled', count: 0 },
      // { label: '已退款', value: 'refunded', count: 0 },
      // { label: '退款中', value: 'refunding', count: 0 }
    ]);
    common_vendor.onLoad((options) => {
      common_vendor.index.__f__("log", "at subPackages/order/index.vue:183", "订单页面接收到的参数:", options);
      if (options.status) {
        common_vendor.index.__f__("log", "at subPackages/order/index.vue:185", "设置订单状态为:", options.status);
        currentStatus.value = options.status;
        const statusIndex = statusTabs.value.findIndex((tab) => tab.value === options.status);
        if (statusIndex !== -1) {
          currentTabIndex.value = statusIndex;
        }
        page.value = 1;
        hasMore.value = true;
        delete orderListCache.value[options.status];
      } else {
        common_vendor.index.__f__("log", "at subPackages/order/index.vue:198", "没有传递状态参数，使用默认状态: all");
        currentStatus.value = "all";
        currentTabIndex.value = 0;
      }
      common_vendor.index.__f__("log", "at subPackages/order/index.vue:204", "onLoad中加载数据，当前状态:", currentStatus.value);
      loadOrderList();
    });
    common_vendor.watch(currentStatus, (newStatus, oldStatus) => {
      common_vendor.index.__f__("log", "at subPackages/order/index.vue:210", "状态变化:", oldStatus, "->", newStatus);
    });
    const switchStatus = async (status) => {
      if (currentStatus.value === status)
        return;
      currentStatus.value = status;
      const statusIndex = statusTabs.value.findIndex((tab) => tab.value === status);
      if (statusIndex !== -1) {
        currentTabIndex.value = statusIndex;
      }
      if (orderListCache.value[status]) {
        orderListData.value[status] = orderListCache.value[status].list;
        page.value = orderListCache.value[status].page;
        hasMore.value = orderListCache.value[status].hasMore;
      } else {
        page.value = 1;
        hasMore.value = true;
        orderListData.value[status] = [];
        try {
          await loadOrderList();
        } catch (error) {
          common_vendor.index.__f__("error", "at subPackages/order/index.vue:238", "切换状态失败:", error);
        }
      }
    };
    const onSwiperChange = async (e) => {
      const index = e.detail.current;
      const newStatus = statusTabs.value[index].value;
      const oldStatus = currentStatus.value;
      currentTabIndex.value = index;
      currentStatus.value = newStatus;
      if (swiperChangeTimer) {
        clearTimeout(swiperChangeTimer);
      }
      if (oldStatus !== newStatus && !orderListCache.value[newStatus]) {
        swiperChangeTimer = setTimeout(async () => {
          page.value = 1;
          hasMore.value = true;
          orderListData.value[newStatus] = [];
          await loadOrderList();
        }, 300);
      }
    };
    const getTabOrderList = (status) => {
      return orderListData.value[status] || [];
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
        common_vendor.index.__f__("log", "at subPackages/order/index.vue:287", "response.data", response.data);
        if (response.data.code === 0) {
          const { list, total } = response.data.data;
          if (page.value === 1) {
            orderListData.value[currentStatus.value] = list || [];
            updateCurrentStatusCount(total);
          } else {
            orderListData.value[currentStatus.value].push(...list || []);
          }
          hasMore.value = orderListData.value[currentStatus.value].length < total;
          orderListCache.value[currentStatus.value] = {
            list: [...orderListData.value[currentStatus.value]],
            page: page.value,
            hasMore: hasMore.value
          };
        } else {
          throw new Error(response.msg || "获取订单列表失败");
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at subPackages/order/index.vue:312", "加载订单列表失败:", error);
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
        common_vendor.index.__f__("error", "at subPackages/order/index.vue:363", "刷新失败:", error);
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
        common_vendor.index.__f__("error", "at subPackages/order/index.vue:383", "加载更多失败:", error);
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
        8: "status-refunded",
        // 已退款
        9: "status-refunding",
        // 退款中
        10: "status-cancelled",
        // 超时取消
        11: "status-to-serve"
        // 待服务（已确认待开始出发）
      };
      return statusMap[status] || "status-default";
    };
    const getStatusText = (status) => {
      const statusMap = {
        1: "待付款",
        2: "等待接单",
        3: "友伴已出发",
        4: "友伴已到达",
        5: "进行中",
        6: "已完成",
        7: "已取消",
        8: "已退款",
        9: "退款中",
        10: "超时取消",
        11: "已接单，等待出发"
      };
      return statusMap[status] || "未知状态";
    };
    const getAmountLabel = (status) => {
      if (status === 1) {
        return "需付款：";
      } else if (status === 2 || status === 3 || status === 4 || status === 5 || status === 6 || status === 11) {
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
          { text: "申请退款", action: "refund", type: "secondary" },
          { text: "联系友伴", action: "contact", type: "primary" }
        ],
        3: [
          // 待服务（已确认待到达）
          { text: "申请退款", action: "refund", type: "secondary" },
          { text: "联系友伴", action: "contact", type: "primary" }
        ],
        4: [
          // 待服务（已到达待开始）
          { text: "申请退款", action: "refund", type: "secondary" },
          { text: "开始服务", action: "start", type: "start" }
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
        ],
        9: [
          // 退款中
          { text: "联系客服", action: "contact", type: "primary" }
        ],
        10: [
          // 超时取消
          { text: "删除订单", action: "delete", type: "secondary" }
        ],
        11: [
          // 待服务（已确认待开始出发）
          { text: "申请退款", action: "refund", type: "secondary" },
          { text: "联系友伴", action: "contact", type: "primary" }
        ]
      };
      return actionMap[status] || [];
    };
    const handleOrderAction = (action, order) => {
      switch (action) {
        case "cancel":
          handleCancelOrder(order);
          break;
        case "refund":
          if (order.status === 3) {
            handleApplyRefundAfterDeparture(order);
          } else if (order.status === 4) {
            handleApplyRefundAfterArrival(order);
          } else {
            handleApplyRefund(order);
          }
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
        case "start":
          handleStartService(order);
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
              common_vendor.index.__f__("error", "at subPackages/order/index.vue:557", "取消订单失败:", error);
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
    const handleApplyRefund = (order) => {
      common_vendor.index.showModal({
        title: "申请退款",
        content: "确定要申请退款吗？",
        confirmText: "继续退款",
        cancelText: "取消",
        success: async (res) => {
          if (res.confirm) {
            try {
              common_vendor.index.showLoading({
                title: "申请中..."
              });
              const refundData = {
                order_id: order.id,
                refund_reason: "用户申请退款"
              };
              const response = await api_order.applyRefund(refundData);
              if (response.data.code === 0) {
                common_vendor.index.showToast({
                  title: "退款申请已提交",
                  icon: "success"
                });
                onRefresh();
              } else {
                throw new Error(response.data.msg || "申请退款失败");
              }
            } catch (error) {
              common_vendor.index.__f__("error", "at subPackages/order/index.vue:604", "申请退款失败:", error);
              common_vendor.index.showToast({
                title: error.message || "申请退款失败",
                icon: "none"
              });
            } finally {
              common_vendor.index.hideLoading();
            }
          }
        }
      });
    };
    const handleApplyRefundAfterDeparture = (order) => {
      common_vendor.index.showModal({
        title: "申请退款",
        content: "确定要申请退款吗？由于对方已出发，退款时将扣除来回程车费。",
        confirmText: "继续退款",
        cancelText: "取消",
        success: async (res) => {
          if (res.confirm) {
            try {
              common_vendor.index.showLoading({
                title: "申请中..."
              });
              const refundData = {
                order_id: order.id,
                refund_reason: "部分退款，扣除来回程车费"
              };
              const response = await api_order.applyRefundAfterDeparture(refundData);
              if (response.data.code === 0) {
                common_vendor.index.showToast({
                  title: "退款申请已提交",
                  icon: "success"
                });
                onRefresh();
              } else {
                throw new Error(response.data.msg || "申请退款失败");
              }
            } catch (error) {
              common_vendor.index.__f__("error", "at subPackages/order/index.vue:651", "申请退款失败:", error);
              common_vendor.index.showToast({
                title: error.message || "申请退款失败",
                icon: "none"
              });
            } finally {
              common_vendor.index.hideLoading();
            }
          }
        }
      });
    };
    const handleApplyRefundAfterArrival = (order) => {
      common_vendor.index.showModal({
        title: "申请退款",
        content: "确定要申请退款吗？由于对方已到达，退款时将扣除友伴师来回程车费。",
        confirmText: "申请退款",
        cancelText: "取消",
        success: async (res) => {
          if (res.confirm) {
            try {
              common_vendor.index.showLoading({
                title: "申请中..."
              });
              const refundData = {
                order_id: order.id,
                refund_reason: "部分退款，扣除友伴师来回程车费"
              };
              const response = await api_order.applyRefundAfterDeparture(refundData);
              if (response.data.code === 0) {
                common_vendor.index.showToast({
                  title: "退款申请已提交",
                  icon: "success"
                });
                onRefresh();
              } else {
                throw new Error(response.data.msg || "申请退款失败");
              }
            } catch (error) {
              common_vendor.index.__f__("error", "at subPackages/order/index.vue:698", "申请退款失败:", error);
              common_vendor.index.showToast({
                title: error.message || "申请退款失败",
                icon: "none"
              });
            } finally {
              common_vendor.index.hideLoading();
            }
          }
        }
      });
    };
    const handlePayOrder = async (order) => {
      try {
        common_vendor.index.showLoading({
          title: "处理中..."
        });
        const orderParamsData = {
          order_id: order.id,
          payment_method: 1
        };
        const paramsResponse = await api_order.orderParams(orderParamsData);
        if (paramsResponse.data.code === 0) {
          common_vendor.index.requestPayment({
            provider: "wxpay",
            ...paramsResponse.data.data.pay_params,
            success: (res) => {
              common_vendor.index.__f__("log", "at subPackages/order/index.vue:733", "支付成功", res);
              common_vendor.index.showToast({
                title: "支付成功",
                icon: "success"
              });
              setTimeout(() => {
                onRefresh();
              }, 1500);
            },
            fail: (err) => {
              common_vendor.index.__f__("error", "at subPackages/order/index.vue:744", "支付失败", JSON.stringify(err));
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
        common_vendor.index.__f__("error", "at subPackages/order/index.vue:755", "支付失败:", error);
        common_vendor.index.showToast({
          title: error.message || "支付失败",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    };
    const handleContactPartner = (order) => {
      if (order.companion_id) {
        common_vendor.index.showModal({
          title: "联系友伴师",
          content: `是否拨打友伴师的电话？`,
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
    const handleStartService = (order) => {
      common_vendor.index.showModal({
        title: "开始服务",
        content: "确认友伴师已到达并开始服务吗？",
        confirmText: "开始服务",
        cancelText: "取消",
        success: async (res) => {
          if (res.confirm) {
            try {
              common_vendor.index.showLoading({
                title: "处理中..."
              });
              const startData = {
                order_id: order.id
              };
              const response = await api_order.startService(startData);
              if (response.data.code === 0) {
                common_vendor.index.showToast({
                  title: "服务已开始",
                  icon: "success"
                });
                onRefresh();
              } else {
                throw new Error(response.data.msg || "开始服务失败");
              }
            } catch (error) {
              common_vendor.index.__f__("error", "at subPackages/order/index.vue:818", "开始服务失败:", error);
              common_vendor.index.showToast({
                title: error.message || "开始服务失败",
                icon: "none"
              });
            } finally {
              common_vendor.index.hideLoading();
            }
          }
        }
      });
    };
    const handleExtendOrder = (order) => {
      common_vendor.index.navigateTo({
        url: `/subPackages/order/extend?orderId=${order.id}`
      });
    };
    const handleRebookOrder = (order) => {
      if (order.companion_id) {
        let url = "/subPackages/friend/detail?id=" + order.companion_id + "&city_code=" + cityStore.currentCityCode;
        common_vendor.index.navigateTo({
          url
        });
      } else {
        common_vendor.index.showToast({
          title: "友伴信息不存在",
          icon: "none"
        });
      }
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
              common_vendor.index.showLoading({
                title: "删除中..."
              });
              const deleteData = {
                order_id: order.id
              };
              const response = await api_order.deleteOrder(deleteData);
              if (response.data.code === 0) {
                orderListData.value[currentStatus.value] = orderListData.value[currentStatus.value].filter((o) => o.id !== order.id);
                common_vendor.index.showToast({
                  title: "订单已删除",
                  icon: "success"
                });
              } else {
                throw new Error(response.data.msg || "删除订单失败");
              }
            } catch (error) {
              common_vendor.index.__f__("error", "at subPackages/order/index.vue:893", "删除订单失败:", error);
              common_vendor.index.showToast({
                title: error.message || "删除订单失败",
                icon: "none"
              });
            } finally {
              common_vendor.index.hideLoading();
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
      return {
        a: common_vendor.f(statusTabs.value, (tab, index, i0) => {
          return {
            a: common_vendor.t(tab.label),
            b: index,
            c: currentTabIndex.value === index ? 1 : "",
            d: common_vendor.o(($event) => switchStatus(tab.value), index)
          };
        }),
        b: common_vendor.f(statusTabs.value, (tab, k0, i0) => {
          return common_vendor.e({
            a: getTabOrderList(tab.value).length === 0 && !isLoading.value
          }, getTabOrderList(tab.value).length === 0 && !isLoading.value ? {
            b: common_assets._imports_3
          } : common_vendor.e({
            c: common_vendor.f(getTabOrderList(tab.value), (order, k1, i1) => {
              return common_vendor.e({
                a: common_vendor.t(formatTime(order.created_at)),
                b: common_vendor.t(getStatusText(order.status)),
                c: common_vendor.n(getStatusClass(order.status)),
                d: _ctx.$imgBaseUrl + order.service_image_url,
                e: common_vendor.t(order.service_name),
                f: common_vendor.t(order.unit_price),
                g: common_vendor.t(order.unit),
                h: common_vendor.t(order.quantity),
                i: common_vendor.t(getAmountLabel(order.status)),
                j: common_vendor.t(order.total_amount),
                k: order.status === 4
              }, order.status === 4 ? {
                l: common_assets._imports_1$7
              } : {}, {
                m: common_vendor.f(getOrderActions(order.status), (action, actionIndex, i2) => {
                  return common_vendor.e({
                    a: common_vendor.t(action.text),
                    b: action.text === "联系客服"
                  }, action.text === "联系客服" ? {
                    c: common_vendor.o(() => {
                    }, actionIndex)
                  } : {}, {
                    d: actionIndex,
                    e: common_vendor.n(action.type),
                    f: common_vendor.o(($event) => handleOrderAction(action.action, order), actionIndex)
                  });
                }),
                n: order.id,
                o: common_vendor.o(($event) => navigateToDetail(order.id), order.id)
              });
            }),
            d: hasMore.value && getTabOrderList(tab.value).length > 0
          }, hasMore.value && getTabOrderList(tab.value).length > 0 ? common_vendor.e({
            e: isLoadingMore.value
          }, isLoadingMore.value ? {} : {}) : {}), {
            f: common_vendor.o(onRefresh, tab.value),
            g: common_vendor.o(onRefreshRestore, tab.value),
            h: common_vendor.o(loadMore, tab.value),
            i: tab.value
          });
        }),
        c: isRefreshing.value,
        d: currentTabIndex.value,
        e: common_vendor.o(onSwiperChange)
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-c7cccef5"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/subPackages/order/index.js.map
