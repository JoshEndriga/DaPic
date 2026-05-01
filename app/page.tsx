"use client";

import React, { useState, useRef } from "react";

// Mock Database for prototype testing
// In production, this will be replaced by your DB (e.g., Supabase) and Vercel Blob
interface ImageRecord {
  code: string;
  imageUrl: string;
  timestamp: number;
}

export default function DaPicHome() {
  const [activeTab, setActiveTab] = useState<"view" | "upload">("view");

  // Mock DB State
  const [database, setDatabase] = useState<ImageRecord[]>([]);

  // View Tab State
  const [searchCode, setSearchCode] = useState("");
  const [viewResult, setViewResult] = useState<string | null>(null);
  const [viewMessage, setViewMessage] = useState("");

  // Upload Tab State
  const [uploadCode, setUploadCode] = useState("");
  const [uploadImage, setUploadImage] = useState<string | null>(null);
  const [uploadMessage, setUploadMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Handlers for View Tab ---
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setViewMessage("");
    setViewResult(null);

    if (searchCode.length !== 6) {
      setViewMessage("Please enter a valid 6-digit code.");
      return;
    }

    const record = database.find((item) => item.code === searchCode);

    if (record) {
      setViewResult(record.imageUrl);
    } else {
      setViewMessage("No photo found.");
    }
  };

  // --- Handlers for Upload Tab ---
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Convert file to local object URL for prototype preview
      const imageUrl = URL.createObjectURL(file);
      setUploadImage(imageUrl);
    }
  };

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!uploadImage) {
      setUploadMessage("Please select an image first.");
      return;
    }
    if (uploadCode.length !== 6) {
      setUploadMessage("Please enter a 6-digit code.");
      return;
    }

    // Save to mock database
    const newRecord: ImageRecord = {
      code: uploadCode,
      imageUrl: uploadImage,
      timestamp: Date.now(), // 7-day expiration will be calculated from this in production
    };

    setDatabase([...database, newRecord]);
    setUploadMessage("Uploading successful!");

    // Reset everything in the upload tab after a short delay
    setTimeout(() => {
      setUploadCode("");
      setUploadImage(null);
      setUploadMessage("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }, 2000);
  };

  // --- Render ---
  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col items-center justify-between selection:bg-white selection:text-black">
      
      {/* Header */}
      <header className="w-full py-6 flex justify-center border-b border-zinc-800">
        <h1 className="text-3xl font-bold tracking-widest uppercase">Da-Pic</h1>
      </header>

      {/* Main Content / Tab Container */}
      <main className="flex-1 flex flex-col items-center justify-center w-full max-w-md px-6 py-10">
        
        {/* Tab List */}
        <div className="flex w-full mb-8 border-b border-zinc-800">
          <button
            onClick={() => {
              setActiveTab("view");
              setViewMessage("");
              setViewResult(null);
              setSearchCode("");
            }}
            className={`flex-1 py-3 text-center text-sm font-semibold tracking-wider transition-colors ${
              activeTab === "view"
                ? "border-b-2 border-white text-white"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            VIEW TAB
          </button>
          <button
            onClick={() => {
              setActiveTab("upload");
              setUploadMessage("");
            }}
            className={`flex-1 py-3 text-center text-sm font-semibold tracking-wider transition-colors ${
              activeTab === "upload"
                ? "border-b-2 border-white text-white"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            UPLOAD TAB
          </button>
        </div>

        {/* Tab Content: VIEW */}
        {activeTab === "view" && (
          <div className="w-full flex flex-col items-center animate-in fade-in duration-300">
            <form onSubmit={handleSearch} className="w-full flex flex-col items-center gap-4">
              <input
                type="text"
                maxLength={6}
                placeholder="Enter 6-digit code"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value.replace(/\D/g, ""))}
                className="w-full bg-zinc-900 border border-zinc-700 text-center text-2xl tracking-[0.5em] py-4 rounded-md focus:outline-none focus:border-white transition-colors placeholder:text-zinc-600 placeholder:tracking-normal placeholder:text-base"
              />
              <button
                type="submit"
                className="w-full bg-white text-black font-bold py-3 rounded-md hover:bg-zinc-200 transition-colors"
              >
                ENTER
              </button>
            </form>

            <div className="mt-8 w-full flex flex-col items-center min-h-[300px]">
              {viewMessage && (
                <p className="text-zinc-400 text-sm">{viewMessage}</p>
              )}
              {viewResult && (
                <div className="w-full border border-zinc-800 p-2 rounded-md bg-zinc-950 flex flex-col items-center">
                  <a href={viewResult} target="_blank" rel="noopener noreferrer" className="cursor-zoom-in w-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={viewResult}
                      alt="User uploaded content"
                      className="w-full h-auto object-cover rounded"
                    />
                  </a>
                  <p className="text-xs text-zinc-500 mt-4 uppercase tracking-widest">Click to open full size</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab Content: UPLOAD */}
        {activeTab === "upload" && (
          <div className="w-full flex flex-col items-center animate-in fade-in duration-300">
            <form onSubmit={handleUpload} className="w-full flex flex-col items-center gap-6">
              
              {/* Image Upload Area */}
              <div className="w-full relative flex flex-col items-center justify-center border-2 border-dashed border-zinc-700 bg-zinc-900 rounded-md h-48 hover:border-white transition-colors overflow-hidden group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  ref={fileInputRef}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                {uploadImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={uploadImage} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center text-zinc-500 group-hover:text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="17 8 12 3 7 8"/>
                      <line x1="12" x2="12" y1="3" y2="15"/>
                    </svg>
                    <span className="text-sm font-semibold uppercase tracking-wider">Select Image</span>
                  </div>
                )}
              </div>

              {/* Code Input */}
              <div className="w-full flex flex-col items-center gap-2">
                <label className="text-xs text-zinc-400 uppercase tracking-widest">Assign 6-Digit Code</label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="000000"
                  value={uploadCode}
                  onChange={(e) => setUploadCode(e.target.value.replace(/\D/g, ""))}
                  className="w-full bg-zinc-900 border border-zinc-700 text-center text-2xl tracking-[0.5em] py-4 rounded-md focus:outline-none focus:border-white transition-colors placeholder:text-zinc-600"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-white text-black font-bold py-3 rounded-md hover:bg-zinc-200 transition-colors"
              >
                ENTER
              </button>

              {uploadMessage && (
                <p className={`text-sm mt-2 font-medium ${uploadMessage.includes("successful") ? "text-green-400" : "text-zinc-400"}`}>
                  {uploadMessage}
                </p>
              )}
            </form>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full py-6 flex justify-center border-t border-zinc-800">
        <div className="text-zinc-500 text-xs font-semibold tracking-widest uppercase flex items-center gap-2">
          <span>Built by</span>
          <span className="text-white bg-zinc-800 px-2 py-1 rounded">DevLogo</span>
        </div>
      </footer>

    </div>
  );
}