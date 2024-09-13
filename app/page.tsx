"use client";
import { useState } from "react";
import axios from "axios";

export default function HomePage() {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  // Handle file upload and parsing
  const handleUpload = async (): Promise<void> => {
    if (!file) {
      setError("Please select a file first.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("wait", "true");

      const options = {
        method: "POST",
        url: "https://api.affinda.com/v2/resumes",
        headers: {
          accept: "application/json",
          authorization: `Bearer ${process.env.NEXT_PUBLIC_AFFINDA_API_KEY}`,
        },
        data: formData,
      };

      const response = await axios.request(options);

      setParsedData(response.data);
    } catch (error) {
      // Type guard for Axios errors
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || "An error occurred");
      } else {
        // Fallback for unknown errors
        setError("An unknown error occurred");
      }
    }
  };

  return (
    <div className=" fileUploadContainer mx-auto p-3">
      <h1 className="text-2xl font-bold mb-4">Resume Parser</h1>
      <input
        title="file"
        type="file"
        accept=".pdf,.docx"
        onChange={handleFileChange}
        className="fileInput mb-7 p-2 border border-gray-300 rounded"
      />
      <button
        onClick={handleUpload}
        className=" uploadButton p-2 border bg-blue-400 text-white p-2 rounded-full s hover:bg-blue-500"
      >
        Upload and Parse
      </button>

      {error && <p className="text-red-500 mt-4">Error: {error}</p>}
      {parsedData && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold">Parsed Data:</h2>
          <pre className="bg-gray-100 p-4 rounded">
            {JSON.stringify(parsedData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
