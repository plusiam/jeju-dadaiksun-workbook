// ======== PWA Service Worker 등록 ========
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(registration => {
                console.log('ServiceWorker 등록 성공:', registration.scope);
            })
            .catch(err => {
                console.log('ServiceWorker 등록 실패:', err);
            });
    });
}

// PWA 설치 프롬프트
let deferredPrompt;
const pwaInstallPrompt = document.getElementById('pwa-install-prompt');
const pwaInstallBtn = document.getElementById('pwa-install-btn');

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    pwaInstallPrompt.classList.remove('hidden');
});

if (pwaInstallBtn) {
    pwaInstallBtn.addEventListener('click', async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                console.log('PWA 설치 수락');
            }
            deferredPrompt = null;
            pwaInstallPrompt.classList.add('hidden');
        }
    });
}

// 홈으로 가기 함수
function goToHome() {
    const guideTab = document.querySelector('button[data-tab="guide"]');
    if (guideTab) {
        guideTab.click();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const STORAGE_KEY = 'jejuFieldTripData';
    const IMAGES_KEY = 'jejuFieldTripImages';
    const BACKUP_GUIDE_KEY = 'jejuBackupGuideShown';
    const form = document.getElementById('main-form');
    const savableInputs = form.querySelectorAll('.savable');
    const autosaveIndicator = document.getElementById('autosave-indicator');
    const backupGuide = document.getElementById('backup-guide');

    // ======== 이미지 저장 및 진행률 관리 ========
    
    const dayImages = {
        day1: null,
        day2: null,
        day3: null
    };

    // 저장된 이미지들 불러오기
    const loadSavedImages = () => {
        const saved = localStorage.getItem(IMAGES_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            Object.assign(dayImages, parsed);
            updateProgress();
        }
    };

    // 이미지 저장
    const saveDayImage = (day, imageData) => {
        dayImages[day] = imageData;
        localStorage.setItem(IMAGES_KEY, JSON.stringify(dayImages));
        updateProgress();
    };

    // 진행률 업데이트
    const updateProgress = () => {
        const progressDots = {
            day1: document.getElementById('progress-dot-1'),
            day2: document.getElementById('progress-dot-2'),
            day3: document.getElementById('progress-dot-3')
        };

        Object.keys(dayImages).forEach(day => {
            const dot = progressDots[day];
            const statusEl = document.getElementById(`${day}-status`);
            
            if (dayImages[day]) {
                dot.className = 'w-3 h-3 rounded-full progress-completed';
                if (statusEl) {
                    statusEl.innerHTML = '✅ 완료됨 (이미지 저장됨)';
                    statusEl.className = 'mt-2 text-sm text-green-400';
                }
            } else {
                dot.className = 'w-3 h-3 rounded-full progress-inactive';
                if (statusEl) {
                    statusEl.innerHTML = '';
                }
            }
        });
    };

    // 워터마크 추가 함수
    const addWatermark = (canvas) => {
        const ctx = canvas.getContext('2d');
        const currentDate = new Date().toLocaleDateString('ko-KR');
        
        // 워터마크 텍스트 설정
        ctx.font = '14px Arial';
        ctx.fillStyle = 'rgba(200, 200, 200, 0.6)';
        ctx.textAlign = 'right';
        
        // 하단 우측에 워터마크 추가
        ctx.fillText(`다다익선 제주학습 2025`, canvas.width - 10, canvas.height - 30);
        ctx.fillText(currentDate, canvas.width - 10, canvas.height - 10);
    };

    // 익명화 함수
    const anonymizeInfo = (name, school) => {
        const anonymousMode = document.getElementById('anonymous_mode').checked;
        if (anonymousMode) {
            // 익명 모드일 때
            const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
            return {
                name: `제주 탐험가 #${randomNum}`,
                school: school || '제주 학교'
            };
        }
        return { name, school };
    };

    // 각 일차별 이미지 생성 및 다운로드
    const generateDayImage = async (day) => {
        const contentEl = document.getElementById(`${day}-content`);
        const btn = document.getElementById(`complete-${day}-btn`);
        
        btn.innerHTML = '📸 이미지 생성 중...';
        btn.disabled = true;
        
        try {
            // 기본 정보도 포함하기 위해 임시 컨테이너 생성
            const tempContainer = document.createElement('div');
            tempContainer.style.padding = '20px';
            tempContainer.style.backgroundColor = '#1e293b';
            tempContainer.style.color = 'white';
            tempContainer.style.fontFamily = 'Pretendard, sans-serif';
            tempContainer.style.width = '800px';
            
            // 기본 정보 추가
            const isTeamMode = form.querySelector('input[name="mode"]:checked').value === 'team';
            const getTextValue = (id) => document.getElementById(id).value.trim() || '작성 안함';
            
            // 익명화 처리
            const originalName = getTextValue('student_name');
            const originalSchool = getTextValue('student_school');
            const { name: displayName, school: displaySchool } = anonymizeInfo(originalName, originalSchool);
            
            const basicInfo = document.createElement('div');
            basicInfo.style.marginBottom = '20px';
            basicInfo.style.padding = '15px';
            basicInfo.style.backgroundColor = '#374151';
            basicInfo.style.borderRadius = '8px';
            
            let teamInfoHtml = '';
            if (isTeamMode && getTextValue('team_name') !== '작성 안함') {
                teamInfoHtml = `
                    <div style="margin-top: 10px; padding: 10px; background-color: #4b5563; border-radius: 6px;">
                        <h4 style="font-weight: bold; color: #93c5fd; margin-bottom: 5px;">🏆 팀 정보</h4>
                        <p><strong>팀명:</strong> ${getTextValue('team_name')}</p>
                        <p><strong>내 역할:</strong> ${getTextValue('team_role')}</p>
                    </div>`;
            }
            
            basicInfo.innerHTML = `
                <h3 style="font-size: 18px; font-weight: bold; color: #93c5fd; margin-bottom: 10px;">✈️ 다다익선 제주 현장학습</h3>
                <p><strong>학교:</strong> ${displaySchool}</p>
                <p><strong>학년:</strong> ${getTextValue('student_grade')}</p>
                <p><strong>이름:</strong> ${displayName}</p>
                ${teamInfoHtml}
            `;
            
            tempContainer.appendChild(basicInfo);
            
            // 해당 일차 내용 복사
            const clonedContent = contentEl.cloneNode(true);
            tempContainer.appendChild(clonedContent);
            
            // 임시로 body에 추가
            document.body.appendChild(tempContainer);
            
            const canvas = await html2canvas(tempContainer, {
                backgroundColor: '#1e293b',
                scale: 2,
                useCORS: true,
                allowTaint: true
            });
            
            // 워터마크 추가
            addWatermark(canvas);
            
            // 임시 컨테이너 제거
            document.body.removeChild(tempContainer);
            
            const imageData = canvas.toDataURL('image/png');
            
            // 이미지 저장
            saveDayImage(day, imageData);
            
            // 이미지 다운로드
            const link = document.createElement('a');
            const dayNum = day.replace('day', '');
            const fileName = isTeamMode && getTextValue('team_name') !== '작성 안함' 
                ? `제주학습_${dayNum}일차_${getTextValue('team_name')}_${displayName}.png`
                : `제주학습_${dayNum}일차_${displayName}.png`;
                
            link.download = fileName;
            link.href = imageData;
            link.click();
            
            btn.innerHTML = '✅ 완료! 이미지가 저장되었습니다';
            btn.className = 'bg-gray-600 text-white font-bold py-3 px-6 rounded-lg cursor-not-allowed';
            
            // 작업이 완료되었으니 백업을 권장
            showNotification('🔔 중요한 작업을 완료했습니다! 아래 "작업 백업하기" 버튼으로 저장하세요', 'info', 5000);
            
        } catch (error) {
            console.error('이미지 생성 실패:', error);
            btn.innerHTML = '❌ 이미지 생성 실패 - 다시 시도';
            btn.disabled = false;
            btn.className = 'bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg';
        }
    };
    
    // 안내/일정 PDF 다운로드 함수
    const downloadGuidePDF = async () => {
        const downloadBtn = document.getElementById('download-guide-btn');
        downloadBtn.innerHTML = '📄 PDF 생성 중...';
        downloadBtn.disabled = true;
        
        try {
            showLoading('안내/일정 PDF 생성 중...');
            
            // jsPDF 초기화
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF('p', 'mm', 'a4');
            
            // 가이드 콘텐츠 요소
            const guideContent = document.getElementById('guide-content');
            
            // 콘텐츠 전체 캡처 전 임시 컨테이너 생성 (학생 정보 제외)
            const tempContainer = document.createElement('div');
            tempContainer.style.backgroundColor = '#ffffff';
            tempContainer.style.color = '#000000';
            tempContainer.style.padding = '10px';
            
            // 제목 추가
            const titleElement = document.createElement('h1');
            titleElement.textContent = '✈️ 다다익선 제주 현장학습 안내';
            titleElement.style.fontSize = '24px';
            titleElement.style.fontWeight = 'bold';
            titleElement.style.textAlign = 'center';
            titleElement.style.marginBottom = '20px';
            titleElement.style.color = '#1e40af';
            tempContainer.appendChild(titleElement);
            
            // 일정, 안전수칙, 준비물 섹션 복제
            const sections = guideContent.querySelectorAll('.bg-slate-800:not(:first-child)');
            
            // 각 섹션 내용 복사
            sections.forEach(section => {
                const cloned = section.cloneNode(true);
                tempContainer.appendChild(cloned);
            });
            
            // 임시로 body에 추가
            document.body.appendChild(tempContainer);
            
            // HTML2Canvas 설정
            const canvas = await html2canvas(tempContainer, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                logging: false,
                onclone: (clonedDoc, clonedElement) => {
                    // 클론된 요소의 스타일 수정
                    clonedElement.querySelectorAll('*').forEach(el => {
                        if (el.style) {
                            if (el.tagName === 'H2' || el.tagName === 'H3') {
                                el.style.color = '#000066';
                            } else {
                                el.style.color = '#000000';
                            }
                            el.style.backgroundColor = 'transparent';
                        }
                    });
                    
                    // 배경색 변경
                    clonedElement.querySelectorAll('.bg-slate-800, .bg-slate-700, .bg-blue-900, .bg-red-900').forEach(el => {
                        el.style.backgroundColor = '#f8f9fa';
                        el.style.border = '1px solid #dee2e6';
                        el.style.borderRadius = '6px';
                    });
                    
                    // 테이블 스타일 변경
                    clonedElement.querySelectorAll('table').forEach(table => {
                        table.style.borderCollapse = 'collapse';
                        table.style.width = '100%';
                        table.querySelectorAll('th, td').forEach(cell => {
                            cell.style.border = '1px solid #dee2e6';
                            cell.style.padding = '8px';
                            cell.style.color = '#000000';
                        });
                        table.querySelectorAll('th').forEach(th => {
                            th.style.backgroundColor = '#e9ecef';
                            th.style.color = '#000000';
                            th.style.fontWeight = 'bold';
                        });
                        table.querySelectorAll('tr').forEach(tr => {
                            tr.style.backgroundColor = '#ffffff';
                        });
                    });
                }
            });
            
            // 임시 컨테이너 제거
            document.body.removeChild(tempContainer);
            
            // 캔버스 크기 계산
            const imgData = canvas.toDataURL('image/jpeg', 0.95);
            const imgWidth = 190; // A4 너비에서 여백 제외
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            // 여러 페이지로 나누기
            const pageHeight = 277; // A4 높이에서 여백 제외
            let heightLeft = imgHeight;
            let position = 0;
            let pageCount = 0;
            
            // 첫 페이지 추가
            doc.addImage(imgData, 'JPEG', 10, 10, imgWidth, imgHeight);
            heightLeft -= pageHeight;
            
            // 필요한 만큼 페이지 추가
            while (heightLeft > 0) {
                pageCount++;
                position = -pageHeight * pageCount;
                doc.addPage();
                doc.addImage(imgData, 'JPEG', 10, position + 10, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }
            
            // 파일명 설정 및 다운로드
            const fileName = `제주현장학습_안내_${new Date().toISOString().slice(0,10)}.pdf`;
            doc.save(fileName);
            
            hideLoading();
            downloadBtn.innerHTML = '📋 안내/일정 PDF로 다운로드하기';
            downloadBtn.disabled = false;
            
        } catch (error) {
            hideLoading();
            console.error('PDF 생성 오류:', error);
            alert('PDF 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
            downloadBtn.innerHTML = '📋 안내/일정 PDF로 다운로드하기';
            downloadBtn.disabled = false;
        }
    };

    // ======== 자동 저장 및 불러오기 기능 ========

    // 데이터 저장 함수
    const saveData = () => {
        const data = {};
        savableInputs.forEach(input => {
            if (input.type === 'checkbox') {
                data[input.id] = input.checked;
            } else if (input.type === 'radio') {
                if (input.checked) {
                    data[input.name] = input.value;
                }
            } else if (input.type === 'file') {
                // 파일은 직접 저장 못하므로, 미리보기 이미지의 데이터 URL을 저장
                const previewImg = document.getElementById(input.id.replace('photo_', 'preview_'));
                if (previewImg && previewImg.src.startsWith('data:image')) {
                    data[input.id] = previewImg.src;
                }
            } else {
                data[input.id] = input.value;
            }
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        
        // 자동 저장 표시
        showAutosaveIndicator();
    };

    // 데이터 불러오기 함수
    const loadData = () => {
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (!savedData) return;

        const data = JSON.parse(savedData);
        savableInputs.forEach(input => {
            if (data[input.id] !== undefined) {
                if (input.type === 'checkbox') {
                    input.checked = data[input.id];
                } else if (input.type === 'file') {
                    // 저장된 데이터 URL로 이미지 미리보기 복원
                    const previewImg = document.getElementById(input.id.replace('photo_', 'preview_'));
                    if (previewImg && data[input.id]) {
                        previewImg.src = data[input.id];
                        previewImg.parentElement.classList.remove('photo-placeholder');
                    }
                } else {
                    input.value = data[input.id];
                }
            } else if (input.type === 'radio' && data[input.name] !== undefined) {
                if (input.value === data[input.name]) {
                    input.checked = true;
                }
            }
        });
    };
    
    // ======== 백업 관련 기능 ========
    
    // 데이터 내보내기 함수
    const exportData = () => {
        // 현재 입력 데이터와 이미지를 포함한 객체 생성
        const exportObj = {
            formData: JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'),
            images: JSON.parse(localStorage.getItem(IMAGES_KEY) || '{}')
        };
        
        // 학생 이름과 학교 정보 가져오기
        const studentName = document.getElementById('student_name').value || '학생';
        const schoolName = document.getElementById('student_school').value || '';
        
        // JSON 파일로 변환하여 다운로드
        const dataStr = JSON.stringify(exportObj);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileName = `제주학습_${schoolName ? schoolName + '_' : ''}${studentName}_${new Date().toLocaleDateString('ko-KR').replace(/\./g, '').replace(/\s/g, '')}.jeju`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileName);
        linkElement.click();
        
        // 성공 메시지 표시
        showNotification('✅ 백업 완료! 파일이 저장되었습니다', 'success');
    };

    // 데이터 불러오기 함수
    const importData = (file) => {
        // 파일 확장자 확인 (.json 또는 .jeju)
        if (!file.name.endsWith('.json') && !file.name.endsWith('.jeju')) {
            showNotification('❌ 올바른 백업 파일이 아닙니다', 'error');
            return;
        }
        
        showNotification('⏳ 백업 파일 불러오는 중...', 'info');
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const importedData = JSON.parse(event.target.result);
                
                // 불러온 데이터 저장
                if (importedData.formData) {
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(importedData.formData));
                }
                
                if (importedData.images) {
                    localStorage.setItem(IMAGES_KEY, JSON.stringify(importedData.images));
                }
                
                // 성공 메시지와 함께 페이지 새로고침
                showNotification('✅ 백업을 성공적으로 불러왔습니다!', 'success');
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
                
            } catch (error) {
                showNotification('❌ 파일을 읽는 중 오류가 발생했습니다', 'error');
                console.error('Import error:', error);
            }
        };
        reader.readAsText(file);
    };
    
    // 알림 표시 함수
    const showNotification = (message, type = 'info', duration = 3000) => {
        // 이미 있는 알림 제거
        const existingNotification = document.getElementById('notification');
        if (existingNotification) {
            document.body.removeChild(existingNotification);
        }
        
        // 알림 타입에 따른 색상 설정
        let bgColor = 'bg-blue-600';
        if (type === 'success') bgColor = 'bg-green-600';
        if (type === 'error') bgColor = 'bg-red-600';
        
        // 알림 요소 생성
        const notification = document.createElement('div');
        notification.id = 'notification';
        notification.className = `fixed top-4 left-1/2 transform -translate-x-1/2 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 notification`;
        notification.innerHTML = message;
        
        // 알림 추가 및 자동 제거
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transition = 'opacity 0.5s';
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 500);
        }, duration);
    };
    
    // 자동 저장 표시기 함수
    const showAutosaveIndicator = () => {
        // 자동 저장 표시기 표시
        autosaveIndicator.style.opacity = '1';
        
        // 2초 후 자동 숨김
        setTimeout(() => {
            autosaveIndicator.style.opacity = '0';
        }, 2000);
    };

    // 각 입력 요소에 자동 저장 이벤트 리스너 추가
    savableInputs.forEach(input => {
        const eventType = (input.type === 'text' || input.tagName === 'TEXTAREA') ? 'input' : 'change';
        input.addEventListener(eventType, (e) => {
            if (e.target.type === 'file') {
                 // 파일 선택 시 FileReader로 Data URL을 만들어 저장 준비
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    const previewImg = document.getElementById(e.target.id.replace('photo_', 'preview_'));
                    reader.onload = (event) => {
                        previewImg.src = event.target.result;
                        previewImg.parentElement.classList.remove('photo-placeholder');
                        saveData(); // 이미지가 로드된 후 저장
                    };
                    reader.readAsDataURL(file);
                }
            } else {
                saveData();
            }
        });
    });
    
    // 주기적 자동 저장 (3분마다)
    setInterval(saveData, 180000);
    
    // 페이지를 떠날 때 저장
    window.addEventListener('beforeunload', saveData);
    
    // 페이지 로드 시 데이터 불러오기 실행
    loadData();
    loadSavedImages();
    
    // 백업 안내 표시 관리
    if (!localStorage.getItem(BACKUP_GUIDE_KEY)) {
        backupGuide.style.display = 'block';
    } else {
        backupGuide.style.display = 'none';
    }
    
    // 백업 안내 닫기 버튼
    document.getElementById('hide-guide-btn').addEventListener('click', () => {
        backupGuide.style.display = 'none';
        localStorage.setItem(BACKUP_GUIDE_KEY, 'true');
    });

    // ======== 일차별 완료 버튼 이벤트 ========
    document.getElementById('complete-day1-btn').addEventListener('click', () => generateDayImage('day1'));
    document.getElementById('complete-day2-btn').addEventListener('click', () => generateDayImage('day2'));
    document.getElementById('complete-day3-btn').addEventListener('click', () => generateDayImage('day3'));
    
    // 안내/일정 다운로드 버튼 이벤트
    document.getElementById('download-guide-btn').addEventListener('click', downloadGuidePDF);
    
    // 백업/복원 버튼 이벤트
    document.getElementById('export-btn').addEventListener('click', exportData);
    document.getElementById('import-file').addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            importData(e.target.files[0]);
        }
    });

    // ======== 개인/팀 모드 전환 기능 ========
    const modeRadios = form.querySelectorAll('input[name="mode"]');
    const teamInfoSection = document.getElementById('team_info_section');
    const nameLabelSuffix = document.getElementById('name_label_suffix');

    const toggleMode = () => {
        const isTeamMode = form.querySelector('input[name="mode"]:checked').value === 'team';
        if (isTeamMode) {
            teamInfoSection.classList.remove('hidden');
            nameLabelSuffix.textContent = '(내 이름)';
        } else {
            teamInfoSection.classList.add('hidden');
            nameLabelSuffix.textContent = '';
        }
    };

    modeRadios.forEach(radio => {
        radio.addEventListener('change', toggleMode);
    });

    // 초기 모드 설정
    toggleMode();

    // ======== 진행 표시기 관리 ========
    const updateProgressIndicator = (tabId) => {
        // 모든 진행 표시기 초기화
        for (let i = 1; i <= 3; i++) {
            const dot = document.getElementById(`progress-dot-${i}`);
            const text = document.getElementById(`progress-text-${i}`);
            
            // 완료된 일차는 녹색으로 유지
            if (dayImages[`day${i}`]) {
                dot.className = 'w-3 h-3 rounded-full progress-completed';
            } else {
                dot.className = 'w-3 h-3 rounded-full progress-inactive';
            }
            text.className = 'text-sm text-gray-400';
        }
        
        // 현재 선택된 탭에 해당하는 진행 표시기 활성화
        if (tabId === 'day1' || tabId === 'day2' || tabId === 'day3') {
            const dayNum = parseInt(tabId.replace('day', ''));
            const dot = document.getElementById(`progress-dot-${dayNum}`);
            const text = document.getElementById(`progress-text-${dayNum}`);
            
            // 완료된 일차는 녹색 유지, 그렇지 않으면 활성화 색상으로 변경
            if (!dayImages[tabId]) {
                dot.className = 'w-3 h-3 rounded-full progress-active';
            }
            text.className = 'text-sm text-blue-300 font-semibold';
            
            // 진행 표시기 사이 선 업데이트
            updateProgressLines(dayNum);
        } else {
            // 안내/일정 탭인 경우 모든 선 비활성화
            document.getElementById('progress-line-1-2').className = 'w-8 h-0.5 progress-line-inactive';
            document.getElementById('progress-line-2-3').className = 'w-8 h-0.5 progress-line-inactive';
        }
    };
    
    // 진행 표시기 선 업데이트
    const updateProgressLines = (dayNum) => {
        const line1to2 = document.getElementById('progress-line-1-2');
        const line2to3 = document.getElementById('progress-line-2-3');
        
        // 선 초기화
        line1to2.className = 'w-8 h-0.5 progress-line-inactive';
        line2to3.className = 'w-8 h-0.5 progress-line-inactive';
        
        // 완료된 일차에 따라 선 활성화
        if (dayImages.day1 && dayImages.day2) {
            line1to2.className = 'w-8 h-0.5 progress-line-active';
        }
        if (dayImages.day2 && dayImages.day3) {
            line2to3.className = 'w-8 h-0.5 progress-line-active';
        }
        
        // 현재 선택된 일차에 따른 선 업데이트
        if (dayNum === 2) {
            line1to2.className = 'w-8 h-0.5 progress-line-active';
        } else if (dayNum === 3) {
            line1to2.className = 'w-8 h-0.5 progress-line-active';
            line2to3.className = 'w-8 h-0.5 progress-line-active';
        }
    };

    // ======== 탭 기능 ========
    const tabButtons = document.getElementById('tab-buttons');
    const tabPanels = document.querySelectorAll('#tab-content .tab-panel');
    tabButtons.addEventListener('click', (e) => {
        const targetButton = e.target.closest('button');
        if (!targetButton) return;
        const tabId = targetButton.dataset.tab;
        
        // 탭 버튼 스타일 업데이트
        tabButtons.querySelectorAll('button').forEach(btn => {
            btn.classList.remove('tab-active', 'bg-blue-600');
            btn.classList.add('tab-inactive', 'bg-gray-700');
        });
        targetButton.classList.add('tab-active', 'bg-blue-600');
        targetButton.classList.remove('tab-inactive', 'bg-gray-700');
        
        // 탭 패널 표시/숨김
        tabPanels.forEach(panel => panel.classList.add('hidden'));
        document.getElementById(tabId).classList.remove('hidden');
        
        // 진행 표시기 업데이트
        updateProgressIndicator(tabId);
    });

    // ======== 결과 모달 및 인쇄 기능 ========
    const showResultBtn = document.getElementById('show-result-btn');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const resultModal = document.getElementById('result-modal');
    const resultContent = document.getElementById('result-content');
    const printBtn = document.getElementById('print-btn');

    const getTextValue = (id) => document.getElementById(id).value.trim() || '작성 안함';
    const getRadioValue = (name) => {
        const radio = form.querySelector(`input[name="${name}"]:checked`);
        return radio ? radio.parentElement.textContent.trim() : '선택 안함';
    };
    const getPhotoFileName = (id) => document.getElementById(id).files.length > 0 ? document.getElementById(id).files[0].name : '사진 없음';

    showResultBtn.addEventListener('click', async () => {
        const isTeamMode = form.querySelector('input[name="mode"]:checked').value === 'team';
        const getTextValue = (id) => document.getElementById(id).value.trim() || '작성 안함';
        
        const titleSuffix = isTeamMode && getTextValue('team_name') !== '작성 안함' 
            ? ` - ${getTextValue('team_name')}` 
            : '';

        // 모달 제목 업데이트
        const modalTitle = document.querySelector('#result-modal-header h2');
        modalTitle.textContent = `🏆 제주 현장학습 완전정복${titleSuffix}`;

        // 저장된 이미지들로 통합 보고서 생성
        let finalContent = `
            <div class="text-center mb-6">
                <h3 class="text-2xl font-bold text-blue-300 mb-2">✈️ 2박 3일 제주 현장학습 완전정복</h3>
                <p class="text-gray-400">${getTextValue('student_school')} ${getTextValue('student_grade')} ${getTextValue('student_name')}</p>
                ${isTeamMode && getTextValue('team_name') !== '작성 안함' ? `<p class="text-blue-300 font-semibold">🏆 ${getTextValue('team_name')}</p>` : ''}
                <div class="mt-4 text-sm text-gray-500">
                    생성일: ${new Date().toLocaleDateString('ko-KR')}
                </div>
            </div>
        `;

        // 각 일차별 이미지 포함
        ['day1', 'day2', 'day3'].forEach((day, index) => {
            const dayNum = index + 1;
            const dayTitle = ['건축과 자연의 만남', '바다와 전통, 디지털 문화', '예술과 추억 완성'][index];
            
            finalContent += `
                <div class="mb-8 p-4 bg-slate-700 rounded-lg">
                    <h4 class="text-lg font-bold text-blue-300 mb-3">📅 ${dayNum}일차: ${dayTitle}</h4>
            `;
            
            if (dayImages[day]) {
                finalContent += `
                    <div class="text-center">
                        <img src="${dayImages[day]}" alt="${dayNum}일차 학습 결과" class="w-full rounded-lg border-2 border-slate-600" />
                        <p class="text-xs text-green-400 mt-2">✅ 학습 완료 및 저장됨</p>
                    </div>
                `;
            } else {
                finalContent += `
                    <div class="text-center p-8 border-2 border-dashed border-gray-600 rounded-lg">
                        <p class="text-gray-400">📋 ${dayNum}일차 학습이 아직 완료되지 않았습니다</p>
                        <p class="text-sm text-gray-500 mt-2">"${dayNum}일차 완료하고 이미지 저장하기" 버튼을 눌러주세요</p>
                    </div>
                `;
            }
            
            finalContent += '</div>';
        });

        // 진행률 요약
        const completedDays = Object.values(dayImages).filter(img => img !== null).length;
        finalContent += `
            <div class="mt-6 p-4 bg-slate-600 rounded-lg text-center">
                <h4 class="font-bold text-blue-300 mb-2">📊 학습 진행률</h4>
                <div class="text-2xl font-bold text-green-400">${completedDays}/3일 완료</div>
                <div class="w-full bg-gray-700 rounded-full h-3 mt-2">
                    <div class="bg-green-500 h-3 rounded-full transition-all duration-500" style="width: ${(completedDays/3)*100}%"></div>
                </div>
                ${completedDays === 3 ? 
                    '<p class="text-green-300 mt-2 font-semibold">🎉 모든 학습이 완료되었습니다!</p>' : 
                    '<p class="text-yellow-300 mt-2">⏳ 학습을 계속 진행해주세요</p>'
                }
            </div>
        `;

        resultContent.innerHTML = finalContent;
        resultModal.classList.remove('hidden');
    });
    
    closeModalBtn.addEventListener('click', () => resultModal.classList.add('hidden'));
    
    // PDF 생성 시작 시 로딩 오버레이 표시
    function showLoading(message) {
        const overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        overlay.innerHTML = `
            <div class="loading-spinner"></div>
            <div>${message}</div>
        `;
        overlay.id = 'pdf-loading-overlay';
        document.body.appendChild(overlay);
    }

    // PDF 생성 완료 시 로딩 오버레이 제거
    function hideLoading() {
        const overlay = document.getElementById('pdf-loading-overlay');
        if (overlay) {
            document.body.removeChild(overlay);
        }
    }
    
    // 인쇄 버튼 이벤트 핸들러 교체
    printBtn.addEventListener('click', async function() {
        try {
            showLoading('PDF 생성 중... 잠시만 기다려주세요');
            this.innerHTML = '📄 PDF 생성 중...';
            this.disabled = true;
            
            // jsPDF 초기화
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF('p', 'mm', 'a4');
            
            // 결과 콘텐츠 요소
            const resultContent = document.getElementById('result-content');
            
            // 콘텐츠 전체 캡처 전 배경색 임시 변경
            const originalBgColor = resultContent.style.backgroundColor;
            resultContent.style.backgroundColor = '#ffffff';
            
            // 콘텐츠를 섹션별로 분리
            const sections = [
                document.querySelector('#result-modal-header').parentElement, // 제목 섹션
                ...resultContent.querySelectorAll('.mb-8') // 일차별 섹션들
            ];
            
            // 각 섹션을 개별 페이지로 변환
            for (let i = 0; i < sections.length; i++) {
                const section = sections[i];
                
                // 첫 페이지가 아니면 새 페이지 추가
                if (i > 0) {
                    doc.addPage();
                }
                
                // 이미지 로딩 대기
                const images = section.querySelectorAll('img');
                await Promise.all([...images].map(img => {
                    if (!img.src || img.complete) return Promise.resolve();
                    return new Promise(resolve => {
                        img.onload = resolve;
                        img.onerror = resolve;
                    });
                }));
                
                // 섹션을 캔버스로 변환
                const canvas = await html2canvas(section, {
                    scale: 2, // 고품질
                    useCORS: true,
                    allowTaint: true,
                    backgroundColor: '#ffffff',
                    logging: false,
                    onclone: (clonedDoc, clonedElement) => {
                        // 클론된 요소의 스타일 수정
                        clonedElement.style.color = '#000000';
                        clonedElement.querySelectorAll('*').forEach(el => {
                            if (el.style) {
                                el.style.color = el.tagName === 'H2' || el.tagName === 'H3' || 
                                                el.tagName === 'H4' ? '#000066' : '#000000';
                                el.style.backgroundColor = 'transparent';
                            }
                        });
                    }
                });
                
                // 캔버스를 PDF에 추가
                const imgData = canvas.toDataURL('image/jpeg', 1.0);
                const imgWidth = 190; // A4 너비에서 여백 제외
                const pageHeight = 277; // A4 높이에서 여백 제외
                
                // 이미지 높이 계산
                const imgHeight = (canvas.height * imgWidth) / canvas.width;
                
                // 높이가 페이지를 초과하면 여러 페이지로 분할
                if (imgHeight <= pageHeight) {
                    // 한 페이지에 들어가는 경우
                    doc.addImage(imgData, 'JPEG', 10, 10, imgWidth, imgHeight);
                } else {
                    // 여러 페이지에 걸치는 경우
                    let heightLeft = imgHeight;
                    let position = 0;
                    let page = 0;
                    
                    while (heightLeft > 0) {
                        doc.addImage(imgData, 'JPEG', 10, 10 - position, imgWidth, imgHeight);
                        heightLeft -= pageHeight;
                        position += pageHeight;
                        
                        if (heightLeft > 0) {
                            doc.addPage();
                            page++;
                        }
                    }
                }
            }
            
            // 배경색 복원
            resultContent.style.backgroundColor = originalBgColor;
            
            // 파일명 설정
            const studentName = document.getElementById('student_name').value.trim() || '학생';
            const fileName = `제주학습_보고서_${studentName}_${new Date().toISOString().slice(0,10)}.pdf`;
            
            // PDF 다운로드
            doc.save(fileName);
            
            hideLoading();
            this.innerHTML = '🖨️ 인쇄하기';
            this.disabled = false;
            
        } catch (error) {
            hideLoading();
            console.error('PDF 생성 오류:', error);
            alert('PDF 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
            this.innerHTML = '🖨️ 인쇄하기';
            this.disabled = false;
        }
    });

    // ======== 초기화 기능 ========
    document.getElementById('reset-btn').addEventListener('click', () => {
        if(confirm('정말로 모든 작성 내용과 저장된 이미지를 영구적으로 삭제하시겠습니까?')) {
            form.reset();
            localStorage.removeItem(STORAGE_KEY);
            localStorage.removeItem(IMAGES_KEY);
            
            // 이미지 데이터 초기화
            Object.keys(dayImages).forEach(day => {
                dayImages[day] = null;
            });
            
            // 미리보기 이미지 초기화
            document.querySelectorAll('img[id^="preview_"]').forEach(img => {
                img.src = '';
                if(!img.parentElement.classList.contains('photo-placeholder')) {
                    img.parentElement.classList.add('photo-placeholder');
                }
            });
            
            // 완료 버튼들 초기화
            ['day1', 'day2', 'day3'].forEach(day => {
                const btn = document.getElementById(`complete-${day}-btn`);
                btn.innerHTML = `🎯 ${day.replace('day', '')}일차 완료하고 이미지 저장하기`;
                btn.className = 'bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg';
                btn.disabled = false;
            });
            
            updateProgress();
            
            // 안내/일정 탭으로 초기화하고 진행 표시기 업데이트
            tabButtons.querySelector('button[data-tab="guide"]').click();
            updateProgressIndicator('guide');
            
            showNotification('✅ 모든 내용과 저장된 이미지가 삭제되었습니다.', 'success');
        }
    });
    
    // 페이지 로드 시 초기 진행 표시기 설정
    // 기본적으로 안내/일정 탭이 선택된 상태
    updateProgressIndicator('guide');
    
    // 첫 방문 시 백업 기능에 대한 안내 알림
    if (localStorage.getItem(STORAGE_KEY) && !localStorage.getItem(BACKUP_GUIDE_KEY)) {
        setTimeout(() => {
            showNotification('🔔 다른 기기나 브라우저에서 작업하려면 "작업 백업하기" 버튼을 사용하세요', 'info', 6000);
        }, 3000);
    }
});