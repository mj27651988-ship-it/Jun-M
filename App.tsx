import React, { useState } from 'react';
import { NAV_ITEMS } from './constants';
import { ViewState, LoanProduct } from './types';
import Dashboard from './components/Dashboard';
import LoanCalculator from './components/LoanCalculator';
import ComparisonTool from './components/ComparisonTool';
import AIAssistant from './components/AIAssistant';
import QualificationCheck from './components/QualificationCheck';
import { LayoutGrid, Calculator, Scale, Bot, Bell, Search, FileCheck } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [selectedProductForCalc, setSelectedProductForCalc] = useState<LoanProduct | undefined>(undefined);

  const handleProductSelect = (product: LoanProduct) => {
    setSelectedProductForCalc(product);
    setCurrentView('calculator');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onSelectProduct={handleProductSelect} />;
      case 'qualification':
        return <QualificationCheck />;
      case 'calculator':
        return <LoanCalculator initialProduct={selectedProductForCalc} />;
      case 'compare':
        return <ComparisonTool />;
      case 'ai-assistant':
        return <AIAssistant />;
      default:
        return <Dashboard onSelectProduct={handleProductSelect} />;
    }
  };

  const getIcon = (iconName: string, size: number = 20) => {
    switch (iconName) {
      case 'LayoutGrid': return <LayoutGrid size={size} strokeWidth={2} />;
      case 'Calculator': return <Calculator size={size} strokeWidth={2} />;
      case 'Scale': return <Scale size={size} strokeWidth={2} />;
      case 'Bot': return <Bot size={size} strokeWidth={2} />;
      case 'FileCheck': return <FileCheck size={size} strokeWidth={2} />;
      default: return <LayoutGrid size={size} strokeWidth={2} />;
    }
  };

  return (
    <div className="flex h-screen bg-[#F5F5F7] font-sans text-slate-900 flex-col lg:flex-row overflow-hidden">
      
      {/* Mobile Top Header - iOS Blur Style */}
      <div className="lg:hidden h-[50px] bg-white/80 backdrop-blur-md flex items-center px-4 shrink-0 justify-between border-b border-black/5 z-30 sticky top-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-lg tracking-tight text-gray-900">BankPro</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" className="w-full h-full" />
        </div>
      </div>

      {/* Sidebar Navigation - iPadOS/macOS Style */}
      <aside className="hidden lg:flex w-[260px] bg-[#F9F9FB]/80 backdrop-blur-2xl flex-col shrink-0 border-r border-black/5 z-20">
        <div className="h-16 flex items-center px-6 mt-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/30 shrink-0">
            B
          </div>
          <span className="ml-3 font-semibold text-xl tracking-tight text-gray-900">BankPro</span>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-1">
          <div className="text-xs font-medium text-gray-400 px-3 mb-2 uppercase tracking-wider">Menu</div>
          {NAV_ITEMS.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id as ViewState)}
                className={`w-full flex items-center justify-start px-3 py-2.5 rounded-xl transition-all duration-200 group
                  ${isActive 
                    ? 'bg-white text-blue-600 shadow-apple-sm font-medium' 
                    : 'text-gray-500 hover:bg-black/5 hover:text-gray-900'}`}
              >
                <div className={`${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'} transition-colors duration-200`}>
                  {getIcon(item.icon)}
                </div>
                <span className="ml-3 text-[15px]">{item.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="p-4 mx-4 mb-4 bg-white rounded-2xl shadow-apple-sm border border-black/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden border border-gray-100">
               <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">马军</p>
              <p className="text-xs text-gray-500 truncate">18640348070</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative bg-[#F5F5F7]">
        {/* Desktop Header - Transparent/Minimal */}
        <header className="hidden lg:flex h-16 items-center justify-between px-8 z-10">
          <div className="flex items-center text-gray-400 text-sm font-medium">
             <div className="flex items-center gap-2 px-3 py-1.5 bg-white/60 backdrop-blur rounded-lg border border-black/5 shadow-sm">
                <Search size={14} />
                <span className="opacity-50">Search...</span>
             </div>
          </div>
          <div className="flex items-center gap-4">
             <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors relative">
               <Bell size={20} strokeWidth={2} />
               <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
             </button>
          </div>
        </header>

        {/* Content View - Card-like container on larger screens */}
        <div className="flex-1 overflow-hidden relative w-full lg:px-8 lg:pb-8">
           <div className="w-full h-full lg:bg-white lg:rounded-[32px] lg:shadow-apple-lg lg:border lg:border-black/5 overflow-hidden relative">
             {renderContent()}
           </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation - iOS Blur Style */}
      <nav className="lg:hidden bg-white/80 backdrop-blur-xl border-t border-gray-200/50 flex justify-around items-center h-[84px] shrink-0 pb-6 z-30 fixed bottom-0 w-full">
        {NAV_ITEMS.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id as ViewState)}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors
                ${isActive ? 'text-blue-600' : 'text-gray-400'}`}
            >
              {getIcon(item.icon, 24)}
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
      {/* Spacer for mobile bottom nav */}
      <div className="lg:hidden h-[84px] shrink-0"></div>
    </div>
  );
};

export default App;