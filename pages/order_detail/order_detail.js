import http from '../../public/js/http.js';
import api from '../../public/js/api.js';
import { ROLE_LIST } from '../../public/js/role.js';
import STATUS from '../../public/js/status.js';
import utils from '../../public/js/utils.js';

let app = getApp();

Page({
  data: {
    // 管理员角色列表
    ...ROLE_LIST,
    // 订单状态常量
    ...STATUS,
    // 备注的开关
    addToggle: false,
    // 用户角色
    role: '',
    // 订单总价
    totalPrice: '',
    // 备注框文字
    remarks: '',
    // 订单数据
    item: {},
    // 数据是否加载完毕
    isLoaded: false,
    // 是否正在通过提交中
    isCanceling: false,
    // 是否正在拒绝提交中
    isConfirming: false,
  },
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
          totalPrice: res.data.offerTotal,
          item: res.data,
          isLoaded: true
        });
      }
    })
  },
  // 显示/隐藏新增备注框
  switchRemark: function () {
    let { remarks, item, addToggle } = this.data;
    let obj = {};

    // 如果是显示弹窗，则将订单的备注值赋值给全局的备注值
    if (!addToggle) {
      obj.remarks = item.remarks;
    }

    // 更新数据
    this.setData({
      ...obj,
      addToggle: !this.data.addToggle
    })
  },
  // 输入备注框
  inputRemark (e) {
    let remarks = this.data.remarks;

    this.setData({
      remarks: e.detail.value
    });
  },
  // 确定备注框
  confirmRemark () {
    let { remarks, item } = this.data;
    item.remarks = remarks;

    this.setData({
      item: item
    });

    this.switchRemark();
  },
  // 输入总价
  inputTotalPrice (e) {
    this.setData({
      totalPrice: e.detail.value
    });
  },
  // 输入数量
  inputQuantity (e) {
    let num = e.detail.value;
    let index = e.currentTarget.dataset.index;
    let item = this.data.item;

    item.orderItems[index].quantity = num;

    this.setData({
      item
    });
  },

  // 业务员取消订单模态框
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
  // 业务员取消订单
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
          // this.getData(id);
          wx.navigateBack({
            delta: 1,
          })
        }, 1500)
      } else {
        wx.showToast({
          title: res.moreInfo || '删除失败',
          image: '../../icons/close-circled.png'
        });
      }
    })
  },
  // 业务员提交
  confirmOrder(){
    let { totalPrice, item } = this.data;

    try {
      // 如果价格未填写
      if (!totalPrice) {
        throw new Error('请填写商品总价');
      }

      item.orderItems.forEach((item)=>{
        if (!item.quantity) {
          throw new Error('请填写商品数量');
        }
      });
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

    // 数据转化格式，然后提交
    let keys = [];
    let values = [];
    item.orderItems.forEach((item, index)=>{
      keys.push(`skus[${index}].skuId`, `skus[${index}].num`);
      values.push(item.skuId, item.quantity);
    });

    let skus = {};
    keys.forEach((item, index)=>{
      skus[item] = values[index];
    });

    wx.showLoading();
    http.request({
      url: `${api.salesman_put_order}${item.id}`,
      method: 'POST',
      data: {
        price: totalPrice,
        ...skus
      }
    }).then((res) => {
      wx.hideLoading();

      // 提交成功，则跳转到待处理页面
      if (res.errorCode === 200) {
        wx.showToast({
          title: res.moreInfo
        })
        setTimeout(() => {
          wx.navigateBack({
            delta: 1
          })
        }, 1500)
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

  // 经理拒绝订单模态框
  rejectOrderPopup (e) {
    let id = e.currentTarget.dataset.id;

    wx.showModal({
      title: '提示',
      content: '确定要拒绝该订单吗？',
      success: (res) => {
        if (res.confirm) {
          this.rejectOrder.call(this, id);
        }
      }
    })
  },
  // 经理拒绝订单
  rejectOrder (id) {
    wx.showLoading();
    http.request({
      url: `${api.manage_put_order}${id}`,
      method: 'POST',
      data: {
        adopt: 0,
        price: this.data.item.offerTotal
      }
    }).then((res) => {
      wx.hideLoading();

      if (res.errorCode === 200) {
        wx.showToast({
          title: res.moreInfo
        });
        setTimeout(() => {
          wx.navigateBack({
            delta: 1
          });
        }, 1500)
      } else {
        wx.showToast({
          title: res.moreInfo || '拒绝失败',
          image: '../../icons/close-circled.png'
        });
      }
    })
  },
  // 经理通过
  passOrder(e){
    let { id } = e.currentTarget.dataset;
    let { item, totalPrice } = this.data;

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

    // 数据转化格式，然后提交
    let keys = [];
    let values = [];
    item.orderItems.forEach((item, index)=>{
      keys.push(`skus[${index}].skuId`, `skus[${index}].num`);
      values.push(item.skuId, item.quantity);
    });

    let skus = {};
    keys.forEach((item, index)=>{
      skus[item] = values[index];
    });

    wx.showLoading();
    http.request({
      url: `${api.manage_put_order}${id}`,
      method: 'POST',
      data: {
        adopt: 1,
        price: totalPrice,
        ...skus
      }
    }).then((res) => {
      wx.hideLoading();

      // 提交成功
      if (res.errorCode === 200) {
        wx.showToast({
          title: res.moreInfo
        })

        setTimeout(() => {
          wx.navigateBack({
            delta: 1
          })
        }, 1500)
      } else {
        // 提交失败，则提示
        wx.showToast({
          title: res.moreInfo,
          image: '../../icons/close-circled.png'
        })
      }
    })
  },

  // 财务拒绝订单模态框
  financeRejectPopup (e) {
    let id = e.currentTarget.dataset.id;

    wx.showModal({
      title: '提示',
      content: '确定要拒绝该订单吗？',
      success: (res) => {
        if (res.confirm) {
          this.financeReject.call(this, id);
        }
      }
    })
  },
  // 财务拒绝订单
  financeReject (id) {
    wx.showLoading();
    http.request({
      url: `${api.finance_put_order}${id}`,
      method: 'POST',
      data: {
        adopt: 0
      }
    }).then((res) => {
      wx.hideLoading();

      if (res.errorCode === 200) {
        wx.showToast({
          title: res.moreInfo
        });
        setTimeout(() => {
          wx.navigateBack({
            delta: 1
          });
        }, 1500)
      } else {
        wx.showToast({
          title: res.moreInfo || '拒绝失败',
          image: '../../icons/close-circled.png'
        });
      }
    })
  },
  // 财务通过
  financePass(e){
    let { id } = e.currentTarget.dataset;
    let { item, totalPrice } = this.data;

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
      url: `${api.finance_put_order}${id}`,
      method: 'POST',
      data: {
        adopt: 1
      }
    }).then((res) => {
      wx.hideLoading();

      // 提交成功
      if (res.errorCode === 200) {
        wx.showToast({
          title: res.moreInfo
        })

        setTimeout(() => {
          wx.navigateBack({
            delta: 1
          })
        }, 1500)
      } else {
        // 提交失败，则提示
        wx.showToast({
          title: res.moreInfo,
          image: '../../icons/close-circled.png'
        })
      }
    })
  },

  // 仓管通过
  storePass(e){
    let { item, totalPrice } = this.data;

    this.setData({
      isSubmit: true
    });

    wx.showLoading();
    http.request({
      url: `${api.warehouse_put_order}${item.id}`,
      method: 'POST'
    }).then((res) => {
      wx.hideLoading();

      // 提交成功
      if (res.errorCode === 200) {
        wx.showToast({
          title: res.moreInfo
        })

        setTimeout(() => {
          wx.switchTab({
            url: `/pages/pending/pending`,
            success: (e) => {
              var page = getCurrentPages().pop();
              if (page == undefined || page == null) return;
              page.onLoad();
            }
          });
        }, 1500)
      } else {
        // 提交失败，则提示
        wx.showToast({
          title: res.moreInfo,
          image: '../../icons/close-circled.png'
        })
      }
    })
  },

  onLoad (params) {
    // 如果订单id存在，则请求数据
    if (params.id) {
      this.getData(params.id);
      // 获取用户的信息
      app.getUserInfo().then((res) => {
        this.setData({
          role: res.role
        });
      });
    } else {
      wx.showToast({
        title: '订单id不存在',
        image: '../../icons/close-circled.png'
      });
    }
  }
})
