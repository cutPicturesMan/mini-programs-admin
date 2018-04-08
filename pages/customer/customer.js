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
  // 输入姓名
  bindNameInput (e) {
    let index = e.currentTarget.dataset.index;

    this.setData({
      [`list[${index}].name`]: e.detail.value
    })
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
          // 修改前用户的名称
          item.originName = item.name;
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
    let item = list[index];

    try {
      // 如果正在发送数据，则返回
      if(item.isPassing || item.isRejecting){
        throw new Error('数据提交中，请稍后...');
      }

      // 如果没有输入姓名，则提示
      if(!item.name){
        throw new Error('请输入姓名');
      }
    } catch (e) {
      return wx.showToast({
        title: e.message,
        image: '../../icons/close-circled.png',
        duration: 4000
      })
    }

    // 根据通过、拒绝进行按钮禁用
    if(pass === 1){
      item.isPassing = true;
    }else{
      item.isRejecting = true;
    }

    this.setData({
      list
    });

    let data = {
      pass
    };

    // 如果修改了姓名，则发送姓名字段
    if(item.name != item.originName){
      data.name = item.name;
    }

    wx.showLoading();
    http.request({
      url: `${api.customer}${id}`,
      method: 'PUT',
      data,
    }).then((res) => {
      wx.hideLoading();

      if (res.errorCode === 200) {
        wx.showToast({
          title: res.moreInfo
        });

        setTimeout(() => {
          this.getData();
        }, 1500);
      } else {
        if(res.errorCode == 13001){
          res.moreInfo = '该姓名已被占用';
        }

        // 根据通过、拒绝进行按钮禁用
        if(pass === 1){
          item.isPassing = false;
        }else{
          item.isRejecting = false;
        }

        wx.showToast({
          title: res.moreInfo,
          image: '../../icons/close-circled.png'
        })

        this.setData({
          list
        })
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
