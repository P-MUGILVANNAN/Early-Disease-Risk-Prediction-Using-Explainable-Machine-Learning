import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import api from './services/api';

import DashboardPage from './pages/DashboardPage';
import DiseaseSelectionPage from './pages/DiseaseSelectionPage';
import DiabetesAssessmentPage from './pages/DiabetesAssessmentPage';
import HeartDiseaseAssessmentPage from './pages/HeartDiseaseAssessmentPage';
import KidneyDiseaseAssessmentPage from './pages/KidneyDiseaseAssessmentPage';
import PredictionResultsPage from './pages/PredictionResultsPage';
import ShapExplainabilityPage from './pages/ShapExplainabilityPage';
import ModelPerformancePage from './pages/ModelPerformancePage';
import PredictionHistoryPage from './pages/PredictionHistoryPage';
import DatasetInformationPage from './pages/DatasetInformationPage';
import LlmAssistantPage from './pages/LlmAssistantPage';
import AboutDisclaimerPage from './pages/AboutDisclaimerPage';

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [activePrediction, setActivePrediction] = useState(null);
  const [ollamaStatus, setOllamaStatus] = useState(null);
  const [backendHealth, setBackendHealth] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    checkSystemStatus();
  }, []);

  const checkSystemStatus = async () => {
    try {
      const [hResp, oResp] = await Promise.allSettled([
        api.getHealth(),
        api.getLlmStatus(),
      ]);
      if (hResp.status === 'fulfilled') setBackendHealth(hResp.value.data);
      if (oResp.status === 'fulfilled') setOllamaStatus(oResp.value.data);
    } catch (err) {
      console.error('System health check error:', err);
    }
  };

  const handlePredictionSuccess = (predictionData) => {
    setActivePrediction(predictionData);
    setActivePage('prediction_results');
    setIsMobileMenuOpen(false);
  };

  const handleSelectPredictionFromHistory = async (predictionId) => {
    try {
      const resp = await api.getPredictionById(predictionId);
      setActivePrediction(resp.data);
      setActivePage('prediction_results');
      setIsMobileMenuOpen(false);
    } catch (err) {
      console.error('Error loading prediction:', err);
    }
  };

  const handleAskLlm = (prediction) => {
    setActivePrediction(prediction);
    setActivePage('llm_assistant');
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden text-slate-800">
      {/* Sidebar Navigation (desktop fixed + mobile drawer) */}
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        hasActivePrediction={!!activePrediction}
        isMobileOpen={isMobileMenuOpen}
        setIsMobileOpen={setIsMobileMenuOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        {/* Top Header */}
        <Header
          ollamaStatus={ollamaStatus}
          backendHealth={backendHealth}
          onSelectPage={setActivePage}
          onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
        />

        {/* Scrollable View Content */}
        <main className="flex-1 overflow-y-auto p-3.5 sm:p-6 md:p-8">
          {activePage === 'dashboard' && (
            <DashboardPage
              onNavigate={setActivePage}
              onSelectPrediction={handleSelectPredictionFromHistory}
            />
          )}

          {activePage === 'disease_selection' && (
            <DiseaseSelectionPage onSelectDisease={setActivePage} />
          )}

          {activePage === 'diabetes_assessment' && (
            <DiabetesAssessmentPage onPredictionSuccess={handlePredictionSuccess} />
          )}

          {activePage === 'heart_assessment' && (
            <HeartDiseaseAssessmentPage onPredictionSuccess={handlePredictionSuccess} />
          )}

          {activePage === 'kidney_assessment' && (
            <KidneyDiseaseAssessmentPage onPredictionSuccess={handlePredictionSuccess} />
          )}

          {activePage === 'prediction_results' && (
            <PredictionResultsPage
              result={activePrediction}
              onAskLlm={handleAskLlm}
              onStartNew={() => setActivePage('disease_selection')}
            />
          )}

          {activePage === 'shap_explainability' && (
            <ShapExplainabilityPage activePrediction={activePrediction} />
          )}

          {activePage === 'model_performance' && (
            <ModelPerformancePage />
          )}

          {activePage === 'prediction_history' && (
            <PredictionHistoryPage onSelectPrediction={handleSelectPredictionFromHistory} />
          )}

          {activePage === 'dataset_info' && (
            <DatasetInformationPage />
          )}

          {activePage === 'llm_assistant' && (
            <LlmAssistantPage activePrediction={activePrediction} />
          )}

          {activePage === 'about_disclaimer' && (
            <AboutDisclaimerPage />
          )}
        </main>
      </div>
    </div>
  );
}
