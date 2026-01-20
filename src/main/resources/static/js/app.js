// estellExam System Logic
let currentUser = null;
let currentExam = null;
let currentRound = null;
let currentQuestions = [];
let currentQuestionIndex = 0;
let userAnswers = {};
let examMode = 'ONLINE';
let timerInterval = null;

// API Helper
async function api(url, options = {}) {
    const defaultOptions = { headers: { 'Content-Type': 'application/json' } };
    const response = await fetch(url, { ...defaultOptions, ...options });
    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown Error' }));
        throw new Error(error.error || 'Request Failed');
    }
    return response.json();
}


function showLoading() { document.getElementById('loading').classList.remove('hidden'); }
function hideLoading() { document.getElementById('loading').classList.add('hidden'); }

// --- CUSTOM UI HELPERS ---
function showAlert(msg, title = 'Notice') {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalMessage').textContent = msg;
    document.getElementById('clayModal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('clayModal').classList.add('hidden');
}

// Custom Confirm Modal
let confirmCallback = null;

function showConfirm(msg, callback) {
    document.getElementById('confirmMessage').textContent = msg;
    confirmCallback = callback;
    document.getElementById('confirmModal').classList.remove('hidden');
}

function handleConfirm(result) {
    document.getElementById('confirmModal').classList.add('hidden');
    if (confirmCallback) {
        confirmCallback(result);
        confirmCallback = null;
    }
}

function backToDashboard() {
    if (currentUser) {
        showSection('menuSection');
    } else {
        showSection('loginSection');
    }
}

// Profile Dropdown
function toggleProfileMenu(e) {
    if (e) e.stopPropagation();
    const dropdown = document.getElementById('profileDropdown');
    if (dropdown) dropdown.classList.toggle('hidden');
}

function toggleSidebar() {
    const sidebar = document.getElementById('mainSidebar');
    const overlay = document.getElementById('sidebarOverlay');
    sidebar.classList.toggle('active');
    overlay.classList.toggle('hidden');
}

function toggleUserDropdown() {
    const options = document.getElementById('customOptions');
    options.classList.toggle('hidden');
}

function selectUser(id, name) {
    document.getElementById('userSelectValue').value = id;
    document.getElementById('selectedUserText').textContent = name;
    document.getElementById('customOptions').classList.add('hidden');

    // Visual selection state
    document.querySelectorAll('.custom-option').forEach(opt => {
        if (opt.dataset.value == id) opt.classList.add('selected');
        else opt.classList.remove('selected');
    });
}

// Close Dropdown if clicked outside
// Close Dropdown if clicked outside
window.addEventListener('click', (e) => {
    // 1. User Select
    const wrapper = document.getElementById('userSelectWrapper');
    if (wrapper && !wrapper.contains(e.target)) {
        const options = document.getElementById('customOptions');
        if (options) options.classList.add('hidden');
    }

    // 2. Profile Dropdown
    const profileDropdown = document.getElementById('profileDropdown');
    const profileArea = document.getElementById('userProfileArea');
    if (profileDropdown && !profileDropdown.classList.contains('hidden')) {
        if (profileArea && !profileArea.contains(e.target)) {
            profileDropdown.classList.add('hidden');
        }
    }

    // 3. Study Round Select
    const studyWrapper = document.getElementById('studyRoundSelectWrapper');
    if (studyWrapper && !studyWrapper.contains(e.target)) {
        const studyOptions = document.getElementById('studyRoundOptions');
        if (studyOptions) studyOptions.classList.add('hidden');
    }
});

function updateFileName(input, displayId) {
    const display = document.getElementById(displayId || 'fileNameDisplay');
    if (input.files && input.files.length > 0) {
        if (input.files.length === 1) {
            display.textContent = input.files[0].name;
        } else {
            display.textContent = `${input.files.length} files selected`;
        }
    } else {
        display.textContent = 'Choose File...';
    }
}


// Section Navigation
function showSection(sectionId) {
    document.querySelectorAll('section').forEach(s => {
        s.classList.remove('active-section');
        s.classList.add('hidden-section');
    });
    const target = document.getElementById(sectionId);
    if (target) {
        target.classList.remove('hidden-section');
        target.classList.add('active-section');
    }

    // 헤더 상태 관리: Close 버튼
    const closeBtn = document.getElementById('headerCloseBtn');
    const sectionsWithCloseBtn = ['statsSection', 'historySection', 'examListSection', 'studySection'];

    if (sectionsWithCloseBtn.includes(sectionId)) {
        closeBtn.classList.remove('hidden');
    } else {
        closeBtn.classList.add('hidden');
    }
}

// Theme Management
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateThemeIcon();
}

