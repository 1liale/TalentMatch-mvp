"use client";

import React, { useState, useRef } from "react";
import { Upload } from "lucide-react";
import { 
  TypographyH3,
  TypographyP,
  TypographySmall
} from "@/components/ui/typography";
import { toast } from "sonner";

const FileUploadArea = ({ onFileSelected, isUploading }) => {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) validateAndUpload(file);
  };
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) validateAndUpload(file);
  };
  
  const validateAndUpload = (file) => {
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size exceeds 5MB limit. Please choose a smaller file.");
      return;
    }
    
    // Check file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Invalid file type. Please use PDF or Word (.docx) format.");
      return;
    }
    
    onFileSelected(file);
  };
  
  return (
    <div 
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
        isDragging ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary/50'
      }`}
      onClick={() => fileInputRef.current?.click()}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden" 
        accept=".pdf,.doc,.docx" 
        disabled={isUploading}
      />
      
      <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
      
      <TypographyH3 className="mb-2">Upload your resume</TypographyH3>
      
      <TypographyP className="text-muted-foreground mb-4">
        Drag and drop your file here, or click to browse
      </TypographyP>
      
      <TypographySmall className="text-muted-foreground">
        Supported formats: PDF, DOC, DOCX, IMG files (max 5MB)
      </TypographySmall>
      
      {isUploading && (
        <div className="mt-4">
          <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full animate-pulse" style={{ width: '100%' }}></div>
          </div>
          <TypographySmall className="text-muted-foreground mt-2">
            Uploading and processing...
          </TypographySmall>
        </div>
      )}
    </div>
  );
};

export default FileUploadArea; 