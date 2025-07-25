"use strict";
const common_vendor = require("../../../common/vendor.js");
const common_assets = require("../../../common/assets.js");
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const statusBarHeight = common_vendor.ref(0);
    common_vendor.onMounted(() => {
      const systemInfo = common_vendor.index.getSystemInfoSync();
      statusBarHeight.value = systemInfo.statusBarHeight || 0;
      common_vendor.index.__f__("log", "at pages/tabbar/discover/index.vue:257", "发现页面加载完成");
    });
    const isSearchActive = common_vendor.ref(false);
    const searchText = common_vendor.ref("");
    common_vendor.ref(null);
    const isRefreshing = common_vendor.ref(false);
    const showRewardModal = common_vendor.ref(false);
    const showCommentModal = common_vendor.ref(false);
    const selectedFeed = common_vendor.ref(null);
    const showLikeToast = common_vendor.ref(false);
    const selectedAmount = common_vendor.ref(10);
    const customAmount = common_vendor.ref("");
    const rewardMessage = common_vendor.ref("");
    common_vendor.ref("weixin");
    const rewardAmounts = [
      { value: 5, label: "小额鼓励" },
      { value: 10, label: "感谢分享" },
      { value: 20, label: "诚挚感谢" },
      { value: 50, label: "大力支持" }
    ];
    const commentText = common_vendor.ref("");
    const replyTo = common_vendor.ref(null);
    const commentList = common_vendor.ref([
      {
        name: "星河",
        avatar: "https://images.unsplash.com/photo-1546961329-78bef0414d7c?w=500&auto=format&fit=crop&q=60",
        text: "看起来好好吃！是在哪家店啊？下次想去试试。",
        time: "刚刚",
        id: 1
      },
      {
        name: "小天",
        avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=500&auto=format&fit=crop&q=60",
        text: "照片拍得真好，有专业摄影师的感觉！",
        time: "10分钟前",
        id: 2
      }
    ]);
    const feeds = common_vendor.ref([
      {
        id: 1,
        name: "清欢",
        avatar: "https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=500",
        text: "今天去了一家超棒的日料店，环境优雅，服务周到，最重要的是食材新鲜，强烈推荐给大家！",
        tags: ["美食", "日料", "探店"],
        img: "https://images.pexels.com/photos/357756/pexels-photo-357756.jpeg?auto=compress&cs=tinysrgb&w=500",
        likes: 128,
        comments: 32,
        isLiked: false
      },
      {
        id: 2,
        name: "鹿鹿",
        avatar: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=500",
        text: "周末和朋友一起去了新开的咖啡厅，环境超赞，咖啡也很香醇，分享给大家～",
        tags: ["咖啡", "探店", "生活"],
        video: true,
        videoThumbnail: "https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=500",
        likes: 256,
        comments: 48,
        isLiked: false
      },
      {
        id: 3,
        name: "Lucky",
        avatar: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=500",
        text: "今天天气真好，去公园散步，拍了一些美美的照片，分享给大家～",
        tags: ["生活", "摄影", "日常"],
        img: "https://images.pexels.com/photos/414612/pexels-photo-414612.jpeg?auto=compress&cs=tinysrgb&w=500",
        likes: 89,
        comments: 15,
        isLiked: false
      },
      {
        id: 4,
        name: "星辰",
        avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=500",
        text: "周末爬山看日出，那一刻所有的疲惫都烟消云散，大自然的力量真的很治愈！",
        tags: ["旅行", "户外", "日出"],
        img: "https://images.pexels.com/photos/96622/pexels-photo-96622.jpeg?auto=compress&cs=tinysrgb&w=500",
        likes: 324,
        comments: 67,
        isLiked: false
      },
      {
        id: 5,
        name: "小柠檬",
        avatar: "https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg?auto=compress&cs=tinysrgb&w=500",
        text: "自己做的柠檬蛋糕终于成功了！酸甜可口，卖相也不错，下次可以试试其他口味～",
        tags: ["烘焙", "美食", "DIY"],
        img: "https://images.pexels.com/photos/1126359/pexels-photo-1126359.jpeg?auto=compress&cs=tinysrgb&w=500",
        likes: 156,
        comments: 28,
        isLiked: false
      },
      {
        id: 6,
        name: "流年",
        avatar: "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=500",
        text: "今天读完了《百年孤独》，感触很深，马尔克斯的文字真的有一种神奇的魔力...",
        tags: ["阅读", "文学", "感悟"],
        img: "https://images.pexels.com/photos/46274/pexels-photo-46274.jpeg?auto=compress&cs=tinysrgb&w=500",
        likes: 201,
        comments: 42,
        isLiked: false
      },
      {
        id: 7,
        name: "青柠",
        avatar: "https://images.pexels.com/photos/1758144/pexels-photo-1758144.jpeg?auto=compress&cs=tinysrgb&w=500",
        text: "晨跑5公里完成！虽然累但是心情超棒，运动真的是最好的解压方式～",
        tags: ["运动", "跑步", "健康"],
        video: true,
        videoThumbnail: "https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=500",
        likes: 178,
        comments: 35,
        isLiked: false
      },
      {
        id: 8,
        name: "墨染",
        avatar: "https://images.pexels.com/photos/1499327/pexels-photo-1499327.jpeg?auto=compress&cs=tinysrgb&w=500",
        text: "第一次尝试画水彩，虽然不够完美，但是享受这个过程就很棒了！",
        tags: ["绘画", "水彩", "艺术"],
        img: "https://images.pexels.com/photos/1143754/pexels-photo-1143754.jpeg?auto=compress&cs=tinysrgb&w=500",
        likes: 134,
        comments: 23,
        isLiked: false
      },
      {
        id: 9,
        name: "微光",
        avatar: "https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?auto=compress&cs=tinysrgb&w=500",
        text: "海边的落日真的太美了，一个人静静地看着太阳慢慢落下，心情都变得平静了",
        tags: ["海边", "落日", "治愈"],
        img: "https://images.pexels.com/photos/189349/pexels-photo-189349.jpeg?auto=compress&cs=tinysrgb&w=500",
        likes: 445,
        comments: 78,
        isLiked: false
      },
      {
        id: 10,
        name: "糖果",
        avatar: "https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=500",
        text: "学会了新的编发技巧，感觉自己美美哒！女孩子就是要多尝试不同的造型～",
        tags: ["美妆", "编发", "造型"],
        video: true,
        videoThumbnail: "https://images.pexels.com/photos/1319460/pexels-photo-1319460.jpeg?auto=compress&cs=tinysrgb&w=500",
        likes: 267,
        comments: 54,
        isLiked: false
      },
      {
        id: 11,
        name: "夜雨",
        avatar: "https://images.pexels.com/photos/1484794/pexels-photo-1484794.jpeg?auto=compress&cs=tinysrgb&w=500",
        text: "深夜的城市别有一番风味，霓虹灯下的街道总是让人想起很多故事...",
        tags: ["夜景", "城市", "摄影"],
        img: "https://images.pexels.com/photos/378570/pexels-photo-378570.jpeg?auto=compress&cs=tinysrgb&w=500",
        likes: 312,
        comments: 61,
        isLiked: false
      },
      {
        id: 12,
        name: "晨曦",
        avatar: "https://images.pexels.com/photos/1385472/pexels-photo-1385472.jpeg?auto=compress&cs=tinysrgb&w=500",
        text: "今天的早餐特别用心，营养搭配也很均衡，美好的一天从健康早餐开始～",
        tags: ["早餐", "健康", "营养"],
        img: "https://images.pexels.com/photos/103124/pexels-photo-103124.jpeg?auto=compress&cs=tinysrgb&w=500",
        likes: 189,
        comments: 31,
        isLiked: false
      },
      {
        id: 13,
        name: "南风",
        avatar: "https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=500",
        text: "古镇的慢时光让人很放松，走在青石板路上，仿佛穿越到了另一个时代",
        tags: ["古镇", "旅行", "慢生活"],
        img: "https://images.pexels.com/photos/1563356/pexels-photo-1563356.jpeg?auto=compress&cs=tinysrgb&w=500",
        likes: 398,
        comments: 72,
        isLiked: false
      },
      {
        id: 14,
        name: "薄荷",
        avatar: "https://images.pexels.com/photos/1687675/pexels-photo-1687675.jpeg?auto=compress&cs=tinysrgb&w=500",
        text: "今天学会了一道新菜，味道竟然比想象中的好！看来我的厨艺有进步～",
        tags: ["美食", "烹饪", "学习"],
        video: true,
        videoThumbnail: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=500",
        likes: 145,
        comments: 26,
        isLiked: false
      },
      {
        id: 15,
        name: "暖阳",
        avatar: "https://images.pexels.com/photos/1239288/pexels-photo-1239288.jpeg?auto=compress&cs=tinysrgb&w=500",
        text: "瑜伽课结束，整个人都放松了很多，身心的平衡真的很重要～",
        tags: ["瑜伽", "健康", "放松"],
        img: "https://images.pexels.com/photos/317157/pexels-photo-317157.jpeg?auto=compress&cs=tinysrgb&w=500",
        likes: 223,
        comments: 38,
        isLiked: false
      },
      {
        id: 16,
        name: "月影",
        avatar: "https://images.pexels.com/photos/1674752/pexels-photo-1674752.jpeg?auto=compress&cs=tinysrgb&w=500",
        text: "夜空中的满月真的很美，配上这首钢琴曲，整个夜晚都变得诗意了",
        tags: ["夜空", "月亮", "音乐"],
        img: "https://images.pexels.com/photos/1440476/pexels-photo-1440476.jpeg?auto=compress&cs=tinysrgb&w=500",
        likes: 356,
        comments: 65,
        isLiked: false
      },
      {
        id: 17,
        name: "浅夏",
        avatar: "https://images.pexels.com/photos/1542085/pexels-photo-1542085.jpeg?auto=compress&cs=tinysrgb&w=500",
        text: "花市淘到了很多好看的多肉植物，小小的生命力总是让人感到治愈～",
        tags: ["植物", "多肉", "生活"],
        img: "https://images.pexels.com/photos/1164985/pexels-photo-1164985.jpeg?auto=compress&cs=tinysrgb&w=500",
        likes: 167,
        comments: 29,
        isLiked: false
      },
      {
        id: 18,
        name: "青空",
        avatar: "https://images.pexels.com/photos/1559486/pexels-photo-1559486.jpeg?auto=compress&cs=tinysrgb&w=500",
        text: "博物馆的展览真的很棒，每一件文物都有自己的故事，历史的厚重感扑面而来",
        tags: ["博物馆", "文化", "历史"],
        img: "https://images.pexels.com/photos/1058397/pexels-photo-1058397.jpeg?auto=compress&cs=tinysrgb&w=500",
        likes: 278,
        comments: 47,
        isLiked: false
      },
      {
        id: 19,
        name: "柠夏",
        avatar: "https://images.pexels.com/photos/1722198/pexels-photo-1722198.jpeg?auto=compress&cs=tinysrgb&w=500",
        text: "今天的滑板课终于学会了一个新动作！虽然摔了很多次，但是成功的那一刻太爽了！",
        tags: ["滑板", "运动", "挑战"],
        video: true,
        videoThumbnail: "https://images.pexels.com/photos/416978/pexels-photo-416978.jpeg?auto=compress&cs=tinysrgb&w=500",
        likes: 234,
        comments: 43,
        isLiked: false
      },
      {
        id: 20,
        name: "星河",
        avatar: "https://images.pexels.com/photos/1386604/pexels-photo-1386604.jpeg?auto=compress&cs=tinysrgb&w=500",
        text: "山顶的星空真的震撼到我了，远离城市的光污染，满天繁星就在眼前✨",
        tags: ["星空", "户外", "天文"],
        img: "https://images.pexels.com/photos/1252890/pexels-photo-1252890.jpeg?auto=compress&cs=tinysrgb&w=500",
        likes: 512,
        comments: 89,
        isLiked: false
      },
      {
        id: 21,
        name: "梧桐",
        avatar: "https://images.pexels.com/photos/1310522/pexels-photo-1310522.jpeg?auto=compress&cs=tinysrgb&w=500",
        text: "手工制作的陶艺作品完成了，虽然有些不完美，但这就是手作的魅力～",
        tags: ["手工", "陶艺", "DIY"],
        img: "https://images.pexels.com/photos/1090638/pexels-photo-1090638.jpeg?auto=compress&cs=tinysrgb&w=500",
        likes: 198,
        comments: 34,
        isLiked: false
      },
      {
        id: 22,
        name: "初见",
        avatar: "https://images.pexels.com/photos/1468379/pexels-photo-1468379.jpeg?auto=compress&cs=tinysrgb&w=500",
        text: "今天的街头音乐表演真的很棒，音乐让整条街都变得有活力了！",
        tags: ["音乐", "街头", "艺术"],
        video: true,
        videoThumbnail: "https://images.pexels.com/photos/995301/pexels-photo-995301.jpeg?auto=compress&cs=tinysrgb&w=500",
        likes: 287,
        comments: 52,
        isLiked: false
      },
      {
        id: 23,
        name: "云朵",
        avatar: "https://images.pexels.com/photos/1832323/pexels-photo-1832323.jpeg?auto=compress&cs=tinysrgb&w=500",
        text: "下午茶时光，一本好书配上一杯香茶，这就是我理想中的慢生活～",
        tags: ["下午茶", "阅读", "慢生活"],
        img: "https://images.pexels.com/photos/1251175/pexels-photo-1251175.jpeg?auto=compress&cs=tinysrgb&w=500",
        likes: 165,
        comments: 28,
        isLiked: false
      }
    ]);
    const filteredFeeds = common_vendor.ref([...feeds.value]);
    const finalAmount = common_vendor.computed(() => {
      if (customAmount.value && customAmount.value > 0) {
        return customAmount.value;
      }
      return selectedAmount.value;
    });
    const filterFeeds = () => {
      if (searchText.value.trim() === "") {
        filteredFeeds.value = feeds.value;
      } else {
        filteredFeeds.value = feeds.value.filter((feed) => {
          return feed.name.toLowerCase().includes(searchText.value.toLowerCase()) || feed.text.toLowerCase().includes(searchText.value.toLowerCase()) || feed.tags.some((tag) => tag.toLowerCase().includes(searchText.value.toLowerCase()));
        });
      }
    };
    const clearSearch = () => {
      searchText.value = "";
      filterFeeds();
    };
    const onRefresh = () => {
      isRefreshing.value = true;
      setTimeout(() => {
        isRefreshing.value = false;
      }, 1e3);
    };
    const handleLike = (feed) => {
      feed.isLiked = !feed.isLiked;
      if (feed.isLiked) {
        feed.likes++;
        showLikeToast.value = true;
        setTimeout(() => {
          showLikeToast.value = false;
        }, 1e3);
      } else {
        feed.likes--;
      }
    };
    const openRewardModal = (feed) => {
      selectedFeed.value = feed;
      showRewardModal.value = true;
    };
    const closeRewardModal = () => {
      showRewardModal.value = false;
      selectedAmount.value = 10;
      customAmount.value = "";
      rewardMessage.value = "";
    };
    const selectAmount = (value) => {
      selectedAmount.value = value;
      if (value > 0) {
        customAmount.value = "";
      }
    };
    const confirmReward = () => {
      common_vendor.index.showToast({
        title: `成功打赏了 ${selectedFeed.value.name} ${finalAmount.value}元！`,
        icon: "success"
      });
      closeRewardModal();
    };
    const openCommentModal = (feed) => {
      selectedFeed.value = feed;
      showCommentModal.value = true;
    };
    const closeCommentModal = () => {
      showCommentModal.value = false;
      commentText.value = "";
      replyTo.value = null;
    };
    const replyToComment = (comment) => {
      replyTo.value = comment;
    };
    const sendComment = () => {
      if (!commentText.value.trim())
        return;
      const newComment = {
        name: "我",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=500&auto=format&fit=crop&q=60",
        text: replyTo.value ? `@${replyTo.value.name} ${commentText.value}` : commentText.value,
        time: "刚刚",
        id: Date.now()
      };
      commentList.value.unshift(newComment);
      if (selectedFeed.value) {
        selectedFeed.value.comments++;
      }
      commentText.value = "";
      replyTo.value = null;
    };
    const navigateToBooking = (feed) => {
      common_vendor.index.navigateTo({
        url: `/subPackages/booking/pages/index?partnerId=${feed.id}&name=${feed.name}&avatar=${feed.avatar}`
      });
    };
    const playVideo = (feed) => {
      common_vendor.index.__f__("log", "at pages/tabbar/discover/index.vue:706", "播放视频:", feed.id);
    };
    const getPostPreview = () => {
      if (selectedFeed.value) {
        return selectedFeed.value.text.substring(0, 50) + (selectedFeed.value.text.length > 50 ? "..." : "");
      }
      return "";
    };
    const getCommentPlaceholder = () => {
      if (replyTo.value) {
        return `回复 ${replyTo.value.name}`;
      }
      return "添加评论...";
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_assets._imports_0$1,
        b: common_vendor.o([($event) => searchText.value = $event.detail.value, filterFeeds]),
        c: searchText.value,
        d: isSearchActive.value,
        e: statusBarHeight.value + "px",
        f: searchText.value && filteredFeeds.value.length === 0
      }, searchText.value && filteredFeeds.value.length === 0 ? {
        g: common_assets._imports_0$1,
        h: common_vendor.t(searchText.value),
        i: common_vendor.o(clearSearch)
      } : {}, {
        j: common_vendor.f(filteredFeeds.value, (feed, k0, i0) => {
          return common_vendor.e({
            a: feed.avatar,
            b: common_vendor.t(feed.name),
            c: common_vendor.f(feed.tags, (tag, k1, i1) => {
              return {
                a: common_vendor.t(tag),
                b: tag
              };
            }),
            d: common_vendor.t(feed.text),
            e: feed.img
          }, feed.img ? {
            f: feed.img
          } : {}, {
            g: feed.video
          }, feed.video ? common_vendor.e({
            h: feed.videoThumbnail
          }, feed.videoThumbnail ? {
            i: feed.videoThumbnail
          } : {}, {
            j: common_assets._imports_1$3,
            k: common_vendor.o(($event) => playVideo(feed), feed.id)
          }) : {}, {
            l: !feed.isLiked
          }, !feed.isLiked ? {
            m: common_assets._imports_2$1
          } : {
            n: common_assets._imports_3
          }, {
            o: common_vendor.t(feed.likes),
            p: common_vendor.o(($event) => handleLike(feed), feed.id),
            q: common_vendor.t(feed.comments),
            r: common_vendor.o(($event) => openCommentModal(feed), feed.id),
            s: common_vendor.o(($event) => openRewardModal(feed), feed.id),
            t: common_vendor.o(($event) => navigateToBooking(feed), feed.id),
            v: feed.id
          });
        }),
        k: common_assets._imports_4,
        l: isRefreshing.value,
        m: common_vendor.o(onRefresh),
        n: showRewardModal.value
      }, showRewardModal.value ? {
        o: common_assets._imports_3,
        p: common_vendor.t(selectedFeed.value && selectedFeed.value.name || ""),
        q: common_assets._imports_3,
        r: common_vendor.f(rewardAmounts, (amount, k0, i0) => {
          return common_vendor.e({
            a: common_vendor.t(amount.value),
            b: common_vendor.t(amount.label),
            c: selectedAmount.value === amount.value
          }, selectedAmount.value === amount.value ? {} : {}, {
            d: amount.value,
            e: common_vendor.o(($event) => selectAmount(amount.value), amount.value),
            f: selectedAmount.value === amount.value ? 1 : ""
          });
        }),
        s: common_vendor.o(($event) => selectAmount(0)),
        t: customAmount.value,
        v: common_vendor.o(($event) => customAmount.value = $event.detail.value),
        w: selectedAmount.value === 0 && customAmount.value ? 1 : "",
        x: rewardMessage.value,
        y: common_vendor.o(($event) => rewardMessage.value = $event.detail.value),
        z: common_vendor.t(rewardMessage.value.length),
        A: common_vendor.t(finalAmount.value),
        B: common_assets._imports_3,
        C: common_vendor.o(confirmReward),
        D: common_vendor.o(() => {
        }),
        E: common_vendor.o(closeRewardModal)
      } : {}, {
        F: showCommentModal.value
      }, showCommentModal.value ? common_vendor.e({
        G: common_assets._imports_5,
        H: common_vendor.o(closeCommentModal),
        I: selectedFeed.value && selectedFeed.value.avatar || "",
        J: common_vendor.t(selectedFeed.value && selectedFeed.value.name || ""),
        K: common_vendor.t(getPostPreview()),
        L: commentList.value.length > 0
      }, commentList.value.length > 0 ? {
        M: common_vendor.f(commentList.value, (comment, index, i0) => {
          return {
            a: comment.avatar,
            b: common_vendor.t(comment.name),
            c: common_vendor.t(comment.text),
            d: common_vendor.t(comment.time),
            e: common_vendor.o(($event) => replyToComment(comment), index),
            f: index
          };
        })
      } : {
        N: common_assets._imports_3$1
      }, {
        O: getCommentPlaceholder(),
        P: commentText.value,
        Q: common_vendor.o(($event) => commentText.value = $event.detail.value),
        R: common_vendor.o(sendComment),
        S: !commentText.value.trim() ? 1 : "",
        T: common_vendor.o(() => {
        }),
        U: common_vendor.o(closeCommentModal)
      }) : {}, {
        V: showLikeToast.value
      }, showLikeToast.value ? {
        W: common_assets._imports_3
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-ad07ea5c"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/tabbar/discover/index.js.map
