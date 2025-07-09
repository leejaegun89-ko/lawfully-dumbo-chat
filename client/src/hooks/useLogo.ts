import { useState, useEffect } from 'react';

export const useLogo = () => {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLogo = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/logo');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.logoUrl) {
        console.log('Logo fetched successfully:', data.logoUrl);
        setLogoUrl(data.logoUrl + '?' + Date.now()); // Add timestamp to bust cache
      } else {
        console.log('No logo found on server');
        setLogoUrl(null);
      }
    } catch (error) {
      console.error('Error fetching logo:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogo();
  }, []);

  return { logoUrl, isLoading, error, refetchLogo: fetchLogo };
}; 