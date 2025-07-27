import React, { useRef, useState } from 'react';
import { Upload } from 'lucide-react';

const LogoUpload: React.FC<{ onUpload: (url: string) => void }> = ({ onUpload }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please select a valid image file (PNG, JPEG, SVG, GIF, or WebP)');
      return;
    }
    
    // Validate file size (2MB limit)
    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be less than 2MB');
      return;
    }
    
    setUploading(true);
    const formData = new FormData();
    formData.append('logo', file);
    
    try {
      const res = await fetch('/api/logo', {
        method: 'POST',
        body: formData,
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Upload failed with status ${res.status}`);
      }
      
      const data = await res.json();
      if (data.logoUrl) {
        console.log('Logo uploaded successfully:', data.logoUrl);
        onUpload(data.logoUrl);
      } else {
        throw new Error('No logo URL returned from server');
      }
    } catch (err) {
      console.error('Logo upload error:', err);
      alert(`Upload failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <>
      <input
        type="file"
        accept="image/*"
        ref={inputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <button
        type="button"
        onClick={handleButtonClick}
        disabled={uploading}
        title="Change Logo"
        className="ml-2 p-2 rounded-full bg-white border border-gray-200 shadow hover:bg-blue-50 transition-colors disabled:opacity-50 flex items-center justify-center"
        style={{ width: 36, height: 36 }}
      >
        <Upload className="w-5 h-5 text-blue-600" />
      </button>
    </>
  );
};

export default LogoUpload; 