function updateThemeIcon() {
    const icon = document.getElementById('themeIcon');
    if (document.body.classList.contains('dark-mode')) {
        icon.className = 'fa-solid fa-sun';
        icon.style.color = '#fbbf24'; // Sun Yellow
    } else {
        icon.className = 'fa-solid fa-moon';
        icon.style.color = ''; // Reset
    }
}

// Initialization
document.addEventListener('DOMContentLoaded', async () => {
    // Check saved theme
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
        updateThemeIcon();
    }
    await loadUsers();
    await checkSession();
});

// Check existing session (auto-login)
async function checkSession() {
    try {
        const response = await fetch('/api/users/me');
        if (response.ok) {
            currentUser = await response.json();
            document.getElementById('headerUserName').textContent = currentUser.name;
            document.getElementById('userProfileArea').classList.remove('hidden');
            document.getElementById('mainSidebar').classList.remove('hidden');
            showSection('menuSection');
        }
    } catch (e) {
        // No session, stay on login page
    }
}

async function loadUsers() {
    let users = [];
    try {
        users = await api('/api/users');
    } catch (e) {
        console.warn('API Failed, using mock data');
        users = [
            { id: 1, name: 'User 1' },
            { id: 2, name: 'User 2' },
            { id: 3, name: 'User 3' },
            { id: 4, name: 'User 4' },
            { id: 99, name: 'Lee Sunghyun' }
        ];
    }

    const optionsContainer = document.getElementById('customOptions');
    optionsContainer.innerHTML = users.map(u => `
        <div class="custom-option" data-value="${u.id}" onclick="selectUser(${u.id}, '${u.name}')">
            ${u.name}
        </div>
    `).join('');
}

// Login/Logout
async function login() {
    const userName = document.getElementById('selectedUserText').textContent;
    if (!userName || userName === 'Select Profile') { showAlert('Please select a user'); return; }

    try {
        showLoading();
        currentUser = await api('/api/users/login', {
            method: 'POST',
            body: JSON.stringify({ name: userName })
        });
        document.getElementById('headerUserName').textContent = currentUser.name;
        document.getElementById('userProfileArea').classList.remove('hidden');
        document.getElementById('mainSidebar').classList.remove('hidden'); // Show Sidebar
        showSection('menuSection');
    } catch (e) {
        showAlert('Login failed: ' + e.message);
    } finally {
        hideLoading();
    }
}

async function logout() {
    try {
        await api('/api/users/logout', { method: 'POST' });
    } catch (e) {
        console.error('Logout error:', e);
    }
    currentUser = null;
    document.getElementById('userProfileArea').classList.add('hidden');
    document.getElementById('mainSidebar').classList.add('hidden'); // Hide Sidebar
    document.getElementById('userSelectValue').value = '';
    document.getElementById('selectedUserText').textContent = 'Select Profile';
    showSection('loginSection');
}

