// ===== MAIN GAME CLASS =====

class Game {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.gameState = 'loading'; // loading, menu, playing, paused, gameover, victory
        this.lastTime = 0;
        this.deltaTime = 0;
        this.fps = 0;
        this.frameCount = 0;
        this.lastFpsUpdate = 0;
        
        // Game objects
        this.hero = null;
        this.enemies = [];
        this.projectiles = [];
        this.powerups = [];
        this.particles = [];
        
        // Game systems
        this.weaponSystem = new WeaponSystem();
        this.educationalSystem = new EnhancedEducationalSystem();
        
        // Game state
        this.score = 0;
        this.level = 1;
        this.wave = 1;
        this.enemiesInWave = 0;
        this.enemiesKilled = 0;
        this.gameTime = 0;
        this.waveStartTime = 0;
        this.nextWaveDelay = 5000;
        
        // Input handling
        this.keys = new Set();
        this.mouse = { x: 0, y: 0, pressed: false };
        this.touch = { x: 0, y: 0, active: false };
        
        // Game settings
        this.settings = {
            musicVolume: 0.7,
            effectsVolume: 0.8,
            difficulty: 'normal',
            showTips: true,
            autoSave: true
        };
        
        // Statistics
        this.stats = {
            enemiesDefeated: 0,
            enemyTypes: {},
            weaponUses: {},
            maxCombo: 0,
            survivalTime: 0,
            level: 1,
            bossesDefeated: [],
            powerupsCollected: 0,
            tipsRead: 0,
            gamesPlayed: 0,
            totalScore: 0
        };
        
        // Wave configuration
        this.waveConfig = {
            1: { enemies: 5, types: ['carie'], duration: 30000 },
            2: { enemies: 8, types: ['carie', 'placa'], duration: 45000 },
            3: { enemies: 10, types: ['carie', 'placa'], duration: 60000, boss: 'gengivite' },
            4: { enemies: 12, types: ['carie', 'placa', 'tartaro'], duration: 75000 },
            5: { enemies: 15, types: ['carie', 'placa', 'tartaro', 'halitose'], duration: 90000 },
            6: { enemies: 20, types: ['carie', 'placa', 'tartaro', 'halitose'], duration: 120000, boss: 'periodontite' }
        };
        
