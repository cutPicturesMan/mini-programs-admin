import http from '../../public/js/http.js';
import api from '../../public/js/api.js';

Page({
  data: {

  },
  onLoad: function () {
    // wx.showLoading();
    // http.request({
    //   url: api.customer
    // }).then((res) => {
    //   wx.hideLoading();
    //   let data = res.data;
    //
    //   // 如果返回的数据长度小于请求预期长度，则表示没有下一页了
    //   if (data.length < size) {
    //     isMore = false;
    //   }
    //
    //   this.setData({
    //     isMore: isMore,
    //     isLoadingMore: false,
    //     list: list.concat(data)
    //   });
    // })
    wx.request({
      url: api.customer,
      success: function(res){
        console.log(res);
      }
    });
  }
})
