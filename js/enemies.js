// ===== ENEMY CLASSES =====

// Base Enemy class
class Enemy extends Character {
    constructor(x, y, health = 50) {
        super(x, y, health);
        this.speed = 1;
        this.radius = 15;
        this.damage = 10;
        this.attackRange = 30;
        this.attackCooldown = 0;
        this.attackDelay = 1000;
        this.target = null;
        this.behavior = 'aggressive';
        this.points = 10;
        this.dropChance = 0.1;
        this.lastAttackTime = 0;
        this.aggroRange = 150;
        this.state = 'idle'; // idle, chasing, attacking, dead
        this.spawnTime = Date.now();
        this.aiUpdateInterval = 100; // ms
        this.lastAiUpdate = 0;
    }
    
    // Update enemy
    update(deltaTime, hero, enemies) {
        super.update(deltaTime);
        
        if (!this.alive) return;
        
        // Update attack cooldown
        if (this.attackCooldown > 0) {
            this.attackCooldown -= deltaTime;
        }
        
        // AI update (throttled for performance)
        const now = Date.now();
        if (now - this.lastAiUpdate > this.aiUpdateInterval) {
            this.updateAI(hero, enemies);
            this.lastAiUpdate = now;
        }
        
        // Update movement
        this.updateMovement(deltaTime);
        
        // Update state-specific behavior
        this.updateState(deltaTime, hero);
    }
    
    // Update AI behavior
    updateAI(hero, enemies) {
        if (!hero || !hero.alive) {
            this.state = 'idle';
            this.target = null;
            return;
        }
        
        const distanceToHero = this.distanceTo(hero);
        
        switch (this.state) {
            case 'idle':
                if (distanceToHero <= this.aggroRange) {
                    this.state = 'chasing';
                    this.target = hero;
                }
                break;
                
            case 'chasing':
                if (distanceToHero > this.aggroRange * 1.5) {
                    this.state = 'idle';
                    this.target = null;
                } else if (distanceToHero <= this.attackRange) {
                    this.state = 'attacking';
                }
                break;
                
            case 'attacking':
                if (distanceToHero > this.attackRange) {
                    this.state = 'chasing';
                }
                break;
        }
    }
    
    // Update movement
    updateMovement(deltaTime) {
        if (this.state === 'chasing' && this.target) {
            const angle = this.angleTo(this.target);
            const moveSpeed = this.speed * (deltaTime / 16.67); // Normalize to 60fps
            
            this.x += Math.cos(angle) * moveSpeed;
            this.y += Math.sin(angle) * moveSpeed;
            
            this.angle = angle;
        }
    }
    
    // Update state-specific behavior
    updateState(deltaTime, hero) {
        switch (this.state) {
            case 'attacking':
                if (this.attackCooldown <= 0 && this.target) {
                    this.performAttack(this.target);
                }
                break;
        }
    }
    
    // Perform attack
    performAttack(target) {
        if (!target || !target.alive) return;
        
        const distance = this.distanceTo(target);
        if (distance <= this.attackRange) {
            target.takeDamage(this.damage, this);
            this.attackCooldown = this.attackDelay;
            this.lastAttackTime = Date.now();
            
            // Play attack sound
            Utils.playSound('enemy_attack', 0.3);
            
            // Create attack effect
            Utils.createParticle(target.x, target.y - 10, this.damage, 'damage');
        }
    }
    
    // Take damage (override)
    takeDamage(amount, source = null) {
        const damaged = super.takeDamage(amount, source);
        
        if (damaged && source && source.combo) {
            // Bonus damage for combos
            const bonusDamage = Math.floor(source.combo / 5);
            if (bonusDamage > 0) {
                super.takeDamage(bonusDamage, source);
                Utils.createParticle(this.x + 15, this.y - 15, `COMBO +${bonusDamage}`, 'heal');
            }
        }
        
        return damaged;
    }
    
    // Die (override)
    die() {
        super.die();
        
        // Drop items chance
        if (Math.random() < this.dropChance) {
            this.dropItem();
        }
    }
    
    // Drop item
    dropItem() {
        // This will be handled by the game manager
        return {
            type: Utils.randomChoice(['health', 'energy', 'points']),
            x: this.x,
            y: this.y,
            value: Utils.randomInt(5, 15)
        };
    }
    
    // Get points value
    getPoints() {
        return this.points;
    }
    
