"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RegisterSuccessPage() {
  const router = useRouter();

  // 뒤로가기 방지
  useEffect(() => {
    // 브라우저 히스토리에 현재 페이지를 추가하여 뒤로가기 방지
    window.history.pushState(null, '', window.location.href);
    
    const handlePopState = () => {
      // 뒤로가기 시도 시 홈페이지로 자동 이동
      router.push('/');
    };

    window.addEventListener('popstate', handlePopState);

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [router]);

  const handleLoginClick = () => {
    router.push("/login");
  };

  const handleHomeClick = () => {
    router.push("/");
  };

  return (
    <div className="pb-10">
      <section className="px-6 py-8">
        <div className="max-w-md mx-auto">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
            <div className="text-center mb-8">
              <div className="mb-4">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
              </div>
              <h1 className="text-2xl font-bold text-[#1a365d] mb-2">회원가입 완료!</h1>
              <p className="text-gray-600 text-sm">PatentMarket 회원이 되신 것을 축하합니다</p>
            </div>
            
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-sm">
                회원가입이 성공적으로 완료되었습니다. 이제 로그인하여 서비스를 이용하실 수 있습니다.
              </p>
            </div>
            
            <div className="space-y-4">
              <button
                onClick={handleLoginClick}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg transition-colors font-medium"
              >
                로그인하기
              </button>
              
              <button
                onClick={handleHomeClick}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg transition-colors font-medium"
              >
                홈으로 돌아가기
              </button>
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                궁금한 점이 있으시면{' '}
                <a href="#" className="text-purple-600 hover:text-purple-700 font-medium">
                  고객센터
                </a>
                에 문의해주세요
              </p>
            </div>
            
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">다음 단계</span>
                </div>
              </div>
              
              <div className="mt-6 space-y-3">
                <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-blue-600 text-sm font-bold">1</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-900">로그인</p>
                    <p className="text-xs text-blue-700">계정으로 로그인하세요</p>
                  </div>
                </div>
                
                <div className="flex items-center p-3 bg-orange-50 rounded-lg">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-orange-600 text-sm font-bold">2</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-orange-900">프로필 설정</p>
                    <p className="text-xs text-orange-700">프로필 정보를 완성하세요</p>
                  </div>
                </div>
                
                <div className="flex items-center p-3 bg-green-50 rounded-lg">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-green-600 text-sm font-bold">3</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-900">특허 거래 시작</p>
                    <p className="text-xs text-green-700">특허를 등록하고 거래하세요</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 