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
window.addEventListener('click', (e) => {
    const wrapper = document.getElementById('userSelectWrapper');
    if (wrapper && !wrapper.contains(e.target)) {
        document.getElementById('customOptions').classList.add('hidden');
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
});

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
    const userId = document.getElementById('userSelectValue').value;
    if (!userId) { showAlert('Please select a user'); return; }

    try {
        showLoading();
        currentUser = await api(`/api/users/${userId}`);
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

function logout() {
    currentUser = null;
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

// Dashboard: Load Rounds
async function loadRounds() {
    const container = document.getElementById('roundListContainer');
    const list = document.getElementById('roundList');

    if (!container.classList.contains('hidden')) {
        container.classList.add('hidden'); // Toggle off
        return;
    }

    try {
        showLoading();
        const rounds = await api('/api/rounds/active');
        document.getElementById('examCount').textContent = rounds.length;

        if (rounds.length === 0) {
            list.innerHTML = '<p class="text-muted">No active exams found.</p>';
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
        container.classList.remove('hidden');
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

문제 정보:
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
    "userAnswer": "사용자가 작성한 답",
    "isCorrect": true 또는 false,
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

async function toggleWrongAnswers() {
    const box = document.getElementById('wrongAnswersList');
    if (!box.classList.contains('hidden')) {
        box.classList.add('hidden');
        return;
    }

    try {
        showLoading();
        const answers = await api(`/api/exams/${currentExam.id}/wrong-answers`);
        box.innerHTML = answers.length === 0 ? '<p class="text-success">Perfect Score!</p>' :
            answers.map(a => `
                <div class="clay-card round-item-card mb-medium" style="background:#fff0f0; border-color:#ffcccc;">
                    <p><strong>Q: ${a.questionText}</strong></p>
                    <p style="color:var(--danger)">Your Answer: ${a.userAnswer || 'Empty'}</p>
                    <p style="color:var(--success)">Correct: ${a.correctAnswer}</p>
                </div>
            `).join('');

        box.classList.remove('hidden');
    } catch (e) {
        showAlert(e.message);
    } finally {
        hideLoading();
    }
}

