import http from '../../public/js/http.js';
import api from '../../public/js/api.js';
import ROLE from '../../public/js/role.js';

let app = getApp();

Page({
  data: {
    // 管理员角色常量
    ...ROLE,
    // 备注的开关
    addToggle: false,
    // 用户角色
    role: '',
    // 列表数据
    list: [],
    // 数据是否加载完毕
    isLoaded: false
  },
  // 显示/隐藏新增备注框
  switchAddRemark: function () {
    wx.showShareMenu();

    // 更新数据
    this.setData({
      addToggle: !this.data.addToggle
    })
  },
  // 获取列表数据
  getData(){
    wx.showLoading();

    http.request({
      url: api.order_wait,
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
    // 获取用户的信息
    app.getUserInfo().then((res) => {
      this.setData({
        role: res.role
      });
    });
  }
})

