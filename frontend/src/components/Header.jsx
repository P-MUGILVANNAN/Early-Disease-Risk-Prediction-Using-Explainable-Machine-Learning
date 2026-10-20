import React from 'react';
import { Activity, Cpu, Database, Stethoscope, Menu, BookOpen } from 'lucide-react';
import api from '../services/api';

export default function Header({ ollamaStatus, backendHealth, onSelectPage, onToggleMobileMenu }) {
  const isOllamaOnline = ollamaStatus?.connected && ollamaStatus?.model_available;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-6 py-3 flex items-center justify-between gap-2">
      {/* Left side: Hamburger button + Title */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="w-8 h-8 rounded-lg bg-teal-700 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
          <Activity className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight leading-none">
            Early Disease Risk Prediction
          </h1>
          <p className="hidden sm:block text-[11px] text-slate-500 font-medium mt-0.5">
            Explainable Machine Learning • XGBoost & SHAP Healthcare Analytics
          </p>
        </div>
      </div>

      {/* Right side: Badges & Action */}
      <div className="flex items-center gap-2 sm:gap-2.5 text-xs">
        {/* API Status badge (hidden on very small mobile to save space) */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-slate-700">
          <Database className="w-3.5 h-3.5 text-slate-500" />
          <span>API:</span>
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
          <span className="font-medium text-emerald-700">Online</span>
        </div>

        {/* Ollama Status Badge */}
        <div
          title={ollamaStatus?.message || 'Local LLM Status'}
          className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-md border text-[11px] sm:text-xs ${
            isOllamaOnline
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-slate-50 border-slate-200 text-slate-600'
          }`}
        >
          <Cpu className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden sm:inline">Ollama:</span>
          <span
            className={`inline-block w-2 h-2 rounded-full ${
              isOllamaOnline ? 'bg-emerald-500' : 'bg-slate-400'
            }`}
          />
          <span className="font-semibold">{isOllamaOnline ? 'llama3.2' : 'Offline'}</span>
        </div>

        {/* User Guide PDF Button */}
        <button
          onClick={() => window.open(api.downloadUserGuideUrl(), '_blank')}
          className="hidden md:flex px-2.5 sm:px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors items-center gap-1.5 shadow-2xs text-xs shrink-0 border border-slate-300"
          title="Download Comprehensive Application User Guide & Workout Manual PDF"
        >
          <BookOpen className="w-3.5 h-3.5 text-teal-700" />
          <span>User Guide PDF</span>
        </button>

        {/* Quick Assessment Button */}
        <button
          onClick={() => onSelectPage('disease_selection')}
          className="px-2.5 sm:px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white font-medium rounded-lg transition-colors flex items-center gap-1.5 shadow-xs text-xs shrink-0"
        >
          <Stethoscope className="w-3.5 h-3.5" />
          <span className="hidden xs:inline sm:inline">New Assessment</span>
        </button>
      </div>
    </header>
  );
}