    // Draw enemy (base implementation)
    draw(ctx) {
        if (!this.alive) return;
        
        ctx.save();
        
        // Draw enemy body
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.getColor();
        ctx.fill();
        ctx.strokeStyle = '#2C3E50';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw health bar if damaged
        if (this.health < this.maxHealth) {
            const barWidth = this.radius * 2;
            const barHeight = 3;
            const barX = this.x - barWidth / 2;
            const barY = this.y - this.radius - 8;
            
            // Background
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.fillRect(barX, barY, barWidth, barHeight);
            
            // Health
            const healthWidth = (this.health / this.maxHealth) * barWidth;
            ctx.fillStyle = '#E74C3C';
            ctx.fillRect(barX, barY, healthWidth, barHeight);
        }
        
        // Draw aggro indicator
        if (this.state === 'chasing' || this.state === 'attacking') {
            ctx.strokeStyle = '#E74C3C';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius + 5, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        ctx.restore();
    }
    
    // Get enemy color (to be overridden)
    getColor() {
        return '#8B4513';
    }
}

// Cárie - Basic enemy
class Carie extends Enemy {
    constructor(x, y) {
        super(x, y, 30);
        this.speed = 1.5;
        this.radius = 12;
        this.damage = 8;
        this.points = 10;
        this.attackDelay = 1200;
        this.dropChance = 0.15;
    }
    
    getColor() {
        return this.invulnerable ? 'rgba(139, 69, 19, 0.5)' : '#8B4513';
    }
    
