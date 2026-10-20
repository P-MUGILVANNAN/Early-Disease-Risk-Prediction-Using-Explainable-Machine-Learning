import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, Cpu, Sparkles, User, RefreshCw, MessageSquare, HelpCircle } from 'lucide-react';
import api from '../services/api';
import DisclaimerBanner from '../components/DisclaimerBanner';

export default function LlmAssistantPage({ activePrediction }) {
  const [ollamaStatus, setOllamaStatus] = useState(null);
  const [query, setQuery] = useState('');
  const [chatLog, setChatLog] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatBottomRef = useRef(null);

  useEffect(() => {
    checkStatus();
    if (activePrediction) {
      handleGenerateInitialExplanation(activePrediction);
    } else {
      setChatLog([
        {
          role: 'assistant',
          content:
            "Hello! I am your Explainable AI Medical Assistant powered by local **llama3.2:latest** through Ollama (or built-in validated rule fallback).\n\nI can explain what your model-estimated risk probabilities mean, demystify SHAP feature importance scores, and answer questions about machine learning in healthcare. Please select or run a risk assessment, or ask any technical question below!",
          source: 'system',
        },
      ]);
    }
  }, [activePrediction]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatLog, loading]);

  const checkStatus = async () => {
    try {
      const resp = await api.getLlmStatus();
      setOllamaStatus(resp.data);
    } catch (err) {
      console.error('Error checking Ollama status:', err);
    }
  };

  const handleGenerateInitialExplanation = async (pred) => {
    setLoading(true);
    try {
      const payload = {
        disease: pred.disease,
        probability: pred.probability,
        risk_category: pred.risk_category,
        top_features: pred.top_features,
        user_query: null,
      };
      const resp = await api.explainWithLlm(payload);
      setChatLog([
        {
          role: 'assistant',
          content: resp.data.explanation,
          source: resp.data.source,
          model: resp.data.model_used,
          disclaimer: resp.data.safety_disclaimer,
        },
      ]);
    } catch (err) {
      console.error('LLM explain error:', err);
      setChatLog([
        {
          role: 'assistant',
          content: pred.educational_summary || 'Unable to generate initial explanation.',
          source: 'fallback',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const sendMessageWithQuery = async (userMsg) => {
    if (!userMsg.trim() || loading) return;

    setQuery('');
    setChatLog((prev) => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const payload = {
        disease: activePrediction?.disease || 'diabetes',
        probability: activePrediction?.probability !== undefined ? activePrediction.probability : 0.45,
        risk_category: activePrediction?.risk_category || 'Intermediate estimated risk',
        top_features: activePrediction?.top_features || [],
        user_query: userMsg,
      };

      const resp = await api.explainWithLlm(payload);
      setChatLog((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: resp.data.explanation,
          source: resp.data.source,
          model: resp.data.model_used,
          disclaimer: resp.data.safety_disclaimer,
        },
      ]);
    } catch (err) {
      console.error('Error calling LLM explain API:', err);
      setChatLog((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'I encountered an issue processing your question with the local assistant. Please check that Ollama is responding or retry.',
          source: 'error',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    sendMessageWithQuery(query);
  };

  const quickQuestions = [
    activePrediction?.top_features?.[0]?.display_name
      ? `Why is ${activePrediction.top_features[0].display_name.split('(')[0].trim()} a significant risk factor?`
      : 'Why are specific metabolic markers significant in this model?',
    'What does this model-estimated probability score represent?',
    'How does SHAP calculate positive vs negative risk impact?',
    'What are the limitations of this machine learning prediction?',
  ];

  const isOnline = ollamaStatus?.connected && ollamaStatus?.model_available;

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <DisclaimerBanner />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Bot className="w-5 h-5 text-teal-600" />
            Local LLM Explanation Assistant
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Interprets XGBoost probabilities and SHAP feature contributions in educational, patient-friendly language.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div
            className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 border ${
              isOnline
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Ollama: {isOnline ? 'llama3.2:latest Connected' : 'Offline Mode (Fallback Engine)'}</span>
          </div>
          <button
            onClick={checkStatus}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
            title="Refresh Ollama connection"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Active Assessment Context Pill */}
      {activePrediction && (
        <div className="p-3 bg-teal-50/70 border border-teal-200/80 rounded-lg text-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-teal-950">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-700 shrink-0" />
            <span>
              Evaluating Active Assessment: <strong>{activePrediction.disease_title}</strong> (
              {(activePrediction.probability * 100).toFixed(1)}% Estimated Risk)
            </span>
          </div>
          <span className="font-semibold px-2 py-0.5 bg-white rounded text-teal-800 border border-teal-200 font-mono text-[11px] self-start sm:self-auto">
            {activePrediction.risk_category}
          </span>
        </div>
      )}

      {/* Quick Question Chips */}
      <div className="space-y-1.5">
        <p className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 uppercase tracking-wider">
          <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
          Suggested Questions
        </p>
        <div className="flex flex-wrap gap-2">
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => sendMessageWithQuery(q)}
              disabled={loading}
              className="text-left text-xs bg-white hover:bg-teal-50 hover:text-teal-900 border border-slate-200 hover:border-teal-300 rounded-lg px-3 py-1.5 transition-colors shadow-2xs text-slate-700 font-medium"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Display Window */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col h-[480px] sm:h-[530px] overflow-hidden">
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4">
          {chatLog.map((msg, i) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={i}
                className={`flex gap-3 max-w-[95%] sm:max-w-[85%] ${
                  isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold ${
                    isUser
                      ? 'bg-slate-900 text-white'
                      : 'bg-teal-700 text-white'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div
                  className={`p-3.5 rounded-xl text-xs leading-relaxed space-y-2 ${
                    isUser
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-50 border border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                  {!isUser && msg.source && (
                    <div className="pt-2 border-t border-slate-200/60 text-[10px] text-slate-400 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                      <span>Source: {msg.model || msg.source}</span>
                      {msg.disclaimer && <span className="italic">{msg.disclaimer}</span>}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {loading && (
            <div className="flex gap-3 mr-auto items-center text-xs text-slate-500 bg-slate-50 border border-slate-200 p-3 rounded-xl max-w-md">
              <div className="w-7 h-7 rounded-lg bg-teal-700 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div>
                <p className="font-semibold text-slate-800">Analyzing with local llama3.2...</p>
                <p className="text-[11px] text-slate-500">Synthesizing XGBoost weights and SHAP explanations</p>
              </div>
            </div>
          )}
          <div ref={chatBottomRef} />
        </div>

        {/* Input Form */}
        <form
          onSubmit={handleSendMessage}
          className="p-3 bg-slate-50 border-t border-slate-200 flex items-center gap-2"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask a question about your prediction, risk factors, or dataset..."
            className="flex-1 px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-teal-600"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="px-4 py-2 bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 transition-colors shadow-xs shrink-0"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
