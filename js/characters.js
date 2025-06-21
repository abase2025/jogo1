// ===== CHARACTER CLASSES =====

// Base Character class
class Character {
    constructor(x, y, health = 100) {
        this.id = Utils.generateId();
        this.x = x;
        this.y = y;
        this.maxHealth = health;
        this.health = health;
        this.speed = 2;
        this.radius = 20;
        this.angle = 0;
        this.alive = true;
        this.invulnerable = false;
        this.invulnerabilityTime = 0;
        this.effects = new Map();
        this.animations = new Map();
        this.lastDamageTime = 0;
    }
    
    // Update character
    update(deltaTime) {
        // Update invulnerability
        if (this.invulnerable) {
            this.invulnerabilityTime -= deltaTime;
            if (this.invulnerabilityTime <= 0) {
                this.invulnerable = false;
            }
        }
        
        // Update effects
        for (let [effectName, effect] of this.effects) {
            effect.duration -= deltaTime;
            if (effect.duration <= 0) {
                this.removeEffect(effectName);
            }
        }
        
        // Update animations
        for (let [animName, anim] of this.animations) {
            anim.currentTime += deltaTime;
            if (anim.currentTime >= anim.duration) {
                this.animations.delete(animName);
            }
        }
    }
    
    // Move character
    move(dx, dy) {
        this.x += dx * this.speed;
        this.y += dy * this.speed;
    }
    
    // Take damage
    takeDamage(amount, source = null) {
        if (!this.alive || this.invulnerable) return false;
        
        this.health -= amount;
        this.lastDamageTime = Date.now();
        
        // Create damage particle
        Utils.createParticle(this.x, this.y - 20, `-${amount}`, 'damage');
        
        // Make invulnerable briefly
        this.makeInvulnerable(500);
        
        if (this.health <= 0) {
            this.health = 0;
            this.die();
        }
        
        return true;
    }
    
    // Heal character
    heal(amount) {
        if (!this.alive) return false;
        
        const oldHealth = this.health;
        this.health = Math.min(this.health + amount, this.maxHealth);
        const actualHeal = this.health - oldHealth;
        
        if (actualHeal > 0) {
            Utils.createParticle(this.x, this.y - 20, `+${actualHeal}`, 'heal');
        }
        
        return actualHeal > 0;
    }
    
    // Make character invulnerable
    makeInvulnerable(duration) {
        this.invulnerable = true;
        this.invulnerabilityTime = duration;
    }
    
    // Add effect to character
    addEffect(name, effect) {
        this.effects.set(name, {
            ...effect,
            startTime: Date.now()
        });
    }
    
    // Remove effect from character
    removeEffect(name) {
        this.effects.delete(name);
    }
    
    // Check if character has effect
    hasEffect(name) {
        return this.effects.has(name);
    }
    
    // Add animation
    addAnimation(name, duration, callback = null) {
        this.animations.set(name, {
            duration,
            currentTime: 0,
            callback
        });
    }
    
    // Die
    die() {
        this.alive = false;
        this.health = 0;
        
        // Create explosion effect
        Utils.createExplosion(this.x, this.y, this.radius * 2);
        
        // Play death sound
        Utils.playSound('death', 0.3);
    }
    
    // Get health percentage
    getHealthPercentage() {
        return (this.health / this.maxHealth) * 100;
    }
    
    // Check collision with another character
    collidesWith(other) {
        return Utils.circleCollision(
            this.x, this.y, this.radius,
            other.x, other.y, other.radius
        );
    }
    
    // Get distance to another character
    distanceTo(other) {
        return Utils.distance(this.x, this.y, other.x, other.y);
    }
    
    // Get angle to another character
    angleTo(other) {
        return Utils.angle(this.x, this.y, other.x, other.y);
    }
    
    // Draw character (to be overridden)
    draw(ctx) {
        // Base drawing - circle with health bar
        ctx.save();
        
        // Draw character circle
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.invulnerable ? 'rgba(255,255,255,0.5)' : '#4A90E2';
        ctx.fill();
        ctx.strokeStyle = '#2C3E50';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw health bar if damaged
        if (this.health < this.maxHealth) {
            const barWidth = this.radius * 2;
            const barHeight = 4;
            const barX = this.x - barWidth / 2;
            const barY = this.y - this.radius - 10;
            
            // Background
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.fillRect(barX, barY, barWidth, barHeight);
            
            // Health
            const healthWidth = (this.health / this.maxHealth) * barWidth;
            ctx.fillStyle = this.health > this.maxHealth * 0.5 ? '#27AE60' : '#E74C3C';
            ctx.fillRect(barX, barY, healthWidth, barHeight);
        }
        
        ctx.restore();
    }
}

