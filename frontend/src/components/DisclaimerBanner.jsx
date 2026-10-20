import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function DisclaimerBanner() {
  return (
    <div className="bg-amber-50/90 border border-amber-200/80 rounded-lg p-3 text-xs text-amber-900 flex items-start gap-2.5 shadow-xs mb-5">
      <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
      <div>
        <span className="font-semibold text-amber-950">Educational & Research Software Notice:</span>{' '}
        This application provides machine learning risk estimations based on historical research cohorts. It does{' '}
        <strong>not</strong> diagnose medical conditions, replace diagnostic tests, or provide medical advice. Consult a licensed physician for healthcare guidance.
      </div>
    </div>
  );
}
