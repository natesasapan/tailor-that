'use client';
import { useState } from 'react';
import Image from 'next/image';
import { GoogleGenerativeAI } from "@google/generative-ai";

  // Run Gemini API with text and/or file
  async function runGemini(resumeFile, resumeText, jobTitle, jobDescription) {

    // initialize API
    const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({model: "gemini-1.5-flash"});

    let parts = [];

    // Add resume text if provided
    if(resumeText) {
      parts.push({ text: `RESUME:\n${resumeText}` });
    }

    // Add resume file if provided
    if (resumeFile) {
      try {
          const base64Data = await readFileAsBase64(resumeFile);

          parts.push({
              inlineData: {
                  mimeType: resumeFile.type,
                  data: base64Data,
              },
          });
      } catch (error) {
          throw new Error("Error processing resume file.");
      }
    }

    // Add job title and description to parts array
    parts.push({ text: `JOB TITLE:\n${jobTitle}\nJOB DESCRIPTION:\n${jobDescription}` });

    // Prompt Constructor
    const promptParts = [
        {
            text: `You are a professional resume advisor. Analyze the provided resume, job title, and job description to offer specific, 
                  actionable advice on how the I can tailor my resume to better match the employer's requirements. Focus on
                  including buzzwords and suggest skills that the I can add if I possess them. Don't only suggest what to improve,
                  pretend you are me include what YOU would write. Provide recommendations in the following areas:
                  1. First, tell me ALL of the buzzwords that you found, not including explanations
                  2. Next, include key skills/qualifications to emphasize or add, and recommend soft skills even if they're not explicitly listed
                  3. Touch up on experience that should be highlighted or reframed, and reframe it
                  4. List specific resume sections that need improvement
                  5. Include industry-specific keywords to incorporate
                  6. Suggest format or structure changes
                  7. Include a tailored summary of qualifications paragraph for me to include.
                  Your advice and additions should be specific to me and this position, not generic resume tips. 
                  Focus on the most impactful changes that will increase my chances of getting an interview. \n\n`,
        },
        ...parts, // Spread the parts array here
    ];

    try {
      const result = await model.generateContent({ contents: [{ parts: promptParts }] });
      const data = result.response.text();
      return data;
    } catch (error) {
      throw new Error("Error communicating with the Gemini API: " + error.message);
    }
  }

// File reader
async function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
          const base64String = reader.result.split(',')[1];
          resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
  });
}

