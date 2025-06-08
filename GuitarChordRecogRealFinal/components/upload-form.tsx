"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, Music, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import PredictionResult from "@/components/prediction-result"
import { savePrediction } from "@/lib/prediction-service"

type PredictionStatus = "idle" | "uploading" | "processing" | "success" | "error"
type PredictionResultType = {
  predicted_chord: string
  confidence: number
  top_predictions: Array<{
    chord: string
    confidence: number
  }>
}

export default function UploadForm() {
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<PredictionStatus>("idle")
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<PredictionResultType | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.type !== "audio/wav") {
        toast({
          title: "Invalid file type",
          description: "Please upload a WAV file",
          variant: "destructive",
        })
        return
      }
      setFile(selectedFile)
      setStatus("idle")
      setResult(null)
      setError(null)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files?.[0]
    if (droppedFile) {
      if (droppedFile.type !== "audio/wav") {
        toast({
          title: "Invalid file type",
          description: "Please upload a WAV file",
          variant: "destructive",
        })
        return
      }
      setFile(droppedFile)
      setStatus("idle")
      setResult(null)
      setError(null)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleUpload = async () => {
    if (!file) return

    try {
      setStatus("uploading")
      setProgress(0)
      setError(null)

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 300)

      // Create form data
      const formData = new FormData()
      formData.append("file", file)

      // Send to backend
      setStatus("processing")
      const response = await fetch("http://localhost:5000/step5", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to process audio")
      }

      const data = await response.json()
      setResult(data)
      setStatus("success")

      // Save to history
      savePrediction({
        id: Date.now().toString(),
        filename: file.name,
        timestamp: new Date().toISOString(),
        result: data,
      })

      toast({
        title: "Prediction complete!",
        description: `The predicted chord is ${data.predicted_chord}`,
      })
    } catch (err) {
      setStatus("error")
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      toast({
        title: "Prediction failed",
        description: err instanceof Error ? err.message : "An unknown error occurred",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFile(null)
    setStatus("idle")
    setProgress(0)
    setResult(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-6">
      {/* File Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center ${
          file ? "border-emerald-300 bg-emerald-50 dark:bg-emerald-950/20" : "border-slate-300 dark:border-slate-700"
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {!file ? (
          <div className="space-y-4">
            <div className="flex justify-center">
              <Upload className="h-12 w-12 text-slate-400" />
            </div>
            <div>
              <p className="text-lg font-medium text-slate-700 dark:text-slate-300">Drag and drop your WAV file here</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">or click to browse</p>
            </div>
            <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="mt-2">
              Select WAV File
            </Button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".wav" className="hidden" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center">
              <Music className="h-12 w-12 text-emerald-600" />
            </div>
            <div>
              <p className="text-lg font-medium text-slate-700 dark:text-slate-300">{file.name}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{(file.size / 1024).toFixed(2)} KB</p>
            </div>
            <div className="flex justify-center space-x-2">
              <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                Change File
              </Button>
              <Button onClick={resetForm} variant="destructive">
                Remove
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Progress and Status */}
      {status !== "idle" && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {status === "uploading"
                ? "Uploading..."
                : status === "processing"
                  ? "Processing..."
                  : status === "success"
                    ? "Completed"
                    : "Failed"}
            </span>
            <span className="text-sm text-slate-500 dark:text-slate-400">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Prediction Result */}
      {result && <PredictionResult result={result} filename={file?.name || ""} />}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={resetForm} disabled={status === "uploading" || status === "processing"}>
          Reset
        </Button>
        <Button
          onClick={handleUpload}
          disabled={!file || status === "uploading" || status === "processing"}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          {status === "uploading" || status === "processing" ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Music className="mr-2 h-4 w-4" />
              Predict Chord
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
