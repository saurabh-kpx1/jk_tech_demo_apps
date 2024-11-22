import sys
import os
from pathlib import Path

# Add the parent directory to the Python path
current_dir = Path(__file__).resolve().parent
parent_dir = current_dir.parent
sys.path.append(str(parent_dir))

from dotenv import load_dotenv
load_dotenv()

from flask import Flask, request, jsonify
from flask_cors import CORS  # Import CORS
from langchain_groq import ChatGroq
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import FAISS
from langchain.docstore.document import Document
import psycopg2

app = Flask(__name__)
CORS(app)  # Enable CORS for the Flask app

# Load api keys from .env file
groq_api_key = os.getenv("groq_api_key")
openai_api_key = os.getenv("openai_api_key")

if not groq_api_key:
    raise ValueError("Please add the Groq API key")

if not openai_api_key:
    raise ValueError("Please provide OpenAI API key for embeddings")

# Assuming necessary variables for tool creation are available
postgres_uri = os.getenv("postgres_uri")
postgres_user = os.getenv("postgres_user")
postgres_password = os.getenv("postgres_password")
postgres_host = os.getenv("postgres_host")

# PostgreSQL connection
connection = psycopg2.connect(
    dbname=postgres_uri,
    user=postgres_user,
    password=postgres_password,
    host=postgres_host,
    port=5432  
)

# Set the search path to include the public schema
try:
    with connection.cursor() as cursor:
        cursor.execute("SET search_path TO public;")
        print("Search path set to public schema")
except psycopg2.Error as e:
    print(f"Error setting search path: {e}")
    connection.rollback()

# Initialize OpenAI embeddings
embeddings = OpenAIEmbeddings(openai_api_key=openai_api_key)

# Create a custom QA chain
template = """Use the following pieces of context to answer the question at the end. 
If you don't know the answer, just say that you don't know, don't try to make up an answer.

Context:
{context}

Question: {question}
Answer:"""

prompt = PromptTemplate(
    input_variables=["context", "question"],
    template=template,
)
def postgres_retriever(documentName: str = "") -> str:
    try:
        with connection.cursor() as cursor:
            cursor.execute('SELECT content FROM public.tbl_documents WHERE "documentName" = %s;', (documentName,))
            row = cursor.fetchone()
            return row[0] if row else ""
    except psycopg2.Error as e:
        print(f"Error retrieving document: {e}")
        connection.rollback()
        return ""

@app.route('/chat', methods=['POST'])
def chat():
    user_query = request.json.get('query')
    documentName = request.json.get('documentName')
    print (f"documentName: {documentName}")
    if not user_query:
        return jsonify({"error": "No query provided"}), 400

    try:
        # Retrieve context from PostgreSQL
        context_str = postgres_retriever(documentName)  # Assuming document_id is 1
        print(f"Retrieved context: {context_str}")

        # Create embeddings for the context
        context_embeddings = embeddings.embed_documents([context_str])

        # Use FAISS to index the embeddings
        vector_store = FAISS.from_documents(documents=[Document(page_content=context_str)], embedding=embeddings)

        # Retrieve the most relevant context using the embeddings
        relevant_context = vector_store.similarity_search(user_query, k=1)
        relevant_context_str = "\n".join([doc.page_content for doc in relevant_context])

        # Limit the context to a maximum of 600 tokens
        relevant_context_str = " ".join(relevant_context_str.split()[:600])

        # Create ChatGroq instance
        llm = ChatGroq(groq_api_key=groq_api_key, model_name="Llama3-8b-8192", streaming=True)

        # Run LLMChain
        chain = LLMChain(llm=llm, prompt=prompt)
        response = chain.run(context=relevant_context_str, question=user_query)

        return jsonify({"response": response})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=9931)