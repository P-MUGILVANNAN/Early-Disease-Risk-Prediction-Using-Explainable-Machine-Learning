import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  Award,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  Layers,
  Activity,
  ShieldCheck,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import api from '../services/api';
import DisclaimerBanner from '../components/DisclaimerBanner';

export default function ModelPerformancePage() {
  const [selectedDisease, setSelectedDisease] = useState('diabetes');
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics(selectedDisease);
  }, [selectedDisease]);

  const fetchMetrics = async (disease) => {
    setLoading(true);
    try {
      const resp = await api.getModelMetrics(disease);
      setMetrics(resp.data);
    } catch (err) {
      console.error('Error fetching metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/4" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-slate-200 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const cm = metrics?.confusion_matrix || { tp: 0, fp: 0, tn: 0, fn: 0 };
  const total = cm.tp + cm.fp + cm.tn + cm.fn || 1;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <DisclaimerBanner />

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-teal-600" />
            Model Evaluation & Clinical Validation
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Test-set performance evaluation, calibration assessments, ROC/PR curves, and baseline model benchmarks.
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

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-medium text-slate-500">ROC-AUC Score</p>
          <p className="text-2xl font-bold text-teal-800 mt-1 font-mono">
            {metrics?.roc_auc?.toFixed(4) || '0.0000'}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Discriminative capability</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-medium text-slate-500">Recall / Sensitivity</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1 font-mono">
            {metrics?.recall ? `${(metrics.recall * 100).toFixed(1)}%` : '0.0%'}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">True Positive rate (critical in healthcare)</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-medium text-slate-500">Specificity</p>
          <p className="text-2xl font-bold text-sky-700 mt-1 font-mono">
            {metrics?.specificity ? `${(metrics.specificity * 100).toFixed(1)}%` : '0.0%'}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">True Negative identification rate</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-medium text-slate-500">Brier Calibration Score</p>
          <p className="text-2xl font-bold text-amber-700 mt-1 font-mono">
            {metrics?.brier_score?.toFixed(4) || '0.0000'}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Lower is better (0 = perfect calibration)</p>
        </div>
      </div>

      {/* Secondary Metrics Row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">Test Accuracy:</span>
          <span className="font-bold font-mono text-slate-800">{((metrics?.accuracy || 0) * 100).toFixed(1)}%</span>
        </div>
        <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">Precision (PPV):</span>
          <span className="font-bold font-mono text-slate-800">{((metrics?.precision || 0) * 100).toFixed(1)}%</span>
        </div>
        <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">F1-Harmonic Mean:</span>
          <span className="font-bold font-mono text-slate-800">{metrics?.f1_score?.toFixed(4)}</span>
        </div>
      </div>

      {/* Curves & Confusion Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ROC Curve Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Receiver Operating Characteristic (ROC)</h3>
            <span className="text-xs font-mono font-bold text-teal-700">
              AUC: {metrics?.roc_auc?.toFixed(4)}
            </span>
          </div>
          <p className="text-[11px] text-slate-500">True Positive Rate vs False Positive Rate across thresholds</p>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics?.roc_curve || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="fpr" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="tpr" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} domain={[0, 1]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                  formatter={(val, name) => [`${Number(val).toFixed(3)}`, name === 'tpr' ? 'Sensitivity (TPR)' : name]}
                />
                <ReferenceLine x={0} stroke="#e2e8f0" />
                <Line type="monotone" dataKey="tpr" stroke="#0f766e" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Confusion Matrix */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900">Confusion Matrix (Held-out Test Cohort)</h3>
          <p className="text-[11px] text-slate-500">Cross-tabulation of ground truth versus predicted classifications</p>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                True Negatives (TN)
              </span>
              <span className="text-3xl font-extrabold text-emerald-900 font-mono mt-1 block">
                {cm.tn}
              </span>
              <span className="text-[10px] text-emerald-700 mt-1 block">
                {((cm.tn / total) * 100).toFixed(1)}% correctly identified negative
              </span>
            </div>

            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-center">
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
                False Positives (FP)
              </span>
              <span className="text-3xl font-extrabold text-amber-900 font-mono mt-1 block">
                {cm.fp}
              </span>
              <span className="text-[10px] text-amber-700 mt-1 block">
                Type I Error (false alarm)
              </span>
            </div>

            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-center">
              <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider block">
                False Negatives (FN)
              </span>
              <span className="text-3xl font-extrabold text-rose-900 font-mono mt-1 block">
                {cm.fn}
              </span>
              <span className="text-[10px] text-rose-700 mt-1 block">
                Type II Error (critical miss)
              </span>
            </div>

            <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 text-center">
              <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wider block">
                True Positives (TP)
              </span>
              <span className="text-3xl font-extrabold text-teal-900 font-mono mt-1 block">
                {cm.tp}
              </span>
              <span className="text-[10px] text-teal-700 mt-1 block">
                {((cm.tp / total) * 100).toFixed(1)}% correctly identified positive
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Baseline Models Comparison Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Baseline Model Benchmark Comparison</h3>
            <p className="text-xs text-slate-500">
              Evaluated under identical 5-fold stratified cross-validation and test partitioning.
            </p>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">Scikit-learn vs XGBoost</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">Classifier Architecture</th>
                <th className="py-2.5 px-4">Test Accuracy</th>
                <th className="py-2.5 px-4">Precision</th>
                <th className="py-2.5 px-4">Recall</th>
                <th className="py-2.5 px-4">F1-Score</th>
                <th className="py-2.5 px-4">Test ROC-AUC</th>
                <th className="py-2.5 px-4">5-Fold CV ROC-AUC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {metrics?.baseline_comparison?.map((m, i) => {
                const isProposed = m.model_name.includes('Proposed') || m.model_name.includes('XGBoost');
                return (
                  <tr key={i} className={isProposed ? 'bg-teal-50/50 font-semibold' : 'hover:bg-slate-50'}>
                    <td className="py-3 px-4 flex items-center gap-2">
                      {isProposed && <Award className="w-4 h-4 text-teal-700" />}
                      <span className={isProposed ? 'text-teal-900 font-bold' : 'text-slate-800'}>
                        {m.model_name}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono">{(m.accuracy * 100).toFixed(1)}%</td>
                    <td className="py-3 px-4 font-mono">{(m.precision * 100).toFixed(1)}%</td>
                    <td className="py-3 px-4 font-mono">{(m.recall * 100).toFixed(1)}%</td>
                    <td className="py-3 px-4 font-mono">{m.f1_score.toFixed(4)}</td>
                    <td className="py-3 px-4 font-mono font-bold text-teal-800">{m.roc_auc.toFixed(4)}</td>
                    <td className="py-3 px-4 font-mono text-slate-500">
                      {m.cv_roc_auc_mean?.toFixed(4)} ± {m.cv_roc_auc_std?.toFixed(3)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
