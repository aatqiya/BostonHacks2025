// background.js - ENHANCED Real-time Security with Blocking
console.log('🛡️ CyberPet background service worker started - ENHANCED');

class ThreatIntelligence {
    constructor() {
        this.cache = new Map();
        this.cacheTimeout = 300000; // 5 minutes
    }
    
    async checkWithExternalAPI(url) {
        const cached = this.cache.get(url);
        if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
            return cached.result;
        }
        
        // Simulate external API call
        try {
            const result = await this.simulateAPICall(url);
            this.cache.set(url, { result, timestamp: Date.now() });
            return result;
        } catch (error) {
            console.warn('Threat intelligence API failed:', error);
            return { isThreat: false, confidence: 0 };
        }
    }
    
    async simulateAPICall(url) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 50));
        
        // Enhanced detection patterns
        const hostname = new URL(url).hostname.toLowerCase();
        
        // More sophisticated phishing detection
        const phishingPatterns = [
            /login\.\w+\.\w+\.\w+/gi, // Multiple subdomains before login
            /(verify|secure|account)\.\w+-\w+\./gi, // Suspicious subdomain structures
            /[a-z0-9]{32,}/gi // Long random-looking subdomains
        ];
        
        for (const pattern of phishingPatterns) {
            if (pattern.test(hostname)) {
                return {
                    isThreat: true,
                    threatType: 'sophisticated_phishing',
                    message: 'Advanced phishing pattern detected',
                    severity: 'danger',
                    confidence: 85
                };
            }
        }
        
        return { isThreat: false, confidence: 0 };
    }
}

class EnhancedSecurityMonitor {
    constructor() {
        this.threats = [];
        this.blockedSites = new Set();
        this.threatIntel = new ThreatIntelligence();
        this.systemStats = {
            cpuUsage: 0,
            memoryUsage: 0,
            trackersBlocked: 0,
            threatsBlocked: 0,
            startTime: Date.now()
        };
        this.performance = {
            requestsAnalyzed: 0,
            threatsDetected: 0,
            avgAnalysisTime: 0
        };
        this.currentPageSafe = true;
        this.currentUrl = '';
        this.init();
    }

    init() {
        this.setupOptimizedBlocking();
        this.setupRealTimeMonitoring();
        this.startSystemMonitoring();
        console.log('⚡ Enhanced security monitoring with blocking initialized');
    }

    setupOptimizedBlocking() {
        // Block dangerous sites before they load with optimization
        chrome.webRequest.onBeforeRequest.addListener(
            (details) => {
                this.performance.requestsAnalyzed++;
                
                // Skip common safe resources to reduce load
                if (this.isLikelySafe(details.url)) return;
                
                const url = details.url;
                if (this.shouldBlock(url)) {
                    this.systemStats.threatsBlocked++;
                    this.performance.threatsDetected++;
                    this.handleBlockedSite(url);
                    return { cancel: true };
                }
            },
            { urls: ["<all_urls>"] },
            ["blocking"]
        );
    }

    isLikelySafe(url) {
        const safeExtensions = ['.css', '.png', '.jpg', '.jpeg', '.gif', '.woff', '.ttf', '.svg'];
        const safePatterns = [
            /chrome-extension:\/\//,
            /chrome:\/\//,
            /about:/,
            /data:/
        ];
        
        return safeExtensions.some(ext => url.includes(ext)) || 
               safePatterns.some(pattern => pattern.test(url));
    }

    async shouldBlock(url) {
        const startTime = performance.now();
        
        try {
            const analysis = this.fastAnalyzeURL(url);
            
            // Enhanced detection with external intelligence
            if (!analysis.isThreat && this.isSuspiciousForDeepCheck(url)) {
                const intelResult = await this.threatIntel.checkWithExternalAPI(url);
                if (intelResult.isThreat) {
                    Object.assign(analysis, intelResult);
                }
            }
            
            const analysisTime = performance.now() - startTime;
            this.updatePerformanceMetrics(analysisTime);
            
            return analysis.isThreat && analysis.severity === 'danger';
        } catch (error) {
            console.error('URL analysis failed:', error);
            return false;
        }
    }

