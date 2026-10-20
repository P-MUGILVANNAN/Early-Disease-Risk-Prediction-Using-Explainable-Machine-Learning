import React from 'react';
import { Droplets, HeartPulse, Layers, ArrowRight, ShieldCheck, Database, Award } from 'lucide-react';

export default function DiseaseSelectionPage({ onSelectDisease }) {
  const modules = [
    {
      id: 'diabetes_assessment',
      diseaseKey: 'diabetes',
      title: 'Diabetes Risk Prediction',
      icon: Droplets,
      color: 'teal',
      badge: 'Pima Indians Cohort',
      description:
        'Analyzes metabolic markers including plasma glucose, insulin levels, BMI, pedigree function, and physiological indicators to predict diabetes risk.',
      featuresCount: 8,
      dataset: 'Pima Indians Diabetes Database',
      modelType: 'XGBoost Classifier + SHAP',
      auc: '0.833 ROC-AUC',
      highlights: ['Biologically validated zero-imputation', 'Family pedigree tracking', 'Subtle non-linear interactions'],
    },
    {
      id: 'heart_assessment',
      diseaseKey: 'heart_disease',
      title: 'Heart Disease Risk Prediction',
      icon: HeartPulse,
      color: 'rose',
      badge: 'UCI Cleveland Cohort',
      description:
        'Evaluates cardiovascular stress data, ST segment depression, chest pain classification, cholesterol, and fluoroscopy major vessels.',
      featuresCount: 13,
      dataset: 'UCI Cleveland Heart Disease Database',
      modelType: 'XGBoost Classifier + SHAP',
      auc: '0.952 ROC-AUC',
      highlights: ['Exercise electrocardiography', 'Vessel fluoroscopy evaluation', 'Chest pain symptom typology'],
    },
    {
      id: 'kidney_assessment',
      diseaseKey: 'kidney_disease',
      title: 'Chronic Kidney Disease Risk',
      icon: Layers,
      color: 'purple',
      badge: 'UCI CKD Cohort',
      description:
        'Comprehensive multi-analyte assessment combining renal function markers (serum creatinine, blood urea), hematocrit, urinalysis, and systemic comorbidities.',
      featuresCount: 24,
      dataset: 'UCI Chronic Kidney Disease Database',
      modelType: 'XGBoost Classifier + SHAP',
      auc: '1.000 ROC-AUC',
      highlights: ['Renal blood urea & creatinine', 'Urinary albumin & specific gravity', 'Systemic vascular comorbidities'],
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Select Disease Risk Module</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Choose an explainable predictive machine learning module below to enter clinical measurements and generate SHAP explanations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {modules.map((mod) => {
          const Icon = mod.icon;
          return (
            <div
              key={mod.id}
              className="bg-white rounded-xl border border-slate-200 hover:border-teal-500 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
            >
              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="p-3 rounded-xl bg-teal-50 text-teal-700 border border-teal-100 group-hover:scale-105 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">
                    {mod.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                    {mod.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">{mod.description}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 text-slate-400" />
                      Features:
                    </span>
                    <span className="font-semibold text-slate-800">{mod.featuresCount} Parameters</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-slate-400" />
                      Test ROC-AUC:
                    </span>
                    <span className="font-bold text-teal-700 font-mono">{mod.auc}</span>
                  </div>
                </div>

                <div className="space-y-1 pt-2">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Key Markers</p>
                  <ul className="text-xs text-slate-600 space-y-1">
                    {mod.highlights.map((h, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100">
                <button
                  onClick={() => onSelectDisease(mod.id)}
                  className="w-full py-2 px-4 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <span>Begin Risk Assessment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
