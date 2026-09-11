import { useState, useRef, useCallback } from 'react'
import { Camera, Upload, X, CheckCircle, AlertCircle } from 'lucide-react'
import type { Diagnosis, Problem } from '../lib/api'
import { streamDiagnosis } from '../lib/api'
import './WorkUpload.css'

interface Props {
  sessionId: string
  onThinking: (step: string) => void
  onDiagnosis: (d: Diagnosis, mastery: Record<string, number>, next: Problem | null) => void
}

export default function WorkUpload({ sessionId, onThinking, onDiagnosis }: Props) {
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [cameraOpen, setCameraOpen] = useState(false)

  const handleFile = (f: File) => {
    setFile(f)
    setDiagnosis(null)
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target?.result as string)
    reader.readAsDataURL(f)
  }

  const openCamera = async () => {
    setCameraOpen(true)
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
    if (videoRef.current) videoRef.current.srcObject = stream
  }

  const capturePhoto = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d')!.drawImage(video, 0, 0)
    canvas.toBlob((blob) => {
      if (!blob) return
      const f = new File([blob], 'work.jpg', { type: 'image/jpeg' })
      handleFile(f)
      ;(video.srcObject as MediaStream)?.getTracks().forEach(t => t.stop())
      setCameraOpen(false)
    }, 'image/jpeg', 0.9)
  }

  const analyze = useCallback(() => {
    if (!file || !sessionId) return
    setUploading(true)
    streamDiagnosis(
      sessionId,
      file,
      onThinking,
      (d, mastery, next) => {
        setDiagnosis(d)
        setUploading(false)
        onDiagnosis(d, mastery, next)
      },
    )
  }, [file, sessionId, onThinking, onDiagnosis])

  return (
    <div className="work-upload">
      <h3 className="upload-title">📷 Show Your Work</h3>

      {cameraOpen ? (
        <div className="camera-view">
          <video ref={videoRef} autoPlay playsInline className="camera-video" />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          <div className="camera-actions">
            <button className="btn btn-primary" onClick={capturePhoto} aria-label="Take photo of handwritten work">📸 Capture</button>
            <button className="btn btn-ghost" onClick={() => setCameraOpen(false)} aria-label="Cancel camera capture">Cancel</button>
          </div>
        </div>
      ) : preview ? (
        <div className="preview-container">
          <img src={preview} alt="Your work" className="work-preview" />

          {/* Visual mistake-highlight overlay directly on top of handwritten work */}
          {diagnosis && !diagnosis.is_correct && (() => {
            const b = diagnosis.bounding_hint || diagnosis.bounding_box
            const x = b ? ('x' in b && b.x !== undefined ? b.x : (b.left ?? 10)) : 10
            const y = b ? ('y' in b && b.y !== undefined ? b.y : (b.top ?? 35)) : 35
            const w = b?.width ?? 80
            const h = b?.height ?? 22

            return (
              <div
                className="error-bounding-box"
                style={{
                  top: `${y}%`,
                  left: `${x}%`,
                  width: `${w}%`,
                  height: `${h}%`,
                }}
              >
                <div className="box-reticle-corner top-left" />
                <div className="box-reticle-corner top-right" />
                <div className="box-reticle-corner bottom-left" />
                <div className="box-reticle-corner bottom-right" />
                <div className="box-badge">
                  <AlertCircle size={12} />
                  <span>Step {diagnosis.step_number}: {diagnosis.misconception_type.replace(/_/g, ' ')}</span>
                </div>
              </div>
            )
          })()}

          {diagnosis && diagnosis.is_correct && (
            <div
              className="success-bounding-box"
              style={{
                top: '12%',
                left: '8%',
                width: '84%',
                height: '74%',
              }}
            >
              <div className="box-badge success">
                <CheckCircle size={12} />
                <span>Verified correct reasoning</span>
              </div>
            </div>
          )}

          {diagnosis && (
            <div className={`diagnosis-overlay ${diagnosis.is_correct ? 'correct' : 'incorrect'}`}>
              {diagnosis.is_correct ? (
                <div className="diagnosis-result correct">
                  <CheckCircle size={20} />
                  <span>Correct! Well done.</span>
                </div>
              ) : (
                <div className="diagnosis-result incorrect">
                  <AlertCircle size={20} />
                  <div>
                    <strong>{diagnosis.misconception_type.replace(/_/g, ' ')}</strong>
                    <p>at Step {diagnosis.step_number}</p>
                  </div>
                </div>
              )}
            </div>
          )}
          <button
            className="clear-btn"
            onClick={() => { setPreview(null); setFile(null); setDiagnosis(null) }}
            aria-label="Remove uploaded image"
            title="Remove image"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div
          className="upload-zone"
          role="button"
          tabIndex={0}
          aria-label="Upload photo of handwritten work. Click to browse or drag and drop."
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
        >
          <Upload size={32} color="var(--text-muted)" />
          <p>Drop your photo here<br /><span>or click to browse</span></p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
      />

      <div className="upload-actions">
        {!cameraOpen && (
          <button
            className="btn btn-ghost"
            onClick={openCamera}
            style={{ gap: '6px' }}
            aria-label="Open camera to capture work photo"
          >
            <Camera size={16} /> Camera
          </button>
        )}
        {file && !diagnosis && (
          <button
            className="btn btn-primary"
            onClick={analyze}
            disabled={uploading}
            aria-label="Check handwritten work photo"
          >
            {uploading ? '🔍 Checking steps…' : '🔍 Check My Work'}
          </button>
        )}
      </div>

      {diagnosis && !diagnosis.is_correct && (
        <div className="diagnosis-detail animate-fadein">
          <p className="diagnosis-desc">{diagnosis.description}</p>
          <p className="corrective-q">💬 {diagnosis.corrective_question}</p>
        </div>
      )}
    </div>
  )
}