// Hero class - Dr. Sorriso
class Hero extends Character {
    constructor(x, y) {
        super(x, y, 100);
        this.speed = 4;
        this.radius = 25;
        this.experience = 0;
        this.level = 1;
        this.currentWeapon = 'escova';
        this.weapons = new Map();
        this.abilities = new Map();
        this.combo = 0;
        this.maxCombo = 0;
        this.lastAttackTime = 0;
        this.attackCooldown = 0;
        this.energy = 100;
        this.maxEnergy = 100;
        this.energyRegenRate = 10; // per second
        
        // Initialize weapons
        this.initializeWeapons();
        
        // Initialize abilities
        this.initializeAbilities();
    }
    
    // Initialize weapons
    initializeWeapons() {
        this.weapons.set('escova', {
            name: 'Escova de Dentes',
            damage: 15,
            cooldown: 300,
            range: 80,
            energyCost: 5,
            unlocked: true,
            level: 1
        });
        
        this.weapons.set('fio-dental', {
            name: 'Fio Dental',
            damage: 25,
            cooldown: 500,
            range: 120,
            energyCost: 8,
            unlocked: true,
            level: 1
        });
        
        this.weapons.set('enxaguante', {
            name: 'Enxaguante Bucal',
            damage: 20,
            cooldown: 800,
            range: 100,
            energyCost: 15,
            unlocked: false,
            level: 1,
            areaOfEffect: true
        });
        
        this.weapons.set('fluor', {
            name: 'Flúor Tópico',
            damage: 10,
            cooldown: 1000,
            range: 60,
            energyCost: 20,
            unlocked: false,
            level: 1,
            healing: true
        });
    }
    
    // Initialize abilities
    initializeAbilities() {
        this.abilities.set('escovacao-ritmica', {
            name: 'Escovação Rítmica',
            cooldown: 10000,
            duration: 5000,
            energyCost: 30,
            unlocked: true,
            effect: 'speed_boost'
        });
        
        this.abilities.set('protecao-fluor', {
            name: 'Proteção de Flúor',
            cooldown: 15000,
            duration: 8000,
            energyCost: 40,
            unlocked: false,
            effect: 'damage_reduction'
        });
    }
    
    // Update hero
    update(deltaTime) {
        super.update(deltaTime);
        
        // Regenerate energy
        if (this.energy < this.maxEnergy) {
            this.energy = Math.min(this.maxEnergy, this.energy + this.energyRegenRate * (deltaTime / 1000));
        }
        
        // Update attack cooldown
        if (this.attackCooldown > 0) {
            this.attackCooldown -= deltaTime;
        }
        
        // Update combo timer
        if (Date.now() - this.lastAttackTime > 3000) {
            this.combo = 0;
        }
    }
    
    // Attack with current weapon
    attack(targetX, targetY) {
        const weapon = this.weapons.get(this.currentWeapon);
        if (!weapon || this.attackCooldown > 0 || this.energy < weapon.energyCost) {
            return null;
        }
        
        // Check range
        const distance = Utils.distance(this.x, this.y, targetX, targetY);
        if (distance > weapon.range) {
            return null;
        }
        
        // Consume energy
        this.energy -= weapon.energyCost;
        
        // Set cooldown
        this.attackCooldown = weapon.cooldown;
        
        // Update combo
        this.combo++;
        this.maxCombo = Math.max(this.maxCombo, this.combo);
        this.lastAttackTime = Date.now();
        
        // Create projectile or effect
        const attack = {
            id: Utils.generateId(),
            weapon: this.currentWeapon,
            damage: weapon.damage + (weapon.level - 1) * 5,
            x: this.x,
            y: this.y,
            targetX,
            targetY,
            range: weapon.range,
            areaOfEffect: weapon.areaOfEffect || false,
            healing: weapon.healing || false,
            combo: this.combo
        };
        
        // Play attack sound
        Utils.playSound(`attack_${this.currentWeapon}`, 0.4);
        
        return attack;
    }
    
