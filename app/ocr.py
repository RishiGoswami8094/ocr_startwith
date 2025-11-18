import fitz  # PyMuPDF
import numpy as np
import cv2
import pytesseract
from io import BytesIO


def pdf_to_images(pdf_bytes):
    images = []
    pdf = fitz.open(stream=pdf_bytes, filetype="pdf")

    for page_index in range(len(pdf)):
        page = pdf.load_page(page_index)
        pix = page.get_pixmap(dpi=200)
        img_bytes = pix.tobytes("png")
        img = cv2.imdecode(np.frombuffer(img_bytes, np.uint8), cv2.IMREAD_COLOR)
        images.append(img)

    return images


def image_to_text(img):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    text = pytesseract.image_to_string(gray)
    return text


def process_pdf(pdf_bytes):
    images = pdf_to_images(pdf_bytes)

    if not images:
        return "No pages detected in PDF"

    final_text = []

    for img in images:
        text = image_to_text(img)
        final_text.append(text)

    return "\n".join(final_text)
