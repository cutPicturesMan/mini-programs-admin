const ROLE = {
  // 业务员
  ROLE_SALESMAN: {
    code: 'ROLE_SALESMAN',
    name: '业务员'
  },
  // 经理
  ROLE_MANAGER: {
    code: 'ROLE_MANAGER',
    name: '经理'
  },
  // 财务
  ROLE_FINANCE: {
    code: 'ROLE_FINANCE',
    name: '财务'
  },
  // 仓管
  ROLE_WAREHOUSE: {
    code: 'ROLE_WAREHOUSE',
    name: '仓管'
  }
};

const ROLE_LIST = {};

// 将管理员角色常量转为需要的数据结构格式
Object.keys(ROLE).forEach((key)=>{
  ROLE_LIST[key] = ROLE[key].code;
});

export { ROLE, ROLE_LIST };
