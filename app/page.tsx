"use client";

import React, { useState, useRef, useEffect } from "react";

export default function DaPicHome() {
  const [activeTab, setActiveTab] = useState<"view" | "upload">("view");

  // View Tab State
  const [searchCode, setSearchCode] = useState("");
  const [viewResult, setViewResult] = useState<string | null>(null);
  const [viewMessage, setViewMessage] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Upload Tab State
  const [uploadImage, setUploadImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadMessage, setUploadMessage] = useState("");
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Dynamic Countdown Hook ---
  useEffect(() => {
    if (isSuccess && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (isSuccess && countdown === 0) {
      setUploadImage(null);
      setPreviewUrl(null);
      setGeneratedCode(null);
      setUploadMessage("");
      setIsSuccess(false);
      setIsCopied(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [isSuccess, countdown]);

  // --- Handlers for View Tab ---
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchCode.length !== 6) {
      setViewMessage("Please enter a 6-digit code.");
      return;
    }

    setIsSearching(true);
    setViewMessage("");
    setViewResult(null);

    try {
      const response = await fetch(`/api/get-pic?code=${searchCode}`);
      const data = await response.json();

      if (response.ok) {
        setViewResult(data.url);
      } else {
        setViewMessage(data.error || "No photo found.");
      }
    } catch (err) {
      setViewMessage("Error connecting to server.");
    } finally {
      setIsSearching(false);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const digitsOnly = text.replace(/\D/g, "").slice(0, 6);
      if (digitsOnly) setSearchCode(digitsOnly);
    } catch (err) {
      setViewMessage("Clipboard access denied.");
    }
  };

  // --- Handlers for Upload Tab ---
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      const newCode = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedCode(newCode);
      setIsSuccess(false);
      setIsCopied(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadImage || !generatedCode) return;

    setIsUploading(true);
    setUploadMessage("");

    try {
      const response = await fetch(
        `/api/upload?filename=${uploadImage.name}&code=${generatedCode}`,
        {
          method: "POST",
          body: uploadImage,
        }
      );

      if (response.ok) {
        setIsSuccess(true);
        setCountdown(5);
      } else {
        setUploadMessage("Upload failed. Try again.");
      }
    } catch (err) {
      setUploadMessage("Network error occurred.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleCopyCode = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div className="relative min-h-screen bg-black text-white font-sans flex flex-col items-center selection:bg-white selection:text-black">
      
      <header className="sticky top-0 z-[100] w-full py-2 flex justify-center items-center border-b border-zinc-800 bg-black/80 backdrop-blur-lg">
        <img 
          src="/logo.png" 
          alt="Da-Pic Logo" 
          className="h-14 w-auto object-contain"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
      </header>

      <main className="flex-grow flex flex-col items-center w-full max-w-md px-6 pt-8 pb-4">
        
        <div className="flex w-full mb-6 border-b border-zinc-800">
          <button
            onClick={() => { setActiveTab("view"); setViewResult(null); setSearchCode(""); }}
            className={`flex-1 py-3 text-center text-sm font-semibold tracking-wider transition-colors ${
              activeTab === "view" ? "border-b-2 border-white text-white" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            VIEW TAB
          </button>
          <button
            onClick={() => { setActiveTab("upload"); setIsSuccess(false); setPreviewUrl(null); }}
            className={`flex-1 py-3 text-center text-sm font-semibold tracking-wider transition-colors ${
              activeTab === "upload" ? "border-b-2 border-white text-white" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            UPLOAD TAB
          </button>
        </div>

        {activeTab === "view" && (
          <div className="w-full flex flex-col items-center animate-in fade-in duration-300">
            <form onSubmit={handleSearch} className="w-full flex flex-col items-center gap-4">
              <div className="relative w-full">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6-digit code"
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value.replace(/\D/g, ""))}
                  className="w-full bg-zinc-900 border border-zinc-700 text-center text-2xl tracking-[0.5em] py-4 rounded-md focus:outline-none focus:border-white placeholder:tracking-normal placeholder:text-base"
                />
                <button
                  type="button"
                  onClick={handlePaste}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-zinc-500 hover:text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                  </svg>
                </button>
              </div>
              <button type="submit" disabled={isSearching} className="w-full bg-white text-black font-bold py-3 rounded-md hover:bg-zinc-200 disabled:opacity-50">
                {isSearching ? "SEARCHING..." : "ENTER"}
              </button>
            </form>
            <div className="mt-6 w-full flex flex-col items-center">
              {viewMessage && <p className="text-zinc-400 text-sm">{viewMessage}</p>}
              {viewResult && (
                <div className="w-full border border-zinc-800 p-2 rounded-md bg-zinc-950 flex flex-col items-center animate-in zoom-in-95">
                  <a href={viewResult} target="_blank" rel="noopener noreferrer" className="w-full">
                    <img src={viewResult} alt="Result" className="w-full h-auto max-h-[500px] object-contain rounded" />
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "upload" && (
          <div className="w-full flex flex-col items-center animate-in fade-in duration-300">
            <form onSubmit={handleUpload} className="w-full flex flex-col items-center gap-4">
              <div className={`w-full relative border-2 border-dashed bg-zinc-900 rounded-md min-h-[200px] max-h-[400px] flex items-center justify-center transition-colors overflow-hidden ${isSuccess ? 'border-green-500' : 'border-zinc-700 hover:border-white'}`}>
                <input
                  type="file" accept="image/*" onChange={handleImageChange} ref={fileInputRef} disabled={isSuccess || isUploading}
                  className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer disabled:cursor-default"
                />
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-full h-full max-h-[400px] object-contain" />
                ) : (
                  <span className="text-zinc-500 text-xs font-semibold uppercase tracking-widest">Select Image</span>
                )}
              </div>

              {generatedCode && (
                <div className="w-full flex flex-col items-center gap-2">
                  <div className="w-full relative flex items-center justify-center bg-zinc-900 border border-zinc-700 rounded-md py-3">
                    <div className="text-4xl tracking-[0.25em] font-bold">{generatedCode}</div>
                    <button type="button" onClick={handleCopyCode} className="absolute right-4 p-2 text-zinc-500 hover:text-white">
                      {isCopied ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {!isSuccess ? (
                <button type="submit" disabled={!uploadImage || isUploading} className={`w-full font-bold py-3 rounded-md transition-all ${uploadImage && !isUploading ? "bg-white text-black active:scale-[0.98]" : "bg-zinc-800 text-zinc-500"}`}>
                  {isUploading ? "UPLOADING..." : "UPLOAD IMAGE"}
                </button>
              ) : (
                <p className="text-green-400 text-sm font-medium animate-pulse">Success! Resetting in {countdown}s...</p>
              )}
              {uploadMessage && <p className="text-red-400 text-xs">{uploadMessage}</p>}
            </form>
          </div>
        )}
      </main>

      <footer className="w-full pt-0 pb-1 flex justify-center border-t border-zinc-800 bg-black">
        <img 
          src="/devlogo.png" 
          alt="Tw1sT Logo" 
          className="h-32 w-auto object-contain"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
      </footer>

    </div>
  );
}