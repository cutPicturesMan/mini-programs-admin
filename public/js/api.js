let api = {
  // 获取客户列表
  // 传id?pass=0/1 PUT 为通过、拒绝某个客户申请
  // 传id GET 为获取某个用户的折扣信息
  customer: '/api/user/customer/',
  // 解除客户关系
  customer_remove: '/api/user/customer/',
  // 设置客户折扣，PUT方法
  customer_setting: '/api/user/customer/offer/',

  // 获取所有订单 or 获取单个订单
  order: '/api/order/',
  // 获取所有待处理订单
  order_wait: '/api/order/wait',

  // 业务员修改订单
  salesman_put_order: '/api/order/salesman/',

  // 登录
  login: '/wx/login',
  // 个人中心
  user: '/wx/info',


  // 管理端二维码
  admin_twocode: '/wx/code',

  // // 获取分类商品
  // category_products: '/category/products/',
  // // 获取某个商品
  // product: '/product/',
  // // 获取商品sku
  // product_sku: '/product/sku/',
  // // 商品搜索
  // product_search: '/product/search',
  //
  // // 购物车
  // cart: '/cart',
  //
  // // 订单
  // order: '/order/',
  //
  // // 获取收货地址
  // address: '/address',
  // // 获取默认收货地址


}

for (var attr in api) {
  api[attr] = 'https://www.byunfu.com/admin' + api[attr];
}

// 客户端的接口
api.add_customer = 'https://www.byunfu.com/site/wx/info';
// 客户端的二维码
api.site_twocode = 'https://www.byunfu.com/site/wx/code';

export default api;
