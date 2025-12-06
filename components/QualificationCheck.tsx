import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertTriangle, Loader2, FileCheck, X, Briefcase, User, Wallet, Building, HelpCircle } from 'lucide-react';
import { evaluateQualification, FileData } from '../services/geminiService';
import { LOAN_PRODUCTS } from '../constants';
import { CustomerProfile, LoanProduct } from '../types';

const QualificationCheck: React.FC = () => {
  // Form State
  const [selectedProductId, setSelectedProductId] = useState<string>(LOAN_PRODUCTS[0].id);
  const [profile, setProfile] = useState<CustomerProfile>({
    age: 30,
    occupation: '',
    annualIncome: 0,
    loanAmount: 0,
    loanPurpose: '',
    housingStatus: '自有无贷',
    overdueHistory: '无逾期'
  });

  // File State
  const [creditFiles, setCreditFiles] = useState<File[]>([]);
  const [bankFiles, setBankFiles] = useState<File[]>([]);
  
  // UI State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  
  const creditInputRef = useRef<HTMLInputElement>(null);
  const bankInputRef = useRef<HTMLInputElement>(null);

  const selectedProduct = LOAN_PRODUCTS.find(p => p.id === selectedProductId) || null;

  const handleInputChange = (field: keyof CustomerProfile, value: string | number) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'credit' | 'bank') => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      if (type === 'credit') {
        setCreditFiles(prev => [...prev, ...newFiles]);
      } else {
        setBankFiles(prev => [...prev, ...newFiles]);
      }
    }
  };

  const removeFile = (index: number, type: 'credit' | 'bank') => {
    if (type === 'credit') {
      setCreditFiles(prev => prev.filter((_, i) => i !== index));
    } else {
      setBankFiles(prev => prev.filter((_, i) => i !== index));
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data:image/jpeg;base64, prefix
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setResult(null);

    try {
      const allFiles = [...creditFiles, ...bankFiles];
      const payload: FileData[] = [];

      for (const file of allFiles) {
        if (file.type.startsWith('image/')) {
          const base64 = await fileToBase64(file);
          payload.push({
            inlineData: {
              mimeType: file.type,
              data: base64
            }
          });
        }
      }

      const analysis = await evaluateQualification(payload, profile, selectedProduct);
      setResult(analysis);
    } catch (error) {
      console.error(error);
      setResult("分析过程中发生错误，请重试。");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-6 md:p-10 overflow-y-auto bg-[#F5F5F7]">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">智能准入评估</h2>
        <p className="text-base text-gray-500 mt-2 font-medium">完善客户信息并上传征信/流水，系统基于产品规则自动判定</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Left Column: Form Inputs (5/12 width) */}
        <div className="xl:col-span-5 space-y-6">
          
          {/* Product Selection Card */}
          <div className="bg-white rounded-[24px] p-6 shadow-apple-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Briefcase size={20} className="text-blue-600" />
              意向产品
            </h3>
            <div className="relative">
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 text-gray-900 font-medium appearance-none outline-none"
              >
                {LOAN_PRODUCTS.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
            </div>
            {selectedProduct && (
              <div className="mt-4 p-4 bg-blue-50 rounded-2xl text-sm text-blue-800 leading-relaxed">
                <span className="font-semibold block mb-1">准入提示：</span>
                {selectedProduct.description}
              </div>
            )}
          </div>

          {/* Customer Profile Form */}
          <div className="bg-white rounded-[24px] p-6 shadow-apple-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <User size={20} className="text-blue-600" />
              客户基本信息
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase">年龄 (周岁)</label>
                  <input 
                    type="number" 
                    value={profile.age}
                    onChange={(e) => handleInputChange('age', Number(e.target.value))}
                    className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500/20 outline-none font-medium" 
                  />
                </div>
                <div>
                   <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase">职业/经营主体</label>
                   <input 
                    type="text" 
                    value={profile.occupation}
                    onChange={(e) => handleInputChange('occupation', e.target.value)}
                    placeholder="公务员/个体户/法人"
                    className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500/20 outline-none font-medium" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase">年收入 (元)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={profile.annualIncome}
                    onChange={(e) => handleInputChange('annualIncome', Number(e.target.value))}
                    className="w-full p-3 pl-10 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500/20 outline-none font-medium" 
                  />
                  <Wallet size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase">拟申请金额 (元)</label>
                    <input 
                      type="number" 
                      value={profile.loanAmount}
                      onChange={(e) => handleInputChange('loanAmount', Number(e.target.value))}
                      className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500/20 outline-none font-medium text-blue-600" 
                    />
                 </div>
                 <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase">住房情况</label>
                    <select
                      value={profile.housingStatus}
                      onChange={(e) => handleInputChange('housingStatus', e.target.value)}
                      className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500/20 outline-none font-medium appearance-none"
                    >
                      <option value="自有无贷">自有无贷</option>
                      <option value="自有按揭">自有按揭</option>
                      <option value="租赁">租赁</option>
                      <option value="与父母同住">与父母同住</option>
                    </select>
                 </div>
              </div>

               <div>
                 <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase">贷款用途</label>
                 <input 
                  type="text" 
                  value={profile.loanPurpose}
                  onChange={(e) => handleInputChange('loanPurpose', e.target.value)}
                  placeholder="如：房屋装修、日常消费、企业经营周转"
                  className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500/20 outline-none font-medium" 
                />
              </div>

               <div>
                 <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase flex items-center gap-1">
                   自述征信情况 <HelpCircle size={12} />
                 </label>
                 <textarea 
                  value={profile.overdueHistory}
                  onChange={(e) => handleInputChange('overdueHistory', e.target.value)}
                  placeholder="例如：无逾期；或2年前有一次逾期已结清"
                  className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500/20 outline-none font-medium min-h-[80px]" 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Uploads & Results (7/12 width) */}
        <div className="xl:col-span-7 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Credit Report Upload */}
            <div className="bg-white rounded-[24px] p-6 shadow-apple-sm border border-gray-100 flex flex-col h-full">
               <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 flex items-center gap-2 text-sm">
                  <FileText className="text-gray-500" size={18} />
                  征信报告
                </h3>
              </div>
              <div 
                onClick={() => creditInputRef.current?.click()}
                className="flex-1 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center p-6 cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all min-h-[140px] group relative overflow-hidden"
              >
                 <input type="file" ref={creditInputRef} className="hidden" accept="image/*" multiple onChange={(e) => handleFileSelect(e, 'credit')} />
                 <Upload className="text-gray-300 group-hover:text-blue-500 mb-2 transition-colors" size={24} />
                 <p className="text-xs text-gray-400 font-medium">点击上传图片</p>
                 
                 {creditFiles.length > 0 && (
                   <div className="absolute top-2 right-2 bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                     {creditFiles.length}
                   </div>
                 )}
              </div>
               {creditFiles.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {creditFiles.map((f, i) => (
                      <span key={i} className="inline-flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-[10px] text-gray-600">
                        {f.name.slice(0, 10)}... <X size={10} className="cursor-pointer hover:text-red-500" onClick={(e) => {e.stopPropagation(); removeFile(i, 'credit')}} />
                      </span>
                    ))}
                  </div>
               )}
            </div>

            {/* Bank Statement Upload */}
            <div className="bg-white rounded-[24px] p-6 shadow-apple-sm border border-gray-100 flex flex-col h-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 flex items-center gap-2 text-sm">
                  <FileCheck className="text-gray-500" size={18} />
                  银行流水
                </h3>
              </div>
              <div 
                onClick={() => bankInputRef.current?.click()}
                className="flex-1 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center p-6 cursor-pointer hover:border-green-400 hover:bg-green-50/30 transition-all min-h-[140px] group relative overflow-hidden"
              >
                 <input type="file" ref={bankInputRef} className="hidden" accept="image/*" multiple onChange={(e) => handleFileSelect(e, 'bank')} />
                 <Upload className="text-gray-300 group-hover:text-green-500 mb-2 transition-colors" size={24} />
                 <p className="text-xs text-gray-400 font-medium">点击上传图片</p>

                 {bankFiles.length > 0 && (
                   <div className="absolute top-2 right-2 bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                     {bankFiles.length}
                   </div>
                 )}
              </div>
               {bankFiles.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {bankFiles.map((f, i) => (
                      <span key={i} className="inline-flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-[10px] text-gray-600">
                        {f.name.slice(0, 10)}... <X size={10} className="cursor-pointer hover:text-red-500" onClick={(e) => {e.stopPropagation(); removeFile(i, 'bank')}} />
                      </span>
                    ))}
                  </div>
               )}
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold text-base hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-gray-900/20 active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                正在进行全维智能风控分析...
              </>
            ) : (
              <>
                <Building size={20} />
                开始准入评估
              </>
            )}
          </button>

          {/* Result Card */}
          {result && (
             <div className="bg-white rounded-[24px] p-8 shadow-float border border-white/50 animate-fade-in ring-1 ring-black/5">
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${result.includes('建议通过') ? 'bg-green-500 shadow-green-500/30' : 'bg-orange-500 shadow-orange-500/30'}`}>
                    {result.includes('建议通过') ? <CheckCircle size={24} strokeWidth={2.5} /> : <AlertTriangle size={24} strokeWidth={2.5} />}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">准入预审报告</h3>
                    <p className="text-sm text-gray-500 font-medium">产品：{selectedProduct?.name}</p>
                  </div>
                </div>
                
                <div className="prose prose-sm md:prose-base max-w-none text-gray-600 leading-relaxed">
                  {result.split('\n').map((line, i) => {
                    const parts = line.split('**');
                    return (
                      <p key={i} className={`mb-2 ${line.trim().startsWith('-') ? 'pl-4' : ''}`}>
                        {parts.map((part, index) => 
                          index % 2 === 1 ? <strong key={index} className="text-gray-900 font-bold">{part}</strong> : part
                        )}
                      </p>
                    );
                  })}
                </div>
                
                <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-100 text-xs text-gray-400 text-center">
                  * 本报告由 AI 基于客户提供资料及银行产品大纲生成，仅供参考。最终审批结果以银行信贷系统为准。
                </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QualificationCheck;