// Stats
async function showStats() {
    showSection('statsSection');
    try {
        showLoading();
        const data = await api('/api/stats');

        // Update overview stats
        document.getElementById('statTotalUsers').textContent = data.totalUsers || 0;
        document.getElementById('statTotalRounds').textContent = data.totalRounds || 0;
        document.getElementById('statAvgScore').textContent = data.overallAvgScore?.toFixed(1) || '0';

        // Render user ranking
        const rankingList = document.getElementById('userRankingList');
        if (data.userStats && data.userStats.length > 0) {
            rankingList.innerHTML = data.userStats.map((user, i) => {
                const posClass = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';
                return `
                    <div class="ranking-item">
                        <div class="ranking-position ${posClass}">${i + 1}</div>
                        <div class="ranking-info">
                            <div class="ranking-name">${user.userName || 'User #' + user.userId}</div>
                            <div class="ranking-detail">${user.totalExams || 0} exams taken</div>
                        </div>
                        <div class="ranking-score">${user.avgScore?.toFixed(1) || '0'}</div>
                    </div>
                `;
            }).join('');
        } else {
            rankingList.innerHTML = '<div class="empty-state"><i class="fa-solid fa-trophy"></i><p>No ranking data yet</p></div>';
        }

        // Render round stats
        const roundStatsList = document.getElementById('roundStatsList');
        if (data.roundStats && data.roundStats.length > 0) {
            roundStatsList.innerHTML = data.roundStats.map(round => `
                <div class="round-stat-card">
                    <h4>${round.title || 'Exam #' + round.roundId}</h4>
                    <div class="round-stat-row">
                        <span class="round-stat-label">Participants</span>
                        <span class="round-stat-value">${round.examCount || 0}</span>
                    </div>
                    <div class="round-stat-row">
                        <span class="round-stat-label">Average</span>
                        <span class="round-stat-value">${round.avgScore?.toFixed(1) || '0'}</span>
                    </div>
                    <div class="round-stat-row">
                        <span class="round-stat-label">Highest</span>
                        <span class="round-stat-value">${round.maxScore?.toFixed(1) || '0'}</span>
                    </div>
                    <div class="round-stat-row">
                        <span class="round-stat-label">Lowest</span>
                        <span class="round-stat-value">${round.minScore?.toFixed(1) || '0'}</span>
                    </div>
                </div>
            `).join('');
        } else {
            roundStatsList.innerHTML = '<div class="empty-state"><i class="fa-solid fa-chart-bar"></i><p>No exam data yet</p></div>';
        }
    } catch (e) {
        showAlert('Failed to load stats: ' + e.message);
    } finally {
        hideLoading();
    }
}

// History
async function showHistory() {
    showSection('historySection');
    if (!currentUser) {
        showAlert('Please login first');
        showSection('loginSection');
        return;
    }

    try {
        showLoading();
        const exams = await api(`/api/exams/user/${currentUser.id}`);
        const historyList = document.getElementById('historyList');

        if (exams.length === 0) {
            historyList.innerHTML = '<div class="empty-state"><i class="fa-solid fa-clock-rotate-left"></i><p>No exam history yet</p></div>';
        } else {
            historyList.innerHTML = exams.map(exam => {
                const date = exam.submittedAt ? new Date(exam.submittedAt).toLocaleDateString() : 'In Progress';
                const statusClass = exam.status === 'COMPLETED' ? 'completed' : 'in-progress';
                return `
                    <div class="history-item" onclick="viewExamResult(${exam.id})">
                        <div class="history-info">
                            <div class="history-title">${exam.roundTitle || 'Exam #' + exam.roundId}</div>
                            <div class="history-date">${date}</div>
                        </div>
                        <div class="history-score">
                            <span class="history-score-value">${exam.score || 0}</span>
                            <span class="history-score-detail">${exam.correctCount || 0} / ${exam.totalCount || 0}</span>
                        </div>
                        <span class="history-status ${statusClass}">${exam.status}</span>
                    </div>
                `;
            }).join('');
        }
    } catch (e) {
        showAlert('Failed to load history: ' + e.message);
    } finally {
        hideLoading();
    }
}

async function viewExamResult(examId) {
    try {
        showLoading();
        currentExam = await api(`/api/exams/${examId}`);
        showResult();
    } catch (e) {
        showAlert('Failed to load exam: ' + e.message);
    } finally {
        hideLoading();
    }
}

// Dashboard: Load Rounds (이제 별도 섹션으로 전환)
async function loadRounds() {
    showSection('examListSection');
    const list = document.getElementById('roundList');

    try {
        showLoading();
        const rounds = await api('/api/rounds/active');
        document.getElementById('examCount').textContent = rounds.length;

        if (rounds.length === 0) {
            list.innerHTML = '<p class="text-muted" style="text-align:center; padding:40px;">No active exams found.</p>';
        } else {
            list.innerHTML = rounds.map(r => `
                <div class="clay-card round-item-card" onclick="selectRound(${r.id}, '${r.title.replace(/'/g, "\\'")}', ${r.questionCount})">
                    <h3 style="color:var(--primary)">${r.title}</h3>
                    <p style="color:var(--text-muted); font-size:0.9rem;">${r.description || 'No description'}</p>
                    <div style="margin-top:15px; font-weight:700;">
                        <span class="q-badge" style="font-size:0.8rem;">
                            ${r.questionCount} Questions
                        </span>
                    </div>
                </div>
            `).join('');
        }
    } catch (e) {
        showAlert('Failed to load rounds: ' + e.message);
    } finally {
        hideLoading();
    }
}

