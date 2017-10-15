import http from '../../public/js/http.js';
import api from '../../public/js/api.js';
import { ROLE_LIST } from '../../public/js/role.js';

let app = getApp();

Page({
  data: {
    // 用户信息
    userInfo: {},
    // 用户当前角色代码
    roleCode: '',
    // 管理员角色列表
    ...ROLE_LIST,
    // 新增客户的开关
    addCustomerToggle: false,
  },
  // 添加客户
  addCustomer () {
    this.setData({
      addCustomerToggle: !this.data.addCustomerToggle
    });

    http.request({
      url: api.site_twocode,
      data: {
        scene: 'adminId=2',
        width: 430,
        auto_color: false,
        r: '0',
        g: '0',
        b: '0'
      },
      success: function (res) {
        console.log(res.data);

      }
    })
  },
  // 显示页面
  onShow () {
    // 获取用户的信息
    app.getUserInfo()
      .then((res) => {
        // 如果用户审核通过(1)，则进入系统
        if (res.status.id == 1) {
          this.setData({
            userInfo: res,
            roleCode: app.roleCode
          });
        } else if (res.status.id == 2) {
          // 如果正在审核中(2)、则页面显示正在审核，不进入系统
        } else if (res.status.id == -1 || res.status.id == 0){
          // 如果用户未审核(-1)、审核拒绝(0)，则提示跳到信息申请页
          wx.showModal({
            title: '提示',
            content: '对不起，您还未注册，请先注册',
            success: (res) => {
              if (res.confirm) {
                wx.navigateTo({
                  url: '/pages/registry/registry'
                });
              }
            }
          })
        }
      }, () => {
        // 请求失败
        wx.showModal({
          title: '提示',
          content: '数据请求失败，请重新进入小程序'
        })
      });
  }
})
