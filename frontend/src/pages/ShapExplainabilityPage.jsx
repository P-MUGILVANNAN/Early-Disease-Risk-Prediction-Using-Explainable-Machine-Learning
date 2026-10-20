import React, { useEffect, useState } from 'react';
import { Sparkles, BarChart2, Info, BookOpen, Layers, CheckCircle } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import api from '../services/api';
import DisclaimerBanner from '../components/DisclaimerBanner';

export default function ShapExplainabilityPage({ activePrediction }) {
  const [selectedDisease, setSelectedDisease] = useState(activePrediction?.disease || 'diabetes');
  const [importanceData, setImportanceData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeatureImportance(selectedDisease);
  }, [selectedDisease]);

  const fetchFeatureImportance = async (disease) => {
    setLoading(true);
    try {
      const resp = await api.getGlobalFeatureImportance(disease);
      setImportanceData(resp.data?.features || []);
    } catch (err) {
      console.error('Error fetching SHAP importance:', err);
    } finally {
      setLoading(false);
    }
  };

  const chartData = [...importanceData]
    .sort((a, b) => b.mean_abs_shap - a.mean_abs_shap)
    .slice(0, 10)
    .map((item) => ({
      name: item.display_name.split('(')[0].trim(),
      importance: item.mean_abs_shap,
      desc: item.description,
    }))
    .reverse();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <DisclaimerBanner />

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-teal-600" />
            Explainable AI (SHAP) Analytics
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Interpreting model predictions using game-theoretic Shapley Additive exPlanations (TreeExplainer).
          </p>
        </div>

        {/* Disease Module Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
          {[
            { id: 'diabetes', label: 'Diabetes' },
            { id: 'heart_disease', label: 'Heart Disease' },
            { id: 'kidney_disease', label: 'Kidney Disease' },
          ].map((d) => (
            <button
              key={d.id}
              onClick={() => setSelectedDisease(d.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                selectedDisease === d.id
                  ? 'bg-white text-teal-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Global Feature Importance Chart */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Global Feature Importance (Mean |SHAP Value|)
            </h3>
            <p className="text-xs text-slate-500">
              Average impact on model decision output across the held-out research test cohort.
            </p>
          </div>
          <span className="text-[11px] font-mono px-2.5 py-1 bg-teal-50 text-teal-800 rounded font-semibold">
            {selectedDisease.replace('_', ' ').toUpperCase()}
          </span>
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center text-xs text-slate-400 animate-pulse">
            Loading SHAP global importance matrix...
          </div>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 15, left: 75, bottom: 5 }}>
                <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#0f172a', fontWeight: 500 }} axisLine={false} tickLine={false} width={80} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                  formatter={(val) => [`${val.toFixed(5)}`, 'Mean |SHAP| Impact']}
                />
                <Bar dataKey="importance" fill="#0f766e" radius={[0, 4, 4, 0]}>
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill="#0f766e" opacity={0.75 + (index / chartData.length) * 0.25} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Global Importance Feature Breakdown Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">Feature Attribution Breakdown</h3>
          <p className="text-xs text-slate-500">Detailed variable dictionary and statistical influence</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">Rank</th>
                <th className="py-2.5 px-4">Feature Name</th>
                <th className="py-2.5 px-4">Variable Identifier</th>
                <th className="py-2.5 px-4">Mean |SHAP| Score</th>
                <th className="py-2.5 px-4">Clinical Interpretation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {importanceData.map((f, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono font-bold text-slate-400">#{i + 1}</td>
                  <td className="py-3 px-4 font-semibold text-slate-900">{f.display_name}</td>
                  <td className="py-3 px-4 font-mono text-slate-500">{f.feature}</td>
                  <td className="py-3 px-4 font-mono font-bold text-teal-700">{f.mean_abs_shap.toFixed(5)}</td>
                  <td className="py-3 px-4 text-slate-600 max-w-sm">{f.description || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Educational Guide on Explainable AI in Medicine */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-2">
          <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider text-teal-800">
            <BookOpen className="w-4 h-4 text-teal-600" />
            How TreeExplainer SHAP Works
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            SHAP (SHapley Additive exPlanations) connects cooperative game theory with optimal credit allocation. In tree ensembles like XGBoost, TreeExplainer computes the exact marginal contribution of each clinical feature across all possible decision path permutations.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-2">
          <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider text-amber-800">
            <Info className="w-4 h-4 text-amber-600" />
            Correlation vs Biological Causation
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            A high positive SHAP score proves that the tree ensemble relies heavily on that feature to split leaves in the training cohort. It does <strong>not</strong> necessarily establish clinical causality. Features may serve as proxies for unmeasured biological processes.
          </p>
        </div>
      </div>
    </div>
  );
}