function selectRound(id, title, count) {
    currentRound = { id, title, questionCount: count };
    showSection('modeSection');
}

function selectMode(mode) {
    startExam(mode);
}

// Start Exam
async function startExam(mode) {
    examMode = mode;
    try {
        showLoading();
        currentExam = await api('/api/exams/start', {
            method: 'POST',
            body: JSON.stringify({
                userId: currentUser.id,
                roundId: currentRound.id,
                mode: mode
            })
        });

        currentQuestions = await api(`/api/rounds/${currentRound.id}/questions`);
        currentQuestionIndex = 0;
        userAnswers = {};

        // [Resume] Restore existing answers if any
        try {
            const savedAnswers = await api(`/api/exams/${currentExam.id}/answers`);
            if (savedAnswers && savedAnswers.length > 0) {
                savedAnswers.forEach(a => {
                    // Only restore text answers (assuming online text exam for now)
                    if (a.userAnswer) {
                        userAnswers[a.questionId] = a.userAnswer;
                    }
                });
                console.log('Resumed exam with answers:', userAnswers);
            }
        } catch (e) {
            console.warn('Failed to restore answers:', e);
        }

        if (mode === 'ONLINE') {
            showSection('examSection');
            renderQuestion();
            // Simple Timer Simulation
            clearInterval(timerInterval);
            let seconds = 0;
            timerInterval = setInterval(() => {
                seconds++;
                const min = Math.floor(seconds / 60).toString().padStart(2, '0');
                const sec = (seconds % 60).toString().padStart(2, '0');
                document.getElementById('examTimer').textContent = `${min}:${sec}`;
            }, 1000);
        } else {
            renderOfflineQuestions();
            showSection('offlineExamSection');
        }
    } catch (e) {
        showAlert('Error starting exam: ' + e.message);
    } finally {
        hideLoading();
    }
}

// Online Exam Rendering
function renderQuestion() {
    const q = currentQuestions[currentQuestionIndex];
    const total = currentQuestions.length;

    // Progress
    document.getElementById('examProgress').textContent = `${currentQuestionIndex + 1} / ${total}`;
    const pct = ((currentQuestionIndex + 1) / total) * 100;
    document.getElementById('progressBarFill').style.width = `${pct}%`;

    // Buttons
    document.getElementById('prevBtn').disabled = currentQuestionIndex === 0;
    // Show Next for all except last, Show Submit for last
    const isLast = currentQuestionIndex === total - 1;
    document.getElementById('nextBtn').classList.toggle('hidden', isLast);
    document.getElementById('submitBtn').classList.toggle('hidden', !isLast);

    // Question Content
    let html = `<div class="question-text">${currentQuestionIndex + 1}. ${q.questionText}</div>`;

    if (q.answerType === 'CHOICE' && q.option1) {
        const options = [q.option1, q.option2, q.option3, q.option4].filter(Boolean);
        html += '<div class="options-grid">';
        options.forEach((opt, i) => {
            const selected = userAnswers[q.id] === opt ? 'selected' : '';
            html += `<button class="option-btn ${selected}" onclick="selectOption(${q.id}, '${opt.replace(/'/g, "\\'")}')">
                ${i + 1}. ${opt}
            </button>`;
        });
        html += '</div>';
    } else {
        const val = userAnswers[q.id] || '';
        html += `<input type="text" class="clay-input text-input" placeholder="Enter your answer" value="${val}" onchange="saveTextAnswer(${q.id}, this.value)">`;
    }

    document.getElementById('questionArea').innerHTML = html;
}

function selectOption(qid, answer) {
    userAnswers[qid] = answer;
    renderQuestion();
    submitAnswerToServer(qid, answer);
}

function saveTextAnswer(qid, answer) {
    userAnswers[qid] = answer;
    submitAnswerToServer(qid, answer);
}

async function submitAnswerToServer(qid, answer) {
    try {
        await api(`/api/exams/${currentExam.id}/answer/${qid}/text`, {
            method: 'POST', body: JSON.stringify({ answer })
        });
    } catch (e) { console.error(e); }
}

