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
  onShow () {
    // 获取用户的信息
    app.getUserInfo()
      .then((res) => {
        // 如果用户审核通过(1)，则进入系统
        if (res.status.id == 1) {
          this.getData();
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

        this.setData({
          role: res
        });
      }, () => {
        // 请求失败
        wx.showModal({
          title: '提示',
          content: '数据请求失败，请重新进入小程序'
        })
      });
  }
})

