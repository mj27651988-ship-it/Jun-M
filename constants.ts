import { LoanProduct, LoanType } from './types';

export const LOAN_PRODUCTS: LoanProduct[] = [
  {
    id: 'jf_consumer',
    name: '吉房贷 (消费类)',
    type: LoanType.MORTGAGE,
    baseRate: 3.10,
    minTerm: 1,
    maxTerm: 20,
    maxAmount: 3000000,
    description: '个人消费类贷款，年化3.1%起，最高300万。支持气球贷、无还本续贷，抵押率最高85%。',
    features: ['年化3.1%起', '最高300万', '循环授信20年', '支持气球贷', '父母子女房产抵押']
  },
  {
    id: 'js_mortgage',
    name: '吉商贷 (抵押类)',
    type: LoanType.BUSINESS,
    baseRate: 3.10, // LPR base, used for calculation estimate
    minTerm: 1,
    maxTerm: 10,
    maxAmount: 5000000,
    description: '个人经营类贷款，额度高、担保多样。循环授信最长3年，住宅抵押最长10年。支持气球贷（仅住宅）。',
    features: ['年化利率LPR起', '最高500万', '住宅抵押最长10年', '支持气球贷(仅住宅)', '循环授信']
  },
  {
    id: 'js_credit',
    name: '吉商贷 (信用类)',
    type: LoanType.BUSINESS,
    baseRate: 3.10, // LPR base
    minTerm: 1,
    maxTerm: 3,
    maxAmount: 3000000,
    description: '纯信用经营贷款，无需抵押。最高300万。门槛较高：需信用评级A-级以上，且经营主体连续盈利2年以上。',
    features: ['纯信用无抵押', '最高300万', '信用评级A-以上', '需连续盈利2年', '需电子税局账号']
  },
  {
    id: 'jr_personal',
    name: '吉人贷 (信用贷款)',
    type: LoanType.PERSONAL,
    baseRate: 3.10,
    minTerm: 1,
    maxTerm: 5,
    maxAmount: 500000,
    description: '线上申请、秒批秒贷。面向企事业单位、公务员、国企、金融行业及优质民营企业员工。',
    features: ['年化3.1%起', '最高50万', '秒批秒贷', '随借随还']
  },
  {
    id: 'jq_business',
    name: '吉企贷 (小微经营)',
    type: LoanType.BUSINESS,
    baseRate: 3.50,
    minTerm: 1,
    maxTerm: 10,
    maxAmount: 5000000,
    description: '专为中小微企业设计的经营性贷款，支持多种担保方式，普惠金融政策支持。',
    features: ['普惠金融', '循环额度', '利率灵活']
  },
  {
    id: 'jc_auto',
    name: '吉车贷 (汽车分期)',
    type: LoanType.AUTO,
    baseRate: 2.99,
    minTerm: 1,
    maxTerm: 5,
    maxAmount: 1000000,
    description: '新车及二手车购置贷款，通过合作经销商办理更便捷。',
    features: ['超低费率', '即时放款', '不仅限新车']
  },
  {
    id: 'jh_owner',
    name: '吉惠贷 (业主专享)',
    type: LoanType.BUSINESS,
    baseRate: 6.00,
    minTerm: 1,
    maxTerm: 3,
    maxAmount: 2000000,
    description: '针对小微企业及个体工商户业主设计的贷款产品，手续简便，放款快速。',
    features: ['年化利率6.0%起', '小微/个体户专属', '手续简便']
  }
];

export const NAV_ITEMS = [
  { id: 'dashboard', label: '产品展示', icon: 'LayoutGrid' },
  { id: 'qualification', label: '智能准入', icon: 'FileCheck' },
  { id: 'calculator', label: '贷款计算', icon: 'Calculator' },
  { id: 'compare', label: '方案对比', icon: 'Scale' },
  { id: 'ai-assistant', label: '智能助手', icon: 'Bot' },
];