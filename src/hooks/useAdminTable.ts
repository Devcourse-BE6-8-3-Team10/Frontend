import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface ApiError {
  response?: {
    status?: number;
    data?: {
      message?: string;
    };
  };
  request?: unknown;
  message?: string;
}

export function useAdminTable<T>(
  fetchData: () => Promise<T[]>,
  requiredRole: string = 'ADMIN'
) {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // 공통 인증 로직
  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      } else if (user?.role !== requiredRole) {
        router.push('/');
        return;
      }
    }
  }, [isAuthenticated, loading, user, router, requiredRole]);

  const fetchDataHandler = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");
      const result = await fetchData();
      setData(result);
    } catch (error: unknown) {
      const apiError = error as ApiError;
      console.error('데이터 조회 실패:', apiError);

      // 구체적인 에러 메시지 제공
      let errorMessage = '데이터를 불러오는데 실패했습니다.';

      if (apiError.response) {
        // 서버 응답 에러
        const status = apiError.response.status;
        if (status === 401) {
          errorMessage = '인증이 필요합니다. 다시 로그인해주세요.';
        } else if (status === 403) {
          errorMessage = '관리자 권한이 필요합니다.';
        } else if (status === 404) {
          errorMessage = 'API 엔드포인트를 찾을 수 없습니다.';
        } else if (status && status >= 500) {
          errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
        } else {
          errorMessage = `서버 오류 (${status}): ${apiError.response.data?.message || '알 수 없는 오류'}`;
        }
      } else if (apiError.request) {
        // 네트워크 에러
        errorMessage = '서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.';
      } else {
        // 기타 에러
        errorMessage = `오류가 발생했습니다: ${apiError.message}`;
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []); // fetchData 의존성 제거

  // 공통 데이터 페칭 로직 - fetchDataHandler 의존성 제거
  useEffect(() => {
    if (user?.role === requiredRole && isAuthenticated && !loading) {
      fetchDataHandler();
    }
  }, [user?.role, requiredRole, isAuthenticated, loading]);

  return {
    user,
    isAuthenticated,
    loading,
    data,
    isLoading,
    error,
    refetch: fetchDataHandler
  };
}
