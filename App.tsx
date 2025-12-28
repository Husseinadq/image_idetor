import React, { useState, useCallback, useEffect } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { ConversionPreview } from './components/ConversionPreview';
import { Spinner } from './components/Spinner';
import { convertImageToWebP } from './utils/imageConverter';

type AppState = 'idle' | 'converting' | 'done' | 'error';

export interface ImageData {
  file: File;
  url: string;
  size: number;
}

export interface ConvertedImageData {
  blob: Blob;
  url: string;
  size: number;
}

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('idle');
  const [originalImages, setOriginalImages] = useState<ImageData[]>([]);
  const [convertedImages, setConvertedImages] = useState<ConvertedImageData[]>([]);
  const [quality, setQuality] = useState<number>(0.8);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (files: File[]) => {
    const pngFiles = files.filter(file => file.type.includes('png'));
    if (pngFiles.length === 0) {
      setError('Only PNG files are accepted. Please select at least one PNG file.');
      setAppState('error');
      return;
    }
    setError(null);
    setAppState('converting');
    // Revoke old object URLs before creating new ones
    originalImages.forEach(img => URL.revokeObjectURL(img.url));
    convertedImages.forEach(img => URL.revokeObjectURL(img.url));
    
    setOriginalImages(
      pngFiles.map(file => ({
        file,
        url: URL.createObjectURL(file),
        size: file.size,
      }))
    );
  };
  
  const performConversion = useCallback(async () => {
    if (originalImages.length === 0) return;

    try {
      setAppState('converting');
      const webpBlobs = await Promise.all(
        originalImages.map(img => convertImageToWebP(img.file, quality))
      );
      
      // Revoke previous converted image URLs
      convertedImages.forEach(img => URL.revokeObjectURL(img.url));

      setConvertedImages(
        webpBlobs.map(blob => ({
          blob,
          url: URL.createObjectURL(blob),
          size: blob.size,
        }))
      );
      setAppState('done');
    } catch (err) {
      console.error('Conversion failed:', err);
      setError('Image conversion failed. One or more files might be corrupted or in an unsupported format.');
      setAppState('error');
    }
  }, [originalImages, quality]);

  useEffect(() => {
    if (originalImages.length > 0) {
      performConversion();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [originalImages, quality]);
  
  const handleReset = () => {
    originalImages.forEach(img => URL.revokeObjectURL(img.url));
    convertedImages.forEach(img => URL.revokeObjectURL(img.url));
    setAppState('idle');
    setOriginalImages([]);
    setConvertedImages([]);
    setError(null);
    setQuality(0.8);
  };

  const renderContent = () => {
    switch (appState) {
      case 'idle':
        return <ImageUploader onImageUpload={handleImageUpload} />;
      case 'converting':
        return (
          <div className="text-center">
            <Spinner />
            <p className="mt-4 text-lg text-slate-300">
              Converting {originalImages.length} image{originalImages.length > 1 ? 's' : ''}...
            </p>
          </div>
        );
      case 'done':
        if (originalImages.length === 0 || convertedImages.length === 0 || originalImages.length !== convertedImages.length) return null;
        return (
          <ConversionPreview
            originalImages={originalImages}
            convertedImages={convertedImages}
            quality={quality}
            onQualityChange={setQuality}
            onReset={handleReset}
          />
        );
      case 'error':
        return (
          <div className="text-center p-8 bg-red-900/20 border border-red-500 rounded-lg">
            <h3 className="text-2xl font-bold text-red-400">An Error Occurred</h3>
            <p className="mt-2 text-red-300">{error}</p>
            <button
              onClick={handleReset}
              className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500"
            >
              Try Again
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4 sm:p-6">
      <main className="w-full max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
            PNG to WebP Converter
          </h1>
          <p className="mt-3 text-lg text-slate-400 max-w-2xl mx-auto">
            Optimize your PNGs by converting them to the lightweight WebP format right in your browser.
          </p>
        </header>
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl shadow-2xl shadow-indigo-900/20 p-6 sm:p-10 min-h-[300px] flex items-center justify-center">
          {renderContent()}
        </div>
        <footer className="text-center mt-8 text-slate-500">
            <p>Powered by modern browser APIs. All processing is done locally.</p>
        </footer>
      </main>
    </div>
  );
};

export default App;