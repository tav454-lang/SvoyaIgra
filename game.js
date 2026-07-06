/* ==========================================================
   СВОЯ ИГРА — v5 FINAL
   STABLE GAME ENGINE (NO ARCHITECTURAL BREAKS)
========================================================== */

"use strict";

/* ==========================================================
   CONFIG
========================================================== */

const CONFIG = {
    ROUND_VALUES: {
        1: [100, 200, 300, 400, 500],
        2: [200, 400, 600, 800, 1000],
        3: [300, 600, 900, 1200, 1500]
    },
    CATEGORY_COUNT: 6,
    TIMER: 30
};

/* ==========================================================
   HELPERS
========================================================== */

const $ = (id) => document.getElementById(id);

function shuffle(arr) {
    return [...arr].sort(() => Math.random() - 0.5);
}

/* ==========================================================
   GAME ENGINE
========================================================== */

class GameEngine {

    constructor() {

        this.players = [];
        this.round = 1;

        this.questions = [];
        this.board = [];

        this.used = new Set();

        this.currentQuestion = null;

        this.state = "idle";

        this.timer = null;
        this.time = CONFIG.TIMER;

        this.lock = false;

        this.selectedPlayer = null;

        this.loadState();
    }

    /* ======================================================
       INIT
    ====================================================== */

    async init() {

        console.log("Инициализация игры...");

        try {
            const res = await fetch("questions.json");
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            this.questions = await res.json();
            console.log(`Загружено вопросов: ${this.questions.length}`);
        } catch (e) {
            console.error("Ошибка загрузки questions.json:", e);
            this.loadDefaultQuestions();
        }

        this.bootstrap();
        this.bindUIEvents();

    }

