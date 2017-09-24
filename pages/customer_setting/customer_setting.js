import http from '../../public/js/http.js';
import api from '../../public/js/api.js';

Page({
  data: {
    avatar:'',
    nick:'',
    data:0,
    name:'',
    scale: 0,
    // 数据是否加载完毕
    isLoaded: false,
    // 还款方式，默认第一种
    repaymentType: 0,
  },
  // 选择还款方式
  selectRepayment (e) {
    let { type } = e.currentTarget.dataset;
    console.log(type);
    this.setData({
      repaymentType: type
    });
  },
  getData(id){
    wx.showLoading();

    http.request({
      url: `${api.customer}${id}`,
    }).then((res) => {
      wx.hideLoading();

      if (res.errorCode === 200) {
        this.setData({
          isLoaded: true,
          avatar: res.data.avatar,
          nick: res.data.nick,
          data: res.data.data,
          name: res.data.name,
          scale: res.data.scale
        });
      }
    })
  },
  onLoad (params) {
    this.getData(params.id);
  }
})
