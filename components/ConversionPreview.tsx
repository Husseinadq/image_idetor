import React from 'react';
import type { ImageData, ConvertedImageData } from '../App';
import { formatFileSize } from '../utils/formatFileSize';

interface ConversionPreviewProps {
  originalImages: ImageData[];
  convertedImages: ConvertedImageData[];
  quality: number;
  onQualityChange: (quality: number) => void;
  onReset: () => void;
}

const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);

const RefreshIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.885-.666A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566z" clipRule="evenodd" />
    </svg>
);

export const ConversionPreview: React.FC<ConversionPreviewProps> = ({ originalImages, convertedImages, quality, onQualityChange, onReset }) => {
  const handleDownloadAll = () => {
    convertedImages.forEach((image, index) => {
        const originalImage = originalImages[index];
        const link = document.createElement('a');
        link.href = image.url;
        link.download = originalImage.file.name.replace(/\.png$/, '.webp');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
  };

  const handleDownloadSingle = (convertedImage: ConvertedImageData, originalImage: ImageData) => {
    const link = document.createElement('a');
    link.href = convertedImage.url;
    link.download = originalImage.file.name.replace(/\.png$/, '.webp');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const totalOriginalSize = originalImages.reduce((acc, img) => acc + img.size, 0);
  const totalConvertedSize = convertedImages.reduce((acc, img) => acc + img.size, 0);
  const totalSizeReduction = totalOriginalSize > 0 ? ((totalOriginalSize - totalConvertedSize) / totalOriginalSize) * 100 : 0;

  return (
    <div className="w-full animate-fade-in">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div>
                    <label htmlFor="quality" className="block text-sm font-medium text-slate-300 mb-2">
                        Quality ({Math.round(quality * 100)}%)
                    </label>
                    <input
                        id="quality"
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.05"
                        value={quality}
                        onChange={(e) => onQualityChange(parseFloat(e.target.value))}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-self-start md:justify-self-end">
                    <button
                        onClick={onReset}
                        className="flex items-center justify-center w-full sm:w-auto px-5 py-2.5 text-sm font-medium text-center text-white bg-slate-700 rounded-lg hover:bg-slate-600 focus:ring-4 focus:outline-none focus:ring-slate-500 transition-colors"
                    >
                       <span className="mr-2"><RefreshIcon /></span> Convert More
                    </button>
                    <button
                        onClick={handleDownloadAll}
                        className="flex items-center justify-center w-full sm:w-auto px-5 py-2.5 text-sm font-medium text-center text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:ring-4 focus:outline-none focus:ring-indigo-800 transition-colors"
                    >
                        <span className="mr-2"><DownloadIcon /></span> Download All
                    </button>
                </div>
            </div>
        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 mb-6 text-center">
            <h3 className="text-xl font-bold text-slate-200">Conversion Summary</h3>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                    <p className="text-sm text-slate-400">Images</p>
                    <p className="text-2xl font-mono text-cyan-400">{originalImages.length}</p>
                </div>
                <div>
                    <p className="text-sm text-slate-400">Original Size</p>
                    <p className="text-2xl font-mono text-cyan-400">{formatFileSize(totalOriginalSize)}</p>
                </div>
                <div>
                    <p className="text-sm text-slate-400">Converted Size</p>
                    <p className="text-2xl font-mono text-cyan-400">{formatFileSize(totalConvertedSize)}</p>
                </div>
                <div>
                    <p className="text-sm text-slate-400">Total Savings</p>
                    <p className="text-2xl font-mono text-green-400">{totalSizeReduction.toFixed(1)}%</p>
                </div>
            </div>
        </div>
      
        <div className="space-y-3 max-h-[45vh] overflow-y-auto pr-2 custom-scrollbar">
            {originalImages.map((original, index) => {
                const converted = convertedImages[index];
                if (!converted) return null;
                const sizeReduction = original.size > 0 ? ((original.size - converted.size) / original.size) * 100 : 0;
                const reductionColor = sizeReduction > 0 ? "text-green-400" : "text-yellow-400";
                
                return (
                    <div key={original.file.name + index} className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                            <img src={converted.url} alt="WebP preview" className="w-14 h-14 object-contain bg-slate-800 rounded-md flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-200 truncate" title={original.file.name}>{original.file.name}</p>
                                <div className="flex items-baseline flex-wrap gap-x-3 gap-y-1 text-xs text-slate-400 mt-1">
                                    <span>PNG: {formatFileSize(original.size)}</span>
                                    <span className="text-slate-500">&rarr;</span>
                                    <span>WebP: {formatFileSize(converted.size)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="text-right flex-shrink-0 w-24 hidden sm:block">
                            <p className={`font-semibold ${reductionColor}`}>{sizeReduction.toFixed(1)}%</p>
                            <p className="text-xs text-slate-500">reduction</p>
                        </div>
                        
                        <button 
                            onClick={() => handleDownloadSingle(converted, original)}
                            className="p-2.5 rounded-md bg-slate-700 hover:bg-slate-600 transition-colors flex-shrink-0"
                            aria-label={`Download ${original.file.name.replace(/\.png$/, '.webp')}`}
                        >
                            <DownloadIcon />
                        </button>
                    </div>
                )
            })}
        </div>
        <style>{`
            .custom-scrollbar::-webkit-scrollbar {
                width: 8px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
                background: transparent;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
                background-color: #475569;
                border-radius: 20px;
                border: 3px solid #1e293b;
            }
        `}</style>
    </div>
  );
};