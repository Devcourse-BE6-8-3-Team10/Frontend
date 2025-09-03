"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import apiClient from "@/utils/apiClient";

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export default function RegisterPage() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agree: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // 로그인 상태에서 회원가입 페이지 접근 방지
  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, loading, router]);

  // 로딩 중이거나 이미 로그인된 경우 로딩 화면 표시
  if (loading || isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // 비밀번호 확인
    if (formData.password !== formData.confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      setIsLoading(false);
      return;
    }

    // 이용약관 동의 확인
    if (!formData.agree) {
      setError("이용약관에 동의해주세요.");
      setIsLoading(false);
      return;
    }

    try {
      await apiClient.post('/api/auth/signup', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      // 회원가입 성공 시 회원가입 완료 페이지로 리다이렉트
      router.push("/register/success");
      
    } catch (error: unknown) {
      const apiError = error as ApiError;
      if (apiError.response?.data?.message) {
        setError(apiError.response.data.message);
      } else {
        setError("서버 연결에 실패했습니다. 다시 시도해주세요.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pb-10">
      <section className="px-6 py-8">
        <div className="max-w-md mx-auto">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-[#1a365d] mb-2">회원가입</h1>
              <p className="text-gray-600 text-sm">PatentMarket 회원이 되어 특허 거래를 시작하세요</p>
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}
            
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  이름
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="이름을 입력하세요"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  이메일
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="이메일을 입력하세요"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  비밀번호
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="비밀번호를 입력하세요"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  비밀번호 확인
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="비밀번호를 다시 입력하세요"
                  required
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="agree"
                  name="agree"
                  checked={formData.agree}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                  required
                />
                <label htmlFor="agree" className="ml-2 text-sm text-gray-600">
                  <a href="#" className="text-purple-600 hover:text-purple-700">이용약관</a>과{' '}
                  <a href="#" className="text-purple-600 hover:text-purple-700">개인정보처리방침</a>에 동의합니다
                </label>
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white py-3 rounded-lg transition-colors font-medium cursor-pointer"
              >
                {isLoading ? "처리 중..." : "회원가입"}
              </button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                이미 계정이 있으신가요?{' '}
                <a href="/login" className="text-purple-600 hover:text-purple-700 font-medium">
                  로그인
                </a>
              </p>
            </div>
            
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">또는</span>
                </div>
              </div>
              
              <div className="mt-6 grid grid-cols-1 gap-3">
                {/* Google - simple white button with Google icon */}
                <button
                  type="button"
                  className="btGoogle w-full h-12 rounded-lg shadow-sm border border-gray-300 bg-white text-black hover:bg-gray-50"
                  onClick={() => { window.location.href = "/oauth2/authorization/google"; }}
                  aria-label="Sign in with Google"
                >
                  <span className="tpaLoginInnerWrap flex items-center justify-center gap-2 py-3 px-4 cursor-pointer">
                    <span className="inline-block" aria-hidden="true" style={{ width: '18px', height: '18px' }}>
                      <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76--4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                        <path fill="none" d="M0 0h48v48H0z"></path>
                      </svg>
                    </span>
                    <span className="tpaLoginTxt text-sm font-medium">Google 계정으로 로그인</span>
                  </span>
                </button>

                {/* Kakao */}
                <button
                  type="button"
                  className="btKakao w-full h-12 rounded-lg shadow-sm"
                  onClick={() => { window.location.href = "/oauth2/authorization/kakao"; }}
                  style={{ backgroundColor: '#FEE500', color: '#191600' }}
                  aria-label="카카오 로그인"
                >
                  <span className="tpaLoginInnerWrap flex items-center justify-center gap-2 py-3 px-4 cursor-pointer">
                    <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 4C7.582 4 4 6.807 4 10.27c0 2.116 1.407 3.96 3.527 4.99-.094.35-.336 1.269-.388 1.467-.058.224.081.226.176.164.076-.05 1.199-.82 1.678-1.149.509.076 1.04.116 1.592.116 4.418 0 8-2.807 8-6.27C18.585 6.807 15.003 4 12 4z" fill="#000000"/>
                    </svg>
                    <span className="tpaLoginTxt text-sm font-medium">Kakao 계정으로 로그인</span>
                  </span>
                </button>

                {/* Naver */}
                <button
                  type="button"
                  className="btNaver w-full h-12 rounded-lg shadow-sm"
                  onClick={() => { window.location.href = "/oauth2/authorization/naver"; }}
                  style={{ backgroundColor: '#03C75A', color: '#FFFFFF' }}
                  aria-label="네이버 로그인"
                >
                  <span className="tpaLoginInnerWrap flex items-center justify-center gap-2 py-3 px-4 cursor-pointer">
                    <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 6h3.9l2.9 4.5V6H17v12h-3.9L10.2 13.5V18H7V6z" fill="#FFFFFF"/>
                    </svg>
                    <span className="tpaLoginTxt text-sm font-medium">Naver 계정으로 로그인</span>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}