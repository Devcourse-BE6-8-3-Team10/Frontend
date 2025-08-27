"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import apiClient, { memberAPI } from "@/utils/apiClient";

interface ApiError {
  message?: string;
  response?: {
    data?: {
      message?: string;
      resultCode?: string;
    };
    status?: number;
  };
  request?: unknown;
}

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, loading, user } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  // 비밀번호 찾기 관련 상태
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [passwordResetStep, setPasswordResetStep] = useState(1); // 1: 이름/이메일, 2: 새 비밀번호
  const [passwordResetData, setPasswordResetData] = useState({
    name: "",
    email: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordResetLoading, setPasswordResetLoading] = useState(false);
  const [passwordResetError, setPasswordResetError] = useState("");
  const [passwordResetSuccess, setPasswordResetSuccess] = useState("");

  // 로그인 상태에서 로그인 페이지 접근 방지
  useEffect(() => {
    if (!loading && isAuthenticated) {
      // Role에 따라 리다이렉트
      if (user?.role === 'ADMIN') {
        router.push("/admin/members");
      } else {
        router.push("/");
      }
    }
  }, [isAuthenticated, loading, user, router]);

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
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordResetInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordResetData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNextStep = async () => {
    if (!passwordResetData.name.trim() || !passwordResetData.email.trim()) {
      setPasswordResetError("이름과 이메일을 모두 입력해주세요.");
      return;
    }
    
    setPasswordResetError("");
    setPasswordResetLoading(true);
    
    try {
      // 백엔드에서 실제 회원 확인 (타임아웃 5초)
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('요청 시간이 초과되었습니다.')), 5000)
      );
      
      const verifyPromise = memberAPI.verifyMember({
        name: passwordResetData.name.trim(),
        email: passwordResetData.email.trim(),
      });
      
      await Promise.race([verifyPromise, timeoutPromise]);
      setPasswordResetStep(2);
    } catch (error: unknown) {
      const apiError = error as ApiError;
      if (apiError.message === '요청 시간이 초과되었습니다.') {
        setPasswordResetError("서버 응답이 지연되고 있습니다. 잠시 후 다시 시도해주세요.");
      } else if (apiError.response?.data?.message) {
        setPasswordResetError(apiError.response.data.message);
      } else if (apiError.response?.status === 404) {
        setPasswordResetError("입력하신 이름과 이메일로 등록된 계정을 찾을 수 없습니다. 회원가입을 먼저 진행해주세요.");
      } else {
        setPasswordResetError("해당 정보와 일치하는 회원이 없습니다.");
      }
    } finally {
      setPasswordResetLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordResetError("");
    setPasswordResetSuccess("");
    setPasswordResetLoading(true);

    try {
      if (passwordResetData.newPassword !== passwordResetData.confirmPassword) {
        setPasswordResetError("새 비밀번호와 확인 비밀번호가 일치하지 않습니다.");
        return;
      }

      await memberAPI.findAndUpdatePassword(passwordResetData);
      setPasswordResetSuccess("비밀번호가 성공적으로 변경되었습니다.");
      
      // 성공 후 폼 초기화
      setPasswordResetData({
        name: "",
        email: "",
        newPassword: "",
        confirmPassword: "",
      });
      
    } catch (error: unknown) {
      const apiError = error as ApiError;
      if (apiError.response?.data?.message) {
        setPasswordResetError(apiError.response.data.message);
      } else if (apiError.response?.status === 404) {
        setPasswordResetError("해당 정보와 일치하는 회원이 없습니다.");
      } else if (apiError.response?.status === 400) {
        setPasswordResetError("입력 정보를 확인해주세요.");
      } else {
        setPasswordResetError("비밀번호 변경 중 오류가 발생했습니다. 다시 시도해주세요.");
      }
    } finally {
      setPasswordResetLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setShowPasswordReset(false);
    setPasswordResetStep(1);
    setPasswordResetData({
      name: "",
      email: "",
      newPassword: "",
      confirmPassword: "",
    });
    setPasswordResetError("");
    setPasswordResetSuccess("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await apiClient.post('/api/auth/login', {
        email: formData.email,
        password: formData.password,
      });

      if (response.data.data) {
        const { accessToken, refreshToken, memberInfo } = response.data.data;
        
        // AuthContext에 사용자 정보 저장 (쿠키에 자동으로 토큰이 저장됨)
        if (memberInfo) {
          login({
            id: memberInfo.id.toString(),
            email: memberInfo.email,
            name: memberInfo.name,
            profileUrl: memberInfo.profileUrl || null,// 추가된 필드
            role: memberInfo.role || 'USER',
          }, accessToken, refreshToken);
        }
        
        // Role에 따라 리다이렉트
        const userRole = memberInfo?.role || 'USER';
        if (userRole === 'ADMIN') {
          // 관리자는 관리자 페이지로 리다이렉트
          router.push("/admin/members");
        } else {
          // 일반 사용자는 메인 페이지로 리다이렉트
          router.push("/");
        }
      } else {
        setError("로그인 응답 데이터가 올바르지 않습니다.");
      }
    } catch (error: unknown) {
      const apiError = error as ApiError;
      if (apiError.response?.data?.message) {
        setError(apiError.response.data.message);
      } else if (apiError.response?.status === 401) {
        setError("이메일 혹은 비밀번호를 잘못 입력하셨거나 등록되지 않은 계정입니다.");
      } else if (apiError.response?.status === 400) {
        setError("이메일 혹은 비밀번호를 잘못 입력하셨거나 등록되지 않은 계정입니다.");
      } else if (apiError.response?.status === 403) {
        const resultCode = apiError.response?.data?.resultCode;
      
        if (resultCode === '403-1') {
          setError("탈퇴한 계정입니다. 새로운 계정으로 가입해주세요.");
        } else if (resultCode === '403-2') {
          setError("관리자에 의해 정지된 계정입니다. 관리자에게 문의 바랍니다.");
        } else {
          setError("접근 권한이 없습니다.");
        }
      } else if (apiError.response?.status === 500) {
        setError("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      } else if (apiError.request) {
        setError("서버 연결에 실패했습니다. 네트워크 연결을 확인해주세요.");
      } else {
        setError("로그인 중 오류가 발생했습니다. 다시 시도해주세요.");
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
               <h1 className="text-2xl font-bold text-[#1a365d] mb-2">
                 {showPasswordReset ? "비밀번호 찾기" : "로그인"}
               </h1>
               <p className="text-gray-600 text-sm">
                 {showPasswordReset 
                   ? passwordResetStep === 1 
                     ? "이름과 이메일을 입력해주세요" 
                     : "새 비밀번호를 입력해주세요"
                   : "PatentMarket에 오신 것을 환영합니다"
                 }
               </p>
             </div>
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {passwordResetError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {passwordResetError}
              </div>
            )}

                         
            
            {!showPasswordReset ? (
              <form className="space-y-6" onSubmit={handleSubmit}>
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
              
              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setShowPasswordReset(true)}
                  className="cursor-pointer text-sm text-purple-600 hover:text-purple-700"
                >
                  비밀번호 찾기
                </button>
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className="cursor-pointer w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white py-3 rounded-lg transition-colors font-medium"
              >
                {isLoading ? "로그인 중..." : "로그인"}
              </button>
            </form>
                         ) : (
               <>
                 {passwordResetStep === 1 ? (
                   <div className="space-y-6">
                     <div>
                       <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                         이름
                       </label>
                       <input
                         type="text"
                         id="name"
                         name="name"
                         value={passwordResetData.name}
                         onChange={handlePasswordResetInputChange}
                         className="w-full px-4 py-3 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                         placeholder="가입 시 사용한 이름을 입력하세요"
                         required
                       />
                     </div>

                     <div>
                       <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 mb-2">
                         이메일
                       </label>
                       <input
                         type="email"
                         id="reset-email"
                         name="email"
                         value={passwordResetData.email}
                         onChange={handlePasswordResetInputChange}
                         className="w-full px-4 py-3 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                         placeholder="가입 시 사용한 이메일을 입력하세요"
                         required
                       />
                     </div>

                     <div className="flex gap-3">
                       <button
                         type="button"
                         onClick={handleBackToLogin}
                         className="cursor-pointer flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-lg transition-colors font-medium"
                       >
                         로그인으로 돌아가기
                       </button>
                                               <button
                          type="button"
                          onClick={handleNextStep}
                          disabled={passwordResetLoading}
                          className="cursor-pointer flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white py-3 rounded-lg transition-colors font-medium"
                        >
                          {passwordResetLoading ? "확인 중..." : "다음"}
                        </button>
                     </div>
                   </div>
                 ) : passwordResetSuccess ? (
                   <div className="space-y-6">
                     <div className="text-center">
                       <div className="mb-4">
                         <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                           <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                           </svg>
                         </div>
                       </div>
                       <h3 className="text-lg font-semibold text-gray-900 mb-2">비밀번호 변경 완료</h3>
                       <p className="text-gray-600 mb-6">{passwordResetSuccess}</p>
                       <button
                         type="button"
                         onClick={handleBackToLogin}
                         className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg transition-colors font-medium"
                       >
                         로그인 페이지로 돌아가기
                       </button>
                     </div>
                   </div>
                 ) : (
                   <form className="space-y-6" onSubmit={handlePasswordReset}>
                     <div>
                       <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                         새 비밀번호
                       </label>
                       <input
                         type="password"
                         id="newPassword"
                         name="newPassword"
                         value={passwordResetData.newPassword}
                         onChange={handlePasswordResetInputChange}
                         className="w-full px-4 py-3 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                         placeholder="새 비밀번호를 입력하세요"
                         required
                       />
                     </div>

                     <div>
                       <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                         새 비밀번호 확인
                       </label>
                       <input
                         type="password"
                         id="confirmPassword"
                         name="confirmPassword"
                         value={passwordResetData.confirmPassword}
                         onChange={handlePasswordResetInputChange}
                         className="w-full px-4 py-3 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                         placeholder="새 비밀번호를 다시 입력하세요"
                         required
                       />
                     </div>

                     <div className="flex gap-3">
                       <button
                         type="button"
                         onClick={() => setPasswordResetStep(1)}
                         className="cursor-pointer flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-lg transition-colors font-medium"
                       >
                         이전
                       </button>
                       <button
                         type="submit"
                         disabled={passwordResetLoading}
                         className="cursor-pointer flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white py-3 rounded-lg transition-colors font-medium"
                       >
                         {passwordResetLoading ? "처리 중..." : "비밀번호 변경"}
                       </button>
                     </div>
                   </form>
                 )}
               </>
             )}
            
            {!showPasswordReset && (
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  계정이 없으신가요?{' '}
                  <a href="/register" className="text-purple-600 hover:text-purple-700 font-medium">
                    회원가입
                  </a>
                </p>
              </div>
            )}
            
                          {!showPasswordReset && (
                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">또는</span>
                    </div>
                  </div>
                  
                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <button className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                      <span className="text-lg mr-2">📧</span>
                      이메일
                    </button>
                    <button className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                      <span className="text-lg mr-2">📱</span>
                      카카오
                    </button>
                  </div>
                </div>
              )}
          </div>
        </div>
      </section>
    </div>
  );
}