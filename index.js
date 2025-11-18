import express from "express"
import multer from "multer"
import pdfParse from "pdf-parse"
import { createWorker } from "tesseract.js"
import fs from "fs"
import { getDocument } from "pdfjs-dist/legacy/build/pdf.js"

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

            const canvasFactory = {
                create: (w, h) => {
                    const Canvas = require("canvas")
                    const canvas = Canvas.createCanvas(w, h)
                    return { canvas, context: canvas.getContext("2d") }
                },
                reset() {},
                destroy() {}
            }

            const renderContext = {
                canvasContext: canvasFactory.create(viewport.width, viewport.height).context,
                viewport
            }

            await page.render(renderContext).promise

            const image = renderContext.canvasContext.canvas.toBuffer("image/png")
            const result = await worker.recognize(image)
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
