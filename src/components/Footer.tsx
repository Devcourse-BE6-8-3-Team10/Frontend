import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#2D3748] px-6 py-8 mt-10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white font-bold text-lg mb-4">
              특허바다
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              혁신적인 특허와 무형자산을 안전하고 편리하게 거래하는
              플랫폼입니다.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">서비스</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/patents/search"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  특허 검색
                </Link>
              </li>
              <li>
                <Link
                  href="/patents/register"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  특허 등록
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">고객지원</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/legal/faq"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  자주 묻는 질문
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/terms"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  이용약관
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/privacy"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  개인정보처리방침
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">연락처</h4>
            <ul className="space-y-2 text-sm">
              <li className="text-gray-300">전화: 02-1234-5678</li>
              <li className="text-gray-300">
                이메일: info@patentmarket.com
              </li>
              <li className="text-gray-300">
                주소: 서울시 강남구 테헤란로 123
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-600 mt-8 pt-8 text-center">
          <p className="text-gray-300 text-sm">
            © 2024 특허바다. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
