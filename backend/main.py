from fastapi import FastAPI, Request
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
import google.generativeai as genai
import os

from dotenv import load_dotenv

# Load env variables
load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-1.5-flash")

# Initialize FastAPI
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load vectorstore
embedding_model = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
db = FAISS.load_local(
    "faiss_index",
    embeddings=embedding_model,
    allow_dangerous_deserialization=True
)
retriever = db.as_retriever()

# Request models
class Query(BaseModel):
    text: str

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: list[ChatMessage]

# Gemini call wrapper
def ask_gemini(prompt: str) -> str:
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Gemini error: {e}"

# Routes
@app.post("/explain")
async def explain(query: Query):
    context_docs = retriever.get_relevant_documents(query.text)
    prompt = f"Explain this briefly :\n\n{query.text}"
    return {"explanation": ask_gemini(prompt)}

@app.post("/summarize")
async def summarize(query: Query):
    prompt = f"Summarize this:\n\n{query.text}"
    return {"summary": ask_gemini(prompt)}

@app.post("/reply")
async def reply(query: Query):
    prompt = f"Generate a smart reply to:\n\n{query.text}"
    return {"reply": ask_gemini(prompt)}

@app.post("/more")
async def expand(query: Query):
    prompt = f"Explain this briefly:\n\n{query.text}"
    return {"expansion": ask_gemini(prompt)}

@app.post("/chat")
async def chat_endpoint(request: Request):
    data = await request.json()
    messages = data["messages"]  # list of {role, content}

    # ✅ Convert to Gemini format
    formatted = [{"role": msg["role"], "parts": [msg["content"]]} for msg in messages]

    try:
        chat = model.start_chat(history=formatted)
        response = chat.send_message(messages[-1]["content"])  # just send last user input
        return {"reply": response.text}
    except Exception as e:
        return {"reply": f"Gemini error: {e}"}
