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
    setUploading(true);
    const formData = new FormData();
    formData.append('logo', file);
    try {
      const res = await fetch('/api/logo', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        onUpload(data.url);
      }
    } catch (err) {
      alert('Upload failed');
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