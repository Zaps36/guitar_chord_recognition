"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trash2, Music, Clock, Search, FileAudio } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/components/ui/use-toast"
import { getPredictions, clearPredictions } from "@/lib/prediction-service"
import PredictionResult from "@/components/prediction-result"

type Prediction = {
  id: string
  filename: string
  timestamp: string
  result: {
    predicted_chord: string
    confidence: number
    top_predictions: Array<{
      chord: string
      confidence: number
    }>
  }
}

export default function PredictionHistory() {
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPrediction, setSelectedPrediction] = useState<Prediction | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadPredictions()
  }, [])

  const loadPredictions = () => {
    const data = getPredictions()
    setPredictions(data)
  }

  const handleClearHistory = () => {
    clearPredictions()
    setPredictions([])
    setSelectedPrediction(null)
    toast({
      title: "History cleared",
      description: "All prediction history has been cleared",
    })
  }

  const filteredPredictions = predictions.filter(
    (pred) =>
      pred.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pred.result.predicted_chord.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500 dark:text-slate-400" />
          <Input
            type="text"
            placeholder="Search by filename or chord..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="destructive" size="sm" onClick={handleClearHistory} disabled={predictions.length === 0}>
          <Trash2 className="h-4 w-4 mr-2" />
          Clear History
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 h-[500px] flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Clock className="h-5 w-5 mr-2 text-slate-500" />
              Prediction History
            </CardTitle>
            <CardDescription>
              {predictions.length} prediction{predictions.length !== 1 ? "s" : ""} recorded
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow overflow-hidden p-0">
            {predictions.length === 0 ? (
              <div className="h-full flex items-center justify-center p-6">
                <div className="text-center text-slate-500 dark:text-slate-400">
                  <Music className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p>No predictions yet</p>
                  <p className="text-sm mt-1">Upload a WAV file to get started</p>
                </div>
              </div>
            ) : filteredPredictions.length === 0 ? (
              <div className="h-full flex items-center justify-center p-6">
                <div className="text-center text-slate-500 dark:text-slate-400">
                  <Search className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p>No matching predictions</p>
                  <p className="text-sm mt-1">Try a different search term</p>
                </div>
              </div>
            ) : (
              <ScrollArea className="h-[400px] px-4">
                <div className="space-y-2 pt-2 pb-4">
                  {filteredPredictions.map((prediction) => (
                    <div
                      key={prediction.id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedPrediction?.id === prediction.id
                          ? "bg-emerald-100 dark:bg-emerald-900/30"
                          : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
                      }`}
                      onClick={() => setSelectedPrediction(prediction)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center">
                          <FileAudio className="h-4 w-4 mr-2 text-slate-500 dark:text-slate-400" />
                          <div className="truncate max-w-[150px]" title={prediction.filename}>
                            {prediction.filename}
                          </div>
                        </div>
                        <Badge variant="outline" className="ml-2 text-xs">
                          {prediction.result.predicted_chord}
                        </Badge>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {formatDate(prediction.timestamp)}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Music className="h-5 w-5 mr-2 text-slate-500" />
              Prediction Details
            </CardTitle>
            <CardDescription>Select a prediction from the history to view details</CardDescription>
          </CardHeader>
          <CardContent>
            {selectedPrediction ? (
              <PredictionResult result={selectedPrediction.result} filename={selectedPrediction.filename} />
            ) : (
              <div className="h-[300px] flex items-center justify-center">
                <div className="text-center text-slate-500 dark:text-slate-400">
                  <Music className="h-16 w-16 mx-auto mb-4 opacity-20" />
                  <p>No prediction selected</p>
                  <p className="text-sm mt-1">Click on a prediction from the history to view details</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
