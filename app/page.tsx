"use client";
import { useState } from "react";
import axios from "axios";

interface Accreditation {
  education: string;
  educationLevel: string;
}

interface Education {
  id: number;
  organization: string;
  accreditation: Accreditation;
}
interface Skill {
  id: number;
  name: string;
  emsiId: string;
  lastUsed?: string | null;
}
interface ParsedResume {
  name: string;
  email: string[];
  phoneNumber: string[];
  skills: Skill[];
  location: string | null;
  education: Education[];
  summary: string;
  totalExperience: number;
  certifications: string[];
}

export default function HomePage() {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedResume | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
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

    setLoading(true);

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
      const relevantData: ParsedResume = {
        summary: response.data.data.summary,
        name: response.data.data.name.raw,
        email: response.data.data.emails,
        phoneNumber: response.data.data.phoneNumbers || [],
        location: response.data.data.location?.formatted || null,
        education:
          response.data.data.education.map((edu: Education) => ({
            organization: edu.organization || null,
            accreditation: {
              education: edu.accreditation?.education || null,
              educationLevel: edu.accreditation?.educationLevel || null,
            },
          })) || [],
        skills:
          response.data.data.skills.map((skill: Skill) => skill.name) || [],
        certifications: response.data.data.certifications,

        totalExperience: response.data.data.totalYearsExperience || 0,
      };

      console.log(response.data);

      setParsedData(relevantData);
    } catch (error) {
      // Type guard for Axios errors
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || "An error occurred");
      } else {
        // Fallback for unknown errors
        setError("An unknown error occurred");
      }
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <div className="fileUploadContainer mx-auto p-3">
      <h1 className="text-2xl font-bold mb-4">Resume Parser</h1>
      <div className=" flex items-center">
        <input
          title="file"
          type="file"
          accept=".pdf,.docx"
          onChange={handleFileChange}
          className="fileInput"
        />
        <button
          onClick={handleUpload}
          className="uploadButton"
          disabled={loading}
        >
          {loading ? (
            <>
              <div className="spinner"></div>
              <span>Processing...</span>
            </>
          ) : (
            "Upload and Parse"
          )}
        </button>
      </div>

      {error && <p className="error">Error: {error}</p>}
      {parsedData && (
        <div className="parsedData">
          <h2 className="text-xl font-semibold">Parsed Data:</h2>
          <pre>{JSON.stringify(parsedData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
