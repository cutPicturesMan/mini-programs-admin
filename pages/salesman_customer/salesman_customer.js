import http from '../../public/js/http.js';
import api from '../../public/js/api.js';

Page({
  data: {
    list: []
  },
  onLoad: function () {
    wx.showLoading();
    http.request({
      url: api.customer
    }).then((res) => {
      wx.hideLoading();

      if(res.errorCode === 200){
        this.setData({
          list: res.data
        });
      }
    })
  }
})