    loadDefaultQuestions() {
        console.warn("Используются вопросы по умолчанию");
        this.questions = [
            {
                "id": "q1",
                "round": 1,
                "category": "История",
                "question": "Кто открыл Америку?",
                "answer": "Христофор Колумб",
                "type": "normal"
            },
            {
                "id": "q2",
                "round": 1,
                "category": "История",
                "question": "В каком году была революция во Франции?",
                "answer": "1789",
                "type": "normal"
            },
            {
                "id": "q3",
                "round": 1,
                "category": "История",
                "question": "Кто был первым президентом США?",
                "answer": "Джордж Вашингтон",
                "type": "normal"
            },
            {
                "id": "q4",
                "round": 1,
                "category": "История",
                "question": "В каком году началась Вторая мировая война?",
                "answer": "1939",
                "type": "normal"
            },
            {
                "id": "q5",
                "round": 1,
                "category": "История",
                "question": "Кто написал Конституцию России 1993?",
                "answer": "Борис Ельцин",
                "type": "normal"
            },
            {
                "id": "q6",
                "round": 1,
                "category": "Наука",
                "question": "Что такое H2O?",
                "answer": "Вода",
                "type": "normal"
            },
            {
                "id": "q7",
                "round": 1,
                "category": "Наука",
                "question": "Сколько планет в Солнечной системе?",
                "answer": "8 планет",
                "type": "normal"
            },
            {
                "id": "q8",
                "round": 1,
                "category": "Наука",
                "question": "Кто открыл закон всемирного тяготения?",
                "answer": "Исаак Ньютон",
                "type": "normal"
            },
            {
                "id": "q9",
                "round": 1,
                "category": "Наука",
                "question": "Из скольких букв состоит ДНК?",
                "answer": "4 буквы (А, Г, Ц, Т)",
                "type": "normal"
            },
            {
                "id": "q10",
                "round": 1,
                "category": "Наука",
                "question": "Какой газ необходим для дыхания?",
                "answer": "Кислород",
                "type": "normal"
            },
            {
                "id": "q11",
                "round": 1,
                "category": "Литература",
                "question": "Кто написал 'Война и мир'?",
                "answer": "Лев Толстой",
                "type": "normal"
            },
            {
                "id": "q12",
                "round": 1,
                "category": "Литература",
                "question": "Кто написал 'Преступление и наказание'?",
                "answer": "Федор Достоевский",
                "type": "normal"
            },
            {
                "id": "q13",
                "round": 1,
                "category": "Литература",
                "question": "Кто автор 'Мастера и Маргариты'?",
                "answer": "Михаил Булгаков",
                "type": "normal"
            },
            {
                "id": "q14",
                "round": 1,
                "category": "Литература",
                "question": "Как зовут главного персонажа 'Евгения Онегина'?",
                "answer": "Евгений Онегин",
                "type": "normal"
            },
            {
                "id": "q15",
                "round": 1,
                "category": "Литература",
                "question": "Кто написал 'Мертвые души'?",
                "answer": "Николай Гоголь",
                "type": "normal"
            },
            {
                "id": "q16",
                "round": 1,
                "category": "География",
                "question": "Какой город столица России?",
                "answer": "Москва",
                "type": "normal"
            },
            {
                "id": "q17",
                "round": 1,
                "category": "География",
                "question": "Какая река самая длинная в мире?",
                "answer": "Нил",
                "type": "normal"
            },
            {
                "id": "q18",
                "round": 1,
                "category": "География",
                "question": "На каком материке ��аходится Австралия?",
                "answer": "Австралия (материк)",
                "type": "normal"
            },
            {
                "id": "q19",
                "round": 1,
                "category": "География",
                "question": "Какая столица Франции?",
                "answer": "Париж",
                "type": "normal"
            },
            {
                "id": "q20",
                "round": 1,
                "category": "География",
                "question": "Сколько материков на Земле?",
                "answer": "7 материков",
                "type": "normal"
            },
            {
                "id": "q21",
                "round": 1,
                "category": "Спорт",
                "question": "Сколько игроков в футбольной команде на поле?",
                "answer": "11 игроков",
                "type": "normal"
            },
            {
                "id": "q22",
                "round": 1,
                "category": "Спорт",
                "question": "В каком году прошли первые Олимпийские игры современности?",
                "answer": "1896",
                "type": "normal"
            },
            {
                "id": "q23",
                "round": 1,
                "category": "Спорт",
                "question": "Сколько периодов в хоккее?",
                "answer": "3 периода",
                "type": "normal"
            },
            {
                "id": "q24",
                "round": 1,
                "category": "Спорт",
                "question": "На какой высоте установлена волейбольная сетка для мужчин?",
                "answer": "2,43 метра",
                "type": "normal"
            },
            {
                "id": "q25",
                "round": 1,
                "category": "Спорт",
                "question": "Сколько шахматных фигур у каждого игрока?",
                "answer": "16 фигур",
                "type": "normal"
            },
            {
                "id": "q26",
                "round": 2,
                "category": "История",
                "question": "Кто был первым императором России?",
                "answer": "Петр I",
                "type": "normal"
            },
            {
                "id": "q27",
                "round": 2,
                "category": "История",
                "question": "В каком году произошла Октябрьская революция?",
                "answer": "1917",
                "type": "normal"
            },
            {
                "id": "q28",
                "round": 2,
                "category": "История",
                "question": "Кто победил Наполеона?",
                "answer": "Разные ответы (русская армия, Кутузов, союзники)",
                "type": "normal"
            },
            {
                "id": "q29",
                "round": 2,
                "category": "История",
                "question": "В каком году распалась Советский Союз?",
                "answer": "1991",
                "type": "normal"
            },
            {
                "id": "q30",
                "round": 2,
                "category": "История",
                "question": "Какой город был столицей Золотой Орды?",
                "answer": "Сарай",
                "type": "normal"
            },
            {
                "id": "q31",
                "round": 2,
                "category": "Наука",
                "question": "Кто открыл радиоактивность?",
                "answer": "Антуан Беккерель и Мария Кюри",
                "type": "normal"
            },
            {
                "id": "q32",
                "round": 2,
                "category": "��аука",
                "question": "Какой элемент имеет символ Au?",
                "answer": "Золото",
                "type": "normal"
            },
            {
                "id": "q33",
                "round": 2,
                "category": "Наука",
                "question": "Сколько костей в теле взрослого человека?",
                "answer": "206 костей",
                "type": "normal"
            },
            {
                "id": "q34",
                "round": 2,
                "category": "Наука",
                "question": "Кто разработал теорию относительности?",
                "answer": "Альберт Эйнштейн",
                "type": "normal"
            },
            {
                "id": "q35",
                "round": 2,
                "category": "Наука",
                "question": "Какая скорость света в вакууме?",
                "answer": "300 000 км/с",
                "type": "normal"
            },
            {
                "id": "q36",
                "round": 2,
                "category": "Литература",
                "question": "Кто автор 'Анны Карениной'?",
                "answer": "Лев Толстой",
                "type": "normal"
            },
            {
                "id": "q37",
                "round": 2,
                "category": "Литература",
                "question": "Сколько сыновей у графа Орлова в 'Войне и мире'?",
                "answer": "3 сына",
                "type": "normal"
            },
            {
                "id": "q38",
                "round": 2,
                "category": "Литература",
                "question": "Как зовут главную героиню 'Грозы' Островского?",
                "answer": "Катерина",
                "type": "normal"
            },
            {
                "id": "q39",
                "round": 2,
                "category": "Литература",
                "question": "Кто написал 'Ревизора'?",
                "answer": "Николай Гоголь",
                "type": "normal"
            },
            {
                "id": "q40",
                "round": 2,
                "category": "Литература",
                "question": "Как звали первого деспота в 'Евгении Онегине'?",
                "answer": "Татьяна",
                "type": "normal"
            },
            {
                "id": "q41",
                "round": 2,
                "category": "География",
                "question": "Какая столица Италии?",
                "answer": "Рим",
                "type": "normal"
            },
            {
                "id": "q42",
                "round": 2,
                "category": "География",
                "question": "Какой остров самый большой в мире?",
                "answer": "Гренландия",
                "type": "normal"
            },
            {
                "id": "q43",
                "round": 2,
                "category": "География",
                "question": "Какой город находится в Швейцарии?",
                "answer": "Берн, Цюрих, Женева (на выбор)",
                "type": "normal"
            },
            {
                "id": "q44",
                "round": 2,
                "category": "География",
                "question": "На скольких озерах стоит город Цюрих?",
                "answer": "1 озеро",
                "type": "normal"
            },
            {
                "id": "q45",
                "round": 2,
                "category": "География",
                "question": "Какая самая высокая гора в мире?",
                "answer": "Эверест",
                "type": "normal"
            },
            {
                "id": "q46",
                "round": 2,
                "category": "Спорт",
                "question": "Сколько голов забила Россия на Олимпиаде 1980?",
                "answer": "разные ответы",
                "type": "normal"
            },
            {
                "id": "q47",
                "round": 2,
                "category": "Спорт",
                "question": "В каком виде спорта используется клюшка?",
                "answer": "Хоккей, гольф, крокет",
                "type": "normal"
            },
            {
                "id": "q48",
                "round": 2,
                "category": "Спорт",
                "question": "Сколько раз в день тренируются профессиональные пловцы?",
                "answer": "1-2 раза",
                "type": "normal"
            },
            {
                "id": "q49",
                "round": 2,
                "category": "Спорт",
                "question": "В какой стране ро��ился теннис?",
                "answer": "Франция",
                "type": "normal"
            },
            {
                "id": "q50",
                "round": 2,
                "category": "Спорт",
                "question": "Сколько раундов в боксе?",
                "answer": "3 раунда (или разные в зависимости от типа боя)",
                "type": "normal"
            },
            {
                "id": "q51",
                "round": 3,
                "category": "История",
                "question": "Кто был последним русским императором?",
                "answer": "Николай II",
                "type": "normal"
            },
            {
                "id": "q52",
                "round": 3,
                "category": "История",
                "question": "В каком году началась Первая мировая война?",
                "answer": "1914",
                "type": "normal"
            },
            {
                "id": "q53",
                "round": 3,
                "category": "История",
                "question": "Кто был лидером Германии во время Второй мировой войны?",
                "answer": "Адольф Гитлер",
                "type": "normal"
            },
            {
                "id": "q54",
                "round": 3,
                "category": "История",
                "question": "В каком году произошел распад Югославии?",
                "answer": "1991-1992",
                "type": "normal"
            },
            {
                "id": "q55",
                "round": 3,
                "category": "История",
                "question": "Кто был первым президентом Германии после объединения?",
                "answer": "Гельмут Коль",
                "type": "normal"
            },
            {
                "id": "q56",
                "round": 3,
                "category": "Наука",
                "question": "Сколько групп крови у человека?",
                "answer": "4 группы",
                "type": "normal"
            },
            {
                "id": "q57",
                "round": 3,
                "category": "Наука",
                "question": "Какой процесс происходит в растениях для получения энергии?",
                "answer": "Фотосинтез",
                "type": "normal"
            },
            {
                "id": "q58",
                "round": 3,
                "category": "Наука",
                "question": "Кто открыл пенициллин?",
                "answer": "Александр Флеминг",
                "type": "normal"
            },
            {
                "id": "q59",
                "round": 3,
                "category": "Наука",
                "question": "Какой химический элемент самый тяжелый?",
                "answer": "Уран или Плутоний",
                "type": "normal"
            },
            {
                "id": "q60",
                "round": 3,
                "category": "Наука",
                "question": "Сколько континентов на Земле?",
                "answer": "6 или 7 континентов",
                "type": "normal"
            },
            {
                "id": "q61",
                "round": 3,
                "category": "Литература",
                "question": "Какой век называют 'Золотым веком' русской литературы?",
                "answer": "XIX век",
                "type": "normal"
            },
            {
                "id": "q62",
                "round": 3,
                "category": "Литература",
                "question": "Сколько романов написал Иван Тургенев?",
                "answer": "6 романов",
                "type": "normal"
            },
            {
                "id": "q63",
                "round": 3,
                "category": "Литература",
                "question": "Кто написал 'Горе от ума'?",
                "answer": "Александр Грибоедов",
                "type": "normal"
            },
            {
                "id": "q64",
                "round": 3,
                "category": "Литература",
                "question": "Как зовут главного героя 'Братьев Карамазовых'?",
                "answer": "Разные персонажи (Дмитрий, Иван, Алёша)",
                "type": "normal"
            },
            {
                "id": "q65",
                "round": 3,
                "category": "Литература",
                "question": "Кто автор 'Портрета Дориана Грея'?",
                "answer": "Оскар Уайльд",
                "type": "normal"
            },
            {
                "id": "q66",
                "round": 3,
                "category": "География",
                "question": "Какой канал соединяет Атлантический и Тихий океаны?",
                "answer": "Панамский канал",
                "type": "normal"
            },
            {
                "id": "q67",
                "round": 3,
                "category": "География",
                "question": "Какая столица Бразилии?",
                "answer": "Бразилиа",
                "type": "normal"
            },
            {
                "id": "q68",
                "round": 3,
                "category": "География",
                "question": "На каком материке находится Египет?",
                "answer": "Африка",
                "type": "normal"
            },
            {
                "id": "q69",
                "round": 3,
                "category": "География",
                "question": "Какой город находится на границе Европы и Азии?",
                "answer": "Стамбул",
                "type": "normal"
            },
            {
                "id": "q70",
                "round": 3,
                "category": "География",
                "question": "Какой город самый большой по площади в мире?",
                "answer": "Москва или Нью-Йорк",
                "type": "normal"
            },
            {
                "id": "q71",
                "round": 3,
                "category": "Спорт",
                "question": "В каком году была первая Олимпиада в России?",
                "answer": "2014 (Сочи)",
                "type": "normal"
            },
            {
                "id": "q72",
                "round": 3,
                "category": "Спорт",
                "question": "Сколько фигур в шахматах может быть максимум?",
                "answer": "16 фигур",
                "type": "normal"
            },
            {
                "id": "q73",
                "round": 3,
                "category": "Спорт",
                "question": "Какое расстояние марафон?",
                "answer": "42 км и 195 метров",
                "type": "normal"
            },
            {
                "id": "q74",
                "round": 3,
                "category": "Спорт",
                "question": "В каком году были первые Чемпионаты мира по футболу?",
                "answer": "1930",
                "type": "normal"
            },
            {
                "id": "q75",
                "round": 3,
                "category": "Спорт",
                "question": "Сколько дорожек на стадионе?",
                "answer": "8 дорожек",
                "type": "normal"
            },
            {
                "id": "final1",
                "round": 3,
                "category": "🏆 ФИНАЛ",
                "question": "Какой самый глубокий океан на Земле?",
                "answer": "Тихий океан (максимальная глубина - Марианская впадина, 11034 метра)",
                "type": "final"
            }
        ];
    }

