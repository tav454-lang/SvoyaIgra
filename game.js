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

        try {
            const res = await fetch("questions.json");
            this.questions = await res.json();
        } catch (e) {
            console.warn("questions.json not loaded, using defaults");
            this.questions = [];
        }

        this.bootstrap();
        this.bindUIEvents();

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
