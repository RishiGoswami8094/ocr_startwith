import fitz  # PyMuPDF
import numpy as np
import cv2
from paddleocr import PaddleOCR

ocr_engine = PaddleOCR(use_angle_cls=True, lang="en")  # load once

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
    # PaddleOCR requires RGB
    rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

    result = ocr_engine.ocr(rgb, cls=True)

    if not result:
        return ""

    text_lines = []

    for line in result:
        for box, text_data in line:
            text_lines.append(text_data[0])

    return "\n".join(text_lines)


def process_pdf(pdf_bytes):
    images = pdf_to_images(pdf_bytes)

    if not images:
        return "No pages detected in PDF"

    final_text = []

    for img in images:
        txt = image_to_text(img)
        final_text.append(txt)

    return "\n".join(final_text)
