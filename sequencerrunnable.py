
from dotenv import load_dotenv
load_dotenv()

from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser


# 1. Prompt Template
prompt = ChatPromptTemplate.from_template(
    "Explain {topic} in simple words"
)

# 2. Model
model = ChatGroq(model="llama-3.3-70b-versatile")

# 3. Output Parser
parser = StrOutputParser()


chain = prompt | model | parser

result = chain.invoke({"topic": "Machine Learning"})
print(result)
