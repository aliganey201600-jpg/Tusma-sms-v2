"use client"

import * as React from "react"
import { Upload, X, File, Loader2, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/utils/supabase/client"
import { toast } from "sonner"

interface FileUploadProps {
  bucket: string
  path: string
  onUploadComplete?: (url: string) => void
  label?: string
}

export function FileUpload({ bucket, path, onUploadComplete, label = "Upload File" }: FileUploadProps) {
  const [isUploading, setIsUploading] = React.useState(false)
  const [file, setFile] = React.useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = React.useState(0)
  const [uploadedUrl, setUploadedUrl] = React.useState<string | null>(null)
  
  const supabase = createClient()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const uploadFile = async () => {
    if (!file) return

    setIsUploading(true)
    setUploadProgress(0)

    const fileName = `${Date.now()}-${file.name}`
    const filePath = `${path}/${fileName}`

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      toast.error(`Upload failed: ${error.message}`)
      setIsUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath)

    setUploadedUrl(publicUrl)
    setIsUploading(false)
    toast.success("File uploaded successfully!")
    
    if (onUploadComplete) {
      onUploadComplete(publicUrl)
    }
  }

  const reset = () => {
    setFile(null)
    setUploadedUrl(null)
    setUploadProgress(0)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-8 bg-slate-50/50 dark:bg-slate-900/50 transition-colors hover:border-primary/50 relative">
        {!file && !uploadedUrl && (
          <>
            <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
              <Upload className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">{label}</p>
            <p className="text-xs text-muted-foreground">Click to browse or drag and drop files here.</p>
            <input 
              type="file" 
              className="absolute inset-0 opacity-0 cursor-pointer" 
              onChange={handleFileChange}
            />
          </>
        )}

        {file && !uploadedUrl && (
          <div className="w-full space-y-4">
            <div className="flex items-center gap-3 p-4 bg-background rounded-xl border border-slate-100 shadow-sm relative">
              <File className="h-8 w-8 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={reset}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <Button 
              className="w-full h-11 rounded-xl gap-2" 
              onClick={uploadFile} 
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Start Upload"
              )}
            </Button>
          </div>
        )}

        {uploadedUrl && (
          <div className="flex flex-col items-center text-center py-4">
            <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <p className="text-sm font-bold text-foreground mb-1">Upload Complete!</p>
            <p className="text-xs text-muted-foreground mb-6">Your file is now available in the system.</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="h-9 px-4 rounded-lg" asChild>
                <a href={uploadedUrl} target="_blank" rel="noopener noreferrer">View File</a>
              </Button>
              <Button variant="ghost" size="sm" className="h-9 px-4 rounded-lg text-destructive" onClick={reset}>
                Remove
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
