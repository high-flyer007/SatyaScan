import { createWorker } from 'tesseract.js'

export interface OCRResult {
  text: string
  confidence: number
}

export async function extractTextFromImage(
  imageSource: string,
  onProgress?: (progress: number) => void,
): Promise<OCRResult> {
  const worker = await createWorker('eng', 1, {
    logger: (message) => {
      if (
        message.status === 'recognizing text' &&
        typeof message.progress === 'number'
      ) {
        onProgress?.(Math.round(message.progress * 100))
      }
    },
  })

  try {
    const result = await worker.recognize(imageSource)

    return {
      text: result.data.text,
      confidence: result.data.confidence,
    }
  } finally {
    await worker.terminate()
  }
}