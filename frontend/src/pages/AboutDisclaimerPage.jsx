import React from 'react';
import { ShieldAlert, BookOpen, Lock, Server, Cpu, Heart, CheckCircle2 } from 'lucide-react';
import DisclaimerBanner from '../components/DisclaimerBanner';
import api from '../services/api';

export default function AboutDisclaimerPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <DisclaimerBanner />

      <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            About the Project & Medical Disclaimer
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Educational objectives, system architecture, clinical limitations, and privacy safeguards.
          </p>
        </div>
        <button
          onClick={() => window.open(api.downloadUserGuideUrl(), '_blank')}
          className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs shrink-0"
        >
          <BookOpen className="w-4 h-4" />
          <span>Download User Guide PDF</span>
        </button>
      </div>

      {/* Prominent Disclaimer Card */}
      <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 text-rose-950 space-y-3">
        <div className="flex items-center gap-2 font-bold text-sm text-rose-900">
          <ShieldAlert className="w-5 h-5 text-rose-700" />
          MANDATORY MEDICAL & EDUCATIONAL DISCLAIMER
        </div>
        <p className="text-xs leading-relaxed">
          The software application titled <strong>Early Disease Risk Prediction Using Explainable Machine Learning</strong> is engineered strictly for academic study, computational research, and demonstration of interpretable artificial intelligence algorithms.
        </p>
        <ul className="text-xs space-y-1.5 list-disc pl-5">
          <li>
            <strong>Non-Diagnostic:</strong> This software does not provide medical diagnosis, therapeutic recommendations, or professional clinical opinions.
          </li>
          <li>
            <strong>Illustrative Probabilities:</strong> Model scores represent statistical correlation metrics on historical retrospective cohorts, not absolute biological certainty or clinical prognosis.
          </li>
          <li>
            <strong>No Substitute for Healthcare Clinicians:</strong> Users must never modify medical treatments, medications, or health regimens based on outputs from this tool. Always consult a qualified physician or licensed healthcare provider for individualized medical evaluation.
          </li>
        </ul>
      </div>

      {/* Project Vision & Interpretable AI */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-3 text-xs text-slate-700 leading-relaxed">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-teal-700" />
          The Motivation for Explainable AI (XAI) in Medicine
        </h3>
        <p>
          Traditional machine learning algorithms frequently act as opaque "black boxes," issuing risk percentages without clarifying the underlying clinical signals that triggered the classification. In healthcare, this opacity impedes clinical trust, prevents validation against established physiology, and hides potential data biases.
        </p>
        <p>
          By pairing high-performance gradient boosted decision trees (<strong>XGBoost</strong>) with cooperative game-theoretic feature attribution (<strong>SHAP TreeExplainer</strong>), this application demonstrates how machine learning models can offer full algorithmic transparency—revealing exactly which physiological measurements elevated or mitigated risk relative to a baseline population.
        </p>
      </div>

      {/* Technical Architecture */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-2">
          <div className="p-2 rounded-lg bg-teal-50 text-teal-700 w-fit">
            <Server className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-slate-900">Backend & Pipelines</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            FastAPI with Pydantic schema validation, Scikit-learn leakage-free column transformers, XGBoost classification, and SQLite persistence.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-2">
          <div className="p-2 rounded-lg bg-sky-50 text-sky-700 w-fit">
            <Cpu className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-slate-900">Explainable AI & Local LLM</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Exact SHAP TreeExplainer attribution with local Ollama <code>llama3.2:latest</code> integration and robust offline fallback engines.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-2">
          <div className="p-2 rounded-lg bg-purple-50 text-purple-700 w-fit">
            <Lock className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-slate-900">Privacy & Security</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Strict local data processing, zero third-party cloud LLM transmissions, no personal identifiers recorded, and parameterized SQL queries.
          </p>
        </div>
      </div>

      {/* Academic Citations */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-2 text-xs text-slate-600">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider text-slate-500">
          Research Cohort References
        </h4>
        <ol className="list-decimal pl-5 space-y-1.5 font-mono text-[11px]">
          <li>
            Smith, J.W., et al. (1988). <em>Using the ADAP Learning Algorithm to Forecast the Onset of Diabetes Mellitus.</em> Pima Indians Diabetes Database.
          </li>
          <li>
            Detrano, R., et al. (1989). <em>International application of a new probability algorithm for the diagnosis of coronary artery disease.</em> American Journal of Cardiology.
          </li>
          <li>
            Rubini, L., et al. (2015). <em>Chronic_Kidney_Disease Data Set.</em> UCI Machine Learning Repository. Apollo Hospitals, Tamil Nadu.
          </li>
          <li>
            Lundberg, S. M., & Lee, S. I. (2017). <em>A Unified Approach to Interpreting Model Predictions.</em> Advances in Neural Information Processing Systems (NeurIPS).
          </li>
        </ol>
      </div>
    </div>
  );
}
