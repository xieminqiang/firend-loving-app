"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const api_order = require("../../api/order.js");
const stores_city = require("../../stores/city.js");
const _sfc_main = {
  __name: "detail",
  setup(__props) {
    const orderDetail = common_vendor.ref({});
    const orderId = common_vendor.ref(null);
    const cityStore = stores_city.useCityStore();
    const progressSteps = common_vendor.ref([
      { title: "友伴接单", icon: "✓", status: "pending" },
      { title: "友伴出发", icon: "✓", status: "pending" },
      { title: "友伴到达", icon: "✓", status: "pending" },
      { title: "开始服务", icon: "✓", status: "pending" },
      { title: "服务完成", icon: "✓", status: "pending" }
    ]);
    common_vendor.onLoad((options) => {
      if (options.orderId) {
        orderId.value = options.orderId;
        loadOrderDetail();
      }
    });
    const loadOrderDetail = async () => {
      try {
        common_vendor.index.showLoading({ title: "加载中..." });
        const response = await api_order.getOrderDetail({ order_id: Number(orderId.value) });
        common_vendor.index.__f__("log", "at subPackages/order/detail.vue:185", response.data);
        if (response.data.code === 0) {
          orderDetail.value = {
            ...response.data.data.order,
            logs: response.data.data.logs || []
          };
          updateProgressSteps();
        } else {
          throw new Error(response.data.msg || "获取订单详情失败");
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at subPackages/order/detail.vue:197", "加载订单详情失败:", error);
        common_vendor.index.showToast({
          title: error.message || "加载失败",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    };
    const updateProgressSteps = () => {
      const logs = orderDetail.value.logs || [];
      progressSteps.value.forEach((step) => {
        step.status = "pending";
      });
      const acceptLog = logs.find((log) => log.status === 11);
      if (acceptLog) {
        progressSteps.value[0].status = "completed";
      }
      const departLog = logs.find((log) => log.status === 3);
      if (departLog) {
        progressSteps.value[1].status = "completed";
      }
      const arriveLog = logs.find((log) => log.status === 4);
      if (arriveLog) {
        progressSteps.value[2].status = "completed";
      }
      const startLog = logs.find((log) => log.status === 5);
      if (startLog) {
        progressSteps.value[3].status = "completed";
      }
      const completeLog = logs.find((log) => log.status === 6);
      if (completeLog) {
        progressSteps.value[4].status = "completed";
      }
    };
    const getStepClass = (status) => {
      return status;
    };
    const getConnectorClass = (currentStatus, nextStatus) => {
      if (currentStatus === "completed") {
        return "completed";
      }
      return "pending";
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
    const getOrderActions = (status) => {
      const actionMap = {
        1: [
          // 待支付
          { text: "取消订单", action: "cancel", type: "secondary" },
          { text: "立即支付", action: "pay", type: "primary" }
        ],
        2: [
          // 已支付待确认
          { text: "申请退款", action: "refund", type: "secondary" },
          { text: "联系友伴", action: "contact", type: "primary" }
        ],
        3: [
          // 已出发待到达
          { text: "申请退款", action: "refund", type: "secondary" },
          { text: "联系友伴", action: "contact", type: "primary" }
        ],
        4: [
          // 已到达待开始
          { text: "申请退款", action: "refund", type: "secondary" },
          { text: "开始服务", action: "start", type: "start" }
        ],
        5: [
          // 服务中
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
          // 订单超时取消
          { text: "删除订单", action: "delete", type: "secondary" }
        ],
        11: [
          // 已确认待开始出发
          { text: "申请退款", action: "refund", type: "secondary" },
          { text: "联系友伴", action: "contact", type: "primary" }
        ]
      };
      return actionMap[status] || [];
    };
    const handleOrderAction = (action, order) => {
      switch (action) {
        case "cancel":
          handleCancelOrder();
          break;
        case "refund":
          handleApplyRefund();
          break;
        case "pay":
          handlePayOrder(order);
          break;
        case "contact":
          common_vendor.index.showToast({
            title: "联系功能暂不可用",
            icon: "none"
          });
          break;
        case "extend":
          handleExtendOrder(order);
          break;
        case "rebook":
          handleRebookOrder(order);
          break;
        case "delete":
          handleDeleteOrder();
          break;
        case "start":
          handleStartService();
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
          }
        }
      });
    };
    const handleApplyRefund = (order) => {
      common_vendor.index.showModal({
        title: "申请退款",
        content: "确定要申请退款吗？",
        confirmText: "申请退款",
        cancelText: "取消",
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.showToast({
              title: "退款申请已提交",
              icon: "success"
            });
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
              common_vendor.index.__f__("log", "at subPackages/order/detail.vue:439", "支付成功", res);
              common_vendor.index.showToast({
                title: "支付成功",
                icon: "success"
              });
              setTimeout(() => {
                loadOrderDetail();
              }, 1500);
            },
            fail: (err) => {
              common_vendor.index.__f__("error", "at subPackages/order/detail.vue:450", "支付失败", JSON.stringify(err));
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
        common_vendor.index.__f__("error", "at subPackages/order/detail.vue:461", "支付失败:", error);
        common_vendor.index.showToast({
          title: error.message || "支付失败",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    };
    const handleStartService = (order) => {
      common_vendor.index.showModal({
        title: "开始服务",
        content: "确认友伴师已到达并开始服务吗？",
        confirmText: "开始服务",
        cancelText: "取消",
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.showToast({
              title: "服务已开始",
              icon: "success"
            });
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
    const handleDeleteOrder = (order) => {
      common_vendor.index.showModal({
        title: "删除订单",
        content: "确定要删除这个订单吗？删除后不可恢复。",
        confirmText: "删除",
        cancelText: "取消",
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.showToast({
              title: "订单已删除",
              icon: "success"
            });
          }
        }
      });
    };
    const formatTime = (timeStr) => {
      if (!timeStr)
        return "";
      const date = new Date(timeStr);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    };
    const copyOrderNo = (orderNo) => {
      if (!orderNo) {
        common_vendor.index.showToast({
          title: "订单号为空",
          icon: "none"
        });
        return;
      }
      common_vendor.index.setClipboardData({
        data: orderNo,
        success: () => {
          common_vendor.index.showToast({
            title: "订单号已复制",
            icon: "success"
          });
        },
        fail: () => {
          common_vendor.index.showToast({
            title: "复制失败",
            icon: "none"
          });
        }
      });
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
      var _a, _b, _c, _d;
      return common_vendor.e({
        a: common_vendor.t(getStatusText(orderDetail.value.status)),
        b: common_vendor.n(getStatusClass(orderDetail.value.status)),
        c: common_vendor.f(progressSteps.value, (step, index, i0) => {
          return common_vendor.e({
            a: common_vendor.t(step.icon),
            b: common_vendor.t(step.title),
            c: index < progressSteps.value.length - 1
          }, index < progressSteps.value.length - 1 ? {
            d: common_vendor.n(getConnectorClass(step.status, progressSteps.value[index + 1].status))
          } : {}, {
            e: index,
            f: common_vendor.n(getStepClass(step.status))
          });
        }),
        d: _ctx.$imgBaseUrl + orderDetail.value.service_image_url,
        e: common_vendor.t(orderDetail.value.service_name),
        f: common_vendor.t(orderDetail.value.unit_price),
        g: common_vendor.t(orderDetail.value.unit),
        h: common_vendor.t(orderDetail.value.quantity),
        i: common_vendor.t(orderDetail.value.total_amount),
        j: (_b = (_a = orderDetail.value) == null ? void 0 : _a.companion) == null ? void 0 : _b.avatar,
        k: common_vendor.t((_d = (_c = orderDetail.value) == null ? void 0 : _c.companion) == null ? void 0 : _d.nickname),
        l: common_vendor.t(orderDetail.value.service_address),
        m: common_vendor.t(formatServiceDateTime(orderDetail.value.service_date, orderDetail.value.service_time)),
        n: common_vendor.t(orderDetail.value.order_no),
        o: common_assets._imports_0$6,
        p: common_vendor.o(($event) => copyOrderNo(orderDetail.value.order_no)),
        q: orderDetail.value.start_time
      }, orderDetail.value.start_time ? {
        r: common_vendor.t(formatTime(orderDetail.value.start_time))
      } : {}, {
        s: orderDetail.value.end_time
      }, orderDetail.value.end_time ? {
        t: common_vendor.t(formatTime(orderDetail.value.end_time))
      } : {}, {
        v: common_vendor.t(formatTime(orderDetail.value.created_at)),
        w: orderDetail.value.payment_time
      }, orderDetail.value.payment_time ? {
        x: common_vendor.t(formatTime(orderDetail.value.payment_time))
      } : {}, {
        y: orderDetail.value.remark
      }, orderDetail.value.remark ? {
        z: common_vendor.t(orderDetail.value.remark)
      } : {}, {
        A: common_vendor.f(getOrderActions(orderDetail.value.status), (action, index, i0) => {
          return common_vendor.e({
            a: common_vendor.t(action.text),
            b: action.text === "联系客服"
          }, action.text === "联系客服" ? {
            c: common_vendor.o(() => {
            }, index)
          } : {}, {
            d: index,
            e: common_vendor.n(action.type),
            f: common_vendor.o(($event) => handleOrderAction(action.action, orderDetail.value), index)
          });
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-c0a82bfd"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/subPackages/order/detail.js.map
