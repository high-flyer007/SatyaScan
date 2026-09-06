import {
  ArrowLeft,
  CheckCircle2,
  Flag,
  Maximize2,
  Minus,
  Plus,
  RotateCcw,
  ScanSearch,
  Sparkles,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import { extractTextFromImage } from '../services/ocrService'
import { parseDeclarations } from '../services/declarationParser'
import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useInspections } from '../context/InspectionContext'
import { getInspectionImage } from '../services/imageStorage'
import { analyzeCompliance } from "../services/aiComplianceService";

interface ExtractedField {
  id: string
  label: string
  value: string
  confidence: number
  status: 'PASS' | 'FAIL' | 'REVIEW'
  reason?: string
}


export default function InspectionAnalysis() {
  const navigate = useNavigate()
  const { inspectionId } = useParams()
  const {
  getInspection,
  updateInspection,
} = useInspections()

  const inspection = inspectionId
    ? getInspection(inspectionId)
    : undefined

    const [selectedField, setSelectedField] = useState('')

  const [progress, setProgress] = useState(0)
  const [analysisComplete, setAnalysisComplete] =
    useState(false)

  const [ocrText, setOcrText] = useState('')
  const [ocrConfidence, setOcrConfidence] = useState(0)
  const [ocrProgress, setOcrProgress] = useState(0)
  const [ocrRunning, setOcrRunning] = useState(false)
  const [ocrError, setOcrError] = useState('')

  const [parsedDeclarations, setParsedDeclarations] =
    useState<ReturnType<typeof parseDeclarations>>([])

  const [zoom, setZoom] = useState(100)

  const [image, setImage] = useState('')
const [imageType, setImageType] = useState('')

// Load the actual inspection image from IndexedDB
useEffect(() => {
  if (!inspection?.images?.[0]) {
    setImage('')
    setImageType('')
    return
  }

  let cancelled = false

  const loadImage = async () => {
    try {
      const storedImage = await getInspectionImage(
        inspection.images[0],
      )

      if (!storedImage) {
        console.error(
          'SatyaScan: inspection image not found in IndexedDB.',
        )

        if (!cancelled) {
          setImage('')
          setImageType('')
        }

        return
      }

      if (cancelled) return

      // IndexedDB stores the image as a Base64/data URL string.
      // Use it directly instead of URL.createObjectURL().
      setImage(storedImage)

      // Detect the MIME type from the data URL when available.
      const mimeMatch = storedImage.match(
        /^data:([^;,]+)/
      )

      setImageType(
        mimeMatch?.[1] || 'image'
      )
    } catch (error) {
      console.error(
        'SatyaScan: unable to load inspection image:',
        error,
      )

      if (!cancelled) {
        setImage('')
        setImageType('')
      }
    }
  }

  loadImage()

  return () => {
    cancelled = true
  }
}, [inspection?.images])
  // Analysis progress
  // Analysis progress follows the real OCR process
useEffect(() => {
  if (ocrRunning) {
    setAnalysisComplete(false)
    setProgress(ocrProgress)
    return
  }

  if (ocrError) {
    setAnalysisComplete(false)
    setProgress(0)
    return
  }

  if (ocrText) {
    setProgress(100)
    setAnalysisComplete(true)
  }
}, [ocrRunning, ocrProgress, ocrError, ocrText])

  // Real OCR
  // Run OCR on the actual image loaded from IndexedDB
useEffect(() => {
  if (!image) {
    setOcrText('')
    setOcrConfidence(0)
    setOcrProgress(0)
    setOcrError(
      'No inspection image is available for OCR.',
    )
    setOcrRunning(false)
    return
  }

  let cancelled = false

  const runOCR = async () => {
    try {
      setOcrRunning(true)
      setOcrError('')
      setOcrText('')
      setOcrConfidence(0)
      setOcrProgress(0)
      setParsedDeclarations([])

      const result = await extractTextFromImage(
        image,
        (progressValue) => {
          if (!cancelled) {
            setOcrProgress(progressValue)
          }
        },
      )

      if (cancelled) return

      setOcrText(result.text)
      setOcrConfidence(result.confidence)
      setOcrProgress(100)
      setOcrRunning(false)
      setAnalysisComplete(true)
      setProgress(100)
    } catch (error) {
      console.error(
        'SatyaScan OCR failed:',
        error,
      )

      if (!cancelled) {
        setOcrRunning(false)
        setAnalysisComplete(false)
        setProgress(0)
        setOcrError(
          'OCR could not read this image. Please try a clearer package photo.',
        )
      }
    }
  }

  runOCR()

  return () => {
    cancelled = true
  }
}, [image])
  // Convert OCR text into structured declarations
  useEffect(() => {
  if (!ocrText || !inspectionId) {
    setParsedDeclarations([])
    return
  }

  const declarations = parseDeclarations(
    ocrText,
    ocrConfidence,
  )

  setParsedDeclarations(declarations)

  const extractedData: NonNullable<
    typeof inspection
  >['extractedData'] = {}

  for (const declaration of declarations) {
    extractedData[declaration.field] =
      declaration.value
  }

  void analyzeCompliance({
  image,
  ocrText,
  extractedData,
})
  .then((aiResult) => {
    console.log(
      "SatyaScan Gemini compliance result:",
      aiResult,
    );

    updateInspection(inspectionId, {
      aiCompliance: aiResult,
    });
  })
  .catch((error) => {
    console.error(
      "SatyaScan Gemini compliance analysis failed:",
      error,
    );
  });

  updateInspection(inspectionId, {
    extractedData,
    ocrText,
    ocrConfidence,
    status: 'review',
  })
}, [
  ocrText,
  ocrConfidence,
  inspectionId,
  updateInspection,
])

  const extractedFields: ExtractedField[] =
    parsedDeclarations.map((declaration) => {
      const fieldConfig: Record<
        string,
        {
          id: string
          label: string
        }
      > = {
        netQuantity: {
          id: 'net-weight',
          label: 'Net Quantity',
        },

        mrp: {
          id: 'mrp',
          label: 'MRP',
        },

        manufacturingDate: {
          id: 'mfg-date',
          label: 'Manufacturing Date',
        },

        expiryDate: {
          id: 'expiry-date',
          label: 'Expiry / Best Before',
        },

        batchNumber: {
          id: 'batch-number',
          label: 'Batch / Lot Number',
        },

        consumerCare: {
          id: 'consumer-care',
          label: 'Consumer Care',
        },

        manufacturer: {
          id: 'manufacturer',
          label: 'Manufacturer',
        },
      }

      const config = fieldConfig[declaration.field]

      return {
        id: config?.id || declaration.field,

        label:
          config?.label || declaration.field,

        value: declaration.value,

        confidence: declaration.confidence,

        status: 'REVIEW',

        reason:
          `Detected from OCR source text: ${declaration.sourceText}`,
      }
    })

  // Keep the first detected declaration selected
  useEffect(() => {
    if (
      parsedDeclarations.length > 0 &&
      !parsedDeclarations.some((declaration) => {
        const idMap: Record<string, string> = {
          netQuantity: 'net-weight',
          mrp: 'mrp',
          manufacturingDate: 'mfg-date',
          expiryDate: 'expiry-date',
          batchNumber: 'batch-number',
          consumerCare: 'consumer-care',
          manufacturer: 'manufacturer',
        }

        return (
          idMap[declaration.field] === selectedField
        )
      })
    ) {
      const idMap: Record<string, string> = {
        netQuantity: 'net-weight',
        mrp: 'mrp',
        manufacturingDate: 'mfg-date',
        expiryDate: 'expiry-date',
        batchNumber: 'batch-number',
        consumerCare: 'consumer-care',
        manufacturer: 'manufacturer',
      }

      setSelectedField(
        idMap[parsedDeclarations[0].field] ||
          parsedDeclarations[0].field,
      )
    }
  }, [parsedDeclarations, selectedField])

  const selected = extractedFields.find(
    (field) => field.id === selectedField,
  )
  // Hooks must run before any conditional return
  if (!inspection) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-50">
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h2 className="text-lg font-bold text-[#0B2347]">
            Inspection Not Found
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            The inspection{' '}
            {inspectionId
              ? `#${inspectionId}`
              : ''}{' '}
            could not be found.
          </p>

          <button
            onClick={() =>
              navigate('/inspection/new')
            }
            className="mt-5 rounded-lg bg-[#0B2347] px-4 py-2 text-sm font-semibold text-white hover:bg-[#12345F]"
          >
            Create New Inspection
          </button>
        </div>
      </div>
    )
  }


  return (
    <div className="flex min-h-[calc(100vh-72px)] flex-col">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white px-7 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/inspection/new')}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              <ArrowLeft size={18} />
            </button>

            <div>
              <h1 className="text-[22px] font-bold text-[#0B2347]">
                Extracted Declarations & Evidence Viewer
              </h1>

              <p className="mt-1 text-xs text-slate-500">
              {inspection.productName} • Review AI-extracted declarations before running the compliance check.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Case ID
              </p>

              <p className="text-sm font-semibold text-[#0B2347]">
                #{inspectionId || 'INSP-0000'}
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2">
              <span className="h-2 w-2 rounded-full bg-blue-500" />

              <span
            className={`text-xs font-semibold ${
            ocrRunning
            ? 'text-blue-700'
            : ocrError
            ? 'text-red-700'
            : 'text-green-700'
            }`}
            >
            {ocrRunning
            ? 'AI Extraction Active'
            : ocrError
            ? 'Extraction Failed'
            : 'AI Extraction Complete'}
            </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action bar */}
      <div className="flex items-center justify-end gap-3 border-b border-slate-200 bg-slate-50 px-7 py-3">
        <button
          className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <Flag size={16} />
          Flag for Manual Audit
        </button>

        <button
          disabled={!analysisComplete}
          onClick={() =>
          navigate(`/inspection/${inspectionId}/compliance`)
        }
          className="flex items-center gap-2 rounded-lg bg-[#0B2347] px-4 py-2 text-sm font-semibold text-white hover:bg-[#12345F] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <CheckCircle2 size={16} />
          Confirm All Extractions
        </button>
      </div>

      {/* Main viewer */}
      <div className="grid flex-1 grid-cols-[minmax(0,1fr)_390px] gap-5 bg-slate-50 p-5">
        {/* Image viewer */}
        <section className="flex min-h-[600px] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">
          {/* Image toolbar */}
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-slate-700">
                Source Document
              </p>

              <p className="text-xs text-slate-400">
                 {imageType
                ? `${imageType} product image`
                : 'Product packaging image'}
                </p>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() =>
                  setZoom((value) =>
                    Math.max(50, value - 10),
                  )
                }
                className="rounded-md p-2 text-slate-500 hover:bg-slate-100"
              >
                <ZoomOut size={17} />
              </button>

              <span className="min-w-[50px] text-center text-xs font-semibold text-slate-500">
                {zoom}%
              </span>

              <button
                onClick={() =>
                  setZoom((value) =>
                    Math.min(150, value + 10),
                  )
                }
                className="rounded-md p-2 text-slate-500 hover:bg-slate-100"
              >
                <ZoomIn size={17} />
              </button>

              <button className="rounded-md p-2 text-slate-500 hover:bg-slate-100">
                <Maximize2 size={17} />
              </button>
            </div>
          </div>

          {/* Image */}
          <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-slate-100 p-8">
            <div
              className="relative max-h-[650px] max-w-[800px] overflow-hidden rounded-lg bg-white shadow-lg transition-transform"
              style={{
                transform: `scale(${zoom / 100})`,
              }}
            >
              {image ? (
                <img
                src={image}
                alt="Product packaging"
                className="max-h-[620px] max-w-[760px] object-contain"
            />
            ) : (
  <div className="flex h-[400px] w-full items-center justify-center text-sm text-slate-400">
    Loading inspection image...
  </div>
)}

              {/* Evidence boxes */}
              <button
                onClick={() => setSelectedField('net-weight')}
                className={`absolute left-[18%] top-[40%] h-[10%] w-[35%] border-2 ${
                  selectedField === 'net-weight'
                    ? 'border-green-500 bg-green-400/10'
                    : 'border-green-400/60'
                }`}
              />

              <button
                onClick={() => setSelectedField('mrp')}
                className={`absolute left-[15%] top-[52%] h-[11%] w-[50%] border-2 ${
                  selectedField === 'mrp'
                    ? 'border-red-500 bg-red-400/10'
                    : 'border-red-400/60'
                }`}
              />

              <button
                onClick={() =>
                  setSelectedField('mfg-date')
                }
                className={`absolute left-[20%] top-[65%] h-[9%] w-[38%] border-2 ${
                  selectedField === 'mfg-date'
                    ? 'border-green-500 bg-green-400/10'
                    : 'border-green-400/60'
                }`}
              />
            </div>

            <div className="absolute bottom-4 right-4 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-500 shadow-sm">
              Evidence regions detected automatically
            </div>
          </div>

          {/* Bottom progress */}
          <div className="border-t border-slate-200 px-5 py-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles
                  size={16}
                  className="text-[#0B4A8B]"
                />

                <span className="text-sm font-semibold text-slate-700">
                  AI Extraction
                </span>
              </div>

              <span className="text-xs font-semibold text-slate-500">
                {analysisComplete
                  ? 'Analysis complete'
                  : `${progress}%`}
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-[#0B4A8B] transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </section>

        {/* Extraction panel */}
        <section className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-sm font-bold text-[#0B2347]">
        Live OCR Extraction
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {ocrRunning
          ? `Reading package text... ${ocrProgress}%`
          : ocrError
            ? 'OCR failed'
            : `OCR confidence: ${ocrConfidence.toFixed(1)}%`}
      </p>
    </div>

    <span
      className={`rounded-md px-2 py-1 text-[9px] font-bold ${
        ocrRunning
          ? 'bg-blue-50 text-blue-700'
          : ocrError
            ? 'bg-red-50 text-red-700'
            : 'bg-green-50 text-green-700'
      }`}
    >
      {ocrRunning
        ? 'PROCESSING'
        : ocrError
          ? 'ERROR'
          : 'COMPLETE'}
    </span>
  </div>

  {ocrRunning && (
    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
      <div
        className="h-full rounded-full bg-[#0B4A8B] transition-all"
        style={{ width: `${ocrProgress}%` }}
      />
    </div>
  )}

  {ocrError && (
    <div className="mt-3 rounded-lg border border-red-100 bg-red-50 p-3">
      <p className="text-xs leading-5 text-red-600">
        {ocrError}
      </p>
    </div>
  )}

  {!ocrRunning && !ocrError && (
    <div className="mt-3 max-h-48 overflow-y-auto rounded-lg border border-slate-200 bg-white p-3">
      <pre className="whitespace-pre-wrap text-xs leading-5 text-slate-700">
        {ocrText || 'No text detected.'}
      </pre>
    </div>
  )}
</div>
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-lg font-bold text-[#0B2347]">
              Extracted Declarations
            </h2>

            <p className="mt-1 text-xs text-slate-500">
  {parsedDeclarations.length}{' '}
  {parsedDeclarations.length === 1
    ? 'declaration'
    : 'declarations'}{' '}
  detected from OCR
</p>
          </div>

          {/* Table header */}
          <div className="grid grid-cols-[1fr_1fr_65px_65px] border-b border-slate-200 bg-slate-50 px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-slate-500">
            <span>Declaration</span>
            <span>Value</span>
            <span>Conf</span>
            <span>Status</span>
          </div>

          {/* Fields */}
          <div className="flex-1 overflow-y-auto">
            {extractedFields.map((field) => (
              <button
                key={field.id}
                onClick={() => setSelectedField(field.id)}
                className={`grid w-full grid-cols-[1fr_1fr_65px_65px] border-b border-slate-100 px-4 py-4 text-left transition ${
                  selectedField === field.id
                    ? 'bg-blue-50/60'
                    : 'hover:bg-slate-50'
                }`}
              >
                <span className="text-sm font-semibold text-slate-700">
                  {field.label}
                </span>

                <span
                  className={`break-words text-sm ${
                    field.status === 'FAIL'
                      ? 'font-semibold text-red-600'
                      : 'text-slate-700'
                  }`}
                >
                  {field.value}
                </span>

                <span
                  className={`text-xs font-semibold ${
                    field.confidence < 80
                      ? 'text-orange-600'
                      : 'text-slate-600'
                  }`}
                >
                  {field.confidence}%
                </span>

                <span>
                  <span
                    className={`inline-flex rounded-md border px-2 py-1 text-[9px] font-bold ${
                      field.status === 'PASS'
                        ? 'border-green-200 bg-green-50 text-green-700'
                        : field.status === 'FAIL'
                          ? 'border-red-200 bg-red-50 text-red-700'
                          : 'border-orange-200 bg-orange-50 text-orange-700'
                    }`}
                  >
                    {field.status}
                  </span>
                </span>
              </button>
            ))}
          </div>

          {/* Selected field */}
          {selected && (
            <div
              className={`border-t-4 p-5 ${
                selected.status === 'FAIL'
                  ? 'border-red-500'
                  : selected.status === 'REVIEW'
                    ? 'border-orange-400'
                    : 'border-green-500'
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#0B2347]">
                  {selected.label}
                </h3>

                <span
                  className={`rounded-md px-2 py-1 text-[10px] font-bold ${
                    selected.status === 'PASS'
                      ? 'bg-green-50 text-green-700'
                      : selected.status === 'FAIL'
                        ? 'bg-red-50 text-red-700'
                        : 'bg-orange-50 text-orange-700'
                  }`}
                >
                  {selected.status}
                </span>
              </div>

              <div className="mt-3 rounded-lg bg-slate-50 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  Extracted Value
                </p>

                <p className="mt-1 text-lg font-bold text-slate-800">
                  {selected.value}
                </p>
              </div>

              {selected.reason && (
                <div className="mt-3 rounded-lg border border-red-100 bg-red-50 p-3">
                  <p className="text-xs font-semibold text-red-700">
                    Violation Reason
                  </p>

                  <p className="mt-1 text-xs leading-5 text-red-600">
                    {selected.reason}
                  </p>
                </div>
              )}

              <div className="mt-4 grid grid-cols-2 gap-2">
                <button className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                  Edit Value
                </button>

                <button className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                  Override Status
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}