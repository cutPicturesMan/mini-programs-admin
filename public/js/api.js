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
  // 退单
  order_back: '/api/order/back/',
  // 获取某个订单的配送方式
  logistic_list: '/api/order/fulfillType/',

  // 获取所有业务员 [get]
  // 解除某个业务员的关系 [delete id]
  salesman: '/api/user/salesman/',

  // 业务员修改订单
  salesman_put_order: '/api/order/salesman/',
  // 经理修改订单
  manage_put_order: '/api/order/manager/',
  // 经理修改员工角色
  manage_change_rule: '/api/user/manager/',
  // 财务修改订单
  finance_put_order: '/api/order/finance/',
  // 仓管修改订单
  warehouse_put_order: '/api/order/warehouse/',

  // 仓管
  stock: '/api/product/stock/',

  // 财务 账期列表
  finance_collect: '/api/finance/',
  // 财务 更新单个账期
  finance_collect_logs: '/api/finance/logs',

  // 登录
  login: '/wx/login',
  // 个人中心
  user: '/wx/info',

  // 管理端二维码
  admin_twocode: '/wx/code',
  // 模板消息
  template_msg: '/api/user/formId',
  // 获取所有支付方式，id
  pay: '/api/pay/',
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

  // 客户列表
  indicatorsTableCustomer: '/api/indicators/table/customer/',
  // 业务员列表
  indicatorsTableSalesman: '/api/indicators/table/salesman/',
  // 考核指标头部信息
  indicatorsHead: '/api/indicators/head/',
  // 客户采购统计
  getProcurement: '/api/indicators/procurement/',
  // 创建指标
  indicators: '/api/indicators',
}

for (var attr in api) {
  api[attr] = 'https://www.byunfu.com/admin' + api[attr];
}

// 客户端的接口
api.add_customer = 'https://www.byunfu.com/site/wx/info';
// 客户端的二维码
api.site_twocode = 'https://www.byunfu.com/site/wx/code';

export default api;
