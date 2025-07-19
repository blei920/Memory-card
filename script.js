document.addEventListener('DOMContentLoaded', () => {
    const gameBoard = document.getElementById('game-board');
    const livesSpan = document.getElementById('lives');
    const matchesSpan = document.getElementById('matches');
    const modeSpan = document.getElementById('mode');
    
    const messageOverlay = document.getElementById('message-overlay');
    const messageTitle = document.getElementById('message-title');
    const messageText = document.getElementById('message-text');
    const tryAgainBtn = document.getElementById('try-again-btn');

    const emojis = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🦆'];

    let lives, matches, winCondition, totalCards;
    let flippedCards = [];
    let lockBoard = false;
    let currentMode = 'normal';

    const modes = {
        easy: { totalCards: 10, lives: 5, winCondition: 3, gridClass: 'easy-grid' },
        normal: { totalCards: 20, lives: 3, winCondition: 5, gridClass: 'normal-grid' },
        hard: { totalCards: 40, lives: 1, winCondition: 10, gridClass: 'hard-grid' }
    };

    function startGame(mode) {
        currentMode = mode;
        lockBoard = false;

        document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`${mode}-mode`).classList.add('active');

        const config = modes[mode];
        totalCards = config.totalCards;
        lives = config.lives;
        winCondition = config.winCondition;
        matches = 0;
        
        modeSpan.textContent = mode.charAt(0).toUpperCase() + mode.slice(1);
        livesSpan.textContent = lives;
        matchesSpan.textContent = matches;

        gameBoard.className = 'game-board';
        gameBoard.classList.add(config.gridClass);
        
        messageOverlay.classList.remove('show');
        
        createBoard();
    }

    function createBoard() {
        gameBoard.innerHTML = '';
        flippedCards = [];
        const selectedEmojis = emojis.slice(0, totalCards / 2);
        let cardEmojis = [...selectedEmojis, ...selectedEmojis];
        
        // Fisher-Yates shuffle
        for (let i = cardEmojis.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cardEmojis[i], cardEmojis[j]] = [cardEmojis[j], cardEmojis[i]];
        }

        for (let i = 0; i < totalCards; i++) {
            const card = document.createElement('div');
            card.classList.add('card');
            card.dataset.emoji = cardEmojis[i];

            card.innerHTML = `
                <div class="card-face card-front"></div>
                <div class="card-face card-back">${cardEmojis[i]}</div>
            `;
            
            card.addEventListener('click', handleCardClick);
            gameBoard.appendChild(card);
        }
    }

    function handleCardClick() {
        if (lockBoard || this.classList.contains('is-flipped')) return;
        
        this.classList.add('is-flipped');
        flippedCards.push(this);

        if (flippedCards.length === 2) {
            lockBoard = true;
            checkForMatch();
        }
    }

    function checkForMatch() {
        const [card1, card2] = flippedCards;
        const isMatch = card1.dataset.emoji === card2.dataset.emoji;
        isMatch ? handleMatch() : handleMismatch();
    }

    function handleMatch() {
        matches++;
        matchesSpan.textContent = matches;

        flippedCards.forEach(card => {
            card.classList.add('matched');
            card.removeEventListener('click', handleCardClick);
        });

        if (matches === winCondition) {
            setTimeout(() => endGame(true), 500);
        } else {
            resetTurn();
        }
    }

    function handleMismatch() {
        lives--;
        livesSpan.textContent = lives;
        
        setTimeout(() => {
            flippedCards.forEach(card => card.classList.remove('is-flipped'));
            
            if (lives === 0) {
                endGame(false);
            } else {
               resetTurn();
            }
        }, 1200);
    }

    function resetTurn() {
        flippedCards = [];
        lockBoard = false;
    }

    function endGame(isWin) {
        lockBoard = true;
        if (isWin) {
            messageTitle.textContent = 'Congratulations!';
            messageText.textContent = `You've matched ${winCondition} pairs and won!`;
        } else {
            messageTitle.textContent = 'Game Over!';
            messageText.textContent = 'You ran out of lives. Better luck next time!';
        }
        messageOverlay.classList.add('show');
    }

    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const newMode = e.target.id.replace('-mode', '');
            startGame(newMode);
        });
    });

    tryAgainBtn.addEventListener('click', () => {
        startGame(currentMode);
    });

    // Initial game setup
    startGame('normal');
});