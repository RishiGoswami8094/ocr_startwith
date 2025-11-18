import fitz  # PyMuPDF
from PIL import Image
import numpy as np
import easyocr

# Load EasyOCR reader once
reader = easyocr.Reader(['en'], gpu=False)


def pdf_to_images(pdf_bytes):
    images = []
    pdf = fitz.open(stream=pdf_bytes, filetype="pdf")

    for page_index in range(len(pdf)):
        page = pdf.load_page(page_index)
        pix = page.get_pixmap(dpi=200)

        img_bytes = pix.tobytes("png")

        # Convert to PIL Image
        img = Image.open(fitz.BytesIO(img_bytes)).convert("RGB")
        images.append(img)

    return images


def image_to_text(img):
    # EasyOCR accepts numpy arrays
    np_img = np.array(img)

    result = reader.readtext(np_img, detail=1)

    if not result:
        return ""

    # result structure: [ [bbox, text, confidence], ... ]
    text_lines = [item[1] for item in result]

    return "\n".join(text_lines)


def process_pdf(pdf_bytes):
    images = pdf_to_images(pdf_bytes)

    if not images:
        return "No pages detected in PDF"

    final_text = []

    for img in images:
        text = image_to_text(img)
        final_text.append(text)

    return "\n".join(final_text)
