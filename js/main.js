// ===== MAIN APPLICATION ENTRY POINT =====

// Global game instance
let game = null;

// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', function() {
    console.log('🦷 A Aventura do Sorriso Saudável - Iniciando...');
    
    // Initialize game
    initializeGame();
    
    // Setup UI event listeners
    setupUIEventListeners();
    
    // Setup educational content
    setupEducationalContent();
    
    // Setup settings
    setupSettings();
});

// Initialize game
function initializeGame() {
    try {
        game = new Game();
        console.log('✅ Jogo inicializado com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao inicializar o jogo:', error);
        showErrorMessage('Erro ao carregar o jogo. Verifique sua conexão e recarregue a página.');
    }
}

// Setup UI event listeners
function setupUIEventListeners() {
    // Main menu buttons
    const startGameBtn = document.getElementById('start-game-btn');
    const tutorialBtn = document.getElementById('tutorial-btn');
    const glossaryBtn = document.getElementById('glossary-btn');
    const achievementsBtn = document.getElementById('achievements-btn');
    const settingsBtn = document.getElementById('settings-btn');
    
    if (startGameBtn) {
        startGameBtn.addEventListener('click', () => {
            if (game) {
                game.startNewGame();
            }
        });
    }
    
    if (tutorialBtn) {
        tutorialBtn.addEventListener('click', showTutorial);
    }
    
    if (glossaryBtn) {
        glossaryBtn.addEventListener('click', showGlossary);
    }
    
    if (achievementsBtn) {
        achievementsBtn.addEventListener('click', showAchievements);
    }
    
    if (settingsBtn) {
        settingsBtn.addEventListener('click', showSettings);
    }
    
    // Back buttons
    const backButtons = document.querySelectorAll('.back-btn');
    backButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            if (game) {
                game.showMainMenu();
            }
        });
    });
    
    // Game control buttons
    const pauseBtn = document.getElementById('pause-btn');
    const menuBtn = document.getElementById('menu-btn');
    
    if (pauseBtn) {
        pauseBtn.addEventListener('click', () => {
            if (game) {
                game.pauseGame();
            }
        });
    }
    
    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            if (game && confirm('Deseja realmente voltar ao menu? O progresso atual será perdido.')) {
                game.returnToMenu();
            }
        });
    }
    
    // Pause screen buttons
    const resumeBtn = document.getElementById('resume-game');
    const pauseSettingsBtn = document.getElementById('pause-settings');
    const pauseMenuBtn = document.getElementById('pause-menu');
    
    if (resumeBtn) {
        resumeBtn.addEventListener('click', () => {
            if (game) {
                game.resumeGame();
            }
        });
    }
    
    if (pauseSettingsBtn) {
        pauseSettingsBtn.addEventListener('click', showSettings);
    }
    
    if (pauseMenuBtn) {
        pauseMenuBtn.addEventListener('click', () => {
            if (game && confirm('Deseja realmente voltar ao menu? O progresso atual será perdido.')) {
                game.returnToMenu();
            }
        });
    }
    
    // Game over buttons
    const restartBtn = document.getElementById('restart-game');
    const gameOverMenuBtn = document.getElementById('game-over-menu');
    
    if (restartBtn) {
        restartBtn.addEventListener('click', () => {
            if (game) {
                game.restartGame();
            }
        });
    }
    
    if (gameOverMenuBtn) {
        gameOverMenuBtn.addEventListener('click', () => {
            if (game) {
                game.returnToMenu();
            }
        });
    }
    
    // Victory screen buttons
    const nextLevelBtn = document.getElementById('next-level');
    const victoryMenuBtn = document.getElementById('victory-menu');
    
    if (nextLevelBtn) {
        nextLevelBtn.addEventListener('click', () => {
            if (game) {
                game.startNewGame(); // Start new game with increased difficulty
            }
        });
    }
    
    if (victoryMenuBtn) {
        victoryMenuBtn.addEventListener('click', () => {
            if (game) {
                game.returnToMenu();
            }
        });
    }
    
    // Weapon selector
    const weaponSlots = document.querySelectorAll('.weapon-slot');
    weaponSlots.forEach(slot => {
        slot.addEventListener('click', () => {
            if (game && game.hero) {
                const weaponName = slot.dataset.weapon;
                if (game.hero.switchWeapon(weaponName)) {
                    game.updateWeaponSelector();
                }
            }
        });
    });
    
    // Educational tip close button
    const tipCloseBtn = document.getElementById('tip-close');
    if (tipCloseBtn) {
        tipCloseBtn.addEventListener('click', () => {
            if (game && game.educationalSystem) {
                game.educationalSystem.hideTip();
                game.stats.tipsRead++;
            }
        });
    }
}

