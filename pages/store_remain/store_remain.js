import http from '../../public/js/http.js';
import api from '../../public/js/api.js';

Page({
  data: {
    // 订单列表
    list: [],
    // 列表原始的库存数量，用于提交时比对
    numList: [],
    // 数据是否加载完毕
    isLoaded: false,
    // 数据是否正在提交中
    isSubmit: false
  },
  // 获取列表数据
  getData () {
    wx.showLoading();

    http.request({
      url: api.stock,
    }).then((res) => {
      wx.hideLoading();
      let list = res.data;
      let numList = [];
      list.forEach((item) => {
        numList.push(item.qtyAvailable);
      });

      if (res.errorCode === 200) {
        this.setData({
          list,
          numList,
          isLoaded: true
        });
      }
    })
  },
  // 减
  reduce (e) {
    let { index } = e.currentTarget.dataset;
    let { list } = this.data;
    let num = list[index].qtyAvailable;

    num--;
    // 库存数量不能小于0
    if (num < 0) {
      num = 0;
    }

    list[index].qtyAvailable = num;

    this.setData({
      list: list
    })
  },
  // 输入数字
  inputNumber (e) {
    let { index } = e.currentTarget.dataset;
    let { list } = this.data;
    let num = e.detail.value;

    // 库存数量不能小于0
    if (num < 0) {
      num = 0;
    }

    list[index].qtyAvailable = num;

    this.setData({
      list: list
    })
  },
  // 加
  add (e) {
    let { index } = e.currentTarget.dataset;
    let { list } = this.data;
    let num = list[index].qtyAvailable;

    num++;
    list[index].qtyAvailable = num;

    this.setData({
      list: list
    })
  },
  // 提交
  submit () {
    let { list, numList, isSubmit } = this.data;
    let modifyArr = [];

    try {
      if (isSubmit) {
        throw new Error('正在修改中...');
      }

      // 循环列表，如果库存不一样，就表示修改了，需要写入数据库
      list.forEach((item, index) => {
        if (item.qtyAvailable != numList[index]) {
          let obj = {
            skuId: item.id,
            num: item.qtyAvailable
          };

          modifyArr.push(obj);
        }
      })

      if (modifyArr.length == 0) {
        throw new Error('您未修改任何商品');
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
    })

    // 数据转化格式，然后提交
    let keys = [];
    let values = [];
    modifyArr.forEach((item, index) => {
      keys.push(`skus[${index}].skuId`, `skus[${index}].num`);
      values.push(item.skuId, item.num);
    });

    let skus = {};
    keys.forEach((item, index) => {
      skus[item] = values[index];
    });

    wx.showLoading();
    http.request({
      url: api.stock,
      method: 'PUT',
      data: {
        ...skus
      }
    }).then((res) => {
      // 提交成功，则跳转到待处理页面
      if (res.errorCode === 200) {
        wx.showToast({
          title: res.moreInfo || '提交成功'
        })

        setTimeout(() => {
          this.setData({
            isSubmit: false
          })
          this.getData();
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
    }).catch(() => {
      this.setData({
        isSubmit: false
      })
    })
  },
  onLoad () {
    this.getData();
  }
})
