'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import apiClient from '@/utils/apiClient';
import { 
  getRefreshTokenCookie, 
  setRefreshTokenCookie, 
  clearRefreshTokenCookie,
  getAccessTokenCookie,
  setAccessTokenCookie,
  clearAccessTokenCookie
} from '@/utils/cookieUtils';

interface User {
  id: string;
  email: string;
  name: string;
  profileUrl: string | null;
  role: string;
  // 필요한 다른 사용자 정보들
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (userData: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  refreshUserInfo: () => Promise<void>;
  loading: boolean;
  accessToken: string | null;
  userUpdateTimestamp: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userUpdateTimestamp, setUserUpdateTimestamp] = useState(Date.now());

  // JWT 토큰 만료시간 확인
  const isTokenExpired = (token: string): boolean => {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return true;
      }
      // URL-safe base64 디코딩
      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(base64));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      console.error('Token parsing failed:', error);
      return true; // 파싱 실패 시 만료된 것으로 처리
    }
  };

  // 사용자 정보 가져오기 함수
  const fetchUserInfo = useCallback(async (): Promise<User | null> => {
    try {
      const response = await apiClient.get('/api/members/me');
      
      if (response.data.data) {
        const userData: User = {
          id: response.data.data.id,
          email: response.data.data.email,
          name: response.data.data.name,
          profileUrl: response.data.data.profileUrl,
          role: response.data.data.role || 'USER',
        };
        
        return userData;
      }
      return null;
    } catch (error: unknown) {
      const apiError = error as { response?: { status?: number } };
      // 401/403 오류는 정상적인 상황 (로그인되지 않은 상태)
      if (apiError.response?.status === 401 || apiError.response?.status === 403) {
        console.log('User not authenticated');
        return null;
      }
      console.error('Failed to fetch user info:', apiError);
      return null;
    }
  }, []);

  // 토큰 갱신 함수
  const refreshAccessToken = async (refreshToken: string): Promise<string | null> => {
    try {
      const response = await apiClient.post('/api/auth/reissue', {
        refreshToken: refreshToken
      });
      
      if (response.data.data) {
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data.data;
        
        // 새로운 토큰들을 쿠키에 저장
        setAccessTokenCookie(newAccessToken);
        setRefreshTokenCookie(newRefreshToken);
        
        return newAccessToken;
      }
      return null;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return null;
    }
  };

  useEffect(() => {
    // 페이지 로드 시 인증 상태 확인
    const checkAuthStatus = async () => {
      try {
        const storedAccessToken = getAccessTokenCookie();
        const storedRefreshToken = getRefreshTokenCookie();
        
        if (storedAccessToken) {
          // AccessToken 만료 확인
          if (!isTokenExpired(storedAccessToken)) {
            setAccessToken(storedAccessToken);
            
            // 서버에서 사용자 정보 가져오기
            const userData = await fetchUserInfo();
            if (userData) {
              setUser(userData);
            }
          } else if (storedRefreshToken) {
            // AccessToken이 만료되었지만 RefreshToken이 있는 경우 갱신 시도
            const newAccessToken = await refreshAccessToken(storedRefreshToken);
            if (newAccessToken) {
              setAccessToken(newAccessToken);
              const userData = await fetchUserInfo();
              if (userData) {
                setUser(userData);
              }
            } else {
              // 토큰 갱신 실패 시 데이터 정리
              clearAuthData();
            }
          } else {
            // 토큰이 만료되고 RefreshToken도 없는 경우 데이터 정리
            clearAuthData();
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, [fetchUserInfo]);

  // 인증 데이터 정리 함수
  const clearAuthData = () => {
    setUser(null);
    setAccessToken(null);
    clearAccessTokenCookie();
    clearRefreshTokenCookie();
  };

  const login = (userData: User, accessToken: string, refreshToken: string) => {
    setUser(userData);
    setAccessToken(accessToken);
    
    // AccessToken과 RefreshToken을 쿠키에 저장 (자동 전송)
    setAccessTokenCookie(accessToken);
    setRefreshTokenCookie(refreshToken);
  };

  const logout = async () => {
    try {
      // Backend에 로그아웃 요청 (서버에서 쿠키 삭제)
      await apiClient.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      clearAuthData();
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  // 서버에서 최신 사용자 정보를 다시 가져오는 함수
  const refreshUserInfo = useCallback(async () => {
    const userData = await fetchUserInfo();
    if (userData) {
      setUser(userData);
      setUserUpdateTimestamp(Date.now());
    }
  }, [fetchUserInfo]);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    updateUser,
    refreshUserInfo,
    loading,
    accessToken,
    userUpdateTimestamp,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 