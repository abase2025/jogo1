// ===== WEAPON AND PROJECTILE CLASSES =====

// Base Projectile class
class Projectile {
    constructor(x, y, targetX, targetY, weapon) {
        this.id = Utils.generateId();
        this.x = x;
        this.y = y;
        this.startX = x;
        this.startY = y;
        this.targetX = targetX;
        this.targetY = targetY;
        this.weapon = weapon;
        this.speed = weapon.speed || 8;
        this.damage = weapon.damage;
        this.range = weapon.range;
        this.radius = weapon.radius || 4;
        this.alive = true;
        this.traveled = 0;
        this.piercing = weapon.piercing || false;
        this.areaOfEffect = weapon.areaOfEffect || false;
        this.healing = weapon.healing || false;
        this.hitTargets = new Set();
        
        // Calculate direction
        const angle = Utils.angle(x, y, targetX, targetY);
        this.velocityX = Math.cos(angle) * this.speed;
        this.velocityY = Math.sin(angle) * this.speed;
        this.angle = angle;
        
        // Visual properties
        this.color = weapon.color || '#FFD700';
        this.trail = [];
        this.maxTrailLength = 5;
        
        // Special effects
        this.effects = weapon.effects || [];
        this.particles = [];
    }
    
    // Update projectile
    update(deltaTime) {
        if (!this.alive) return;
        
        // Move projectile
        const moveDistance = this.speed * (deltaTime / 16.67);
        this.x += this.velocityX * (deltaTime / 16.67);
        this.y += this.velocityY * (deltaTime / 16.67);
        this.traveled += moveDistance;
        
        // Add to trail
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > this.maxTrailLength) {
            this.trail.shift();
        }
        
        // Check if projectile exceeded range
        if (this.traveled >= this.range) {
            this.explode();
        }
        
