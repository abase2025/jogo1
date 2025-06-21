// ===== EDUCATIONAL SYSTEM =====

class EducationalSystem {
    constructor() {
        this.tips = new Map();
        this.glossary = new Map();
        this.achievements = new Map();
        this.facts = [];
        this.currentTip = null;
        this.tipCooldown = 0;
        this.tipInterval = 30000; // 30 seconds between tips
        this.showTips = true;
        
        this.initializeTips();
        this.initializeGlossary();
        this.initializeAchievements();
        this.initializeFacts();
    }
    
    // Initialize educational tips
    initializeTips() {
        this.tips.set('escovacao', {
            title: 'Escovação Correta',
            content: 'Escove os dentes por pelo menos 2 minutos, fazendo movimentos circulares suaves. Não esqueça da língua!',
            trigger: 'weapon_use',
            weapon: 'escova',
            shown: false
        });
        
        this.tips.set('fio_dental', {
            title: 'Importância do Fio Dental',
            content: 'O fio dental remove até 40% mais placa bacteriana que apenas a escovação. Use diariamente!',
            trigger: 'weapon_use',
            weapon: 'fio-dental',
            shown: false
        });
        
        this.tips.set('enxaguante', {
            title: 'Enxaguante Bucal',
            content: 'O enxaguante bucal complementa a higiene, mas nunca substitui a escovação e o fio dental.',
            trigger: 'weapon_use',
            weapon: 'enxaguante',
            shown: false
        });
        
        this.tips.set('fluor', {
            title: 'Benefícios do Flúor',
            content: 'O flúor fortalece o esmalte dentário e ajuda a prevenir cáries. É seguro quando usado corretamente.',
            trigger: 'weapon_use',
            weapon: 'fluor',
            shown: false
        });
        
        this.tips.set('carie_prevencao', {
            title: 'Prevenção de Cáries',
            content: 'Evite açúcar em excesso, escove após as refeições e visite o dentista regularmente.',
            trigger: 'enemy_defeat',
            enemy: 'carie',
            shown: false
        });
        
        this.tips.set('placa_bacteriana', {
            title: 'Placa Bacteriana',
            content: 'A placa bacteriana se forma constantemente. Por isso a higiene diária é fundamental!',
            trigger: 'enemy_defeat',
            enemy: 'placa',
            shown: false
        });
        
        this.tips.set('gengivite', {
            title: 'Gengivite',
            content: 'Gengivas que sangram podem indicar gengivite. Melhore a higiene e procure um dentista.',
            trigger: 'enemy_defeat',
            enemy: 'gengivite',
            shown: false
        });
        
        this.tips.set('alimentacao', {
            title: 'Alimentação Saudável',
            content: 'Frutas, vegetais e laticínios fortalecem os dentes. Evite doces e refrigerantes em excesso.',
            trigger: 'time_based',
            interval: 60000,
            shown: false
        });
        
        this.tips.set('visita_dentista', {
            title: 'Visitas ao Dentista',
            content: 'Visite o dentista a cada 6 meses para prevenção e detecção precoce de problemas.',
            trigger: 'level_up',
            level: 3,
            shown: false
        });
        
        this.tips.set('halitose', {
            title: 'Combate ao Mau Hálito',
            content: 'Escove a língua, use fio dental e mantenha-se hidratado para combater o mau hálito.',
            trigger: 'enemy_defeat',
            enemy: 'halitose',
            shown: false
        });
    }
    
