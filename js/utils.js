// ===== UTILITY FUNCTIONS =====

// Utility class for common game functions
class Utils {
    // Get random number between min and max
    static random(min, max) {
        return Math.random() * (max - min) + min;
    }
    
    // Get random integer between min and max
    static randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    // Calculate distance between two points
    static distance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    // Calculate angle between two points
    static angle(x1, y1, x2, y2) {
        return Math.atan2(y2 - y1, x2 - x1);
    }
    
    // Normalize angle to 0-2π range
    static normalizeAngle(angle) {
        while (angle < 0) angle += Math.PI * 2;
        while (angle >= Math.PI * 2) angle -= Math.PI * 2;
        return angle;
    }
    
    // Linear interpolation
    static lerp(start, end, factor) {
        return start + (end - start) * factor;
    }
    
    // Clamp value between min and max
    static clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }
    
    // Check collision between two circles
    static circleCollision(x1, y1, r1, x2, y2, r2) {
        const distance = this.distance(x1, y1, x2, y2);
        return distance < (r1 + r2);
    }
    
    // Check if point is inside rectangle
    static pointInRect(px, py, rx, ry, rw, rh) {
        return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
    }
    
    // Convert degrees to radians
    static degToRad(degrees) {
        return degrees * (Math.PI / 180);
    }
    
    // Convert radians to degrees
    static radToDeg(radians) {
        return radians * (180 / Math.PI);
    }
    
    // Format number with commas
    static formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }
    
    // Format time in MM:SS format
    static formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    // Get random element from array
    static randomChoice(array) {
        return array[Math.floor(Math.random() * array.length)];
    }
    
    // Shuffle array
    static shuffle(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    
    // Deep clone object
    static deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }
    
    // Debounce function
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // Throttle function
    static throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    
    // Create particle effect
    static createParticle(x, y, text, className = 'damage') {
        const particle = document.createElement('div');
        particle.className = `particle ${className}`;
        particle.textContent = text;
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.position = 'absolute';
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '200';
        
        document.body.appendChild(particle);
        
        // Remove particle after animation
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 1000);
        
        return particle;
    }
    
    // Play sound effect
    static playSound(soundName, volume = 0.5) {
        try {
            const audio = new Audio(`assets/sounds/effects/${soundName}.mp3`);
            audio.volume = volume;
            audio.play().catch(e => console.log('Sound play failed:', e));
        } catch (e) {
            console.log('Sound loading failed:', e);
        }
    }
    
    // Save to localStorage
    static saveData(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('Failed to save data:', e);
            return false;
        }
    }
    
    // Load from localStorage
    static loadData(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (e) {
            console.error('Failed to load data:', e);
            return defaultValue;
        }
    }
    
    // Clear localStorage
    static clearData(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('Failed to clear data:', e);
            return false;
        }
    }
    
    // Check if device is mobile
    static isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
    
    // Check if device supports touch
    static isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }
    
    // Get canvas coordinates from mouse/touch event
    static getCanvasCoordinates(event, canvas) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        let clientX, clientY;
        
        if (event.touches && event.touches.length > 0) {
            clientX = event.touches[0].clientX;
            clientY = event.touches[0].clientY;
        } else {
            clientX = event.clientX;
            clientY = event.clientY;
        }
        
        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY
        };
    }
    
    // Preload image
    static preloadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    }
    
    // Preload multiple images
    static async preloadImages(sources) {
        const promises = sources.map(src => this.preloadImage(src));
        try {
            return await Promise.all(promises);
        } catch (error) {
            console.error('Failed to preload images:', error);
            return [];
        }
    }
    
    // Create explosion effect
    static createExplosion(x, y, size = 40) {
        const explosion = document.createElement('div');
        explosion.className = 'particle explosion';
        explosion.style.left = (x - size/2) + 'px';
        explosion.style.top = (y - size/2) + 'px';
        explosion.style.width = size + 'px';
        explosion.style.height = size + 'px';
        explosion.style.position = 'absolute';
        explosion.style.pointerEvents = 'none';
        explosion.style.zIndex = '150';
        
        document.body.appendChild(explosion);
        
        setTimeout(() => {
            if (explosion.parentNode) {
                explosion.parentNode.removeChild(explosion);
            }
        }, 500);
        
        return explosion;
    }
    
    // Generate unique ID
    static generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    // Validate email format
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // Get browser info
    static getBrowserInfo() {
        const ua = navigator.userAgent;
        let browser = 'Unknown';
        
        if (ua.includes('Chrome')) browser = 'Chrome';
        else if (ua.includes('Firefox')) browser = 'Firefox';
        else if (ua.includes('Safari')) browser = 'Safari';
        else if (ua.includes('Edge')) browser = 'Edge';
        else if (ua.includes('Opera')) browser = 'Opera';
        
        return {
            browser,
            userAgent: ua,
            platform: navigator.platform,
            language: navigator.language
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}

