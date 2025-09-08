/**
 * Theme Manager
 * Handles site-wide theme switching between light, dark, and system preference
 */
class ThemeManager {
    constructor() {
        console.log('ThemeManager constructor called');
        this.themes = {
            light: 'light',
            dark: 'dark',
            system: 'system'
        };
        
        this.currentTheme = this.getStoredTheme() || 'system';
        this.systemTheme = this.getSystemTheme();
        
        console.log('Initial theme state:', {
            currentTheme: this.currentTheme,
            systemTheme: this.systemTheme,
            storedTheme: this.getStoredTheme()
        });
        
        // Listen for system theme changes
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                this.systemTheme = e.matches ? 'dark' : 'light';
                console.log('System theme changed to:', this.systemTheme);
                if (this.currentTheme === 'system') {
                    this.applyTheme();
                }
            });
        }
        
        // Initialize theme
        this.applyTheme();
        
        // Create theme toggle button
        this.createThemeToggle();
        console.log('ThemeManager constructor completed');
    }
    
    /**
     * Get the current system theme preference
     * @returns {string} 'dark' or 'light'
     */
    getSystemTheme() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    }
    
    /**
     * Get stored theme preference from localStorage
     * @returns {string|null} Stored theme or null
     */
    getStoredTheme() {
        return localStorage.getItem('theme-preference');
    }
    
    /**
     * Store theme preference in localStorage
     * @param {string} theme - Theme to store
     */
    storeTheme(theme) {
        localStorage.setItem('theme-preference', theme);
    }
    
    /**
     * Get the effective theme (resolves 'system' to actual theme)
     * @returns {string} 'light' or 'dark'
     */
    getEffectiveTheme() {
        if (this.currentTheme === 'system') {
            return this.systemTheme;
        }
        return this.currentTheme;
    }
    
    /**
     * Apply the current theme to the document
     */
    applyTheme() {
        const effectiveTheme = this.getEffectiveTheme();
        const html = document.documentElement;
        
        // Remove existing theme attributes
        html.removeAttribute('data-theme');
        
        // Apply new theme
        if (effectiveTheme === 'dark') {
            html.setAttribute('data-theme', 'dark');
        }
        
        // Update theme toggle button
        this.updateThemeToggle();
        
        // Dispatch theme change event
        window.dispatchEvent(new CustomEvent('themeChanged', {
            detail: {
                theme: this.currentTheme,
                effectiveTheme: effectiveTheme
            }
        }));
    }
    
    /**
     * Set a new theme
     * @param {string} theme - Theme to set ('light', 'dark', or 'system')
     */
    setTheme(theme) {
        if (!Object.values(this.themes).includes(theme)) {
            console.warn(`Invalid theme: ${theme}`);
            return;
        }
        
        this.currentTheme = theme;
        this.storeTheme(theme);
        this.applyTheme();
    }
    
    /**
     * Toggle between light and dark themes
     */
    toggleTheme() {
        const effectiveTheme = this.getEffectiveTheme();
        const newTheme = effectiveTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }
    
    /**
     * Cycle through all available themes
     */
    cycleTheme() {
        const themes = ['light', 'dark', 'system'];
        const currentIndex = themes.indexOf(this.currentTheme);
        const nextIndex = (currentIndex + 1) % themes.length;
        this.setTheme(themes[nextIndex]);
    }
    
    /**
     * Create floating theme toggle button
     */
    createThemeToggle() {
        // Check if toggle already exists
        if (document.getElementById('theme-toggle')) {
            return;
        }
        
        const toggle = document.createElement('div');
        toggle.id = 'theme-toggle';
        toggle.className = 'theme-toggle';
        toggle.setAttribute('title', 'Toggle Theme');
        toggle.innerHTML = '<i class="fas fa-palette"></i>';
        
        // Add click handler
        toggle.addEventListener('click', () => {
            this.cycleTheme();
        });
        
        // Add to page
        document.body.appendChild(toggle);
        
        // Update initial state
        this.updateThemeToggle();
    }
    
    /**
     * Update theme toggle button appearance
     */
    updateThemeToggle() {
        const toggle = document.getElementById('theme-toggle');
        if (!toggle) return;
        
        const effectiveTheme = this.getEffectiveTheme();
        const icon = toggle.querySelector('i');
        
        // Update icon and title based on current theme
        let iconClass, title;
        
        switch (this.currentTheme) {
            case 'light':
                iconClass = 'fas fa-sun';
                title = 'Theme: Light (click for Dark)';
                break;
            case 'dark':
                iconClass = 'fas fa-moon';
                title = 'Theme: Dark (click for System)';
                break;
            case 'system':
                iconClass = effectiveTheme === 'dark' ? 'fas fa-adjust' : 'fas fa-adjust';
                title = `Theme: System (${effectiveTheme}) (click for Light)`;
                break;
            default:
                iconClass = 'fas fa-palette';
                title = 'Toggle Theme';
        }
        
        icon.className = iconClass;
        toggle.setAttribute('title', title);
        
        // Add tooltip if Bootstrap is available
        if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
            // Dispose existing tooltip
            const existingTooltip = bootstrap.Tooltip.getInstance(toggle);
            if (existingTooltip) {
                existingTooltip.dispose();
            }
            
            // Create new tooltip
            new bootstrap.Tooltip(toggle, {
                title: title,
                placement: 'left'
            });
        }
    }
    
    /**
     * Get current theme info
     * @returns {Object} Theme information
     */
    getThemeInfo() {
        return {
            current: this.currentTheme,
            effective: this.getEffectiveTheme(),
            system: this.systemTheme,
            available: Object.values(this.themes)
        };
    }
}

// Initialize theme manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('Theme Manager: Initializing...');
    window.themeManager = new ThemeManager();
    console.log('Theme Manager: Initialized with theme:', window.themeManager.currentTheme);
    
    // Initialize theme from user preferences if available
    if (window.userPreferences && typeof window.userPreferences.get === 'function') {
        const savedTheme = window.userPreferences.get('display.theme');
        if (savedTheme && savedTheme !== window.themeManager.currentTheme) {
            console.log('Theme Manager: Setting theme from user preferences:', savedTheme);
            window.themeManager.setTheme(savedTheme);
        }
    }
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThemeManager;
}

// Make available globally
window.ThemeManager = ThemeManager;
