// ===== ENHANCED EDUCATIONAL SYSTEM =====

class EnhancedEducationalSystem extends EducationalSystem {
    constructor() {
        super();
        this.tutorialData = null;
        this.currentTutorialStep = 0;
        this.tutorialActive = false;
        this.dailyTips = [];
        this.funFacts = [];
        this.contextualTips = new Map();
        
        this.loadEducationalData();
    }
    
    // Load educational data from JSON
    async loadEducationalData() {
        try {
            const response = await fetch('assets/data/educational_data.json');
            const data = await response.json();
            
            this.tutorialData = data.tutorial_steps;
            this.dailyTips = data.daily_tips;
            this.funFacts = data.fun_facts;
            this.contextualTips = new Map(Object.entries(data.tips_by_context));
            this.achievementDescriptions = data.achievement_descriptions;
            this.educationalMoments = data.educational_moments;
            
            console.log('Educational data loaded successfully');
        } catch (error) {
            console.warn('Failed to load educational data:', error);
            this.initializeFallbackData();
        }
    }
    
    // Initialize fallback data if JSON loading fails
    initializeFallbackData() {
        this.dailyTips = [
            "Escove os dentes por pelo menos 2 minutos",
            "Use fio dental diariamente",
            "Visite o dentista a cada 6 meses"
        ];
        
        this.funFacts = [
            "Os dentes são a parte mais dura do corpo humano",
            "A saliva ajuda a proteger os dentes",
            "Cada pessoa tem dentes únicos como impressões digitais"
        ];
    }
    
    // Start tutorial
    startTutorial() {
        if (!this.tutorialData || this.tutorialData.length === 0) {
            console.warn('Tutorial data not available');
            return false;
        }
        
        this.tutorialActive = true;
        this.currentTutorialStep = 0;
        this.showTutorialStep(0);
        return true;
    }
    
    // Show specific tutorial step
    showTutorialStep(stepIndex) {
        if (!this.tutorialData || stepIndex >= this.tutorialData.length) {
            this.completeTutorial();
            return;
        }
        
        const step = this.tutorialData[stepIndex];
        this.currentTutorialStep = stepIndex;
        
        // Update tutorial UI
        this.displayTutorialStep(step);
        
        // Handle step-specific actions
        this.handleTutorialAction(step.action, step);
    }
    
    // Display tutorial step in UI
    displayTutorialStep(step) {
        const tutorialOverlay = document.getElementById('tutorial-overlay');
        const tutorialTitle = document.getElementById('tutorial-title');
        const tutorialContent = document.getElementById('tutorial-content');
        const tutorialImage = document.getElementById('tutorial-image');
        const tutorialNext = document.getElementById('tutorial-next');
        const tutorialSkip = document.getElementById('tutorial-skip');
        
        if (!tutorialOverlay) return;
        
        tutorialOverlay.classList.remove('hidden');
        
        if (tutorialTitle) {
            tutorialTitle.textContent = step.title;
        }
        
        if (tutorialContent) {
            tutorialContent.textContent = step.content;
        }
        
        if (tutorialImage && step.image) {
            tutorialImage.src = step.image;
            tutorialImage.style.display = 'block';
        } else if (tutorialImage) {
            tutorialImage.style.display = 'none';
        }
        
        // Update button text based on step
        if (tutorialNext) {
            if (step.action === 'start_game') {
                tutorialNext.textContent = 'Começar Jogo!';
            } else {
                tutorialNext.textContent = 'Próximo';
            }
        }
        
        // Handle highlighting
        if (step.highlight) {
            this.highlightElement(step.highlight);
        } else {
            this.clearHighlights();
        }
    }
    
    // Handle tutorial actions
    handleTutorialAction(action, step) {
        switch (action) {
            case 'next':
                // Just show next button
                break;
            case 'practice_movement':
                this.showMovementPractice();
                break;
            case 'practice_attack':
                this.showAttackPractice();
                break;
            case 'show_weapons':
                this.highlightWeapons();
                break;
            case 'show_enemies':
                this.showEnemyInfo();
                break;
            case 'show_powerups':
                this.showPowerupInfo();
                break;
            case 'show_tip_example':
                this.showExampleTip();
                break;
            case 'start_game':
                // Will be handled by next button
                break;
        }
    }
    
    // Next tutorial step
    nextTutorialStep() {
        if (!this.tutorialActive) return;
        
        const currentStep = this.tutorialData[this.currentTutorialStep];
        
        if (currentStep && currentStep.action === 'start_game') {
            this.completeTutorial();
            return;
        }
        
        this.showTutorialStep(this.currentTutorialStep + 1);
    }
    
