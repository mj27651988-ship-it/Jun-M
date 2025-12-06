import React from 'react';
import { LOAN_PRODUCTS } from '../constants';
import { LoanProduct, LoanType } from '../types';
import { CheckCircle2, Building2, User, Briefcase, Car, ArrowRight } from 'lucide-react';

interface DashboardProps {
  onSelectProduct: (product: LoanProduct) => void;
}

const ProductCard: React.FC<{ product: LoanProduct; onSelect: (p: LoanProduct) => void }> = ({ product, onSelect }) => {
  const getIcon = (type: LoanType) => {
    switch (type) {
      case LoanType.MORTGAGE: return <Building2 className="w-6 h-6 text-white" />;
      case LoanType.PERSONAL: return <User className="w-6 h-6 text-white" />;
      case LoanType.BUSINESS: return <Briefcase className="w-6 h-6 text-white" />;
      case LoanType.AUTO: return <Car className="w-6 h-6 text-white" />;
    }
  };

  const getGradient = (type: LoanType) => {
    switch (type) {
      case LoanType.MORTGAGE: return 'bg-gradient-to-br from-blue-500 to-blue-600';
      case LoanType.PERSONAL: return 'bg-gradient-to-br from-indigo-500 to-indigo-600';
      case LoanType.BUSINESS: return 'bg-gradient-to-br from-slate-700 to-slate-800';
      case LoanType.AUTO: return 'bg-gradient-to-br from-orange-400 to-orange-500';
    }
  };

  return (
    <div 
      onClick={() => onSelect(product)}
      className="bg-white rounded-[24px] p-6 flex flex-col justify-between hover:shadow-float transition-all duration-300 cursor-pointer group border border-gray-100 relative overflow-hidden active:scale-[0.98]"
    >
      <div>
        <div className="flex justify-between items-start mb-5">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-md ${getGradient(product.type)}`}>
            {getIcon(product.type)}
          </div>
          <span className="text-[11px] font-semibold px-2.5 py-1 bg-gray-100 text-gray-500 rounded-full tracking-wide uppercase">
            {product.type === 'MORTGAGE' ? 'Mortgage' : product.type === 'PERSONAL' ? 'Personal' : product.type === 'BUSINESS' ? 'Business' : 'Auto'}
          </span>
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-2 tracking-tight">{product.name}</h3>
        <p className="text-gray-500 text-[15px] mb-6 leading-relaxed line-clamp-2 font-medium">{product.description}</p>
        
        <div className="flex gap-4 mb-6">
          <div className="bg-gray-50 px-4 py-3 rounded-2xl flex-1 border border-gray-100">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">基准年化</p>
            <p className="text-2xl font-bold text-gray-900 tracking-tight">{product.baseRate}%</p>
          </div>
          <div className="bg-gray-50 px-4 py-3 rounded-2xl flex-1 border border-gray-100">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">最高额度</p>
            <p className="text-lg font-bold text-gray-900 tracking-tight pt-1">{(product.maxAmount / 10000).toFixed(0)} <span className="text-sm font-normal text-gray-500">万</span></p>
          </div>
        </div>

        <div className="space-y-2.5 mb-6">
          {product.features.slice(0, 3).map((feature, idx) => (
            <div key={idx} className="flex items-center text-[13px] text-gray-600 font-medium">
              <CheckCircle2 className="w-4 h-4 text-green-500 mr-2.5 shrink-0" />
              <span className="truncate">{feature}</span>
            </div>
          ))}
        </div>
      </div>
      
      <button className="mt-auto w-full py-3.5 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors text-[15px] flex items-center justify-center gap-2 group-hover:gap-3">
        <span>详情 & 计算</span>
        <ArrowRight size={16} className="transition-all" />
      </button>
    </div>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ onSelectProduct }) => {
  return (
    <div className="h-full overflow-y-auto p-6 md:p-10 bg-gray-50/50">
      <div className="mb-8 md:mb-10 animate-fade-in">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">为您推荐</h1>
        <p className="text-base text-gray-500 mt-2 font-medium">根据您的资质定制的金融方案</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6 pb-24 lg:pb-8 animate-fade-in" style={{animationDelay: '0.1s'}}>
        {LOAN_PRODUCTS.map((product) => (
          <ProductCard key={product.id} product={product} onSelect={onSelectProduct} />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;