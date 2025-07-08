import React, { useState, useRef } from 'react';
import { Upload, File } from 'lucide-react';

interface Document {
  id: string;
  filename: string;
  uploadTime: string;
  fileType: string;
}

interface FileUploadProps {
  onUpload: (documents: Document[]) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUpload }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  const handleFiles = async (files: File[]) => {
    if (files.length === 0) return;

    const allowedTypes = ['.pdf', '.docx', '.txt'];
    const validFiles = files.filter(file => {
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      return allowedTypes.includes(ext);
    });

    if (validFiles.length === 0) {
      alert('Please select valid files (PDF, DOCX, or TXT)');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      validFiles.forEach(file => {
        formData.append('documents', file);
      });

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle partial or complete failure
        let errorMessage = 'Upload failed:\n';
        if (data.failedFiles && data.failedFiles.length > 0) {
          data.failedFiles.forEach((failedFile: any) => {
            errorMessage += `• ${failedFile.filename}: ${failedFile.error}\n`;
          });
        }
        if (data.error) {
          errorMessage += data.error;
        }
        alert(errorMessage);
        return;
      }

      // Success case
      onUpload(data.files);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Show detailed results
      let resultMessage = `Successfully uploaded ${data.successCount} file(s)`;
      if (data.failureCount > 0) {
        resultMessage += `\n\nFailed to upload ${data.failureCount} file(s):\n`;
        data.failedFiles.forEach((failedFile: any) => {
          resultMessage += `• ${failedFile.filename}: ${failedFile.error}\n`;
        });
      }
      
      alert(resultMessage);
      
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error uploading files. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.docx,.txt"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragOver
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-sm text-gray-600 mb-2">
          Drag and drop files here, or{' '}
          <button
            type="button"
            onClick={openFileDialog}
            className="text-blue-600 hover:text-blue-500 font-medium"
          >
            browse
          </button>
        </p>
        <p className="text-xs text-gray-500">
          Supported formats: PDF, DOCX, TXT (DOC files not supported - please convert to DOCX)
        </p>
      </div>

      {/* Upload Progress */}
      {isUploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload; 