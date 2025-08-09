"use strict";
const common_vendor = require("../../../common/vendor.js");
const common_assets = require("../../../common/assets.js");
const api_order = require("../../../api/order.js");
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const currentStatus = common_vendor.ref("all");
    const currentTabIndex = common_vendor.ref(0);
    const isRefreshing = common_vendor.ref(false);
    const isLoading = common_vendor.ref(false);
    const isLoadingMore = common_vendor.ref(false);
    const hasMore = common_vendor.ref(true);
    const page = common_vendor.ref(1);
    const pageSize = common_vendor.ref(20);
    const companionId = common_vendor.ref(null);
    const orderListCache = common_vendor.ref({});
    const orderListData = common_vendor.ref({
      "all": [],
      "pending_accept": [],
      "pending_service": [],
      "in_service": [],
      "completed": []
    });
    let swiperChangeTimer = null;
    common_vendor.onUnmounted(() => {
      if (swiperChangeTimer) {
        clearTimeout(swiperChangeTimer);
      }
    });
    const statusTabs = common_vendor.ref([
      { label: "全部", value: "all", count: 0 },
      { label: "待接单", value: "pending_accept", count: 0 },
      { label: "待服务", value: "pending_service", count: 0 },
      { label: "服务中", value: "in_service", count: 0 },
      { label: "已完成", value: "completed", count: 0 }
    ]);
    common_vendor.onLoad((options) => {
      common_vendor.index.__f__("log", "at subPackages/partner/order/index.vue:192", "友伴订单页面接收到的参数:", options);
      if (options.companion_id) {
        common_vendor.index.__f__("log", "at subPackages/partner/order/index.vue:196", "设置companion_id为:", options.companion_id);
        companionId.value = options.companion_id;
      }
      if (options.status) {
        common_vendor.index.__f__("log", "at subPackages/partner/order/index.vue:201", "设置订单状态为:", options.status);
        currentStatus.value = options.status;
        const statusIndex = statusTabs.value.findIndex((tab) => tab.value === options.status);
        if (statusIndex !== -1) {
          currentTabIndex.value = statusIndex;
        }
        page.value = 1;
        hasMore.value = true;
        delete orderListCache.value[options.status];
      } else {
        common_vendor.index.__f__("log", "at subPackages/partner/order/index.vue:214", "没有传递状态参数，使用默认状态: all");
        currentStatus.value = "all";
        currentTabIndex.value = 0;
      }
      common_vendor.index.__f__("log", "at subPackages/partner/order/index.vue:220", "onLoad中加载数据，当前状态:", currentStatus.value);
      loadOrderList();
    });
    common_vendor.watch(currentStatus, (newStatus, oldStatus) => {
      common_vendor.index.__f__("log", "at subPackages/partner/order/index.vue:226", "状态变化:", oldStatus, "->", newStatus);
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
          common_vendor.index.__f__("error", "at subPackages/partner/order/index.vue:254", "切换状态失败:", error);
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
          companion_id: Number(companionId.value)
        };
        if (currentStatus.value === "all") {
        } else if (currentStatus.value === "pending_accept") {
          params.status = 2;
        } else if (currentStatus.value === "pending_service") {
          params.status_group = "pending_service";
        } else if (currentStatus.value === "in_service") {
          params.status = 5;
        } else if (currentStatus.value === "completed") {
          params.status = 6;
        }
        const response = await api_order.getCompanionOrderList(params);
        common_vendor.index.__f__("log", "at subPackages/partner/order/index.vue:316", "response.data", response.data);
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
          throw new Error(response.data.msg || "获取订单列表失败");
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at subPackages/partner/order/index.vue:341", "加载订单列表失败:", error);
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
        common_vendor.index.__f__("error", "at subPackages/partner/order/index.vue:376", "刷新失败:", error);
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
        common_vendor.index.__f__("error", "at subPackages/partner/order/index.vue:396", "加载更多失败:", error);
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
        // 已支付待确认
        3: "status-to-serve",
        // 已确认待到达
        4: "status-to-serve",
        // 已到达待开始
        5: "status-in-progress",
        // 进行中
        6: "status-completed",
        // 已完成
        7: "status-cancelled",
        // 已取消
        8: "status-cancelled",
        // 已取消（原已退款）
        9: "status-cancelled",
        // 已取消（原退款中）
        11: "status-to-serve"
        // 已确认待开始出发
      };
      return statusMap[status] || "status-default";
    };
    const getStatusText = (status) => {
      const statusMap = {
        1: "待付款",
        2: "等待接单",
        3: "我已出发",
        4: "已到达，等待开始服务",
        5: "服务中",
        6: "已完成",
        7: "已取消",
        8: "已取消",
        9: "已取消",
        11: "待服务"
      };
      return statusMap[status] || "未知状态";
    };
    const getOrderActions = (status) => {
      const actionMap = {
        2: [
          // 已支付待确认
          { text: "拒绝", action: "reject", type: "secondary" },
          { text: "接单", action: "accept", type: "primary" }
        ],
        3: [
          // 已确认待到达
          { text: "电话联系", action: "contact", type: "secondary" },
          { text: "我已到达服务地点", action: "arrived", type: "primary" }
        ],
        4: [
          // 已到达待开始
          { text: "电话联系", action: "call", type: "secondary" }
        ],
        5: [
          // 服务中
          { text: "电话联系", action: "contact", type: "secondary" },
          { text: "结束服务", action: "end", type: "primary" }
        ],
        6: [
          // 已完成
          { text: "查看评价", action: "review", type: "secondary" },
          { text: "删除订单", action: "delete", type: "secondary" }
          // { text: '再次服务', action: 'rebook', type: 'primary' }
        ],
        7: [
          // 已取消
          { text: "删除订单", action: "delete", type: "secondary" }
        ],
        8: [
          // 已取消（原已退款）
          { text: "删除订单", action: "delete", type: "secondary" }
        ],
        9: [
          // 已取消（原退款中）
          { text: "订单已取消，给客户退款中", action: "info", type: "info" }
        ],
        11: [
          // 已确认待开始出发
          { text: "电话联系", action: "contact", type: "secondary" },
          { text: "我已出发", action: "depart", type: "depart" }
        ]
      };
      return actionMap[status] || [];
    };
    const handleOrderAction = (action, order) => {
      switch (action) {
        case "contact":
          handleContactCustomer(order);
          break;
        case "accept":
          handleAcceptOrder(order);
          break;
        case "reject":
          handleRejectOrder(order);
          break;
        case "arrived":
          handleArrived(order);
          break;
        case "depart":
          handleDepart(order);
          break;
        case "call":
          handleCallCustomer(order);
          break;
        case "start":
          handleStartService(order);
          break;
        case "end":
          handleEndService(order);
          break;
        case "review":
          handleViewReview(order);
          break;
        case "rebook":
          handleRebookService(order);
          break;
        case "delete":
          handleDeleteOrder(order);
          break;
      }
    };
    const handleContactCustomer = (order) => {
      if (order.user && order.user.phone) {
        common_vendor.index.showModal({
          title: "电话联系",
          content: `是否拨打客户 ${order.user.nick_name} 的电话？`,
          confirmText: "拨打",
          cancelText: "取消",
          success: (res) => {
            if (res.confirm) {
              common_vendor.index.makePhoneCall({
                phoneNumber: order.user.phone
              });
            }
          }
        });
      }
    };
    const handleAcceptOrder = (order) => {
      common_vendor.index.showModal({
        title: "确认接单",
        content: "确定要接受这个订单吗？",
        confirmText: "接单",
        cancelText: "取消",
        success: async (res) => {
          if (res.confirm) {
            try {
              common_vendor.index.showLoading({
                title: "处理中..."
              });
              const response = await api_order.acceptCompanionOrder({
                order_id: order.id,
                companion_id: Number(companionId.value)
              });
              if (response.data.code === 0) {
                common_vendor.index.showToast({
                  title: "接单成功",
                  icon: "success"
                });
                const pendingServiceIndex = statusTabs.value.findIndex((tab) => tab.value === "pending_service");
                if (pendingServiceIndex !== -1) {
                  currentTabIndex.value = pendingServiceIndex;
                  currentStatus.value = "pending_service";
                }
                delete orderListCache.value["pending_service"];
                page.value = 1;
                hasMore.value = true;
                orderListData.value["pending_service"] = [];
                await loadOrderList();
              } else {
                throw new Error(response.data.msg || "接单失败");
              }
            } catch (error) {
              common_vendor.index.__f__("error", "at subPackages/partner/order/index.vue:583", "接单失败:", error);
              common_vendor.index.showToast({
                title: error.message || "接单失败",
                icon: "none"
              });
            } finally {
              common_vendor.index.hideLoading();
            }
          }
        }
      });
    };
    const handleRejectOrder = (order) => {
      common_vendor.index.showModal({
        title: "拒绝订单",
        content: "确定要拒绝这个订单吗？",
        confirmText: "拒绝",
        cancelText: "取消",
        success: async (res) => {
          if (res.confirm) {
            try {
              common_vendor.index.showLoading({
                title: "处理中..."
              });
              const response = await api_order.rejectCompanionOrder({
                order_id: order.id,
                companion_id: Number(companionId.value)
              });
              if (response.data.code === 0) {
                common_vendor.index.showToast({
                  title: "已拒绝订单",
                  icon: "success"
                });
                onRefresh();
              } else {
                throw new Error(response.data.msg || "拒绝订单失败");
              }
            } catch (error) {
              common_vendor.index.__f__("error", "at subPackages/partner/order/index.vue:627", "拒绝订单失败:", error);
              common_vendor.index.showToast({
                title: error.message || "操作失败",
                icon: "none"
              });
            } finally {
              common_vendor.index.hideLoading();
            }
          }
        }
      });
    };
    const handleArrived = (order) => {
      common_vendor.index.showModal({
        title: "确认到达",
        content: "确认您已到达服务地点？",
        confirmText: "确认",
        cancelText: "取消",
        success: async (res) => {
          if (res.confirm) {
            try {
              common_vendor.index.showLoading({
                title: "更新中..."
              });
              const response = await api_order.arrivedCompanionOrder({
                order_id: order.id,
                companion_id: Number(companionId.value)
              });
              if (response.data.code === 0) {
                common_vendor.index.showToast({
                  title: "已确认到达",
                  icon: "success"
                });
                onRefresh();
              } else {
                throw new Error(response.data.msg || "确认到达失败");
              }
            } catch (error) {
              common_vendor.index.__f__("error", "at subPackages/partner/order/index.vue:671", "确认到达失败:", error);
              common_vendor.index.showToast({
                title: error.message || "操作失败",
                icon: "none"
              });
            } finally {
              common_vendor.index.hideLoading();
            }
          }
        }
      });
    };
    const handleCallCustomer = (order) => {
      if (order.user && order.user.phone) {
        common_vendor.index.showModal({
          title: "电话联系",
          content: `是否拨打客户 ${order.user.nick_name} 的电话？`,
          confirmText: "拨打",
          cancelText: "取消",
          success: (res) => {
            if (res.confirm) {
              common_vendor.index.makePhoneCall({
                phoneNumber: order.user.phone
              });
            }
          }
        });
      }
    };
    const handleDepart = (order) => {
      common_vendor.index.showModal({
        title: "确认出发",
        content: "确认您已开始出发前往服务地点？",
        confirmText: "确认",
        cancelText: "取消",
        success: async (res) => {
          if (res.confirm) {
            try {
              common_vendor.index.showLoading({
                title: "更新中..."
              });
              const response = await api_order.departCompanionOrder({
                order_id: order.id,
                companion_id: Number(companionId.value)
              });
              if (response.data.code === 0) {
                common_vendor.index.showToast({
                  title: "已确认出发",
                  icon: "success"
                });
                onRefresh();
              } else {
                throw new Error(response.data.msg || "确认出发失败");
              }
            } catch (error) {
              common_vendor.index.__f__("error", "at subPackages/partner/order/index.vue:734", "确认出发失败:", error);
              common_vendor.index.showToast({
                title: error.message || "操作失败",
                icon: "none"
              });
            } finally {
              common_vendor.index.hideLoading();
            }
          }
        }
      });
    };
    const handleStartService = (order) => {
      common_vendor.index.showModal({
        title: "开始服务",
        content: "确定要开始服务吗？",
        confirmText: "开始",
        cancelText: "取消",
        success: async (res) => {
          if (res.confirm) {
            try {
              common_vendor.index.showLoading({
                title: "更新中..."
              });
              const response = await api_order.startCompanionService({
                order_id: order.id,
                companion_id: companionId.value
              });
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
              common_vendor.index.__f__("error", "at subPackages/partner/order/index.vue:778", "开始服务失败:", error);
              common_vendor.index.showToast({
                title: error.message || "操作失败",
                icon: "none"
              });
            } finally {
              common_vendor.index.hideLoading();
            }
          }
        }
      });
    };
    const handleEndService = (order) => {
      common_vendor.index.showModal({
        title: "结束服务",
        content: "确定要结束服务吗？",
        confirmText: "结束",
        cancelText: "取消",
        success: async (res) => {
          if (res.confirm) {
            try {
              common_vendor.index.showLoading({
                title: "更新中..."
              });
              const response = await api_order.endCompanionService({
                order_id: order.id,
                companion_id: companionId.value
              });
              if (response.data.code === 0) {
                common_vendor.index.showToast({
                  title: "服务已结束",
                  icon: "success"
                });
                onRefresh();
              } else {
                throw new Error(response.data.msg || "结束服务失败");
              }
            } catch (error) {
              common_vendor.index.__f__("error", "at subPackages/partner/order/index.vue:822", "结束服务失败:", error);
              common_vendor.index.showToast({
                title: error.message || "操作失败",
                icon: "none"
              });
            } finally {
              common_vendor.index.hideLoading();
            }
          }
        }
      });
    };
    const handleViewReview = (order) => {
      common_vendor.index.navigateTo({
        url: `/subPackages/partner/review?orderId=${order.id}`
      });
    };
    const handleRebookService = (order) => {
      common_vendor.index.navigateTo({
        url: `/subPackages/partner/rebook?orderId=${order.id}`
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
                order_id: order.id,
                companion_id: companionId.value
              };
              const response = await api_order.deleteCompanionOrder(deleteData);
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
              common_vendor.index.__f__("error", "at subPackages/partner/order/index.vue:882", "删除订单失败:", error);
              common_vendor.index.showToast({
                title: error.message || "删除失败",
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
    const formatServiceDateTime = (serviceDate, serviceTime) => {
      if (!serviceDate && !serviceTime)
        return "待确认";
      let result = "";
      if (serviceDate) {
        const date = new Date(serviceDate);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const weekday = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"][date.getDay()];
        result += `${year}-${month}-${day} ${weekday}`;
      }
      if (serviceTime) {
        if (result) {
          result += " ";
        }
        result += serviceTime;
      }
      return result || "待确认";
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
              var _a, _b;
              return common_vendor.e({
                a: common_vendor.t(formatTime(order.created_at)),
                b: common_vendor.t(getStatusText(order.status)),
                c: common_vendor.n(getStatusClass(order.status)),
                d: _ctx.$imgBaseUrl + order.service_image_url,
                e: common_vendor.t(order.service_name),
                f: common_vendor.t(order.unit_price),
                g: common_vendor.t(order.unit),
                h: common_vendor.t(order.quantity),
                i: common_vendor.t(order.total_amount),
                j: [2, 3, 4, 5, 11].includes(order.status)
              }, [2, 3, 4, 5, 11].includes(order.status) ? common_vendor.e({
                k: order.status != 2 && order.user
              }, order.status != 2 && order.user ? {
                l: common_vendor.t((_a = order == null ? void 0 : order.user) == null ? void 0 : _a.nick_name),
                m: common_vendor.t((_b = order == null ? void 0 : order.user) == null ? void 0 : _b.phone)
              } : {}, {
                n: common_vendor.t(order.service_address),
                o: common_vendor.t(formatServiceDateTime(order.service_date, order.service_time))
              }) : {}, {
                p: order.status === 4
              }, order.status === 4 ? {
                q: common_assets._imports_1$7
              } : {}, {
                r: common_vendor.f(getOrderActions(order.status), (action, actionIndex, i2) => {
                  return {
                    a: common_vendor.t(action.text),
                    b: actionIndex,
                    c: common_vendor.n(action.type),
                    d: common_vendor.o(($event) => handleOrderAction(action.action, order), actionIndex)
                  };
                }),
                s: order.id,
                t: common_vendor.o(($event) => navigateToDetail(order.id), order.id)
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
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-a24e0011"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/subPackages/partner/order/index.js.map
