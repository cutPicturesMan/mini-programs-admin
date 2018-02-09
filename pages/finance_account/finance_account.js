import http from '../../public/js/http.js';
import api from '../../public/js/api.js';

Page({
  data: {
    // 账期状态，0为获取全部账期，1为获取未结算账期
    type: 0,
    // 账期列表
    list: [],
    // 数据是否加载完毕
    isLoaded: false
  },
  // 发送模板消息
  sendTemplateMsg(e) {
    http.request({
      url: `${api.template_msg}`,
      method: 'POST',
      data: {
          formIds: e.detail.formId
      }
    }).then((res) => {
      console.log(res);
    })
  },
  // 获取列表数据
  getData () {
    let { type } = this.data;
    wx.showLoading();

    http.request({
      url: api.finance_collect,
      type
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
  onLoad (params) {
    let type = params.type ? params.type : 0;

    this.setData({
      type
    });

    this.getData();
  }
})
