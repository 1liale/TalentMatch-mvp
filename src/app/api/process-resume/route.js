import { NextResponse } from "next/server";
import { CohereClient } from "cohere-ai";
import { createClient } from "@/utils/supabase/server";
import { LlamaParseReader } from "llamaindex";
import { writeFile, unlink } from 'fs/promises';
import { tmpdir } from 'os';
import path from 'path';

// Initialize clients
const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY,
});

/**
 * Process resume file, extract text, analyze with Cohere,
 * generate embeddings, and return feedback with rating
 */
export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const resumeId = formData.get("resumeId");
    
    if (!file || !resumeId) {
      return NextResponse.json(
        { error: "File and resumeId are required" },
        { status: 400 }
      );
    }

    // Get file info
    const fileName = file.name.toLowerCase();
    
    // Check for supported file types
    if (!fileName.endsWith(".pdf") && !fileName.endsWith(".docx") && !fileName.endsWith(".doc")) {
      return NextResponse.json(
        { error: "Unsupported file format. Please upload PDF or DOCX files." },
        { status: 400 }
      );
    }

    // Extract text from the file
    let resumeText = "";
    
    try {
      // Handle PDF files with LlamaParse
      if (fileName.endsWith(".pdf")) {
        // Convert file to Buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        // Create a temporary file for LlamaParse to read
        const tempFileName = path.join(tmpdir(), `temp_${Date.now()}.pdf`);
        await writeFile(tempFileName, buffer);

        // Use LlamaParse to extract text
        const llamaParseReader = new LlamaParseReader({ 
          apiKey: process.env.LLAMA_CLOUD_API_KEY,
          resultType: "text" 
        });
        
        const documents = await llamaParseReader.loadData(tempFileName);
        
        // Extract text from the document
        if (documents && documents.length > 0) {
          resumeText = documents[0].text;
        }
        
        // Clean up the temporary file
        try {
          await unlink(tempFileName);
        } catch (cleanupErr) {
          console.error("Error cleaning up temporary file:", cleanupErr);
        }
      } else {
        // TODO: For DOCX files, implement a different parser
        // For now, return an error for non-PDF files
        return NextResponse.json(
          { error: "Currently only PDF files are supported." },
          { status: 400 }
        );
      }
      
      // Validate that we have text content
      if (!resumeText || resumeText.trim() === "") {
        return NextResponse.json(
          { error: "Could not extract text from the resume" },
          { status: 400 }
        );
      }
    } catch (extractionError) {
      console.error("Error extracting text from document:", extractionError);
      return NextResponse.json(
        { error: `Failed to process ${fileName.split('.').pop()} file: ${extractionError.message}` },
        { status: 400 }
      );
    }

    // Generate embedding for the resume text
    let embedding = null;
    try {
      const embeddingResponse = await cohere.embed({
        texts: [resumeText],
        model: "embed-english-v3.0",
        inputType: "search_document"
      });
      
      if (embeddingResponse.embeddings && embeddingResponse.embeddings.length > 0) {
        embedding = embeddingResponse.embeddings[0];
      }
    } catch (embeddingError) {
      console.error("Error generating embedding:", embeddingError);
      // Continue without embedding - it's not critical for the analysis
    }

    // Analyze resume with Cohere
    try {
      // Generate analysis with Cohere
      const response = await cohere.generate({
        prompt: `You are a professional resume analyst with years of experience in HR and recruiting. 
        Analyze the following resume and provide detailed feedback:
        
        1. Extract a list of skills mentioned (technical and soft skills)
        2. Extract work experience as a list of positions
        3. Extract social links from the resume (github, linkedin, and portfolio / website links)
        4. Extract education background
        5. Identify 4-5 strengths of this resume
        6. Identify 4-5 areas that need improvement
        7. Give an overall rating from 0.0 to 10.0 (as a floating point number)
        8. Identify the candidate's years of experience
        9. Summarize the candidate's bio in 2-3 sentences
        
        Format your response as a valid JSON object with these keys: 
        "skills" (array), 
        "experience" (array),
        "social_links" (array),
        "education" (array), 
        "strengths" (array), 
        "improvements" (array), 
        "recommendations" (string), 
        "overallScore" (number between 0-10 with one decimal precision)
        "yearsOfExperience" (number),
        "bio" (string),
        
        IMPORTANT: Return ONLY the JSON object without any additional text, markdown formatting, or code blocks.
        
        Resume text:
        ${resumeText}`,
        model: "command-r-plus",
        maxTokens: 2000,
        temperature: 0.2,
      });
      
      // Parse the JSON response from Cohere
      let feedbackText = response.generations[0].text;
      
      // Extract JSON from markdown code blocks if present
      const jsonMatch = feedbackText.match(/```(?:json)?\s*({[\s\S]*?})\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        feedbackText = jsonMatch[1];
      }
      
      // Parse the JSON
      const feedback = JSON.parse(feedbackText);
      
      // Save feedback and embedding to Supabase
      const supabase = await createClient();
      
      const updateData = {
        feedback: feedback,
        feedback_updated_at: new Date().toISOString(),
      };
      
      // Add embedding if it was generated successfully
      if (embedding) {
        updateData.embedding = embedding;
      }
      
      const { error } = await supabase
        .from("resumes")
        .update(updateData)
        .eq("id", resumeId);
      
      if (error) {
        console.error("Error saving feedback to database:", error);
        return NextResponse.json(
          { error: "Failed to save feedback" },
          { status: 500 }
        );
      }
      
      return NextResponse.json({
        success: true,
        feedback: feedback,
        embeddingGenerated: !!embedding
      });
    } catch (analysisError) {
      console.error("Error analyzing resume:", analysisError);
      return NextResponse.json(
        { error: "Failed to analyze resume: " + analysisError.message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error processing resume:", error);
    return NextResponse.json(
      { error: "Failed to process resume: " + error.message },
      { status: 500 }
    );
  }
} 