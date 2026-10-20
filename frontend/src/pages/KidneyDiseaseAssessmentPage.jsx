import React, { useState } from 'react';
import { Layers, RotateCcw, Send, AlertCircle } from 'lucide-react';
import api from '../services/api';
import ConfirmationModal from '../components/ConfirmationModal';
import DisclaimerBanner from '../components/DisclaimerBanner';

export default function KidneyDiseaseAssessmentPage({ onPredictionSuccess }) {
  const initialForm = {
    age: '',
    bp: '',
    sg: '1.020',
    al: '0',
    su: '0',
    rbc: 'normal',
    pc: 'normal',
    pcc: 'notpresent',
    ba: 'notpresent',
    bgr: '',
    bu: '',
    sc: '',
    sod: '',
    pot: '',
    hemo: '',
    pcv: '',
    wc: '',
    rc: '',
    htn: 'no',
    dm: 'no',
    cad: 'no',
    appet: 'good',
    pe: 'no',
    ane: 'no',
  };

  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

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
        age: '62',
        bp: '90',
        sg: '1.010',
        al: '3',
        su: '1',
        rbc: 'abnormal',
        pc: 'abnormal',
        pcc: 'present',
        ba: 'present',
        bgr: '160',
        bu: '68',
        sc: '3.2',
        sod: '130',
        pot: '5.2',
        hemo: '9.4',
        pcv: '29',
        wc: '10200',
        rc: '3.6',
        htn: 'yes',
        dm: 'yes',
        cad: 'yes',
        appet: 'poor',
        pe: 'yes',
        ane: 'yes',
      });
    } else {
      setFormData({
        age: '35',
        bp: '70',
        sg: '1.025',
        al: '0',
        su: '0',
        rbc: 'normal',
        pc: 'normal',
        pcc: 'notpresent',
        ba: 'notpresent',
        bgr: '92',
        bu: '24',
        sc: '0.8',
        sod: '142',
        pot: '4.2',
        hemo: '15.6',
        pcv: '46',
        wc: '6800',
        rc: '5.3',
        htn: 'no',
        dm: 'no',
        cad: 'no',
        appet: 'good',
        pe: 'no',
        ane: 'no',
      });
    }
    setErrors({});
  };

  const validate = () => {
    const newErrors = {};
    const reqNums = [
      { key: 'age', min: 1, max: 110, label: 'Age' },
      { key: 'bp', min: 40, max: 200, label: 'Blood Pressure' },
      { key: 'bgr', min: 40, max: 550, label: 'Blood Glucose Random' },
      { key: 'bu', min: 5, max: 350, label: 'Blood Urea' },
      { key: 'sc', min: 0.2, max: 25.0, label: 'Serum Creatinine' },
      { key: 'sod', min: 90, max: 170, label: 'Sodium' },
      { key: 'pot', min: 1.5, max: 12.0, label: 'Potassium' },
      { key: 'hemo', min: 3.0, max: 22.0, label: 'Hemoglobin' },
      { key: 'pcv', min: 10, max: 65, label: 'Packed Cell Volume' },
      { key: 'wc', min: 1500, max: 35000, label: 'WBC Count' },
      { key: 'rc', min: 1.5, max: 9.0, label: 'RBC Count' },
    ];

    reqNums.forEach(({ key, min, max, label }) => {
      const v = formData[key];
      if (v === '' || v === undefined) {
        newErrors[key] = `${label} is required.`;
      } else {
        const num = parseFloat(v);
        if (isNaN(num)) newErrors[key] = 'Must be a valid number.';
        else if (num < min || num > max) newErrors[key] = `Range: ${min} - ${max}`;
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
        age: parseFloat(formData.age),
        bp: parseFloat(formData.bp),
        sg: parseFloat(formData.sg),
        al: parseFloat(formData.al),
        su: parseFloat(formData.su),
        rbc: formData.rbc,
        pc: formData.pc,
        pcc: formData.pcc,
        ba: formData.ba,
        bgr: parseFloat(formData.bgr),
        bu: parseFloat(formData.bu),
        sc: parseFloat(formData.sc),
        sod: parseFloat(formData.sod),
        pot: parseFloat(formData.pot),
        hemo: parseFloat(formData.hemo),
        pcv: parseFloat(formData.pcv),
        wc: parseFloat(formData.wc),
        rc: parseFloat(formData.rc),
        htn: formData.htn,
        dm: formData.dm,
        cad: formData.cad,
        appet: formData.appet,
        pe: formData.pe,
        ane: formData.ane,
      };

      const resp = await api.predict('kidney_disease', payload);
      setIsModalOpen(false);
      onPredictionSuccess(resp.data);
    } catch (err) {
      console.error('Kidney prediction error:', err);
      const detail = err.response?.data?.detail;
      setApiError(
        typeof detail === 'string'
          ? detail
          : Array.isArray(detail)
          ? detail.map((d) => `${d.loc?.join('.')}: ${d.msg}`).join(', ')
          : 'Failed to evaluate chronic kidney disease risk.'
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
          <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-100">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Chronic Kidney Disease Assessment</h2>
            <p className="text-xs text-slate-500">
              Evaluated with trained XGBoost model on the multi-analyte UCI Chronic Kidney Disease database.
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
            className="px-2.5 py-1 text-[11px] font-semibold bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-md transition-colors"
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

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden divide-y divide-slate-100">
        {/* Section 1: Demographics & Urinalysis */}
        <div className="p-6 space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider text-teal-800">
            1. Vitals & Urinalysis Profile
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label htmlFor="age" className="text-xs font-semibold text-slate-700">Age (years)</label>
              <input
                id="age"
                name="age"
                type="number"
                value={formData.age}
                onChange={handleChange}
                placeholder="e.g. 52"
                className={`w-full px-3 py-2 text-xs rounded-lg border ${
                  errors.age ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                }`}
              />
              {errors.age && <p className="text-[11px] text-rose-600">{errors.age}</p>}
            </div>

            <div className="space-y-1">
              <label htmlFor="bp" className="text-xs font-semibold text-slate-700">Blood Pressure (mm Hg)</label>
              <input
                id="bp"
                name="bp"
                type="number"
                value={formData.bp}
                onChange={handleChange}
                placeholder="e.g. 80"
                className={`w-full px-3 py-2 text-xs rounded-lg border ${
                  errors.bp ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                }`}
              />
              {errors.bp && <p className="text-[11px] text-rose-600">{errors.bp}</p>}
            </div>

            <div className="space-y-1">
              <label htmlFor="sg" className="text-xs font-semibold text-slate-700">Specific Gravity (sg)</label>
              <select
                id="sg"
                name="sg"
                value={formData.sg}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
              >
                <option value="1.005">1.005</option>
                <option value="1.010">1.010</option>
                <option value="1.015">1.015</option>
                <option value="1.020">1.020</option>
                <option value="1.025">1.025</option>
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="al" className="text-xs font-semibold text-slate-700">Albumin (0 to 5)</label>
              <select
                id="al"
                name="al"
                value={formData.al}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
              >
                {[0, 1, 2, 3, 4, 5].map((v) => (
                  <option key={v} value={v}>Level {v}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="su" className="text-xs font-semibold text-slate-700">Urine Sugar (0 to 5)</label>
              <select
                id="su"
                name="su"
                value={formData.su}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
              >
                {[0, 1, 2, 3, 4, 5].map((v) => (
                  <option key={v} value={v}>Level {v}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="rbc" className="text-xs font-semibold text-slate-700">Red Blood Cells (Urine)</label>
              <select
                id="rbc"
                name="rbc"
                value={formData.rbc}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
              >
                <option value="normal">Normal</option>
                <option value="abnormal">Abnormal</option>
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="pc" className="text-xs font-semibold text-slate-700">Pus Cells (Urine)</label>
              <select
                id="pc"
                name="pc"
                value={formData.pc}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
              >
                <option value="normal">Normal</option>
                <option value="abnormal">Abnormal</option>
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="pcc" className="text-xs font-semibold text-slate-700">Pus Cell Clumps</label>
              <select
                id="pcc"
                name="pcc"
                value={formData.pcc}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
              >
                <option value="notpresent">Not Present</option>
                <option value="present">Present</option>
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="ba" className="text-xs font-semibold text-slate-700">Bacteria</label>
              <select
                id="ba"
                name="ba"
                value={formData.ba}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
              >
                <option value="notpresent">Not Present</option>
                <option value="present">Present</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Blood Chemistry & Electrolytes */}
        <div className="p-6 space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider text-teal-800">
            2. Serum Chemistry & Electrolytes
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label htmlFor="bgr" className="text-xs font-semibold text-slate-700">Blood Glucose Random (mg/dL)</label>
              <input
                id="bgr"
                name="bgr"
                type="number"
                value={formData.bgr}
                onChange={handleChange}
                placeholder="e.g. 120"
                className={`w-full px-3 py-2 text-xs rounded-lg border ${
                  errors.bgr ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                }`}
              />
              {errors.bgr && <p className="text-[11px] text-rose-600">{errors.bgr}</p>}
            </div>

            <div className="space-y-1">
              <label htmlFor="bu" className="text-xs font-semibold text-slate-700">Blood Urea (mg/dL)</label>
              <input
                id="bu"
                name="bu"
                type="number"
                value={formData.bu}
                onChange={handleChange}
                placeholder="e.g. 36"
                className={`w-full px-3 py-2 text-xs rounded-lg border ${
                  errors.bu ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                }`}
              />
              {errors.bu && <p className="text-[11px] text-rose-600">{errors.bu}</p>}
            </div>

            <div className="space-y-1">
              <label htmlFor="sc" className="text-xs font-semibold text-slate-700">Serum Creatinine (mg/dL)</label>
              <input
                id="sc"
                name="sc"
                type="number"
                step="0.1"
                value={formData.sc}
                onChange={handleChange}
                placeholder="e.g. 1.2"
                className={`w-full px-3 py-2 text-xs rounded-lg border ${
                  errors.sc ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                }`}
              />
              {errors.sc && <p className="text-[11px] text-rose-600">{errors.sc}</p>}
            </div>

            <div className="space-y-1">
              <label htmlFor="sod" className="text-xs font-semibold text-slate-700">Sodium (mEq/L)</label>
              <input
                id="sod"
                name="sod"
                type="number"
                value={formData.sod}
                onChange={handleChange}
                placeholder="e.g. 138"
                className={`w-full px-3 py-2 text-xs rounded-lg border ${
                  errors.sod ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                }`}
              />
              {errors.sod && <p className="text-[11px] text-rose-600">{errors.sod}</p>}
            </div>

            <div className="space-y-1">
              <label htmlFor="pot" className="text-xs font-semibold text-slate-700">Potassium (mEq/L)</label>
              <input
                id="pot"
                name="pot"
                type="number"
                step="0.1"
                value={formData.pot}
                onChange={handleChange}
                placeholder="e.g. 4.4"
                className={`w-full px-3 py-2 text-xs rounded-lg border ${
                  errors.pot ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                }`}
              />
              {errors.pot && <p className="text-[11px] text-rose-600">{errors.pot}</p>}
            </div>
          </div>
        </div>

        {/* Section 3: Hematology */}
        <div className="p-6 space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider text-teal-800">
            3. Hematology Profile
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label htmlFor="hemo" className="text-xs font-semibold text-slate-700">Hemoglobin (g/dL)</label>
              <input
                id="hemo"
                name="hemo"
                type="number"
                step="0.1"
                value={formData.hemo}
                onChange={handleChange}
                placeholder="e.g. 14.2"
                className={`w-full px-3 py-2 text-xs rounded-lg border ${
                  errors.hemo ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                }`}
              />
              {errors.hemo && <p className="text-[11px] text-rose-600">{errors.hemo}</p>}
            </div>

            <div className="space-y-1">
              <label htmlFor="pcv" className="text-xs font-semibold text-slate-700">Packed Cell Volume (%)</label>
              <input
                id="pcv"
                name="pcv"
                type="number"
                value={formData.pcv}
                onChange={handleChange}
                placeholder="e.g. 42"
                className={`w-full px-3 py-2 text-xs rounded-lg border ${
                  errors.pcv ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                }`}
              />
              {errors.pcv && <p className="text-[11px] text-rose-600">{errors.pcv}</p>}
            </div>

            <div className="space-y-1">
              <label htmlFor="wc" className="text-xs font-semibold text-slate-700">WBC Count (cells/μL)</label>
              <input
                id="wc"
                name="wc"
                type="number"
                value={formData.wc}
                onChange={handleChange}
                placeholder="e.g. 7800"
                className={`w-full px-3 py-2 text-xs rounded-lg border ${
                  errors.wc ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                }`}
              />
              {errors.wc && <p className="text-[11px] text-rose-600">{errors.wc}</p>}
            </div>

            <div className="space-y-1">
              <label htmlFor="rc" className="text-xs font-semibold text-slate-700">RBC Count (million/μL)</label>
              <input
                id="rc"
                name="rc"
                type="number"
                step="0.1"
                value={formData.rc}
                onChange={handleChange}
                placeholder="e.g. 5.1"
                className={`w-full px-3 py-2 text-xs rounded-lg border ${
                  errors.rc ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                }`}
              />
              {errors.rc && <p className="text-[11px] text-rose-600">{errors.rc}</p>}
            </div>
          </div>
        </div>

        {/* Section 4: Systemic Comorbidities & Symptoms */}
        <div className="p-6 space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider text-teal-800">
            4. Systemic Comorbidities & Symptoms
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="space-y-1">
              <label htmlFor="htn" className="text-xs font-semibold text-slate-700">Hypertension</label>
              <select
                id="htn"
                name="htn"
                value={formData.htn}
                onChange={handleChange}
                className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-300 bg-white"
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="dm" className="text-xs font-semibold text-slate-700">Diabetes</label>
              <select
                id="dm"
                name="dm"
                value={formData.dm}
                onChange={handleChange}
                className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-300 bg-white"
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="cad" className="text-xs font-semibold text-slate-700">CAD</label>
              <select
                id="cad"
                name="cad"
                value={formData.cad}
                onChange={handleChange}
                className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-300 bg-white"
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="appet" className="text-xs font-semibold text-slate-700">Appetite</label>
              <select
                id="appet"
                name="appet"
                value={formData.appet}
                onChange={handleChange}
                className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-300 bg-white"
              >
                <option value="good">Good</option>
                <option value="poor">Poor</option>
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="pe" className="text-xs font-semibold text-slate-700">Pedal Edema</label>
              <select
                id="pe"
                name="pe"
                value={formData.pe}
                onChange={handleChange}
                className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-300 bg-white"
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="ane" className="text-xs font-semibold text-slate-700">Anemia</label>
              <select
                id="ane"
                name="ane"
                value={formData.ane}
                onChange={handleChange}
                className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-300 bg-white"
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 flex items-center justify-between">
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
        diseaseTitle="Chronic Kidney Disease Evaluation"
        formData={formData}
        featureLabels={{
          age: 'Age',
          bp: 'Blood Pressure',
          sg: 'Specific Gravity',
          al: 'Albumin',
          su: 'Sugar',
          rbc: 'RBC (Urine)',
          pc: 'Pus Cells',
          pcc: 'Pus Cell Clumps',
          ba: 'Bacteria',
          bgr: 'Blood Glucose Random',
          bu: 'Blood Urea',
          sc: 'Serum Creatinine',
          sod: 'Sodium',
          pot: 'Potassium',
          hemo: 'Hemoglobin',
          pcv: 'Packed Cell Volume',
          wc: 'WBC Count',
          rc: 'RBC Count',
          htn: 'Hypertension',
          dm: 'Diabetes',
          cad: 'CAD',
          appet: 'Appetite',
          pe: 'Pedal Edema',
          ane: 'Anemia',
        }}
        loading={loading}
      />
    </div>
  );
}