export default function Home() {

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeText, setResumeText] = useState("");
  const [aiResponse, setAiResponse] = useState("");

   // Handle file input change
 const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };
  
  const goClicked = async () => {
    try {
      // Reset error and success messages
      setError("");
      setSuccess("");
      setAiResponse("");
      setIsLoading(true);
      
      // Validation checks
      if (!resumeFile && !resumeText) {
        setError("You must submit either a file or input text");
        return;
      }
      if (!jobDescription || !jobTitle) {
        setError("You must include the Job Title and Job Description");
        return;
      }

      // Call API and handle response
      const response = await runGemini(resumeFile, resumeText, jobTitle, jobDescription);
      setAiResponse(response);
      setSuccess("Analysis complete!");
      
    } catch (error) {
      setError(error.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  }

  // Function to format markdown content to HTML
  function formatMarkdown(text) {
    if (!text) return '';
    
    // Format headings
    text = text.replace(/## (.*?)$/gm, '<h2 class="text-2xl text-[#3498db] font-bold mt-6 mb-3 pb-2 border-b border-[#3498db]">$1</h2>');
    text = text.replace(/### (.*?)$/gm, '<h3 class="text-xl text-[#3498db] font-semibold mt-4 mb-2">$1</h3>');
    
    // Format bold text
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-[#e3e3e3]">$1</strong>');
    
    // Format italics
    text = text.replace(/\*(.*?)\*/g, '<em class="italic text-[#e3e3e3]">$1</em>');
    
    // Format bullet points
    text = text.replace(/^\* (.*?)$/gm, '<li class="ml-6 mb-2 text-[#e3e3e3]">$1</li>');
    
    // Group list items
    text = text.replace(/<\/li>\n<li/g, '</li><li');
    
    // Wrap lists in ul tags
    let wrappedText = '';
    const lines = text.split('\n');
    let inList = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.includes('<li')) {
        if (!inList) {
          wrappedText += '<ul class="list-disc ml-8 my-4 text-[#e3e3e3]">\n';
          inList = true;
        }
        wrappedText += line + '\n';
      } else {
        if (inList) {
          wrappedText += '</ul>\n';
          inList = false;
        }
        wrappedText += line + '\n';
      }
    }
    
    if (inList) {
      wrappedText += '</ul>\n';
    }
    
    // Format paragraphs - split by double newlines and wrap non-element text
    const segments = wrappedText.split('\n\n');
    let finalText = '';
    
    for (const segment of segments) {
      if (!segment.trim()) continue;
      
      if (segment.includes('<h2') || 
          segment.includes('<h3') || 
          segment.includes('<ul') || 
          segment.includes('</ul>')) {
        finalText += segment + '\n\n';
      } else {
        finalText += `<p class="text-[#e3e3e3] mb-4 text-lg">${segment}</p>\n\n`;
      }
    }
    
    return finalText;
  }


  return (

    
    <div>
        {/* Add global styles for markdown content */}
        <style jsx global>{`
          .markdown-response h2 {
            color: #3498db;
            font-size: 1.8em;
            font-weight: 700;
            margin-top: 25px;
            margin-bottom: 15px;
            border-bottom: 2px solid #3498db;
            padding-bottom: 8px;
          }
          
          .markdown-response h3 {
            color: #3498db;
            font-size: 1.4em;
            font-weight: 600;
            margin-top: 20px;
            margin-bottom: 10px;
          }
          
          .markdown-response ul {
            list-style-type: disc;
            margin-left: 25px;
            margin-top: 10px;
            margin-bottom: 10px;
          }
          
          .markdown-response li {
            color: #e3e3e3;
            margin-bottom: 8px;
            display: list-item;
          }
          
          .markdown-response p {
            color: #e3e3e3;
            margin-bottom: 15px;
            font-size: 1.1em;
            line-height: 1.5;
          }
          
          .markdown-response strong {
            color: #e3e3e3;
            font-weight: bold;
          }
        `}</style>

        <div className='navBar'>
          <a href='https://nextjs.org/'><h3>Next.js</h3></a>
          <a href='https://cloud.google.com/'><h2>Model</h2></a>
          <div className='imagewrapper'>
            <Image
              src="/logo.png"
              width={300}
              height={300}
              alt='tailorthat logo'
            />
          </div>
          <a href='https://github.com/natesasapan/tailor-that'><h2>GitHub</h2></a>
          <a href='https://careercenter.georgetown.edu/major-career-guides/resumes-cover-letters/resume-formatting-tips/'><h3>Formatting</h3></a>
        </div>

        <div className='goDiv'>
          <h1>Welcome to TailorThat!</h1>
          <p>This app was made to make company-specific resume tailoring easier with the power of AI. The steps go as follows: </p>
          <ol>
            <li>Submit or copy/paste your resume</li>
            <li>Copy/Paste the job description</li>
            <li>Press Go!</li>
            <li>The AI will generate a new document for you and highlight the suggested changes</li>
          </ol>
          <hr className='border'></hr>
          <div className='container'>
          <h3>Enter Info!</h3>
            {/* Error Message */}
            {error && (
                <div className="mt-4 p-3 rounded-lg bg-red-50 text-red-700 text-center border border-red-200">
                    {error}
                </div>
            )}

            {/* Success Message */}
            {success && (
                <div className="mt-4 p-3 rounded-lg bg-green-50 text-green-700 border border-green-200">
                    {success}
                </div>
            )}
        
        <div className="grid-container">
            <div className="form-section">
                <h2>Upload Your Resume</h2>
                
                <div>
                    <label htmlFor="resumeFile">Upload Resume File:</label>
                    <input 
                    type="file"
                    id="resumeFile"
                    name="resumeFile"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleFileChange}
                    disabled={isLoading}
                    />
                </div>
                
                <div className="or-divider">OR</div>
                
                <div>
                    <label htmlFor="resumeText">Paste Resume Text: (or extra skills/experience)</label>
                    <textarea
                    className="inputArea"
                    id="resumeText"
                    name="resumeText"
                    placeholder="Copy and paste your resume content here..."
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    disabled={isLoading}
                    />
                </div>
            </div>
            
            <div className="form-section">
                <h2>Job Description</h2>
                <div>
                    <label htmlFor="jobTitle">Job Title:</label>
                    <input 
                    type="text" 
                    id="jobTitle" 
                    name="jobTitle"
                    value={jobTitle}
                    placeholder="Enter the position you're applying for"
                    onChange={(e) => setJobTitle(e.target.value)}
                    disabled={isLoading}
                    />
                </div>

                <div className="or-divider">AND</div>
                
                <div>
                    <label htmlFor="jobDescription">Job Description:</label>
                    <textarea 
                    className="inputArea"
                    id="jobDescription" 
                    name="jobDescription"
                    value={jobDescription}
                    placeholder="Copy and paste the job description here..."
                    onChange={(e) => setJobDescription(e.target.value)}
                    disabled={isLoading}
                    />
                </div>
            </div>
        </div>
        
        <button 
          type="button"
          onClick={goClicked}
          id="submitBtn"
          disabled={isLoading}
          >
          {isLoading ? "Working...": "Go!"}
          </button>

        {/* Display AI Response */}
        {aiResponse && (
          <div className="goDiv mt-8">
            <h1>Tailoring Recommendations</h1>
            <div className="markdown-response">
              <div dangerouslySetInnerHTML={{ __html: formatMarkdown(aiResponse) }} />
            </div>
          </div>
        )}

          </div>
        </div>

    </div>

  );
}