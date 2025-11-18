import express from "express"
import multer from "multer"
import fs from "fs"
import { fromPath } from "pdf2pic"
import pdfCounter from "pdf-page-counter"
import Tesseract from "tesseract.js"

const app = express()

const upload = multer({ dest: "uploads/" })

app.get("/", (req, res) => {
  res.json({ message: "OCR JS server working" })
})

app.post("/ocr", upload.single("file"), async (req, res) => {
  try {
    const filePath = req.file.path

    // get page count
    const buffer = fs.readFileSync(filePath)
    const { numpages } = await pdfCounter(buffer)

    const converter = fromPath(filePath, {
      density: 200,
      saveFilename: "page",
      savePath: "./uploads",
      format: "png"
    })

    let finalText = ""

    for (let page = 1; page <= numpages; page++) {
      const result = await converter(page)
      const imgPath = result.path

      const { data } = await Tesseract.recognize(imgPath, "eng")
      finalText += data.text + "\n"

      fs.unlinkSync(imgPath)
    }

    fs.unlinkSync(filePath)

    res.json({ text: finalText.trim() })
  } catch (err) {
    console.error("OCR ERROR:", err)
    res.status(500).json({ error: "OCR failed" })
  }
})

app.listen(process.env.PORT || 3000, () => {
  console.log("Server running")
})
