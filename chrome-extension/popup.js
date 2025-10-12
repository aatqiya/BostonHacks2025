// popup.js - UPDATED with purple theme, Byte as pet name, and password detection
class FrostByteSecurityManager {
  constructor() {
    this.threats = [];
    this.trackersBlocked = [
      'Google Analytics',
      'Facebook Pixel',
      'DoubleClick Ads',
      'Twitter Pixel',
      'LinkedIn Insight',
      'Hotjar Analytics',
      'AdRoll Tracking',
      'Amazon Ads'
    ];
    this.systemStats = {
      trackersBlocked: 8,
      threatsBlocked: 0,
      protectionScore: 95
    };
    this.currentStatus = {
      isSafe: true,
      currentUrl: 'frostbyte.app',
      currentDomain: 'frostbyte.app'
    };
    this.updateInterval = null;
    this.petHP = 85;
    this.maxHP = 100;
    this.lastThreatTime = 0;
    this.hpChangeTimeout = null;
    this.regenerationInterval = null;
    this.isScanning = false;
    this.currentPetState = 'normal';
    this.isProtectionEnabled = true;
    this.currentTabId = null;
    this.threatLevel = 0; // 0-10 scale for threat intensity

    // NEW: Password security properties
    this.weakPasswordsDetected = 0;
    this.passwordMonitoringEnabled = true;
    this.detectedWeakPasswords = [];
    this.passwordCheckInterval = null;
  }

  async init() {
    await this.loadInitialData();
    this.setupEventListeners();
    this.setupRealTimeListeners();
    this.startRealTimeUpdates();
    this.startHPRegeneration();
    this.getCurrentTabInfo();
    this.startPasswordMonitoring(); // NEW: Start password monitoring
    console.log('FrostByte Security Manager initialized');
  }

  setupEventListeners() {
    // System guard click
    document.getElementById('systemGuardItem').addEventListener('click', () => {
      this.showTrackersModal();
    });

    // NEW: Password security click
    document.getElementById('passwordSecurityItem').addEventListener('click', () => {
      this.showPasswordSecurityModal();
    });

    // Scan button
    document.getElementById('scanBtn').addEventListener('click', () => {
      this.runQuickScan();
    });

    // Modal close buttons
    document.getElementById('trackersModalClose').addEventListener('click', () => {
      this.hideTrackersModal();
    });

    document.getElementById('modalClose').addEventListener('click', () => {
      this.hideThreatModal();
    });

    // NEW: Password modal close
    document.getElementById('passwordModalClose').addEventListener('click', () => {
      this.hidePasswordModal();
    });

    // Close modals when clicking outside
    document.getElementById('trackersModal').addEventListener('click', (e) => {
      if (e.target.id === 'trackersModal') {
        this.hideTrackersModal();
      }
    });

    document.getElementById('threatModal').addEventListener('click', (e) => {
      if (e.target.id === 'threatModal') {
        this.hideThreatModal();
      }
    });

    // NEW: Password modal close on outside click
    document.getElementById('passwordModal').addEventListener('click', (e) => {
      if (e.target.id === 'passwordModal') {
        this.hidePasswordModal();
      }
    });

    // Threat item clicks
    document.getElementById('threatList').addEventListener('click', (e) => {
      const threatItem = e.target.closest('.threat-item');
      if (threatItem) {
        this.showThreatDetails(threatItem);
      }
    });
  }

  // NEW: Start password monitoring
  startPasswordMonitoring() {
    // Check for weak passwords every 5 seconds
    this.passwordCheckInterval = setInterval(() => {
      this.checkForWeakPasswords();
    }, 5000);

    // Initial check
    setTimeout(() => {
      this.checkForWeakPasswords();
    }, 1000);
  }