    bootstrap() {

        if (this.players.length === 0) {

            this.addPlayer("Игрок 1");
            this.addPlayer("Игрок 2");

        }

        this.buildRound(this.round);
        this.renderPlayers();
        this.updateRoundDisplay();

    }

    /* ======================================================
       ROUND SYSTEM
    ====================================================== */

    buildRound(round) {

        this.round = round;
        this.state = "round";

        const values = CONFIG.ROUND_VALUES[round];

        const qs = this.questions.filter(q => q.round === round);

        if (qs.length === 0) {
            console.warn(`No questions for round ${round}`);
            alert("Нет вопросов для раунда " + round);
            return;
        }

        const categories = [...new Set(qs.map(q => q.category))]
            .slice(0, CONFIG.CATEGORY_COUNT);

        this.board = categories.map(cat => {

            const cqs = qs.filter(q => q.category === cat);

            const selected = shuffle(cqs).slice(0, values.length);

            return {
                name: cat,
                questions: selected.map((q, i) => ({
                    ...q,
                    price: values[i]
                }))
            };

        });

        this.renderBoard();
        this.updateRoundDisplay();

    }

    /* ======================================================
       BOARD
    ====================================================== */

    renderBoard() {

        const board = $("gameBoard");

        board.innerHTML = "";

        this.board.forEach(col => {

            const el = document.createElement("div");
            el.className = "category";
            el.innerText = col.name;

            board.appendChild(el);

        });

        for (let i = 0; i < 5; i++) {

            this.board.forEach(col => {

                const q = col.questions[i];

                const cell = document.createElement("div");

                cell.className = "question";
                cell.innerText = q.price;

                if (this.used.has(q.id)) {
                    cell.classList.add("used");
                }

                cell.onclick = () => this.openQuestion(q, cell);

                board.appendChild(cell);

            });

        }

    }

