import http from '../../public/js/http.js';
import api from '../../public/js/api.js';
import { ROLE, ROLE_LIST } from '../../public/js/role.js';

Page({
  data: {
    ROLE,
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
          // 是否处于编辑状态中
          item.isEdit = false;

          let roleObj = {};
          item.allRoles.forEach((item)=>{
            roleObj[item.name] = true;
          });

          item.roleObj = roleObj;
        });

        this.setData({
          isLoaded: true,
          list: res.data
        });
      }
    })
  },
  // 开始编辑角色
  beginEdit (e) {
    let { index } = e.currentTarget.dataset;
    let { list } = this.data;

    this.setData({
        [`list[${index}].isEdit`]: true
    });
  },
  // 选择角色
  chooseRole (e) {
    let { code, index } = e.currentTarget.dataset;
    let { list } = this.data;
    let { roleObj, isEdit } = list[index];

    // 非编辑模式下，提示
    if(!isEdit){
        wx.showToast({
            title: '请点击编辑按钮',
            image: '../../icons/close-circled.png'
        });

        return false;
    }

    roleObj[code] = !roleObj[code];
    this.setData({
      [`list[${index}].roleObj`]: roleObj
    });
  },
  // 结束编辑角色
  endEdit (e) {
    let { index } = e.currentTarget.dataset;
    let { list } = this.data;
    let { id, roleObj, allRoles } = list[index];
    let roleArr = [];

    for(var key in roleObj){
      // 过滤出已选择的角色
      if(roleObj[key]){
        roleArr.push(key);
      }
    }

    // 如果待修改的角色数量和原始角色相同
    if(roleArr.length == allRoles.length){
      // 如果内容完全一样，则不发送请求
      let isSame = roleArr.every((rItem)=>{
        return allRoles.some((aItem)=>{
          if(rItem == aItem.name){
            return true;
          } else {
            return false;
          }
        });
      });

      if(isSame){
        wx.showToast({
            title: '您没有做出任何修改',
            image: '../../icons/close-circled.png'
        });
      }
    } else {
      wx.showLoading();
      http.request({
        url: `${api.manage_change_rule}${id}`,
        method: 'PUT',
        data: {
          roleNames: roleArr.join(',')
        }
      }).then((res) => {
        wx.hideLoading();

        if (res.errorCode === 200) {
          wx.showToast({
            title: res.moreInfo || '恭喜你，修改成功'
          });
        } else {
          wx.showToast({
            image: '../../icons/close-circled.png',
            title: '修改失败，请重试'
          });
        }
      })
    }

    this.setData({
      [`list[${index}].isEdit`]: false
    });
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