// Setup educational content
function setupEducationalContent() {
    // Glossary search
    const glossarySearchInput = document.getElementById('glossary-search-input');
    if (glossarySearchInput) {
        glossarySearchInput.addEventListener('input', (e) => {
            filterGlossary(e.target.value);
        });
    }
}

// Setup settings
function setupSettings() {
    // Volume sliders
    const musicSlider = document.getElementById('volume-music');
    const effectsSlider = document.getElementById('volume-effects');
    
    if (musicSlider) {
        musicSlider.addEventListener('input', (e) => {
            const value = e.target.value / 100;
            if (game) {
                game.settings.musicVolume = value;
                game.saveSettings();
            }
            document.getElementById('volume-music-value').textContent = e.target.value + '%';
        });
    }
    
    if (effectsSlider) {
        effectsSlider.addEventListener('input', (e) => {
            const value = e.target.value / 100;
            if (game) {
                game.settings.effectsVolume = value;
                game.saveSettings();
            }
            document.getElementById('volume-effects-value').textContent = e.target.value + '%';
        });
    }
    
    // Difficulty select
    const difficultySelect = document.getElementById('difficulty');
    if (difficultySelect) {
        difficultySelect.addEventListener('change', (e) => {
            if (game) {
                game.settings.difficulty = e.target.value;
                game.saveSettings();
            }
        });
    }
    
    // Checkboxes
    const showTipsCheckbox = document.getElementById('show-tips');
    const autoSaveCheckbox = document.getElementById('auto-save');
    
    if (showTipsCheckbox) {
        showTipsCheckbox.addEventListener('change', (e) => {
            if (game) {
                game.settings.showTips = e.target.checked;
                game.saveSettings();
                game.educationalSystem.updateSettings(game.settings);
            }
        });
    }
    
    if (autoSaveCheckbox) {
        autoSaveCheckbox.addEventListener('change', (e) => {
            if (game) {
                game.settings.autoSave = e.target.checked;
                game.saveSettings();
            }
        });
    }
    
    // Reset progress button
    const resetProgressBtn = document.getElementById('reset-progress');
    if (resetProgressBtn) {
        resetProgressBtn.addEventListener('click', () => {
            if (game) {
                game.resetProgress();
            }
        });
    }
}

// Show tutorial
function showTutorial() {
    if (!game) return;
    
    game.hideAllScreens();
    const tutorialScreen = document.getElementById('tutorial-screen');
    if (tutorialScreen) {
        tutorialScreen.classList.add('active');
    }
}

// Show glossary
function showGlossary() {
    if (!game) return;
    
    game.hideAllScreens();
    const glossaryScreen = document.getElementById('glossary-screen');
    if (glossaryScreen) {
        glossaryScreen.classList.add('active');
        loadGlossaryContent();
    }
}

// Load glossary content
function loadGlossaryContent() {
    if (!game || !game.educationalSystem) return;
    
    const glossaryContent = document.getElementById('glossary-content');
    if (!glossaryContent) return;
    
    const terms = game.educationalSystem.getGlossaryTerms();
    
    glossaryContent.innerHTML = '';
    
    terms.forEach(term => {
        const termElement = document.createElement('div');
        termElement.className = 'glossary-term';
        termElement.innerHTML = `
            <h4>${term.term}</h4>
            <p>${term.definition}</p>
            ${term.relatedTerms ? `<small><strong>Termos relacionados:</strong> ${term.relatedTerms.join(', ')}</small>` : ''}
        `;
        glossaryContent.appendChild(termElement);
    });
}

// Filter glossary
function filterGlossary(query) {
    if (!game || !game.educationalSystem) return;
    
    const glossaryContent = document.getElementById('glossary-content');
    if (!glossaryContent) return;
    
    if (!query.trim()) {
        loadGlossaryContent();
        return;
    }
    
    const filteredTerms = game.educationalSystem.searchGlossary(query);
    
    glossaryContent.innerHTML = '';
    
    if (filteredTerms.length === 0) {
        glossaryContent.innerHTML = '<p style="text-align: center; color: #7F8C8D;">Nenhum termo encontrado.</p>';
        return;
    }
    
    filteredTerms.forEach(term => {
        const termElement = document.createElement('div');
        termElement.className = 'glossary-term';
        termElement.innerHTML = `
            <h4>${term.term}</h4>
            <p>${term.definition}</p>
            ${term.relatedTerms ? `<small><strong>Termos relacionados:</strong> ${term.relatedTerms.join(', ')}</small>` : ''}
        `;
        glossaryContent.appendChild(termElement);
    });
}

