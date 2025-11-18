import express from "express"
import multer from "multer"
import { createWorker } from "tesseract.js"

const app = express()
const upload = multer()

app.get("/", (req, res) => {
  res.json({ message: "JS OCR running" })
})

app.post("/ocr", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" })
  }

  const worker = await createWorker("eng")

  try {
    const result = await worker.recognize(req.file.buffer)
    await worker.terminate()
    res.json({ text: result.data.text })
  } catch (err) {
    await worker.terminate()
    res.status(500).json({ error: "OCR failed", details: err.toString() })
  }
})

app.listen(process.env.PORT || 8080, "0.0.0.0", () => {
  console.log("Server running")
})
