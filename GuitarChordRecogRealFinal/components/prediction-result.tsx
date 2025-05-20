import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Music } from "lucide-react"

type PredictionResultProps = {
  result: {
    predicted_chord: string
    confidence: number
    top_predictions: Array<{
      chord: string
      confidence: number
    }>
  }
  filename: string
}

export default function PredictionResult({ result, filename }: PredictionResultProps) {
  const { predicted_chord, confidence, top_predictions } = result

  // Get color based on confidence
  const getConfidenceColor = (conf: number) => {
    if (conf >= 0.8) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
    if (conf >= 0.5) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
    return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
  }

  return (
    <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/20">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 mr-2" />
            <CardTitle className="text-emerald-700 dark:text-emerald-400">Prediction Result</CardTitle>
          </div>
          <Badge variant="outline" className="font-normal">
            {filename}
          </Badge>
        </div>
        <CardDescription>Here's what our model predicts for your audio</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Main prediction */}
          <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
            <div className="flex items-center">
              <Music className="h-8 w-8 text-emerald-600 mr-3" />
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Predicted Chord</p>
                <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{predicted_chord}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500 dark:text-slate-400">Confidence</p>
              <div className="flex items-center">
                <span
                  className={`inline-block px-2 py-1 rounded-md text-sm font-medium ${getConfidenceColor(confidence)}`}
                >
                  {(confidence * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* Alternative predictions */}
          <div>
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Alternative Predictions</h3>
            <div className="space-y-2">
              {top_predictions.slice(1).map((pred, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm"
                >
                  <span className="font-medium text-slate-700 dark:text-slate-300">{pred.chord}</span>
                  <span
                    className={`inline-block px-2 py-1 rounded-md text-xs font-medium ${getConfidenceColor(pred.confidence)}`}
                  >
                    {(pred.confidence * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