function prevQuestion() {
    if (currentQuestionIndex > 0) { currentQuestionIndex--; renderQuestion(); }
}
function nextQuestion() {
    if (currentQuestionIndex < currentQuestions.length - 1) { currentQuestionIndex++; renderQuestion(); }
}

async function submitExam() {
    showConfirm('정말 시험을 제출하시겠습니까?', async (confirmed) => {
        if (!confirmed) return;

        clearInterval(timerInterval);

        const btn = document.getElementById('submitBtn');
        btn.disabled = true;
        btn.textContent = 'Submitting...';

        try {
            showLoading();
            // Race condition fix: wait and blur
            if (document.activeElement?.tagName === 'INPUT') document.activeElement.blur();
            await new Promise(r => setTimeout(r, 500));

            const result = await api(`/api/exams/${currentExam.id}/submit`, { method: 'POST' });
            currentExam = result;
            showResult();
        } catch (e) {
            showAlert('Submission failed: ' + e.message);
            btn.disabled = false;
            btn.textContent = 'Finish Exam';
        } finally {
            hideLoading();
        }
    });
}

// Offline Rendering
function renderOfflineQuestions() {
    const list = document.getElementById('allQuestionsArea');
    list.innerHTML = currentQuestions.map((q, i) => `
        <div class="clay-card round-item-card mb-medium">
            <h4 style="margin-bottom:10px; color:var(--primary)">Q${i + 1}. ${q.questionText}</h4>
            ${q.answerType === 'CHOICE' ? `
                <div style="display:flex; gap:15px; flex-wrap:wrap; color:var(--text-muted);">
                    <span>1. ${q.option1}</span>
                    <span>2. ${q.option2}</span>
                    <span>3. ${q.option3}</span>
                    <span>4. ${q.option4}</span>
                </div>
            ` : '<p class="badge">Short Answer</p>'}
        </div>
    `).join('');
}

function previewAnswerSheet(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = document.getElementById('answerSheetPreview');
            img.src = e.target.result;
            img.classList.remove('hidden');
        };
        reader.readAsDataURL(input.files[0]);
    }
}

async function submitOfflineExam() {
    const input = document.getElementById('answerSheetInput');
    if (!input.files || input.files.length === 0) { showAlert('Upload at least one image.'); return; }

    try {
        showLoading();
        const formData = new FormData();
        formData.append('answerSheet', input.files[0]);

        // 오프라인 채점 프롬프트 템플릿 (%s는 백엔드에서 문제 정보로 치환됨)
        const offlinePrompt = `이 답안지 이미지를 분석해주세요.

문제 정보:용자가 작성한 답",
    "isCorrect": tru
%s

규칙:
1. 답안지에서 각 문제 번호에 해당하는 사용자의 답을 읽어주세요.
2. 객관식은 번호(1,2,3,4)로 표기되어 있습니다.
3. 주관식은 영어 텍스트로 작성되어 있습니다.
4. 각 문제의 정답 여부를 판단해주세요.

응답 형식 (JSON 배열):
[
  {
    "questionNumber": 1,
    "userAnswer": "사e 또는 false,
    "feedback": "피드백 메시지"
  }
]

JSON만 응답하세요. 다른 설명은 하지 마세요.`;

        formData.append('prompt', offlinePrompt);

        const response = await fetch(`/api/exams/${currentExam.id}/submit-offline`, {
            method: 'POST', body: formData
        });

        if (!response.ok) throw new Error('Offline submission failed');
        const data = await response.json();

        // Show result manually
        currentExam = data.exam;
        document.getElementById('scoreDisplay').textContent = currentExam.score;
        document.getElementById('scoreDetail').textContent = `${data.correctCount || 0} / ${currentExam.totalCount} Correct`;
        showSection('resultSection');
    } catch (e) {
        showAlert(e.message);
    } finally {
        hideLoading();
    }
}

