// content.js - OPTIMIZED Page-level security monitoring
console.log('🔒 CyberPet OPTIMIZED content script loaded');

class OptimizedPageSecurityMonitor {
    constructor() {
        this.initialized = false;
        this.init();
    }

    init() {
        if (this.initialized) return;
        
        this.fastMonitorPasswordFields();
        this.immediateSecurityCheck();
        console.log('⚡ Optimized page security monitoring started');
        this.initialized = true;
    }

    fastMonitorPasswordFields() {
        // Fast initial check
        this.fastCheckPasswordFields();
        
        // Efficient mutation observer
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.addedNodes.length > 0) {
                    this.fastCheckPasswordFields();
                    break;
                }
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            childList: true
        });
    }

    fastCheckPasswordFields() {
        const passwordFields = document.querySelectorAll('input[type="password"]');
        
        for (const field of passwordFields) {
            if (!field.hasAttribute('data-cyberpet-monitored')) {
                field.setAttribute('data-cyberpet-monitored', 'true');
                
                // Fast event listeners
                field.addEventListener('input', this.debounce((event) => {
                    this.fastAnalyzePassword(event.target.value);
                }, 300));
                
                field.addEventListener('blur', (event) => {
                    if (event.target.value) {
                        this.fastAnalyzePassword(event.target.value);
                    }
                });
            }
        }
    }

    debounce(func, wait) {
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

    fastAnalyzePassword(password) {
        if (!password || password.length < 4) return;

        const strength = this.quickPasswordCheck(password);
        
        if (strength === 'weak') {
            this.fastReportWeakPassword(password.length);
        }
    }

    quickPasswordCheck(password) {
        // Ultra-fast password check
        if (password.length < 8) return 'weak';
        
        const weakPatterns = [
            'password', '123456', 'qwerty', 'admin', 'welcome'
        ];
        
        const lowerPass = password.toLowerCase();
        if (weakPatterns.some(pattern => lowerPass.includes(pattern))) {
            return 'weak';
        }
        
        return 'adequate';
    }

    fastReportWeakPassword(length) {
        const threat = {
            type: 'weak_password',
            message: `Weak password detected (only ${length} characters)`,
            severity: 'warning',
            url: window.location.href,
            timestamp: new Date().toISOString(),
            source: 'Fast Password Check'
        };

        // Non-blocking threat report
        chrome.runtime.sendMessage({
            action: 'reportThreat',
            threat: threat
        });
    }

    immediateSecurityCheck() {
        // Fast HTTP check
        if (window.location.protocol === 'http:' && 
            !window.location.hostname.includes('localhost') && 
            !window.location.hostname.includes('127.0.0.1')) {
            
            chrome.runtime.sendMessage({
                action: 'reportThreat',
                threat: {
                    type: 'insecure_connection',
                    message: `Unencrypted HTTP connection to ${window.location.hostname}`,
                    severity: 'warning',
                    url: window.location.href,
                    timestamp: new Date().toISOString(),
                    source: 'Immediate Protocol Check'
                }
            });
        }

        // Quick mixed content check
        this.fastMixedContentCheck();
    }

    fastMixedContentCheck() {
        const elements = document.querySelectorAll('script[src^="http://"], iframe[src^="http://"]');
        if (elements.length > 0 && window.location.protocol === 'https:') {
            chrome.runtime.sendMessage({
                action: 'reportThreat',
                threat: {
                    type: 'mixed_content',
                    message: 'Mixed content: HTTP resources on HTTPS page',
                    severity: 'warning',
                    url: window.location.href,
                    timestamp: new Date().toISOString(),
                    source: 'Content Security'
                }
            });
        }
    }
}

// Fast initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new OptimizedPageSecurityMonitor();
    });
} else {
    new OptimizedPageSecurityMonitor();
}