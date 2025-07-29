import { useState, useEffect } from 'react';

export const useLogo = () => {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLogo = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // 캐시 버스팅을 위한 타임스탬프 추가
      const response = await fetch(`/api/logo?t=${Date.now()}`, {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.logoUrl) {
        console.log('Logo fetched successfully:', data.logoUrl);
        // 캐시 버스팅을 위한 타임스탬프 추가
        const cacheBustingUrl = data.logoUrl.includes('?') 
          ? `${data.logoUrl}&t=${Date.now()}` 
          : `${data.logoUrl}?t=${Date.now()}`;
        setLogoUrl(cacheBustingUrl);
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