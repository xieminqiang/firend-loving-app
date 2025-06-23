"use strict";
const common_vendor = require("../../../common/vendor.js");
const common_assets = require("../../../common/assets.js");
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const statusBarHeight = common_vendor.ref(0);
    const city = common_vendor.ref("南昌市");
    const search = common_vendor.ref("");
    common_vendor.ref(false);
    const isRefreshing = common_vendor.ref(false);
    const activeTab = common_vendor.ref("recommend");
    const partnerTabs = [
      { id: "recommend", name: "推荐", icon: "@/static/icons/friend/fire.png" },
      { id: "around", name: "周边", icon: "@/static/icons/friend/location.png" },
      { id: "matched", name: "匹配", icon: "@/static/icons/friend/heart.png" },
      { id: "favorites", name: "收藏", icon: "@/static/icons/friend/bookmark.png" }
    ];
    const activeModal = common_vendor.ref("");
    const genderFilter = common_vendor.ref("all");
    const distanceFilter = common_vendor.ref("all");
    const sortFilter = common_vendor.ref("recommend");
    const partnersList = common_vendor.ref([
      {
        id: 1,
        name: "若汐",
        gender: "女",
        age: 21,
        weight: 45,
        height: 168,
        distance: 3.1,
        tags: ["古典美人", "温婉如玉", "琴棋书画", "茶艺精通"],
        rate: 42,
        avatar: "https://images.pexels.com/photos/1391498/pexels-photo-1391498.jpeg?auto=compress&cs=tinysrgb&w=120&h=160&fit=crop",
        online: true,
        new: true,
        bookable: true
      },
      {
        id: 2,
        name: "诗韵",
        gender: "女",
        age: 23,
        weight: 48,
        height: 170,
        distance: 5.2,
        tags: ["知书达理", "温文尔雅", "古风汉服", "诗词歌赋"],
        rate: 28,
        avatar: "https://images.pexels.com/photos/1858175/pexels-photo-1858175.jpeg?auto=compress&cs=tinysrgb&w=120&h=160&fit=crop",
        online: true,
        new: false,
        bookable: true
      },
      {
        id: 3,
        name: "思雨",
        gender: "女",
        age: 22,
        weight: 44,
        height: 162,
        distance: 4.3,
        tags: ["江南水乡", "温柔似水", "刺绣手艺", "古典舞蹈"],
        rate: 36,
        avatar: "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=120&h=160&fit=crop",
        online: false,
        new: false,
        bookable: true
      },
      {
        id: 4,
        name: "君逸",
        gender: "男",
        age: 24,
        weight: 68,
        height: 187,
        distance: 2.5,
        tags: ["翩翩君子", "儒雅风度", "书法造诣", "武术高手"],
        rate: 19,
        avatar: "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=120&h=160&fit=crop",
        online: true,
        new: false,
        bookable: false
      },
      {
        id: 5,
        name: "墨轩",
        gender: "男",
        age: 25,
        weight: 65,
        height: 183,
        distance: 3.8,
        tags: ["文人墨客", "古典文学", "国画大师", "雅致品味"],
        rate: 31,
        avatar: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=120&h=160&fit=crop",
        online: true,
        new: false,
        bookable: false
      },
      {
        id: 6,
        name: "梦瑶",
        gender: "女",
        age: 22,
        weight: 46,
        height: 163,
        distance: 1.7,
        tags: ["仙气飘飘", "古典美人", "古筝演奏", "诗意生活"],
        rate: 45,
        avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=120&h=160&fit=crop",
        online: true,
        new: true,
        bookable: true
      },
      {
        id: 7,
        name: "清婉",
        gender: "女",
        age: 24,
        weight: 50,
        height: 172,
        distance: 4.6,
        tags: ["清雅脱俗", "兰心蕙质", "花艺师", "香道传人"],
        rate: 38,
        avatar: "https://images.pexels.com/photos/1391498/pexels-photo-1391498.jpeg?auto=compress&cs=tinysrgb&w=120&h=160&fit=crop",
        online: false,
        new: false,
        bookable: true
      },
      {
        id: 8,
        name: "凌风",
        gender: "男",
        age: 26,
        weight: 72,
        height: 185,
        distance: 3.9,
        tags: ["剑眉星目", "潇洒不羁", "太极高手", "古韵音乐"],
        rate: 27,
        avatar: "https://images.pexels.com/photos/1559486/pexels-photo-1559486.jpeg?auto=compress&cs=tinysrgb&w=120&h=160&fit=crop",
        online: true,
        new: false,
        bookable: true
      },
      {
        id: 9,
        name: "雨荷",
        gender: "女",
        age: 20,
        weight: 45,
        height: 160,
        distance: 2.2,
        tags: ["莲花般纯净", "古典乐器", "水墨画", "禅茶一味"],
        rate: 22,
        avatar: "https://images.pexels.com/photos/1462980/pexels-photo-1462980.jpeg?auto=compress&cs=tinysrgb&w=120&h=160&fit=crop",
        online: false,
        new: true,
        bookable: true
      },
      {
        id: 10,
        name: "玉轩",
        gender: "男",
        age: 25,
        weight: 70,
        height: 182,
        distance: 5.1,
        tags: ["温润如玉", "古典文化", "围棋国手", "品茶论道"],
        rate: 33,
        avatar: "https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?auto=compress&cs=tinysrgb&w=120&h=160&fit=crop",
        online: true,
        new: false,
        bookable: false
      },
      {
        id: 11,
        name: "紫烟",
        gender: "女",
        age: 23,
        weight: 47,
        height: 165,
        distance: 2.3,
        tags: ["紫气东来", "古典舞蹈", "丝竹雅乐", "香道精通"],
        rate: 39,
        avatar: "https://images.pexels.com/photos/1542085/pexels-photo-1542085.jpeg?auto=compress&cs=tinysrgb&w=120&h=160&fit=crop",
        online: true,
        new: false,
        bookable: true
      },
      {
        id: 12,
        name: "语嫣",
        gender: "女",
        age: 22,
        weight: 45,
        height: 168,
        distance: 3.5,
        tags: ["巧笑嫣然", "古典诗词", "汉服达人", "传统文化"],
        rate: 35,
        avatar: "https://images.pexels.com/photos/1674752/pexels-photo-1674752.jpeg?auto=compress&cs=tinysrgb&w=120&h=160&fit=crop",
        online: false,
        new: true,
        bookable: true
      },
      {
        id: 13,
        name: "景行",
        gender: "男",
        age: 28,
        weight: 75,
        height: 186,
        distance: 4.2,
        tags: ["高山景行", "儒雅学者", "古典哲学", "琴瑟和鸣"],
        rate: 40,
        avatar: "https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=120&h=160&fit=crop",
        online: true,
        new: false,
        bookable: true
      },
      {
        id: 14,
        name: "芷若",
        gender: "女",
        age: 24,
        weight: 46,
        height: 163,
        distance: 5,
        tags: ["白芷若雪", "空谷幽兰", "古典美学", "琴棋书画"],
        rate: 43,
        avatar: "https://images.pexels.com/photos/1832959/pexels-photo-1832959.jpeg?auto=compress&cs=tinysrgb&w=120&h=160&fit=crop",
        online: true,
        new: false,
        bookable: true
      },
      {
        id: 15,
        name: "君临",
        gender: "男",
        age: 27,
        weight: 73,
        height: 182,
        distance: 3.7,
        tags: ["君临天下", "王者风范", "国学底蕴", "武道精神"],
        rate: 37,
        avatar: "https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=120&h=160&fit=crop",
        online: false,
        new: false,
        bookable: true
      },
      {
        id: 16,
        name: "素锦",
        gender: "女",
        age: 21,
        weight: 45,
        height: 162,
        distance: 1.9,
        tags: ["素雅如锦", "古典气质", "传统手工", "诗意栖居"],
        rate: 31,
        avatar: "https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=120&h=160&fit=crop",
        online: true,
        new: true,
        bookable: true
      },
      {
        id: 17,
        name: "擎宇",
        gender: "男",
        age: 26,
        weight: 72,
        height: 183,
        distance: 2.8,
        tags: ["气宇轩昂", "文武双全", "传统文化", "正能量"],
        rate: 45,
        avatar: "https://images.pexels.com/photos/1845331/pexels-photo-1845331.jpeg?auto=compress&cs=tinysrgb&w=120&h=160&fit=crop",
        online: true,
        new: false,
        bookable: true
      },
      {
        id: 18,
        name: "青柠",
        gender: "女",
        age: 25,
        weight: 48,
        height: 170,
        distance: 4.1,
        tags: ["青春柠檬", "活力四射", "古典与现代", "多才多艺"],
        rate: 42,
        avatar: "https://images.pexels.com/photos/1300402/pexels-photo-1300402.jpeg?auto=compress&cs=tinysrgb&w=120&h=160&fit=crop",
        online: false,
        new: false,
        bookable: true
      },
      {
        id: 19,
        name: "皓月",
        gender: "男",
        age: 29,
        weight: 78,
        height: 188,
        distance: 5.4,
        tags: ["皓月当空", "风度翩翩", "古典文学", "高雅品味"],
        rate: 39,
        avatar: "https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=120&h=160&fit=crop",
        online: true,
        new: false,
        bookable: true
      },
      {
        id: 20,
        name: "星颜",
        gender: "女",
        age: 20,
        weight: 44,
        height: 158,
        distance: 2,
        tags: ["星眸善睐", "俏皮可爱", "古风摄影", "甜美系"],
        rate: 33,
        avatar: "https://images.pexels.com/photos/1845331/pexels-photo-1845331.jpeg?auto=compress&cs=tinysrgb&w=120&h=160&fit=crop",
        online: true,
        new: true,
        bookable: true
      },
      {
        id: 21,
        name: "逸尘",
        gender: "男",
        age: 27,
        weight: 75,
        height: 185,
        distance: 3.2,
        tags: ["超凡脱俗", "古典音律", "禅意生活", "品质男神"],
        rate: 46,
        avatar: "https://images.pexels.com/photos/1124724/pexels-photo-1124724.jpeg?auto=compress&cs=tinysrgb&w=120&h=160&fit=crop",
        online: true,
        new: false,
        bookable: true
      },
      {
        id: 22,
        name: "落雪",
        gender: "女",
        age: 23,
        weight: 47,
        height: 167,
        distance: 1.8,
        tags: ["雪花飞舞", "冰清玉洁", "古典舞蹈", "传统文化"],
        rate: 41,
        avatar: "https://images.pexels.com/photos/1821095/pexels-photo-1821095.jpeg?auto=compress&cs=tinysrgb&w=120&h=160&fit=crop",
        online: false,
        new: true,
        bookable: true
      },
      {
        id: 23,
        name: "云深",
        gender: "男",
        age: 24,
        weight: 70,
        height: 180,
        distance: 4.5,
        tags: ["云深不知处", "谦谦君子", "传统武术", "户外达人"],
        rate: 38,
        avatar: "https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg?auto=compress&cs=tinysrgb&w=120&h=160&fit=crop",
        online: true,
        new: false,
        bookable: true
      },
      {
        id: 24,
        name: "梨花",
        gender: "女",
        age: 19,
        weight: 43,
        height: 159,
        distance: 2.7,
        tags: ["梨花带雨", "娇俏可人", "古典制茶", "手工艺人"],
        rate: 44,
        avatar: "https://images.pexels.com/photos/1382734/pexels-photo-1382734.jpeg?auto=compress&cs=tinysrgb&w=120&h=160&fit=crop",
        online: true,
        new: true,
        bookable: true
      },
      {
        id: 25,
        name: "明轩",
        gender: "男",
        age: 30,
        weight: 78,
        height: 186,
        distance: 6.1,
        tags: ["明德惟馨", "成熟稳重", "传统建筑", "文化传承"],
        rate: 48,
        avatar: "https://images.pexels.com/photos/1484794/pexels-photo-1484794.jpeg?auto=compress&cs=tinysrgb&w=120&h=160&fit=crop",
        online: false,
        new: false,
        bookable: true
      },
      {
        id: 26,
        name: "如意",
        gender: "女",
        age: 22,
        weight: 46,
        height: 164,
        distance: 3.3,
        tags: ["称心如意", "舞蹈精灵", "古典芭蕾", "柔美动人"],
        rate: 39,
        avatar: "https://images.pexels.com/photos/1559486/pexels-photo-1559486.jpeg?auto=compress&cs=tinysrgb&w=120&h=160&fit=crop",
        online: true,
        new: false,
        bookable: true
      },
      {
        id: 27,
        name: "瑾瑜",
        gender: "男",
        age: 26,
        weight: 73,
        height: 184,
        distance: 2.9,
        tags: ["怀瑾握瑜", "技术达人", "传统工艺", "现代结合"],
        rate: 36,
        avatar: "https://images.pexels.com/photos/1040882/pexels-photo-1040882.jpeg?auto=compress&cs=tinysrgb&w=120&h=160&fit=crop",
        online: true,
        new: false,
        bookable: true
      },
      {
        id: 28,
        name: "清泉",
        gender: "女",
        age: 21,
        weight: 45,
        height: 161,
        distance: 2.4,
        tags: ["清泉石上", "纯净美好", "游泳健将", "自然系女孩"],
        rate: 34,
        avatar: "https://images.pexels.com/photos/1239288/pexels-photo-1239288.jpeg?auto=compress&cs=tinysrgb&w=120&h=160&fit=crop",
        online: false,
        new: true,
        bookable: true
      },
      {
        id: 29,
        name: "慕容",
        gender: "男",
        age: 29,
        weight: 74,
        height: 183,
        distance: 5.5,
        tags: ["慕容世家", "心理导师", "温暖治愈", "善解人意"],
        rate: 47,
        avatar: "https://images.pexels.com/photos/1758144/pexels-photo-1758144.jpeg?auto=compress&cs=tinysrgb&w=120&h=160&fit=crop",
        online: true,
        new: false,
        bookable: true
      },
      {
        id: 30,
        name: "蝶舞",
        gender: "女",
        age: 24,
        weight: 48,
        height: 166,
        distance: 1.5,
        tags: ["蝶舞翩翩", "艺术创作", "手绘插画", "文艺女神"],
        rate: 45,
        avatar: "https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=120&h=160&fit=crop",
        online: true,
        new: true,
        bookable: true
      },
      {
        id: 31,
        name: "沐风",
        gender: "男",
        age: 25,
        weight: 71,
        height: 181,
        distance: 2.1,
        tags: ["沐风而行", "户外达人", "摄影师", "阳光暖男"],
        rate: 41,
        avatar: "https://images.pexels.com/photos/1542085/pexels-photo-1542085.jpeg?auto=compress&cs=tinysrgb&w=120&h=160&fit=crop",
        online: true,
        new: false,
        bookable: true
      },
      {
        id: 32,
        name: "听雨",
        gender: "女",
        age: 23,
        weight: 47,
        height: 165,
        distance: 3.6,
        tags: ["听雨观花", "文学爱好", "茶道师", "温柔如水"],
        rate: 43,
        avatar: "https://images.pexels.com/photos/1674752/pexels-photo-1674752.jpeg?auto=compress&cs=tinysrgb&w=120&h=160&fit=crop",
        online: false,
        new: true,
        bookable: true
      },
      {
        id: 33,
        name: "星河",
        gender: "男",
        age: 27,
        weight: 73,
        height: 184,
        distance: 4.8,
        tags: ["星河璀璨", "天文爱好", "科技达人", "理性思维"],
        rate: 39,
        avatar: "https://images.pexels.com/photos/1239288/pexels-photo-1239288.jpeg?auto=compress&cs=tinysrgb&w=120&h=160&fit=crop",
        online: true,
        new: false,
        bookable: true
      },
      {
        id: 34,
        name: "晚晴",
        gender: "女",
        age: 22,
        weight: 46,
        height: 163,
        distance: 1.9,
        tags: ["晚晴初现", "瑜伽导师", "健康生活", "内心平静"],
        rate: 44,
        avatar: "https://images.pexels.com/photos/1758144/pexels-photo-1758144.jpeg?auto=compress&cs=tinysrgb&w=120&h=160&fit=crop",
        online: true,
        new: true,
        bookable: true
      },
      {
        id: 35,
        name: "青山",
        gender: "男",
        age: 28,
        weight: 76,
        height: 186,
        distance: 5.7,
        tags: ["青山如黛", "登山爱好", "健身教练", "积极向上"],
        rate: 46,
        avatar: "https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=120&h=160&fit=crop",
        online: false,
        new: false,
        bookable: true
      },
      {
        id: 36,
        name: "柔情",
        gender: "女",
        age: 21,
        weight: 45,
        height: 160,
        distance: 2.7,
        tags: ["柔情似水", "甜美系", "烘焙达人", "温暖治愈"],
        rate: 42,
        avatar: "https://images.pexels.com/photos/1391498/pexels-photo-1391498.jpeg?auto=compress&cs=tinysrgb&w=120&h=160&fit=crop",
        online: true,
        new: true,
        bookable: true
      },
      {
        id: 37,
        name: "墨染",
        gender: "男",
        age: 26,
        weight: 72,
        height: 182,
        distance: 3.4,
        tags: ["墨染青花", "书法家", "传统文化", "艺术气质"],
        rate: 40,
        avatar: "https://images.pexels.com/photos/1484794/pexels-photo-1484794.jpeg?auto=compress&cs=tinysrgb&w=120&h=160&fit=crop",
        online: true,
        new: false,
        bookable: true
      },
      {
        id: 38,
        name: "采薇",
        gender: "女",
        age: 24,
        weight: 48,
        height: 167,
        distance: 4.2,
        tags: ["采薇山间", "自然系", "植物学家", "生活美学"],
        rate: 37,
        avatar: "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=120&h=160&fit=crop",
        online: false,
        new: false,
        bookable: true
      },
      {
        id: 39,
        name: "风华",
        gender: "男",
        age: 29,
        weight: 74,
        height: 185,
        distance: 6.3,
        tags: ["风华正茂", "商业精英", "成熟稳重", "品味非凡"],
        rate: 48,
        avatar: "https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg?auto=compress&cs=tinysrgb&w=120&h=160&fit=crop",
        online: true,
        new: false,
        bookable: true
      },
      {
        id: 40,
        name: "初见",
        gender: "女",
        age: 20,
        weight: 44,
        height: 159,
        distance: 1.6,
        tags: ["初见倾心", "学生气质", "可爱萝莉", "青春活力"],
        rate: 35,
        avatar: "https://images.pexels.com/photos/1858175/pexels-photo-1858175.jpeg?auto=compress&cs=tinysrgb&w=120&h=160&fit=crop",
        online: true,
        new: true,
        bookable: true
      }
    ]);
    common_vendor.computed(function() {
      return partnersList.value.map(function(partner) {
        const visibleTags = partner.tags.slice(0, 3);
        const extraTags = partner.tags.length > 3 ? partner.tags.length - 3 : 0;
        return {
          ...partner,
          visibleTags,
          extraTags
        };
      });
    });
    const getModalTitle = common_vendor.computed(function() {
      const titles = {
        gender: "选择性别",
        distance: "选择距离",
        sort: "排序方式"
      };
      return titles[activeModal.value] || "";
    });
    const getFilterOptions = common_vendor.computed(function() {
      const options = {
        gender: [
          { value: "all", label: "不限" },
          { value: "female", label: "女生", icon: "/static/icons/friend/female.png" },
          { value: "male", label: "男生", icon: "/static/icons/friend/male.png" }
        ],
        distance: [
          { value: "all", label: "不限距离" },
          { value: "1km", label: "1公里以内" },
          { value: "3km", label: "3公里以内" },
          { value: "5km", label: "5公里以内" },
          { value: "10km", label: "10公里以内" }
        ],
        sort: [
          { value: "recommend", label: "推荐排序", icon: "/static/icons/friend/thumbs-up.png" },
          { value: "distance", label: "距离最近", icon: "/static/icons/friend/location.png" },
          { value: "rating", label: "评分最高", icon: "/static/icons/friend/star.png" },
          { value: "new", label: "最新加入", icon: "/static/icons/friend/bolt.png" }
        ]
      };
      return options[activeModal.value] || [];
    });
    const isOptionSelected = (value) => {
      const filters = {
        gender: genderFilter,
        distance: distanceFilter,
        sort: sortFilter
      };
      return filters[activeModal.value].value === value;
    };
    const selectOption = (value) => {
      const filters = {
        gender: genderFilter,
        distance: distanceFilter,
        sort: sortFilter
      };
      filters[activeModal.value].value = value;
    };
    const openFilterModal = (modalType) => {
      activeModal.value = modalType;
    };
    const closeModal = () => {
      activeModal.value = "";
    };
    const resetFilter = () => {
      const filters = {
        gender: genderFilter,
        distance: distanceFilter,
        sort: sortFilter
      };
      filters[activeModal.value].value = "all";
    };
    const applyFilter = () => {
      common_vendor.index.__f__("log", "at pages/tabbar/friends/index.vue:860", "应用筛选:", {
        gender: genderFilter.value,
        distance: distanceFilter.value,
        sort: sortFilter.value
      });
      closeModal();
    };
    const navigateToBooking = (partnerId) => {
      const partner = partnersList.value.find((p) => p.id === partnerId);
      if (partner) {
        common_vendor.index.navigateTo({
          url: `/pages/booking/index?id=${partnerId}&name=${partner.name}&avatar=${partner.avatar}`
        });
      }
    };
    const navigateToDetail = (partnerId) => {
      common_vendor.index.navigateTo({
        url: `/pages/partner/detail?id=${partnerId}`
      });
    };
    const loadMore = () => {
      common_vendor.index.__f__("log", "at pages/tabbar/friends/index.vue:904", "加载更多数据");
    };
    const onRefresh = () => {
      isRefreshing.value = true;
      setTimeout(() => {
        isRefreshing.value = false;
      }, 1e3);
    };
    common_vendor.onMounted(() => {
      const systemInfo = common_vendor.index.getSystemInfoSync();
      statusBarHeight.value = systemInfo.statusBarHeight;
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_assets._imports_0,
        b: common_vendor.t(city.value),
        c: common_assets._imports_1,
        d: common_vendor.o(($event) => _ctx.showCityPicker = true),
        e: common_assets._imports_0$1,
        f: search.value,
        g: common_vendor.o(($event) => search.value = $event.detail.value),
        h: common_vendor.f(partnerTabs, (tab, k0, i0) => {
          return {
            a: common_vendor.t(tab.name),
            b: tab.id,
            c: common_vendor.n({
              active: activeTab.value === tab.id
            }),
            d: common_vendor.o(($event) => activeTab.value = tab.id, tab.id)
          };
        }),
        i: common_assets._imports_1,
        j: common_vendor.o(($event) => openFilterModal("gender")),
        k: common_assets._imports_1,
        l: common_vendor.o(($event) => openFilterModal("distance")),
        m: common_assets._imports_1,
        n: common_vendor.o(($event) => openFilterModal("sort")),
        o: statusBarHeight.value + "px",
        p: common_vendor.f(partnersList.value, (p, k0, i0) => {
          return common_vendor.e({
            a: p.avatar,
            b: p.online
          }, p.online ? {} : {}, {
            c: p.new
          }, p.new ? {} : {}, {
            d: common_vendor.t(p.name),
            e: p.gender === "女"
          }, p.gender === "女" ? {
            f: common_assets._imports_3
          } : {
            g: common_assets._imports_4
          }, {
            h: common_vendor.t(p.rate),
            i: common_vendor.t(p.age),
            j: common_vendor.t(p.height),
            k: common_vendor.t(p.distance),
            l: common_vendor.f(p.visibleTags, (tag, index, i1) => {
              return {
                a: common_vendor.t(tag),
                b: index
              };
            }),
            m: p.extraTags > 0
          }, p.extraTags > 0 ? {
            n: common_vendor.t(p.extraTags)
          } : {}, {
            o: common_vendor.o(($event) => navigateToBooking(p.id), p.id),
            p: p.id,
            q: common_vendor.o(($event) => navigateToDetail(p.id), p.id)
          });
        }),
        q: common_assets._imports_5$1,
        r: common_assets._imports_5$2,
        s: common_vendor.o(loadMore),
        t: isRefreshing.value,
        v: common_vendor.o(onRefresh),
        w: activeModal.value
      }, activeModal.value ? {
        x: common_vendor.t(getModalTitle.value),
        y: common_assets._imports_6,
        z: common_vendor.o(closeModal),
        A: common_vendor.f(getFilterOptions.value, (option, k0, i0) => {
          return common_vendor.e({
            a: option.icon
          }, option.icon ? {
            b: option.icon
          } : {}, {
            c: common_vendor.t(option.label),
            d: isOptionSelected(option.value)
          }, isOptionSelected(option.value) ? {
            e: common_assets._imports_8
          } : {}, {
            f: option.value,
            g: common_vendor.n({
              selected: isOptionSelected(option.value)
            }),
            h: common_vendor.o(($event) => selectOption(option.value), option.value)
          });
        }),
        B: common_vendor.o(resetFilter),
        C: common_vendor.o(applyFilter),
        D: common_vendor.o(() => {
        }),
        E: common_vendor.o(closeModal)
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-5e09aaad"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/tabbar/friends/index.js.map
