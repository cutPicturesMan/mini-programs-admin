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
    // 当前选中的订单序号
    idx: 0,
    // 备注框文字
    remark: '',
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
          item.remark = '客户不想买了';
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
  // 显示/隐藏新增备注框
  switchRemark: function () {
    let { idx, remark, list, addToggle } = this.data;
    let obj = {};

    // 如果是显示弹窗，则将订单的备注值赋值给全局的备注值
    if (!addToggle) {
      obj.remark = list[idx].remark;
    }

    // 更新数据
    this.setData({
      ...obj,
      addToggle: !this.data.addToggle
    })
  },
  // 输入总价
  inputTotalPrice (e) {
    let index = e.currentTarget.dataset.index;
    let { list } = this.data;

    list[index].totalPrice = e.detail.value;

    this.setData({
      list
    });
  },
  // 输入备注框
  inputRemark (e) {
    let { idx, remark, list } = this.data;

    this.setData({
      remark: e.detail.value
    });
  },
  // 确定备注框
  confirmRemark () {
    let { idx, remark, list } = this.data;
    list[idx].remark = remark;

    this.setData({
      list: list
    });

    this.switchRemark();
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
        setTimeout(() => {
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
  // 提交
  confirmOrder(e){
    let { index, id } = e.currentTarget.dataset;
    let { totalPrice } = this.data;

    try {
      // 如果价格未填写
      if (!totalPrice) {
        throw new Error('请填写商品总价');
      }
    } catch (e) {
      return wx.showToast({
        title: e.message,
        image: '../../icons/close-circled.png',
        duration: 4000
      })
    }

    this.setData({
      isSubmit: true
    });

    wx.showLoading();
    http.request({
      url: `${api.salesman_put_order}${id}`,
      method: 'POST',
      data: {
        price: totalPrice
      }
    }).then((res) => {
      wx.hideLoading();

      // 提交成功
      if (res.errorCode === 200) {
        wx.showToast({
          title: res.moreInfo
        })
      } else {
        // 提交失败，则提示
        wx.showToast({
          title: res.moreInfo,
          image: '../../icons/close-circled.png'
        })

        setTimeout(() => {
          this.setData({
            isSubmit: false
          });
        }, 1500)
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

