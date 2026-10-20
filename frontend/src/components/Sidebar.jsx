import React from 'react';
import {
  LayoutDashboard,
  Grid,
  HeartPulse,
  Droplets,
  Layers,
  FileCheck,
  Sparkles,
  BarChart3,
  History,
  Database,
  Bot,
  HelpCircle,
  X,
} from 'lucide-react';

export default function Sidebar({
  activePage,
  setActivePage,
  hasActivePrediction,
  isMobileOpen,
  setIsMobileOpen,
}) {
  const navSections = [
    {
      title: 'Analytics & Overview',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'disease_selection', label: 'Disease Modules', icon: Grid },
      ],
    },
    {
      title: 'Risk Assessments',
      items: [
        { id: 'diabetes_assessment', label: 'Diabetes Risk', icon: Droplets },
        { id: 'heart_assessment', label: 'Heart Disease Risk', icon: HeartPulse },
        { id: 'kidney_assessment', label: 'Kidney Disease Risk', icon: Layers },
      ],
    },
    {
      title: 'Evaluation & Explainability',
      items: [
        {
          id: 'prediction_results',
          label: 'Prediction Results',
          icon: FileCheck,
          disabled: !hasActivePrediction,
          badge: hasActivePrediction ? 'Active' : null,
        },
        { id: 'shap_explainability', label: 'SHAP Explainability', icon: Sparkles },
        { id: 'model_performance', label: 'Model Performance', icon: BarChart3 },
        { id: 'prediction_history', label: 'Assessment History', icon: History },
      ],
    },
    {
      title: 'Intelligence & Research',
      items: [
        { id: 'llm_assistant', label: 'LLM Explanation Assistant', icon: Bot, badge: 'llama3.2' },
        { id: 'dataset_info', label: 'Dataset Information', icon: Database },
        { id: 'about_disclaimer', label: 'About & Disclaimer', icon: HelpCircle },
      ],
    },
  ];

  const handleNavClick = (id) => {
    setActivePage(id);
    if (setIsMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 md:z-20 w-64 bg-slate-900 text-slate-300 flex flex-col h-screen shrink-0 select-none transition-transform duration-200 ease-in-out ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold">
              XAI
            </div>
            <div>
              <div className="text-sm font-bold text-white tracking-wide">Explainable ML</div>
              <div className="text-[10px] text-teal-400 font-medium">Healthcare Decision Support</div>
            </div>
          </div>
          {/* Close button on mobile */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden text-slate-400 hover:text-white p-1 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {navSections.map((sec) => (
            <div key={sec.title}>
              <div className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {sec.title}
              </div>
              <div className="space-y-1">
                {sec.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activePage === item.id;
                  const isDisabled = item.disabled;

                  return (
                    <button
                      key={item.id}
                      onClick={() => !isDisabled && handleNavClick(item.id)}
                      disabled={isDisabled}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-teal-600/90 text-white shadow-xs font-semibold'
                          : isDisabled
                          ? 'text-slate-600 cursor-not-allowed'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : 'bg-slate-800 text-teal-400 border border-slate-700'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-800 text-[11px] text-slate-400 bg-slate-950/40">
          <div className="flex items-center justify-between">
            <span>Platform Version</span>
            <span className="font-mono text-slate-300">v1.0.0</span>
          </div>
          <div className="mt-1 text-[10px] text-slate-400 leading-tight">
            Research Use Only • Non-Diagnostic
          </div>
        </div>
      </aside>
    </>
  );
}
