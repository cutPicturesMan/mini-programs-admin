import http from '../../public/js/http.js';
import api from '../../public/js/api.js';

Page({
  data: {
    // 订单列表
    list: [],
    // 列表原始的库存数量，用于提交时比对
    numList: [],
    // 页码
    page: 0,
    // 一页显示的数量
    size: 30,
    // 是否还有更多数据，默认是；当返回的分类数据小于this.data.size时，表示没有更多数据了
    isMore: true,
    // 是否正在加载更多数据
    isLoading: false,
    // 数据是否正在提交中
    isSubmit: false
  },
  // 加载下一页
  loadmore () {
    let {
      page,
      size,
      isMore,
      isLoading,
      list,
      numList
    } = this.data;

    // 如果没有更多数据，则不执行操作
    if (!isMore) {
        return false;
    }

    // 如果正在加载中，则不执行操作
    if (isLoading) {
        return false;
    }

    this.data.isLoading = true;

    wx.showLoading();
    http.request({
      url: api.stock,
      data: {
        page,
        size,
      }
    }).then((res) => {
      wx.hideLoading();
      this.data.isLoading = false;

      if (res.errorCode === 200) {
        page++;
        let data = res.data;

        // 如果返回的数据长度小于请求预期长度，则表示没有下一页了
        if (data.length < size) {
          isMore = false;
        }

        data.forEach((item) => {
          numList.push(item.qtyAvailable);
        });

        this.setData({
          page,
          isMore,
          list: list.concat(data),
          numList,

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
          // 清空numList，设置为修改后的数据
          numList = [];

          list.forEach((item) => {
            numList.push(item.qtyAvailable);
          });

          this.setData({
            numList,
            isSubmit: false
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
    }).catch(() => {
      this.setData({
        isSubmit: false
      })
    })
  },
  onLoad () {
    this.loadmore();
  }
})