// Show achievements
function showAchievements() {
    if (!game) return;
    
    game.hideAllScreens();
    const achievementsScreen = document.getElementById('achievements-screen');
    if (achievementsScreen) {
        achievementsScreen.classList.add('active');
        loadAchievementsContent();
    }
}

// Load achievements content
function loadAchievementsContent() {
    if (!game || !game.educationalSystem) return;
    
    const achievementsGrid = document.getElementById('achievements-grid');
    if (!achievementsGrid) return;
    
    const achievements = Array.from(game.educationalSystem.achievements.values());
    
    achievementsGrid.innerHTML = '';
    
    achievements.forEach(achievement => {
        const progress = game.educationalSystem.getAchievementProgress(achievement.id, game.stats);
        
        const achievementElement = document.createElement('div');
        achievementElement.className = `achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`;
        achievementElement.innerHTML = `
            <div class="achievement-icon">${achievement.unlocked ? achievement.icon : '🔒'}</div>
            <div class="achievement-title">${achievement.title}</div>
            <div class="achievement-description">${achievement.description}</div>
            <div class="achievement-progress">
                <div style="background: rgba(0,0,0,0.2); height: 4px; border-radius: 2px; margin-top: 8px;">
                    <div style="background: #27AE60; height: 100%; width: ${progress}%; border-radius: 2px; transition: width 0.3s ease;"></div>
                </div>
                <small>${Math.round(progress)}% completo</small>
            </div>
            ${achievement.unlocked ? `<div class="achievement-points">+${achievement.points} pontos</div>` : ''}
        `;
        achievementsGrid.appendChild(achievementElement);
    });
}

// Show settings
function showSettings() {
    if (!game) return;
    
    game.hideAllScreens();
    const settingsScreen = document.getElementById('settings-screen');
    if (settingsScreen) {
        settingsScreen.classList.add('active');
    }
}

// Show error message
function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(231, 76, 60, 0.95);
        color: white;
        padding: 2rem;
        border-radius: 15px;
        font-size: 1.2rem;
        text-align: center;
        z-index: 10000;
        max-width: 400px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    `;
    errorDiv.innerHTML = `
        <h3 style="margin-bottom: 1rem;">⚠️ Erro</h3>
        <p>${message}</p>
        <button onclick="this.parentElement.remove()" style="
            background: white;
            color: #E74C3C;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 5px;
            margin-top: 1rem;
            cursor: pointer;
            font-weight: bold;
        ">OK</button>
    `;
    
    document.body.appendChild(errorDiv);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.parentNode.removeChild(errorDiv);
        }
    }, 10000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInOut {
        0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
        20% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
        80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        100% { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
    }
    
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
    
    .wave-notification,
    .wave-completed-notification,
    .achievement-notification {
        pointer-events: none;
    }
    
    .achievement-points {
        color: #F39C12;
        font-weight: bold;
        font-size: 0.9rem;
        margin-top: 0.5rem;
    }
    
    .achievement-progress {
        margin-top: 0.5rem;
    }
    
    .achievement-progress small {
        display: block;
        text-align: center;
        margin-top: 4px;
        color: #7F8C8D;
    }
`;
document.head.appendChild(style);

// Service Worker registration (for offline support)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Handle page visibility change (pause game when tab is not active)
document.addEventListener('visibilitychange', () => {
    if (game && game.gameState === 'playing') {
        if (document.hidden) {
            game.pauseGame();
        }
    }
});

// Handle beforeunload (warn user about losing progress)
window.addEventListener('beforeunload', (e) => {
    if (game && game.gameState === 'playing') {
        e.preventDefault();
        e.returnValue = 'Você tem um jogo em andamento. Tem certeza que deseja sair?';
        return e.returnValue;
    }
});

// Global error handler
window.addEventListener('error', (e) => {
    console.error('Erro global capturado:', e.error);
    showErrorMessage('Ocorreu um erro inesperado. O jogo pode não funcionar corretamente.');
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (e) => {
    console.error('Promise rejeitada:', e.reason);
    e.preventDefault();
});

// Export game instance for debugging
window.game = game;

console.log('🎮 Sistema de jogo carregado com sucesso!');
console.log('📚 Sistema educacional ativo!');
console.log('🦷 Bem-vindo à Aventura do Sorriso Saudável!');

