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
      const timestamp = Date.now();
      const response = await fetch(`/api/logo?t=${timestamp}`, {
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
        // 강력한 캐시 버스팅을 위한 타임스탬프 추가
        const cacheBustingUrl = data.logoUrl.includes('?') 
          ? `${data.logoUrl}&t=${timestamp}` 
          : `${data.logoUrl}?t=${timestamp}`;
        
        // 상태를 강제로 업데이트하기 위해 이전 값과 다른지 확인
        setLogoUrl(prevUrl => {
          if (prevUrl !== cacheBustingUrl) {
            console.log('Updating logo URL from:', prevUrl, 'to:', cacheBustingUrl);
            return cacheBustingUrl;
          }
          // 같은 URL이라도 강제로 업데이트하기 위해 약간의 변화 추가
          return `${cacheBustingUrl}&_=${Date.now()}`;
        });
      } else {
        console.log('No logo found on server');
        setLogoUrl(null);
      }
    } catch (error) {
      console.error('Error fetching logo:', error);
      // Vercel 환경에서는 에러가 발생해도 기본 로고를 표시
      console.log('Using fallback logo for Vercel environment');
      setLogoUrl('/api/logo-file?id=default&ext=.png');
      setError(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogo();
  }, []);

  // 강제 새로고침 함수 (캐시 완전 무시)
  const forceRefreshLogo = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const timestamp = Date.now();
      const response = await fetch(`/api/logo?t=${timestamp}&force=true`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.logoUrl) {
        console.log('Logo force refreshed successfully:', data.logoUrl);
        // 강제로 새로운 URL 생성
        const forceUrl = `${data.logoUrl}?t=${timestamp}&force=${Date.now()}`;
        setLogoUrl(forceUrl);
      } else {
        console.log('No logo found on server');
        setLogoUrl(null);
      }
    } catch (error) {
      console.error('Error force refreshing logo:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  // 로고 URL을 직접 설정하는 함수
  const setLogoUrlDirectly = (url: string) => {
    const timestamp = Date.now();
    const cacheBustingUrl = url.includes('?') 
      ? `${url}&t=${timestamp}` 
      : `${url}?t=${timestamp}`;
    setLogoUrl(cacheBustingUrl);
  };

  return { logoUrl, isLoading, error, refetchLogo: fetchLogo, forceRefreshLogo, setLogoUrlDirectly };
}; 