export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2a4fa2] via-[#1a365d] to-[#1a365d]">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">개인정보처리방침</h1>
          
          <div className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">1. 개인정보의 처리 목적</h2>
              <p className="leading-relaxed mb-4">
                특허바다(이하 &quot;회사&quot;)는 다음의 목적을 위하여 개인정보를 처리하고 있으며, 
                다음의 목적 이외의 용도로는 이용하지 않습니다.
              </p>
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-gray-800">1) 회원가입 및 관리</h3>
                  <p className="text-sm text-gray-600 ml-4">
                    회원 가입의사 확인, 회원제 서비스 제공에 따른 본인 식별·인증, 회원자격 유지·관리, 
                    서비스 부정이용 방지, 만14세 미만 아동 개인정보 수집·이용·제공 거부, 각종 고지·통지, 
                    고충처리 목적으로 개인정보를 처리합니다.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">2) 특허 거래 서비스 제공</h3>
                  <p className="text-sm text-gray-600 ml-4">
                    특허 검색, 등록, 거래 중개, 법률 자문 등 서비스 제공, 콘텐츠 제공, 
                    맞춤 서비스 제공, 본인인증, 연령인증, 요금결제·정산, 채권추심 목적으로 개인정보를 처리합니다.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">3) 고충처리</h3>
                  <p className="text-sm text-gray-600 ml-4">
                    민원인의 신원 확인, 민원사항 확인, 사실조사를 위한 연락·통지, 처리결과 통보 목적으로 개인정보를 처리합니다.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">2. 개인정보의 처리 및 보유기간</h2>
              <div className="space-y-3">
                <p className="leading-relaxed">
                  회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 
                  개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">각각의 개인정보 처리 및 보유 기간은 다음과 같습니다.</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• 회원가입 및 관리: 서비스 이용계약 또는 회원가입 해지시까지</li>
                    <li>• 특허 거래 서비스 제공: 서비스 이용계약 또는 회원가입 해지시까지</li>
                    <li>• 고충처리: 민원 처리 완료시까지</li>
                    <li>• 관련 법령에 따른 보존: 관련 법령에 따라 보존이 필요한 경우 해당 기간</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">3. 개인정보의 제3자 제공</h2>
              <div className="space-y-3">
                <p className="leading-relaxed">
                  회사는 정보주체의 개인정보를 제1조(개인정보의 처리 목적)에서 명시한 범위 내에서만 처리하며, 
                  정보주체의 동의, 법률의 특별한 규정 등 개인정보보호법 제17조 및 제18조에 해당하는 경우에만 
                  개인정보를 제3자에게 제공합니다.
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">제3자 제공 시 제공받는 자, 제공목적, 제공정보, 보유기간:</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• 제공받는 자: 특허 거래 상대방</li>
                    <li>• 제공목적: 특허 거래 진행 및 계약 이행</li>
                    <li>• 제공정보: 거래에 필요한 최소한의 정보</li>
                    <li>• 보유기간: 거래 완료 후 3년</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">4. 개인정보처리의 위탁</h2>
              <div className="space-y-3">
                <p className="leading-relaxed">
                  회사는 원활한 개인정보 업무처리를 위하여 다음과 같이 개인정보 처리업무를 위탁하고 있습니다.
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">위탁받는 자(수탁자):</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• 클라우드 서비스 제공업체: 서버 운영 및 데이터 보관</li>
                    <li>• 결제 서비스 제공업체: 결제 처리 및 정산</li>
                    <li>• 이메일 서비스 제공업체: 이메일 발송 서비스</li>
                  </ul>
                </div>
                <p className="text-sm text-gray-600">
                  위탁계약 체결시 개인정보보호법 제26조에 따라 위탁업무 수행목적 외 개인정보 처리금지, 
                  기술적·관리적 보호조치, 재위탁 제한, 수탁자에 대한 관리·감독, 손해배상 등 책임에 관한 
                  사항을 계약서 등 문서에 명시하고, 수탁자가 개인정보를 안전하게 처리하는지를 감독하고 있습니다.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">5. 정보주체의 권리·의무 및 그 행사방법</h2>
              <div className="space-y-3">
                <p className="leading-relaxed">
                  정보주체는 회사에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다.
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>개인정보 열람요구</li>
                  <li>오류 등이 있을 경우 정정 요구</li>
                  <li>삭제요구</li>
                  <li>처리정지 요구</li>
                </ul>
                <p className="text-sm text-gray-600">
                  제1항에 따른 권리 행사는 회사에 대해 서면, 전화, 전자우편, 모사전송(FAX) 등을 통하여 하실 수 있으며 
                  회사는 이에 대해 지체없이 조치하겠습니다.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">6. 처리하는 개인정보의 항목</h2>
              <div className="space-y-3">
                <p className="leading-relaxed">
                  회사는 다음의 개인정보 항목을 처리하고 있습니다.
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">필수항목:</h3>
                  <ul className="space-y-1 text-sm">
                    <li>• 회원가입: 이메일주소, 비밀번호, 이름, 휴대전화번호</li>
                    <li>• 특허 거래: 거래 관련 정보, 결제 정보</li>
                    <li>• 고충처리: 이름, 연락처, 민원내용</li>
                  </ul>
                  <h3 className="font-semibold text-gray-800 mb-2 mt-4">선택항목:</h3>
                  <ul className="space-y-1 text-sm">
                    <li>• 프로필 정보: 회사명, 직책, 주소</li>
                    <li>• 마케팅 정보: 관심 분야, 선호도</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">7. 개인정보의 파기</h2>
              <div className="space-y-3">
                <p className="leading-relaxed">
                  회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 
                  지체없이 해당 개인정보를 파기합니다.
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">파기절차 및 방법:</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• 파기절차: 불필요한 개인정보 및 개인정보파일은 개인정보보호책임자의 승인을 받아 파기</li>
                    <li>• 파기방법: 전자적 파일 형태의 정보는 기록을 재생할 수 없는 기술적 방법을 사용하여 삭제</li>
                    <li>• 종이에 출력된 개인정보는 분쇄기로 분쇄하거나 소각을 통하여 파기</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">8. 개인정보의 안전성 확보 조치</h2>
              <div className="space-y-3">
                <p className="leading-relaxed">
                  회사는 개인정보보호법 제29조에 따라 다음과 같은 안전성 확보 조치를 취하고 있습니다.
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <ul className="space-y-2 text-sm">
                    <li>• 개인정보의 암호화: 개인정보는 암호화되어 저장 및 전송됩니다.</li>
                    <li>• 해킹 등에 대비한 기술적 대책: 해킹이나 컴퓨터 바이러스 등에 의한 개인정보 유출 및 훼손을 방지하기 위하여 보안프로그램을 설치하고 주기적인 갱신·점검을 하며 외부로부터 접근이 통제된 구역에 시스템을 설치하고 기술적/물리적으로 감시 및 차단하고 있습니다.</li>
                    <li>• 개인정보에 대한 접근 제한: 개인정보를 처리하는 데이터베이스시스템에 대한 접근권한의 부여, 변경, 말소를 통하여 개인정보에 대한 접근을 통제하고, 침입차단시스템을 이용하여 외부로부터의 무단 접근을 통제하고 있습니다.</li>
                    <li>• 문서보안을 위한 잠금장치 사용: 개인정보가 포함된 서류, 보조저장매체 등을 잠금장치가 있는 안전한 장소에 보관하고 있습니다.</li>
                    <li>• 비인가자에 대한 출입 통제: 개인정보를 보관하고 있는 물리적 보관 장소를 별도로 두고 이에 대해 출입통제 절차를 수립, 운영하고 있습니다.</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">9. 개인정보 보호책임자</h2>
              <div className="space-y-3">
                <p className="leading-relaxed">
                  회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 
                  불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">개인정보 보호책임자:</h3>
                  <ul className="space-y-1 text-sm">
                    <li>• 성명: 홍길동</li>
                    <li>• 직책: 개인정보보호책임자</li>
                    <li>• 연락처: 02-1234-5678</li>
                    <li>• 이메일: privacy@patentmarket.com</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">10. 개인정보 처리방침 변경</h2>
              <div className="space-y-3">
                <p className="leading-relaxed">
                  이 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 
                  변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.
                </p>
              </div>
            </section>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                <strong>시행일자:</strong> 2024년 1월 1일<br />
                <strong>최종 변경일자:</strong> 2024년 1월 1일
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}