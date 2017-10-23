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
    // 客户列表
    list: [],
    // 数据是否加载完毕
    isLoaded: false,
  },
  getData () {
    wx.showLoading();
    http.request({
      url: api.customer
    }).then((res) => {
      wx.hideLoading();

      if (res.errorCode === 200) {
        // 为每一行数据添加提示状态
        res.data.forEach((item)=>{
          // 正在通过中
          item.isPassing = false;
          // 正在拒绝中
          item.isRejecting = false;
          // 正在解除关系
          item.isRemoving = false;
        });

        this.setData({
          isLoaded: true,
          list: res.data
        });
      }
    })
  },
  // 通过、拒绝客户
  judge (e) {
    let list = this.data.list;
    let { pass, id, index } = e.currentTarget.dataset;

    // 如果正在发送数据，则返回
    if(list[index].isPassing || list[index].isRejecting){
      wx.showToast({
        title: '数据提交中，请稍后...',
        image: '../../icons/close-circled.png'
      })
      return ;
    }

    // 根据通过、拒绝进行按钮禁用
    if(pass === 1){
      list[index].isPassing = true;
    }else{
      list[index].isRejecting = true;
    }

    this.setData({
      list: list
    });

    wx.showLoading();
    http.request({
      url: `${api.customer}${id}`,
      method: 'PUT',
      data: {
        pass
      }
    }).then((res) => {
      wx.hideLoading();

      if (res.errorCode === 200) {
        wx.showToast({
          title: res.moreInfo
        });
        setTimeout(() => {
          this.getData();
        }, 1500);
      }
    })
  },
  // 解除提示确认框
  confirmRemove(e){
    wx.showModal({
      title: '提示',
      content: '确定要解除客户关系吗？',
      success: (res) => {
        if (res.confirm) {
          this.remove(e);
        } else if (res.cancel) {

        }
      }
    })
  },
  // 解除关系
  remove(e){
    let list = this.data.list;
    let { id, index } = e.currentTarget.dataset;

    // 如果正在发送数据，则返回
    if(list[index].isRemoving){
      wx.showToast({
        title: '数据提交中，请稍后...',
        image: '../../icons/close-circled.png'
      })
      return ;
    }

    // 进行按钮禁用
    list[index].isRemoving = true;

    this.setData({
      list: list
    });

    wx.showLoading();
    http.request({
      url: `${api.customer_remove}${id}`,
      method: 'DELETE'
    }).then((res) => {
      wx.hideLoading();

      if (res.errorCode === 200) {
        wx.showToast({
          title: res.moreInfo
        });
        setTimeout(() => {
          this.getData();
        }, 1500);
      }
    })
  },
  // 代下单
  replaceOrder (e) {
    let { id } = e.currentTarget.dataset;

    wx.showModal({
      title: '提示',
      content: '确定要替这位客户下单吗？',
      success: (res) => {
        if (res.confirm) {
          wx.navigateToMiniProgram({
            appId: 'wx2e4d4fbd70affcb6',
            path: `pages/index/index?customerId=${id}&adminId=${app.userInfo.id}`,
            envVersion: 'develop'
          })
        }
      }
    })
  },
  onLoad () {
    // 获取用户的信息
    app.getUserInfo()
      .then((res) => {
        // 如果用户审核通过(1)，则进入系统
        if (res.status.id == 1) {
          let roleObj = {};
          res.roles.forEach((item)=>{
            roleObj[item.name] = true;
          });

          this.setData({
            roleObj
          });

          this.getData();
        } else if (res.status.id == 2) {
          // 如果正在审核中(2)、则页面显示正在审核，不进入系统
        } else if (res.status.id == -1 || res.status.id == 0){
          // 如果用户未审核(-1)、审核拒绝(0)，则提示扫码注册
          wx.showModal({
            title: '提示',
            content: '对不起，您还未注册，请扫码注册'
          })
        }

        // 不论status.id为什么状态，都要设置当前页面的用户信息
        this.setData({
          userInfo: res,
          roleCode: app.roleCode
        });
      }, () => {});
  }
})
