import React, { useEffect, useState } from 'react';
import {
  Users,
  Droplets,
  HeartPulse,
  Layers,
  ArrowRight,
  TrendingUp,
  ShieldAlert,
  CheckCircle,
  FileText,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import api from '../services/api';
import SummaryCard from '../components/SummaryCard';
import RiskBadge from '../components/RiskBadge';
import DisclaimerBanner from '../components/DisclaimerBanner';

export default function DashboardPage({ onNavigate, onSelectPrediction }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await api.getDashboardSummary();
      setSummary(resp.data);
    } catch (err) {
      console.error('Error fetching dashboard summary:', err);
      setError('Unable to connect to the backend API. Please ensure the FastAPI server is running.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-xl" />
          ))}
        </div>
        <div className="h-64 bg-slate-200 rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl text-rose-800">
        <h3 className="font-bold text-base">Backend Connection Error</h3>
        <p className="text-xs mt-1">{error}</p>
        <button
          onClick={fetchSummary}
          className="mt-3 px-3 py-1.5 bg-rose-700 text-white rounded text-xs font-semibold"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const diseaseChartData = [
    { name: 'Diabetes', count: summary?.disease_counts?.diabetes || 0, fill: '#0f766e' },
    { name: 'Heart Disease', count: summary?.disease_counts?.heart_disease || 0, fill: '#0284c7' },
    { name: 'Kidney Disease', count: summary?.disease_counts?.kidney_disease || 0, fill: '#7c3aed' },
  ];

  const riskChartData = [
    { name: 'Lower Risk', value: summary?.risk_distribution?.['Lower estimated risk'] || 0, color: '#10b981' },
    { name: 'Intermediate', value: summary?.risk_distribution?.['Intermediate estimated risk'] || 0, color: '#f59e0b' },
    { name: 'Higher Risk', value: summary?.risk_distribution?.['Higher estimated risk'] || 0, color: '#f43f5e' },
  ];

  return (
    <div className="space-y-6">
      <DisclaimerBanner />

      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Clinical Risk Dashboard</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time aggregate analytics from explainable predictive models across validated research cohorts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('disease_selection')}
            className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <span>Start New Assessment</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Assessments"
          value={summary?.total_assessments || 0}
          subtitle="Processed evaluations"
          icon={Users}
          color="teal"
        />
        <SummaryCard
          title="Diabetes Assessments"
          value={summary?.disease_counts?.diabetes || 0}
          subtitle="Pima Indians Cohort"
          icon={Droplets}
          color="blue"
        />
        <SummaryCard
          title="Heart Disease Assessments"
          value={summary?.disease_counts?.heart_disease || 0}
          subtitle="UCI Cleveland Cohort"
          icon={HeartPulse}
          color="rose"
        />
        <SummaryCard
          title="Kidney Disease Assessments"
          value={summary?.disease_counts?.kidney_disease || 0}
          subtitle="UCI CKD Cohort"
          icon={Layers}
          color="purple"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Disease Distribution */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Assessments by Disease Module</h3>
              <p className="text-[11px] text-slate-500">Distribution of evaluated clinical conditions</p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-100 rounded text-slate-600">
              Real-time
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={diseaseChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                  cursor={{ fill: '#f1f5f9' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={40}>
                  {diseaseChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Category Breakdown */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Model Risk Band Distribution</h3>
              <p className="text-[11px] text-slate-500">Categorization across illustrative probability bands</p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-100 rounded text-slate-600">
              Aggregated
            </span>
          </div>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {riskChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  formatter={(value) => <span className="text-xs text-slate-600">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Model Operational Status Badges */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-3">Trained Model Artifact Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { id: 'diabetes', title: 'Diabetes XGBoost Classifier', metric: 'ROC-AUC: 0.833' },
            { id: 'heart_disease', title: 'Heart Disease XGBoost Classifier', metric: 'ROC-AUC: 0.952' },
            { id: 'kidney_disease', title: 'Kidney Disease XGBoost Classifier', metric: 'ROC-AUC: 1.000' },
          ].map((m) => (
            <div key={m.id} className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-800">{m.title}</p>
                <p className="text-[11px] text-teal-700 font-medium">{m.metric}</p>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                <CheckCircle className="w-3 h-3" />
                Active
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Evaluations Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recent Risk Assessments</h3>
            <p className="text-[11px] text-slate-500">Latest evaluations recorded in local development database</p>
          </div>
          <button
            onClick={() => onNavigate('prediction_history')}
            className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1"
          >
            <span>View All History</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">ID</th>
                <th className="py-2.5 px-4">Disease Module</th>
                <th className="py-2.5 px-4">Estimated Risk</th>
                <th className="py-2.5 px-4">Category</th>
                <th className="py-2.5 px-4">Top Influential Factors</th>
                <th className="py-2.5 px-4">Timestamp</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {summary?.recent_assessments?.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-mono font-medium text-slate-500">#{rec.id}</td>
                  <td className="py-3 px-4 font-semibold text-slate-900">{rec.disease_title}</td>
                  <td className="py-3 px-4 font-mono font-bold text-teal-700">
                    {(rec.probability * 100).toFixed(1)}%
                  </td>
                  <td className="py-3 px-4">
                    <RiskBadge category={rec.risk_category} />
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {rec.top_features?.length > 0 ? rec.top_features.join(', ') : 'Standard factors'}
                  </td>
                  <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">{rec.created_at}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => onSelectPrediction(rec.id)}
                      className="px-2.5 py-1 text-teal-700 hover:text-teal-900 font-semibold hover:bg-teal-50 rounded transition-colors inline-flex items-center gap-1"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
