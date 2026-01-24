"""
AI Service for symptom analysis and doctor recommendation using Google Gemini
"""
import os
import json
import re
from typing import List, Dict, Optional
import google.generativeai as genai
from app.core.config import settings


class AIService:
    def __init__(self):
        """Initialize Gemini AI with API key"""
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise ValueError("GOOGLE_API_KEY not found in environment variables")
        
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-2.5-flash')
    
    def chat_response(
        self,
        user_message: str,
        conversation_history: List[Dict[str, str]],
        available_specializations: List[str],
        available_symptoms: List[Dict[str, str]]
    ) -> Dict:
        """
        Generate a conversational response. Uses minimal prompt for simple conversation,
        full analysis only when symptoms are detected.
        
        Args:
            user_message: The current message from the user
            conversation_history: List of previous messages [{role: "user"|"assistant", content: str}]
            available_specializations: List of available doctor specializations
            available_symptoms: List of symptom objects
        
        Returns:
            Dict containing response text and optional symptom analysis
        """
        try:
            # Step 1: Quick check if this might be symptoms-related
            is_likely_symptoms = self._is_symptoms_related(user_message, conversation_history[-3:])
            
            print(f"DEBUG: Message: '{user_message}' -> Symptoms related: {is_likely_symptoms}")
            
            if not is_likely_symptoms:
                # Simple conversation - minimal prompt
                return self._handle_general_conversation(user_message, conversation_history[-3:])
            else:
                # Potential symptoms - full analysis
                return self._handle_symptom_analysis(
                    user_message, conversation_history, 
                    available_specializations, available_symptoms
                )
                
        except Exception as e:
            print(f"Chat response error: {e}")
            return {
                "response_type": "conversation",
                "message": "I apologize, but I'm experiencing some technical difficulties. Please try again in a moment.",
                "should_show_doctors": False
            }
    
    def _is_symptoms_related(self, message: str, recent_history: List[Dict[str, str]]) -> bool:
        """
        Quick lightweight check if message might be health/symptom related
        """
        # First do a simple keyword check for common health terms
        health_keywords = [
            'pain', 'hurt', 'ache', 'sick', 'ill', 'fever', 'headache', 'stomach', 'nausea',
            'vomit', 'diarrhea', 'constipation', 'cough', 'cold', 'flu', 'tired', 'fatigue',
            'dizzy', 'chest', 'back', 'leg', 'arm', 'swollen', 'rash', 'infection', 'bleeding',
            'breathe', 'breathing', 'symptom', 'symptoms', 'feel', 'feeling', 'doctor', 'medical'
        ]
        
        message_lower = message.lower()
        if any(keyword in message_lower for keyword in health_keywords):
            return True
        
        # If no obvious keywords, try AI check but with timeout/fallback
        try:
            # Build minimal context
            history_text = ""
            for msg in recent_history:
                role = "User" if msg["role"] == "user" else "Assistant"
                history_text += f"{role}: {msg['content']}\n"
            
            prompt = f"""Is this about health/symptoms? Answer YES or NO only.

Examples:
Message: "Hello there" -> NO
Message: "I have a headache" -> YES  
Message: "What is your name?" -> NO
Message: "I feel nauseous" -> YES
Message: "How does this work?" -> NO
Message: "My stomach hurts" -> YES

{history_text}Message: "{message}"

Is this asking about pain, illness, symptoms, or medical concerns? YES or NO:"""
            
            response = self.model.generate_content(prompt)
            return "YES" in response.text.upper()
        except Exception as e:
            print(f"Symptom detection AI call failed: {e}")
            # If AI fails, be more permissive for potential symptoms
            return len(message) > 10 and any(word in message_lower for word in ['feel', 'have', 'get', 'am', 'been'])
    
    def _handle_general_conversation(self, message: str, recent_history: List[Dict[str, str]]) -> Dict:
        """
        Handle non-symptom conversation with minimal prompt
        """
        history_text = ""
        for msg in recent_history:
            role = "User" if msg["role"] == "user" else "Assistant"
            history_text += f"{role}: {msg['content']}\n"
        
        # Simple responses for common greetings without AI call
        message_lower = message.lower().strip()
        if message_lower in ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening']:
            return {
                "response_type": "conversation",
                "message": "Hello! I'm your AI Health Assistant. I can help you understand symptoms and connect you with the right doctors. How are you feeling today?",
                "should_show_doctors": False
            }
        
        if any(word in message_lower for word in ['how are you', 'what are you', 'who are you']):
            return {
                "response_type": "conversation", 
                "message": "I'm your AI Health Assistant here to help with your health concerns. I can analyze symptoms and suggest appropriate specialists. What would you like to know?",
                "should_show_doctors": False
            }
        
        # For other messages, try AI response
        prompt = f"""You are MedNexus AI Health Assistant. Keep responses brief and helpful.

Recent chat:
{history_text}

User: "{message}"

Respond helpfully. If greeting, greet back and offer health assistance. Return only your response text, no JSON."""
        
        try:
            response = self.model.generate_content(prompt)
            response_text = response.text.strip().strip('"')
            
            return {
                "response_type": "conversation",
                "message": response_text if response_text else "I'm here to help with your health concerns. How can I assist you today?",
                "should_show_doctors": False
            }
        except Exception as e:
            print(f"General conversation AI failed: {e}")
            return {
                "response_type": "conversation",
                "message": "I'm here to help with your health concerns. How can I assist you today?",
                "should_show_doctors": False
            }
    
    def _handle_symptom_analysis(
        self, 
        user_message: str, 
        conversation_history: List[Dict[str, str]],
        available_specializations: List[str],
        available_symptoms: List[Dict[str, str]]
    ) -> Dict:
        """
        Full symptom analysis with complete context
        """
        # Build conversation context (reduced to 5 messages)
        history_text = ""
        for msg in conversation_history[-5:]:
            role = "Patient" if msg["role"] == "user" else "Health Assistant"
            history_text += f"{role}: {msg['content']}\n"
        
        # Reduced symptom context (top 20 most common)
        symptom_context = "\n".join([
            f"- {s['name']}: {s.get('description', 'N/A')}"
            for s in available_symptoms[:20]
        ])
        
        spec_context = ", ".join(available_specializations[:10])  # Limit specs too
        
        prompt = f"""You are an AI Health Assistant for MedNexus. Analyze symptoms and suggest specialists.

Examples:
Input: "I have a severe headache and feel dizzy"
Output: {{
    "response_type": "symptom_analysis",
    "message": "I understand you're experiencing a severe headache and dizziness. These symptoms can be concerning and may indicate several conditions that would benefit from professional evaluation.",
    "detected_symptoms": ["headache", "dizziness"],
    "recommended_specializations": [{{"name": "Neurology", "match_percentage": 85, "reason": "Severe headaches with dizziness may indicate neurological issues"}}],
    "should_show_doctors": true
}}

Input: "I've been feeling tired lately"
Output: {{
    "response_type": "symptom_analysis", 
    "message": "I understand you've been experiencing fatigue. This is a common symptom that can have various causes. Let me help you find the right specialist to evaluate this properly.",
    "detected_symptoms": ["fatigue"],
    "recommended_specializations": [{{"name": "Internal Medicine", "match_percentage": 75, "reason": "General fatigue is best evaluated by an internist initially"}}],
    "should_show_doctors": true
}}

History:
{history_text}

Current: "{user_message}"

Specializations: {spec_context}

Symptoms: {symptom_context}

Return JSON:
{{
    "response_type": "symptom_analysis",
    "message": "empathetic response",
    "detected_symptoms": ["symptom1"],
    "recommended_specializations": [{{"name": "spec", "match_percentage": 80, "reason": "why"}}],
    "should_show_doctors": true
}}"""

        try:
            response = self.model.generate_content(prompt)
            response_text = response.text.strip()
            
            # Extract JSON from response
            json_match = re.search(r'```json\n(.*?)\n```', response_text, re.DOTALL)
            if json_match:
                response_text = json_match.group(1)
            else:
                json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
                if json_match:
                    response_text = json_match.group(0)
            
            result = json.loads(response_text)
            
            # Ensure required fields
            if "message" not in result:
                result["message"] = "I understand you're experiencing some health concerns. Could you please tell me more about your symptoms?"
            if "response_type" not in result:
                result["response_type"] = "symptom_analysis"
            if "should_show_doctors" not in result:
                result["should_show_doctors"] = True
            
            return result
            
        except json.JSONDecodeError as e:
            print(f"JSON parsing error in symptom analysis: {e}")
            return {
                "response_type": "symptom_analysis",
                "message": "I understand you may have some health concerns. Could you please describe your symptoms in more detail so I can help you better?",
                "should_show_doctors": False
            }
        except Exception as e:
            print(f"Symptom analysis error: {e}")
            return {
                "response_type": "conversation",
                "message": "I apologize, but I'm having trouble analyzing that right now. Could you please rephrase your symptoms?",
                "should_show_doctors": False
            }
    
    def analyze_symptoms(
        self, 
        patient_description: str, 
        available_specializations: List[str],
        available_symptoms: List[Dict[str, str]]
    ) -> Dict:
        """
        Analyze patient's natural language description and extract symptoms
        Optimized version with reduced token usage
        """
        try:
            # Reduced symptom context (top 15 symptoms only)
            symptom_context = "\n".join([
                f"- {s['name']}"
                for s in available_symptoms[:15]
            ])
            
            spec_context = ", ".join(available_specializations[:8])
            
            # Shorter, more efficient prompt with few-shot examples
            prompt = f"""Analyze symptoms and recommend specialists.

Examples:
Patient: "I have stomach pain and nausea"
{{
    "detected_symptoms": ["stomach pain", "nausea"],
    "recommended_specializations": [{{"name": "Gastroenterology", "match_percentage": 85}}],
    "severity": "moderate"
}}

Patient: "I have chest pain and shortness of breath"
{{
    "detected_symptoms": ["chest pain", "shortness of breath"],
    "recommended_specializations": [{{"name": "Cardiology", "match_percentage": 90}}],
    "severity": "high"
}}

Patient: "{patient_description}"

Symptoms: {symptom_context}
Specializations: {spec_context}

Return JSON:
{{
    "detected_symptoms": ["symptom1"],
    "recommended_specializations": [{{"name": "spec", "match_percentage": 80}}],
    "severity": "low|moderate|high"
}}"""

            response = self.model.generate_content(prompt)
            response_text = response.text.strip()
            
            # Extract JSON
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if json_match:
                response_text = json_match.group(0)
            
            analysis = json.loads(response_text)
            
            # Ensure required fields
            return {
                "detected_symptoms": analysis.get("detected_symptoms", []),
                "symptom_analysis": analysis.get("symptom_analysis", "Symptoms analyzed based on description"),
                "recommended_specializations": analysis.get("recommended_specializations", []),
                "severity": analysis.get("severity", "moderate"),
                "confidence": analysis.get("confidence", "medium"),
                "additional_notes": analysis.get("additional_notes", ""),
                "emergency_warning": analysis.get("emergency_warning", False)
            }
        except json.JSONDecodeError as e:
            print(f"JSON parsing error: {e}")
            return {
                "detected_symptoms": [],
                "symptom_analysis": "Unable to analyze symptoms. Please try rephrasing your description.",
                "recommended_specializations": [],
                "severity": "moderate",
                "confidence": "low",
                "additional_notes": "Please consult a healthcare professional.",
                "emergency_warning": False
            }
        except Exception as e:
            print(f"AI analysis error: {e}")
            return {
                "detected_symptoms": [],
                "symptom_analysis": f"Error analyzing symptoms: {str(e)}",
                "recommended_specializations": [],
                "severity": "moderate", 
                "confidence": "low",
                "additional_notes": "Please consult a healthcare professional for proper diagnosis.",
                "emergency_warning": False
            }
    
    def generate_health_advice(self, symptoms: List[str], severity: str) -> str:
        """
        Generate general health advice based on symptoms
        
        Args:
            symptoms: List of detected symptoms
            severity: Severity level (low, moderate, high)
        
        Returns:
            Health advice string
        """
        try:
            # Few-shot examples for health advice
            prompt = f"""Provide brief, general health advice for these symptoms.

Examples:
Symptoms: ["headache", "fever"] | Severity: moderate
Advice: "For headache and fever, rest in a cool, dark room and stay hydrated. Consider over-the-counter pain relievers if needed. If fever exceeds 101°F or symptoms worsen, seek medical attention promptly."

Symptoms: ["chest pain"] | Severity: high  
Advice: "Chest pain can be serious. Seek immediate medical attention, especially if accompanied by shortness of breath, nausea, or arm pain. Do not delay - call emergency services if severe."

Symptoms: {symptoms} | Severity: {severity}
Advice:"""

            response = self.model.generate_content(prompt)
            advice = response.text.strip()
            
            # Ensure advice ends with medical consultation recommendation
            if not any(phrase in advice.lower() for phrase in ['consult', 'doctor', 'medical', 'healthcare']):
                advice += " Please consult a healthcare professional for proper diagnosis and treatment."
                
            return advice
        except Exception as e:
            print(f"Health advice generation error: {e}")
            return "Please consult a healthcare professional for proper medical advice and diagnosis."


# Create a singleton instance
ai_service = AIService()