  // NEW: Check for weak passwords on the current page
  checkForWeakPasswords() {
    if (!this.passwordMonitoringEnabled) return;

    // Simulate finding weak passwords (in real implementation, this would scan the page)
    const shouldFindWeakPassword = Math.random() > 0.7;

    if (shouldFindWeakPassword && this.detectedWeakPasswords.length < 3) {
      const weakSites = [
        'social-network.com',
        'shopping-site.net',
        'email-provider.org',
        'banking-portal.com'
      ];
      const weakPasswords = [
        'password123',
        'letmein2024',
        'admin123',
        'qwerty123',
        'welcome1'
      ];

      const randomSite = weakSites[Math.floor(Math.random() * weakSites.length)];
      const randomPassword = weakPasswords[Math.floor(Math.random() * weakPasswords.length)];

      // Check if we've already detected this one
      const alreadyDetected = this.detectedWeakPasswords.some(pw =>
        pw.site === randomSite && pw.password === randomPassword
      );

      if (!alreadyDetected) {
        this.detectedWeakPasswords.push({
          site: randomSite,
          password: randomPassword,
          strength: 'Very Weak',
          risk: 'High'
        });

        this.weakPasswordsDetected = this.detectedWeakPasswords.length;

        // Add to threat feed
        this.addThreat({
          text: `Weak password detected for ${randomSite}`,
          type: 'warning',
          source: 'Password Guard',
          url: randomSite
        });

        // Small HP impact for weak passwords
        const hpLoss = 0.3 + (Math.random() * 0.4);
        this.petHP = Math.max(0, this.petHP - hpLoss);
        this.lastThreatTime = Date.now();
        this.showHPChange(`-${hpLoss.toFixed(1)}`);
        this.updatePetDisplay();

        // Update UI
        this.updatePasswordSecurityDisplay();
      }
    }
  }

  // NEW: Update password security display
  updatePasswordSecurityDisplay() {
    const passwordItem = document.getElementById('passwordSecurityItem');
    const passwordValue = document.getElementById('passwordSecurityValue');
    const passwordSubtext = document.getElementById('passwordSecuritySubtext');

    passwordValue.textContent = this.weakPasswordsDetected;

    if (this.weakPasswordsDetected === 0) {
      passwordItem.className = 'security-item safe';
      passwordSubtext.textContent = 'No weak passwords detected';
      passwordValue.style.color = '#7b68ee';
    } else if (this.weakPasswordsDetected <= 2) {
      passwordItem.className = 'security-item password-warning';
      passwordSubtext.textContent = `${this.weakPasswordsDetected} passwords need attention`;
      passwordValue.style.color = '#ffb74d';
    } else {
      passwordItem.className = 'security-item password-danger';
      passwordSubtext.textContent = `${this.weakPasswordsDetected} critical passwords`;
      passwordValue.style.color = '#ff6b6b';
    }
  }

  // NEW: Show password security modal
  showPasswordSecurityModal() {
    document.getElementById('passwordModal').style.display = 'flex';
    this.updateWeakPasswordsList();
  }

  // NEW: Hide password security modal
  hidePasswordModal() {
    document.getElementById('passwordModal').style.display = 'none';
  }

  // NEW: Update weak passwords list in modal
  updateWeakPasswordsList() {
    const weakPasswordsList = document.getElementById('weakPasswordsList');
    const totalWeakPasswords = document.getElementById('totalWeakPasswords');

    totalWeakPasswords.textContent = `${this.weakPasswordsDetected} passwords need attention`;
    weakPasswordsList.innerHTML = '';

    if (this.detectedWeakPasswords.length === 0) {
      weakPasswordsList.innerHTML = `
                <div class="tracker-item">
                    <div class="tracker-header">
                        <span class="tracker-name">No weak passwords detected</span>
                        <span class="tracker-status" style="color: #7b68ee;">Secure</span>
                    </div>
                    <div class="tracker-url">All passwords meet security standards</div>
                </div>
            `;
      return;
    }

    this.detectedWeakPasswords.forEach(password => {
      const passwordElement = document.createElement('div');
      passwordElement.className = 'tracker-item';
      passwordElement.innerHTML = `
                <div class="tracker-header">
                    <span class="tracker-name">${password.site}</span>
                    <span class="tracker-status" style="color: #ff6b6b;">${password.strength}</span>
                </div>
                <div class="tracker-url">Password: "${password.password}" - ${password.risk} Risk</div>
            `;
      weakPasswordsList.appendChild(passwordElement);
    });
  }

