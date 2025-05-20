// Type definitions
export type Prediction = {
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

// Local storage key
const STORAGE_KEY = "guitar-chord-predictions"

// Get all predictions from local storage
export function getPredictions(): Prediction[] {
  if (typeof window === "undefined") return []

  const storedData = localStorage.getItem(STORAGE_KEY)
  if (!storedData) return []

  try {
    return JSON.parse(storedData)
  } catch (error) {
    console.error("Failed to parse predictions from localStorage:", error)
    return []
  }
}

// Save a new prediction to local storage
export function savePrediction(prediction: Prediction): void {
  if (typeof window === "undefined") return

  const predictions = getPredictions()
  predictions.unshift(prediction) // Add to beginning of array

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(predictions))
  } catch (error) {
    console.error("Failed to save prediction to localStorage:", error)
  }
}

// Clear all predictions from local storage
export function clearPredictions(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(STORAGE_KEY)
}
