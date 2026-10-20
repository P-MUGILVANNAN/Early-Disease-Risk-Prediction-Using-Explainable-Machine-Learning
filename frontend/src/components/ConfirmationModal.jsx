import React from 'react';
import { CheckCircle2, X } from 'lucide-react';

export default function ConfirmationModal({ isOpen, onClose, onConfirm, diseaseTitle, formData, featureLabels, loading }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden animate-in fade-in duration-150">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900">Confirm Clinical Parameters</h3>
            <p className="text-xs text-slate-500">{diseaseTitle} Risk Evaluation</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 rounded-lg p-1 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-3 flex-1 text-sm text-slate-700">
          <p className="text-xs text-slate-500 bg-teal-50 p-2.5 rounded-lg border border-teal-100">
            Please verify that the recorded measurements match the patient's current laboratory or clinical chart before evaluating.
          </p>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
            {Object.entries(formData).map(([key, val]) => (
              <div key={key} className="px-3.5 py-2 flex items-center justify-between text-xs hover:bg-slate-50">
                <span className="font-medium text-slate-600">{featureLabels[key] || key}:</span>
                <span className="font-bold text-slate-900 font-mono">{String(val)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Review & Edit
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            Run Explainable Evaluation
          </button>
        </div>
      </div>
    </div>
  );
}