    // Use ability
    useAbility(abilityName) {
        const ability = this.abilities.get(abilityName);
        if (!ability || !ability.unlocked || this.energy < ability.energyCost) {
            return false;
        }
        
        // Check if ability is on cooldown
        if (ability.lastUsed && Date.now() - ability.lastUsed < ability.cooldown) {
            return false;
        }
        
        // Consume energy
        this.energy -= ability.energyCost;
        
        // Apply ability effect
        this.addEffect(ability.effect, {
            duration: ability.duration,
            source: abilityName
        });
        
        // Set cooldown
        ability.lastUsed = Date.now();
        
        // Play ability sound
        Utils.playSound(`ability_${abilityName}`, 0.5);
        
        return true;
    }
    
    // Switch weapon
    switchWeapon(weaponName) {
        if (this.weapons.has(weaponName) && this.weapons.get(weaponName).unlocked) {
            this.currentWeapon = weaponName;
            return true;
        }
        return false;
    }
    
    // Gain experience
    gainExperience(amount) {
        this.experience += amount;
        
        // Check for level up
        const requiredExp = this.level * 100;
        if (this.experience >= requiredExp) {
            this.levelUp();
        }
    }
    
    // Level up
    levelUp() {
        this.level++;
        this.experience = 0;
        
        // Increase stats
        this.maxHealth += 20;
        this.health = this.maxHealth; // Full heal on level up
        this.maxEnergy += 10;
        this.energy = this.maxEnergy;
        
        // Unlock weapons/abilities based on level
        if (this.level === 3) {
            this.weapons.get('enxaguante').unlocked = true;
        }
        if (this.level === 5) {
            this.weapons.get('fluor').unlocked = true;
            this.abilities.get('protecao-fluor').unlocked = true;
        }
        
        // Create level up effect
        Utils.createParticle(this.x, this.y - 30, 'LEVEL UP!', 'heal');
        Utils.playSound('levelup', 0.6);
    }
    
    // Upgrade weapon
    upgradeWeapon(weaponName) {
        const weapon = this.weapons.get(weaponName);
        if (weapon && weapon.level < 5) {
            weapon.level++;
            return true;
        }
        return false;
    }
    
    // Get current weapon info
    getCurrentWeapon() {
        return this.weapons.get(this.currentWeapon);
    }
    
    // Get energy percentage
    getEnergyPercentage() {
        return (this.energy / this.maxEnergy) * 100;
    }
    
    // Draw hero
    draw(ctx) {
        ctx.save();
        
        // Draw hero body
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        
        // Hero color based on effects
        let heroColor = '#4A90E2';
        if (this.hasEffect('speed_boost')) heroColor = '#27AE60';
        if (this.hasEffect('damage_reduction')) heroColor = '#F39C12';
        if (this.invulnerable) heroColor = 'rgba(255,255,255,0.7)';
        
        ctx.fillStyle = heroColor;
        ctx.fill();
        ctx.strokeStyle = '#2C3E50';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Draw hero face
        ctx.fillStyle = '#2C3E50';
        // Eyes
        ctx.beginPath();
        ctx.arc(this.x - 8, this.y - 5, 3, 0, Math.PI * 2);
        ctx.arc(this.x + 8, this.y - 5, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Smile
        ctx.beginPath();
        ctx.arc(this.x, this.y + 5, 8, 0, Math.PI);
        ctx.strokeStyle = '#2C3E50';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw weapon indicator
        const weapon = this.getCurrentWeapon();
        if (weapon) {
            ctx.fillStyle = '#FFD700';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(weapon.name.charAt(0), this.x, this.y - this.radius - 5);
        }
        
        // Draw health bar
        if (this.health < this.maxHealth) {
            const barWidth = this.radius * 2.5;
            const barHeight = 6;
            const barX = this.x - barWidth / 2;
            const barY = this.y - this.radius - 20;
            
            // Background
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.fillRect(barX, barY, barWidth, barHeight);
            
            // Health
            const healthWidth = (this.health / this.maxHealth) * barWidth;
            ctx.fillStyle = this.health > this.maxHealth * 0.5 ? '#27AE60' : '#E74C3C';
            ctx.fillRect(barX, barY, healthWidth, barHeight);
        }
        
        // Draw energy bar
        const energyBarWidth = this.radius * 2.5;
        const energyBarHeight = 4;
        const energyBarX = this.x - energyBarWidth / 2;
        const energyBarY = this.y + this.radius + 10;
        
        // Background
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fillRect(energyBarX, energyBarY, energyBarWidth, energyBarHeight);
        
        // Energy
        const energyWidth = (this.energy / this.maxEnergy) * energyBarWidth;
        ctx.fillStyle = '#3498DB';
        ctx.fillRect(energyBarX, energyBarY, energyWidth, energyBarHeight);
        
        ctx.restore();
    }
}

