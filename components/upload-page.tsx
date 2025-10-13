"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, FileText, CheckCircle2, AlertCircle, Download, Info } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [uploaderName, setUploaderName] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      if (selectedFile.type === "text/csv" || selectedFile.name.endsWith(".csv")) {
        setFile(selectedFile)
        setUploadStatus("idle")
        setErrorMessage("")
      } else {
        setErrorMessage("Please upload a CSV file")
        setFile(null)
      }
    }
  }

  const downloadSampleCSV = () => {
    const sampleData = `location,latitude,longitude,co2_ppm,co_ppm,hcho_mgm3,pm25_ugm3,pm10_ugm3,water_vapour,temperature_c,humidity_percent,source_file,STATE
Lugbe Market,8.98427935,7.376422,445,0,0.002,68,90.1,6365,36,68,sensor_001,ABUJA
City Gate,9.034679,7.448315,725,7,0.002,47.3,59,4449,34,50,sensor_002,ABUJA
Gbosa Market,8.940684,7.298538,434,0,0.002,15,19.8,2020,36,51,sensor_003,ABUJA`

    const blob = new Blob([sampleData], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "sample_environmental_data.csv"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file) {
      setErrorMessage("Please select a CSV file to upload")
      return
    }

    if (!uploaderName.trim()) {
      setErrorMessage("Please enter your name")
      return
    }

    setIsUploading(true)
    setUploadStatus("idle")
    setErrorMessage("")

    const formData = new FormData()
    formData.append("file", file)
    formData.append("uploaderName", uploaderName)

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        setUploadStatus("success")
        setSuccessMessage(`${data.count} records uploaded successfully  ${uploaderName} thanks for contributing!`)
        setFile(null)
        setUploaderName("")
        const fileInput = document.getElementById("file-upload") as HTMLInputElement
        if (fileInput) fileInput.value = ""
      } else {
        setUploadStatus("error")
        setErrorMessage(data.error || "Failed to upload file")
      }
    } catch (error) {
      setUploadStatus("error")
      setErrorMessage("An error occurred while uploading the file")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-cyan-500 rounded-2xl mb-4">
            <Upload className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-3">Upload Environmental Data</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Upload CSV files containing environmental sensor data to visualize on the interactive map
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-cyan-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="h-5 w-5 text-cyan-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">CSV Format</h3>
                  <p className="text-sm text-slate-600">Upload data in standard CSV format with required columns</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-cyan-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Info className="h-5 w-5 text-cyan-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">Auto-Tracking</h3>
                  <p className="text-sm text-slate-600">Your name and upload time are automatically recorded</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-cyan-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="h-5 w-5 text-cyan-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">Instant Sync</h3>
                  <p className="text-sm text-slate-600">Data appears on the map immediately after upload</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-lg border-slate-200">
          <CardHeader className="border-b bg-slate-50">
            <CardTitle className="text-2xl">Upload Your Data</CardTitle>
            <CardDescription className="text-base">
              Fill in your details and select a CSV file to upload environmental sensor readings
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="uploader-name" className="text-base font-semibold text-slate-900">
                  Your Name
                </Label>
                <Input
                  id="uploader-name"
                  type="text"
                  placeholder="Enter your full name"
                  value={uploaderName}
                  onChange={(e) => setUploaderName(e.target.value)}
                  className="h-12 text-base"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="file-upload" className="text-base font-semibold text-slate-900">
                  CSV File
                </Label>
                <div className="space-y-3">
                  <div className="relative">
                    <Input
                      id="file-upload"
                      type="file"
                      accept=".csv"
                      onChange={handleFileChange}
                      className="h-12 cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100"
                      required
                    />
                  </div>
                  {file && (
                    <div className="flex items-center gap-2 p-3 bg-cyan-50 border border-cyan-200 rounded-lg">
                      <FileText className="h-5 w-5 text-cyan-600 flex-shrink-0" />
                      <span className="text-sm font-medium text-cyan-900 truncate">{file.name}</span>
                      <span className="text-xs text-cyan-600 ml-auto">{(file.size / 1024).toFixed(2)} KB</span>
                    </div>
                  )}
                </div>
              </div>

              {uploadStatus === "success" && (
                <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-green-900">Upload Successful!</p>
                    <p className="text-sm text-green-700 mt-1">{successMessage}</p>
                  </div>
                </div>
              )}

              {uploadStatus === "error" && errorMessage && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-900">Upload Failed</p>
                    <p className="text-sm text-red-700 mt-1">{errorMessage}</p>
                  </div>
                </div>
              )}

              {uploadStatus === "idle" && errorMessage && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{errorMessage}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={isUploading || !file || !uploaderName.trim()}
                className="w-full h-12 text-base bg-cyan-500 hover:bg-cyan-600 text-white border-cyan-500 hover:border-cyan-600"
              >
                {isUploading ? (
                  <>
                    <Spinner className="mr-2" />
                    Uploading to Supabase...
                  </>
                ) : (
                  <>
                    <Upload className="h-5 w-5 mr-2" />
                    Upload Data
                  </>
                )}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg text-slate-900">Need a Sample CSV?</h3>
                <Button
                  type="button"
                  variant="outline"
                  onClick={downloadSampleCSV}
                  className="border-cyan-500 text-cyan-600 hover:bg-cyan-50 bg-transparent"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Sample
                </Button>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-sm text-slate-600 mb-3">Your CSV file should include these columns in order:</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                  {[
                    "location",
                    "latitude",
                    "longitude",
                    "co2_ppm",
                    "co_ppm",
                    "hcho_mgm3",
                    "pm25_ugm3",
                    "pm10_ugm3",
                    "water_vapour",
                    "temperature_c",
                    "humidity_percent",
                    "source_file",
                    "STATE",
                  ].map((col) => (
                    <div key={col} className="px-2 py-1 bg-white rounded border border-slate-200">
                      <code className="text-cyan-600 font-mono">{col}</code>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