    isSuspiciousForDeepCheck(url) {
        const urlObj = new URL(url);
        const hostname = urlObj.hostname.toLowerCase();
        
        const suspiciousIndicators = [
            hostname.includes('login'),
            hostname.includes('bank'),
            hostname.includes('pay'),
            hostname.includes('verify'),
            hostname.split('.').length > 3 // Multiple subdomains
        ];
        
        return suspiciousIndicators.some(indicator => indicator);
    }

    updatePerformanceMetrics(analysisTime) {
        // Update rolling average
        this.performance.avgAnalysisTime = 
            (this.performance.avgAnalysisTime * (this.performance.requestsAnalyzed - 1) + analysisTime) / 
            this.performance.requestsAnalyzed;
    }

    handleBlockedSite(url) {
        const threat = {
            type: 'blocked_site',
            message: `Blocked malicious website: ${new URL(url).hostname}`,
            severity: 'danger',
            url: url,
            timestamp: new Date().toISOString(),
            source: 'Real-Time Blocking'
        };
        
        this.handleThreat(threat);
        
        // Redirect to blocker page
        chrome.tabs.update({ url: chrome.runtime.getURL('blocker.html') + '?url=' + encodeURIComponent(url) });
    }

    setupRealTimeMonitoring() {
        // Message handling for popup and content scripts
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            console.log('🔧 Background received:', message);
            
            switch (message.action) {
                case 'getSecurityData':
                    sendResponse({
                        threats: this.threats,
                        blockedCount: this.systemStats.threatsBlocked,
                        currentPageSafe: this.currentPageSafe,
                        currentUrl: this.currentUrl,
                        systemStats: this.systemStats
                    });
                    break;

                case 'reportThreat':
                    this.handleThreat(message.threat);
                    sendResponse({ success: true });
                    break;
                
                case 'getThreats':
                    sendResponse({ threats: this.threats });
                    break;
                
                case 'manualScan':
                    this.fastManualScan().then(() => {
                        sendResponse({ success: true });
                    });
                    return true;
                
                case 'getCurrentStatus':
                    this.getRealTimeStatus().then(status => {
                        sendResponse(status);
                    });
                    return true;
                
                case 'getSystemStats':
                    sendResponse({ stats: this.systemStats });
                    break;
                
                case 'bypassBlock':
                    this.bypassBlock(message.url);
                    sendResponse({ success: true });
                    break;

                case 'pageSafetyUpdate':
                    this.currentPageSafe = message.isSafe;
                    this.currentUrl = message.url || this.currentUrl;
                    this.notifyPopup({
                        action: 'pageSafetyUpdate',
                        isSafe: message.isSafe,
                        url: this.currentUrl
                    });
                    sendResponse({ success: true });
                    break;

                case 'runQuickScan':
                    this.fastManualScan();
                    sendResponse({ status: 'scanning' });
                    break;
            }
        });

        // Real-time navigation monitoring
        chrome.webNavigation.onCommitted.addListener((details) => {
            if (details.frameId === 0) {
                this.fastAnalyzePage(details.tabId, details.url);
                this.updateCurrentPageInfo(details.tabId, details.url);
            }
        });

        chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
            if (changeInfo.url) {
                this.fastAnalyzePage(tabId, changeInfo.url);
                this.updateCurrentPageInfo(tabId, changeInfo.url);
            }
        });

        chrome.tabs.onActivated.addListener(async (activeInfo) => {
            try {
                const tab = await chrome.tabs.get(activeInfo.tabId);
                if (tab.url) {
                    this.updateCurrentPageInfo(activeInfo.tabId, tab.url);
                }
            } catch (error) {
                console.log('Tab update error:', error);
            }
        });

        // Real-time updates every 500ms
        setInterval(() => {
            this.broadcastRealTimeData();
        }, 500);
    }

    updateCurrentPageInfo(tabId, url) {
        if (!url || !url.startsWith('http')) return;
        
        this.currentUrl = new URL(url).hostname;
        this.currentPageSafe = !this.shouldBlock(url);
        
        this.notifyPopup({
            action: 'pageSafetyUpdate',
            isSafe: this.currentPageSafe,
            url: this.currentUrl
        });
    }

    startSystemMonitoring() {
        // Simulate system monitoring (in real app, you'd use system APIs)
        setInterval(() => {
            this.updateSystemStats();
        }, 2000);
    }

    updateSystemStats() {
        // Simulated system metrics
        this.systemStats.cpuUsage = Math.min(100, Math.max(0, 
            20 + Math.random() * 30 + (this.threats.length * 5)
        ));
        
        this.systemStats.memoryUsage = Math.min(100, Math.max(0,
            40 + Math.random() * 25 + (this.threats.length * 3)
        ));
        
        this.systemStats.trackersBlocked = this.threats.filter(t => 
            t.type.includes('tracker') || t.type.includes('ad')
        ).length;
    }

    fastAnalyzePage(tabId, url) {
        if (!url || !url.startsWith('http')) return;

        const analysis = this.fastAnalyzeURL(url);
        
        if (analysis.isThreat) {
            const threat = {
                type: analysis.threatType,
                message: analysis.message,
                severity: analysis.severity,
                url: url,
                timestamp: new Date().toISOString(),
                confidence: analysis.confidence,
                source: 'Real-Time Analysis'
            };
            
            this.handleThreat(threat);
        }

        // Track HTTP sites
        if (url.startsWith('http://') && !url.includes('localhost') && !url.includes('127.0.0.1')) {
            const threat = {
                type: 'insecure_connection',
                message: 'Unencrypted HTTP connection - data not secure',
                severity: 'warning',
                url: url,
                timestamp: new Date().toISOString(),
                confidence: 80,
                source: 'Protocol Check'
            };
            this.handleThreat(threat);
        }
    }

    fastAnalyzeURL(url) {
        try {
            const urlObj = new URL(url);
            const hostname = urlObj.hostname.toLowerCase();
            
            // DANGEROUS SITES (will be blocked)
            const dangerousSites = [
                'malicious-phishing.xyz',
                'fake-paypal-login.tk',
                'steal-password.ml',
                'virus-download.ga',
                '192.168.1.1', // Example IP
                'go0gle.com', // Typosquatting
                'facebo0k.com',
                'paypa1.com'
            ];
            
            if (dangerousSites.includes(hostname)) {
                return {
                    isThreat: true,
                    threatType: 'malicious_site',
                    message: `Known malicious website: ${hostname}`,
                    severity: 'danger',
                    confidence: 95
                };
            }

            // SUSPICIOUS SITES (will trigger warnings)
            const suspiciousTLDs = ['.xyz', '.tk', '.ml', '.ga', '.cf', '.gq', '.top', '.club'];
            if (suspiciousTLDs.some(tld => hostname.endsWith(tld))) {
                return {
                    isThreat: true,
                    threatType: 'suspicious_domain',
                    message: `Suspicious domain: ${hostname}`,
                    severity: 'warning',
                    confidence: 75
                };
            }

            // TRACKER DETECTION
            const trackerKeywords = ['tracker', 'analytics', 'adserver', 'doubleclick', 'googleads'];
            if (trackerKeywords.some(keyword => hostname.includes(keyword))) {
                return {
                    isThreat: true,
                    threatType: 'tracker_detected',
                    message: `Tracker detected: ${hostname}`,
                    severity: 'low',
                    confidence: 60
                };
            }

            return { isThreat: false };

        } catch (error) {
            return { isThreat: false };
        }
    }

    handleThreat(threat) {
        // Prevent duplicates
        const recentDuplicate = this.threats.find(t => 
            t.url === threat.url && 
            t.type === threat.type &&
            (Date.now() - new Date(t.timestamp)) < 2000
        );
        
        if (recentDuplicate) return;

        this.threats.unshift(threat);
        
        if (this.threats.length > 25) {
            this.threats = this.threats.slice(0, 25);
        }
        
        this.updateBadge();
        this.broadcastThreat(threat);
    }

    updateBadge() {
        const dangerCount = this.threats.filter(t => 
            t.severity === 'danger'
        ).length;
        
        if (dangerCount > 0) {
            chrome.action.setBadgeText({ text: dangerCount.toString() });
            chrome.action.setBadgeBackgroundColor({ color: '#EF4444' });
        } else {
            const warningCount = this.threats.filter(t => t.severity === 'warning').length;
            if (warningCount > 0) {
                chrome.action.setBadgeText({ text: warningCount.toString() });
                chrome.action.setBadgeBackgroundColor({ color: '#F59E0B' });
            } else {
                chrome.action.setBadgeText({ text: '' });
            }
        }
    }

    broadcastThreat(threat) {
        this.notifyPopup({
            action: 'threatDetected',
            threat: threat,
            threatCount: this.threats.length
        });
    }

    broadcastRealTimeData() {
        this.notifyPopup({
            action: 'realTimeData',
            threats: this.threats.slice(0, 5),
            systemStats: this.systemStats,
            timestamp: Date.now()
        });
    }

    notifyPopup(message) {
        // Send to all popups (if multiple are open)
        chrome.runtime.sendMessage(message).catch(error => {
            // Popup is not open, that's fine
        });
    }

    async fastManualScan() {
        console.log('⚡ Fast manual scan starting...');
        
        try {
            const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
            for (const tab of tabs) {
                if (tab.url) {
                    // Simulate finding threats during scan
                    const mockThreats = [
                        {
                            type: 'scan_result',
                            message: 'Scan detected potential security risks',
                            severity: 'warning',
                            url: tab.url,
                            timestamp: new Date().toISOString(),
                            source: 'Deep Scan'
                        },
                        {
                            type: 'tracker_found',
                            message: '3 tracking cookies detected',
                            severity: 'low',
                            url: tab.url,
                            timestamp: new Date().toISOString(),
                            source: 'Privacy Scan'
                        }
                    ];
                    
                    mockThreats.forEach(threat => this.handleThreat(threat));
                }
            }
            
            this.systemStats.trackersBlocked += 3; // Simulate blocking trackers
            console.log('✅ Fast scan completed with results');
        } catch (error) {
            console.error('Fast scan failed:', error);
        }
    }

    async getRealTimeStatus() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            const currentUrl = tab?.url;
            
            let currentAnalysis = { isThreat: false };
            if (currentUrl) {
                currentAnalysis = this.fastAnalyzeURL(currentUrl);
            }

            const recentThreats = this.threats.filter(t => 
                (Date.now() - new Date(t.timestamp)) < 300000 // 5 minutes
            );

            return {
                isSafe: !currentAnalysis.isThreat,
                url: currentUrl,
                threatCount: recentThreats.length,
                currentThreat: currentAnalysis.isThreat ? currentAnalysis : null,
                recentThreats: recentThreats.slice(0, 5),
                systemStats: this.systemStats
            };
            
        } catch (error) {
            return { 
                isSafe: true, 
                threatCount: 0, 
                recentThreats: [],
                systemStats: this.systemStats
            };
        }
    }

    bypassBlock(url) {
        // Allow user to bypass blocking for this session
        this.blockedSites.delete(url);
        chrome.tabs.update({ url: url });
    }
}

// Initialize the enhanced security monitor
const securityMonitor = new EnhancedSecurityMonitor();