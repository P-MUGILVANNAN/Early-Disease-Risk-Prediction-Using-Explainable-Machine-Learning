"""
Local LLM integration service using Ollama (llama3.2:latest).
Gracefully falls back to structured rule-based explanations if Ollama is offline or unavailable.
"""

import httpx
import logging
from typing import Dict, Any, List, Optional
from app.core.config import settings
from app.schemas.api_schemas import OllamaStatusResponse, OllamaExplainResponse

logger = logging.getLogger("llm_service")


class OllamaService:
    def __init__(self, base_url: str = settings.OLLAMA_BASE_URL, model: str = settings.OLLAMA_MODEL):
        self.base_url = base_url.rstrip("/")
        self.model = model

    async def check_status(self) -> OllamaStatusResponse:
        try:
            async with httpx.AsyncClient(timeout=4.0) as client:
                resp = await client.get(f"{self.base_url}/api/tags")
                if resp.status_code == 200:
                    data = resp.json()
                    models = [m.get("name", "") for m in data.get("models", [])]
                    model_available = any(self.model in m for m in models)
                    return OllamaStatusResponse(
                        connected=True,
                        base_url=self.base_url,
                        model=self.model,
                        model_available=model_available,
                        available_models=models,
                        message="Ollama local server connected and operational." if model_available else f"Ollama is running, but model '{self.model}' was not found in installed models."
                    )
        except Exception as e:
            logger.warning(f"Ollama health check failed: {e}")

        return OllamaStatusResponse(
            connected=False,
            base_url=self.base_url,
            model=self.model,
            model_available=False,
            available_models=[],
            message="Ollama server is not running on localhost:11434. The application is running smoothly using built-in explainability templates."
        )

    async def generate_explanation(
        self,
        disease_title: str,
        probability: float,
        risk_category: str,
        top_features: List[Dict[str, Any]],
        user_query: Optional[str] = None
    ) -> OllamaExplainResponse:
        # Check if Ollama is reachable and model is available
        status = await self.check_status()

        if status.connected and status.model_available:
            try:
                features_bullet = "\n".join([
                    f"- {f.get('display_name', f.get('feature'))}: Observed Value={f.get('value', 'N/A')}, SHAP attribution={f.get('shap_value', 0):+.4f} ({f.get('impact', 'neutral').replace('_', ' ')})"
                    for f in top_features
                ])

                system_prompt = (
                    "You are an educational AI assistant for an Explainable Machine Learning clinical risk dashboard. "
                    "Explain machine learning risk factors in clear, cautious, conversational educational language. "
                    "Never diagnose a disease, never calculate or alter prediction probabilities, never suggest specific medical treatments or medication changes, "
                    "and never invent unverified medical facts. Answer the user directly using the provided XGBoost probability and SHAP attributions."
                )

                clinical_context = (
                    f"Clinical Context for Current Assessment:\n"
                    f"Condition: {disease_title}\n"
                    f"Model-estimated risk probability: {probability * 100:.1f}%\n"
                    f"Illustrative Risk Band: {risk_category}\n"
                    f"Top Contributing SHAP Features:\n{features_bullet if features_bullet else '- None specified'}"
                )

                if user_query and user_query.strip():
                    # Direct question answering mode
                    user_prompt = (
                        f"{clinical_context}\n\n"
                        f"User Question: \"{user_query.strip()}\"\n\n"
                        f"Please directly answer the user's question in 1 to 2 clear, educational paragraphs. "
                        f"Relate your explanation to their observed clinical features and SHAP importance scores where applicable. "
                        f"Emphasize that SHAP describes algorithmic statistical influence, not biological causation."
                    )
                else:
                    # Initial summary mode
                    user_prompt = (
                        f"{clinical_context}\n\n"
                        f"Please provide a 2-paragraph educational explanation: "
                        f"1) What the model-estimated probability of {probability * 100:.1f}% means in an academic ML context, "
                        f"2) Why the top contributing SHAP features shifted the score relative to the baseline population. "
                        f"Conclude with a reminder that this is for research and education, not clinical diagnosis."
                    )

                payload = {
                    "model": self.model,
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    "stream": False,
                    "options": {
                        "temperature": 0.35,
                        "num_predict": 280
                    }
                }

                # 60-second timeout to allow local CPU/GPU execution without premature abort
                async with httpx.AsyncClient(timeout=60.0) as client:
                    resp = await client.post(f"{self.base_url}/api/chat", json=payload)
                    if resp.status_code == 200:
                        content = resp.json().get("message", {}).get("content", "")
                        if content and content.strip():
                            return OllamaExplainResponse(
                                explanation=content.strip(),
                                source="ollama",
                                model_used=self.model,
                                safety_disclaimer="Generated by local llama3.2:latest for educational research. Not clinical advice."
                            )
            except Exception as e:
                logger.error(f"Error during Ollama inference: {e}")

        # Fallback to robust rule-based explanation
        return self._generate_fallback_explanation(disease_title, probability, risk_category, top_features, user_query)

    def _generate_fallback_explanation(
        self,
        disease_title: str,
        probability: float,
        risk_category: str,
        top_features: List[Dict[str, Any]],
        user_query: Optional[str] = None
    ) -> OllamaExplainResponse:
        factors_up = [f.get("display_name", f.get("feature")) for f in top_features if f.get("impact") == "increases_risk"]
        factors_down = [f.get("display_name", f.get("feature")) for f in top_features if f.get("impact") == "decreases_risk"]

        up_text = f"elevated risk weightings from {', '.join(factors_up)}" if factors_up else "baseline factor weights"
        down_text = f"mitigating protective indications from {', '.join(factors_down)}" if factors_down else "minimal mitigating factors"

        if user_query and user_query.strip():
            explanation_lines = [
                f"### Analysis for: \"{user_query.strip()}\"",
                f"In this **{disease_title}** evaluation (model-estimated risk: **{probability * 100:.1f}%**, band: **'{risk_category}'**):",
                f"- The prediction is primarily driven by {up_text}, balanced against {down_text}.",
                "- **SHAP Interpretation:** SHAP (SHapley Additive exPlanations) values quantify how each parameter shifts the model output relative to the population baseline. A positive value indicates the feature shifted the probability higher in this cohort.",
                "*(Note: Local Ollama was offline or timed out; this verified algorithmic synthesis was generated directly from the model's actual SHAP outputs.)*"
            ]
        else:
            explanation_lines = [
                f"### Educational Model Explanation ({disease_title})",
                f"The trained XGBoost classifier evaluated the patient parameters and calculated a model-estimated risk probability of **{probability * 100:.1f}%**, assigning it to the **'{risk_category}'** band.",
                f"Based on SHAP (SHapley Additive exPlanations) analysis, the prediction was primarily driven by {up_text}, {down_text}.",
                "**What this probability means:** In machine learning, this score indicates how closely the input attributes align with high-risk patterns identified in historic research training cohorts. It is a statistical likelihood score under laboratory conditions, NOT a diagnostic certainty.",
                "**Important Disclaimer:** Machine learning explanations show mathematical feature importance, not guaranteed biological cause-and-effect. Always seek individualized guidance from licensed healthcare clinicians."
            ]

        return OllamaExplainResponse(
            explanation="\n\n".join(explanation_lines),
            source="predefined_fallback",
            model_used="Rule-based SHAP Synthesis Engine (Ollama Offline Fallback)",
            safety_disclaimer="Validated algorithmic explanation template. Educational use only."
        )


ollama_service = OllamaService()
