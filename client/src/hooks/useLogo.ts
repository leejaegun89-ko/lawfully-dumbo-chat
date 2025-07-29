import { useState, useEffect } from 'react';

export const useLogo = () => {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLogo = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // 먼저 로컬 스토리지에서 로고 확인
      const localLogo = localStorage.getItem('lawfully-logo');
      if (localLogo) {
        console.log('Logo loaded from local storage');
        setLogoUrl(localLogo);
        setIsLoading(false);
        return;
      }

      // 서버에서 로고 가져오기 시도
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
        console.log('Logo fetched from server successfully');
        // 로컬 스토리지에 저장
        localStorage.setItem('lawfully-logo', data.logoUrl);
        setLogoUrl(data.logoUrl);
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

  const updateLogo = (newLogoUrl: string) => {
    // 로컬 스토리지에 저장하고 상태 업데이트
    localStorage.setItem('lawfully-logo', newLogoUrl);
    setLogoUrl(newLogoUrl);
  };

  useEffect(() => {
    fetchLogo();
  }, []);

  return { logoUrl, isLoading, error, refetchLogo: fetchLogo, updateLogo };
}; 