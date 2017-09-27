import http from '../../public/js/http.js';
import api from '../../public/js/api.js';

Page({
  data: {
    // 客户列表
    list: [],
    // 数据是否加载完毕
    isLoaded: false,
  },
  getData () {
    wx.showLoading();
    http.request({
      url: api.salesman
    }).then((res) => {
      wx.hideLoading();

      if (res.errorCode === 200) {
        // 为每一行数据添加提示状态
        res.data.forEach((item) => {
          // 正在通过中
          item.isPassing = false;
          // 正在拒绝中
          item.isRejecting = false;
          // 正在解除关系
          item.isRemoving = false;
          // 是否显示移除按钮
          item.isShowRemoveBtn = false;
        });

        this.setData({
          isLoaded: true,
          list: res.data
        });
      }
    })
  },
  // 通过、拒绝业务员
  judge (e) {
    let list = this.data.list;
    let { pass, id, index } = e.currentTarget.dataset;

    // 如果正在发送数据，则返回
    if (list[index].isPassing || list[index].isRejecting) {
      wx.showToast({
        title: '数据提交中，请稍后...',
        image: '../../icons/close-circled.png'
      })
      return;
    }

    // 根据通过、拒绝进行按钮禁用
    if (pass === 1) {
      list[index].isPassing = true;
    } else {
      list[index].isRejecting = true;
    }

    this.setData({
      list: list
    });

    wx.showLoading();
    http.request({
      url: `${api.salesman}${id}`,
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
      } else {
        wx.showToast({
          title: res.moreInfo,
          image: '../../icons/close-circled.png'
        });

        setTimeout(() => {
          // 根据通过、拒绝进行按钮解除禁用
          if (pass === 1) {
            list[index].isPassing = false;
          } else {
            list[index].isRejecting = false;
          }

          this.setData({
            list: list
          });
        }, 1500);
      }
    })
  },
  // 显示、关闭解除业务员按钮
  toggleRemove (e) {
    let list = this.data.list;
    let { index } = e.currentTarget.dataset;

    list[index].isShowRemoveBtn = !list[index].isShowRemoveBtn;

    this.setData({
      list
    });
  },
  // 解除提示确认框
  confirmRemove (e) {
    wx.showModal({
      title: '提示',
      content: '确定要解除业务员关系吗？',
      success: (res) => {
        if (res.confirm) {
          this.remove(e);
        } else if (res.cancel) {

        }
      }
    })
  },
  // 解除关系
  remove (e) {
    let list = this.data.list;
    let { id, index } = e.currentTarget.dataset;

    // 如果正在发送数据，则返回
    if (list[index].isRemoving) {
      wx.showToast({
        title: '数据提交中，请稍后...',
        image: '../../icons/close-circled.png'
      })
      return;
    }

    // 进行按钮禁用
    list[index].isRemoving = true;

    this.setData({
      list: list
    });

    wx.showLoading();
    http.request({
      url: `${api.salesman}${id}`,
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
  onLoad () {
    this.getData();
  }
})
