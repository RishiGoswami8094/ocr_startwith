import express from "express"
import multer from "multer"
import { fromPath } from "pdf2pic"
import Tesseract from "tesseract.js"
import fs from "fs"

const app = express()
const upload = multer({ dest: "uploads/" })

app.post("/ocr", upload.single("file"), async (req, res) => {
  try {
    const filePath = req.file.path

    // Convert PDF to images
    const convert = fromPath(filePath, {
      density: 200,
      saveFilename: "page",
      savePath: "./uploads",
      format: "png",
      width: 1200,
      height: 1600,
    })

    const pages = await convert(1, true) // convert all pages
    const images = pages instanceof Array ? pages : [pages]

    let finalText = ""

    for (const img of images) {
      const result = await Tesseract.recognize(img.path, "eng")
      finalText += result.data.text + "\n"
      fs.unlinkSync(img.path)
    }

    fs.unlinkSync(filePath)

    res.json({ text: finalText.trim() })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "OCR failed" })
  }
})

app.get("/", (req, res) => {
  res.send("OCR server running")
})

app.listen(8080, () => console.log("Server running"))
