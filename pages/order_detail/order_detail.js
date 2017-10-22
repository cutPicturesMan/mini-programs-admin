import http from '../../public/js/http.js';
import api from '../../public/js/api.js';
import { ROLE_LIST } from '../../public/js/role.js';
import STATUS from '../../public/js/status.js';
import utils from '../../public/js/utils.js';

let app = getApp();
let beginDateMillion = new Date().getTime();

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
    order: {},
    // 物流方式列表
    logisticList: [],
    // 选中的物流方式
    logisticIndex: '',
    // 交货最早时间
    beginDate: utils.formatDate(new Date(beginDateMillion), 'YYYY-MM-DD'),
    // 交货日期
    deliveryDate: '',
    // 数据是否加载完毕
    isLoaded: false,
    // 物流方式是否加载完毕
    isLogisticed: false,
    // 是否正在通过提交中
    isCanceling: false,
    // 是否正在拒绝提交中
    isConfirming: false,
  },
  // 获取列表数据
  getData (id) {
    let { PENDING_SALEMAN, EXAMINE_MANAGER } = this.data;

    wx.showLoading();

    http.request({
      url: `${api.order}${id}`,
    }).then((res) => {
      wx.hideLoading();

      let order = res.data;
      order.date = utils.formatDate(new Date(order.updatedAt), 'YYYY-MM-DD HH:mm:ss');
      let deliveryDate = utils.formatDate(order.deliveryDate ? new Date(order.deliveryDate) : undefined, 'YYYY-MM-DD');

      if (res.errorCode === 200) {
        this.setData({
          deliveryDate,
          totalPrice: order.offerTotal || order.amount,
          order: order,
          isLoaded: true
        });

        // 如果订单状态是业务员审核、经理审核，则需要去请求物流数据
        if (order.status.type == PENDING_SALEMAN || order.status.type == EXAMINE_MANAGER) {
          this.getlogisticList();
        }
      }
    })
  },
  // 显示/隐藏新增备注框
  switchRemark: function () {
    let { remarks, order, addToggle } = this.data;
    let obj = {};

    // 如果是显示弹窗，则将订单的备注值赋值给全局的备注值
    if (!addToggle) {
      obj.remarks = order.remarks;
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
    let { remarks, order } = this.data;
    order.remarks = remarks;

    this.setData({
      order: order
    });

    this.switchRemark();
  },
  // 输入总价
  inputTotalPrice (e) {
    this.setData({
      totalPrice: parseInt(e.detail.value)
    });
  },
  // 输入数量
  inputQuantity (e) {
    let num = e.detail.value;
    let index = e.currentTarget.dataset.index;
    let order = this.data.order;

    order.orderItems[index].quantity = num;

    this.setData({
      order
    });
  },
  // 获取物流方式列表
  getlogisticList () {
    let { order } = this.data;

    http.request({
      url: `${api.logistic_list}${order.id}`
    }).then((res) => {
      if (res.errorCode === 200) {
        let logisticList = res.data;
        let logisticIndex = 0;

        if(order.orderFulFillType){
          logisticList.some((item, index) => {
            if(item.type == order.orderFulFillType.type){
              logisticIndex = index;
              return true;
            } else {
              return false;
            }
          })
        }

        this.setData({
          isLogisticed: true,
          logisticIndex,
          logisticList
        });
      } else {
        // 获取失败，则提示
        wx.showToast({
          title: res.moreInfo,
          image: '../../icons/close-circled.png'
        })
      }
    })
  },
  // 选择物流方式
  bindLogisticChange (e) {
    this.setData({
      logisticIndex: e.detail.value
    })
  },
  // 选择交货日期
  changeDeliveryDate (e) {
    this.setData({
      deliveryDate: e.detail.value
    })
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
  confirmOrder () {
    let { order, totalPrice, remarks, logisticList, logisticIndex, deliveryDate, isLogisticed } = this.data;

    try {
      // 物流列表未加载完毕
      if (!isLogisticed) {
        throw new Error('正在加载配送方式中，请稍后');
      }
      // 如果价格未填写
      if (!totalPrice) {
        throw new Error('请填写商品总价');
      }
      // 如果价格未填写
      if (!totalPrice) {
        throw new Error('请填写商品总价');
      }
      // 无物流
      if (logisticList.length == 0) {
        throw new Error('暂无可选物流方式，无法下单');
      }
      // 未选择交货日期
      if (!deliveryDate) {
        throw new Error('请选择交货日期');
      }
      order.orderItems.forEach((item) => {
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
    order.orderItems.forEach((item, index) => {
      keys.push(`skus[${index}].skuId`, `skus[${index}].num`);
      values.push(item.skuId, item.quantity);
    });

    let skus = {};
    keys.forEach((item, index) => {
      skus[item] = values[index];
    });

    let fulFillType = logisticList[logisticIndex].type;

    wx.showLoading();
    http.request({
      url: `${api.salesman_put_order}${order.id}`,
      method: 'POST',
      data: {
        price: totalPrice,
        ...skus,
        fulFillType,
        deliveryDate,
        remarks
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
        price: this.data.order.offerTotal
      }
    }).then((res) => {
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
  passOrder (e) {
    let { id } = e.currentTarget.dataset;
    let { order, totalPrice, remarks, logisticList, logisticIndex, deliveryDate, isLogisticed } = this.data;

    try {
      // 物流列表未加载完毕
      if (!isLogisticed) {
        throw new Error('正在加载配送方式中，请稍后');
      }
      // 如果价格未填写
      if (!totalPrice) {
        throw new Error('请填写商品总价');
      }
      // 无物流
      if (logisticList.length == 0) {
        throw new Error('暂无可选物流方式，无法下单');
      }
      // 未选择交货日期
      if (!deliveryDate) {
        throw new Error('请选择交货日期');
      }
      order.orderItems.forEach((item) => {
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
    order.orderItems.forEach((item, index) => {
      keys.push(`skus[${index}].skuId`, `skus[${index}].num`);
      values.push(item.skuId, item.quantity);
    });

    let skus = {};
    keys.forEach((item, index) => {
      skus[item] = values[index];
    });

    let fulFillType = logisticList[logisticIndex].type;

    wx.showLoading();
    http.request({
      url: `${api.manage_put_order}${id}`,
      method: 'POST',
      data: {
        adopt: 1,
        price: totalPrice,
        ...skus,
        fulFillType,
        deliveryDate,
        remarks
      }
    }).then((res) => {
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
  financePass (e) {
    let { id } = e.currentTarget.dataset;
    let { order, totalPrice } = this.data;

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
  storePass (e) {
    let { order, totalPrice } = this.data;

    this.setData({
      isSubmit: true
    });

    wx.showLoading();
    http.request({
      url: `${api.warehouse_put_order}${order.id}`,
      method: 'POST'
    }).then((res) => {
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
    } else {
      wx.showToast({
        title: '订单id不存在',
        image: '../../icons/close-circled.png'
      });
    }
  }
})
