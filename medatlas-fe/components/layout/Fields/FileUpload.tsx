'use client';

import { useDropzone } from 'react-dropzone';

interface FileUploadProps {
  onFilesAdded: (files: File[]) => void;
}

export default function FileUpload({ onFilesAdded }: FileUploadProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onFilesAdded,
    multiple: true,
    maxSize: 5 * 1024 * 1024,
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
        isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
      }`}
    >
      <input {...getInputProps()} />
      <p className="mt-2 text-sm text-gray-600">
        <span className="font-medium text-blue-600 hover:text-blue-500">Click to upload</span> or drag & drop
      </p>
      <p className="text-xs text-gray-500 mt-1">PDF, DOC, PNG, JPG up to 5MB</p>
    </div>
  );
}