    // Initialize glossary terms
    initializeGlossary() {
        this.glossary.set('carie', {
            term: 'Cárie',
            definition: 'Doença que destrói os tecidos do dente, causada por bactérias que produzem ácidos a partir do açúcar.',
            category: 'doencas',
            relatedTerms: ['placa bacteriana', 'esmalte', 'dentina']
        });
        
        this.glossary.set('placa_bacteriana', {
            term: 'Placa Bacteriana',
            definition: 'Película pegajosa e incolor que se forma constantemente sobre os dentes, composta por bactérias e restos alimentares.',
            category: 'doencas',
            relatedTerms: ['biofilme', 'tártaro', 'gengivite']
        });
        
        this.glossary.set('tartaro', {
            term: 'Tártaro',
            definition: 'Placa bacteriana endurecida que se forma quando a placa não é removida adequadamente.',
            category: 'doencas',
            relatedTerms: ['placa bacteriana', 'cálculo dental', 'profilaxia']
        });
        
        this.glossary.set('gengivite', {
            term: 'Gengivite',
            definition: 'Inflamação da gengiva causada pelo acúmulo de placa bacteriana, caracterizada por vermelhidão e sangramento.',
            category: 'doencas',
            relatedTerms: ['periodontite', 'gengiva', 'inflamação']
        });
        
        this.glossary.set('periodontite', {
            term: 'Periodontite',
            definition: 'Doença mais grave que afeta os tecidos de suporte do dente, podendo levar à perda dentária.',
            category: 'doencas',
            relatedTerms: ['gengivite', 'osso alveolar', 'ligamento periodontal']
        });
        
        this.glossary.set('halitose', {
            term: 'Halitose',
            definition: 'Mau hálito persistente, geralmente causado por problemas bucais, mas pode ter outras origens.',
            category: 'doencas',
            relatedTerms: ['bactérias', 'língua saburrosa', 'xerostomia']
        });
        
        this.glossary.set('fluor', {
            term: 'Flúor',
            definition: 'Mineral que fortalece o esmalte dentário e ajuda na prevenção de cáries.',
            category: 'prevencao',
            relatedTerms: ['remineralização', 'esmalte', 'dentifrício']
        });
        
        this.glossary.set('esmalte', {
            term: 'Esmalte',
            definition: 'Camada mais externa e dura do dente, composta principalmente por hidroxiapatita.',
            category: 'anatomia',
            relatedTerms: ['dentina', 'polpa', 'coroa']
        });
        
        this.glossary.set('dentina', {
            term: 'Dentina',
            definition: 'Tecido que forma a maior parte do dente, localizado abaixo do esmalte.',
            category: 'anatomia',
            relatedTerms: ['esmalte', 'polpa', 'túbulos dentinários']
        });
        
        this.glossary.set('profilaxia', {
            term: 'Profilaxia',
            definition: 'Limpeza profissional realizada pelo dentista para remover placa e tártaro.',
            category: 'tratamento',
            relatedTerms: ['prevenção', 'tártaro', 'polimento']
        });
        
        this.glossary.set('restauracao', {
            term: 'Restauração',
            definition: 'Procedimento para reparar dentes danificados por cárie, trauma ou desgaste.',
            category: 'tratamento',
            relatedTerms: ['obturação', 'resina', 'amálgama']
        });
        
        this.glossary.set('biofilme', {
            term: 'Biofilme',
            definition: 'Comunidade organizada de microrganismos aderidos a uma superfície, como a placa bacteriana.',
            category: 'microbiologia',
            relatedTerms: ['placa bacteriana', 'bactérias', 'matriz extracelular']
        });
    }
    