    // Skip tutorial
    skipTutorial() {
        this.completeTutorial();
    }
    
    // Complete tutorial
    completeTutorial() {
        this.tutorialActive = false;
        this.clearHighlights();
        
        const tutorialOverlay = document.getElementById('tutorial-overlay');
        if (tutorialOverlay) {
            tutorialOverlay.classList.add('hidden');
        }
        
        // Mark tutorial as completed
        Utils.saveData('tutorial_completed', true);
        
        // Show completion message
        this.showTutorialCompletionMessage();
    }
    
    // Show tutorial completion message
    showTutorialCompletionMessage() {
        const message = document.createElement('div');
        message.className = 'tutorial-completion';
        message.innerHTML = `
            <div style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(39, 174, 96, 0.95);
                color: white;
                padding: 2rem;
                border-radius: 15px;
                text-align: center;
                z-index: 10000;
                max-width: 400px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            ">
                <h3 style="margin-bottom: 1rem;">🎓 Tutorial Concluído!</h3>
                <p>Agora você está pronto para proteger os dentes e aprender sobre saúde bucal!</p>
                <button onclick="this.parentElement.parentElement.remove()" style="
                    background: white;
                    color: #27AE60;
                    border: none;
                    padding: 0.5rem 1rem;
                    border-radius: 5px;
                    margin-top: 1rem;
                    cursor: pointer;
                    font-weight: bold;
                ">Começar Aventura!</button>
            </div>
        `;
        
        document.body.appendChild(message);
        
        setTimeout(() => {
            if (message.parentNode) {
                message.parentNode.removeChild(message);
            }
        }, 5000);
    }
    
    // Highlight UI elements
    highlightElement(elementType) {
        this.clearHighlights();
        
        let selector;
        switch (elementType) {
            case 'movement':
                // Highlight movement area or instructions
                break;
            case 'attack':
                // Highlight attack area
                break;
            case 'weapons':
                selector = '.weapon-selector';
                break;
            case 'powerups':
                // Highlight powerup area
                break;
            case 'education':
                selector = '.tip-overlay';
                break;
        }
        
        if (selector) {
            const element = document.querySelector(selector);
            if (element) {
                element.classList.add('tutorial-highlight');
            }
        }
    }
    
    // Clear all highlights
    clearHighlights() {
        const highlighted = document.querySelectorAll('.tutorial-highlight');
        highlighted.forEach(el => el.classList.remove('tutorial-highlight'));
    }
    
    // Show contextual tip based on game event
    showContextualTip(context, data = {}) {
        const tipData = this.contextualTips.get(context);
        if (!tipData) return;
        
        // Create contextual tip overlay
        const tipOverlay = document.createElement('div');
        tipOverlay.className = 'contextual-tip';
        tipOverlay.innerHTML = `
            <div style="
                position: fixed;
                top: 20px;
                right: 20px;
                background: rgba(52, 152, 219, 0.95);
                color: white;
                padding: 1rem;
                border-radius: 10px;
                max-width: 300px;
                z-index: 9000;
                animation: slideInRight 0.5s ease-out;
            ">
                <h4 style="margin: 0 0 0.5rem 0;">${tipData.title}</h4>
                <p style="margin: 0 0 0.5rem 0; font-size: 0.9rem;">${tipData.content}</p>
                <small style="color: #ECF0F1; font-style: italic;">${tipData.educational_fact}</small>
                <button onclick="this.parentElement.parentElement.remove()" style="
                    position: absolute;
                    top: 5px;
                    right: 5px;
                    background: none;
                    border: none;
                    color: white;
                    cursor: pointer;
                    font-size: 1.2rem;
                ">×</button>
            </div>
        `;
        
        document.body.appendChild(tipOverlay);
        
        // Auto-remove after 8 seconds
        setTimeout(() => {
            if (tipOverlay.parentNode) {
                tipOverlay.parentNode.removeChild(tipOverlay);
            }
        }, 8000);
        
        // Update statistics
        this.stats.tipsRead = (this.stats.tipsRead || 0) + 1;
    }
    
    // Get daily tip
    getDailyTip() {
        if (this.dailyTips.length === 0) return null;
        
        // Use date to get consistent daily tip
        const today = new Date().toDateString();
        const hash = this.simpleHash(today);
        const index = hash % this.dailyTips.length;
        
        return this.dailyTips[index];
    }
    
    // Get random fun fact
    getRandomFunFact() {
        if (this.funFacts.length === 0) return null;
        return Utils.randomChoice(this.funFacts);
    }
    
