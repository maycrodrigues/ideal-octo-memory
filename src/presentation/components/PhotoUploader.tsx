import React, { useState } from "react";
import { useLogger } from "../hooks/useLogger";

interface PhotoUploaderProps {
  key?: string | number;
  onPhotoSelected: (base64: string | undefined) => void;
}

export function PhotoUploader({ onPhotoSelected }: PhotoUploaderProps) {
  const { log } = useLogger("PhotoUploader");
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setPreview(null);
      onPhotoSelected(undefined);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setPreview(base64String);
      onPhotoSelected(base64String);
      log("photo_selected", { name: file.name, size: file.size });
    };
    reader.readAsDataURL(file);
  };

  const handleClear = () => {
    setPreview(null);
    onPhotoSelected(undefined);
    log("photo_cleared");
  };

  return (
    <div className="flex items-center justify-center w-full h-full">
      {!preview ? (
        <label
          htmlFor="dropzone-file"
          className="flex flex-col items-center justify-center w-full h-full min-h-[140px] border-4 border-slate-200 border-dashed rounded-2xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors"
        >
          <div className="flex flex-col items-center justify-center p-4 text-center">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm mb-2">
              <svg
                className="w-5 h-5 text-indigo-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <p className="mb-1 text-sm font-bold text-slate-600 leading-tight">
              Clique para foto
            </p>
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
              PNG/JPG
            </p>
          </div>
          <input
            id="dropzone-file"
            type="file"
            className="hidden"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
          />
        </label>
      ) : (
        <div className="relative w-full h-full min-h-[140px] rounded-2xl overflow-hidden border-4 border-indigo-100">
          <img src={preview} alt="Pré-visualização" className="w-full h-full object-cover" />
          <button
             type="button"
            onClick={handleClear}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 shadow-md"
            aria-label="Remover foto"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
