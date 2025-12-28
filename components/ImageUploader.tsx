import React, { useCallback, useState } from 'react';

interface ImageUploaderProps {
  onImageUpload: (files: File[]) => void;
}

const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);


export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onImageUpload(Array.from(e.dataTransfer.files));
    }
  }, [onImageUpload]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onImageUpload(Array.from(e.target.files));
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div 
        className={`w-full p-8 text-center border-2 border-dashed rounded-lg transition-colors duration-300 ${isDragging ? 'border-indigo-500 bg-slate-700/50' : 'border-slate-600 hover:border-indigo-600 hover:bg-slate-800/70'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png"
        onChange={handleChange}
        className="hidden"
        multiple
      />
      <div className="flex flex-col items-center justify-center space-y-4">
        <UploadIcon />
        <p className="text-slate-300">
          <span className="font-semibold text-indigo-400 cursor-pointer" onClick={onButtonClick}>Click to upload</span> or drag and drop
        </p>
        <p className="text-sm text-slate-500">PNG images only</p>
      </div>
    </div>
  );
};