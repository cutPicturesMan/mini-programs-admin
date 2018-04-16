import http from '../../public/js/http.js';
import api from '../../public/js/api.js';
import { ROLE_LIST } from '../../public/js/role.js';
import STATUS from '../../public/js/status.js';
import utils from '../../public/js/utils.js';
import WXPage from '../Page';

let app = getApp();
let beginDateMillion = new Date().getTime();

new WXPage({
  data: {
    // 管理员角色列表
    ...ROLE_LIST,
    // 订单状态常量
    ...STATUS,
    // 备注的开关
    addToggle: false,
    // 用户角色列表
    userInfo: {},
    // 优惠金额
    offerTotal: 0,
    // 备注框文字
    remarks: '',
    // 订单数据
    order: {},
    // 默认选择的支付方式
    payIndex: '',
    // 支付类型
    payType: [],
    // 物流方式列表
    logisticList: [],
    // 选中的物流方式
    logisticIndex: '',
    // 交货最早时间
    beginDate: utils.formatDate(new Date(beginDateMillion), 'YYYY-MM-DD'),
    // 交货日期
    deliveryDate: '',

    // 物流单号
    logisticNum: '',
    // 司机名称
    driverName: '',
    // 司机手机号
    driverPhone: '',

    // 本订单的用户权限状态，是否在用户角色列表中
    isInRoles: false,
    // 数据是否加载完毕
    isLoaded: false,
    // 支付方式是否加载完毕
    isPayLoaded: false,
    // 物流方式是否加载完毕
    isLogisticed: false,
    // 是否正在通过提交中
    isCanceling: false,
    // 是否正在拒绝提交中
    isConfirming: false,
  },
   // 当前订单的角色，是否在用户的角色列表中
  judgeRole (role) {
    let { userInfo,  PENDING_SALEMAN, EXAMINE_MANAGER, PAID, EXAMINE_ACCOUNTANT, SUBMITTED, EXAMINE_FINANCE  } = this.data;
    let id = 0;

    switch(role){
      case PENDING_SALEMAN: 
        id = 2;
        break;
      case EXAMINE_MANAGER: 
        id = 3;
        break;
      case PAID: 
        id = 4;
        break;
      case EXAMINE_ACCOUNTANT:
        id = 4;
        break;
      case SUBMITTED:
        id = 4;
        break;
      case EXAMINE_FINANCE: 
        id = 5;
        break;
    }

    let result = userInfo.roles.some((item)=>{
      if(item.id == id){
        return true;
      }else{
        return false;
      }
    });

    return result;
  },
  // 获取列表数据
  getData (id) {
    let { PENDING_SALEMAN, EXAMINE_MANAGER, EXAMINE_ACCOUNTANT, SUBMITTED } = this.data;

    wx.showLoading();

    http.request({
      url: `${api.order}${id}`,
    }).then((res) => {
      wx.hideLoading();

      if (res.errorCode === 200 && res.data) {
        let order = res.data;
        order.date = utils.formatDate(new Date(order.updatedAt), 'YYYY-MM-DD HH:mm:ss');
        let deliveryDate = utils.formatDate(order.deliveryDate ? new Date(order.deliveryDate) : undefined, 'YYYY-MM-DD');

        this.setData({
          deliveryDate,
          totalPrice: order.amount,
          order: order,
          isInRoles: this.judgeRole(order.status.type),
          isLoaded: true
        });

        // 如果订单状态是业务员审核、经理审核，则需要去请求物流数据
        if (order.status.type == PENDING_SALEMAN || order.status.type == EXAMINE_MANAGER) {
          this.getlogisticList();
        }

        // 如果订单状态是业务员审核、经理审核、待财务确认、待财务审核，则需要去请求支付方式
        if (order.status.type == PENDING_SALEMAN || order.status.type == EXAMINE_MANAGER || order.status.type === EXAMINE_ACCOUNTANT || order.status.type === SUBMITTED){
          this.getPayType(id).then((payType)=>{
            // 默认的支付方式
            let payIndex = 0;

            // 如果原本的订单已经选择了支付方式，则找出这个方式
            if(order.payments && order.payments.length){
              if(order.payments[0].gatewayType && order.payments[0].gatewayType.type){
                payType.some((item, index)=>{
                  if(item.type == order.payments[0].gatewayType.type){
                    payIndex = index;
                    return true;
                  } else {
                    return false;
                  }
                });
              }
            }

            this.setData({
              isPayLoaded: true,
              payIndex,
              payType
            });
          });
        }
      } else {
        this.toast.error({
          content: '未查到该订单'
        })
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
  /**
   * 输入总价
   * 1、防止
  */
  inputOfferTotal (e) {
    let offerTotal = e.detail.value;

    // 如果输入非数字 || 输入为''
    if(isNaN(offerTotal) || offerTotal === ''){
      offerTotal = '0';
    }

    // '01'、'01.'、'01.01'
    let price = offerTotal.split('.');
    // 如果有小数点，如'01.'、'01.01'，则要在去掉前导0之后加上小数点
    if(price.length == 2){
      offerTotal = parseInt(price[0]) + '.' + price[1];
    } else {
      offerTotal = parseInt(price[0]);
    }

    this.setData({
      offerTotal
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
  // 输入单价
  inputPrice (e) {
    let price = e.detail.value;
    let index = e.currentTarget.dataset.index;
    let order = this.data.order;

    order.orderItems[index].buyprice = price;

    this.setData({
      order
    });
  },
  // 获取所有支付方式
  getPayType (id) {
    let p = new Promise((resolve, reject)=>{
      http.request({
        url: `${api.pay}${id}`
      }).then((res) => {
        if(res.errorCode == 200 && res.data && res.data.length){
          resolve(res.data);
        } else {
          reject();
        }
      }, (err)=>{
        reject();
      });
    });

    return p;
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
        this.toast.error({
          content: res.moreInfo
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
  // 选择支付方式
  bindPayTypeChange (e) {
    this.setData({
      payIndex: e.detail.value
    })
  },
  // 选择交货日期
  changeDeliveryDate (e) {
    this.setData({
      deliveryDate: e.detail.value
    })
  },
  // 输入物流单号
  inputLogisticNum (e) {
      this.setData({
          logisticNum: e.detail.value
      })
  },
  // 输入司机姓名
  inputDriverName (e) {
      this.setData({
          driverName: e.detail.value
      })
  },
  // 输入司机手机号
  inputDriverPhone (e) {
      this.setData({
          driverPhone: e.detail.value
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
  // 业务员退单模态框
  backOrderPopup (e) {
    let { id, type } = e.currentTarget.dataset;

    wx.showModal({
      title: '提示',
      content: `确定要${type == 0 ? '拒绝' : '同意'}退单吗？`,
      success: (res) => {
        if (res.confirm) {
          this.confirmBack(id, type);
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
        this.toast.success({
          content: res.moreInfo
        })
        wx.navigateBack({
          delta: 1,
        })
      } else {
        this.toast.error({
          content: res.moreInfo || '删除失败'
        })
      }
    })
  },
  // 业务员提交
  confirmOrder () {
    let { order, offerTotal, remarks, payIndex, payType, logisticList, logisticIndex, deliveryDate, isPayLoaded, isLogisticed } = this.data;

    try {
      // 支付方式列表未加载完毕
      if (!isPayLoaded) {
        throw new Error('正在加载支付方式中，请稍后');
      }
      // 物流列表未加载完毕
      if (!isLogisticed) {
        throw new Error('正在加载配送方式中，请稍后');
      }
      // 无支付方式
      if (payType.length == 0) {
        throw new Error('暂无可选支付方式，无法下单');
      }
      // 无物流
      if (logisticList.length == 0) {
        throw new Error('暂无可选物流方式，无法下单');
      }
      // 如果价格未填写
      if (offerTotal === '') {
        throw new Error('请填写优惠金额');
      }
      // 未选择交货日期
      if (!deliveryDate) {
        throw new Error('请选择交货日期');
      }
      order.orderItems.forEach((item) => {
        if (item.quantity === '') {
          throw new Error('请填写商品数量');
        }
        if (item.buyprice === '') {
          throw new Error('请填写商品单价');
        }
      });
    } catch (e) {
      return this.toast.error({
        content: e.message,
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
      keys.push(`skus[${index}].skuId`, `skus[${index}].num`, `skus[${index}].price`);
      values.push(item.skuId, item.quantity, item.buyprice);
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
        offerTotal,
        ...skus,
        payType: payType[payIndex].type,
        fulFillType,
        deliveryDate,
        remarks: remarks ? remarks : order.remarks
      }
    }).then((res) => {
      wx.hideLoading();

      // 提交成功，则跳转到待处理页面
      if (res.errorCode === 200) {
        this.toast.success({
          content: res.moreInfo
        })
        setTimeout(() => {
          wx.navigateBack({
            delta: 1
          })
        }, 1500)
      } else {
        // 提交失败，则提示
        this.toast.error({
          content: res.moreInfo
        })

        setTimeout(() => {
          this.setData({
            isSubmit: false
          });
        }, 1500)
      }
    })
  },
  confirmBack (id, type) {
    wx.showLoading();

    http.request({
      url: `${api.order_back}${id}`,
      method: 'PUT',
      data: {
        adopt: type
      }
    }).then((res) => {
      wx.hideLoading();

      if (res.errorCode === 200) {
        this.toast.success({
          content: res.moreInfo
        })
      } else {
        this.toast.error({
          content: res.moreInfo || '退货失败'
        })
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
        adopt: 0
      }
    }).then((res) => {
      if (res.errorCode === 200) {
        this.toast.success({
          content: res.moreInfo
        })
        setTimeout(() => {
          wx.navigateBack({
            delta: 1
          });
        }, 1500)
      } else {
        this.toast.error({
          content: res.moreInfo || '拒绝失败'
        })
      }
    })
  },
  // 经理通过
  passOrder (e) {
    let { id } = e.currentTarget.dataset;
    let { order, offerTotal, remarks, payIndex, payType, logisticList, logisticIndex, deliveryDate, isPayLoaded, isLogisticed } = this.data;

    try {
      // 支付方式列表未加载完毕
      if (!isPayLoaded) {
        throw new Error('正在加载支付方式中，请稍后');
      }
      // 物流列表未加载完毕
      if (!isLogisticed) {
        throw new Error('正在加载配送方式中，请稍后');
      }
      // 无支付方式
      if (payType.length == 0) {
        throw new Error('暂无可选支付方式，无法下单');
      }
      // 无物流方式
      if (logisticList.length == 0) {
        throw new Error('暂无可选物流方式，无法下单');
      }
      // 如果价格未填写
      if (offerTotal === '') {
        throw new Error('请填写优惠金额');
      }
      // 未选择交货日期
      if (!deliveryDate) {
        throw new Error('请选择交货日期');
      }
      order.orderItems.forEach((item) => {
        if (item.quantity === '') {
          throw new Error('请填写商品数量');
        }
        if (item.buyprice === '') {
          throw new Error('请填写商品单价');
        }
      });
    } catch (e) {
      return this.toast.error({
        content: e.message,
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
      keys.push(`skus[${index}].skuId`, `skus[${index}].num`, `skus[${index}].price`);
      values.push(item.skuId, item.quantity, item.buyprice);
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
        offerTotal,
        ...skus,
        payType: payType[payIndex].type,
        fulFillType,
        deliveryDate,
        remarks: remarks ? remarks : order.remarks
      }
    }).then((res) => {
      // 提交成功
      if (res.errorCode === 200) {
        this.toast.success({
          content: res.moreInfo
        })

        setTimeout(() => {
          wx.navigateBack({
            delta: 1
          })
        }, 1500)
      } else {
        // 提交失败，则提示
        this.toast.error({
          content: res.moreInfo
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
        this.toast.success({
          content: res.moreInfo
        })
        setTimeout(() => {
          wx.navigateBack({
            delta: 1
          });
        }, 1500)
      } else {
        this.toast.error({
          content: res.moreInfo || '拒绝失败'
        })
      }
    })
  },
  // 财务通过
  financePass (e) {
    let { id } = e.currentTarget.dataset;
    let { EXAMINE_ACCOUNTANT, SUBMITTED, order, offerTotal, payIndex, payType, isPayLoaded } = this.data;

    try {
      // 待财务审核、待财务确认，要加载支付方式
      if(order.status.type === EXAMINE_ACCOUNTANT || order.status.type === SUBMITTED){
        // 支付方式列表未加载完毕
        if (!isPayLoaded) {
          throw new Error('正在加载支付方式中，请稍后');
        }
        // 无支付方式
        if (payType.length == 0) {
          throw new Error('暂无可选支付方式，无法下单');
        }
      }

      // 待财务确认，需要填写商品单价
      if(order.status.type === SUBMITTED){
        order.orderItems.forEach((item) => {
          if (item.quantity === '') {
            throw new Error('请填写商品数量');
          }
        });
      }

      // 如果价格未填写
      if (offerTotal === '') {
        throw new Error('请填写优惠金额');
      }
    } catch (e) {
      return this.toast.error({
        content: e.message,
        duration: 4000
      })
    }

    this.setData({
      isSubmit: true
    });

    let data = {
      adopt: 1
    }

    // 待财务审核、待财务确认，要附带上支付方式参数
    if(order.status.type === EXAMINE_ACCOUNTANT || order.status.type === SUBMITTED){
      data.payType = payType[payIndex].type;
    }

    // 待财务确认，要附带上单价修改参数
    if(order.status.type === SUBMITTED){
      // 数据转化格式，然后提交
      let keys = [];
      let values = [];
      order.orderItems.forEach((item, index) => {
        keys.push(`skus[${index}].skuId`, `skus[${index}].num`, `skus[${index}].price`);
        values.push(item.skuId, item.quantity, item.buyprice);
      });

      let skus = {};
      keys.forEach((item, index) => {
        data[item] = values[index];
      });
    }

    wx.showLoading();
    http.request({
      url: `${api.finance_put_order}${id}`,
      method: 'POST',
      data,
    }).then((res) => {
      // 提交成功
      if (res.errorCode === 200) {
        this.toast.success({
          content: res.moreInfo
        })

        setTimeout(() => {
          wx.navigateBack({
            delta: 1
          })
        }, 1500)
      } else {
        // 提交失败，则提示
        this.toast.error({
          content: res.moreInfo
        })
      }
    })
  },

  // 仓管通过
  storePass (e) {
    let {
      order,
      logisticNum,
      driverName,
      driverPhone
    } = this.data;

    let logistics = '';

    this.setData({
      isSubmit: true
    });

    // 如果填写了物流单号
    if (logisticNum) {
        logistics += `物流单号：${logisticNum}；`;
    }
    // 如果填写了司机姓名
    if (driverName) {
        logistics += `司机姓名：${driverName}；`;
    }
    // 如果填写了司机手机号
    if (driverPhone) {
        logistics += `司机手机号：${driverPhone}；`;
    }

    wx.showLoading();
    http.request({
      url: `${api.warehouse_put_order}${order.id}`,
      method: 'POST',
      data: {
        logistics
      }
    }).then((res) => {
      // 提交成功
      if (res.errorCode === 200) {
        this.toast.success({
          content: res.moreInfo
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
        this.toast.error({
          content: res.moreInfo,
        })
      }
    })
  },
  onLoad (params) {
    // 如果订单id存在，则请求数据
    if (params.id) {
      this.setData({
        userInfo: app.userInfo
      });
      this.getData(params.id);
    } else {
      this.toast.error({
        content: '订单id不存在',
      })
    }
  }
})
