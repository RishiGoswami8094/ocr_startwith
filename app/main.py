from fastapi import FastAPI, UploadFile, File
from .ocr import process_pdf

app = FastAPI()

@app.get("/")
def root():
    return {"message": "Hello from Railway"}

@app.post("/ocr")
async def ocr_endpoint(file: UploadFile = File(...)):
    pdf_bytes = await file.read()
    text = process_pdf(pdf_bytes)
    return {"text": text}
