import React from 'react';
import {
  Download,
  Bot,
  AlertTriangle,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Info,
  Calendar,
  Layers,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';
import api from '../services/api';
import RiskBadge from '../components/RiskBadge';
import DisclaimerBanner from '../components/DisclaimerBanner';

export default function PredictionResultsPage({ result, onAskLlm, onStartNew }) {
  if (!result) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
        <h3 className="text-base font-bold text-slate-800">No Assessment Active</h3>
        <p className="text-xs text-slate-500 mt-1">Please select a disease module and complete an evaluation.</p>
        <button
          onClick={onStartNew}
          className="mt-4 px-4 py-2 bg-teal-700 text-white rounded-lg text-xs font-semibold"
        >
          Select Disease Module
        </button>
      </div>
    );
  }

  const {
    prediction_id,
    disease,
    disease_title,
    probability,
    risk_category,
    base_value,
    top_features,
    all_features,
    model_version,
    timestamp,
    educational_summary,
    limitations,
  } = result;

  const handleDownloadPdf = () => {
    if (!prediction_id) return;
    const url = api.downloadReportUrl(prediction_id);
    window.open(url, '_blank');
  };

  // Prepare SHAP chart data
  const chartData = (all_features || top_features || []).slice(0, 8).map((f) => ({
    name: f.display_name.split('(')[0].trim(),
    shap: f.shap_value,
    impact: f.impact,
    value: f.value,
  })).reverse();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <DisclaimerBanner />

      {/* Top Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 font-mono">
              Assessment #{prediction_id || 'DEMO'}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {timestamp}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">{disease_title}</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            XGBoost model version v{model_version} • Baseline risk score: {base_value}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            onClick={handleDownloadPdf}
            disabled={!prediction_id}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF Report</span>
          </button>

          <button
            onClick={() => onAskLlm(result)}
            className="px-4 py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Bot className="w-4 h-4 text-teal-700" />
            <span>Consult Ollama (llama3.2)</span>
          </button>
        </div>
      </div>

      {/* Risk Probability & Category Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Model-Estimated Probability</p>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-4xl font-extrabold text-teal-800 tracking-tight">
                {(probability * 100).toFixed(1)}%
              </span>
              <span className="text-xs font-medium text-slate-400">likelihood</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100">
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full ${
                  probability >= 0.65 ? 'bg-rose-500' : probability >= 0.35 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, probability * 100))}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>0% Lower</span>
              <span>35% Intermediate</span>
              <span>65% Higher</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Illustrative Risk Band</p>
            <div className="mt-3">
              <RiskBadge category={risk_category} />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-3 border-t border-slate-100 pt-3 leading-relaxed">
            Illustrative model-output classification based on calibrated research test thresholds. Not a clinical diagnosis.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Baseline Expectation Shift</p>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-bold text-slate-800">
                {(probability - 0.35) >= 0 ? '+' : ''}{((probability - 0.35) * 100).toFixed(1)}%
              </span>
              <span className="text-xs text-slate-400">from population mean</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-3 border-t border-slate-100 pt-3 leading-relaxed">
            Represents the net push across all positive and negative SHAP feature attributions combined.
          </p>
        </div>
      </div>

      {/* SHAP Explanation Waterfall Chart & Contributions */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Explainable AI (SHAP) Factor Attribution</h3>
            <p className="text-xs text-slate-500">
              Red bars shift estimated risk higher than average; green bars shift estimated risk lower.
            </p>
          </div>
          <span className="text-[11px] font-mono bg-slate-100 px-2.5 py-1 rounded text-slate-600">
            TreeExplainer (Log-Odds Shift)
          </span>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 15, left: 75, bottom: 5 }}>
              <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#0f172a', fontWeight: 500 }} axisLine={false} tickLine={false} width={80} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                formatter={(val, name, item) => [
                  `${val > 0 ? '+' : ''}${val.toFixed(4)} (Observed: ${item.payload.value})`,
                  'SHAP Contribution',
                ]}
              />
              <ReferenceLine x={0} stroke="#94a3b8" strokeDasharray="3 3" />
              <Bar dataKey="shap" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.shap >= 0 ? '#f43f5e' : '#10b981'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Influential Factors Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">Top 5 Influential Risk Factors</h3>
          <p className="text-xs text-slate-500">Highest magnitude mathematical contributors identified by SHAP</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">Rank</th>
                <th className="py-2.5 px-4">Clinical Parameter</th>
                <th className="py-2.5 px-4">Observed Value</th>
                <th className="py-2.5 px-4">Risk Direction</th>
                <th className="py-2.5 px-4">SHAP Value</th>
                <th className="py-2.5 px-4">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {top_features?.map((f, i) => {
                const isPos = f.shap_value > 0;
                return (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-slate-400">#{i + 1}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{f.display_name}</td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-800">{String(f.value)}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 font-semibold ${
                          isPos ? 'text-rose-700' : 'text-emerald-700'
                        }`}
                      >
                        {isPos ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                        {isPos ? 'Increases Risk' : 'Protective / Lowers'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">
                      {f.shap_value > 0 ? `+${f.shap_value}` : f.shap_value}
                    </td>
                    <td className="py-3 px-4 text-slate-500 max-w-xs">{f.description || '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Plain Language Educational Summary */}
      <div className="bg-teal-50/70 border border-teal-200/80 rounded-xl p-5 space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-teal-900 flex items-center gap-1.5">
          <Info className="w-4 h-4 text-teal-700" />
          Model Educational Interpretation
        </h3>
        <p className="text-xs text-teal-950 leading-relaxed">{educational_summary}</p>
      </div>

      {/* Model Limitations */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-2.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Documented Research Limitations
        </h3>
        <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-5">
          {limitations?.map((lim, i) => (
            <li key={i}>{lim}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
