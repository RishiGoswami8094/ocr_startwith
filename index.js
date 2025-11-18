import express from "express"
import multer from "multer"
import pdfParse from "pdf-parse"
import { createWorker } from "tesseract.js"
import fs from "fs"
import { getDocument } from "pdfjs-dist/build/pdf.mjs"
import canvas from "canvas"

const app = express()
const upload = multer({ dest: "uploads/" })

app.post("/ocr", upload.single("file"), async (req, res) => {
    try {
        const pdfBuffer = fs.readFileSync(req.file.path)

        const pdfInfo = await pdfParse(pdfBuffer)
        if (pdfInfo.text.trim().length > 0) {
            return res.json({ text: pdfInfo.text })
        }

        const doc = await getDocument({ data: pdfBuffer }).promise
        const worker = await createWorker("eng")

        let finalText = ""

        for (let i = 1; i <= doc.numPages; i++) {
            const page = await doc.getPage(i)
            const viewport = page.getViewport({ scale: 2 })

            const cnv = canvas.createCanvas(viewport.width, viewport.height)
            const ctx = cnv.getContext("2d")

            await page.render({ canvasContext: ctx, viewport }).promise

            const imageBuffer = cnv.toBuffer("image/png")

            const result = await worker.recognize(imageBuffer)
            finalText += result.data.text + "\n"
        }

        await worker.terminate()
        fs.unlinkSync(req.file.path)

        res.json({ text: finalText })

    } catch (e) {
        console.error("OCR FAILED", e)
        res.json({ error: "OCR failed" })
    }
})

app.listen(3000, () => console.log("Server running"))