        // Initialize game
        this.init();
    }
    
    // Initialize game
    async init() {
        try {
            this.setupCanvas();
            this.setupEventListeners();
            await this.loadAssets();
            this.loadSettings();
            this.loadStats();
            
            this.gameState = 'menu';
            this.hideLoadingScreen();
            this.showMainMenu();
            
            // Start game loop
            this.gameLoop();
            
        } catch (error) {
            console.error('Failed to initialize game:', error);
            this.showError('Falha ao carregar o jogo. Recarregue a página.');
        }
    }
    
    // Setup canvas
    setupCanvas() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        if (!this.canvas || !this.ctx) {
            throw new Error('Canvas not found or context not supported');
        }
        
        // Set canvas size
        this.resizeCanvas();
        
        // Setup canvas properties
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';
    }
    
    // Resize canvas
    resizeCanvas() {
        const container = this.canvas.parentElement;
        const rect = container.getBoundingClientRect();
        
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        
        // Update canvas style
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
    }
    
    // Setup event listeners
    setupEventListeners() {
        // Keyboard events
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        // Mouse events
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        
        // Touch events
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e));
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        
        // Window events
        window.addEventListener('resize', () => this.resizeCanvas());
        window.addEventListener('blur', () => this.pauseGame());
        
        // Prevent context menu on canvas
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    
    // Load game assets
    async loadAssets() {
        const loadingProgress = document.getElementById('loading-progress');
        const loadingText = document.getElementById('loading-text');
        
        const assets = [
            'assets/images/characters/dr_sorriso.png',
            'assets/images/enemies/carie.png',
            'assets/images/weapons/escova.png',
            'assets/sounds/music/theme.mp3'
        ];
        
        let loaded = 0;
        const total = assets.length;
        
        for (const asset of assets) {
            try {
                if (asset.endsWith('.png') || asset.endsWith('.jpg')) {
                    await Utils.preloadImage(asset);
                } else if (asset.endsWith('.mp3')) {
                    // Preload audio (optional, may fail on some browsers)
                    const audio = new Audio(asset);
                    audio.preload = 'auto';
                }
                
                loaded++;
                const progress = (loaded / total) * 100;
                
                if (loadingProgress) {
                    loadingProgress.style.width = progress + '%';
                }
                if (loadingText) {
                    loadingText.textContent = `Carregando... ${Math.round(progress)}%`;
                }
                
            } catch (error) {
                console.warn('Failed to load asset:', asset, error);
                loaded++; // Continue even if asset fails to load
            }
        }
    }
    
    // Load settings from localStorage
    loadSettings() {
        const savedSettings = Utils.loadData('game_settings');
        if (savedSettings) {
            this.settings = { ...this.settings, ...savedSettings };
        }
        
        // Apply settings to UI
        this.applySettings();
    }
    
    // Load statistics from localStorage
    loadStats() {
        const savedStats = Utils.loadData('game_stats');
        if (savedStats) {
            this.stats = { ...this.stats, ...savedStats };
        }
    }
    
    // Save settings to localStorage
    saveSettings() {
        Utils.saveData('game_settings', this.settings);
    }
    
    // Save statistics to localStorage
    saveStats() {
        Utils.saveData('game_stats', this.stats);
    }
    
    // Apply settings
    applySettings() {
        // Update educational system
        this.educationalSystem.updateSettings(this.settings);
        
        // Update UI elements
        const musicSlider = document.getElementById('volume-music');
        const effectsSlider = document.getElementById('volume-effects');
        const difficultySelect = document.getElementById('difficulty');
        const showTipsCheckbox = document.getElementById('show-tips');
        const autoSaveCheckbox = document.getElementById('auto-save');
        
        if (musicSlider) {
            musicSlider.value = this.settings.musicVolume * 100;
            document.getElementById('volume-music-value').textContent = Math.round(this.settings.musicVolume * 100) + '%';
        }
        
        if (effectsSlider) {
            effectsSlider.value = this.settings.effectsVolume * 100;
            document.getElementById('volume-effects-value').textContent = Math.round(this.settings.effectsVolume * 100) + '%';
        }
        
        if (difficultySelect) {
            difficultySelect.value = this.settings.difficulty;
        }
        
        if (showTipsCheckbox) {
            showTipsCheckbox.checked = this.settings.showTips;
        }
        
        if (autoSaveCheckbox) {
            autoSaveCheckbox.checked = this.settings.autoSave;
        }
    }
    
    // Start new game
    startNewGame() {
        this.gameState = 'playing';
        this.score = 0;
        this.level = 1;
        this.wave = 1;
        this.enemiesKilled = 0;
        this.gameTime = 0;
        
        // Reset arrays
        this.enemies = [];
        this.projectiles = [];
        this.powerups = [];
        this.particles = [];
        
        // Create hero
        this.hero = new Hero(this.canvas.width / 2, this.canvas.height / 2);
        
        // Start first wave
        this.startWave(1);
        
        // Update UI
        this.updateHUD();
        this.showGameScreen();
        
        // Update stats
        this.stats.gamesPlayed++;
        
        // Play background music
        this.playBackgroundMusic();
    }
    
    // Start wave
    startWave(waveNumber) {
        this.wave = waveNumber;
        this.waveStartTime = Date.now();
        this.enemiesInWave = 0;
        
        const config = this.waveConfig[waveNumber] || this.waveConfig[6];
        
        // Spawn regular enemies
        this.spawnEnemies(config.enemies, config.types);
        
        // Spawn boss if configured
        if (config.boss) {
            setTimeout(() => {
                this.spawnBoss(config.boss);
            }, config.duration * 0.7); // Spawn boss at 70% of wave duration
        }
        
        // Show wave notification
        this.showWaveNotification(waveNumber);
    }
    
    // Spawn enemies
    spawnEnemies(count, types) {
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                if (this.gameState !== 'playing') return;
                
                const enemyType = Utils.randomChoice(types);
                const enemy = this.createEnemy(enemyType);
                if (enemy) {
                    this.enemies.push(enemy);
                    this.enemiesInWave++;
                }
            }, i * 1000); // Spawn one enemy per second
        }
    }
    
    // Create enemy
    createEnemy(type) {
        // Spawn at random edge of screen
        const side = Utils.randomInt(0, 3); // 0=top, 1=right, 2=bottom, 3=left
        let x, y;
        
        switch (side) {
            case 0: // top
                x = Utils.random(0, this.canvas.width);
                y = -50;
                break;
            case 1: // right
                x = this.canvas.width + 50;
                y = Utils.random(0, this.canvas.height);
                break;
            case 2: // bottom
                x = Utils.random(0, this.canvas.width);
                y = this.canvas.height + 50;
                break;
            case 3: // left
                x = -50;
                y = Utils.random(0, this.canvas.height);
                break;
        }
        
        // Create enemy based on type
        switch (type) {
            case 'carie':
                return new Carie(x, y);
            case 'placa':
                return new PlacaBacteriana(x, y);
            case 'tartaro':
                return new Tartaro(x, y);
            case 'halitose':
                return new Halitose(x, y);
            default:
                return new Carie(x, y);
        }
    }
    
    // Spawn boss
    spawnBoss(type) {
        const x = this.canvas.width / 2;
        const y = this.canvas.height / 2;
        
        let boss;
        switch (type) {
            case 'gengivite':
                boss = new Gengivite(x, y);
                break;
            case 'periodontite':
                boss = new Periodontite(x, y);
                break;
            default:
                boss = new Gengivite(x, y);
        }
        
        this.enemies.push(boss);
        this.showBossHealthBar(boss);
        
        // Play boss music
        Utils.playSound('boss_appear', 0.6);
    }
    
    // Game loop
    gameLoop(currentTime = 0) {
        // Calculate delta time
        this.deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        // Calculate FPS
        this.frameCount++;
        if (currentTime - this.lastFpsUpdate > 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastFpsUpdate = currentTime;
        }
        
        // Update game
        if (this.gameState === 'playing') {
            this.update(this.deltaTime);
        }
        
        // Render game
        this.render();
        
        // Continue loop
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    // Update game
    update(deltaTime) {
        // Update game time
        this.gameTime += deltaTime;
        this.stats.survivalTime = this.gameTime;
        
        // Update hero
        if (this.hero && this.hero.alive) {
            this.updateHeroMovement(deltaTime);
            this.hero.update(deltaTime);
            
            // Check hero effects
            this.updateHeroEffects(deltaTime);
        }
        
        // Update enemies
        this.updateEnemies(deltaTime);
        
        // Update projectiles
        this.updateProjectiles(deltaTime);
        
        // Update powerups
        this.updatePowerups(deltaTime);
        
        // Update particles
        this.updateParticles(deltaTime);
        
        // Check collisions
        this.checkCollisions();
        
        // Check wave completion
        this.checkWaveCompletion();
        
        // Check game over
        this.checkGameOver();
        
        // Update HUD
        this.updateHUD();
        
        // Auto-save
        if (this.settings.autoSave && Math.floor(this.gameTime / 10000) > Math.floor((this.gameTime - deltaTime) / 10000)) {
            this.saveStats();
        }
        
        // Check educational triggers
        this.educationalSystem.checkTriggers('time_check');
    }
    
    // Update hero movement
    updateHeroMovement(deltaTime) {
        if (!this.hero || !this.hero.alive) return;
        
        let dx = 0, dy = 0;
        
        // Keyboard movement
        if (this.keys.has('ArrowLeft') || this.keys.has('KeyA')) dx -= 1;
        if (this.keys.has('ArrowRight') || this.keys.has('KeyD')) dx += 1;
        if (this.keys.has('ArrowUp') || this.keys.has('KeyW')) dy -= 1;
        if (this.keys.has('ArrowDown') || this.keys.has('KeyS')) dy += 1;
        
        // Normalize diagonal movement
        if (dx !== 0 && dy !== 0) {
            dx *= 0.707;
            dy *= 0.707;
        }
        
        // Apply movement
        if (dx !== 0 || dy !== 0) {
            this.hero.move(dx * (deltaTime / 16.67), dy * (deltaTime / 16.67));
            
            // Keep hero within bounds
            this.hero.x = Utils.clamp(this.hero.x, this.hero.radius, this.canvas.width - this.hero.radius);
            this.hero.y = Utils.clamp(this.hero.y, this.hero.radius, this.canvas.height - this.hero.radius);
        }
    }
    
    // Update hero effects
    updateHeroEffects(deltaTime) {
        if (!this.hero) return;
        
        // Handle bleeding effect
        if (this.hero.hasEffect('bleeding')) {
            const effect = this.hero.effects.get('bleeding');
            const now = Date.now();
            
            if (now - effect.lastTick > 1000) {
                this.hero.takeDamage(effect.damagePerSecond);
                effect.lastTick = now;
            }
        }
        
        // Handle slow effect
        if (this.hero.hasEffect('slow')) {
            const effect = this.hero.effects.get('slow');
            this.hero.speed = this.hero.speed * effect.speedMultiplier;
        }
    }
    
    // Update enemies
    updateEnemies(deltaTime) {
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            
            if (!enemy.alive) {
                this.enemies.splice(i, 1);
                continue;
            }
            
            enemy.update(deltaTime, this.hero, this.enemies);
            
            // Handle special enemy behaviors
            if (enemy instanceof PlacaBacteriana) {
                const newPlaca = enemy.trySpread(this.enemies);
                if (newPlaca) {
                    this.enemies.push(newPlaca);
                }
            }
            
            if (enemy instanceof Periodontite) {
                const minions = enemy.summonMinions();
                if (minions && minions.length > 0) {
                    this.enemies.push(...minions);
                }
            }
        }
    }
    
    // Update projectiles
    updateProjectiles(deltaTime) {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            
            if (!projectile.alive) {
                this.projectiles.splice(i, 1);
                continue;
            }
            
            projectile.update(deltaTime);
            
            // Check if projectile is out of bounds
            if (projectile.x < -50 || projectile.x > this.canvas.width + 50 ||
                projectile.y < -50 || projectile.y > this.canvas.height + 50) {
                projectile.alive = false;
            }
        }
    }
    
    // Update powerups
    updatePowerups(deltaTime) {
        for (let i = this.powerups.length - 1; i >= 0; i--) {
            const powerup = this.powerups[i];
            
            if (!powerup.alive) {
                this.powerups.splice(i, 1);
                continue;
            }
            
            powerup.update(deltaTime);
        }
    }
    
    // Update particles
    updateParticles(deltaTime) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            particle.life -= deltaTime;
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
                continue;
            }
            
            // Update particle position
            particle.x += particle.vx * (deltaTime / 16.67);
            particle.y += particle.vy * (deltaTime / 16.67);
            particle.vy += 0.1; // Gravity
        }
    }
    
    // Check collisions
    checkCollisions() {
        if (!this.hero || !this.hero.alive) return;
        
        // Projectile vs Enemy collisions
        for (const projectile of this.projectiles) {
            if (!projectile.alive) continue;
            
            for (const enemy of this.enemies) {
                if (!enemy.alive) continue;
                
                if (projectile.checkCollision(enemy)) {
                    if (projectile.hit(enemy)) {
                        // Enemy defeated
                        if (!enemy.alive) {
                            this.onEnemyDefeated(enemy);
                        }
                    }
                }
            }
        }
        
        // Hero vs PowerUp collisions
        for (const powerup of this.powerups) {
            if (powerup.checkCollision(this.hero)) {
                if (powerup.collect(this.hero)) {
                    this.onPowerupCollected(powerup);
                }
            }
        }
        
        // Hero vs Enemy collisions
        for (const enemy of this.enemies) {
            if (!enemy.alive) continue;
            
            if (this.hero.collidesWith(enemy)) {
                // Enemy attacks hero
                if (enemy.attackCooldown <= 0) {
                    enemy.performAttack(this.hero);
                }
            }
        }
    }
    
    // Handle enemy defeated
    onEnemyDefeated(enemy) {
        // Add score
        this.score += enemy.getPoints();
        
        // Update statistics
        this.stats.enemiesDefeated++;
        this.stats.enemyTypes[enemy.constructor.name.toLowerCase()] = 
            (this.stats.enemyTypes[enemy.constructor.name.toLowerCase()] || 0) + 1;
        
        // Update hero combo and experience
        if (this.hero) {
            this.hero.gainExperience(enemy.getPoints());
            this.stats.maxCombo = Math.max(this.stats.maxCombo, this.hero.combo);
        }
        
        // Check for boss defeat
        if (enemy.isBoss) {
            this.stats.bossesDefeated.push(enemy.constructor.name.toLowerCase());
            this.hideBossHealthBar();
        }
        
        // Drop items
        const drop = enemy.dropItem();
        if (drop) {
            const powerup = new PowerUp(drop.x, drop.y, drop.type);
            this.powerups.push(powerup);
        }
        
        // Educational triggers
        this.educationalSystem.checkTriggers('enemy_defeat', {
            enemy: enemy.constructor.name.toLowerCase()
        });
        
        // Check achievements
        const newAchievements = this.educationalSystem.checkAchievements(this.stats);
        for (const achievement of newAchievements) {
            this.showAchievementUnlocked(achievement);
        }
        
        this.enemiesKilled++;
    }
    
    // Handle powerup collected
    onPowerupCollected(powerup) {
        this.stats.powerupsCollected++;
        
        // Handle specific powerup effects
        switch (powerup.type) {
            case 'points':
                this.score += powerup.value;
                break;
            case 'weapon_upgrade':
                if (this.hero) {
                    this.hero.upgradeWeapon(this.hero.currentWeapon);
                }
                break;
        }
    }
    
    // Check wave completion
    checkWaveCompletion() {
        const aliveEnemies = this.enemies.filter(enemy => enemy.alive).length;
        
        if (aliveEnemies === 0 && this.enemiesInWave > 0) {
            // Wave completed
            this.onWaveCompleted();
        }
    }
    
    // Handle wave completed
    onWaveCompleted() {
        this.wave++;
        
        // Bonus points for wave completion
        const waveBonus = this.wave * 100;
        this.score += waveBonus;
        
        // Show wave completion notification
        this.showWaveCompletedNotification(waveBonus);
        
        // Start next wave after delay
        setTimeout(() => {
            if (this.gameState === 'playing') {
                if (this.wave <= 6) {
                    this.startWave(this.wave);
                } else {
                    // Game completed
                    this.onGameCompleted();
                }
            }
        }, this.nextWaveDelay);
    }
    
    // Handle game completed
    onGameCompleted() {
        this.gameState = 'victory';
        
        // Final score bonus
        const completionBonus = 1000;
        this.score += completionBonus;
        
        // Update statistics
        this.stats.totalScore += this.score;
        this.stats.level = Math.max(this.stats.level, this.hero ? this.hero.level : 1);
        
        // Save stats
        this.saveStats();
        
        // Show victory screen
        this.showVictoryScreen();
    }
    
    // Check game over
    checkGameOver() {
        if (this.hero && !this.hero.alive) {
            this.onGameOver();
        }
    }
    
    // Handle game over
    onGameOver() {
        this.gameState = 'gameover';
        
        // Update statistics
        this.stats.totalScore += this.score;
        this.stats.level = Math.max(this.stats.level, this.hero ? this.hero.level : 1);
        
        // Save stats
        this.saveStats();
        
        // Show game over screen
        this.showGameOverScreen();
    }
    
    // Render game
    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.gameState !== 'playing') return;
        
        // Draw background
        this.drawBackground();
        
        // Draw game objects
        this.drawPowerups();
        this.drawEnemies();
        this.drawProjectiles();
        this.drawHero();
        this.drawParticles();
        
        // Draw UI overlays
        this.drawDebugInfo();
    }
    
    // Draw background
    drawBackground() {
        // Gradient background
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(0.5, '#E0F6FF');
        gradient.addColorStop(1, '#FFE4E1');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Add some decorative elements
        this.drawBackgroundElements();
    }
    
    // Draw background elements
    drawBackgroundElements() {
        this.ctx.save();
        this.ctx.globalAlpha = 0.1;
        
        // Draw tooth patterns
        const time = Date.now() * 0.001;
        for (let i = 0; i < 5; i++) {
            const x = (this.canvas.width / 6) * (i + 1);
            const y = this.canvas.height / 2 + Math.sin(time + i) * 50;
            
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = '60px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('🦷', x, y);
        }
        
        this.ctx.restore();
    }
    
    // Draw hero
    drawHero() {
        if (this.hero && this.hero.alive) {
            this.hero.draw(this.ctx);
        }
    }
    
    // Draw enemies
    drawEnemies() {
        for (const enemy of this.enemies) {
            if (enemy.alive) {
                enemy.draw(this.ctx);
            }
        }
    }
    
    // Draw projectiles
    drawProjectiles() {
        for (const projectile of this.projectiles) {
            if (projectile.alive) {
                projectile.draw(this.ctx);
            }
        }
    }
    
    // Draw powerups
    drawPowerups() {
        for (const powerup of this.powerups) {
            if (powerup.alive) {
                powerup.draw(this.ctx);
            }
        }
    }
    
    // Draw particles
    drawParticles() {
        this.ctx.save();
        
        for (const particle of this.particles) {
            this.ctx.globalAlpha = particle.life / particle.maxLife;
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        this.ctx.restore();
    }
    
    // Draw debug info
    drawDebugInfo() {
        if (this.settings.showDebug) {
            this.ctx.save();
            this.ctx.fillStyle = '#000000';
            this.ctx.font = '12px monospace';
            this.ctx.textAlign = 'left';
            
            const debugInfo = [
                `FPS: ${this.fps}`,
                `Enemies: ${this.enemies.length}`,
                `Projectiles: ${this.projectiles.length}`,
                `Powerups: ${this.powerups.length}`,
                `Hero Health: ${this.hero ? Math.round(this.hero.health) : 0}`,
                `Hero Energy: ${this.hero ? Math.round(this.hero.energy) : 0}`
            ];
            
            for (let i = 0; i < debugInfo.length; i++) {
                this.ctx.fillText(debugInfo[i], 10, 20 + i * 15);
            }
            
            this.ctx.restore();
        }
    }
    
    // ===== INPUT HANDLING =====
    
    // Handle key down
    handleKeyDown(event) {
        this.keys.add(event.code);
        
        // Weapon switching
        if (this.gameState === 'playing' && this.hero) {
            switch (event.code) {
                case 'Digit1':
                    this.hero.switchWeapon('escova');
                    this.updateWeaponSelector();
                    break;
                case 'Digit2':
                    this.hero.switchWeapon('fio-dental');
                    this.updateWeaponSelector();
                    break;
                case 'Digit3':
                    this.hero.switchWeapon('enxaguante');
                    this.updateWeaponSelector();
                    break;
                case 'Digit4':
                    this.hero.switchWeapon('fluor');
                    this.updateWeaponSelector();
                    break;
                case 'Space':
                    event.preventDefault();
                    this.hero.useAbility('escovacao-ritmica');
                    break;
                case 'Escape':
                    this.pauseGame();
                    break;
            }
        }
        
        // Global shortcuts
        switch (event.code) {
            case 'KeyM':
                this.toggleMusic();
                break;
            case 'KeyP':
                if (this.gameState === 'playing') {
                    this.pauseGame();
                }
                break;
        }
    }
    
    // Handle key up
    handleKeyUp(event) {
        this.keys.delete(event.code);
    }
    
    // Handle mouse down
    handleMouseDown(event) {
        if (this.gameState !== 'playing' || !this.hero) return;
        
        const coords = Utils.getCanvasCoordinates(event, this.canvas);
        this.mouse.x = coords.x;
        this.mouse.y = coords.y;
        this.mouse.pressed = true;
        
        // Attack
        this.performAttack(coords.x, coords.y);
    }
    
    // Handle mouse up
    handleMouseUp(event) {
        this.mouse.pressed = false;
    }
    
    // Handle mouse move
    handleMouseMove(event) {
        const coords = Utils.getCanvasCoordinates(event, this.canvas);
        this.mouse.x = coords.x;
        this.mouse.y = coords.y;
    }
    
    // Handle touch start
    handleTouchStart(event) {
        event.preventDefault();
        
        if (this.gameState !== 'playing' || !this.hero) return;
        
        const coords = Utils.getCanvasCoordinates(event, this.canvas);
        this.touch.x = coords.x;
        this.touch.y = coords.y;
        this.touch.active = true;
        
        // Attack
        this.performAttack(coords.x, coords.y);
    }
    
    // Handle touch end
    handleTouchEnd(event) {
        event.preventDefault();
        this.touch.active = false;
    }
    
    // Handle touch move
    handleTouchMove(event) {
        event.preventDefault();
        
        const coords = Utils.getCanvasCoordinates(event, this.canvas);
        this.touch.x = coords.x;
        this.touch.y = coords.y;
    }
    
    // Perform attack
    performAttack(targetX, targetY) {
        if (!this.hero || !this.hero.alive) return;
        
        const attack = this.hero.attack(targetX, targetY);
        if (attack) {
            const projectile = this.weaponSystem.createProjectile(
                attack.weapon,
                attack.x,
                attack.y,
                attack.targetX,
                attack.targetY,
                this.hero.weapons.get(attack.weapon).level
            );
            
            if (projectile) {
                this.projectiles.push(projectile);
                
                // Update statistics
                this.stats.weaponUses[attack.weapon] = (this.stats.weaponUses[attack.weapon] || 0) + 1;
                
                // Educational triggers
                this.educationalSystem.checkTriggers('weapon_use', { weapon: attack.weapon });
            }
        }
    }
    
    // ===== UI MANAGEMENT =====
    
    // Hide loading screen
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.remove('active');
        }
    }
    
    // Show main menu
    showMainMenu() {
        this.hideAllScreens();
        const mainMenu = document.getElementById('main-menu');
        if (mainMenu) {
            mainMenu.classList.add('active');
        }
    }
    
    // Show game screen
    showGameScreen() {
        this.hideAllScreens();
        const gameScreen = document.getElementById('game-screen');
        if (gameScreen) {
            gameScreen.classList.add('active');
        }
    }
    
    // Show pause screen
    showPauseScreen() {
        const pauseScreen = document.getElementById('pause-screen');
        if (pauseScreen) {
            pauseScreen.classList.add('active');
        }
    }
    
    // Show game over screen
    showGameOverScreen() {
        this.hideAllScreens();
        const gameOverScreen = document.getElementById('game-over-screen');
        if (gameOverScreen) {
            gameOverScreen.classList.add('active');
            
            // Update final stats
            document.getElementById('final-score').textContent = Utils.formatNumber(this.score);
            document.getElementById('final-level').textContent = this.hero ? this.hero.level : 1;
            document.getElementById('final-enemies').textContent = this.stats.enemiesDefeated;
        }
    }
    
    // Show victory screen
    showVictoryScreen() {
        this.hideAllScreens();
        const victoryScreen = document.getElementById('victory-screen');
        if (victoryScreen) {
            victoryScreen.classList.add('active');
            
            // Update victory stats
            document.getElementById('victory-score').textContent = Utils.formatNumber(this.score);
            document.getElementById('victory-time').textContent = Utils.formatTime(this.gameTime / 1000);
            document.getElementById('victory-accuracy').textContent = '95%'; // Calculate actual accuracy
        }
    }
    
    // Hide all screens
    hideAllScreens() {
        const screens = document.querySelectorAll('.screen');
        screens.forEach(screen => screen.classList.remove('active'));
    }
    
    // Update HUD
    updateHUD() {
        if (!this.hero) return;
        
        // Health bar
        const healthBar = document.getElementById('health-bar');
        const healthValue = document.getElementById('health-value');
        if (healthBar && healthValue) {
            const healthPercent = this.hero.getHealthPercentage();
            healthBar.style.width = healthPercent + '%';
            healthValue.textContent = `${Math.round(this.hero.health)}/${this.hero.maxHealth}`;
        }
        
        // Score
        const scoreValue = document.getElementById('score-value');
        if (scoreValue) {
            scoreValue.textContent = Utils.formatNumber(this.score);
        }
        
        // Level
        const levelValue = document.getElementById('level-value');
        if (levelValue) {
            levelValue.textContent = this.hero.level;
        }
    }
    
    // Update weapon selector
    updateWeaponSelector() {
        if (!this.hero) return;
        
        const weaponSlots = document.querySelectorAll('.weapon-slot');
        weaponSlots.forEach(slot => {
            slot.classList.remove('active');
            if (slot.dataset.weapon === this.hero.currentWeapon) {
                slot.classList.add('active');
            }
        });
    }
    
    // Show boss health bar
    showBossHealthBar(boss) {
        // Create boss health bar if it doesn't exist
        let bossHealthBar = document.querySelector('.boss-health-bar');
        if (!bossHealthBar) {
            bossHealthBar = document.createElement('div');
            bossHealthBar.className = 'boss-health-bar';
            bossHealthBar.innerHTML = `
                <div class="boss-name">${boss.constructor.name}</div>
                <div class="boss-bar-container">
                    <div class="boss-bar" id="boss-bar"></div>
                </div>
            `;
            document.getElementById('game-screen').appendChild(bossHealthBar);
        }
        
        // Update boss health bar
        this.updateBossHealthBar(boss);
    }
    
    // Update boss health bar
    updateBossHealthBar(boss) {
        const bossBar = document.getElementById('boss-bar');
        if (bossBar && boss) {
            const healthPercent = boss.getHealthPercentage();
            bossBar.style.width = healthPercent + '%';
        }
    }
    
    // Hide boss health bar
    hideBossHealthBar() {
        const bossHealthBar = document.querySelector('.boss-health-bar');
        if (bossHealthBar) {
            bossHealthBar.remove();
        }
    }
    
    // Show wave notification
    showWaveNotification(waveNumber) {
        const notification = document.createElement('div');
        notification.className = 'wave-notification';
        notification.textContent = `Onda ${waveNumber}`;
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(74, 144, 226, 0.9);
            color: white;
            padding: 1rem 2rem;
            border-radius: 10px;
            font-size: 2rem;
            font-weight: bold;
            z-index: 1000;
            animation: fadeInOut 3s ease-out forwards;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }
    
    // Show wave completed notification
    showWaveCompletedNotification(bonus) {
        const notification = document.createElement('div');
        notification.className = 'wave-completed-notification';
        notification.innerHTML = `
            <div>Onda Completa!</div>
            <div style="font-size: 1.2rem;">Bônus: +${bonus} pontos</div>
        `;
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(39, 174, 96, 0.9);
            color: white;
            padding: 1rem 2rem;
            border-radius: 10px;
            font-size: 1.5rem;
            font-weight: bold;
            text-align: center;
            z-index: 1000;
            animation: fadeInOut 3s ease-out forwards;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }
    
    // Show achievement unlocked
    showAchievementUnlocked(achievement) {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div style="font-size: 2rem;">${achievement.icon}</div>
            <div>Conquista Desbloqueada!</div>
            <div style="font-size: 1.2rem;">${achievement.title}</div>
        `;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(255, 215, 0, 0.9);
            color: #2C3E50;
            padding: 1rem;
            border-radius: 10px;
            font-weight: bold;
            text-align: center;
            z-index: 1000;
            animation: slideInRight 0.5s ease-out, fadeOut 0.5s ease-out 4s forwards;
            min-width: 200px;
        `;
        
        document.body.appendChild(notification);
        
        Utils.playSound('achievement', 0.5);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }
    
    // ===== GAME CONTROL =====
    
    // Pause game
    pauseGame() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            this.showPauseScreen();
        }
    }
    
    // Resume game
    resumeGame() {
        if (this.gameState === 'paused') {
            this.gameState = 'playing';
            this.hideAllScreens();
            this.showGameScreen();
        }
    }
    
    // Restart game
    restartGame() {
        this.startNewGame();
    }
    
    // Return to menu
    returnToMenu() {
        this.gameState = 'menu';
        this.showMainMenu();
        
        // Reset game state
        this.hero = null;
        this.enemies = [];
        this.projectiles = [];
        this.powerups = [];
        this.particles = [];
    }
    
    // ===== AUDIO MANAGEMENT =====
    
    // Play background music
    playBackgroundMusic() {
        try {
            const music = new Audio('assets/sounds/music/theme.mp3');
            music.loop = true;
            music.volume = this.settings.musicVolume;
            music.play().catch(e => console.log('Music play failed:', e));
        } catch (e) {
            console.log('Music loading failed:', e);
        }
    }
    
    // Toggle music
    toggleMusic() {
        this.settings.musicVolume = this.settings.musicVolume > 0 ? 0 : 0.7;
        this.saveSettings();
    }
    
    // ===== ERROR HANDLING =====
    
    // Show error message
    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(231, 76, 60, 0.9);
            color: white;
            padding: 2rem;
            border-radius: 10px;
            font-size: 1.2rem;
            text-align: center;
            z-index: 10000;
        `;
        errorDiv.textContent = message;
        
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }
    
    // ===== DATA MANAGEMENT =====
    
    // Export game data
    exportGameData() {
        return {
            settings: this.settings,
            stats: this.stats,
            educational: this.educationalSystem.exportData()
        };
    }
    
    // Import game data
    importGameData(data) {
        if (data.settings) {
            this.settings = { ...this.settings, ...data.settings };
            this.saveSettings();
            this.applySettings();
        }
        
        if (data.stats) {
            this.stats = { ...this.stats, ...data.stats };
            this.saveStats();
        }
        
        if (data.educational) {
            this.educationalSystem.importData(data.educational);
        }
    }
    
    // Reset all progress
    resetProgress() {
        if (confirm('Tem certeza que deseja resetar todo o progresso? Esta ação não pode ser desfeita.')) {
            Utils.clearData('game_settings');
            Utils.clearData('game_stats');
            
            // Reset to defaults
            this.settings = {
                musicVolume: 0.7,
                effectsVolume: 0.8,
                difficulty: 'normal',
                showTips: true,
                autoSave: true
            };
            
            this.stats = {
                enemiesDefeated: 0,
                enemyTypes: {},
                weaponUses: {},
                maxCombo: 0,
                survivalTime: 0,
                level: 1,
                bossesDefeated: [],
                powerupsCollected: 0,
                tipsRead: 0,
                gamesPlayed: 0,
                totalScore: 0
            };
            
            this.applySettings();
            alert('Progresso resetado com sucesso!');
        }
    }
}

