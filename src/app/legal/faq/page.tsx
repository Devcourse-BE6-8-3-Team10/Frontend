"use client";

import { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  {
    question: "특허바다는 어떤 서비스인가요?",
    answer: "특허바다는 혁신적인 특허와 무형자산을 안전하고 편리하게 거래할 수 있는 온라인 플랫폼입니다. 특허 검색, 등록, 거래 중개, 법률 자문 등 종합적인 서비스를 제공합니다.",
    category: "서비스 소개"
  },
  {
    question: "회원가입은 어떻게 하나요?",
    answer: "홈페이지 상단의 '회원가입' 버튼을 클릭하신 후, 이메일 주소와 비밀번호를 입력하여 가입하실 수 있습니다. 가입 후 이메일 인증을 완료하시면 서비스를 이용하실 수 있습니다.",
    category: "회원가입"
  },
  {
    question: "특허 검색은 어떻게 하나요?",
    answer: "메인 페이지의 검색창에서 키워드, 발명자명, 출원번호 등을 입력하여 특허를 검색할 수 있습니다. 고급 검색 기능을 통해 더 정확한 검색 결과를 얻으실 수 있습니다.",
    category: "서비스 이용"
  },
  {
    question: "특허를 등록하려면 어떻게 해야 하나요?",
    answer: "로그인 후 '특허 등록' 메뉴를 클릭하시면 등록 양식을 확인할 수 있습니다. 특허 명세서, 도면, 요약서 등의 자료를 준비하여 업로드하시면 됩니다. 등록 후 검토를 거쳐 승인됩니다.",
    category: "서비스 이용"
  },
  {
    question: "특허 거래 수수료는 얼마인가요?",
    answer: "거래 성사 시 거래 금액의 3%를 수수료로 받고 있습니다. 단, 100만원 미만의 거래는 3만원의 고정 수수료가 적용됩니다. 자세한 내용은 이용약관을 참고해 주세요.",
    category: "요금"
  },
  {
    question: "거래 중개 과정은 어떻게 진행되나요?",
    answer: "1) 구매자가 관심 있는 특허에 대해 문의를 보냅니다. 2) 판매자가 조건을 제시합니다. 3) 양측이 합의하면 계약서를 작성합니다. 4) 결제 후 특허권 이전이 진행됩니다.",
    category: "거래"
  },
  {
    question: "특허의 진위성은 어떻게 확인하나요?",
    answer: "모든 등록된 특허는 특허청 데이터베이스와 연동하여 진위성을 확인합니다. 또한 전문 변리사가 검토하여 유효성을 검증합니다. 거래 전 상세 정보를 제공받으실 수 있습니다.",
    category: "서비스 이용"
  },
  {
    question: "법률 자문 서비스는 어떻게 이용하나요?",
    answer: "특허 변리사와 법률 전문가가 상담을 제공합니다. '법률 자문' 메뉴에서 상담 신청을 하시면 전문가와 1:1 상담을 받으실 수 있습니다. 기본 상담은 무료이며, 심화 상담은 유료입니다.",
    category: "서비스 이용"
  },
  {
    question: "개인정보는 안전하게 보호되나요?",
    answer: "네, 개인정보보호법에 따라 모든 개인정보를 암호화하여 저장하고 있습니다. 제3자 제공 시에는 사전 동의를 받으며, 안전한 보안 시스템을 구축하여 운영하고 있습니다.",
    category: "보안"
  },
  {
    question: "거래 중 분쟁이 발생하면 어떻게 하나요?",
    answer: "거래 중 분쟁이 발생할 경우, 고객센터로 연락해 주시면 전문 상담원이 도움을 드립니다. 필요시 중재 또는 소비자분쟁조정위원회를 통한 해결을 지원합니다.",
    category: "고객지원"
  },
  {
    question: "해외 특허도 거래할 수 있나요?",
    answer: "현재는 국내 특허만 거래 가능합니다. 해외 특허 거래 서비스는 추후 업데이트 예정입니다. 해외 특허 정보는 검색을 통해 확인하실 수 있습니다.",
    category: "서비스 이용"
  },
  {
    question: "특허 평가는 어떻게 이루어지나요?",
    answer: "특허의 기술적 가치, 시장성, 경쟁력 등을 종합적으로 분석하여 평가합니다. 전문 평가사와 AI 시스템을 활용하여 객관적인 평가를 제공합니다.",
    category: "서비스 이용"
  },
  {
    question: "결제 방법은 어떤 것들이 있나요?",
    answer: "신용카드, 계좌이체, 가상계좌 등 다양한 결제 방법을 제공합니다. 대금거래의 경우 에스크로 서비스를 통해 안전한 거래를 보장합니다.",
    category: "결제"
  },
  {
    question: "회원 탈퇴는 어떻게 하나요?",
    answer: "마이페이지의 '회원 탈퇴' 메뉴에서 탈퇴 신청을 하실 수 있습니다. 탈퇴 시 보유하고 계신 개인정보는 모두 삭제되며, 진행 중인 거래가 있다면 완료 후 탈퇴가 가능합니다.",
    category: "회원가입"
  },
  {
    question: "모바일에서도 이용할 수 있나요?",
    answer: "네, 반응형 웹사이트로 제작되어 모바일에서도 편리하게 이용하실 수 있습니다. 향후 모바일 앱도 출시 예정입니다.",
    category: "서비스 이용"
  }
];

const categories = ["전체", "서비스 소개", "회원가입", "서비스 이용", "요금", "거래", "보안", "고객지원", "결제"];

export default function FAQPage() {
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [openItems, setOpenItems] = useState<number[]>([]);

  const filteredFAQs = selectedCategory === "전체" 
    ? faqData 
    : faqData.filter(faq => faq.category === selectedCategory);

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(item => item !== index)
        : [...prev, index]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2a4fa2] via-[#1a365d] to-[#1a365d]">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">자주 묻는 질문</h1>
          
          {/* 카테고리 필터 */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">카테고리별 보기</h2>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* FAQ 목록 */}
          <div className="space-y-4">
            {filteredFAQs.map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-gray-800">{faq.question}</span>
                  <span className={`text-gray-500 transition-transform ${
                    openItems.includes(index) ? 'rotate-180' : ''
                  }`}>
                    ▼
                  </span>
                </button>
                {openItems.includes(index) && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 추가 문의 안내 */}
          <div className="mt-12 p-6 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              더 궁금한 점이 있으신가요?
            </h3>
            <p className="text-gray-600 mb-4">
              위의 FAQ에서 답변을 찾지 못하셨다면, 언제든지 고객센터로 문의해 주세요.
            </p>
            <div className="space-y-2 text-sm text-gray-600">
              <p>📞 전화: 02-1234-5678</p>
              <p>📧 이메일: support@patentmarket.com</p>
              <p>⏰ 운영시간: 평일 09:00 - 18:00 (주말 및 공휴일 휴무)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 