    /* ======================================================
       QUESTION FLOW
    ====================================================== */

    openQuestion(q, cell) {

        if (this.lock) return;
        if (this.used.has(q.id)) return;

        this.lock = true;

        this.currentQuestion = q;

        this.used.add(q.id);

        if (cell) cell.classList.add("used");

        $("questionCategory").innerText = q.category;
        $("questionPrice").innerText = q.price;
        $("questionText").innerText = q.question;

        $("questionModal").classList.remove("hidden");

        this.startTimer();

        this.saveState();

    }

    showAnswer() {

        if (!this.currentQuestion) return;

        $("answerText").innerText =
            this.currentQuestion.answer;

        $("answerModal").classList.remove("hidden");

    }

    close() {

        $("questionModal").classList.add("hidden");
        $("answerModal").classList.add("hidden");

        this.stopTimer();

        this.lock = false;

    }

    /* ======================================================
       TIMER
    ====================================================== */

    startTimer() {

        this.stopTimer();

        this.time = CONFIG.TIMER;

        this.updateTimerDisplay();

        this.timer = setInterval(() => {

            this.time--;

            this.updateTimerDisplay();

            if (this.time <= 0) {

                this.showAnswer();
                this.stopTimer();

            }

        }, 1000);

    }

    stopTimer() {
        clearInterval(this.timer);
        this.time = CONFIG.TIMER;
        this.updateTimerDisplay();
    }

