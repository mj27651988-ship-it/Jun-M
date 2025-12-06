import React, { useState, useEffect, useMemo } from 'react';
import { LoanProduct, CalculationResult } from '../types';
import { LOAN_PRODUCTS } from '../constants';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, AreaChart, Area, XAxis, YAxis, CartesianGrid, BarChart, Bar } from 'recharts';
import { Calculator as CalculatorIcon, ArrowRight, ChevronDown, Info, Minus, Plus, Scale, X, ArrowLeftRight, Check } from 'lucide-react';

const COLORS = ['#007AFF', '#FF9500', '#34C759', '#FF3B30']; // iOS Blue, Orange, Green, Red

interface LoanCalculatorProps {
  initialProduct?: LoanProduct;
}

interface LoanConfig {
  productId: string;
  amount: number;
  term: number;
  rate: number;
  method: 'equal_payment' | 'equal_principal' | 'interest_first';
}

const DEFAULT_CONFIG: LoanConfig = {
    productId: LOAN_PRODUCTS[0].id,
    amount: 1000000,
    term: 20,
    rate: 2.70,
    method: 'equal_payment'
};

const LoanCalculator: React.FC<LoanCalculatorProps> = ({ initialProduct }) => {
  // State
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'A' | 'B'>('A');

  const [configA, setConfigA] = useState<LoanConfig>({
      ...DEFAULT_CONFIG,
      productId: initialProduct?.id || DEFAULT_CONFIG.productId,
      rate: initialProduct?.baseRate || DEFAULT_CONFIG.rate
  });

  const [configB, setConfigB] = useState<LoanConfig>({
      ...DEFAULT_CONFIG,
      productId: LOAN_PRODUCTS[1].id, // Default to second product (e.g. Jiren Loan) for variety
      rate: LOAN_PRODUCTS[1].baseRate,
      term: LOAN_PRODUCTS[1].maxTerm
  });

  // Helper to get current config and setter
  const currentConfig = activeTab === 'A' ? configA : configB;
  const setCurrentConfig = activeTab === 'A' ? setConfigA : setConfigB;
  const currentProduct = LOAN_PRODUCTS.find(p => p.id === currentConfig.productId)!;

  // Update logic when product changes (clamp values)
  const updateConfig = (updates: Partial<LoanConfig>) => {
      setCurrentConfig(prev => {
          const newConfig = { ...prev, ...updates };
          
          // If product changed, update defaults
          if (updates.productId) {
              const product = LOAN_PRODUCTS.find(p => p.id === updates.productId)!;
              newConfig.rate = product.baseRate;
              newConfig.term = Math.min(Math.max(product.minTerm, newConfig.term), product.maxTerm);
              newConfig.amount = Math.min(newConfig.amount, product.maxAmount);
          }
          
          return newConfig;
      });
  };

  // Calculation Logic
  const calculateLoan = (config: LoanConfig): CalculationResult => {
      const product = LOAN_PRODUCTS.find(p => p.id === config.productId)!;
      // Clamp values for calculation safety
      const effectiveTerm = Math.min(Math.max(product.minTerm, config.term), product.maxTerm);
      const effectiveAmount = Math.min(config.amount, product.maxAmount);
      
      const monthlyRate = config.rate / 100 / 12;
      const months = effectiveTerm * 12;
      let monthlyPayment = 0;
      let totalPayment = 0;
      let totalInterest = 0;
      const schedule = [];

      if (config.method === 'equal_payment') {
        if (monthlyRate === 0) {
            monthlyPayment = effectiveAmount / months;
            totalInterest = 0;
        } else {
            monthlyPayment = (effectiveAmount * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
            totalInterest = (monthlyPayment * months) - effectiveAmount;
        }
        totalPayment = monthlyPayment * months;

        let balance = effectiveAmount;
        for (let i = 1; i <= months; i++) {
          const interest = balance * monthlyRate;
          const principal = monthlyPayment - interest;
          balance -= principal;
          schedule.push({
            month: i,
            payment: monthlyPayment,
            interest,
            principal,
            balance: balance > 0 ? balance : 0
          });
        }
      } else if (config.method === 'equal_principal') {
        const principalPerMonth = effectiveAmount / months;
        totalInterest = 0;
        let balance = effectiveAmount;
        for (let i = 1; i <= months; i++) {
          const interest = balance * monthlyRate;
          const payment = principalPerMonth + interest;
          totalInterest += interest;
          balance -= principalPerMonth;
          if (i === 1) monthlyPayment = payment; // First month
          schedule.push({
            month: i,
            payment,
            interest,
            principal: principalPerMonth,
            balance: balance > 0 ? balance : 0
          });
        }
        totalPayment = effectiveAmount + totalInterest;
      } else {
        const monthlyInterest = effectiveAmount * monthlyRate;
        monthlyPayment = monthlyInterest;
        totalInterest = monthlyInterest * months;
        totalPayment = effectiveAmount + totalInterest;
        let balance = effectiveAmount;
        for (let i = 1; i <= months; i++) {
          const isLastMonth = i === months;
          const principal = isLastMonth ? effectiveAmount : 0;
          const payment = monthlyInterest + principal;
          balance -= principal;
          schedule.push({
            month: i,
            payment,
            interest: monthlyInterest,
            principal,
            balance: balance > 0 ? balance : 0
          });
        }
      }

      return { monthlyPayment, totalPayment, totalInterest, schedule };
  };

  const resultA = useMemo(() => calculateLoan(configA), [configA]);
  const resultB = useMemo(() => calculateLoan(configB), [configB]);
  
  // Handlers for inputs
  const handleAmountChange = (delta: number) => {
    updateConfig({ 
        amount: Math.min(Math.max(0, currentConfig.amount + delta), currentProduct.maxAmount) 
    });
  };

  const handleTermChange = (delta: number) => {
    updateConfig({ 
        term: Math.min(Math.max(currentProduct.minTerm, currentConfig.term + delta), currentProduct.maxTerm) 
    });
  };

  const handleRateChange = (delta: number) => {
    updateConfig({ 
        rate: Math.max(0, Number((currentConfig.rate + delta).toFixed(2))) 
    });
  };

  const ControlButton = ({ onClick, icon: Icon }: { onClick: () => void, icon: any }) => (
    <button
      onClick={onClick}
      className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 active:scale-95 flex items-center justify-center text-gray-600 transition-all shrink-0"
    >
      <Icon size={18} strokeWidth={2.5} />
    </button>
  );

  return (
    <div className="h-full flex flex-col lg:flex-row overflow-hidden bg-white">
      {/* Inputs Panel */}
      <div className="lg:w-[400px] bg-[#F9F9FB] border-b lg:border-b-0 lg:border-r border-gray-200 p-6 lg:p-8 flex flex-col overflow-y-auto shrink-0 z-10 transition-all">
        <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">贷款计算器</h2>
            <button 
                onClick={() => setIsCompareMode(!isCompareMode)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border
                ${isCompareMode 
                    ? 'bg-blue-50 text-blue-600 border-blue-200' 
                    : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}
            >
                <Scale size={14} />
                {isCompareMode ? '退出对比' : '开启对比'}
            </button>
        </div>

        {isCompareMode && (
            <div className="bg-gray-200 p-1 rounded-xl flex mb-6">
                <button 
                    onClick={() => setActiveTab('A')}
                    className={`flex-1 py-1.5 text-sm font-semibold rounded-lg transition-all ${activeTab === 'A' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}
                >
                    方案 A
                </button>
                <button 
                    onClick={() => setActiveTab('B')}
                    className={`flex-1 py-1.5 text-sm font-semibold rounded-lg transition-all ${activeTab === 'B' ? 'bg-white text-orange-500 shadow-sm' : 'text-gray-500'}`}
                >
                    方案 B
                </button>
            </div>
        )}

        <div className="space-y-8 animate-fade-in" key={activeTab}>
          <div className="group">
            <label className="block text-[13px] font-semibold text-gray-500 uppercase tracking-wide mb-3">
                {isCompareMode ? (activeTab === 'A' ? '选择产品 (方案A)' : '选择产品 (方案B)') : '选择产品'}
            </label>
            <div className="relative">
                <select 
                  value={currentConfig.productId}
                  onChange={(e) => updateConfig({ productId: e.target.value })}
                  className="w-full p-4 bg-white shadow-apple-sm border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none appearance-none font-medium text-gray-900 transition-all"
                >
                {LOAN_PRODUCTS.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                ))}
                </select>
                <ChevronDown className="absolute right-4 top-4.5 text-gray-400 pointer-events-none w-5 h-5" />
            </div>
          </div>

          <div>
            <label className="flex justify-between items-center text-[13px] font-semibold text-gray-500 uppercase tracking-wide mb-3">
               <span>贷款金额</span>
            </label>
            <div className="flex items-center gap-3 mb-4">
              <ControlButton onClick={() => handleAmountChange(-10000)} icon={Minus} />
              <div className="bg-white p-2 rounded-2xl border border-gray-200 shadow-apple-sm flex-1 flex items-center justify-center relative">
                  <input
                      type="number"
                      value={currentConfig.amount}
                      onChange={(e) => updateConfig({ amount: Number(e.target.value) })}
                      className="w-full p-2 bg-transparent text-2xl font-bold text-gray-900 outline-none text-center tracking-tight"
                  />
                  <span className="text-[10px] font-normal text-gray-400 absolute right-4 pointer-events-none">RMB</span>
              </div>
              <ControlButton onClick={() => handleAmountChange(10000)} icon={Plus} />
            </div>
            <input 
              type="range" min={10000} max={currentProduct.maxAmount} step={10000} value={currentConfig.amount}
              onChange={(e) => updateConfig({ amount: Number(e.target.value) })}
              className={`w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer ${activeTab === 'A' ? 'accent-blue-600' : 'accent-orange-500'}`}
            />
          </div>

          <div>
            <label className="flex justify-between items-center text-[13px] font-semibold text-gray-500 uppercase tracking-wide mb-3">
               <span>贷款期限</span>
            </label>
            <div className="flex items-center gap-3 mb-4">
              <ControlButton onClick={() => handleTermChange(-1)} icon={Minus} />
              <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-apple-sm flex-1 text-center">
                  <span className="text-xl font-bold text-gray-900">{currentConfig.term}</span>
                  <span className="text-sm font-medium text-gray-400 ml-1">年</span>
              </div>
              <ControlButton onClick={() => handleTermChange(1)} icon={Plus} />
            </div>
            
            <input 
              type="range" min={currentProduct.minTerm} max={currentProduct.maxTerm} step={1} value={currentConfig.term}
              onChange={(e) => updateConfig({ term: Number(e.target.value) })}
              className={`w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer ${activeTab === 'A' ? 'accent-blue-600' : 'accent-orange-500'}`}
            />
            <div className="flex justify-between text-xs font-medium text-gray-400 px-1">
              <span>{currentProduct.minTerm}年</span>
              <span>{currentProduct.maxTerm}年</span>
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-gray-500 uppercase tracking-wide mb-3">年化利率 (%)</label>
            <div className="flex items-center gap-3">
              <ControlButton onClick={() => handleRateChange(-0.1)} icon={Minus} />
              <div className="bg-white p-3 rounded-2xl border border-gray-200 shadow-apple-sm flex items-center flex-1 relative">
                  <input
                  type="number"
                  step="0.01"
                  value={currentConfig.rate}
                  onChange={(e) => updateConfig({ rate: Number(e.target.value) })}
                  className="w-full bg-transparent text-xl font-bold text-gray-900 outline-none px-2 text-center"
                  />
                  <span className="text-gray-400 font-medium px-2 absolute right-14 pointer-events-none">%</span>
              </div>
              <ControlButton onClick={() => handleRateChange(0.1)} icon={Plus} />
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-gray-500 uppercase tracking-wide mb-3">还款方式</label>
            <div className="bg-gray-200/50 p-1.5 rounded-xl flex gap-1">
              {['equal_payment', 'equal_principal', 'interest_first'].map((m) => (
                  <button
                    key={m}
                    onClick={() => updateConfig({ method: m as any })}
                    className={`flex-1 py-2.5 rounded-lg text-[11px] lg:text-[13px] font-semibold transition-all shadow-sm whitespace-nowrap
                        ${currentConfig.method === m ? 'bg-white text-gray-900 shadow-apple-sm' : 'bg-transparent text-gray-500 shadow-none hover:text-gray-700'}`}
                  >
                    {m === 'equal_payment' ? '等额本息' : m === 'equal_principal' ? '等额本金' : '先息后本'}
                  </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Results Panel */}
      <div className="flex-1 p-6 md:p-10 overflow-y-auto bg-white/50">
        {!isCompareMode ? (
            // Standard View
            <div className="max-w-4xl mx-auto animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white p-6 rounded-[24px] shadow-apple-lg border border-gray-100 flex flex-col justify-center">
                    <p className="text-[13px] font-semibold text-gray-400 uppercase tracking-wide mb-2">月供参考</p>
                    <div className="flex items-baseline gap-1">
                        <span className="text-lg font-bold text-gray-900">¥</span>
                        <span className="text-4xl font-bold text-gray-900 tracking-tight">{resultA.monthlyPayment.toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-2 font-medium">{configA.method === 'interest_first' ? '首期利息' : '首月还款'}</p>
                </div>
                
                <div className="col-span-1 md:col-span-2 grid grid-cols-2 gap-6">
                    <div className="bg-[#F5F5F7] p-6 rounded-[24px] border border-gray-100/50 flex flex-col justify-center">
                        <p className="text-[13px] font-semibold text-gray-400 uppercase tracking-wide mb-2">总利息</p>
                        <p className="text-2xl font-bold text-gray-900">¥{resultA.totalInterest.toFixed(0)}</p>
                    </div>
                    <div className="bg-[#F5F5F7] p-6 rounded-[24px] border border-gray-100/50 flex flex-col justify-center">
                        <p className="text-[13px] font-semibold text-gray-400 uppercase tracking-wide mb-2">还款总额</p>
                        <p className="text-2xl font-bold text-gray-900">¥{resultA.totalPayment.toFixed(0)}</p>
                    </div>
                </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                    <div className="bg-white p-8 rounded-[32px] shadow-apple-md border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 tracking-tight">本息构成</h3>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                data={[
                                    { name: '贷款本金', value: configA.amount },
                                    { name: '支付利息', value: resultA.totalInterest },
                                ]}
                                cx="50%"
                                cy="50%"
                                innerRadius={70}
                                outerRadius={90}
                                paddingAngle={5}
                                dataKey="value"
                                cornerRadius={6}
                                stroke="none"
                                >
                                <Cell fill="#007AFF" />
                                <Cell fill="#FF9500" />
                                </Pie>
                                <Tooltip 
                                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} 
                                    formatter={(value: number) => `¥${value.toFixed(2)}`}
                                />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[32px] shadow-apple-md border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 tracking-tight">余额走势</h3>
                        <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart 
                                data={resultA.schedule.filter((_, idx) => idx % (Math.ceil(resultA.schedule.length / 50)) === 0)} 
                                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                            >
                            <defs>
                                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#007AFF" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#007AFF" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis dataKey="month" hide />
                            <YAxis tickFormatter={(val) => `${(val/10000).toFixed(0)}w`} style={{fontSize: 10, fontWeight: 500, fill: '#9ca3af'}} axisLine={false} tickLine={false} />
                            <Tooltip 
                                contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                                formatter={(value: number) => `¥${value.toFixed(0)}`} labelFormatter={(l) => `第 ${l} 期`} 
                            />
                            <Area type="monotone" dataKey="balance" stroke="#007AFF" strokeWidth={3} fillOpacity={1} fill="url(#colorBalance)" />
                            </AreaChart>
                        </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        ) : (
            // Comparison View
            <div className="max-w-4xl mx-auto animate-fade-in">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">方案对比分析</h2>
                        <p className="text-gray-500 mt-1">
                            <span className="text-blue-600 font-semibold">{LOAN_PRODUCTS.find(p=>p.id===configA.productId)?.name}</span> 
                            <span className="mx-2 text-gray-300">vs</span> 
                            <span className="text-orange-500 font-semibold">{LOAN_PRODUCTS.find(p=>p.id===configB.productId)?.name}</span>
                        </p>
                    </div>
                </div>

                {/* Comparison Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                     {/* Card 1: Monthly Payment */}
                    <div className="bg-white p-6 rounded-[24px] shadow-apple-md border border-gray-100">
                        <p className="text-[13px] font-semibold text-gray-400 uppercase tracking-wide mb-4">月供 (首月)</p>
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-sm text-gray-500 font-medium">方案 A</span>
                            <span className="text-lg font-bold text-gray-900">¥{resultA.monthlyPayment.toFixed(0)}</span>
                        </div>
                        <div className="flex justify-between items-end mb-4">
                            <span className="text-sm text-gray-500 font-medium">方案 B</span>
                            <span className="text-lg font-bold text-gray-900">¥{resultB.monthlyPayment.toFixed(0)}</span>
                        </div>
                        <div className={`pt-4 border-t border-gray-100 flex items-center justify-between text-sm font-semibold
                            ${resultA.monthlyPayment < resultB.monthlyPayment ? 'text-blue-600' : 'text-orange-500'}`}>
                            <span>差额</span>
                            <span>
                                {resultA.monthlyPayment < resultB.monthlyPayment ? 'A 省 ' : 'B 省 '} 
                                ¥{Math.abs(resultA.monthlyPayment - resultB.monthlyPayment).toFixed(0)}
                            </span>
                        </div>
                    </div>

                    {/* Card 2: Total Interest */}
                    <div className="bg-white p-6 rounded-[24px] shadow-apple-md border border-gray-100">
                        <p className="text-[13px] font-semibold text-gray-400 uppercase tracking-wide mb-4">总利息支出</p>
                         <div className="flex justify-between items-end mb-2">
                            <span className="text-sm text-gray-500 font-medium">方案 A</span>
                            <span className="text-lg font-bold text-gray-900">¥{(resultA.totalInterest/10000).toFixed(2)}w</span>
                        </div>
                        <div className="flex justify-between items-end mb-4">
                            <span className="text-sm text-gray-500 font-medium">方案 B</span>
                            <span className="text-lg font-bold text-gray-900">¥{(resultB.totalInterest/10000).toFixed(2)}w</span>
                        </div>
                        <div className={`pt-4 border-t border-gray-100 flex items-center justify-between text-sm font-semibold
                            ${resultA.totalInterest < resultB.totalInterest ? 'text-blue-600' : 'text-orange-500'}`}>
                            <span>差额</span>
                            <span>
                                {resultA.totalInterest < resultB.totalInterest ? 'A 省 ' : 'B 省 '} 
                                ¥{Math.abs((resultA.totalInterest - resultB.totalInterest)/10000).toFixed(2)}w
                            </span>
                        </div>
                    </div>

                    {/* Card 3: Total Cost */}
                    <div className="bg-white p-6 rounded-[24px] shadow-apple-md border border-gray-100">
                        <p className="text-[13px] font-semibold text-gray-400 uppercase tracking-wide mb-4">总还款额</p>
                         <div className="flex justify-between items-end mb-2">
                            <span className="text-sm text-gray-500 font-medium">方案 A</span>
                            <span className="text-lg font-bold text-gray-900">¥{(resultA.totalPayment/10000).toFixed(2)}w</span>
                        </div>
                        <div className="flex justify-between items-end mb-4">
                            <span className="text-sm text-gray-500 font-medium">方案 B</span>
                            <span className="text-lg font-bold text-gray-900">¥{(resultB.totalPayment/10000).toFixed(2)}w</span>
                        </div>
                         <div className={`pt-4 border-t border-gray-100 flex items-center justify-between text-sm font-semibold
                            ${resultA.totalPayment < resultB.totalPayment ? 'text-blue-600' : 'text-orange-500'}`}>
                            <span>差额</span>
                             <span>
                                {resultA.totalPayment < resultB.totalPayment ? 'A 省 ' : 'B 省 '} 
                                ¥{Math.abs((resultA.totalPayment - resultB.totalPayment)/10000).toFixed(2)}w
                            </span>
                        </div>
                    </div>
                </div>

                {/* Comparison Chart */}
                 <div className="bg-white p-8 rounded-[32px] shadow-apple-md border border-gray-100 mb-8">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 tracking-tight">资金成本对比</h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={[
                                    { name: '月供', A: resultA.monthlyPayment, B: resultB.monthlyPayment },
                                    { name: '总利息', A: resultA.totalInterest, B: resultB.totalInterest },
                                    { name: '总还款', A: resultA.totalPayment, B: resultB.totalPayment },
                                ]}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                barGap={10}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
                                <YAxis hide />
                                <Tooltip 
                                    cursor={{fill: '#f3f4f6'}}
                                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                                    formatter={(value: number) => `¥${value.toFixed(0)}`}
                                />
                                <Legend verticalAlign="top" align="right" iconType="circle" height={36}/>
                                <Bar dataKey="A" name="方案 A" fill="#007AFF" radius={[6, 6, 0, 0]} maxBarSize={60} />
                                <Bar dataKey="B" name="方案 B" fill="#FF9500" radius={[6, 6, 0, 0]} maxBarSize={60} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                
                <div className="bg-blue-50/50 border border-blue-100 rounded-[20px] p-5 flex items-start gap-4">
                    <Info className="w-6 h-6 text-blue-500 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-bold text-gray-900 text-sm mb-1">对比结论</h4>
                        <p className="text-sm text-gray-600 leading-relaxed font-medium">
                           {resultA.totalInterest < resultB.totalInterest 
                             ? '方案 A 总利息更低，适合资金长期占用。' 
                             : '方案 B 总利息更低，更加划算。'} 
                           如果考虑月供压力，
                           {resultA.monthlyPayment < resultB.monthlyPayment 
                             ? '方案 A 的月供压力较小。' 
                             : '方案 B 的月供压力较小。'}
                        </p>
                    </div>
                </div>

            </div>
        )}

      </div>
    </div>
  );
};

export default LoanCalculator;