import http from '../../public/js/http.js';
import api from '../../public/js/api.js';

Page({
  data: {
    // 数据是否加载完毕
    isLoaded: false,
    // 订单列表
    list: []
  },
  // 获取订单列表
  getData(){
    wx.showLoading();

    http.request({
      url: api.order,
    }).then((res) => {
      wx.hideLoading();

      if (res.errorCode === 200) {
        this.setData({
          isLoaded: true,
          list: res.data
        });
      }
    })
  },
  onLoad () {
    this.getData();
  }
})
