import React, { useState } from 'react';
import { LOAN_PRODUCTS } from '../constants';
import { LoanProduct } from '../types';
import { Check, X, Plus, Trash2, ArrowUp } from 'lucide-react';

const ComparisonTool: React.FC = () => {
  const [selectedIds, setSelectedIds] = useState<string[]>([LOAN_PRODUCTS[0].id, LOAN_PRODUCTS[1].id]);

  const toggleProduct = (id: string) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length > 1) {
        setSelectedIds(selectedIds.filter(pid => pid !== id));
      }
    } else {
      if (selectedIds.length < 3) {
        setSelectedIds([...selectedIds, id]);
      }
    }
  };

  const products = selectedIds.map(id => LOAN_PRODUCTS.find(p => p.id === id)!);
  
  // Calculate minimum rate for comparison
  const minRate = products.length > 0 ? Math.min(...products.map(p => p.baseRate)) : 0;

  return (
    <div className="h-full flex flex-col p-6 md:p-10 overflow-hidden bg-[#F5F5F7]">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">方案对比</h2>
        <p className="text-base text-gray-500 mt-2 font-medium">选择产品进行详细参数对比</p>
      </div>

      {/* Selection Area - Floating Pill */}
      <div className="flex gap-3 mb-8 overflow-x-auto py-1 scrollbar-hide">
        {LOAN_PRODUCTS.map(product => {
          const isSelected = selectedIds.includes(product.id);
          const isDisabled = !isSelected && selectedIds.length >= 3;
          return (
            <button
              key={product.id}
              onClick={() => !isDisabled && toggleProduct(product.id)}
              disabled={isDisabled}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap shrink-0 border
                ${isSelected 
                  ? 'bg-gray-900 text-white border-gray-900 shadow-lg shadow-gray-900/20' 
                  : isDisabled 
                    ? 'bg-gray-100 text-gray-300 border-transparent cursor-not-allowed' 
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                }`}
            >
              {isSelected ? <Check size={14} strokeWidth={3} /> : <Plus size={14} strokeWidth={3} />}
              {product.name}
            </button>
          )
        })}
      </div>

      {/* Comparison Table Container - Card Style */}
      <div className="flex-1 bg-white rounded-[32px] shadow-float border border-white/50 overflow-hidden flex flex-col ring-1 ring-black/5">
         <div className="overflow-auto flex-1 relative">
            <div className="flex min-w-max">
                {/* Sticky Labels Column */}
                <div className="w-32 md:w-48 bg-gray-50/95 backdrop-blur border-r border-gray-100 flex flex-col shrink-0 sticky left-0 z-20">
                    <div className="h-32 p-6 border-b border-gray-100 flex items-end pb-6 font-semibold text-gray-400 text-sm">
                        产品信息
                    </div>
                    <div className="flex-1 flex flex-col font-medium text-gray-500 text-sm">
                        <div className="py-5 px-6 border-b border-gray-100 h-16 flex items-center bg-gray-50/50">贷款类型</div>
                        <div className="py-5 px-6 border-b border-gray-100 h-16 flex items-center bg-gray-50/50">基准利率</div>
                        <div className="py-5 px-6 border-b border-gray-100 h-16 flex items-center bg-gray-50/50">利率对比</div>
                        <div className="py-5 px-6 border-b border-gray-100 h-16 flex items-center bg-gray-50/50">最高额度</div>
                        <div className="py-5 px-6 border-b border-gray-100 h-16 flex items-center bg-gray-50/50">期限范围</div>
                        <div className="py-6 px-6 border-b border-gray-100 flex-1 min-h-[200px] bg-gray-50/50 pt-8">核心亮点</div>
                    </div>
                </div>

                {/* Product Columns */}
                {products.map((product, idx) => {
                  const isLowest = product.baseRate === minRate;
                  const diff = (product.baseRate - minRate).toFixed(2);

                  return (
                    <div key={product.id} className={`w-56 md:w-72 flex-1 flex flex-col ${idx !== products.length - 1 ? 'border-r border-gray-100' : ''}`}>
                        <div className="h-32 p-6 border-b border-gray-100 flex flex-col justify-center bg-white relative group">
                            {selectedIds.length > 1 && (
                                <button 
                                    onClick={() => toggleProduct(product.id)}
                                    className="absolute top-4 right-4 p-1.5 rounded-full bg-gray-100 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-500"
                                >
                                    <Trash2 size={14} />
                                </button>
                            )}
                            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 w-fit px-2 py-1 rounded-md mb-2 tracking-wide uppercase">{product.type}</span>
                            <h3 className="text-lg font-bold text-gray-900 truncate tracking-tight">{product.name}</h3>
                        </div>
                        <div className="flex-1 flex flex-col bg-white">
                            <div className="py-5 px-6 border-b border-gray-100 h-16 text-gray-900 text-sm font-medium flex items-center">
                            {product.type === 'MORTGAGE' ? '住房按揭' : product.type === 'PERSONAL' ? '个人消费' : product.type === 'BUSINESS' ? '经营性贷款' : '车辆分期'}
                            </div>
                            <div className="py-5 px-6 border-b border-gray-100 h-16 flex items-center">
                                <span className="text-xl font-bold text-blue-600">{product.baseRate}%</span>
                            </div>
                            
                            {/* Comparison Row */}
                            <div className="py-5 px-6 border-b border-gray-100 h-16 flex items-center text-sm">
                              {isLowest ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
                                    最优利率
                                </span>
                              ) : (
                                 <span className="text-orange-500 font-semibold flex items-center gap-1 bg-orange-50 px-2 py-1 rounded-lg">
                                    <ArrowUp size={14} strokeWidth={2.5} />
                                    <span>高 {diff}%</span>
                                 </span>
                              )}
                            </div>

                            <div className="py-5 px-6 border-b border-gray-100 h-16 text-gray-900 text-sm font-medium flex items-center">
                            {(product.maxAmount / 10000).toFixed(0)} <span className="text-gray-500 ml-1 font-normal">万元</span>
                            </div>
                            <div className="py-5 px-6 border-b border-gray-100 h-16 text-gray-900 text-sm font-medium flex items-center">
                            {product.minTerm} - {product.maxTerm} <span className="text-gray-500 ml-1 font-normal">年</span>
                            </div>
                            <div className="py-8 px-6 border-b border-gray-100 flex-1 min-h-[200px] text-gray-600 text-sm">
                            <ul className="space-y-4">
                                {product.features.map((feature, i) => (
                                <li key={i} className="flex items-start">
                                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mr-3 shrink-0 mt-0.5">
                                        <Check className="w-3 h-3 text-green-600" strokeWidth={3} />
                                    </div>
                                    <span className="leading-snug font-medium">{feature}</span>
                                </li>
                                ))}
                            </ul>
                            </div>
                        </div>
                    </div>
                  );
                })}
                
                {/* Empty State filler */}
                {products.length < 3 && (
                <div className="w-48 md:flex-1 bg-gray-50/30 flex items-center justify-center min-w-[160px]">
                    <div className="text-center p-4">
                       <div className="w-12 h-12 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center mx-auto mb-3 text-gray-300">
                          <Plus size={24} />
                       </div>
                       <p className="text-sm font-medium text-gray-400">添加产品</p>
                    </div>
                </div>
                )}
            </div>
         </div>
      </div>
    </div>
  );
};

export default ComparisonTool;