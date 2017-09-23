Page({
  data: {
    // 备注的开关
    addToggle: false,
  },
  // 显示/隐藏新增备注框
  switchAddRemark: function () {
    wx.showShareMenu()

    // 更新数据
    this.setData({
      addToggle: !this.data.addToggle
    })
  },
  onLoad: function () {
  }
})
