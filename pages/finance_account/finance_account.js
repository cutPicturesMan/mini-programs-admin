import http from '../../public/js/http.js';
import api from '../../public/js/api.js';

Page({
  data: {
    // 订单列表
    list: [],
    // 数据是否加载完毕
    isLoaded: false
  },
  // 获取列表数据
  getData () {
    wx.showLoading();

    http.request({
      url: api.finance_uncollect,
    }).then((res) => {
      wx.hideLoading();

      if (res.errorCode === 200) {
        this.setData({
          list: res.data,
          isLoaded: true
        });
      }
    })
  },
  onLoad () {
    this.getData();
  }
})
