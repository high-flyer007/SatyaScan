import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  FileImage,
  MapPin,
  Plus,
  Upload,
} from 'lucide-react'
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useInspections } from '../context/InspectionContext'
import { saveInspectionImage } from '../services/imageStorage'

interface ProductImage {
  id: string
  file: File
  preview: string
  type: 'front' | 'back' | 'side' | 'other'
}

export default function NewInspection() {
  const navigate = useNavigate()
  const { createInspection, updateInspection} = useInspections()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [images, setImages] = useState<ProductImage[]>([])
  const [productName, setProductName] = useState('')
  const [manufacturer, setManufacturer] = useState('')
  const [location, setLocation] = useState('Pune')
  const [inspector, setInspector] = useState('Alex Officer')

  const handleFiles = (files: FileList | null) => {
  if (!files) return

  const selectedFiles = Array.from(files)

  selectedFiles.forEach((file, index) => {
    const reader = new FileReader()

    reader.onload = () => {
      const preview = reader.result as string

      const newImage: ProductImage = {
        id: `${Date.now()}-${index}`,
        file,
        preview,
        type:
          images.length === 0 && index === 0
            ? 'front'
            : 'other',
      }

      setImages((current) => [...current, newImage])
    }

    reader.readAsDataURL(file)
  })
}

  const removeImage = (id: string) => {
    setImages((current) =>
      current.filter((image) => image.id !== id),
    )
  }

  const startInspection = async () => {
  if (!productName.trim() || images.length === 0) return

  try {
    // 1. Store the actual images in IndexedDB first.
    const imageIds: string[] = []

    for (const image of images) {
      const storedImageId = await saveInspectionImage(image.preview)
      imageIds.push(storedImageId)
    }

    // 2. Create the inspection only after the images are safely stored.
    const inspection = createInspection({
      productName: productName.trim(),
      manufacturer: manufacturer.trim(),
      location: location.trim(),
      inspector: inspector.trim(),
      images: imageIds,
    })

    // 3. Move the newly-created inspection into AI analysis.
    updateInspection(inspection.id, {
      status: 'analyzing',
    })

    // 4. Continue using the exact inspection ID that was created.
    navigate(`/inspection/${inspection.id}/analysis`)
  } catch (error) {
    console.error('Unable to start inspection:', error)
    alert('Unable to save the inspection. Please try again.')
  }
}


  return (
    <div className="px-7 py-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
        >
          <ArrowLeft size={18} />
        </button>

        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-[#0B2347]">
            New Inspection
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Create an inspection and upload product packaging
            images for AI analysis.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-[1.1fr_1.4fr] gap-6">
        {/* Inspection details */}
        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-[#0B2347]">
              Inspection Details
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Enter the basic information for this inspection.
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Product Name
              </label>

              <input
                value={productName}
                onChange={(e) =>
                  setProductName(e.target.value)
                }
                placeholder="e.g. Premium Basmati Rice 5kg"
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-[#0B4A8B] focus:ring-2 focus:ring-blue-50"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Manufacturer
              </label>

              <input
                value={manufacturer}
                onChange={(e) =>
                  setManufacturer(e.target.value)
                }
                placeholder="e.g. AgriFoods India Ltd."
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-[#0B4A8B] focus:ring-2 focus:ring-blue-50"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Inspection Location
              </label>

              <div className="relative">
                <MapPin
                  size={17}
                  className="absolute left-3 top-3 text-slate-400"
                />

                <input
                  value={location}
                  onChange={(e) =>
                    setLocation(e.target.value)
                  }
                  className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-[#0B4A8B]"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Inspector
              </label>

              <input
                value={inspector}
                onChange={(e) =>
                  setInspector(e.target.value)
                }
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0B4A8B]"
              />
            </div>
          </div>
        </section>

        {/* Image upload */}
        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="mb-5 flex items-start justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#0B2347]">
                Product Images
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Upload front, back, side or close-up images of
                the package.
              </p>
            </div>

            <div className="rounded-lg bg-blue-50 p-2 text-[#0B4A8B]">
              <Camera size={20} />
            </div>
          </div>

          {/* Drop zone */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-10 transition hover:border-blue-400 hover:bg-blue-50/30"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
              <Upload
                size={22}
                className="text-[#0B4A8B]"
              />
            </div>

            <p className="mt-4 text-sm font-semibold text-slate-700">
              Click to upload product images
            </p>

            <p className="mt-1 text-xs text-slate-500">
              PNG, JPG or JPEG • Multiple images supported
            </p>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg"
            multiple
            hidden
            onChange={(e) => handleFiles(e.target.files)}
          />

          {/* Images */}
          {images.length > 0 && (
            <div className="mt-5 grid grid-cols-3 gap-3">
              {images.map((image) => (
                <div
                  key={image.id}
                  className="group relative overflow-hidden rounded-lg border border-slate-200"
                >
                  <img
                    src={image.preview}
                    alt="Product"
                    className="h-28 w-full object-cover"
                  />

                  <button
                    onClick={() => removeImage(image.id)}
                    className="absolute right-2 top-2 hidden rounded-md bg-red-600 px-2 py-1 text-xs font-semibold text-white group-hover:block"
                  >
                    Remove
                  </button>

                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1 text-[10px] text-white">
                    {image.type.toUpperCase()}
                  </div>
                </div>
              ))}

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex h-28 items-center justify-center rounded-lg border border-dashed border-slate-300 text-slate-400 hover:bg-slate-50"
              >
                <Plus size={22} />
              </button>
            </div>
          )}

          {images.length === 0 && (
            <div className="mt-5 flex items-center gap-3 rounded-lg bg-slate-50 p-3">
              <FileImage
                size={18}
                className="text-slate-400"
              />

              <p className="text-xs text-slate-500">
                At least one clear product image is recommended
                for AI extraction.
              </p>
            </div>
          )}
        </section>
      </div>

      {/* Footer */}
      <div className="mt-6 flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <CheckCircle2 size={16} className="text-green-600" />
          Images will be processed securely by SatyaScan AI.
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            disabled={!productName || images.length === 0}
            onClick={startInspection}
            className="rounded-lg bg-[#0B2347] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#12345F] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Start AI Inspection
          </button>
        </div>
      </div>
    </div>
  )
}