    draw(ctx) {
        super.draw(ctx);
        
        if (!this.alive) return;
        
        // Draw carie-specific features
        ctx.save();
        ctx.fillStyle = '#654321';
        
        // Draw spots
        ctx.beginPath();
        ctx.arc(this.x - 4, this.y - 2, 2, 0, Math.PI * 2);
        ctx.arc(this.x + 3, this.y + 3, 1.5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}

// Placa Bacteriana - Spreads and slows hero
class PlacaBacteriana extends Enemy {
    constructor(x, y) {
        super(x, y, 40);
        this.speed = 1;
        this.radius = 18;
        this.damage = 6;
        this.points = 15;
        this.attackDelay = 1500;
        this.dropChance = 0.12;
        this.spreadCooldown = 0;
        this.spreadDelay = 3000;
        this.maxSpreads = 2;
        this.spreadsUsed = 0;
    }
    
    update(deltaTime, hero, enemies) {
        super.update(deltaTime, hero, enemies);
        
        // Update spread cooldown
        if (this.spreadCooldown > 0) {
            this.spreadCooldown -= deltaTime;
        }
        
        // Try to spread
        if (this.spreadCooldown <= 0 && this.spreadsUsed < this.maxSpreads && this.alive) {
            this.trySpread(enemies);
        }
    }
    
    trySpread(enemies) {
        // Don't spread if too many enemies nearby
        const nearbyEnemies = enemies.filter(enemy => 
            enemy !== this && enemy.alive && this.distanceTo(enemy) < 100
        );
        
        if (nearbyEnemies.length < 3) {
            this.spreadCooldown = this.spreadDelay;
            this.spreadsUsed++;
            
            // Create new placa nearby
            const angle = Math.random() * Math.PI * 2;
            const distance = 40 + Math.random() * 30;
            const newX = this.x + Math.cos(angle) * distance;
            const newY = this.y + Math.sin(angle) * distance;
            
            return new PlacaBacteriana(newX, newY);
        }
        
        return null;
    }
    
    performAttack(target) {
        super.performAttack(target);
        
        // Apply slow effect
        if (target && target.alive) {
            target.addEffect('slow', {
                duration: 2000,
                speedMultiplier: 0.5
            });
        }
    }
    
    getColor() {
        return this.invulnerable ? 'rgba(34, 139, 34, 0.5)' : '#228B22';
    }
    
    draw(ctx) {
        super.draw(ctx);
        
        if (!this.alive) return;
        
        // Draw placa-specific features
        ctx.save();
        ctx.fillStyle = 'rgba(0, 100, 0, 0.3)';
        
        // Draw sticky effect
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius + 5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}

// Tártaro - Tough enemy with armor
class Tartaro extends Enemy {
    constructor(x, y) {
        super(x, y, 80);
        this.speed = 0.8;
        this.radius = 20;
        this.damage = 12;
        this.points = 25;
        this.attackDelay = 1000;
        this.dropChance = 0.2;
        this.armor = 5; // Reduces incoming damage
    }
    
    takeDamage(amount, source = null) {
        // Apply armor reduction
        const reducedDamage = Math.max(1, amount - this.armor);
        return super.takeDamage(reducedDamage, source);
    }
    
    getColor() {
        return this.invulnerable ? 'rgba(105, 105, 105, 0.5)' : '#696969';
    }
    
    draw(ctx) {
        super.draw(ctx);
        
        if (!this.alive) return;
        
        // Draw armor effect
        ctx.save();
        ctx.strokeStyle = '#A9A9A9';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius - 2, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.restore();
    }
}

// Gengivite - Boss enemy that causes bleeding
class Gengivite extends Enemy {
    constructor(x, y) {
        super(x, y, 150);
        this.speed = 1.2;
        this.radius = 30;
        this.damage = 15;
        this.points = 50;
        this.attackDelay = 800;
        this.dropChance = 0.3;
        this.isBoss = true;
        this.bleedAttackCooldown = 0;
        this.bleedAttackDelay = 5000;
        this.rageThreshold = 0.3; // Becomes enraged at 30% health
        this.enraged = false;
    }
    
    update(deltaTime, hero, enemies) {
        super.update(deltaTime, hero, enemies);
        
        // Check for rage mode
        if (!this.enraged && this.getHealthPercentage() <= this.rageThreshold * 100) {
            this.enterRageMode();
        }
        
        // Update bleed attack cooldown
        if (this.bleedAttackCooldown > 0) {
            this.bleedAttackCooldown -= deltaTime;
        }
        
        // Try bleed attack
        if (this.bleedAttackCooldown <= 0 && this.target && this.state === 'attacking') {
            this.performBleedAttack(this.target);
        }
    }
    
    enterRageMode() {
        this.enraged = true;
        this.speed *= 1.5;
        this.damage *= 1.3;
        this.attackDelay *= 0.7;
        
        // Visual effect
        Utils.createParticle(this.x, this.y - 40, 'ENRAGED!', 'damage');
        Utils.playSound('boss_rage', 0.5);
    }
    
    performBleedAttack(target) {
        if (!target || !target.alive) return;
        
        const distance = this.distanceTo(target);
        if (distance <= this.attackRange * 1.5) {
            // Apply bleeding effect
            target.addEffect('bleeding', {
                duration: 5000,
                damagePerSecond: 3,
                lastTick: Date.now()
            });
            
            this.bleedAttackCooldown = this.bleedAttackDelay;
            
            Utils.createParticle(target.x, target.y - 20, 'BLEEDING!', 'damage');
            Utils.playSound('bleed_attack', 0.4);
        }
    }
    
    getColor() {
        const baseColor = this.enraged ? '#DC143C' : '#B22222';
        return this.invulnerable ? `rgba(220, 20, 60, 0.5)` : baseColor;
    }
    
    draw(ctx) {
        super.draw(ctx);
        
        if (!this.alive) return;
        
        // Draw boss aura
        ctx.save();
        ctx.strokeStyle = this.enraged ? '#FF0000' : '#DC143C';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius + 10, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Draw crown (boss indicator)
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.moveTo(this.x - 10, this.y - this.radius - 5);
        ctx.lineTo(this.x - 5, this.y - this.radius - 15);
        ctx.lineTo(this.x, this.y - this.radius - 10);
        ctx.lineTo(this.x + 5, this.y - this.radius - 15);
        ctx.lineTo(this.x + 10, this.y - this.radius - 5);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
    }
}

// Periodontite - Final boss
class Periodontite extends Enemy {
    constructor(x, y) {
        super(x, y, 300);
        this.speed = 0.8;
        this.radius = 40;
        this.damage = 20;
        this.points = 100;
        this.attackDelay = 600;
        this.dropChance = 0.5;
        this.isBoss = true;
        this.finalBoss = true;
        this.phase = 1;
        this.maxPhases = 3;
        this.specialAttackCooldown = 0;
        this.specialAttackDelay = 8000;
        this.summonCooldown = 0;
        this.summonDelay = 12000;
    }
    
    update(deltaTime, hero, enemies) {
        super.update(deltaTime, hero, enemies);
        
        // Update phase based on health
        const healthPercent = this.getHealthPercentage();
        if (healthPercent <= 66 && this.phase === 1) {
            this.enterPhase2();
        } else if (healthPercent <= 33 && this.phase === 2) {
            this.enterPhase3();
        }
        
        // Update special attack cooldown
        if (this.specialAttackCooldown > 0) {
            this.specialAttackCooldown -= deltaTime;
        }
        
        // Update summon cooldown
        if (this.summonCooldown > 0) {
            this.summonCooldown -= deltaTime;
        }
        
        // Try special attacks
        if (this.specialAttackCooldown <= 0 && this.target) {
            this.performSpecialAttack(this.target);
        }
        
        if (this.summonCooldown <= 0 && this.phase >= 2) {
            this.summonMinions();
        }
    }
    
    enterPhase2() {
        this.phase = 2;
        this.speed *= 1.2;
        this.damage *= 1.2;
        
        Utils.createParticle(this.x, this.y - 50, 'PHASE 2!', 'damage');
        Utils.playSound('boss_phase', 0.6);
    }
    
    enterPhase3() {
        this.phase = 3;
        this.speed *= 1.3;
        this.damage *= 1.3;
        this.attackDelay *= 0.5;
        
        Utils.createParticle(this.x, this.y - 50, 'FINAL PHASE!', 'damage');
        Utils.playSound('boss_final_phase', 0.7);
    }
    
    performSpecialAttack(target) {
        // Bone destruction attack
        const distance = this.distanceTo(target);
        if (distance <= 200) {
            target.takeDamage(this.damage * 2, this);
            target.addEffect('bone_loss', {
                duration: 8000,
                speedMultiplier: 0.3,
                damageMultiplier: 1.5
            });
            
            this.specialAttackCooldown = this.specialAttackDelay;
            
            Utils.createParticle(target.x, target.y - 30, 'BONE LOSS!', 'damage');
            Utils.playSound('bone_destruction', 0.5);
        }
    }
    
    summonMinions() {
        this.summonCooldown = this.summonDelay;
        
        // Summon 2-3 caries around the boss
        const minionCount = Utils.randomInt(2, 3);
        const minions = [];
        
        for (let i = 0; i < minionCount; i++) {
            const angle = (Math.PI * 2 / minionCount) * i;
            const distance = 60;
            const minionX = this.x + Math.cos(angle) * distance;
            const minionY = this.y + Math.sin(angle) * distance;
            
            minions.push(new Carie(minionX, minionY));
        }
        
        Utils.createParticle(this.x, this.y - 60, 'SUMMON!', 'heal');
        Utils.playSound('summon_minions', 0.4);
        
        return minions;
    }
    
    getColor() {
        const colors = ['#4B0000', '#8B0000', '#FF0000'];
        const baseColor = colors[this.phase - 1] || '#4B0000';
        return this.invulnerable ? `rgba(75, 0, 0, 0.5)` : baseColor;
    }
    
    draw(ctx) {
        super.draw(ctx);
        
        if (!this.alive) return;
        
        // Draw final boss aura
        ctx.save();
        
        // Multiple aura rings
        for (let i = 0; i < this.phase; i++) {
            ctx.strokeStyle = `rgba(255, 0, 0, ${0.3 - i * 0.1})`;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius + 15 + i * 10, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        // Draw skull (final boss indicator)
        ctx.fillStyle = '#000000';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('💀', this.x, this.y - this.radius - 10);
        
        // Draw phase indicator
        ctx.fillStyle = '#FFD700';
        ctx.font = '12px Arial';
        ctx.fillText(`Phase ${this.phase}`, this.x, this.y + this.radius + 20);
        
        ctx.restore();
    }
}

// Halitose - Special enemy that creates fog
class Halitose extends Enemy {
    constructor(x, y) {
        super(x, y, 60);
        this.speed = 1.5;
        this.radius = 25;
        this.damage = 8;
        this.points = 30;
        this.attackDelay = 2000;
        this.dropChance = 0.15;
        this.fogCooldown = 0;
        this.fogDelay = 6000;
        this.fogDuration = 4000;
        this.fogActive = false;
    }
    
    update(deltaTime, hero, enemies) {
        super.update(deltaTime, hero, enemies);
        
        // Update fog cooldown
        if (this.fogCooldown > 0) {
            this.fogCooldown -= deltaTime;
        }
        
        // Try to create fog
        if (this.fogCooldown <= 0 && this.target && !this.fogActive) {
            this.createFog();
        }
    }
    
    createFog() {
        this.fogActive = true;
        this.fogCooldown = this.fogDelay;
        
        // Create fog effect that reduces visibility
        const fogEffect = {
            x: this.x,
            y: this.y,
            radius: 100,
            duration: this.fogDuration,
            startTime: Date.now()
        };
        
        Utils.createParticle(this.x, this.y - 30, 'FOG!', 'damage');
        Utils.playSound('fog_attack', 0.3);
        
        // Reset fog after duration
        setTimeout(() => {
            this.fogActive = false;
        }, this.fogDuration);
        
        return fogEffect;
    }
    
    getColor() {
        return this.invulnerable ? 'rgba(128, 128, 128, 0.5)' : '#808080';
    }
    
    draw(ctx) {
        super.draw(ctx);
        
        if (!this.alive) return;
        
        // Draw fog effect
        if (this.fogActive) {
            ctx.save();
            ctx.fillStyle = 'rgba(128, 128, 128, 0.2)';
            ctx.beginPath();
            ctx.arc(this.x, this.y, 100, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
        
        // Draw stink lines
        ctx.save();
        ctx.strokeStyle = '#696969';
        ctx.lineWidth = 2;
        
        for (let i = 0; i < 3; i++) {
            const angle = (Date.now() / 1000 + i) % (Math.PI * 2);
            const startX = this.x + Math.cos(angle) * (this.radius + 5);
            const startY = this.y + Math.sin(angle) * (this.radius + 5);
            const endX = startX + Math.cos(angle) * 15;
            const endY = startY + Math.sin(angle) * 15;
            
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
        }
        
        ctx.restore();
    }
}

