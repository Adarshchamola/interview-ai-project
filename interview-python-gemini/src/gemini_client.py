
# import os
# import google.generativeai as genai

# # Configure Gemini with your API key from .env
# genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# # Load the model once at startup
# MODEL_NAME = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")

# def get_model():
#     """Return a configured Gemini GenerativeModel instance."""
#     return genai.GenerativeModel(
#         model_name=MODEL_NAME,
#         generation_config={
#             "temperature": 0.7,
#             "max_output_tokens": 2048,
#         },
#         safety_settings=[
#             {"category": "HARM_CATEGORY_HARASSMENT",        "threshold": "BLOCK_NONE"},
#             {"category": "HARM_CATEGORY_HATE_SPEECH",       "threshold": "BLOCK_NONE"},
#             {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
#             {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"},
#         ]
#     )

# def generate(prompt: str, temperature: float = 0.7, max_tokens: int = 1500) -> str:
#     """
#     Send a prompt to Gemini and return the text response.
#     This is the single function all three modules use.
#     """
#     model = genai.GenerativeModel(
#         model_name=MODEL_NAME,
#         generation_config={
#             "temperature": temperature,
#             "max_output_tokens": max_tokens,
#         },
#         safety_settings=[
#             {"category": "HARM_CATEGORY_HARASSMENT",        "threshold": "BLOCK_NONE"},
#             {"category": "HARM_CATEGORY_HATE_SPEECH",       "threshold": "BLOCK_NONE"},
#             {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
#             {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"},
#         ]
#     )
#     response = model.generate_content(prompt)
#     return response.text.strip()
import os
from groq import Groq

client = Groq(api_key=os.getenv("GEMINI_API_KEY"))
MODEL = "llama-3.3-70b-versatile"

def generate(prompt: str, temperature: float = 0.7, max_tokens: int = 1500) -> str:
    response = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=temperature,
        max_tokens=max_tokens,
    )
    return response.choices[0].message.content.strip()
