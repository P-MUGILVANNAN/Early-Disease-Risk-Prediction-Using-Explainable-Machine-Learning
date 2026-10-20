import React, { useEffect, useState } from 'react';
import { History, Search, Filter, Download, FileText, Calendar, CheckCircle } from 'lucide-react';
import api from '../services/api';
import RiskBadge from '../components/RiskBadge';
import DisclaimerBanner from '../components/DisclaimerBanner';

export default function PredictionHistoryPage({ onSelectPrediction }) {
  const [history, setHistory] = useState([]);
  const [selectedDisease, setSelectedDisease] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, [selectedDisease]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const resp = await api.getPredictions(selectedDisease || undefined);
      setHistory(resp.data || []);
    } catch (err) {
      console.error('Error fetching prediction history:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = history.filter((item) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      item.id.toString().includes(term) ||
      item.disease_title.toLowerCase().includes(term) ||
      item.risk_category.toLowerCase().includes(term)
    );
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <DisclaimerBanner />

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <History className="w-5 h-5 text-teal-600" />
            Clinical Assessment History
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Local SQLite logs of predictive model evaluations with persistent SHAP attributions.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search assessment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-teal-600 w-44"
            />
          </div>

          <select
            value={selectedDisease}
            onChange={(e) => setSelectedDisease(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-teal-600"
          >
            <option value="">All Disease Modules</option>
            <option value="diabetes">Diabetes</option>
            <option value="heart_disease">Heart Disease</option>
            <option value="kidney_disease">Kidney Disease</option>
          </select>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400 animate-pulse">
            Loading assessment records...
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No matching assessment history records found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Record ID</th>
                  <th className="py-2.5 px-4">Disease Module</th>
                  <th className="py-2.5 px-4">Probability</th>
                  <th className="py-2.5 px-4">Risk Category</th>
                  <th className="py-2.5 px-4">Top SHAP Drivers</th>
                  <th className="py-2.5 px-4">Timestamp</th>
                  <th className="py-2.5 px-4">Type</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredHistory.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-500">#{rec.id}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{rec.disease_title}</td>
                    <td className="py-3 px-4 font-mono font-bold text-teal-800">
                      {(rec.probability * 100).toFixed(1)}%
                    </td>
                    <td className="py-3 px-4">
                      <RiskBadge category={rec.risk_category} />
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {rec.top_features?.length > 0 ? rec.top_features.slice(0, 3).join(', ') : '-'}
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">{rec.created_at}</td>
                    <td className="py-3 px-4">
                      {rec.is_demo ? (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 font-medium border border-slate-200">
                          Demo
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-teal-50 text-teal-700 font-medium border border-teal-200">
                          Evaluated
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right space-x-1">
                      <button
                        onClick={() => onSelectPrediction(rec.id)}
                        className="px-2.5 py-1 text-teal-700 hover:text-teal-900 font-semibold hover:bg-teal-50 rounded transition-colors inline-flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        View
                      </button>
                      <button
                        onClick={() => window.open(api.downloadReportUrl(rec.id), '_blank')}
                        className="px-2.5 py-1 text-slate-600 hover:text-slate-900 font-semibold hover:bg-slate-100 rounded transition-colors inline-flex items-center gap-1"
                        title="Download PDF"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
