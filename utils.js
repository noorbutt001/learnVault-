let state = {
        user: null,       // { name, email }
        lessons: {},      // { 'js1': true, 'ht3': true, ... }
        quizScores: {},   // { 'js': 3, 'py': 1, ... }
        quizBest: {}      // { 'js': 4, ... }
    };
    let authMode = 'login';
    let currentPage = 'home';
    let quizState = null; // { topic, qIdx, score, answers, timer }

    /* ═══════════════════════════════════════════════
       INIT
       ═══════════════════════════════════════════════ */
    function init() {
        loadState();
        renderFeatured();
        renderCourses();
        renderQuizTopics();
        updateNavAuth();
        spawnParticles();
        window.addEventListener('scroll', () => {
            document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 20);
        });
    }

    function loadState() {
        try {
            const raw = localStorage.getItem('lv_state');
            if (raw) { const s = JSON.parse(raw); Object.assign(state, s); }
        } catch {}
    }
    function saveState() {
        try { localStorage.setItem('lv_state', JSON.stringify(state)); } catch {}
    }

    /* ═══════════════════════════════════════════════
       NAVIGATION
       ═══════════════════════════════════════════════ */
    function nav(page) {
        // If going to progress and not logged in, redirect to auth
        if (page === 'progress' && !state.user) { nav('auth'); toast('info','Sign in to view your progress.'); return; }
        // Clean up quiz if leaving
        if (currentPage === 'quiz' && quizState) { clearInterval(quizState.timer); quizState = null; }

        currentPage = page;
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        const el = document.getElementById('page-' + page);
        if (el) el.classList.add('active');

        // Update nav links
        document.querySelectorAll('.nav-link,.mob-link').forEach(l => {
            l.classList.toggle('active', l.dataset.page === page);
        });

        window.scrollTo({ top: 0, behavior: 'smooth' });

        if (page === 'progress') renderProgress();
    }

    function toggleMob() {
        const h = document.getElementById('hamburger');
        const m = document.getElementById('mobMenu');
        h.classList.toggle('open');
        m.classList.toggle('open');
    }

    function updateNavAuth() {
        const html = state.user
            ? `<div class="flex items-center gap-3">
                 <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style="background:var(--accent);color:var(--bg)">${state.user.name.charAt(0).toUpperCase()}</div>
                 <span class="text-sm font-medium hidden sm:inline">${state.user.name}</span>
                 <button class="btn-outline text-xs" style="padding:6px 12px" onclick="logout()">Logout</button>
               </div>`
            : `<button class="btn-primary text-xs" style="padding:7px 18px" onclick="nav('auth')">Sign In</button>`;
        document.getElementById('navAuth').innerHTML = html;
        document.getElementById('mobAuth').innerHTML = state.user
            ? `<span class="mob-link" onclick="logout();toggleMob()"><i class="fa-solid fa-right-from-bracket mr-2"></i>Logout</span>`
            : `<span class="mob-link" onclick="nav('auth');toggleMob()"><i class="fa-solid fa-right-to-bracket mr-2"></i>Sign In</span>`;
    }

    function logout() {
        state.user = null;
        saveState();
        updateNavAuth();
        nav('home');
        toast('success','Signed out successfully.');
    }

    /* ═══════════════════════════════════════════════
       AUTH
       ═══════════════════════════════════════════════ */
    function switchAuth(mode) {
        authMode = mode;
        const isLogin = mode === 'login';
        document.getElementById('tabLogin').classList.toggle('active', isLogin);
        document.getElementById('tabSignup').classList.toggle('active', !isLogin);
        document.getElementById('nameField').style.display = isLogin ? 'none' : 'block';
        document.getElementById('confirmField').style.display = isLogin ? 'none' : 'block';
        document.getElementById('authTitle').textContent = isLogin ? 'Welcome Back' : 'Create Account';
        document.getElementById('authSubtitle').textContent = isLogin ? 'Sign in to track your learning progress' : 'Start tracking your learning journey';
        document.getElementById('authBtn').textContent = isLogin ? 'Sign In' : 'Create Account';
        document.getElementById('authSwitch').innerHTML = isLogin
            ? `Don't have an account? <span style="color:var(--accent);cursor:pointer;font-weight:600" onclick="switchAuth('signup')">Sign up</span>`
            : `Already have an account? <span style="color:var(--accent);cursor:pointer;font-weight:600" onclick="switchAuth('login')">Sign in</span>`;
        // Clear errors
        ['errName','errEmail','errPass','errConfirm'].forEach(id => document.getElementById(id).textContent = '');
        ['authName','authEmail','authPass','authConfirm'].forEach(id => document.getElementById(id).className = 'form-input');
    }

    function togglePw() {
        const inp = document.getElementById('authPass');
        const ico = document.getElementById('pwIcon');
        if (inp.type === 'password') { inp.type = 'text'; ico.className = 'fa-solid fa-eye-slash'; }
        else { inp.type = 'password'; ico.className = 'fa-solid fa-eye'; }
    }

    function handleAuth(e) {
        e.preventDefault();
        let valid = true;
        const name = document.getElementById('authName').value.trim();
        const email = document.getElementById('authEmail').value.trim();
        const pass = document.getElementById('authPass').value;
        const confirm = document.getElementById('authConfirm').value;

        // Clear
        ['errName','errEmail','errPass','errConfirm'].forEach(id => document.getElementById(id).textContent = '');
        ['authName','authEmail','authPass','authConfirm'].forEach(id => document.getElementById(id).className = 'form-input');

        if (authMode === 'signup') {
            if (!name || name.length < 2) { setErr('authName','errName','Name must be at least 2 characters.'); valid = false; }
            else setOk('authName');
        }
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setErr('authEmail','errEmail','Please enter a valid email address.'); valid = false; }
        else setOk('authEmail');
        if (!pass || pass.length < 6) { setErr('authPass','errPass','Password must be at least 6 characters.'); valid = false; }
        else setOk('authPass');
        if (authMode === 'signup') {
            if (pass !== confirm) { setErr('authConfirm','errConfirm','Passwords do not match.'); valid = false; }
            else if (confirm) setOk('authConfirm');
        }

        if (!valid) return;

        state.user = { name: authMode === 'signup' ? name : email.split('@')[0], email };
        saveState();
        updateNavAuth();
        toast('success', authMode === 'signup' ? `Welcome, ${state.user.name}! Account created.` : `Welcome back, ${state.user.name}!`);
        nav('home');

        // Reset form
        document.getElementById('authForm').reset();
    }

    function setErr(inputId, errId, msg) {
        document.getElementById(inputId).className = 'form-input err';
        document.getElementById(errId).textContent = msg;
    }
    function setOk(inputId) {
        document.getElementById(inputId).className = 'form-input ok';
    }

    /* ═══════════════════════════════════════════════
       COURSES
       ═══════════════════════════════════════════════ */
    function courseCard(c, idx) {
        const done = c.lessons.filter(l => state.lessons[l.id]).length;
        const total = c.lessons.length;
        const pct = Math.round((done / total) * 100);
        const dc = c.diff === 'Beginner' ? 'diff-beginner' : c.diff === 'Intermediate' ? 'diff-intermediate' : 'diff-advanced';
        return `
        <div class="course-card" style="animation-delay:${idx * 0.06}s" onclick="openCourse('${c.id}')">
            <div class="overflow-hidden"><img src="${c.img}" alt="${c.title}" class="card-img" loading="lazy"></div>
            <div class="p-5">
                <div class="flex items-center justify-between mb-3">
                    <span class="diff-badge ${dc}">${c.diff}</span>
                    <span class="text-xs font-medium" style="color:var(--muted)">${done}/${total} lessons</span>
                </div>
                <div class="flex items-center gap-2.5 mb-2">
                    <i class="${c.icon} text-lg" style="color:${c.color}"></i>
                    <h3 class="font-semibold text-[15px] leading-tight">${c.title}</h3>
                </div>
                <p class="text-xs leading-relaxed mb-4" style="color:var(--muted)">${c.desc}</p>
                <div class="w-full h-1.5 rounded-full overflow-hidden" style="background:var(--border)">
                    <div class="h-full rounded-full transition-all duration-700" style="width:${pct}%;background:var(--accent)"></div>
                </div>
                <p class="text-[11px] mt-1.5 font-medium" style="color:${pct===100?'var(--ok)':'var(--muted)'}">${pct === 100 ? 'Completed' : pct + '% complete'}</p>
            </div>
        </div>`;
    }

    function renderFeatured() {
        document.getElementById('featuredGrid').innerHTML = COURSES.slice(0, 3).map((c, i) => courseCard(c, i)).join('');
    }
    function renderCourses() {
        document.getElementById('courseGrid').innerHTML = COURSES.map((c, i) => courseCard(c, i)).join('');
    }

    /* ═══════════════════════════════════════════════
       COURSE DETAIL MODAL
       ═══════════════════════════════════════════════ */
    function openCourse(id) {
        const c = COURSES.find(x => x.id === id);
        if (!c) return;
        const done = c.lessons.filter(l => state.lessons[l.id]).length;
        const total = c.lessons.length;
        const pct = Math.round((done / total) * 100);
        const circ = 2 * Math.PI * 38;
        const offset = circ - (circ * pct / 100);

        document.getElementById('modalContainer').innerHTML = `
        <div class="modal-overlay" onclick="if(event.target===this)closeModal()">
            <div class="modal-box">
                <div class="relative">
                    <img src="${c.img}" alt="${c.title}" class="w-full h-48 object-cover">
                    <div class="absolute inset-0" style="background:linear-gradient(to top,var(--card),transparent 60%)"></div>
                    <button onclick="closeModal()" class="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center" style="background:rgba(0,0,0,.5);backdrop-filter:blur(8px);border:none;color:#fff;cursor:pointer;font-size:14px" aria-label="Close">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
                <div class="p-6">
                    <div class="flex items-start justify-between gap-4 mb-6">
                        <div>
                            <div class="flex items-center gap-2.5 mb-1">
                                <i class="${c.icon} text-xl" style="color:${c.color}"></i>
                                <h2 class="text-xl font-bold">${c.title}</h2>
                            </div>
                            <p class="text-sm" style="color:var(--muted)">${c.desc}</p>
                        </div>
                        <div class="flex-shrink-0 relative" style="width:84px;height:84px">
                            <svg width="84" height="84" style="transform:rotate(-90deg)">
                                <circle cx="42" cy="42" r="38" class="ring-track"/>
                                <circle cx="42" cy="42" r="38" class="ring-fill" stroke-dasharray="${circ}" stroke-dashoffset="${offset}"/>
                            </svg>
                            <div class="absolute inset-0 flex items-center justify-center text-sm font-bold">${pct}%</div>
                        </div>
                    </div>
                    <h3 class="text-sm font-semibold mb-3" style="color:var(--muted);text-transform:uppercase;letter-spacing:.8px">Lessons</h3>
                    <div class="flex flex-col gap-1.5">
                        ${c.lessons.map((l, i) => {
                            const d = state.lessons[l.id];
                            return `<div class="lesson-item" onclick="toggleLesson('${l.id}','${c.id}')">
                                <div class="lesson-check ${d?'done':''}">${d?'<i class="fa-solid fa-check"></i>':i+1}</div>
                                <div class="flex-1">
                                    <p class="text-sm font-medium ${d?'line-through':''}" style="${d?'color:var(--muted)':''}">${l.title}</p>
                                </div>
                                ${d?'<span class="text-xs font-medium" style="color:var(--ok)">Done</span>':'<span class="text-xs" style="color:var(--muted)">Tap to complete</span>'}
                            </div>`;
                        }).join('')}
                    </div>
                </div>
            </div>
        </div>`;
    }

    function toggleLesson(lid, cid) {
        state.lessons[lid] = !state.lessons[lid];
        saveState();
        openCourse(cid); // Re-render modal
        renderFeatured();
        renderCourses();
        const done = state.lessons[lid];
        // Check if course complete
        const c = COURSES.find(x => x.id === cid);
        if (done && c && c.lessons.every(l => state.lessons[l.id])) {
            toast('success', `Congratulations! You completed "${c.title}"!`);
        }
    }

    function closeModal() {
        document.getElementById('modalContainer').innerHTML = '';
    }

    /* ═══════════════════════════════════════════════
       QUIZ
       ═══════════════════════════════════════════════ */
    function renderQuizTopics() {
        document.getElementById('quizTopics').innerHTML = Object.entries(QUIZZES).map(([id, q]) => {
            const best = state.quizBest[id];
            const attempted = state.quizScores[id] !== undefined;
            return `
            <div class="p-5 rounded-2xl cursor-pointer transition-all duration-300 hover:-translate-y-1"
                 style="background:var(--card);border:1px solid var(--border);border-left:4px solid ${q.color}"
                 onclick="startQuiz('${id}')">
                <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background:${q.color}22">
                            <i class="${q.icon} text-lg" style="color:${q.color}"></i>
                        </div>
                        <div>
                            <h3 class="font-semibold text-sm">${q.title}</h3>
                            <p class="text-xs" style="color:var(--muted)">${q.questions.length} questions &middot; 20s each</p>
                        </div>
                    </div>
                    ${attempted ? `<span class="text-xs font-bold px-2.5 py-1 rounded-lg" style="background:var(--ok-dim);color:var(--ok)">Best: ${best}/${q.questions.length}</span>` : ''}
                </div>
                <button class="w-full py-2.5 rounded-xl text-sm font-semibold transition-all"
                        style="background:${q.color}18;color:${q.color};border:1px solid ${q.color}33"
                        onmouseover="this.style.background='${q.color}28'" onmouseout="this.style.background='${q.color}18'">
                    ${attempted ? 'Retake Quiz' : 'Start Quiz'} <i class="fa-solid fa-arrow-right ml-1.5 text-xs"></i>
                </button>
            </div>`;
        }).join('');
    }

    function startQuiz(topic) {
        const q = QUIZZES[topic];
        quizState = { topic, qIdx: 0, score: 0, answers: [], timer: null, timeLeft: 20 };
        document.getElementById('quizStart').style.display = 'none';
        document.getElementById('quizResult').style.display = 'none';
        document.getElementById('quizPlay').style.display = 'block';
        renderQuestion();
    }

    function renderQuestion() {
        const qs = QUIZZES[quizState.topic];
        const q = qs.questions[quizState.qIdx];
        const letters = ['A','B','C','D'];
        const total = qs.questions.length;

        document.getElementById('quizPlay').innerHTML = `
        <div>
            <div class="flex items-center justify-between mb-6">
                <button class="btn-outline text-xs" style="padding:7px 14px" onclick="exitQuiz()"><i class="fa-solid fa-xmark mr-1.5"></i>Exit</button>
                <div class="flex items-center gap-2">
                    <span class="text-sm font-medium" style="color:var(--muted)">Question ${quizState.qIdx + 1}/${total}</span>
                    <div class="quiz-timer" id="qTimer">${quizState.timeLeft}</div>
                </div>
            </div>
            <!-- Progress dots -->
            <div class="flex gap-1.5 mb-6">
                ${qs.questions.map((_, i) => {
                    let bg = 'var(--border)';
                    if (i < quizState.qIdx) bg = quizState.answers[i]?.correct ? 'var(--ok)' : 'var(--err)';
                    if (i === quizState.qIdx) bg = 'var(--accent)';
                    return `<div class="flex-1 h-1 rounded-full transition-all" style="background:${bg}"></div>`;
                }).join('')}
            </div>
            <div class="mb-6 p-5 rounded-2xl" style="background:var(--card);border:1px solid var(--border)">
                <h2 class="text-base md:text-lg font-semibold leading-relaxed">${q.q}</h2>
            </div>
            <div class="flex flex-col gap-3" id="quizOpts">
                ${q.opts.map((o, i) => `
                <div class="quiz-opt" data-idx="${i}" onclick="selectAnswer(${i})">
                    <div class="opt-letter">${letters[i]}</div>
                    <span class="text-sm font-medium">${o}</span>
                </div>`).join('')}
            </div>
        </div>`;

        startTimer();
    }

    function startTimer() {
        quizState.timeLeft = 20;
        updateTimerUI();
        quizState.timer = setInterval(() => {
            quizState.timeLeft--;
            updateTimerUI();
            if (quizState.timeLeft <= 0) {
                clearInterval(quizState.timer);
                selectAnswer(-1); // Time's up
            }
        }, 1000);
    }

    function updateTimerUI() {
        const el = document.getElementById('qTimer');
        if (!el) return;
        el.textContent = quizState.timeLeft;
        el.classList.remove('warn','danger');
        if (quizState.timeLeft <= 5) el.classList.add('danger');
        else if (quizState.timeLeft <= 10) el.classList.add('warn');
    }

    function selectAnswer(idx) {
        clearInterval(quizState.timer);
        const q = QUIZZES[quizState.topic].questions[quizState.qIdx];
        const correct = idx === q.ans;
        if (correct) quizState.score++;

        quizState.answers.push({ selected: idx, correct });

        // Lock options and show feedback
        const opts = document.querySelectorAll('#quizOpts .quiz-opt');
        opts.forEach((o, i) => {
            o.classList.add('locked');
            o.onclick = null;
            if (i === q.ans) o.classList.add('correct');
            if (i === idx && !correct) o.classList.add('wrong');
            if (i === idx && correct) o.classList.add('selected');
        });

        // Auto-advance after delay
        setTimeout(() => {
            quizState.qIdx++;
            if (quizState.qIdx < QUIZZES[quizState.topic].questions.length) {
                renderQuestion();
            } else {
                showQuizResult();
            }
        }, 1200);
    }

    function showQuizResult() {
        const qs = QUIZZES[quizState.topic];
        const total = qs.questions.length;
        const score = quizState.score;
        const pct = Math.round((score / total) * 100);

        // Save score
        state.quizScores[quizState.topic] = score;
        if (!state.quizBest[quizState.topic] || score > state.quizBest[quizState.topic]) {
            state.quizBest[quizState.topic] = score;
        }
        saveState();

        let grade, gradeColor, gradeBg, message;
        if (pct === 100) { grade='Perfect'; gradeColor='var(--ok)'; gradeBg='var(--ok-dim)'; message='Outstanding performance! You nailed every question.'; }
        else if (pct >= 75) { grade='Great'; gradeColor='var(--accent)'; gradeBg='var(--accent-dim)'; message='Strong showing! Just a few to review.'; }
        else if (pct >= 50) { grade='Good'; gradeColor='var(--warn)'; gradeBg='var(--warn-dim)'; message='Decent attempt. Review the material and try again.'; }
        else { grade='Keep Going'; gradeColor='var(--err)'; gradeBg='var(--err-dim)'; message='Don\'t give up! Study the lessons and retake the quiz.'; }

        document.getElementById('quizPlay').style.display = 'none';
        document.getElementById('quizResult').style.display = 'block';
        document.getElementById('quizResult').innerHTML = `
        <div class="text-center">
            <div class="inline-flex items-center gap-2 px-4 py-2 rounded-xl mb-6" style="background:${gradeBg};color:${gradeColor}">
                <i class="fa-solid ${pct===100?'fa-trophy':pct>=75?'fa-star':pct>=50?'fa-thumbs-up':'fa-book-open'}"></i>
                <span class="font-bold text-sm">${grade}</span>
            </div>
            <div class="relative inline-block mb-6" style="width:140px;height:140px">
                <svg width="140" height="140" style="transform:rotate(-90deg)">
                    <circle cx="70" cy="70" r="60" fill="none" stroke="var(--border)" stroke-width="8"/>
                    <circle cx="70" cy="70" r="60" fill="none" stroke="${gradeColor}" stroke-width="8" stroke-linecap="round"
                            stroke-dasharray="${2*Math.PI*60}" stroke-dashoffset="${2*Math.PI*60 - (2*Math.PI*60*pct/100)}"
                            style="transition:stroke-dashoffset 1s cubic-bezier(.4,0,.2,1)"/>
                </svg>
                <div class="absolute inset-0 flex flex-col items-center justify-center">
                    <span class="text-3xl font-bold">${score}</span>
                    <span class="text-xs" style="color:var(--muted)">of ${total}</span>
                </div>
            </div>
            <h2 class="text-xl font-bold mb-2">${qs.title} Quiz Complete</h2>
            <p class="text-sm mb-8" style="color:var(--muted);max-width:400px;margin:0 auto">${message}</p>
            <!-- Answer breakdown -->
            <div class="text-left rounded-2xl p-5 mb-8" style="background:var(--card);border:1px solid var(--border)">
                <h3 class="text-sm font-semibold mb-4" style="color:var(--muted);text-transform:uppercase;letter-spacing:.8px">Answer Review</h3>
                ${qs.questions.map((q, i) => {
                    const a = quizState.answers[i];
                    const letters = ['A','B','C','D'];
                    return `<div class="flex items-start gap-3 py-3 ${i < total-1 ? 'border-b' : ''}" style="border-color:var(--border)">
                        <div class="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style="background:${a.correct?'var(--ok-dim)':'var(--err-dim)'}">
                            <i class="fa-solid ${a.correct?'fa-check':'fa-xmark'} text-[10px]" style="color:${a.correct?'var(--ok)':'var(--err)'}"></i>
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="text-sm font-medium mb-1">${q.q}</p>
                            <p class="text-xs" style="color:var(--muted)">
                                ${a.selected === -1 ? '<span style="color:var(--err)">Time expired</span>' : `Your answer: <span style="color:${a.correct?'var(--ok)':'var(--err)'}">${letters[a.selected]}. ${q.opts[a.selected]}</span>`}
                                ${!a.correct ? `<br>Correct: <span style="color:var(--ok)">${letters[q.ans]}. ${q.opts[q.ans]}</span>` : ''}
                            </p>
                        </div>
                    </div>`;
                }).join('')}
            </div>
            <div class="flex flex-wrap justify-center gap-3">
                <button class="btn-primary" onclick="startQuiz('${quizState.topic}')"><i class="fa-solid fa-rotate-right mr-2"></i>Retake</button>
                <button class="btn-outline" onclick="exitQuiz()"><i class="fa-solid fa-list mr-2"></i>All Quizzes</button>
            </div>
        </div>`;
    }

    function exitQuiz() {
        if (quizState) { clearInterval(quizState.timer); quizState = null; }
        document.getElementById('quizPlay').style.display = 'none';
        document.getElementById('quizResult').style.display = 'none';
        document.getElementById('quizStart').style.display = 'block';
        renderQuizTopics();
    }

    /* ═══════════════════════════════════════════════
       PROGRESS
       ═══════════════════════════════════════════════ */
    function renderProgress() {
        if (!state.user) {
            document.getElementById('progAuth').innerHTML = `
            <div class="text-center py-20">
                <div class="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5" style="background:var(--accent-dim)">
                    <i class="fa-solid fa-lock text-2xl" style="color:var(--accent)"></i>
                </div>
                <h2 class="text-xl font-bold mb-2">Sign In Required</h2>
                <p class="text-sm mb-6" style="color:var(--muted)">Track your learning progress by signing in.</p>
                <button class="btn-primary" onclick="nav('auth')">Sign In</button>
            </div>`;
            document.getElementById('progContent').style.display = 'none';
            return;
        }
        document.getElementById('progAuth').innerHTML = '';
        document.getElementById('progContent').style.display = 'block';

        // Calculate stats
        let totalLessons = 0, doneLessons = 0;
        COURSES.forEach(c => { totalLessons += c.lessons.length; doneLessons += c.lessons.filter(l => state.lessons[l.id]).length; });
        const overallPct = totalLessons ? Math.round((doneLessons / totalLessons) * 100) : 0;
        const quizzesTaken = Object.keys(state.quizScores).length;
        const totalQ = Object.values(state.quizScores).reduce((s, v) => s + v, 0);
        const totalPossible = Object.entries(state.quizScores).reduce((s, [k]) => s + QUIZZES[k].questions.length, 0);
        const quizPct = totalPossible ? Math.round((totalQ / totalPossible) * 100) : 0;
        const circ = 2 * Math.PI * 52;

        document.getElementById('progContent').innerHTML = `
        <div class="mb-8">
            <h1 class="text-3xl font-bold mb-1">Your Progress</h1>
            <p class="text-sm" style="color:var(--muted)">Welcome back, <span style="color:var(--accent)">${state.user.name}</span></p>
        </div>

        <!-- Overview cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
            <div class="p-6 rounded-2xl text-center" style="background:var(--card);border:1px solid var(--border)">
                <div class="relative inline-block mb-3" style="width:120px;height:120px">
                    <svg width="120" height="120" style="transform:rotate(-90deg)">
                        <circle cx="60" cy="60" r="52" class="ring-track"/>
                        <circle cx="60" cy="60" r="52" class="ring-fill" stroke-dasharray="${circ}" stroke-dashoffset="${circ - circ * overallPct / 100}"/>
                    </svg>
                    <div class="absolute inset-0 flex flex-col items-center justify-center">
                        <span class="text-2xl font-bold">${overallPct}%</span>
                        <span class="text-[10px]" style="color:var(--muted)">Complete</span>
                    </div>
                </div>
                <p class="font-semibold text-sm">Lessons</p>
                <p class="text-xs" style="color:var(--muted)">${doneLessons} of ${totalLessons} completed</p>
            </div>
            <div class="p-6 rounded-2xl text-center" style="background:var(--card);border:1px solid var(--border)">
                <div class="relative inline-block mb-3" style="width:120px;height:120px">
                    <svg width="120" height="120" style="transform:rotate(-90deg)">
                        <circle cx="60" cy="60" r="52" class="ring-track"/>
                        <circle cx="60" cy="60" r="52" fill="none" stroke="var(--warn)" stroke-width="6" stroke-linecap="round"
                                stroke-dasharray="${circ}" stroke-dashoffset="${circ - circ * quizPct / 100}"
                                style="transition:stroke-dashoffset 1s cubic-bezier(.4,0,.2,1)"/>
                    </svg>
                    <div class="absolute inset-0 flex flex-col items-center justify-center">
                        <span class="text-2xl font-bold">${totalQ}</span>
                        <span class="text-[10px]" style="color:var(--muted)">Correct</span>
                    </div>
                </div>
                <p class="font-semibold text-sm">Quiz Score</p>
                <p class="text-xs" style="color:var(--muted)">${quizzesTaken} quiz${quizzesTaken!==1?'zes':''} taken</p>
            </div>
            <div class="p-6 rounded-2xl flex flex-col items-center justify-center" style="background:var(--card);border:1px solid var(--border)">
                <div class="w-14 h-14 rounded-2xl flex items-center justify-center mb-3" style="background:var(--accent-dim)">
                    <i class="fa-solid fa-fire text-2xl" style="color:#FF8C32"></i>
                </div>
                <p class="text-3xl font-bold mb-1">${doneLessons + totalQ}</p>
                <p class="text-xs" style="color:var(--muted)">Total XP Earned</p>
                <p class="text-[11px] mt-2" style="color:var(--muted)">+1 XP per lesson, +1 XP per correct answer</p>
            </div>
        </div>

        <!-- Course breakdown -->
        <h2 class="text-lg font-bold mb-4">Course Breakdown</h2>
        <div class="flex flex-col gap-3">
            ${COURSES.map(c => {
                const d = c.lessons.filter(l => state.lessons[l.id]).length;
                const t = c.lessons.length;
                const p = Math.round((d / t) * 100);
                const best = state.quizBest[c.id];
                return `
                <div class="p-4 rounded-xl flex items-center gap-4 transition-all hover:translate-x-1" style="background:var(--card);border:1px solid var(--border)">
                    <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style="background:${c.color}18">
                        <i class="${c.icon}" style="color:${c.color}"></i>
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center justify-between mb-1.5">
                            <p class="text-sm font-semibold truncate">${c.title}</p>
                            <span class="text-xs font-bold ml-2" style="color:${p===100?'var(--ok)':'var(--muted)'}">${p}%</span>
                        </div>
                        <div class="w-full h-1.5 rounded-full overflow-hidden" style="background:var(--border)">
                            <div class="h-full rounded-full transition-all duration-700" style="width:${p}%;background:${p===100?'var(--ok)':'var(--accent)'}"></div>
                        </div>
                        <div class="flex items-center gap-3 mt-1.5">
                            <span class="text-[11px]" style="color:var(--muted)">${d}/${t} lessons</span>
                            ${best !== undefined ? `<span class="text-[11px]" style="color:var(--warn)">Quiz best: ${best}/${QUIZZES[c.id].questions.length}</span>` : `<span class="text-[11px]" style="color:var(--muted)">Quiz: not taken</span>`}
                        </div>
                    </div>
                </div>`;
            }).join('')}
        </div>

        <!-- Clear progress -->
        <div class="mt-10 pt-8 text-center" style="border-top:1px solid var(--border)">
            <button class="btn-outline text-xs" style="color:var(--err);border-color:rgba(255,107,107,.2)" onclick="clearProgress()">
                <i class="fa-solid fa-rotate-left mr-1.5"></i>Reset All Progress
            </button>
        </div>`;
    }

    function clearProgress() {
        state.lessons = {};
        state.quizScores = {};
        state.quizBest = {};
        saveState();
        renderProgress();
        renderFeatured();
        renderCourses();
        toast('info','All progress has been reset.');
    }

    /* ═══════════════════════════════════════════════
       TOAST
       ═══════════════════════════════════════════════ */
    function toast(type, msg) {
        const el = document.createElement('div');
        el.className = `toast ${type}`;
        const icons = { success:'fa-circle-check', error:'fa-circle-exclamation', info:'fa-circle-info' };
        el.innerHTML = `<i class="fa-solid ${icons[type]||icons.info}"></i><span>${msg}</span>`;
        document.getElementById('toastBox').appendChild(el);
        setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 300); }, 3500);
    }

    /* ═══════════════════════════════════════════════
       HERO PARTICLES
       ═══════════════════════════════════════════════ */
    function spawnParticles() {
        const box = document.getElementById('particleBox');
        if (!box) return;
        for (let i = 0; i < 18; i++) {
            const p = document.createElement('div');
            p.className = 'particle';
            const size = Math.random() * 4 + 2;
            p.style.cssText = `width:${size}px;height:${size}px;left:${Math.random()*100}%;bottom:${-Math.random()*20}%;animation-duration:${Math.random()*8+6}s;animation-delay:${Math.random()*6}s`;
            box.appendChild(p);
        }
    }

    /* ═══════════════════════════════════════════════
       KEYBOARD SHORTCUTS
       ═══════════════════════════════════════════════ */
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            closeModal();
            if (quizState) exitQuiz();
        }
    });

    /* ── GO ── */
    init();