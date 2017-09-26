import http from '../../public/js/http.js';
import api from '../../public/js/api.js';
import ROLE from '../../public/js/role.js';
import utils from '../../public/js/utils.js';

let app = getApp();

Page({
  data: {
    // 管理员角色常量
    ...ROLE,
    // 用户角色
    role: '',
    // 列表数据
    list: [],
    // 数据是否加载完毕
    isLoaded: false
  },
  // 获取列表数据
  getData () {
    wx.showLoading();

    http.request({
      url: api.order,
    }).then((res) => {
      wx.hideLoading();

      if (res.errorCode === 200) {
        res.data.forEach((item) => {
          item.isCanceling = false;
          item.isConfirming = false;
          // 后台没有返回备注，在此模拟一个备注接口
          // 总价
          item.totalPrice = item.offerTotal;
          item.date = utils.formatDate(new Date(item.updatedAt), 'YYYY/MM/DD HH:mm:ss');
        });

        this.setData({
          list: res.data,
          isLoaded: true
        });
      }
    })
  },
  onLoad () {
    this.getData();
    // 获取用户的信息
    app.getUserInfo().then((res) => {
      this.setData({
        role: res.role
      });
    });
  }
})

