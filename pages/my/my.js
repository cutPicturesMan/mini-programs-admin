let app = getApp();

Page({
  data: {
    // 用户信息
    info: {},
    // 是否正在加载数据
    isLoaded: false,
  },
  onLoad: function () {
    // 获取用户的信息
    app.getUserInfo().then((res) => {
      this.setData({
        isLoaded: true,
        info: res
      });
    });
  }
})
