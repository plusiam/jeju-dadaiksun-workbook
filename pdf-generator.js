// PDF 생성을 위한 개선된 모듈
// 인솔교사 연락처 빈칸 처리 및 2페이지 구성

const generateImprovedGuidePDF = async () => {
    const downloadBtn = document.getElementById('download-guide-btn');
    downloadBtn.innerHTML = '📄 PDF 생성 중...';
    downloadBtn.disabled = true;
    
    try {
        showPDFLoading('안내/일정 PDF 생성 중...');
        
        // jsPDF 초기화
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');
        
        // 한글 폰트 설정 (기본 폰트 사용)
        doc.setFont('helvetica');
        
        // 페이지 1 내용 생성
        doc.setFontSize(20);
        doc.text('✈️ 다다익선 제주 현장학습 안내', 105, 20, { align: 'center' });
        
        // 인솔교사 연락처 섹션 (빈칸)
        doc.setFontSize(14);
        doc.text('📞 인솔교사 연락처', 20, 40);
        
        // 테이블 형식으로 빈칸 생성
        const startY = 45;
        const lineHeight = 10;
        const labelWidth = 40;
        const valueWidth = 130;
        
        // 교사 정보 빈칸
        const teacherLabels = [
            '담임교사 1',
            '담임교사 2', 
            '부담임교사 1',
            '부담임교사 2',
            '비상연락처'
        ];
        
        teacherLabels.forEach((label, index) => {
            const y = startY + (index * lineHeight);
            doc.setFontSize(11);
            doc.text(label, 25, y + 7);
            doc.rect(25 + labelWidth, y, valueWidth, lineHeight);
        });
        
        // 전체 여행 일정
        let currentY = startY + (teacherLabels.length * lineHeight) + 15;
        doc.setFontSize(14);
        doc.text('전체 여행 일정', 20, currentY);
        
        // 1일차 일정
        currentY += 10;
        doc.setFontSize(12);
        doc.setTextColor(0, 102, 204);
        doc.text('📅 1일차 (10월 17일 금요일)', 20, currentY);
        doc.setTextColor(0, 0, 0);
        
        const day1Schedule = [
            ['06:50', '대구공항 도착 및 수속 준비', '국내선 1번 게이트 앞 집합'],
            ['08:05', '대구공항 출발', '제주항공 J 7C711'],
            ['09:30', '제주공항 도착', '버스 탑승 및 인원 확인'],
            ['10:00', '본태 후 올레래왔수다', ''],
            ['10:40~11:50', '오설록티뮤지엄', '차 문화 체험 및 녹차밭 관람'],
            ['12:00~13:00', '점심 식사 (한식뷔페)', ''],
            ['13:20~15:00', '본태박물관', '건축과 예술 감상'],
            ['15:30~17:00', '제주도립곶자왈도립공원', '곶자왈 숲길 탐방 (편한 신발 필수)'],
            ['17:40~18:50', '저녁 식사 (흑돼지구이)', '제주 특산물 체험'],
            ['19:00', '숙소 도착 및 방 배정', '베스트웨스턴제주호텔']
        ];
        
        currentY += 7;
        doc.setFontSize(9);
        day1Schedule.forEach(row => {
            if (currentY > 270) {
                doc.addPage();
                currentY = 20;
            }
            doc.text(row[0], 25, currentY);
            doc.text(row[1], 55, currentY);
            doc.text(row[2], 120, currentY);
            currentY += 6;
        });
        
        // 2일차 일정
        currentY += 8;
        doc.setFontSize(12);
        doc.setTextColor(0, 102, 204);
        doc.text('📅 2일차 (10월 18일 토요일)', 20, currentY);
        doc.setTextColor(0, 0, 0);
        
        const day2Schedule = [
            ['08:10', '숙소 출발', ''],
            ['09:20~10:20', '제주해녀박물관', '해녀 문화와 역사 체험'],
            ['10:30~11:50', '제주하도카약', '바다 카약 체험 (젖어도 되는 옷 준비)'],
            ['12:30~13:30', '점심 식사 (흑돼지주물럭)', '제주 특산 요리'],
            ['13:40~14:40', '성읍민속마을', '제주의 옛 생활모습 체험'],
            ['15:30~17:30', '넥슨컴퓨터박물관', '게임과 컴퓨터의 역사 체험'],
            ['18:00~19:10', '저녁 식사 (칠성디너뷔페)', '다양한 요리 체험'],
            ['19:30', '숙소 도착 후 자유시간', '베스트웨스턴제주호텔']
        ];
        
        currentY += 7;
        doc.setFontSize(9);
        day2Schedule.forEach(row => {
            if (currentY > 270) {
                doc.addPage();
                currentY = 20;
            }
            doc.text(row[0], 25, currentY);
            doc.text(row[1], 55, currentY);
            doc.text(row[2], 120, currentY);
            currentY += 6;
        });
        
        // 3일차 일정
        currentY += 8;
        doc.setFontSize(12);
        doc.setTextColor(0, 102, 204);
        doc.text('📅 3일차 (10월 19일 일요일)', 20, currentY);
        doc.setTextColor(0, 0, 0);
        
        const day3Schedule = [
            ['09:20', '숙소 출발 및 체크아웃', ''],
            ['10:00~11:20', '아르떼뮤지엄제주', '몰입형 미디어아트 전시'],
            ['11:30~12:10', '점심 식사 (고기국수 or 비빔국수)', '공항 근처 식당'],
            ['12:30', '제주공항 도착 및 탑승 수속', ''],
            ['14:20', '공항 출발', '제주항공 J 7C702'],
            ['15:30', '대구공항 도착', '']
        ];
        
        currentY += 7;
        doc.setFontSize(9);
        day3Schedule.forEach(row => {
            if (currentY > 270) {
                doc.addPage();
                currentY = 20;
            }
            doc.text(row[0], 25, currentY);
            doc.text(row[1], 55, currentY);
            doc.text(row[2], 120, currentY);
            currentY += 6;
        });
        
        // 숙소 정보 (1페이지 하단)
        if (currentY < 250) {
            currentY += 10;
            doc.setFontSize(12);
            doc.setFillColor(255, 243, 205);
            doc.rect(20, currentY - 5, 170, 25, 'F');
            doc.setTextColor(0, 102, 204);
            doc.text('🏨 숙소 정보', 25, currentY);
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(10);
            doc.text('베스트웨스턴제주호텔 (4성급)', 25, currentY + 7);
            doc.text('주소: 제주시 도령로 27(노형동)', 25, currentY + 13);
            doc.text('전화: 064-797-5000', 25, currentY + 19);
        }
        
        // 페이지 2 - 안전수칙 및 준비물
        doc.addPage();
        
        // 안전 수칙
        doc.setFontSize(14);
        doc.text('안전 수칙', 20, 20);
        
        const safetyRules = [
            '• 단체 행동 시 항상 인솔 선생님의 지시에 따라주세요.',
            '• 자유 이동 시에는 반드시 안전확인을 학습합니다.',
            '• 숙소에서는 다른 사람에게 피해를 주지 않도록 조용히 행동합니다.',
            '• 위험한 장소나 행동은 피하고, 문제가 생기면 즉시 선생님께 알립니다.',
            '• 카약 체험 시 구명조끼 착용 필수, 안전 수칙 준수'
        ];
        
        let safetyY = 30;
        doc.setFontSize(10);
        safetyRules.forEach(rule => {
            const lines = doc.splitTextToSize(rule, 170);
            lines.forEach(line => {
                doc.text(line, 25, safetyY);
                safetyY += 6;
            });
        });
        
        // 준비물 체크리스트
        safetyY += 10;
        doc.setFontSize(14);
        doc.text('준비물 체크리스트', 20, safetyY);
        
        safetyY += 10;
        doc.setFontSize(11);
        
        // 필수 서류
        doc.setTextColor(204, 102, 0);
        doc.text('📋 필수 서류', 25, safetyY);
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.text('☐ 신분증(학생 탑승 신분증 안내 참고)', 30, safetyY + 6);
        
        // 의류/신발
        safetyY += 15;
        doc.setFontSize(11);
        doc.setTextColor(204, 102, 0);
        doc.text('👕 의류/신발', 25, safetyY);
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        const clothes = ['☐ 여벌 옷', '☐ 편안한 운동화', '☐ 모자', '☐ 선글라스'];
        clothes.forEach((item, idx) => {
            doc.text(item, 30 + (idx % 2) * 60, safetyY + 6 + Math.floor(idx / 2) * 6);
        });
        
        // 세면도구
        safetyY += 20;
        doc.setFontSize(11);
        doc.setTextColor(204, 102, 0);
        doc.text('🧴 세면도구', 25, safetyY);
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        const toiletries = ['☐ 치약', '☐ 칫솔', '☐ 세면도구'];
        toiletries.forEach((item, idx) => {
            doc.text(item, 30 + (idx % 2) * 60, safetyY + 6);
        });
        
        // 의약품
        safetyY += 15;
        doc.setFontSize(11);
        doc.setTextColor(204, 102, 0);
        doc.text('💊 의약품', 25, safetyY);
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        const medicines = ['☐ 개인 상비약', '☐ 멀미약', '☐ 밴드 및 소독약'];
        medicines.forEach((item, idx) => {
            doc.text(item, 30 + (idx % 2) * 60, safetyY + 6 + Math.floor(idx / 2) * 6);
        });
        
        // 기타
        safetyY += 20;
        doc.setFontSize(11);
        doc.setTextColor(204, 102, 0);
        doc.text('🎒 기타', 25, safetyY);
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        const others = ['☐ 우산/우비', '☐ 충전기', '☐ 검은색 비닐봉지 3장'];
        others.forEach((item, idx) => {
            doc.text(item, 30 + (idx % 2) * 60, safetyY + 6 + Math.floor(idx / 2) * 6);
        });
        
        // 학생 탑승 신분증 안내
        safetyY += 25;
        doc.setFillColor(219, 234, 254);
        doc.rect(20, safetyY - 5, 170, 35, 'F');
        doc.setFontSize(12);
        doc.setTextColor(30, 64, 175);
        doc.text('✈️ 학생 탑승 신분증 안내', 25, safetyY);
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        const idList = [
            '• 학생증 또는 청소년증 (사진 필수)',
            '• 여권',
            '• 주민등록증/초본',
            '• 가족관계증명서',
            '• 건강보험증'
        ];
        let idY = safetyY + 7;
        idList.forEach(id => {
            doc.text(id, 30, idY);
            idY += 5;
        });
        doc.setTextColor(204, 0, 0);
        doc.text('※ 위 중 1개 필수 지참', 30, idY);
        
        // 개인 상비약 안내
        safetyY += 45;
        doc.setFillColor(255, 243, 205);
        doc.rect(20, safetyY - 5, 170, 20, 'F');
        doc.setFontSize(11);
        doc.setTextColor(204, 102, 0);
        doc.text('🏥 개인 상비약 안내', 25, safetyY);
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(9);
        doc.text('먹는 약은 별도 지급하지 않습니다.', 25, safetyY + 6);
        doc.text('평소 본인이 복용하는 약은 본인이 직접 준비해야 하니 미리 준비하시기 바랍니다.', 25, safetyY + 11);
        
        // 비행기 반입 금지 물품 주의사항
        safetyY += 25;
        doc.setFillColor(254, 226, 226);
        doc.rect(20, safetyY - 5, 170, 45, 'F');
        doc.setFontSize(11);
        doc.setTextColor(204, 0, 0);
        doc.text('⚠️ 비행기 반입 금지 물품 주의사항', 25, safetyY);
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(9);
        
        doc.text('다음 물품의 반입 규칙을 확인하세요:', 25, safetyY + 7);
        
        doc.setTextColor(204, 0, 0);
        doc.text('🚫 기내 반입 금지 물품 (위탁수하물로만 가능)', 25, safetyY + 14);
        doc.setTextColor(0, 0, 0);
        doc.text('• 칼, 가위 - 기내 반입 금지 (위탁수하물로만 가능)', 30, safetyY + 20);
        doc.text('• 액체류 - 국내선은 제한 없음 (국제선만 100ml 제한)', 30, safetyY + 25);
        
        doc.setTextColor(204, 102, 0);
        doc.text('⚡ 보조배터리 - 반드시 기내 휴대 (위탁수하물 불가)', 25, safetyY + 31);
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(8);
        doc.text('• 100Wh 이하: 개수 제한 없음', 30, safetyY + 36);
        doc.text('• 100-160Wh: 항공사 승인 시 2개까지', 30, safetyY + 40);
        doc.text('• 160Wh 초과: 탑승 불가', 30, safetyY + 44);
        
        // 경고 메시지
        doc.setFillColor(220, 38, 38);
        doc.rect(20, 265, 170, 12, 'F');
        doc.setFontSize(10);
        doc.setTextColor(255, 255, 255);
        doc.text('⚡ 보조배터리를 위탁수하물에 넣으면 수하물이 반송되거나 폐기됩니다!', 105, 272, { align: 'center' });
        
        // 파일명 설정 및 다운로드
        const fileName = `제주현장학습_안내_${new Date().toISOString().slice(0,10)}.pdf`;
        doc.save(fileName);
        
        hidePDFLoading();
        downloadBtn.innerHTML = '📋 안내/일정 PDF로 다운로드하기';
        downloadBtn.disabled = false;
        
    } catch (error) {
        hidePDFLoading();
        console.error('PDF 생성 오류:', error);
        alert('PDF 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
        downloadBtn.innerHTML = '📋 안내/일정 PDF로 다운로드하기';
        downloadBtn.disabled = false;
    }
};

// PDF 생성 시 로딩 표시
function showPDFLoading(message) {
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.innerHTML = `
        <div class="loading-spinner"></div>
        <div>${message}</div>
    `;
    overlay.id = 'pdf-loading-overlay';
    document.body.appendChild(overlay);
}

// PDF 생성 완료 시 로딩 제거
function hidePDFLoading() {
    const overlay = document.getElementById('pdf-loading-overlay');
    if (overlay) {
        document.body.removeChild(overlay);
    }
}

// 전역 객체에 함수 추가
window.generateImprovedGuidePDF = generateImprovedGuidePDF;