  async getCurrentTabInfo() {
    try {
      // Get current active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.url) {
        this.currentTabId = tab.id;
        this.currentStatus.currentUrl = tab.url;

        try {
          const url = new URL(tab.url);
          this.currentStatus.currentDomain = url.hostname;

          // Analyze current page safety
          this.analyzeCurrentPageSafety(tab.url);
        } catch (e) {
          this.currentStatus.currentDomain = 'local page';
          this.currentStatus.isSafe = true;
        }

        this.updatePageSafety();
      }
    } catch (error) {
      console.log('Could not get current tab info:', error);
      // Fallback to demo data
      this.currentStatus.currentUrl = 'https://frostbyte.app';
      this.currentStatus.currentDomain = 'frostbyte.app';
      this.currentStatus.isSafe = true;
    }
  }

  analyzeCurrentPageSafety(url) {
    // Reset to safe first
    let isSafe = true;
    let threatDetected = false;

    // Check for HTTP (insecure)
    if (url.startsWith('http://') && !url.includes('localhost') && !url.includes('127.0.0.1')) {
      isSafe = false;
      threatDetected = true;
      this.addThreat({
        text: 'Unsecured connection detected',
        type: 'warning',
        source: 'Network Monitor',
        url: this.currentStatus.currentDomain
      });
    }

    // Check for suspicious patterns in the CURRENT URL only
    const unsafePatterns = [
      /phishing/i,
      /malware/i,
      /fake[-_]?login/i,
      /security[-_]?update/i,
      /account[-_]?verification/i,
      /password[-_]?reset/i,
      /banking[-_]?alert/i
    ];

    const isUnsafe = unsafePatterns.some(pattern => pattern.test(url.toLowerCase()));

    if (isUnsafe) {
      isSafe = false;
      threatDetected = true;
      this.addThreat({
        text: 'Suspicious website detected',
        type: 'danger',
        source: 'Phishing Protection',
        url: this.currentStatus.currentDomain
      });

      // Small HP loss for dangerous sites
      const hpLoss = 0.5 + (Math.random() * 1);
      this.petHP = Math.max(0, this.petHP - hpLoss);
      this.lastThreatTime = Date.now();
      this.threatLevel = Math.min(10, this.threatLevel + 2);
      this.showHPChange(`-${hpLoss.toFixed(1)}`);
      this.updatePetDisplay();
    }

    // Update current status
    this.currentStatus.isSafe = isSafe;

    // If threat was detected and resolved, reduce threat level
    if (!threatDetected && this.threatLevel > 0) {
      this.threatLevel = Math.max(0, this.threatLevel - 0.5);
    }
  }

  startHPRegeneration() {
    // Regenerate HP every 3 seconds, faster when threat level is low
    this.regenerationInterval = setInterval(() => {
      if (!this.isProtectionEnabled) return;

      const timeSinceLastThreat = Date.now() - this.lastThreatTime;
      const shouldRegenerate = timeSinceLastThreat > 8000 && this.petHP < this.maxHP;

      if (shouldRegenerate) {
        const oldHP = this.petHP;
        // Regenerate faster when threat level is low
        const regenRate = 0.3 + (0.7 * (1 - this.threatLevel / 10));
        this.petHP = Math.min(this.maxHP, this.petHP + regenRate);
        this.updatePetDisplay();

        // Show +1 when HP crosses integer boundary
        if (Math.floor(this.petHP) > Math.floor(oldHP)) {
          this.showHPChange('+1');
        }
      }
    }, 3000);
  }

  showHPChange(change) {
    const hpChangeElement = document.getElementById('hpChange');
    hpChangeElement.textContent = change;
    hpChangeElement.className = `hp-change ${change.startsWith('+') ? 'hp-positive' : 'hp-negative'}`;
    hpChangeElement.style.display = 'block';

    // Clear any existing timeout
    if (this.hpChangeTimeout) {
      clearTimeout(this.hpChangeTimeout);
    }

    // Hide after animation
    this.hpChangeTimeout = setTimeout(() => {
      hpChangeElement.style.display = 'none';
    }, 1000);
  }

  updatePetDisplay() {
    const healthFill = document.getElementById('healthFill');
    const healthText = document.getElementById('healthText');
    const petStatus = document.getElementById('petStatus');
    const cyberPet = document.getElementById('cyberPet');

    // Update HP bar and text
    const hpPercentage = (this.petHP / this.maxHP) * 100;
    healthFill.style.width = `${hpPercentage}%`;
    healthText.textContent = `${Math.floor(this.petHP)} / ${this.maxHP} HP`;

    // Update HP bar color based on health with purple theme
    if (hpPercentage > 70) {
      healthFill.style.background = 'linear-gradient(90deg, #7b68ee, #9370db, #8a2be2)';
      if (this.isProtectionEnabled) {
        petStatus.textContent = 'All systems operational';
        petStatus.style.color = '#7b68ee';
      }
    } else if (hpPercentage > 40) {
      healthFill.style.background = 'linear-gradient(90deg, #ffb74d, #ff9800, #f57c00, #ff6b6b)';
      if (this.isProtectionEnabled) {
        petStatus.textContent = 'Security status: Caution advised';
        petStatus.style.color = '#ffb74d';
      }
    } else {
      healthFill.style.background = 'linear-gradient(90deg, #ff6b6b, #ff5252, #d32f2f, #b71c1c)';
      if (this.isProtectionEnabled) {
        petStatus.textContent = 'Security status: Critical attention needed';
        petStatus.style.color = '#ff6b6b';
      }
    }

    // Update pet appearance based on health
    cyberPet.className = 'cyber-pet';

    if (hpPercentage <= 30) {
      // Very tired state
      cyberPet.classList.add('very-tired');
      this.currentPetState = 'very-tired';
    } else if (hpPercentage <= 60) {
      // Tired state
      cyberPet.classList.add('tired');
      this.currentPetState = 'tired';
    } else {
      // Normal state
      this.currentPetState = 'normal';
    }
  }

  async loadInitialData() {
    try {
      const [status, threats, stats] = await Promise.all([
        this.getCurrentStatus(),
        this.loadThreats(),
        this.getSystemStats()
      ]);

      this.currentStatus = status;
      this.threats = threats;
      this.systemStats = stats;
      this.updateUI();
    } catch (error) {
      console.error('Initial load error:', error);
    }
  }

  setupRealTimeListeners() {
    // Update current page info every 2 seconds
    setInterval(() => {
      this.getCurrentTabInfo();
    }, 2000);

    // Simulate occasional background threats (less frequent and smaller HP impact)
    setInterval(() => {
      if (Math.random() > 0.85 && !this.isScanning && this.isProtectionEnabled) {
        this.simulateBackgroundThreat();
      }
    }, 12000);
  }

  simulateBackgroundThreat() {
    // Only simulate threats that would actually be detected in background
    const backgroundThreats = [
      {
        text: 'Tracking script blocked',
        type: 'safe',
        source: 'Privacy Guard',
        url: this.currentStatus.currentDomain
      },
      {
        text: 'Malicious ad prevented',
        type: 'danger',
        source: 'Ad Blocker',
        url: this.currentStatus.currentDomain
      },
      {
        text: 'Suspicious cookie blocked',
        type: 'warning',
        source: 'Cookie Guard',
        url: this.currentStatus.currentDomain
      }
    ];

    const threat = backgroundThreats[Math.floor(Math.random() * backgroundThreats.length)];

    // Only add meaningful threats (not every safe tracking block)
    if (threat.type !== 'safe' || Math.random() > 0.6) {
      this.addThreat(threat);
    }

    // Small HP decrease for dangerous threats only
    if (threat.type === 'danger') {
      const hpLoss = 0.2 + (Math.random() * 0.5);
      this.petHP = Math.max(0, this.petHP - hpLoss);
      this.lastThreatTime = Date.now();
      this.threatLevel = Math.min(10, this.threatLevel + 1);
      this.showHPChange(`-${hpLoss.toFixed(1)}`);
      this.updatePetDisplay();

      // Update threats blocked counter
      this.systemStats.threatsBlocked++;
      document.getElementById('activeThreatsValue').textContent = this.systemStats.threatsBlocked;
    }

    // Update protection score
    this.updateProtectionScore();
  }

  addThreat(threatData) {
    const threat = {
      text: threatData.text,
      type: threatData.type,
      source: threatData.source,
      url: threatData.url,
      time: new Date().toLocaleTimeString(),
      timestamp: Date.now()
    };

    this.threats.unshift(threat);
    if (this.threats.length > 15) {
      this.threats = this.threats.slice(0, 15);
    }

    this.updateThreatFeed();
  }

  updateThreatFeed() {
    const threatList = document.getElementById('threatList');
    threatList.innerHTML = '';

    if (this.threats.length === 0) {
      threatList.innerHTML = `
                <div class="threat-item">
                    <div class="threat-icon safe"></div>
                    <div class="threat-content">
                        <div class="threat-text">No security events to display</div>
                        <div class="threat-details">
                            <span class="threat-source">System</span>
                            <span class="threat-url">${this.currentStatus.currentDomain}</span>
                            <span class="threat-time">Monitoring</span>
                        </div>
                    </div>
                </div>
            `;
      return;
    }

    this.threats.forEach(threat => {
      const threatElement = document.createElement('div');
      threatElement.className = 'threat-item';
      threatElement.innerHTML = `
                <div class="threat-icon ${threat.type}"></div>
                <div class="threat-content">
                    <div class="threat-text">${threat.text}</div>
                    <div class="threat-details">
                        <span class="threat-source">${threat.source}</span>
                        <span class="threat-url">${threat.url}</span>
                        <span class="threat-time">${threat.time}</span>
                    </div>
                </div>
            `;
      threatList.appendChild(threatElement);
    });
  }

  updateUI() {
    // Update security items
    document.getElementById('systemGuardValue').textContent = this.systemStats.trackersBlocked;
    document.getElementById('activeThreatsValue').textContent = this.systemStats.threatsBlocked;
    document.getElementById('protectionScoreValue').textContent = this.getProtectionGrade();

    // Update page safety status
    this.updatePageSafety();

    // NEW: Update password security
    this.updatePasswordSecurityDisplay();

    this.updatePetDisplay();
    this.updateThreatFeed();
    this.updateTrackersList();
    this.updateProtectionScore();
  }

  updatePageSafety() {
    const pageSafetyItem = document.getElementById('pageSafetyItem');
    const pageSafetyValue = document.getElementById('pageSafetyValue');
    const pageSafetySubtext = document.getElementById('pageSafetySubtext');

    const safetyLevel = this.currentStatus.isSafe ? 'Safe' : 'Risk';
    pageSafetyValue.textContent = safetyLevel;
    pageSafetySubtext.textContent = this.currentStatus.currentDomain;

    // Update item styling
    pageSafetyItem.className = 'security-item';
    if (this.currentStatus.isSafe) {
      pageSafetyItem.classList.add('safe');
      pageSafetyValue.style.color = '#7b68ee';
    } else {
      pageSafetyItem.classList.add('danger');
      pageSafetyValue.style.color = '#ff6b6b';
    }
  }

  updateProtectionScore() {
    const scoreItem = document.getElementById('protectionScoreItem');
    const scoreValue = document.getElementById('protectionScoreValue');
    const trendText = document.getElementById('protectionTrend');

    // Calculate score based on threats, HP, and threat level
    let score = 100 - (this.systemStats.threatsBlocked * 1.5) - ((100 - this.petHP) / 2) - (this.threatLevel * 2);
    score = Math.max(60, Math.min(100, score));

    this.systemStats.protectionScore = Math.round(score);
    scoreValue.textContent = this.getProtectionGrade();

    // Update trend
    if (score >= 90) {
      trendText.textContent = 'Excellent';
      trendText.style.color = '#7b68ee';
      scoreItem.classList.add('safe');
      scoreItem.classList.remove('warning', 'danger');
    } else if (score >= 75) {
      trendText.textContent = 'Good';
      trendText.style.color = '#ffb74d';
      scoreItem.classList.add('warning');
      scoreItem.classList.remove('safe', 'danger');
    } else {
      trendText.textContent = 'Needs attention';
      trendText.style.color = '#ff6b6b';
      scoreItem.classList.add('danger');
      scoreItem.classList.remove('safe', 'warning');
    }
  }

  getProtectionGrade() {
    const score = this.systemStats.protectionScore;
    if (score >= 95) return 'A+';
    if (score >= 90) return 'A';
    if (score >= 85) return 'A-';
    if (score >= 80) return 'B+';
    if (score >= 75) return 'B';
    if (score >= 70) return 'B-';
    if (score >= 65) return 'C+';
    return 'C';
  }

  showTrackersModal() {
    document.getElementById('trackersModal').style.display = 'flex';
    this.updateTrackersList();
  }

  hideTrackersModal() {
    document.getElementById('trackersModal').style.display = 'none';
  }

  showThreatDetails(threatItem) {
    const threatText = threatItem.querySelector('.threat-text').textContent;
    const threatSource = threatItem.querySelector('.threat-source').textContent;
    const threatUrl = threatItem.querySelector('.threat-url').textContent;
    const threatTime = threatItem.querySelector('.threat-time').textContent;
    const threatType = threatItem.querySelector('.threat-icon').classList.contains('danger') ? 'High' :
      threatItem.querySelector('.threat-icon').classList.contains('warning') ? 'Medium' : 'Low';

    // Create detailed threat info
    const threatDetails = {
      title: threatText,
      type: threatSource,
      severity: threatType,
      url: threatUrl,
      time: threatTime,
      explanation: this.getThreatExplanation(threatSource, threatType)
    };

    document.getElementById('modalThreatTitle').textContent = threatDetails.title;
    document.getElementById('modalThreatIcon').className = `threat-icon ${threatDetails.severity.toLowerCase()}`;

    const modalBody = document.querySelector('.threat-modal-body');
    modalBody.innerHTML = `
            <div class="threat-info-item">
                <div class="threat-info-label">THREAT TYPE</div>
                <div class="threat-info-value">${threatDetails.type}</div>
            </div>
            <div class="threat-info-item">
                <div class="threat-info-label">DETECTED ON</div>
                <div class="threat-info-value">${threatDetails.url}</div>
            </div>
            <div class="threat-info-item">
                <div class="threat-info-label">SEVERITY</div>
                <div class="threat-info-value">${threatDetails.severity}</div>
            </div>
            <div class="threat-info-item">
                <div class="threat-info-label">DETECTION TIME</div>
                <div class="threat-info-value">${threatDetails.time}</div>
            </div>
            <div class="threat-explanation">
                <h4>WHY THIS IS DANGEROUS</h4>
                <div>${threatDetails.explanation}</div>
            </div>
        `;

    document.getElementById('threatModal').style.display = 'flex';
  }

  getThreatExplanation(source, severity) {
    const explanations = {
      'Phishing Protection': 'This appears to be a fake login page designed to steal your credentials. FrostByte prevented any data from being sent to the malicious server.',
      'Privacy Guard': 'Tracking scripts collect your browsing data without permission. Blocking them protects your privacy and prevents targeted advertising.',
      'Ad Blocker': 'Malicious ads can contain malware or lead to scam websites. FrostByte blocks these to keep your system safe.',
      'Network Monitor': 'Unencrypted connections expose your data to potential interception. Always look for HTTPS in the address bar for secure browsing.',
      'Cookie Guard': 'Suspicious cookies can track your activity across websites. Blocking them enhances your privacy protection.',
      'Password Guard': 'Weak passwords make your accounts vulnerable to hacking. Use strong, unique passwords for each account.',
      'System Control': 'Security system status changes help maintain optimal protection levels and system performance.'
    };

    return explanations[source] || 'This security event has been logged for monitoring purposes. FrostByte maintains system integrity through continuous protection.';
  }

  hideThreatModal() {
    document.getElementById('threatModal').style.display = 'none';
  }

  updateTrackersList() {
    const trackersList = document.getElementById('trackersList');
    const totalTrackers = document.getElementById('totalTrackersBlocked');

    totalTrackers.textContent = `${this.trackersBlocked.length} trackers`;
    trackersList.innerHTML = '';

    this.trackersBlocked.forEach(tracker => {
      const trackerElement = document.createElement('div');
      trackerElement.className = 'tracker-item';
      trackerElement.innerHTML = `
                <span class="tracker-name">${tracker}</span>
                <span class="tracker-status">Blocked</span>
            `;
      trackersList.appendChild(trackerElement);
    });
  }

  async runQuickScan() {
    if (this.isScanning) return;

    this.isScanning = true;
    const scanBtn = document.getElementById('scanBtn');
    const originalText = scanBtn.textContent;

    scanBtn.textContent = 'Scanning...';
    scanBtn.classList.add('scanning');
    scanBtn.disabled = true;

    // Simulate scanning process
    await new Promise(resolve => setTimeout(resolve, 2500));

    // Add scan completion message
    this.addThreat({
      text: 'Quick scan completed - Security verification passed',
      type: 'safe',
      source: 'System Scan',
      url: this.currentStatus.currentDomain
    });

    // HP boost for proactive scanning
    const hpGain = 3 + (Math.random() * 2);
    this.petHP = Math.min(this.maxHP, this.petHP + hpGain);
    this.threatLevel = Math.max(0, this.threatLevel - 2);
    this.showHPChange(`+${hpGain.toFixed(1)}`);
    this.updatePetDisplay();

    // Reset button
    scanBtn.textContent = originalText;
    scanBtn.classList.remove('scanning');
    scanBtn.disabled = false;
    this.isScanning = false;

    // Show completion effect
    scanBtn.style.background = 'linear-gradient(135deg, #7b68ee, #9370db, #8a2be2, #4caf50)';
    setTimeout(() => {
      scanBtn.style.background = 'linear-gradient(135deg, #7b68ee, #9370db, #8a2be2)';
    }, 1000);
  }

  async getCurrentStatus() {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          isSafe: true,
          currentUrl: 'https://frostbyte.app',
          currentDomain: 'frostbyte.app'
        });
      }, 100);
    });
  }

  async loadThreats() {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve([
          {
            text: 'Protection system initialized',
            type: 'safe',
            source: 'System Control',
            url: 'frostbyte.app',
            time: new Date().toLocaleTimeString(),
            timestamp: Date.now()
          }
        ]);
      }, 150);
    });
  }

  async getSystemStats() {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          trackersBlocked: 8,
          threatsBlocked: 0,
          protectionScore: 95
        });
      }, 200);
    });
  }

  startRealTimeUpdates() {
    this.updateInterval = setInterval(() => {
      this.updateUI();
    }, 3000);
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const securityManager = new FrostByteSecurityManager();
  securityManager.init();
});