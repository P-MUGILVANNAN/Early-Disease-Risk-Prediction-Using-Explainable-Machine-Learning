import React, { useState } from 'react';
import { Droplets, RotateCcw, Send, AlertCircle, Info } from 'lucide-react';
import api from '../services/api';
import ConfirmationModal from '../components/ConfirmationModal';
import DisclaimerBanner from '../components/DisclaimerBanner';

export default function DiabetesAssessmentPage({ onPredictionSuccess }) {
  const initialForm = {
    Pregnancies: '',
    Glucose: '',
    BloodPressure: '',
    SkinThickness: '',
    Insulin: '',
    BMI: '',
    DiabetesPedigreeFunction: '',
    Age: '',
  };

  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  const featureConfig = {
    Pregnancies: {
      label: 'Number of Pregnancies',
      unit: 'count',
      desc: 'Total number of times pregnant (enter 0 if none/not applicable)',
      min: 0,
      max: 25,
      placeholder: 'e.g. 1',
    },
    Glucose: {
      label: 'Plasma Glucose Concentration',
      unit: 'mg/dL',
      desc: 'Oral glucose tolerance test (OGTT) measurement at 2 hours',
      min: 40,
      max: 450,
      placeholder: 'e.g. 120',
    },
    BloodPressure: {
      label: 'Diastolic Blood Pressure',
      unit: 'mm Hg',
      desc: 'Diastolic resting blood pressure',
      min: 30,
      max: 200,
      placeholder: 'e.g. 74',
    },
    SkinThickness: {
      label: 'Triceps Skinfold Thickness',
      unit: 'mm',
      desc: 'Caliper measurement of triceps skin fold',
      min: 5,
      max: 110,
      placeholder: 'e.g. 26',
    },
    Insulin: {
      label: '2-Hour Serum Insulin',
      unit: 'μU/mL',
      desc: 'Post-prandial serum insulin level (0 to 1200)',
      min: 0,
      max: 1200,
      placeholder: 'e.g. 85',
    },
    BMI: {
      label: 'Body Mass Index (BMI)',
      unit: 'kg/m²',
      desc: 'Calculated as weight in kg / (height in m)²',
      min: 12.0,
      max: 75.0,
      step: '0.1',
      placeholder: 'e.g. 28.4',
    },
    DiabetesPedigreeFunction: {
      label: 'Diabetes Pedigree Score',
      unit: 'score',
      desc: 'Genetic family history pedigree score (standard range 0.05 - 2.5)',
      min: 0.01,
      max: 3.0,
      step: '0.01',
      placeholder: 'e.g. 0.45',
    },
    Age: {
      label: 'Patient Age',
      unit: 'years',
      desc: 'Current age of the individual in completed years',
      min: 18,
      max: 115,
      placeholder: 'e.g. 42',
    },
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleFillDemo = (type) => {
    if (type === 'elevated') {
      setFormData({
        Pregnancies: '3',
        Glucose: '155',
        BloodPressure: '82',
        SkinThickness: '33',
        Insulin: '180',
        BMI: '34.8',
        DiabetesPedigreeFunction: '0.72',
        Age: '52',
      });
    } else {
      setFormData({
        Pregnancies: '1',
        Glucose: '94',
        BloodPressure: '68',
        SkinThickness: '20',
        Insulin: '65',
        BMI: '22.6',
        DiabetesPedigreeFunction: '0.24',
        Age: '28',
      });
    }
    setErrors({});
  };

  const validate = () => {
    const newErrors = {};
    Object.keys(featureConfig).forEach((key) => {
      const val = formData[key];
      const cfg = featureConfig[key];

      if (val === '' || val === undefined || val === null) {
        newErrors[key] = `${cfg.label} is required.`;
      } else {
        const num = parseFloat(val);
        if (isNaN(num)) {
          newErrors[key] = 'Must be a valid numerical value.';
        } else if (num < cfg.min || num > cfg.max) {
          newErrors[key] = `Value must be between ${cfg.min} and ${cfg.max} ${cfg.unit}.`;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setApiError(null);
    if (validate()) {
      setIsModalOpen(true);
    }
  };

  const handleConfirmPrediction = async () => {
    setLoading(true);
    setApiError(null);
    try {
      const payload = {
        Pregnancies: parseInt(formData.Pregnancies, 10),
        Glucose: parseFloat(formData.Glucose),
        BloodPressure: parseFloat(formData.BloodPressure),
        SkinThickness: parseFloat(formData.SkinThickness),
        Insulin: parseFloat(formData.Insulin),
        BMI: parseFloat(formData.BMI),
        DiabetesPedigreeFunction: parseFloat(formData.DiabetesPedigreeFunction),
        Age: parseFloat(formData.Age),
      };

      const resp = await api.predict('diabetes', payload);
      setIsModalOpen(false);
      onPredictionSuccess(resp.data);
    } catch (err) {
      console.error('Prediction API error:', err);
      const detail = err.response?.data?.detail;
      setApiError(
        typeof detail === 'string'
          ? detail
          : Array.isArray(detail)
          ? detail.map((d) => `${d.loc?.join('.')}: ${d.msg}`).join(', ')
          : 'Failed to generate prediction. Check backend logs.'
      );
      setIsModalOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <DisclaimerBanner />

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-teal-50 text-teal-700 border border-teal-100">
            <Droplets className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Diabetes Risk Assessment Form</h2>
            <p className="text-xs text-slate-500">
              Evaluated with trained XGBoost model on the historic Pima Indians Diabetes research cohort.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleFillDemo('lower')}
            className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
          >
            Demo: Lower Risk Sample
          </button>
          <button
            type="button"
            onClick={() => handleFillDemo('elevated')}
            className="px-2.5 py-1 text-[11px] font-semibold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-md transition-colors"
          >
            Demo: Elevated Risk Sample
          </button>
        </div>
      </div>

      {apiError && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{apiError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(featureConfig).map(([key, cfg]) => (
            <div key={key} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor={key} className="text-xs font-bold text-slate-800">
                  {cfg.label} <span className="text-slate-400 font-normal">({cfg.unit})</span>
                </label>
                <span className="text-[10px] text-slate-400 font-mono">
                  {cfg.min} - {cfg.max}
                </span>
              </div>
              <input
                id={key}
                name={key}
                type="number"
                step={cfg.step || '1'}
                value={formData[key]}
                onChange={handleChange}
                placeholder={cfg.placeholder}
                className={`w-full px-3 py-2 text-xs rounded-lg border focus:outline-hidden transition-colors ${
                  errors[key]
                    ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500 focus:ring-1 focus:ring-rose-400'
                    : 'border-slate-300 focus:border-teal-600 focus:ring-1 focus:ring-teal-600'
                }`}
              />
              <p className="text-[11px] text-slate-500 leading-tight">{cfg.desc}</p>
              {errors[key] && <p className="text-[11px] text-rose-600 font-semibold">{errors[key]}</p>}
            </div>
          ))}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              setFormData(initialForm);
              setErrors({});
            }}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Form
          </button>

          <button
            type="submit"
            className="px-5 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-xs flex items-center gap-2 transition-colors"
          >
            <span>Review & Predict</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmPrediction}
        diseaseTitle="Diabetes Risk Evaluation"
        formData={formData}
        featureLabels={Object.fromEntries(Object.entries(featureConfig).map(([k, v]) => [k, v.label]))}
        loading={loading}
      />
    </div>
  );
}