    // Simple hash function for consistent daily tips
    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash);
    }
    
    // Show educational moment based on game state
    showEducationalMoment(moment, data = {}) {
        if (!this.educationalMoments || !this.educationalMoments[moment]) return;
        
        const moments = this.educationalMoments[moment];
        const randomMoment = Utils.randomChoice(moments);
        
        this.showFloatingTip(randomMoment);
    }
    
    // Show floating tip
    showFloatingTip(text) {
        const tip = document.createElement('div');
        tip.className = 'floating-tip';
        tip.innerHTML = `
            <div style="
                position: fixed;
                bottom: 100px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(46, 204, 113, 0.9);
                color: white;
                padding: 0.8rem 1.5rem;
                border-radius: 25px;
                font-size: 0.9rem;
                z-index: 8000;
                animation: fadeInUp 0.5s ease-out, fadeOut 0.5s ease-out 3s forwards;
                max-width: 80%;
                text-align: center;
            ">${text}</div>
        `;
        
        document.body.appendChild(tip);
        
        setTimeout(() => {
            if (tip.parentNode) {
                tip.parentNode.removeChild(tip);
            }
        }, 4000);
    }
    
    // Enhanced achievement system
    showAchievementWithEducation(achievement) {
        const description = this.achievementDescriptions[achievement.id] || achievement.description;
        
        const notification = document.createElement('div');
        notification.className = 'educational-achievement';
        notification.innerHTML = `
            <div style="
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, #f39c12, #e67e22);
                color: white;
                padding: 1.5rem;
                border-radius: 15px;
                max-width: 350px;
                z-index: 10000;
                animation: slideInRight 0.5s ease-out, fadeOut 0.5s ease-out 6s forwards;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            ">
                <div style="text-align: center; margin-bottom: 1rem;">
                    <div style="font-size: 3rem; margin-bottom: 0.5rem;">${achievement.icon}</div>
                    <h3 style="margin: 0; font-size: 1.2rem;">Conquista Desbloqueada!</h3>
                    <h4 style="margin: 0.5rem 0; color: #f1c40f;">${achievement.title}</h4>
                </div>
                <p style="margin: 0; font-size: 0.9rem; line-height: 1.4;">${description}</p>
                <div style="text-align: center; margin-top: 1rem;">
                    <span style="background: rgba(255,255,255,0.2); padding: 0.3rem 0.8rem; border-radius: 15px; font-size: 0.8rem;">
                        +${achievement.points} pontos
                    </span>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        Utils.playSound('achievement', 0.5);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 7000);
    }
    
    // Check if tutorial should be shown
    shouldShowTutorial() {
        return !Utils.loadData('tutorial_completed');
    }
    
    // Get progress statistics for educational content
    getEducationalProgress() {
        return {
            tutorialCompleted: Utils.loadData('tutorial_completed') || false,
            tipsRead: this.stats.tipsRead || 0,
            achievementsUnlocked: Array.from(this.achievements.values()).filter(a => a.unlocked).length,
            totalAchievements: this.achievements.size,
            glossaryTermsViewed: this.stats.glossaryViews || 0
        };
    }
    
    // Export enhanced educational data
    exportEnhancedData() {
        const baseData = this.exportData();
        return {
            ...baseData,
            tutorialCompleted: Utils.loadData('tutorial_completed'),
            educationalProgress: this.getEducationalProgress()
        };
    }
}

// Add CSS for tutorial and educational elements
const educationalStyles = document.createElement('style');
educationalStyles.textContent = `
    .tutorial-highlight {
        position: relative;
        z-index: 9999;
    }
    
    .tutorial-highlight::before {
        content: '';
        position: absolute;
        top: -5px;
        left: -5px;
        right: -5px;
        bottom: -5px;
        border: 3px solid #f39c12;
        border-radius: 10px;
        animation: pulse 2s infinite;
        pointer-events: none;
    }
    
    @keyframes pulse {
        0% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.7; transform: scale(1.05); }
        100% { opacity: 1; transform: scale(1); }
    }
    
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes fadeInUp {
        from { transform: translate(-50%, 20px); opacity: 0; }
        to { transform: translate(-50%, 0); opacity: 1; }
    }
    
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
    
    .contextual-tip, .educational-achievement, .floating-tip {
        pointer-events: auto;
    }
    
    .contextual-tip button:hover,
    .educational-achievement button:hover {
        background: rgba(255,255,255,0.2) !important;
    }
`;

document.head.appendChild(educationalStyles);