    updateTimerDisplay() {
        const timerEl = $("timerDisplay");
        if (timerEl) {
            timerEl.innerText = this.time;
            if (this.time <= 5) {
                timerEl.style.color = "#ff6b6b";
            } else {
                timerEl.style.color = "#4a90e2";
            }
        }
    }

    /* ======================================================
       PLAYERS
    ====================================================== */

    addPlayer(name) {

        this.players.push({
            id: crypto.randomUUID(),
            name,
            score: 0
        });

        this.renderPlayers();
        this.saveState();

    }

    renderPlayers() {

        const box = $("playersList");

        box.innerHTML = "";

        this.players.forEach(p => {

            const el = document.createElement("div");

            el.className = "player";

            el.innerHTML = `
                <span>${p.name}</span>
                <span>${p.score}</span>
            `;

            box.appendChild(el);

        });

    }

    updateRoundDisplay() {
        const roundEl = $("roundDisplay");
        if (roundEl) {
            roundEl.innerText = this.round;
        }
    }

    /* ======================================================
       PLAYER SELECT (CLEAN UI)
    ====================================================== */

    selectPlayer() {

        return new Promise(resolve => {

            const modal = $("playerSelectModal");
            const container = $("playerSelectButtons");

            container.innerHTML = "";

            this.players.forEach(p => {

                const btn = document.createElement("button");

                btn.className = "btn-primary";
                btn.style.width = "100%";
                btn.style.marginBottom = "10px";

                btn.innerText = `${p.name} (${p.score})`;

                btn.onclick = () => {

                    modal.classList.add("hidden");

                    resolve(p);

                };

                container.appendChild(btn);

            });

            modal.classList.remove("hidden");

        });

    }

