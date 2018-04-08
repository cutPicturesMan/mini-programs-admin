const ROLE = {
  // 业务员
  ROLE_SALESMAN: {
    id: 2,
    code: 'ROLE_SALESMAN',
    name: '业务员'
  },
  // 经理
  ROLE_MANAGER: {
    id: 3,
    code: 'ROLE_MANAGER',
    name: '经理'
  },
  // 财务
  ROLE_FINANCE: {
    id: 4,
    code: 'ROLE_FINANCE',
    name: '财务'
  },
  // 仓管
  ROLE_WAREHOUSE: {
    id: 5,
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
