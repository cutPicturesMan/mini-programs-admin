import http from '../../public/js/http.js';
import api from '../../public/js/api.js';

Page({
  data: {
    list: []
  },
  getData(){
    wx.showLoading();

    http.request({
      url: api.order,
    }).then((res) => {
      wx.hideLoading();

      if (res.errorCode === 200) {
        // this.setData({
        //
        // });
      }
    })
  },
  onLoad () {
    this.getData();
  }
})
