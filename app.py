# from fastapi import FastAPI, UploadFile, File
# import pytesseract
# from pdf2image import convert_from_bytes
# import io

# app = FastAPI()

# @app.post("/ocr-pdf")
# async def ocr_pdf(file: UploadFile = File(...)):
#     content = await file.read()

#     try:
#         pages = convert_from_bytes(content)
#     except:
#         return {"error": "Invalid PDF."}

#     full_text = ""

#     for page in pages:
#         text = pytesseract.image_to_string(page)
#         full_text += text + "\n"

#     return {"extracted_text": full_text}


# @app.get("/check")
# async def check():
#     """Simple health/check endpoint that prints a message and returns a JSON payload."""
#     print("/check endpoint was called")
#     return {"status": "ok", "message": "Service is running."}