    // Initialize achievements
    initializeAchievements() {
        this.achievements.set('primeiro_inimigo', {
            id: 'primeiro_inimigo',
            title: 'Primeira Vitória',
            description: 'Derrote seu primeiro inimigo',
            icon: '🎯',
            points: 10,
            unlocked: false,
            condition: { type: 'enemies_defeated', value: 1 }
        });
        
        this.achievements.set('exterminador_caries', {
            id: 'exterminador_caries',
            title: 'Exterminador de Cáries',
            description: 'Derrote 50 cáries',
            icon: '🦷',
            points: 50,
            unlocked: false,
            condition: { type: 'specific_enemy_defeated', enemy: 'carie', value: 50 }
        });
        
        this.achievements.set('mestre_fio_dental', {
            id: 'mestre_fio_dental',
            title: 'Mestre do Fio Dental',
            description: 'Use o fio dental 100 vezes',
            icon: '🧵',
            points: 30,
            unlocked: false,
            condition: { type: 'weapon_used', weapon: 'fio-dental', value: 100 }
        });
        
        this.achievements.set('combo_master', {
            id: 'combo_master',
            title: 'Combo Master',
            description: 'Alcance um combo de 20 ataques',
            icon: '🔥',
            points: 40,
            unlocked: false,
            condition: { type: 'max_combo', value: 20 }
        });
        
        this.achievements.set('sobrevivente', {
            id: 'sobrevivente',
            title: 'Sobrevivente',
            description: 'Sobreviva por 5 minutos',
            icon: '⏰',
            points: 25,
            unlocked: false,
            condition: { type: 'survival_time', value: 300000 }
        });
        
        this.achievements.set('nivel_5', {
            id: 'nivel_5',
            title: 'Dentista Experiente',
            description: 'Alcance o nível 5',
            icon: '⭐',
            points: 35,
            unlocked: false,
            condition: { type: 'level_reached', value: 5 }
        });
        
        this.achievements.set('boss_gengivite', {
            id: 'boss_gengivite',
            title: 'Vencedor da Gengivite',
            description: 'Derrote o chefe Gengivite',
            icon: '👑',
            points: 75,
            unlocked: false,
            condition: { type: 'boss_defeated', boss: 'gengivite' }
        });
        
        this.achievements.set('boss_periodontite', {
            id: 'boss_periodontite',
            title: 'Conquistador da Periodontite',
            description: 'Derrote o chefe final Periodontite',
            icon: '🏆',
            points: 100,
            unlocked: false,
            condition: { type: 'boss_defeated', boss: 'periodontite' }
        });
        
        this.achievements.set('colecionador', {
            id: 'colecionador',
            title: 'Colecionador',
            description: 'Colete 25 power-ups',
            icon: '💎',
            points: 20,
            unlocked: false,
            condition: { type: 'powerups_collected', value: 25 }
        });
        
        this.achievements.set('estudioso', {
            id: 'estudioso',
            title: 'Estudioso da Odontologia',
            description: 'Leia 10 dicas educativas',
            icon: '📚',
            points: 15,
            unlocked: false,
            condition: { type: 'tips_read', value: 10 }
        });
    }
    
    // Initialize educational facts
    initializeFacts() {
        this.facts = [
            'Os dentes são a parte mais dura do corpo humano.',
            'A saliva ajuda a neutralizar ácidos e proteger os dentes.',
            'Cada pessoa tem uma "impressão digital" única dos dentes.',
            'O esmalte dentário não se regenera naturalmente.',
            'Bactérias da boca podem afetar a saúde do coração.',
            'O primeiro dente de leite aparece por volta dos 6 meses.',
            'Adultos têm 32 dentes, incluindo os sisos.',
            'A cárie é a doença crônica mais comum em crianças.',
            'Mascar chiclete sem açúcar pode ajudar a limpar os dentes.',
            'O flúor foi descoberto como preventivo de cáries em 1930.'
        ];
    }
    
    // Show educational tip
    showTip(tipId, force = false) {
        if (!this.showTips && !force) return false;
        
        const tip = this.tips.get(tipId);
        if (!tip || (tip.shown && !force)) return false;
        
        this.currentTip = tip;
        tip.shown = true;
        
        // Update UI
        this.displayTip(tip);
        
        return true;
    }
    
    // Display tip in UI
    displayTip(tip) {
        const tipOverlay = document.getElementById('tip-overlay');
        const tipTitle = document.getElementById('tip-title');
        const tipText = document.getElementById('tip-text');
        
        if (tipOverlay && tipTitle && tipText) {
            tipTitle.textContent = tip.title;
            tipText.textContent = tip.content;
            tipOverlay.classList.remove('hidden');
        }
    }
    
    // Hide current tip
    hideTip() {
        const tipOverlay = document.getElementById('tip-overlay');
        if (tipOverlay) {
            tipOverlay.classList.add('hidden');
        }
        this.currentTip = null;
    }
    
    // Check for tip triggers
    checkTriggers(event, data = {}) {
        for (const [tipId, tip] of this.tips) {
            if (tip.shown) continue;
            
            let shouldShow = false;
            
            switch (tip.trigger) {
                case 'weapon_use':
                    shouldShow = event === 'weapon_use' && data.weapon === tip.weapon;
                    break;
                case 'enemy_defeat':
                    shouldShow = event === 'enemy_defeat' && data.enemy === tip.enemy;
                    break;
                case 'level_up':
                    shouldShow = event === 'level_up' && data.level >= tip.level;
                    break;
                case 'time_based':
                    shouldShow = event === 'time_check' && Date.now() - tip.lastShown > tip.interval;
                    break;
            }
            
            if (shouldShow) {
                this.showTip(tipId);
                break; // Show only one tip at a time
            }
        }
    }
    
