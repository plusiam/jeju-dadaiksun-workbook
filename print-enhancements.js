// 인쇄 기능 개선 스크립트 - v2
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
            printBtn.innerHTML = '🖨️ 일정표 인쇄하기 (가독성 최적화)';
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
            
            // 페이지 나누기 마커 추가
            addPageBreakMarkers();
            
            // 인쇄 다이얼로그 열기
            window.print();
            
            // 인쇄 후 원래 상태로 복원
            setTimeout(() => {
                document.body.classList.remove('print-schedule');
                removePageBreakMarkers();
                
                // 원래 탭으로 복원
                document.querySelectorAll('.tab-panel').forEach(panel => {
                    panel.classList.add('hidden');
                });
                document.getElementById(activeTabName).classList.remove('hidden');
            }, 100);
        }
    }
    
    // 페이지 나누기 마커 추가
    function addPageBreakMarkers() {
        // 안전 수칙 섹션 뒤에 페이지 나누기 표시
        const safetySection = document.querySelector('.bg-slate-800:nth-child(3)');
        if (safetySection) {
            safetySection.classList.add('page-break-after');
        }
        
        // 준비물 체크리스트 섹션 앞에 페이지 나누기 표시
        const checklistSection = document.querySelector('.bg-slate-800:nth-child(4)');
        if (checklistSection) {
            checklistSection.classList.add('page-break-before');
        }
    }
    
    // 페이지 나누기 마커 제거
    function removePageBreakMarkers() {
        document.querySelectorAll('.page-break-after').forEach(el => {
            el.classList.remove('page-break-after');
        });
        document.querySelectorAll('.page-break-before').forEach(el => {
            el.classList.remove('page-break-before');
        });
    }
    
    // 인쇄 전 이벤트 처리
    window.addEventListener('beforeprint', function() {
        console.log('인쇄 준비 중...');
        
        // 체크리스트가 한 페이지에 모두 나오도록 조정
        const checklist = document.getElementById('checklist');
        if (checklist) {
            checklist.style.pageBreakInside = 'avoid';
        }
        
        // 정보 박스들이 페이지를 넘어가지 않도록
        document.querySelectorAll('.bg-yellow-900, .bg-blue-900, .bg-orange-900, .bg-red-900').forEach(box => {
            box.style.pageBreakInside = 'avoid';
        });
        
        // 테이블이 페이지를 넘어가지 않도록
        document.querySelectorAll('table').forEach(table => {
            table.style.pageBreakInside = 'avoid';
        });
    });
    
    // 인쇄 후 이벤트 처리
    window.addEventListener('afterprint', function() {
        console.log('인쇄 완료');
        
        // 스타일 원복
        const checklist = document.getElementById('checklist');
        if (checklist) {
            checklist.style.pageBreakInside = '';
        }
        
        document.querySelectorAll('.bg-yellow-900, .bg-blue-900, .bg-orange-900, .bg-red-900').forEach(box => {
            box.style.pageBreakInside = '';
        });
        
        document.querySelectorAll('table').forEach(table => {
            table.style.pageBreakInside = '';
        });
    });
    
    // CSS 클래스 동적 추가
    const style = document.createElement('style');
    style.textContent = `
        .page-break-before {
            page-break-before: always !important;
        }
        
        .page-break-after {
            page-break-after: always !important;
        }
        
        @media print {
            .print-schedule #guide-content {
                display: block !important;
                visibility: visible !important;
            }
            
            /* 1페이지와 2페이지 사이 명확한 구분 */
            .page-break-after {
                page-break-after: always !important;
                margin-bottom: 0 !important;
            }
            
            .page-break-before {
                page-break-before: always !important;
                margin-top: 0 !important;
            }
        }
        
        /* 화면에서 페이지 나누기 미리보기 */
        @media screen {
            .print-preview-mode .page-break-after::after {
                content: "--- 1페이지 끝 ---";
                display: block;
                text-align: center;
                color: #999;
                margin: 20px 0;
                font-size: 12px;
                border-top: 2px dashed #ddd;
                padding-top: 10px;
            }
            
            .print-preview-mode .page-break-before::before {
                content: "--- 2페이지 시작 ---";
                display: block;
                text-align: center;
                color: #999;
                margin: 20px 0;
                font-size: 12px;
                border-bottom: 2px dashed #ddd;
                padding-bottom: 10px;
            }
        }
    `;
    document.head.appendChild(style);
    
    // 인쇄 미리보기 모드 토글 버튼 추가 (선택사항)
    function addPrintPreviewToggle() {
        const container = document.querySelector('.container');
        if (container && !document.getElementById('print-preview-toggle')) {
            const toggleBtn = document.createElement('button');
            toggleBtn.id = 'print-preview-toggle';
            toggleBtn.innerHTML = '👁️ 인쇄 미리보기 모드';
            toggleBtn.className = 'fixed bottom-4 left-4 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm no-print';
            toggleBtn.onclick = function() {
                document.body.classList.toggle('print-preview-mode');
                this.classList.toggle('bg-blue-600');
                this.innerHTML = document.body.classList.contains('print-preview-mode') 
                    ? '👁️ 미리보기 모드 끄기' 
                    : '👁️ 인쇄 미리보기 모드';
            };
            document.body.appendChild(toggleBtn);
        }
    }
    
    // DOM 로드 완료 후 미리보기 토글 버튼 추가
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', addPrintPreviewToggle);
    } else {
        addPrintPreviewToggle();
    }
})();