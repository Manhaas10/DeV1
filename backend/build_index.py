from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.docstore.document import Document

# Load text from docs.txt
with open("docs.txt", "r", encoding="utf-8") as f:
    raw_text = f.read()

# Split into chunks
splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=100)
texts = splitter.split_text(raw_text)
documents = [Document(page_content=t) for t in texts]

# Create embedding model
embedding_model = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

# Create FAISS vectorstore
vectorstore = FAISS.from_documents(documents, embedding_model)

# Save vectorstore to disk
vectorstore.save_local("faiss_index")
print("✅ FAISS index saved to ./faiss_index")
