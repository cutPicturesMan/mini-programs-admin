import http from '../../public/js/http.js';
import api from '../../public/js/api.js';
import ROLE from '../../public/js/role.js';
import utils from '../../public/js/utils.js';

let app = getApp();

Page({
  data: {
    // 管理员角色常量
    ...ROLE,
    // 备注的开关
    addToggle: false,
    // 用户角色
    role: '',
    // 备注框文字
    remark: '',
    // 订单数据
    item: {},
    // 数据是否加载完毕
    isLoaded: false
  },
  // 显示/隐藏新增备注框
  switchRemark: function () {
    wx.showShareMenu();

    // 更新数据
    this.setData({
      addToggle: !this.data.addToggle
    })
  },
  // 确定备注框

  // 获取列表数据
  getData (id) {
    wx.showLoading();

    http.request({
      url: `${api.order}${id}`,
    }).then((res) => {
      wx.hideLoading();

      res.data.date = utils.formatDate(new Date(res.data.updatedAt), 'YYYY/MM/DD HH:mm:ss');

      if (res.errorCode === 200) {
        this.setData({
          item: res.data,
          isLoaded: true
        });
      }
    })
  },
  // 取消订单模态框
  cancelOrderPopup (e) {
    let id = e.currentTarget.dataset.id;

    wx.showModal({
      title: '提示',
      content: '确定要取消订单吗？',
      success: (res) => {
        if (res.confirm) {
          this.cancelOrder(id);
        }
      }
    })
  },
  // 取消订单
  cancelOrder (id) {
    wx.showLoading();

    http.request({
      url: `${api.order}${id}`,
      method: 'DELETE'
    }).then((res) => {
      wx.hideLoading();

      if (res.errorCode === 200) {
        wx.showToast({
          title: res.moreInfo
        });
        setTimeout(()=>{
          this.getData();
        }, 1500)
      } else {
        wx.showToast({
          title: res.moreInfo || '删除失败',
          image: '../../icons/close-circled.png'
        });
      }
    })
  },
  onLoad (params) {
    // 如果订单id存在，则请求数据
    if(params.id){
      this.getData(params.id);
      // 获取用户的信息
      app.getUserInfo().then((res) => {
        this.setData({
          role: res.role
        });
      });
    }else{
      wx.showToast({
        title: '订单id不存在',
        image: '../../icons/close-circled.png'
      });
    }
  }
})