        // Update particles
        this.particles = this.particles.filter(particle => {
            particle.life -= deltaTime;
            particle.x += particle.vx * (deltaTime / 16.67);
            particle.y += particle.vy * (deltaTime / 16.67);
            return particle.life > 0;
        });
    }
    
    // Check collision with target
    checkCollision(target) {
        if (!this.alive || !target.alive || this.hitTargets.has(target.id)) {
            return false;
        }
        
        const distance = Utils.distance(this.x, this.y, target.x, target.y);
        return distance <= (this.radius + target.radius);
    }
    
    // Hit target
    hit(target) {
        if (!this.alive || this.hitTargets.has(target.id)) return false;
        
        // Mark target as hit
        this.hitTargets.add(target.id);
        
        // Apply damage or healing
        if (this.healing && target instanceof Hero) {
            target.heal(this.damage);
        } else if (!this.healing && target instanceof Enemy) {
            target.takeDamage(this.damage, this);
        }
        
        // Apply weapon effects
        this.applyEffects(target);
        
        // Create hit effect
        this.createHitEffect(target);
        
        // Destroy projectile if not piercing
        if (!this.piercing) {
            this.explode();
        }
        
        return true;
    }
    
    // Apply weapon effects to target
    applyEffects(target) {
        for (const effect of this.effects) {
            target.addEffect(effect.name, effect);
        }
    }
    
    // Create hit effect
    createHitEffect(target) {
        // Create particles
        for (let i = 0; i < 5; i++) {
            this.particles.push({
                x: target.x + Utils.random(-10, 10),
                y: target.y + Utils.random(-10, 10),
                vx: Utils.random(-2, 2),
                vy: Utils.random(-2, 2),
                life: 300,
                color: this.color,
                size: Utils.random(2, 4)
            });
        }
        
        // Play hit sound
        Utils.playSound(`hit_${this.weapon.name}`, 0.3);
    }
    
    // Explode projectile
    explode() {
        this.alive = false;
        
        if (this.areaOfEffect) {
            // Create explosion effect
            Utils.createExplosion(this.x, this.y, this.weapon.aoeRadius || 50);
            
            // Return explosion data for game to handle area damage
            return {
                x: this.x,
                y: this.y,
                radius: this.weapon.aoeRadius || 50,
                damage: this.damage * 0.7, // Reduced AOE damage
                healing: this.healing,
                effects: this.effects
            };
        }
        
        return null;
    }
    
    // Draw projectile
    draw(ctx) {
        if (!this.alive) return;
        
        ctx.save();
        
        // Draw trail
        if (this.trail.length > 1) {
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.5;
            
            ctx.beginPath();
            ctx.moveTo(this.trail[0].x, this.trail[0].y);
            for (let i = 1; i < this.trail.length; i++) {
                ctx.lineTo(this.trail[i].x, this.trail[i].y);
            }
            ctx.stroke();
        }
        
        // Draw projectile
        ctx.globalAlpha = 1;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw glow effect
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // Draw particles
        for (const particle of this.particles) {
            ctx.fillStyle = particle.color;
            ctx.globalAlpha = particle.life / 300;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
}

// Weapon definitions
class WeaponSystem {
    constructor() {
        this.weapons = new Map();
        this.initializeWeapons();
    }
    
    // Initialize all weapons
    initializeWeapons() {
        // Escova de Dentes
        this.weapons.set('escova', {
            name: 'Escova de Dentes',
            description: 'Arma básica para remover placa bacteriana e cáries iniciais',
            damage: 15,
            speed: 6,
            range: 80,
            cooldown: 300,
            energyCost: 5,
            radius: 4,
            color: '#4A90E2',
            sound: 'brush',
            effects: [
                {
                    name: 'clean',
                    duration: 1000,
                    description: 'Remove sujeira'
                }
            ],
            educational: {
                tip: 'A escovação deve ser feita pelo menos 2 vezes ao dia, de manhã e antes de dormir.',
                fact: 'Use movimentos circulares suaves para não machucar a gengiva.'
            }
        });
        
        // Fio Dental
        this.weapons.set('fio-dental', {
            name: 'Fio Dental',
            description: 'Ataque de precisão que atravessa inimigos entre os dentes',
            damage: 25,
            speed: 8,
            range: 120,
            cooldown: 500,
            energyCost: 8,
            radius: 3,
            color: '#FFFFFF',
            piercing: true,
            sound: 'floss',
            effects: [
                {
                    name: 'precision_clean',
                    duration: 1500,
                    description: 'Limpeza profunda entre os dentes'
                }
            ],
            educational: {
                tip: 'O fio dental remove até 40% mais placa que apenas a escovação.',
                fact: 'Use fio dental diariamente para prevenir gengivite e cáries interdentais.'
            }
        });
        
        // Enxaguante Bucal
        this.weapons.set('enxaguante', {
            name: 'Enxaguante Bucal',
            description: 'Ataque em área que elimina bactérias e refresca o hálito',
            damage: 20,
            speed: 5,
            range: 100,
            cooldown: 800,
            energyCost: 15,
            radius: 6,
            color: '#00CED1',
            areaOfEffect: true,
            aoeRadius: 60,
            sound: 'mouthwash',
            effects: [
                {
                    name: 'antibacterial',
                    duration: 3000,
                    description: 'Elimina bactérias residuais'
                },
                {
                    name: 'fresh_breath',
                    duration: 5000,
                    description: 'Hálito refrescante'
                }
            ],
            educational: {
                tip: 'O enxaguante bucal complementa a escovação, mas não a substitui.',
                fact: 'Enxaguantes com flúor ajudam a fortalecer o esmalte dentário.'
            }
        });
        
        // Flúor Tópico
        this.weapons.set('fluor', {
            name: 'Flúor Tópico',
            description: 'Fortalece os dentes e pode curar danos leves',
            damage: 10,
            speed: 4,
            range: 60,
            cooldown: 1000,
            energyCost: 20,
            radius: 5,
            color: '#32CD32',
            healing: true,
            sound: 'fluoride',
            effects: [
                {
                    name: 'strengthen',
                    duration: 8000,
                    description: 'Fortalece o esmalte dentário'
                },
                {
                    name: 'remineralization',
                    duration: 5000,
                    description: 'Remineraliza áreas desmineralizadas'
                }
            ],
            educational: {
                tip: 'O flúor é essencial para prevenir cáries e fortalecer os dentes.',
                fact: 'Aplicações profissionais de flúor são mais concentradas que as domésticas.'
            }
        });
        
        // Sonda Exploradora (Habilidade especial)
        this.weapons.set('sonda', {
            name: 'Sonda Exploradora',
            description: 'Revela pontos fracos dos inimigos e áreas problemáticas',
            damage: 5,
            speed: 10,
            range: 150,
            cooldown: 2000,
            energyCost: 25,
            radius: 2,
            color: '#C0C0C0',
            special: true,
            sound: 'probe',
            effects: [
                {
                    name: 'reveal_weakness',
                    duration: 10000,
                    description: 'Revela pontos fracos'
                },
                {
                    name: 'diagnostic',
                    duration: 5000,
                    description: 'Diagnóstico preciso'
                }
            ],
            educational: {
                tip: 'A sonda exploradora ajuda o dentista a detectar cáries em estágio inicial.',
                fact: 'Exames regulares permitem tratamento precoce e menos invasivo.'
            }
        });
        
        // Escavador (Habilidade especial)
        this.weapons.set('escavador', {
            name: 'Escavador',
            description: 'Ataque poderoso contra cáries avançadas',
            damage: 40,
            speed: 3,
            range: 50,
            cooldown: 1500,
            energyCost: 30,
            radius: 6,
            color: '#B8860B',
            special: true,
            sound: 'excavator',
            effects: [
                {
                    name: 'deep_clean',
                    duration: 2000,
                    description: 'Remoção profunda de cárie'
                }
            ],
            educational: {
                tip: 'O escavador remove tecido cariado antes da restauração.',
                fact: 'Técnicas modernas preservam ao máximo o tecido dentário saudável.'
            }
        });
        
        // Jato de Água (Profilaxia)
        this.weapons.set('jato-agua', {
            name: 'Jato de Água',
            description: 'Limpeza profissional que remove placa e tártaro',
            damage: 30,
            speed: 7,
            range: 90,
            cooldown: 1200,
            energyCost: 18,
            radius: 5,
            color: '#87CEEB',
            areaOfEffect: true,
            aoeRadius: 40,
            sound: 'water_jet',
            effects: [
                {
                    name: 'professional_clean',
                    duration: 4000,
                    description: 'Limpeza profissional completa'
                }
            ],
            educational: {
                tip: 'A profilaxia profissional deve ser feita a cada 6 meses.',
                fact: 'O jato de água remove biofilme e manchas superficiais.'
            }
        });
    }
    
    // Get weapon data
    getWeapon(weaponName) {
        return this.weapons.get(weaponName);
    }
    
    // Create projectile for weapon
    createProjectile(weaponName, x, y, targetX, targetY, level = 1) {
        const weaponData = this.getWeapon(weaponName);
        if (!weaponData) return null;
        
        // Apply level scaling
        const scaledWeapon = { ...weaponData };
        scaledWeapon.damage += (level - 1) * 5;
        scaledWeapon.speed += (level - 1) * 0.5;
        scaledWeapon.range += (level - 1) * 10;
        
        return new Projectile(x, y, targetX, targetY, scaledWeapon);
    }
    
    // Get all unlocked weapons
    getUnlockedWeapons(heroLevel) {
        const unlocked = [];
        
        for (const [name, weapon] of this.weapons) {
            // Basic weapons always unlocked
            if (['escova', 'fio-dental'].includes(name)) {
                unlocked.push({ name, ...weapon });
            }
            // Level-based unlocks
            else if (name === 'enxaguante' && heroLevel >= 3) {
                unlocked.push({ name, ...weapon });
            }
            else if (name === 'fluor' && heroLevel >= 5) {
                unlocked.push({ name, ...weapon });
            }
            else if (name === 'sonda' && heroLevel >= 4) {
                unlocked.push({ name, ...weapon });
            }
            else if (name === 'escavador' && heroLevel >= 6) {
                unlocked.push({ name, ...weapon });
            }
            else if (name === 'jato-agua' && heroLevel >= 7) {
                unlocked.push({ name, ...weapon });
            }
        }
        
        return unlocked;
    }
    
    // Get weapon educational content
    getEducationalContent(weaponName) {
        const weapon = this.getWeapon(weaponName);
        return weapon ? weapon.educational : null;
    }
    
    // Get random educational tip
    getRandomTip() {
        const weapons = Array.from(this.weapons.values());
        const randomWeapon = Utils.randomChoice(weapons);
        return randomWeapon.educational;
    }
}

// Power-up class
class PowerUp {
    constructor(x, y, type) {
        this.id = Utils.generateId();
        this.x = x;
        this.y = y;
        this.type = type;
        this.radius = 15;
        this.alive = true;
        this.collected = false;
        this.spawnTime = Date.now();
        this.lifetime = 10000; // 10 seconds
        this.floatOffset = 0;
        this.floatSpeed = 0.002;
        
        // Type-specific properties
        this.setupType();
    }
    
    // Setup type-specific properties
    setupType() {
        switch (this.type) {
            case 'health':
                this.color = '#E74C3C';
                this.value = 25;
                this.icon = '❤️';
                break;
            case 'energy':
                this.color = '#3498DB';
                this.value = 30;
                this.icon = '⚡';
                break;
            case 'points':
                this.color = '#F1C40F';
                this.value = 50;
                this.icon = '⭐';
                break;
            case 'weapon_upgrade':
                this.color = '#9B59B6';
                this.value = 1;
                this.icon = '🔧';
                break;
            case 'shield':
                this.color = '#95A5A6';
                this.value = 5000; // Duration in ms
                this.icon = '🛡️';
                break;
            default:
                this.color = '#BDC3C7';
                this.value = 10;
                this.icon = '?';
        }
    }
    
    // Update power-up
    update(deltaTime) {
        if (!this.alive) return;
        
        // Check lifetime
        if (Date.now() - this.spawnTime > this.lifetime) {
            this.alive = false;
            return;
        }
        
        // Floating animation
        this.floatOffset += this.floatSpeed * deltaTime;
        this.y += Math.sin(this.floatOffset) * 0.5;
    }
    
    // Check collision with hero
    checkCollision(hero) {
        if (!this.alive || this.collected || !hero.alive) {
            return false;
        }
        
        const distance = Utils.distance(this.x, this.y, hero.x, hero.y);
        return distance <= (this.radius + hero.radius);
    }
    
    // Collect power-up
    collect(hero) {
        if (this.collected || !this.alive) return false;
        
        this.collected = true;
        this.alive = false;
        
        // Apply effect based on type
        switch (this.type) {
            case 'health':
                hero.heal(this.value);
                break;
            case 'energy':
                hero.energy = Math.min(hero.maxEnergy, hero.energy + this.value);
                break;
            case 'points':
                // Points will be handled by game manager
                break;
            case 'weapon_upgrade':
                // Weapon upgrade will be handled by game manager
                break;
            case 'shield':
                hero.addEffect('shield', {
                    duration: this.value,
                    damageReduction: 0.5
                });
                break;
        }
        
        // Create collection effect
        Utils.createParticle(this.x, this.y - 20, `+${this.value}`, 'heal');
        Utils.playSound('powerup_collect', 0.4);
        
        return true;
    }
    
    // Draw power-up
    draw(ctx) {
        if (!this.alive) return;
        
        ctx.save();
        
        // Pulsing effect
        const pulse = 1 + Math.sin(Date.now() * 0.005) * 0.1;
        const currentRadius = this.radius * pulse;
        
        // Draw glow
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 15;
        ctx.fillStyle = this.color;
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.arc(this.x, this.y, currentRadius + 5, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw main circle
        ctx.globalAlpha = 0.8;
        ctx.shadowBlur = 5;
        ctx.beginPath();
        ctx.arc(this.x, this.y, currentRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw icon
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(this.icon, this.x, this.y);
        
        // Draw lifetime indicator
        const lifetimePercent = 1 - (Date.now() - this.spawnTime) / this.lifetime;
        if (lifetimePercent < 0.3) {
            ctx.strokeStyle = '#E74C3C';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x, this.y, currentRadius + 8, 0, Math.PI * 2 * lifetimePercent);
            ctx.stroke();
        }
        
        ctx.restore();
    }
}