// Result
async function showResult() {
    document.getElementById('scoreDisplay').textContent = currentExam.score;
    document.getElementById('scoreDetail').textContent = `${currentExam.correctCount} / ${currentExam.totalCount} Correct`;

    // Reset ranking display
    document.getElementById('myRankingBox').classList.add('hidden');
    document.getElementById('roundRankingList').classList.add('hidden');

    // Load ranking info
    try {
        const ranking = await api(`/api/exams/ranking/${currentExam.roundId}`);
        if (ranking && ranking.length > 0) {
            const myRank = ranking.findIndex(e => e.id === currentExam.id) + 1;
            if (myRank > 0) {
                document.getElementById('myRankingValue').textContent = `#${myRank}`;
                document.getElementById('myRankingTotal').textContent = `of ${ranking.length}`;
                document.getElementById('myRankingBox').classList.remove('hidden');
            }
        }
    } catch (e) {
        console.log('Could not load ranking:', e);
    }

    showSection('resultSection');
}

async function toggleRanking() {
    const box = document.getElementById('roundRankingList');
    if (!box.classList.contains('hidden')) {
        box.classList.add('hidden');
        return;
    }

    try {
        showLoading();
        const ranking = await api(`/api/exams/ranking/${currentExam.roundId}`);

        if (ranking.length === 0) {
            box.innerHTML = '<p style="text-align:center; color:var(--text-muted)">No ranking data yet</p>';
        } else {
            box.innerHTML = ranking.map((exam, i) => {
                const isMe = exam.id === currentExam.id;
                const posClass = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';
                return `
                    <div class="ranking-item ${isMe ? 'my-rank' : ''}">
                        <div class="ranking-position ${posClass}">${i + 1}</div>
                        <div class="ranking-info">
                            <div class="ranking-name">${exam.userName || 'User #' + exam.userId}</div>
                        </div>
                        <div class="ranking-score">${exam.score?.toFixed(1) || '0'}</div>
                    </div>
                `;
            }).join('');
        }

        box.classList.remove('hidden');
    } catch (e) {
        showAlert('Failed to load ranking: ' + e.message);
    } finally {
        hideLoading();
    }
}

// --- REVIEW & FILTER LOGIC ---
let currentExamAnswers = [];

async function toggleReviewAnswers() {
    const section = document.getElementById('reviewSection');
    const isHidden = section.classList.contains('hidden');

    if (isHidden) {
        // Show
        section.classList.remove('hidden');
        document.getElementById('roundRankingList')?.classList.add('hidden'); // Hide ranking if open

        try {
            showLoading();
            // Fetch ALL answers now
            const answers = await api(`/api/exams/${currentExam.id}/answers`);
            // Assign question numbers (1-based index)
            currentExamAnswers = answers.map((a, i) => ({ ...a, number: i + 1 }));

            // Set default filter to ALL
            filterAnswers('ALL');

            // Scroll to review section if needed
            section.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } catch (e) {
            console.error(e);
            showAlert('답안 목록을 불러오지 못했습니다: ' + e.message);
        } finally {
            hideLoading();
        }
    } else {
        // Hide
        section.classList.add('hidden');
    }
}

function filterAnswers(type) {
    // Update button states
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    if (type === 'ALL') document.getElementById('btnFilterAll').classList.add('active');
    else if (type === 'CORRECT') document.getElementById('btnFilterCorrect').classList.add('active');
    else if (type === 'WRONG') document.getElementById('btnFilterWrong').classList.add('active');

    // Filter logic
    let filtered = [];
    if (type === 'ALL') {
        filtered = currentExamAnswers;
    } else if (type === 'CORRECT') {
        filtered = currentExamAnswers.filter(a => a.isCorrect);
    } else if (type === 'WRONG') {
        filtered = currentExamAnswers.filter(a => !a.isCorrect);
    }

    renderReviewAnswers(filtered);
}

