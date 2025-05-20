"use client"

import { useState } from "react"
import { Upload, History, Music } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import UploadForm from "@/components/upload-form"
import PredictionHistory from "@/components/prediction-history"
import { Toaster } from "@/components/ui/toaster"

export default function Home() {
  const [activeTab, setActiveTab] = useState("upload")

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Music className="h-10 w-10 text-emerald-600 mr-2" />
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Guitar Chord Predictor</h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Upload a WAV file of a guitar chord and our AI model will predict which chord you're playing.
          </p>
        </header>

        <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden">
          <Tabs defaultValue="upload" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b border-slate-200 dark:border-slate-700">
              <TabsList className="w-full bg-transparent justify-start p-0">
                <TabsTrigger
                  value="upload"
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-none rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-600 px-6 py-3"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload & Predict
                </TabsTrigger>
                <TabsTrigger
                  value="history"
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-none rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-600 px-6 py-3"
                >
                  <History className="h-4 w-4 mr-2" />
                  Prediction History
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6">
              <TabsContent value="upload" className="mt-0">
                <UploadForm />
              </TabsContent>

              <TabsContent value="history" className="mt-0">
                <PredictionHistory />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
      <Toaster />
    </main>
  )
}