    /* ======================================================
       SCORE SYSTEM (FINALIZED)
    ====================================================== */

    async correct() {

        const player = await this.selectPlayer();

        player.score += this.currentQuestion.price;

        this.afterAction();

    }

    async wrong() {

        const player = await this.selectPlayer();

        player.score -= this.currentQuestion.price;

        this.afterAction();

    }

    afterAction() {

        this.renderPlayers();

        this.close();

        this.saveState();

    }

    /* ======================================================
       ROUND CONTROL
    ====================================================== */

    nextRound() {

        if (this.round >= 3) {

            this.startFinal();

            return;

        }

        this.buildRound(++this.round);

    }

    startFinal() {

        const final = this.questions.find(q => q.type === "final");

        if (!final) {
            alert("Нет финального вопроса");
            this.resetGame();
            return;
        }

        this.currentQuestion = final;

        $("finalCategory").innerText = final.category;
        $("finalQuestion").innerText = final.question;
        $("finalAnswer").innerText = final.answer;
        $("finalAnswer").classList.add("hidden");

        $("finalModal").classList.remove("hidden");

    }

    resetGame() {

        this.round = 1;
        this.used.clear();
        this.players.forEach(p => p.score = 0);

        this.bootstrap();
        this.saveState();

    }

    /* ======================================================
       UI EVENTS
    ====================================================== */

    bindUIEvents() {

        // Вопрос
        $("showAnswerBtn")?.addEventListener("click", () => this.showAnswer());
        $("closeQuestionBtn")?.addEventListener("click", () => this.close());

        // Ответ
        $("correctBtn")?.addEventListener("click", () => this.correct());
        $("wrongBtn")?.addEventListener("click", () => this.wrong());
        $("closeAnswerBtn")?.addEventListener("click", () => this.afterAction());

        // Финал
        $("showFinalAnswerBtn")?.addEventListener("click", () => {
            $("finalAnswer").classList.remove("hidden");
        });
        $("closeFinalBtn")?.addEventListener("click", () => {
            $("finalModal").classList.add("hidden");
        });

        // Управление
        $("resetBtn")?.addEventListener("click", () => {
            if (confirm("Начать игру заново?")) {
                this.resetGame();
            }
        });

        $("addPlayerBtn")?.addEventListener("click", () => {
            const name = prompt("Имя игрока:", `Игрок ${this.players.length + 1}`);
            if (name) {
                this.addPlayer(name);
            }
        });

        // Горячие клавиши
        document.addEventListener("keydown", (e) => {

            if (e.key === "Enter") this.showAnswer();

            if (e.key === "Escape") {
                this.close();
                $("playerSelectModal").classList.add("hidden");
                $("finalModal").classList.add("hidden");
            }

            if (e.key === "ArrowRight") this.nextRound();

            if (e.key === "ArrowUp") this.correct();

            if (e.key === "ArrowDown") this.wrong();

        });

    }

    /* ======================================================
       SAVE / LOAD (STABLE)
    ====================================================== */

    saveState() {

        localStorage.setItem("svoya_game_v5", JSON.stringify({

            players: this.players,
            round: this.round,
            used: [...this.used]

        }));

    }

    loadState() {

        const data = localStorage.getItem("svoya_game_v5");

        if (!data) return;

        const state = JSON.parse(data);

        this.players = state.players || [];
        this.round = state.round || 1;
        this.used = new Set(state.used || []);

    }

}

/* ==========================================================
   BOOT
========================================================== */

window.engine = new GameEngine();

window.addEventListener("DOMContentLoaded", () => {

    window.engine.init();

});