    // Get glossary terms
    getGlossaryTerms(category = null) {
        const terms = Array.from(this.glossary.values());
        return category ? terms.filter(term => term.category === category) : terms;
    }
    
    // Search glossary
    searchGlossary(query) {
        const terms = Array.from(this.glossary.values());
        const lowerQuery = query.toLowerCase();
        
        return terms.filter(term => 
            term.term.toLowerCase().includes(lowerQuery) ||
            term.definition.toLowerCase().includes(lowerQuery)
        );
    }
    
    // Check achievement progress
    checkAchievements(stats) {
        const unlockedAchievements = [];
        
        for (const [achievementId, achievement] of this.achievements) {
            if (achievement.unlocked) continue;
            
            let unlocked = false;
            const condition = achievement.condition;
            
            switch (condition.type) {
                case 'enemies_defeated':
                    unlocked = stats.enemiesDefeated >= condition.value;
                    break;
                case 'specific_enemy_defeated':
                    unlocked = (stats.enemyTypes[condition.enemy] || 0) >= condition.value;
                    break;
                case 'weapon_used':
                    unlocked = (stats.weaponUses[condition.weapon] || 0) >= condition.value;
                    break;
                case 'max_combo':
                    unlocked = stats.maxCombo >= condition.value;
                    break;
                case 'survival_time':
                    unlocked = stats.survivalTime >= condition.value;
                    break;
                case 'level_reached':
                    unlocked = stats.level >= condition.value;
                    break;
                case 'boss_defeated':
                    unlocked = stats.bossesDefeated.includes(condition.boss);
                    break;
                case 'powerups_collected':
                    unlocked = stats.powerupsCollected >= condition.value;
                    break;
                case 'tips_read':
                    unlocked = stats.tipsRead >= condition.value;
                    break;
            }
            
            if (unlocked) {
                achievement.unlocked = true;
                unlockedAchievements.push(achievement);
            }
        }
        
        return unlockedAchievements;
    }
    
    // Get random fact
    getRandomFact() {
        return Utils.randomChoice(this.facts);
    }
    
    // Get achievement progress
    getAchievementProgress(achievementId, stats) {
        const achievement = this.achievements.get(achievementId);
        if (!achievement) return 0;
        
        const condition = achievement.condition;
        let current = 0;
        
        switch (condition.type) {
            case 'enemies_defeated':
                current = stats.enemiesDefeated;
                break;
            case 'specific_enemy_defeated':
                current = stats.enemyTypes[condition.enemy] || 0;
                break;
            case 'weapon_used':
                current = stats.weaponUses[condition.weapon] || 0;
                break;
            case 'max_combo':
                current = stats.maxCombo;
                break;
            case 'survival_time':
                current = stats.survivalTime;
                break;
            case 'level_reached':
                current = stats.level;
                break;
            case 'powerups_collected':
                current = stats.powerupsCollected;
                break;
            case 'tips_read':
                current = stats.tipsRead;
                break;
            default:
                return achievement.unlocked ? 100 : 0;
        }
        
        return Math.min(100, (current / condition.value) * 100);
    }
    
    // Update settings
    updateSettings(settings) {
        this.showTips = settings.showTips !== false;
        this.tipInterval = settings.tipInterval || 30000;
    }
    
    // Get educational content for weapon
    getWeaponEducation(weaponName) {
        const weaponSystem = new WeaponSystem();
        return weaponSystem.getEducationalContent(weaponName);
    }
    
    // Export educational data
    exportData() {
        return {
            tips: Array.from(this.tips.entries()),
            glossary: Array.from(this.glossary.entries()),
            achievements: Array.from(this.achievements.entries()),
            facts: this.facts
        };
    }
    
    // Import educational data
    importData(data) {
        if (data.tips) {
            this.tips = new Map(data.tips);
        }
        if (data.glossary) {
            this.glossary = new Map(data.glossary);
        }
        if (data.achievements) {
            this.achievements = new Map(data.achievements);
        }
        if (data.facts) {
            this.facts = data.facts;
        }
    }
}