function renderReviewAnswers(answers) {
    const list = document.getElementById('reviewAnswersList');
    list.innerHTML = '';

    if (!answers || answers.length === 0) {
        list.innerHTML = '<div class="empty-state"><p>해당하는 항목이 없습니다.</p></div>';
        return;
    }

    answers.forEach(item => {
        const isCorrect = item.isCorrect;
        // Styles: Green for correct, Red for wrong
        const bgStyle = isCorrect ? 'background: #f0fdf4; border-color: #bbf7d0;' : 'background: #fff0f0; border-color: #ffcccc;';
        const answerColor = isCorrect ? 'color: #16a34a;' : 'color: #dc2626;';
        const icon = isCorrect ? '<i class="fa-solid fa-check text-success"></i>' : '<i class="fa-solid fa-xmark text-danger"></i>';

        const card = document.createElement('div');
        card.className = 'clay-card round-item-card mb-medium';
        card.style.cssText = `margin-bottom: 15px; padding: 15px; border: 1px solid; ${bgStyle}`;

        // Construct feedback if available
        let feedbackHtml = '';
        if (item.feedback) {
            feedbackHtml = `<div style="font-size:0.85rem; color:#6b7280; margin-top:5px;"><i class="fa-solid fa-comment-dots"></i> ${item.feedback}</div>`;
        }

        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:5px;">
                <h4 style="margin:0; font-size:1rem; color:#374151;">Q${item.number}. ${item.questionText}</h4>
                <span>${icon}</span>
            </div>
            <div style="font-size:0.95rem;">
                <p style="margin: 5px 0;">
                    <span style="color:#6b7280; font-weight:600;">Your Answer:</span> 
                    <span style="${answerColor} font-weight:700;">${item.userAnswer || '(Empty)'}</span>
                </p>
                <p style="margin: 5px 0;">
                    <span style="color:#6b7280; font-weight:600;">Correct:</span> 
                    <span style="color:#16a34a; font-weight:700;">${item.correctAnswer}</span>
                </p>
                ${feedbackHtml}
            </div>
        `;
        list.appendChild(card);
    });
}

// ===== STUDY MATERIALS =====

async function showStudyMaterials() {
    showSection('studySection');

    // 회차 목록 로드
    try {
        const rounds = await api('/api/rounds/active');
        const options = document.getElementById('studyRoundOptions');

        if (rounds.length === 0) {
            options.innerHTML = '<div class="custom-option">No rounds available</div>';
        } else {
            options.innerHTML = rounds.map(r => `
                <div class="custom-option" onclick="selectStudyRound(${r.id}, '${r.title.replace(/'/g, "\\'")}')">
                    ${r.title}
                </div>
            `).join('');
        }

        // Reset Selection
        document.getElementById('selectedStudyRoundText').textContent = '-- Select Round --';
        document.getElementById('studyRoundSelectValue').value = '';
        document.getElementById('studyRoundOptions').classList.add('hidden');

        // 초기 상태 - 빈 영역
        document.getElementById('vocabularyGrid').innerHTML = '<p class="empty-state"><i class="fa-solid fa-spell-check"></i><span>Select a round to view vocabulary</span></p>';
        document.getElementById('youtubeGrid').innerHTML = '';
        document.getElementById('pptList').innerHTML = '';
    } catch (e) {
        showAlert('Failed to load rounds: ' + e.message);
    }
}

function toggleStudyRoundDropdown() {
    const options = document.getElementById('studyRoundOptions');
    options.classList.toggle('hidden');
}

function selectStudyRound(id, title) {
    document.getElementById('studyRoundSelectValue').value = id;
    document.getElementById('selectedStudyRoundText').textContent = title;
    document.getElementById('studyRoundOptions').classList.add('hidden');
    loadStudyMaterials(id);
}

async function loadStudyMaterials(roundId) {
    if (!roundId) {
        document.getElementById('vocabularyGrid').innerHTML = '<p class="empty-state"><i class="fa-solid fa-spell-check"></i><span>Select a round to view vocabulary</span></p>';
        document.getElementById('youtubeGrid').innerHTML = '';
        document.getElementById('pptList').innerHTML = '';
        return;
    }

    showLoading();
    try {
        // 단어장 로드
        const vocabulary = await api(`/api/rounds/${roundId}/vocabulary`);
        const vocabGrid = document.getElementById('vocabularyGrid');

        if (vocabulary.length === 0) {
            vocabGrid.innerHTML = '<p class="empty-state"><i class="fa-solid fa-spell-check"></i><span>No vocabulary for this round</span></p>';
        } else {
            vocabGrid.innerHTML = vocabulary.map(v => `
                <div class="vocab-card">
                    <div class="vocab-english">
                        ${v.english}
                        <button class="speak-btn" onclick="speakWord('${v.english.replace(/'/g, "\\'")}')">
                            <i class="fa-solid fa-volume-high"></i>
                        </button>
                    </div>
                    ${v.phonetic ? `<div class="vocab-phonetic">${v.phonetic}</div>` : ''}
                    <div class="vocab-korean">${v.korean || ''}</div>
                </div>
            `).join('');
        }

        // 교육자료 로드
        const materials = await api(`/api/rounds/${roundId}/materials`);

        // 유튜브 영상
        const youtubeItems = materials.filter(m => m.materialType === 'YOUTUBE');
        const youtubeGrid = document.getElementById('youtubeGrid');
        if (youtubeItems.length === 0) {
            youtubeGrid.innerHTML = '<p class="text-muted">No video lessons available</p>';
        } else {
            youtubeGrid.innerHTML = youtubeItems.map(m => {
                const videoId = extractYoutubeVideoId(m.url);
                const thumbnail = videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : '';
                return `
                    <div class="youtube-card">
                        <div class="youtube-player-wrapper" id="player-${videoId}">
                            <img class="youtube-thumbnail" src="${thumbnail}" alt="${m.title || 'Video'}" onclick="playYoutubeEmbed('${videoId}')">
                            <div class="play-overlay" onclick="playYoutubeEmbed('${videoId}')">
                                <i class="fa-solid fa-play"></i>
                            </div>
                        </div>
                        <div class="youtube-info">
                            <div class="youtube-title">${m.title || 'Video Lesson'}</div>
                            <div class="youtube-actions">
                                <button class="btn-secondary btn-small" onclick="playYoutubeEmbed('${videoId}')">
                                    <i class="fa-solid fa-play"></i> 재생
                                </button>
                                <button class="btn-secondary btn-small" onclick="openYoutube('${m.url}')">
                                    <i class="fa-brands fa-youtube"></i> 유튜브
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }

        // PPT/문서 자료
        const pptItems = materials.filter(m => m.materialType === 'PPT');
        const pptList = document.getElementById('pptList');
        if (pptItems.length === 0) {
            pptList.innerHTML = '<p class="text-muted">No documents available</p>';
        } else {
            pptList.innerHTML = pptItems.map(m => {
                const isPdf = m.fileName && m.fileName.toLowerCase().endsWith('.pdf');
                const iconClass = isPdf ? 'fa-file-pdf' : 'fa-file-powerpoint';
                const previewHtml = isPdf
                    ? (window.innerWidth <= 768
                        ? `<div style="margin-top:15px; text-align:center;">
                             <a href="${m.url}" target="_blank" class="clay-btn btn-primary" style="width:100%; justify-content:center;">
                               <i class="fa-solid fa-file-pdf"></i> PDF 보기 (View PDF)
                             </a>
                           </div>`
                        : `<div class="pdf-preview">
                             <iframe src="${m.url}#view=FitH"></iframe>
                           </div>`)
                    : '';

                return `
                <div class="ppt-item" style="flex-direction: column; align-items: flex-start;">
                    <div style="display:flex; width:100%; align-items:center; justify-content:space-between;">
                        <div style="display:flex; align-items:center; gap:15px; overflow:hidden; flex:1;">
                            <span class="ppt-icon"><i class="fa-solid ${iconClass}"></i></span>
                            <div class="ppt-info" style="overflow:hidden;">
                                <div class="ppt-title">${m.title || m.fileName || 'Document'}</div>
                            </div>
                        </div>
                        ${window.innerWidth > 768 ? `
                        <a class="ppt-link" href="${m.url}" target="_blank" download>
                            <i class="fa-solid fa-download"></i> Download
                        </a>` : ''}
                    </div>
                    ${previewHtml}
                </div>
                `;
            }).join('');
        }
    } finally {
        hideLoading();
    }
}

function speakWord(text) {
    if ('speechSynthesis' in window) {
        // 이전 음성 취소
        speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 0.8; // 천천히 발음
        utterance.pitch = 1;

        speechSynthesis.speak(utterance);
    } else {
        showAlert('Your browser does not support text-to-speech.');
    }
}

function extractYoutubeVideoId(url) {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
}

function openYoutube(url) {
    window.open(url, '_blank');
}

function playYoutubeEmbed(videoId) {
    const wrapper = document.getElementById(`player-${videoId} `);
    if (wrapper) {
        wrapper.innerHTML = `
                    < iframe
                class="youtube-iframe"
                src = "https://www.youtube.com/embed/${videoId}?autoplay=1"
                frameborder = "0"
                allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen >
            </iframe >
                    `;
    }
}


// Toggle Study Accordion
function toggleStudyAccordion(id) {
    const item = document.getElementById(id);
    if (item) {
        item.classList.toggle('active');
    }
}
