'use client';
import { useState } from 'react';
import Image from 'next/image';

// Server action to handle file upload
async function handleFileUpload(formData) {
  const file = formData.get("file"); // Fixed: "file" in quotes as a string
  console.log("File name:", file.name, "size:", file.size);
  // Process the file further as needed
}

export default function Home() {
  // Client-side form submission handler
  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    await handleFileUpload(formData);
  };

  return (
    <div>
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
        
        <div className="grid-container">
            <div className="form-section">
                <h2>Upload Your Resume</h2>
                
                <div>
                    <label htmlFor="resumeFile">Upload Resume File:</label>
                    <input type="file" id="resumeFile" name="resumeFile" accept=".pdf,.doc,.docx,.txt"/>
                </div>
                
                <div className="or-divider">OR</div>
                
                <div>
                    <label htmlFor="resumeText">Paste Resume Text: (or extra skills/experience)</label>
                    <textarea id="resumeText" name="resumeText" placeholder="Copy and paste your resume content here..."></textarea>
                </div>
            </div>
            
            <div className="form-section">
                <h2>Job Description</h2>
                <div>
                    <label htmlFor="jobTitle">Job Title:</label>
                    <input type="text" id="jobTitle" name="jobTitle" placeholder="Enter the position you're applying for"/>
                </div>

                <div className="or-divider">AND</div>
                
                <div>
                    <label htmlFor="jobDescription">Job Description:</label>
                    <textarea id="jobDescription" name="jobDescription" placeholder="Copy and paste the job description here..."></textarea>
                </div>
            </div>
        </div>
        
        <button type="submit" id="submitBtn">Go!</button>
          </div>
        </div>

    </div>

  );
}