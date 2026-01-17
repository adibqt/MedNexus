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
        self.model = genai.GenerativeModel('gemini-3-flash-preview')
    
    def chat_response(
        self,
        user_message: str,
        conversation_history: List[Dict[str, str]],
        available_specializations: List[str],
        available_symptoms: List[Dict[str, str]]
    ) -> Dict:
        """
        Generate a conversational response. Detects if symptoms are being discussed
        and provides appropriate response with optional symptom analysis.
        
        Args:
            user_message: The current message from the user
            conversation_history: List of previous messages [{role: "user"|"assistant", content: str}]
            available_specializations: List of available doctor specializations
            available_symptoms: List of symptom objects
        
        Returns:
            Dict containing response text and optional symptom analysis
        """
        try:
            # Build conversation context
            history_text = ""
            for msg in conversation_history[-10:]:  # Keep last 10 messages for context
                role = "Patient" if msg["role"] == "user" else "Health Assistant"
                history_text += f"{role}: {msg['content']}\n"
            
            # Create symptom context for reference
            symptom_context = "\n".join([
                f"- {s['name']}: {s.get('description', 'N/A')} (Related to: {s.get('specialization', 'General')})"
                for s in available_symptoms[:50]
            ])
            
            spec_context = ", ".join(available_specializations)
            
            prompt = f"""You are a friendly and professional AI Health Assistant for MedNexus, a healthcare platform. Your role is to help patients understand their health concerns and connect them with appropriate doctors.

CONVERSATION HISTORY:
{history_text}

CURRENT PATIENT MESSAGE: "{user_message}"

AVAILABLE MEDICAL SPECIALIZATIONS IN OUR SYSTEM:
{spec_context}

KNOWN SYMPTOMS IN OUR DATABASE:
{symptom_context}

INSTRUCTIONS:
1. First, determine if the patient is describing health symptoms/concerns OR having general conversation.
2. If describing symptoms: Provide empathetic response AND symptom analysis in JSON format.
3. If general conversation (greetings, questions about the service, irrelevant topics): Respond conversationally and naturally.
4. Be warm, professional, and helpful. Use simple language.
5. Never diagnose - only suggest seeing appropriate specialists.
6. If unsure about symptoms, ask clarifying questions.

RESPONSE FORMAT - Return a JSON object:

For SYMPTOM-RELATED messages:
{{
    "response_type": "symptom_analysis",
    "message": "Your empathetic response acknowledging their symptoms and explaining what you found",
    "detected_symptoms": ["symptom1", "symptom2"],
    "symptom_analysis": "Brief medical explanation of the symptoms",
    "recommended_specializations": [
        {{"name": "specialization1", "match_percentage": 85, "reason": "Why this matches"}}
    ],
    "severity": "low|moderate|high",
    "confidence": "low|medium|high",
    "additional_notes": "Any important notes",
    "emergency_warning": false,
    "should_show_doctors": true
}}

For GENERAL CONVERSATION (greetings, questions, off-topic):
{{
    "response_type": "conversation",
    "message": "Your friendly conversational response",
    "should_show_doctors": false
}}

For FOLLOW-UP QUESTIONS about health:
{{
    "response_type": "follow_up",
    "message": "Your question asking for more details about their symptoms",
    "should_show_doctors": false
}}

GUIDELINES:
- Be concise but thorough
- Show empathy and understanding
- If symptoms seem severe, indicate urgency
- Encourage professional consultation
- Stay within the healthcare context but handle off-topic gracefully

Respond ONLY with valid JSON, no additional text."""

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
                result["message"] = "I'm here to help you with your health concerns. Could you please tell me more about how you're feeling?"
            if "response_type" not in result:
                result["response_type"] = "conversation"
            if "should_show_doctors" not in result:
                result["should_show_doctors"] = result.get("response_type") == "symptom_analysis"
            
            return result
            
        except json.JSONDecodeError as e:
            print(f"JSON parsing error in chat: {e}")
            return {
                "response_type": "conversation",
                "message": "I'm sorry, I had trouble processing that. Could you please rephrase your question or describe your symptoms in a different way?",
                "should_show_doctors": False
            }
        except Exception as e:
            print(f"Chat response error: {e}")
            return {
                "response_type": "conversation",
                "message": "I apologize, but I'm experiencing some technical difficulties. Please try again in a moment.",
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
        
        Args:
            patient_description: Patient's description of their problems
            available_specializations: List of available doctor specializations
            available_symptoms: List of symptom objects with name, description, and specialization
        
        Returns:
            Dict containing detected symptoms, suggested specializations, and severity
        """
        try:
            # Create symptom mapping for context
            symptom_context = "\n".join([
                f"- {s['name']}: {s.get('description', 'N/A')} (Related to: {s.get('specialization', 'General')})"
                for s in available_symptoms[:50]  # Limit to avoid token limits
            ])
            
            spec_context = ", ".join(available_specializations)
            
            # Construct the prompt
            prompt = f"""You are a medical AI assistant helping to analyze patient symptoms and recommend appropriate medical specialists.

Patient's Description: "{patient_description}"

Available Symptoms in Database:
{symptom_context}

Available Medical Specializations:
{spec_context}

Based on the patient's description, analyze and provide a response in the following JSON format:

{{
    "detected_symptoms": ["symptom1", "symptom2", ...],
    "symptom_analysis": "Brief explanation of what symptoms were identified",
    "recommended_specializations": [
        {{"name": "specialization1", "match_percentage": 85, "reason": "Why this specialization matches"}},
        {{"name": "specialization2", "match_percentage": 70, "reason": "Why this specialization matches"}}
    ],
    "severity": "low|moderate|high",
    "confidence": "low|medium|high",
    "additional_notes": "Any important additional information or red flags",
    "emergency_warning": "true if immediate medical attention needed, otherwise false"
}}

Guidelines:
1. Match the patient's description to the available symptoms in the database as closely as possible
2. Recommend only specializations that are available in the database
3. If symptoms suggest multiple specializations, list them in order of relevance with match percentages (0-100)
4. The match_percentage should reflect how well the symptoms match that specialization
5. Assess severity based on described symptoms
6. If symptoms are severe or life-threatening, set emergency_warning to true
7. Be conservative and professional in your assessment

Respond ONLY with valid JSON, no additional text."""

            # Generate response
            response = self.model.generate_content(prompt)
            response_text = response.text.strip()
            
            # Extract JSON from response (handle markdown code blocks)
            json_match = re.search(r'```json\n(.*?)\n```', response_text, re.DOTALL)
            if json_match:
                response_text = json_match.group(1)
            else:
                # Try to find JSON object
                json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
                if json_match:
                    response_text = json_match.group(0)
            
            # Parse JSON response
            analysis = json.loads(response_text)
            
            # Validate and clean the response
            recommended_specs = analysis.get("recommended_specializations", [])
            # Handle both old format (list of strings) and new format (list of objects)
            if recommended_specs and isinstance(recommended_specs[0], str):
                recommended_specs = [
                    {"name": spec, "match_percentage": 75, "reason": "Based on symptom analysis"}
                    for spec in recommended_specs
                ]
            
            cleaned_analysis = {
                "detected_symptoms": analysis.get("detected_symptoms", []),
                "symptom_analysis": analysis.get("symptom_analysis", "Unable to analyze symptoms"),
                "recommended_specializations": recommended_specs,
                "severity": analysis.get("severity", "moderate").lower(),
                "confidence": analysis.get("confidence", "medium").lower(),
                "additional_notes": analysis.get("additional_notes", ""),
                "emergency_warning": str(analysis.get("emergency_warning", "false")).lower() == "true"
            }
            
            return cleaned_analysis
            
        except json.JSONDecodeError as e:
            print(f"JSON parsing error: {e}")
            print(f"Response text: {response_text}")
            # Return a fallback response
            return {
                "detected_symptoms": [],
                "symptom_analysis": "Unable to parse AI response. Please try rephrasing your symptoms.",
                "recommended_specializations": [],
                "severity": "moderate",
                "confidence": "low",
                "additional_notes": "There was an error processing your request. Please consult a healthcare professional.",
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
            prompt = f"""As a medical AI assistant, provide brief, general health advice for someone experiencing these symptoms:

Symptoms: {', '.join(symptoms)}
Severity: {severity}

Provide:
1. General self-care recommendations (if appropriate for severity)
2. When to seek medical attention
3. What to monitor

Keep the response concise (3-4 sentences) and professional. Always emphasize consulting healthcare professionals for proper diagnosis."""

            response = self.model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            return "Please consult a healthcare professional for proper medical advice and diagnosis."


# Create a singleton instance
ai_service = AIService()
