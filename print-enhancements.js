// 인쇄 기능 개선 스크립트
(function() {
    'use strict';
    
    // 일정표 인쇄 버튼 기능 개선
    document.addEventListener('DOMContentLoaded', function() {
        const downloadGuideBtn = document.getElementById('download-guide-btn');
        
        if (downloadGuideBtn) {
            // 기존 PDF 다운로드 버튼에 인쇄 옵션 추가
            downloadGuideBtn.addEventListener('contextmenu', function(e) {
                e.preventDefault();
                printSchedule();
            });
            
            // 인쇄 전용 버튼 추가
            const printBtn = document.createElement('button');
            printBtn.innerHTML = '🖨️ 일정표 인쇄하기 (2페이지)';
            printBtn.className = 'bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg ml-4';
            printBtn.onclick = printSchedule;
            
            downloadGuideBtn.parentNode.appendChild(printBtn);
        }
    });
    
    // 일정표 인쇄 함수
    function printSchedule() {
        // 현재 탭 저장
        const activeTab = document.querySelector('.tab-active');
        const activeTabName = activeTab ? activeTab.getAttribute('data-tab') : 'guide';
        
        // 인쇄를 위해 일정 탭 활성화
        const guideTab = document.querySelector('[data-tab="guide"]');
        const guideContent = document.getElementById('guide');
        
        if (guideTab && guideContent) {
            // 임시로 가이드 탭 표시
            document.querySelectorAll('.tab-panel').forEach(panel => {
                panel.classList.add('hidden');
            });
            guideContent.classList.remove('hidden');
            
            // 인쇄 클래스 추가
            document.body.classList.add('print-schedule');
            
            // 인쇄 다이얼로그 열기
            window.print();
            
            // 인쇄 후 원래 상태로 복원
            setTimeout(() => {
                document.body.classList.remove('print-schedule');
                
                // 원래 탭으로 복원
                document.querySelectorAll('.tab-panel').forEach(panel => {
                    panel.classList.add('hidden');
                });
                document.getElementById(activeTabName).classList.remove('hidden');
            }, 100);
        }
    }
    
    // 인쇄 전 이벤트 처리
    window.addEventListener('beforeprint', function() {
        console.log('인쇄 준비 중...');
        
        // 테이블이 페이지를 넘어가지 않도록 조정
        const tables = document.querySelectorAll('table');
        tables.forEach(table => {
            const rows = table.querySelectorAll('tbody tr');
            
            // 2일차 시작 행 찾기
            rows.forEach((row, index) => {
                if (row.textContent.includes('2일차')) {
                    // 2일차부터 새 페이지에서 시작하도록 클래스 추가
                    row.classList.add('page-break-before');
                }
            });
        });
    });
    
    // 인쇄 후 이벤트 처리
    window.addEventListener('afterprint', function() {
        console.log('인쇄 완료');
        
        // 추가된 클래스 제거
        document.querySelectorAll('.page-break-before').forEach(el => {
            el.classList.remove('page-break-before');
        });
    });
    
    // CSS 클래스 동적 추가
    const style = document.createElement('style');
    style.textContent = `
        .page-break-before {
            page-break-before: always !important;
        }
        
        @media print {
            .print-schedule #guide-content {
                display: block !important;
                visibility: visible !important;
            }
        }
    `;
    document.head.appendChild(style);
})();