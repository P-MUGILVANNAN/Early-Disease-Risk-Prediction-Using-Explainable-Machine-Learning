import React, { useState } from 'react';
import { HeartPulse, RotateCcw, Send, AlertCircle } from 'lucide-react';
import api from '../services/api';
import ConfirmationModal from '../components/ConfirmationModal';
import DisclaimerBanner from '../components/DisclaimerBanner';

export default function HeartDiseaseAssessmentPage({ onPredictionSuccess }) {
  const initialForm = {
    age: '',
    sex: '1',
    cp: '1',
    trestbps: '',
    chol: '',
    fbs: '0',
    restecg: '0',
    thalach: '',
    exang: '0',
    oldpeak: '',
    slope: '1',
    ca: '0',
    thal: '3.0',
  };

  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  const featureLabels = {
    age: 'Patient Age (years)',
    sex: 'Biological Sex',
    cp: 'Chest Pain Type',
    trestbps: 'Resting Blood Pressure (mm Hg)',
    chol: 'Serum Cholesterol (mg/dL)',
    fbs: 'Fasting Blood Sugar > 120 mg/dL',
    restecg: 'Resting Electrocardiogram (ECG)',
    thalach: 'Max Heart Rate Achieved (bpm)',
    exang: 'Exercise Induced Angina',
    oldpeak: 'ST Depression (Oldpeak)',
    slope: 'Slope of Peak Exercise ST',
    ca: 'Major Vessels Colored (Fluoroscopy)',
    thal: 'Thallium Stress Scintigraphy Code',
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
        age: '63',
        sex: '1',
        cp: '4',
        trestbps: '152',
        chol: '280',
        fbs: '1',
        restecg: '2',
        thalach: '126',
        exang: '1',
        oldpeak: '2.4',
        slope: '2',
        ca: '2',
        thal: '7.0',
      });
    } else {
      setFormData({
        age: '42',
        sex: '0',
        cp: '2',
        trestbps: '116',
        chol: '185',
        fbs: '0',
        restecg: '0',
        thalach: '172',
        exang: '0',
        oldpeak: '0.2',
        slope: '1',
        ca: '0',
        thal: '3.0',
      });
    }
    setErrors({});
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.age || parseFloat(formData.age) < 18 || parseFloat(formData.age) > 110) {
      newErrors.age = 'Age must be between 18 and 110 years.';
    }
    if (!formData.trestbps || parseFloat(formData.trestbps) < 70 || parseFloat(formData.trestbps) > 260) {
      newErrors.trestbps = 'Resting BP must be between 70 and 260 mm Hg.';
    }
    if (!formData.chol || parseFloat(formData.chol) < 90 || parseFloat(formData.chol) > 650) {
      newErrors.chol = 'Cholesterol must be between 90 and 650 mg/dL.';
    }
    if (!formData.thalach || parseFloat(formData.thalach) < 55 || parseFloat(formData.thalach) > 240) {
      newErrors.thalach = 'Max heart rate must be between 55 and 240 bpm.';
    }
    if (formData.oldpeak === '' || parseFloat(formData.oldpeak) < 0 || parseFloat(formData.oldpeak) > 8) {
      newErrors.oldpeak = 'ST depression must be between 0.0 and 8.0 mm.';
    }

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
        age: parseFloat(formData.age),
        sex: parseInt(formData.sex, 10),
        cp: parseInt(formData.cp, 10),
        trestbps: parseFloat(formData.trestbps),
        chol: parseFloat(formData.chol),
        fbs: parseInt(formData.fbs, 10),
        restecg: parseInt(formData.restecg, 10),
        thalach: parseFloat(formData.thalach),
        exang: parseInt(formData.exang, 10),
        oldpeak: parseFloat(formData.oldpeak),
        slope: parseInt(formData.slope, 10),
        ca: parseFloat(formData.ca),
        thal: parseFloat(formData.thal),
      };

      const resp = await api.predict('heart_disease', payload);
      setIsModalOpen(false);
      onPredictionSuccess(resp.data);
    } catch (err) {
      console.error('Heart disease prediction error:', err);
      const detail = err.response?.data?.detail;
      setApiError(
        typeof detail === 'string'
          ? detail
          : Array.isArray(detail)
          ? detail.map((d) => `${d.loc?.join('.')}: ${d.msg}`).join(', ')
          : 'Failed to evaluate heart disease risk.'
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
          <div className="p-2.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-100">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Heart Disease Risk Assessment</h2>
            <p className="text-xs text-slate-500">
              Evaluated with trained XGBoost model on the UCI Cleveland clinical cardiovascular database.
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
            className="px-2.5 py-1 text-[11px] font-semibold bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-md transition-colors"
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
          {/* Age */}
          <div className="space-y-1.5">
            <label htmlFor="age" className="text-xs font-bold text-slate-800">
              Patient Age <span className="text-slate-400 font-normal">(years)</span>
            </label>
            <input
              id="age"
              name="age"
              type="number"
              value={formData.age}
              onChange={handleChange}
              placeholder="e.g. 55"
              className={`w-full px-3 py-2 text-xs rounded-lg border focus:outline-hidden ${
                errors.age ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300 focus:border-teal-600'
              }`}
            />
            {errors.age && <p className="text-[11px] text-rose-600 font-semibold">{errors.age}</p>}
          </div>

          {/* Sex */}
          <div className="space-y-1.5">
            <label htmlFor="sex" className="text-xs font-bold text-slate-800">Biological Sex</label>
            <select
              id="sex"
              name="sex"
              value={formData.sex}
              onChange={handleChange}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-teal-600 focus:outline-hidden bg-white"
            >
              <option value="1">Male (1)</option>
              <option value="0">Female (0)</option>
            </select>
          </div>

          {/* Chest Pain Type (cp) */}
          <div className="space-y-1.5">
            <label htmlFor="cp" className="text-xs font-bold text-slate-800">Chest Pain Presentation (cp)</label>
            <select
              id="cp"
              name="cp"
              value={formData.cp}
              onChange={handleChange}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-teal-600 focus:outline-hidden bg-white"
            >
              <option value="1">1: Typical Angina</option>
              <option value="2">2: Atypical Angina</option>
              <option value="3">3: Non-anginal Pain</option>
              <option value="4">4: Asymptomatic</option>
            </select>
          </div>

          {/* Resting Blood Pressure */}
          <div className="space-y-1.5">
            <label htmlFor="trestbps" className="text-xs font-bold text-slate-800">
              Resting Blood Pressure <span className="text-slate-400 font-normal">(mm Hg)</span>
            </label>
            <input
              id="trestbps"
              name="trestbps"
              type="number"
              value={formData.trestbps}
              onChange={handleChange}
              placeholder="e.g. 130"
              className={`w-full px-3 py-2 text-xs rounded-lg border focus:outline-hidden ${
                errors.trestbps ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300 focus:border-teal-600'
              }`}
            />
            {errors.trestbps && <p className="text-[11px] text-rose-600 font-semibold">{errors.trestbps}</p>}
          </div>

          {/* Serum Cholesterol */}
          <div className="space-y-1.5">
            <label htmlFor="chol" className="text-xs font-bold text-slate-800">
              Serum Cholesterol <span className="text-slate-400 font-normal">(mg/dL)</span>
            </label>
            <input
              id="chol"
              name="chol"
              type="number"
              value={formData.chol}
              onChange={handleChange}
              placeholder="e.g. 240"
              className={`w-full px-3 py-2 text-xs rounded-lg border focus:outline-hidden ${
                errors.chol ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300 focus:border-teal-600'
              }`}
            />
            {errors.chol && <p className="text-[11px] text-rose-600 font-semibold">{errors.chol}</p>}
          </div>

          {/* Fasting Blood Sugar > 120 */}
          <div className="space-y-1.5">
            <label htmlFor="fbs" className="text-xs font-bold text-slate-800">Fasting Blood Sugar &gt; 120 mg/dL</label>
            <select
              id="fbs"
              name="fbs"
              value={formData.fbs}
              onChange={handleChange}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-teal-600 focus:outline-hidden bg-white"
            >
              <option value="0">False (≤ 120 mg/dL)</option>
              <option value="1">True (&gt; 120 mg/dL)</option>
            </select>
          </div>

          {/* Resting ECG */}
          <div className="space-y-1.5">
            <label htmlFor="restecg" className="text-xs font-bold text-slate-800">Resting ECG Results</label>
            <select
              id="restecg"
              name="restecg"
              value={formData.restecg}
              onChange={handleChange}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-teal-600 focus:outline-hidden bg-white"
            >
              <option value="0">0: Normal</option>
              <option value="1">1: ST-T Wave Abnormality</option>
              <option value="2">2: Left Ventricular Hypertrophy</option>
            </select>
          </div>

          {/* Max Heart Rate (thalach) */}
          <div className="space-y-1.5">
            <label htmlFor="thalach" className="text-xs font-bold text-slate-800">
              Maximum Heart Rate Achieved <span className="text-slate-400 font-normal">(bpm)</span>
            </label>
            <input
              id="thalach"
              name="thalach"
              type="number"
              value={formData.thalach}
              onChange={handleChange}
              placeholder="e.g. 150"
              className={`w-full px-3 py-2 text-xs rounded-lg border focus:outline-hidden ${
                errors.thalach ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300 focus:border-teal-600'
              }`}
            />
            {errors.thalach && <p className="text-[11px] text-rose-600 font-semibold">{errors.thalach}</p>}
          </div>

          {/* Exercise Induced Angina */}
          <div className="space-y-1.5">
            <label htmlFor="exang" className="text-xs font-bold text-slate-800">Exercise Induced Angina</label>
            <select
              id="exang"
              name="exang"
              value={formData.exang}
              onChange={handleChange}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-teal-600 focus:outline-hidden bg-white"
            >
              <option value="0">No (0)</option>
              <option value="1">Yes (1)</option>
            </select>
          </div>

          {/* ST Depression (oldpeak) */}
          <div className="space-y-1.5">
            <label htmlFor="oldpeak" className="text-xs font-bold text-slate-800">
              ST Depression - Oldpeak <span className="text-slate-400 font-normal">(mm)</span>
            </label>
            <input
              id="oldpeak"
              name="oldpeak"
              type="number"
              step="0.1"
              value={formData.oldpeak}
              onChange={handleChange}
              placeholder="e.g. 1.2"
              className={`w-full px-3 py-2 text-xs rounded-lg border focus:outline-hidden ${
                errors.oldpeak ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300 focus:border-teal-600'
              }`}
            />
            {errors.oldpeak && <p className="text-[11px] text-rose-600 font-semibold">{errors.oldpeak}</p>}
          </div>

          {/* Slope of peak exercise ST */}
          <div className="space-y-1.5">
            <label htmlFor="slope" className="text-xs font-bold text-slate-800">Slope of Peak Exercise ST</label>
            <select
              id="slope"
              name="slope"
              value={formData.slope}
              onChange={handleChange}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-teal-600 focus:outline-hidden bg-white"
            >
              <option value="1">1: Upsloping</option>
              <option value="2">2: Flat</option>
              <option value="3">3: Downsloping</option>
            </select>
          </div>

          {/* Major Vessels Colored (ca) */}
          <div className="space-y-1.5">
            <label htmlFor="ca" className="text-xs font-bold text-slate-800">Major Vessels Colored by Fluoroscopy (ca)</label>
            <select
              id="ca"
              name="ca"
              value={formData.ca}
              onChange={handleChange}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-teal-600 focus:outline-hidden bg-white"
            >
              <option value="0">0 vessels</option>
              <option value="1">1 vessel</option>
              <option value="2">2 vessels</option>
              <option value="3">3 vessels</option>
            </select>
          </div>

          {/* Thal Scintigraphy */}
          <div className="space-y-1.5 md:col-span-2">
            <label htmlFor="thal" className="text-xs font-bold text-slate-800">Thallium Stress Scintigraphy (thal)</label>
            <select
              id="thal"
              name="thal"
              value={formData.thal}
              onChange={handleChange}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-teal-600 focus:outline-hidden bg-white"
            >
              <option value="3.0">3.0: Normal</option>
              <option value="6.0">6.0: Fixed Defect</option>
              <option value="7.0">7.0: Reversible Defect</option>
            </select>
          </div>
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
        diseaseTitle="Heart Disease Risk Evaluation"
        formData={formData}
        featureLabels={featureLabels}
        loading={loading}
      />
    </div>
  );
}
