import React, { useEffect, useState } from 'react';
import { Database, FileCheck2, AlertCircle, CheckCircle, Info } from 'lucide-react';
import api from '../services/api';
import DisclaimerBanner from '../components/DisclaimerBanner';

export default function DatasetInformationPage() {
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDatasetsStatus();
  }, []);

  const fetchDatasetsStatus = async () => {
    setLoading(true);
    try {
      const resp = await api.getDatasetsStatus();
      setDatasets(resp.data || []);
    } catch (err) {
      console.error('Error fetching dataset status:', err);
    } finally {
      setLoading(false);
    }
  };

  const researchMeta = {
    diabetes: {
      cohort: 'Pima Indians Diabetes Cohort (NIDDK)',
      citation: 'National Institute of Diabetes and Digestive and Kidney Diseases (1990).',
      handling:
        'Documented handling: Values of 0.0 in physiological fields (Plasma Glucose, Blood Pressure, Skin Thickness, Insulin, and BMI) are biologically impossible in living patients. In our preprocessing pipeline, these invalid zeros are detected, converted to NaN, and imputed with training-only medians to prevent severe data leakage and distribution skew.',
    },
    heart_disease: {
      cohort: 'UCI Cleveland Cardiovascular Clinic',
      citation: 'Detrano, R., et al. (1989). International application of a new probability algorithm for the diagnosis of coronary artery disease.',
      handling:
        'Documented handling: Missing vessel counts (ca) and thallium scintigraphy (thal) represented by "?" in the UCI archive are converted to NaN. The target column ("num") is binarized (0 = absence of disease, 1-4 = presence of angiographic coronary disease) to train a sensitive calibrated risk classifier.',
    },
    kidney_disease: {
      cohort: 'UCI Chronic Kidney Disease Research Cohort',
      citation: 'Apollo Hospitals & Central University of Tamil Nadu (2015).',
      handling:
        'Documented handling: Whitespace anomalies (e.g. "\\tckd" vs "ckd", " yes" vs "yes") and tab separators in hematology columns are sanitized. Patient ID numbers are completely excluded. Missing numerical features are imputed using training medians and categoricals using mode imputation.',
    },
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <DisclaimerBanner />

      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Database className="w-5 h-5 text-teal-600" />
          Research Datasets & Data Preparation Pipeline
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Detailed cohort demographics, missing value handling, impossible measurement screening, and validation summaries.
        </p>
      </div>

      <div className="space-y-6">
        {datasets.map((d) => {
          const meta = researchMeta[d.disease] || {};
          return (
            <div key={d.disease} className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-teal-50 text-teal-700 border border-teal-100">
                    <FileCheck2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 capitalize">
                      {d.disease.replace('_', ' ')} Research Dataset
                    </h3>
                    <p className="text-xs text-slate-500 font-mono">{d.filename} • {meta.cohort}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    Validated & Partitioned
                  </span>
                </div>
              </div>

              <div className="p-5 space-y-4 text-xs">
                {/* Cohort Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-[11px] text-slate-500 block">Total Records</span>
                    <span className="text-lg font-bold text-slate-900 font-mono">{d.rows} Patients</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-[11px] text-slate-500 block">Total Dimensions</span>
                    <span className="text-lg font-bold text-slate-900 font-mono">{d.columns} Variables</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-[11px] text-slate-500 block">File Footprint</span>
                    <span className="text-lg font-bold text-slate-900 font-mono">{(d.size_bytes / 1024).toFixed(1)} KB</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-[11px] text-slate-500 block">Identified Missing / Invalids</span>
                    <span className="text-lg font-bold text-amber-700 font-mono">{d.missing_values_count} values</span>
                  </div>
                </div>

                {/* Target Distribution */}
                <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="font-semibold text-slate-700 block mb-1">Target Class Distribution:</span>
                  <div className="flex flex-wrap items-center gap-4 text-slate-600">
                    {Object.entries(d.target_distribution || {}).map(([cls, cnt]) => (
                      <span key={cls} className="font-mono">
                        Class <strong>{cls}</strong>: {cnt} cases ({((cnt / (d.rows || 1)) * 100).toFixed(1)}%)
                      </span>
                    ))}
                  </div>
                </div>

                {/* Cleaning & Biological Zero Strategy */}
                <div className="p-3.5 bg-teal-50/60 rounded-lg border border-teal-100 text-teal-950 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-teal-900">
                    <Info className="w-3.5 h-3.5 text-teal-700" />
                    Data Preprocessing & Leakage Prevention Strategy
                  </div>
                  <p className="leading-relaxed">{meta.handling}</p>
                </div>

                {/* Features List */}
                <div>
                  <span className="font-semibold text-slate-700 block mb-1.5">Registered Model Features:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {d.features?.map((f) => (
                      <span
                        key={f}
                        className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 rounded text-[11px] font-mono"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
