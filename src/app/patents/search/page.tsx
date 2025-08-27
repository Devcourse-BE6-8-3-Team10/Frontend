"use client";

import { useState } from "react";

interface Patent {
  id: string;
  title: string;
  inventor: string;
  applicationNumber: string;
  applicationDate: string;
  status: string;
  category: string;
  abstract: string;
  price?: string;
}

const mockPatents: Patent[] = [
  {
    id: "1",
    title: "인공지능 기반 특허 분석 시스템",
    inventor: "김철수",
    applicationNumber: "10-2023-001234",
    applicationDate: "2023-01-15",
    status: "등록완료",
    category: "물건발명",
    abstract: "머신러닝을 활용하여 특허 문서를 자동으로 분석하고 분류하는 시스템으로, 특허 검색의 효율성을 크게 향상시킵니다.",
    price: "5,000만원"
  },
  {
    id: "2",
    title: "블록체인 기반 특허 거래 플랫폼",
    inventor: "이영희",
    applicationNumber: "10-2023-002345",
    applicationDate: "2023-02-20",
    status: "등록완료",
    category: "방법발명",
    abstract: "스마트 컨트랙트를 활용하여 특허 거래의 투명성과 안전성을 보장하는 블록체인 기반 플랫폼입니다.",
    price: "3,500만원"
  },
  {
    id: "3",
    title: "친환경 배터리 기술",
    inventor: "박민수",
    applicationNumber: "10-2023-003456",
    applicationDate: "2023-03-10",
    status: "심사중",
    category: "물건발명",
    abstract: "리튬이온 배터리의 성능을 향상시키면서도 환경 친화적인 새로운 배터리 기술입니다.",
    price: "8,000만원"
  },
  {
    id: "4",
    title: "IoT 기반 스마트 홈 시스템",
    inventor: "최지영",
    applicationNumber: "10-2023-004567",
    applicationDate: "2023-04-05",
    status: "등록완료",
    category: "방법발명",
    abstract: "다양한 IoT 센서를 활용하여 가정의 모든 전자기기를 통합 관리하는 스마트 홈 시스템입니다.",
    price: "2,500만원"
  },
  {
    id: "5",
    title: "바이오 의료 진단 장치",
    inventor: "정수진",
    applicationNumber: "10-2023-005678",
    applicationDate: "2023-05-12",
    status: "심사중",
    category: "물건발명",
    abstract: "혈액 검사를 통해 다양한 질병을 빠르고 정확하게 진단할 수 있는 바이오 센서 기술입니다.",
    price: "12,000만원"
  },
  {
    id: "6",
    title: "신제품 디자인",
    inventor: "한지민",
    applicationNumber: "10-2023-006789",
    applicationDate: "2023-06-01",
    status: "등록완료",
    category: "디자인권",
    abstract: "혁신적인 제품 디자인으로 사용자 경험을 향상시키는 새로운 형태의 제품입니다.",
    price: "1,500만원"
  },
  {
    id: "7",
    title: "브랜드 상표",
    inventor: "송민호",
    applicationNumber: "10-2023-007890",
    applicationDate: "2023-06-15",
    status: "등록완료",
    category: "상표권",
    abstract: "독창적인 브랜드 로고와 상표로 제품의 인지도를 높이는 상표권입니다.",
    price: "800만원"
  },
  {
    id: "8",
    title: "소프트웨어 저작권",
    inventor: "윤서연",
    applicationNumber: "10-2023-008901",
    applicationDate: "2023-07-01",
    status: "등록완료",
    category: "저작권",
    abstract: "혁신적인 소프트웨어 알고리즘과 프로그램으로 특정 기능을 수행하는 저작권입니다.",
    price: "3,200만원"
  }
];

export default function PatentSearchPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [selectedStatus, setSelectedStatus] = useState("전체");
  const [sortBy, setSortBy] = useState("최신순");

  const categories = ["전체", "물건발명", "방법발명", "용도발명", "디자인권", "상표권", "저작권", "기타"];
  const statuses = ["전체", "등록완료", "심사중", "출원완료"];

  const filteredPatents = mockPatents.filter(patent => {
    const matchesSearch = patent.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patent.inventor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patent.abstract.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "전체" || patent.category === selectedCategory;
    const matchesStatus = selectedStatus === "전체" || patent.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const sortedPatents = [...filteredPatents].sort((a, b) => {
    switch (sortBy) {
      case "최신순":
        return new Date(b.applicationDate).getTime() - new Date(a.applicationDate).getTime();
      case "오래된순":
        return new Date(a.applicationDate).getTime() - new Date(b.applicationDate).getTime();
      case "가격높은순":
        return (parseInt(b.price?.replace(/[^0-9]/g, "") || "0") - parseInt(a.price?.replace(/[^0-9]/g, "") || "0"));
      case "가격낮은순":
        return (parseInt(a.price?.replace(/[^0-9]/g, "") || "0") - parseInt(b.price?.replace(/[^0-9]/g, "") || "0"));
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2a4fa2] via-[#1a365d] to-[#1a365d]">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">특허 검색</h1>
          
          {/* 검색 필터 */}
          <div className="mb-8 space-y-4">
            {/* 검색창 */}
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="특허명, 발명자, 키워드로 검색하세요"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
              />
              <button className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                검색
              </button>
            </div>

            {/* 필터 옵션 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">분야</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">상태</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {statuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">정렬</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="최신순">최신순</option>
                  <option value="오래된순">오래된순</option>
                  <option value="가격높은순">가격높은순</option>
                  <option value="가격낮은순">가격낮은순</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("전체");
                    setSelectedStatus("전체");
                    setSortBy("최신순");
                  }}
                  className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  필터 초기화
                </button>
              </div>
            </div>
          </div>

          {/* 검색 결과 */}
          <div className="mb-4">
            <p className="text-gray-600">
              검색 결과: <span className="font-semibold">{sortedPatents.length}</span>건
            </p>
          </div>

          {/* 특허 목록 */}
          <div className="space-y-4">
            {sortedPatents.map((patent) => (
              <div key={patent.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      <a href={`/patents/${patent.id}`} className="hover:text-blue-600 transition-colors">
                        {patent.title}
                      </a>
                    </h3>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                      <span>발명자: {patent.inventor}</span>
                      <span>출원번호: {patent.applicationNumber}</span>
                      <span>출원일: {patent.applicationDate}</span>
                      <span>분야: {patent.category}</span>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{patent.abstract}</p>
                  </div>
                  <div className="text-right ml-4">
                    <div className={`px-3 py-1 rounded-full text-xs font-medium mb-2 ${
                      patent.status === "등록완료" ? "bg-green-100 text-green-800" :
                      patent.status === "심사중" ? "bg-yellow-100 text-yellow-800" :
                      "bg-gray-100 text-gray-800"
                    }`}>
                      {patent.status}
                    </div>
                    {patent.price && (
                      <div className="text-lg font-bold text-blue-600">
                        {patent.price}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <button className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                    상세보기
                  </button>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    문의하기
                  </button>
                </div>
              </div>
            ))}
          </div>

          {sortedPatents.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">검색 결과가 없습니다.</p>
              <p className="text-gray-400 mt-2">다른 키워드로 검색해 보세요.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 