export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2a4fa2] via-[#1a365d] to-[#1a365d]">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">이용약관</h1>

          <div className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">제1조 (목적)</h2>
              <p className="leading-relaxed">
                본 약관은 특허바다(이하 &quot;회사&quot;)가 제공하는 특허 거래 플랫폼 서비스의 이용과 관련하여
                회사와 이용자 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">제2조 (정의)</h2>
              <div className="space-y-3">
                <p className="leading-relaxed">
                  <strong>1. &quot;서비스&quot;</strong>라 함은 회사가 제공하는 특허 검색, 등록, 거래 중개, 법률 자문 등의 모든 서비스를 의미합니다.
                </p>
                <p className="leading-relaxed">
                  <strong>2. &quot;이용자&quot;</strong>라 함은 회사의 서비스에 접속하여 본 약관에 따라 회사와 이용계약을 체결하고
                  회사가 제공하는 서비스를 이용하는 회원 및 비회원을 말합니다.
                </p>
                <p className="leading-relaxed">
                  <strong>3. &quot;회원&quot;</strong>이라 함은 회사의 서비스에 접속하여 본 약관에 동의하고 회사와 이용계약을 체결한 자를 말합니다.
                </p>
              </div>
            </section>

            {/* 나머지 코드는 동일합니다. */}
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">제3조 (약관의 효력 및 변경)</h2>
              <div className="space-y-3">
                <p className="leading-relaxed">
                  1. 본 약관은 서비스 화면에 게시하거나 기타의 방법으로 회원에게 공지함으로써 효력이 발생합니다.
                </p>
                <p className="leading-relaxed">
                  2. 회사는 필요한 경우 관련법령을 위배하지 않는 범위에서 본 약관을 변경할 수 있습니다.
                </p>
                <p className="leading-relaxed">
                  3. 약관이 변경되는 경우, 변경사항의 시행일자 30일 전부터 시행일자 전일까지 공지합니다.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">제4조 (서비스의 제공)</h2>
              <div className="space-y-3">
                <p className="leading-relaxed">
                  회사는 다음과 같은 서비스를 제공합니다:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>특허 검색 및 조회 서비스</li>
                  <li>특허 등록 및 관리 서비스</li>
                  <li>특허 거래 중개 서비스</li>
                  <li>법률 자문 및 상담 서비스</li>
                  <li>기타 회사가 정하는 서비스</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">제5조 (서비스의 중단)</h2>
              <div className="space-y-3">
                <p className="leading-relaxed">
                  1. 회사는 컴퓨터 등 정보통신설비의 보수점검, 교체 및 고장, 통신의 두절 등의 사유가 발생한 경우에는
                  서비스의 제공을 일시적으로 중단할 수 있습니다.
                </p>
                <p className="leading-relaxed">
                  2. 회사는 제1항의 사유로 서비스의 제공이 일시적으로 중단됨으로 인하여 이용자 또는 제3자가 입은 손해에 대하여 배상합니다.
                  단, 회사가 고의 또는 과실이 없음을 입증하는 경우에는 그러하지 아니합니다.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">제6조 (회원가입)</h2>
              <div className="space-y-3">
                <p className="leading-relaxed">
                  1. 이용자는 회사가 정한 가입 양식에 따라 회원정보를 기입한 후 본 약관에 동의한다는 의사표시를 함으로서 회원가입을 신청합니다.
                </p>
                <p className="leading-relaxed">
                  2. 회사는 제1항과 같이 회원으로 가입할 것을 신청한 이용자 중 다음 각호에 해당하지 않는 한 회원으로 등록합니다.
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>가입신청자가 본 약관에 의하여 이전에 회원자격을 상실한 적이 있는 경우</li>
                  <li>등록 내용에 허위, 기재누락, 오기가 있는 경우</li>
                  <li>기타 회원으로 등록하는 것이 회사의 기술상 현저히 지장이 있다고 판단되는 경우</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">제7조 (회원탈퇴 및 자격 상실)</h2>
              <div className="space-y-3">
                <p className="leading-relaxed">
                  1. 회원은 회사에 언제든지 탈퇴를 요청할 수 있으며 회사는 즉시 회원탈퇴를 처리합니다.
                </p>
                <p className="leading-relaxed">
                  2. 회원이 다음 각호의 사유에 해당하는 경우, 회사는 회원자격을 제한 및 정지시킬 수 있습니다.
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>가입 신청 시에 허위 내용을 등록한 경우</li>
                  <li>다른 사람의 서비스 이용을 방해하거나 그 정보를 도용하는 등 전자상거래 질서를 위협하는 경우</li>
                  <li>서비스를 이용하여 법령 또는 이 약관이 금지하거나 공서양속에 반하는 행위를 하는 경우</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">제8조 (개인정보보호)</h2>
              <p className="leading-relaxed">
                회사는 관련법령이 정하는 바에 따라 회원의 개인정보를 보호하며, 개인정보의 보호 및 사용에 대해서는
                관련법령 및 회사가 정하는 개인정보처리방침을 적용합니다.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">제9조 (회사의 의무)</h2>
              <div className="space-y-3">
                <p className="leading-relaxed">
                  1. 회사는 관련법령과 본 약관이 금지하거나 공서양속에 반하는 행위를 하지 않으며 본 약관이 정하는 바에 따라
                  지속적이고, 안정적으로 서비스를 제공하기 위하여 노력합니다.
                </p>
                <p className="leading-relaxed">
                  2. 회사는 이용자가 안전하게 인터넷 서비스를 이용할 수 있도록 이용자의 개인정보(신용정보 포함) 보호를 위한
                  보안 시스템을 구축합니다.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">제10조 (이용자의 의무)</h2>
              <div className="space-y-3">
                <p className="leading-relaxed">이용자는 다음 행위를 하여서는 안됩니다.</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>신청 또는 변경 시 허위내용의 등록</li>
                  <li>타인의 정보 도용</li>
                  <li>회사가 게시한 정보의 변경</li>
                  <li>회사가 정한 정보 이외의 정보(컴퓨터 프로그램 등) 등의 송신 또는 게시</li>
                  <li>회사 기타 제3자의 저작권 등 지적재산권에 대한 침해</li>
                  <li>회사 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위</li>
                  <li>외설 또는 폭력적인 메시지, 화상, 음성, 기타 공서양속에 반하는 정보를 서비스에 공개 또는 게시하는 행위</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">제11조 (저작권의 귀속 및 이용제한)</h2>
              <div className="space-y-3">
                <p className="leading-relaxed">
                  1. 회사가 작성한 저작물에 대한 저작권 기타 지적재산권은 회사에 귀속합니다.
                </p>
                <p className="leading-relaxed">
                  2. 이용자는 서비스를 이용함으로써 얻은 정보 중 회사에게 지적재산권이 귀속된 정보를
                  회사의 사전 승낙 없이 복제, 송신, 출판, 배포, 방송 기타 방법에 의하여 영리목적으로 이용하거나
                  제3자에게 이용하게 하여서는 안됩니다.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">제12조 (분쟁해결)</h2>
              <div className="space-y-3">
                <p className="leading-relaxed">
                  1. 회사는 이용자가 제기하는 정당한 의견이나 불만을 반영하고 그 피해를 보상처리하기 위하여
                  피해보상처리기구를 설치·운영합니다.
                </p>
                <p className="leading-relaxed">
                  2. 회사와 이용자 간에 발생한 전자상거래 분쟁에 관하여는 소비자분쟁조정위원회의 조정에 따를 수 있습니다.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">제13조 (재판권 및 준거법)</h2>
              <div className="space-y-3">
                <p className="leading-relaxed">
                  1. 회사와 이용자 간에 발생한 분쟁에 관하여는 대한민국 법을 적용합니다.
                </p>
                <p className="leading-relaxed">
                  2. 회사와 이용자 간에 제기된 소송에는 대한민국의 법원을 관할법원으로 합니다.
                </p>
              </div>
            </section>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                <strong>부칙</strong><br />
                본 약관은 2024년 1월 1일부터 시행합니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}