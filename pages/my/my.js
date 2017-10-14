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
    app.getUserInfo()
      .then((res) => {
        // 如果用户审核通过(1)，则进入系统
        if (res.status.id == 1) {
          this.setData({
            isLoaded: true,
            info: res
          });
        } else if (res.status.id == 2) {
          // 如果正在审核中(2)、则页面显示正在审核，不进入系统
        } else if (res.status.id == -1 || res.status.id == 0){
          // 如果用户未审核(-1)、审核拒绝(0)，则提示跳到信息申请页
          wx.showModal({
            title: '提示',
            content: '对不起，您还未注册，请先注册',
            success: (res) => {
              if (res.confirm) {
                wx.navigateTo({
                  url: '/pages/registry/registry'
                });
              }
            }
          })
        }

        this.setData({
          role: res
        });
      }, () => {
        // 请求失败
        wx.showModal({
          title: '提示',
          content: '数据请求失败，请重新进入小程序'
        })
      });
  }
})
