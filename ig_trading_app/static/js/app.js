// IG Trading App - Client-side JavaScript
// Handles UI interactions and API calls

class IGTradingApp {
    constructor() {
        this.apiUrl = window.location.origin;
        this.authenticated = false;
        this.positions = [];
        this.tpLevelCount = 0;

        this.init();
    }

    init() {
        this.bindEvents();
        this.checkAuthStatus();
    }

    // Event Bindings
    bindEvents() {
        // Authentication
        document.getElementById('authForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.authenticate();
        });

        // Market Search
        const marketSearch = document.getElementById('marketSearch');
        let searchTimeout;
        marketSearch.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.searchMarkets(e.target.value);
            }, 300);
        });

        // Position Form
        document.getElementById('positionForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.createPosition();
        });

        // Trailing Stop Toggle
        document.getElementById('trailingStopEnabled').addEventListener('change', (e) => {
            document.getElementById('trailingStopConfig').style.display =
                e.target.checked ? 'block' : 'none';
        });

        // Multiple TP Toggle
        document.getElementById('multipleTpEnabled').addEventListener('change', (e) => {
            const singleTp = document.getElementById('singleTpConfig');
            const multipleTp = document.getElementById('multipleTpConfig');

            if (e.target.checked) {
                singleTp.style.display = 'none';
                multipleTp.style.display = 'block';
                if (this.tpLevelCount === 0) {
                    this.addTpLevel();
                    this.addTpLevel();
                }
            } else {
                singleTp.style.display = 'block';
                multipleTp.style.display = 'none';
            }
        });

        // Add TP Level
        document.getElementById('addTpLevel').addEventListener('click', () => {
            this.addTpLevel();
        });

        // Refresh Positions
        document.getElementById('refreshPositions').addEventListener('click', () => {
            this.loadPositions();
        });

        // SL/TP Type Changes
        document.getElementById('slType').addEventListener('change', (e) => {
            document.getElementById('slValue').disabled = e.target.value === 'none';
        });

        document.getElementById('tpType').addEventListener('change', (e) => {
            document.getElementById('tpValue').disabled = e.target.value === 'none';
        });
    }

    // Authentication
    async authenticate() {
        const apiKey = document.getElementById('apiKey').value;
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const demo = document.getElementById('demoAccount').checked;

        try {
            const response = await fetch(`${this.apiUrl}/api/authenticate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ api_key: apiKey, username, password, demo })
            });

            const data = await response.json();

            if (response.ok) {
                this.authenticated = true;
                this.showNotification('Connexion réussie !', 'success');

                // Show trading interface
                document.getElementById('authPanel').style.display = 'none';
                document.getElementById('tradingInterface').style.display = 'block';
                document.getElementById('accountInfo').style.display = 'flex';
                document.getElementById('accountId').textContent =
                    `${data.account_id} (${demo ? 'Démo' : 'Réel'})`;

                // Load positions
                this.loadPositions();
            } else {
                this.showNotification(data.error || 'Erreur d\'authentification', 'error');
            }
        } catch (error) {
            this.showNotification('Erreur de connexion au serveur', 'error');
            console.error(error);
        }
    }

    async checkAuthStatus() {
        try {
            const response = await fetch(`${this.apiUrl}/api/status`);
            const data = await response.json();

            if (data.authenticated) {
                this.authenticated = true;
                document.getElementById('authPanel').style.display = 'none';
                document.getElementById('tradingInterface').style.display = 'block';
                document.getElementById('accountInfo').style.display = 'flex';
                document.getElementById('accountId').textContent = data.account_id;
                this.loadPositions();
            }
        } catch (error) {
            console.error('Error checking auth status:', error);
        }
    }

    // Market Search
    async searchMarkets(query) {
        if (!query || query.length < 2) {
            document.getElementById('marketResults').classList.remove('show');
            return;
        }

        try {
            const response = await fetch(`${this.apiUrl}/api/markets/search?q=${encodeURIComponent(query)}`);
            const data = await response.json();

            if (response.ok) {
                this.displayMarketResults(data.markets);
            }
        } catch (error) {
            console.error('Error searching markets:', error);
        }
    }

    displayMarketResults(markets) {
        const resultsContainer = document.getElementById('marketResults');

        if (!markets || markets.length === 0) {
            resultsContainer.innerHTML = '<div class="market-item">Aucun résultat</div>';
            resultsContainer.classList.add('show');
            return;
        }

        resultsContainer.innerHTML = markets.map(market => `
            <div class="market-item" data-epic="${market.epic}" data-name="${market.instrumentName}">
                <div class="market-name">${market.instrumentName}</div>
                <div class="market-epic">${market.epic}</div>
            </div>
        `).join('');

        // Add click handlers
        resultsContainer.querySelectorAll('.market-item').forEach(item => {
            item.addEventListener('click', () => {
                this.selectMarket(item.dataset.epic, item.dataset.name);
            });
        });

        resultsContainer.classList.add('show');
    }

    selectMarket(epic, name) {
        document.getElementById('selectedEpic').value = epic;
        document.getElementById('selectedMarket').textContent = `${name} (${epic})`;
        document.getElementById('marketResults').classList.remove('show');
        document.getElementById('marketSearch').value = name;
    }

    // TP Level Management
    addTpLevel() {
        this.tpLevelCount++;
        const tpLevels = document.getElementById('tpLevels');

        const levelDiv = document.createElement('div');
        levelDiv.className = 'tp-level';
        levelDiv.dataset.level = this.tpLevelCount;
        levelDiv.innerHTML = `
            <div class="tp-level-header">
                <span class="tp-level-title">TP ${this.tpLevelCount}</span>
                <button type="button" class="btn-remove-tp" onclick="app.removeTpLevel(${this.tpLevelCount})">
                    Supprimer
                </button>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Niveau Prix</label>
                    <input type="number" step="0.00001" class="tp-level-price" required>
                </div>
                <div class="form-group">
                    <label>% de la position</label>
                    <input type="number" step="1" min="1" max="100" class="tp-level-percentage" value="50" required>
                </div>
            </div>
        `;

        tpLevels.appendChild(levelDiv);
    }

    removeTpLevel(levelId) {
        const level = document.querySelector(`[data-level="${levelId}"]`);
        if (level) {
            level.remove();
        }
    }

    // Position Creation
    async createPosition() {
        const epic = document.getElementById('selectedEpic').value;
        if (!epic) {
            this.showNotification('Veuillez sélectionner un marché', 'error');
            return;
        }

        const direction = document.getElementById('direction').value;
        const size = parseFloat(document.getElementById('size').value);

        // Build position data
        const positionData = {
            epic,
            direction,
            size
        };

        // Stop Loss
        const slType = document.getElementById('slType').value;
        if (slType !== 'none') {
            const slValue = parseFloat(document.getElementById('slValue').value);
            positionData.stop_loss = {
                type: slType,
                value: slValue
            };
        }

        // Trailing Stop
        const trailingEnabled = document.getElementById('trailingStopEnabled').checked;
        if (trailingEnabled) {
            positionData.trailing_stop = {
                enabled: true,
                increment: parseFloat(document.getElementById('trailingIncrement').value)
            };
        }

        // Take Profit
        const multipleTpEnabled = document.getElementById('multipleTpEnabled').checked;

        if (multipleTpEnabled) {
            // Multiple TPs
            const tpLevels = [];
            document.querySelectorAll('.tp-level').forEach(level => {
                const price = parseFloat(level.querySelector('.tp-level-price').value);
                const percentage = parseFloat(level.querySelector('.tp-level-percentage').value);

                tpLevels.push({
                    level: price,
                    size_percentage: percentage
                });
            });

            if (tpLevels.length > 0) {
                positionData.take_profit = tpLevels;
            }
        } else {
            // Single TP
            const tpType = document.getElementById('tpType').value;
            if (tpType !== 'none') {
                const tpValue = parseFloat(document.getElementById('tpValue').value);
                positionData.take_profit = {
                    type: tpType,
                    value: tpValue
                };
            }
        }

        try {
            const response = await fetch(`${this.apiUrl}/api/positions/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(positionData)
            });

            const data = await response.json();

            if (response.ok) {
                this.showNotification('Position ouverte avec succès !', 'success');

                if (data.multiple_tps) {
                    this.showNotification(
                        `${data.tp_count} niveaux de TP configurés`,
                        'info'
                    );
                }

                // Reset form
                document.getElementById('positionForm').reset();
                document.getElementById('selectedMarket').textContent = 'Aucun marché sélectionné';
                document.getElementById('tpLevels').innerHTML = '';
                this.tpLevelCount = 0;

                // Reload positions
                setTimeout(() => this.loadPositions(), 1000);
            } else {
                this.showNotification(data.error || 'Erreur lors de l\'ouverture', 'error');
            }
        } catch (error) {
            this.showNotification('Erreur de connexion au serveur', 'error');
            console.error(error);
        }
    }

    // Load Positions
    async loadPositions() {
        try {
            const response = await fetch(`${this.apiUrl}/api/positions`);
            const data = await response.json();

            if (response.ok) {
                this.positions = data.positions;
                this.displayPositions();
            }
        } catch (error) {
            console.error('Error loading positions:', error);
        }
    }

    displayPositions() {
        const container = document.getElementById('positionsList');

        if (!this.positions || this.positions.length === 0) {
            container.innerHTML = '<p class="no-positions">Aucune position ouverte</p>';
            return;
        }

        container.innerHTML = this.positions.map(pos => {
            const position = pos.position;
            const market = pos.market;

            return `
                <div class="position-card ${position.direction.toLowerCase()}" data-deal-id="${position.dealId}">
                    <div class="position-header">
                        <div class="position-market">${market.instrumentName}</div>
                        <span class="position-direction ${position.direction.toLowerCase()}">
                            ${position.direction}
                        </span>
                    </div>

                    <div class="position-details">
                        <div class="position-detail">
                            <span class="position-detail-label">Taille:</span>
                            <span class="position-detail-value">${position.size}</span>
                        </div>
                        <div class="position-detail">
                            <span class="position-detail-label">Niveau:</span>
                            <span class="position-detail-value">${position.level}</span>
                        </div>
                        <div class="position-detail">
                            <span class="position-detail-label">Stop Loss:</span>
                            <span class="position-detail-value">${position.stopLevel || 'N/A'}</span>
                        </div>
                        <div class="position-detail">
                            <span class="position-detail-label">Take Profit:</span>
                            <span class="position-detail-value">${position.limitLevel || 'N/A'}</span>
                        </div>
                        <div class="position-detail">
                            <span class="position-detail-label">P&L:</span>
                            <span class="position-detail-value" style="color: ${position.profit >= 0 ? '#22c55e' : '#ef4444'}">
                                ${position.profit ? position.profit.toFixed(2) : '0.00'}
                            </span>
                        </div>
                        <div class="position-detail">
                            <span class="position-detail-label">Trailing Stop:</span>
                            <span class="position-detail-value">${position.trailingStep ? 'Oui' : 'Non'}</span>
                        </div>
                    </div>

                    <div class="position-actions">
                        <button class="btn btn-secondary" onclick="app.toggleEditPosition('${position.dealId}')">
                            Modifier TP/SL
                        </button>
                        <button class="btn btn-danger" onclick="app.closePosition('${position.dealId}', '${position.direction}', ${position.size})">
                            Clôturer
                        </button>
                    </div>

                    <div class="position-edit-form" id="edit-${position.dealId}">
                        <div class="form-group">
                            <label>Nouveau Stop Loss</label>
                            <input type="number" step="0.00001" id="new-sl-${position.dealId}" value="${position.stopLevel || ''}">
                        </div>
                        <div class="form-group">
                            <label>Nouveau Take Profit</label>
                            <input type="number" step="0.00001" id="new-tp-${position.dealId}" value="${position.limitLevel || ''}">
                        </div>
                        <div class="checkbox-label">
                            <input type="checkbox" id="new-trailing-${position.dealId}" ${position.trailingStep ? 'checked' : ''}>
                            Activer Trailing Stop
                        </div>
                        <div id="trailing-config-${position.dealId}" style="display: ${position.trailingStep ? 'block' : 'none'}">
                            <div class="form-group">
                                <label>Incrément Trailing (points)</label>
                                <input type="number" id="trailing-increment-${position.dealId}" value="10">
                            </div>
                        </div>
                        <button class="btn btn-success" onclick="app.updatePosition('${position.dealId}')">
                            Sauvegarder
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        // Add trailing stop toggle listeners
        this.positions.forEach(pos => {
            const checkbox = document.getElementById(`new-trailing-${pos.position.dealId}`);
            if (checkbox) {
                checkbox.addEventListener('change', (e) => {
                    document.getElementById(`trailing-config-${pos.position.dealId}`).style.display =
                        e.target.checked ? 'block' : 'none';
                });
            }
        });
    }

    toggleEditPosition(dealId) {
        const editForm = document.getElementById(`edit-${dealId}`);
        if (editForm.classList.contains('show')) {
            editForm.classList.remove('show');
        } else {
            // Hide all other edit forms
            document.querySelectorAll('.position-edit-form').forEach(form => {
                form.classList.remove('show');
            });
            editForm.classList.add('show');
        }
    }

    async updatePosition(dealId) {
        const newSl = document.getElementById(`new-sl-${dealId}`).value;
        const newTp = document.getElementById(`new-tp-${dealId}`).value;
        const trailingEnabled = document.getElementById(`new-trailing-${dealId}`).checked;
        const trailingIncrement = document.getElementById(`trailing-increment-${dealId}`).value;

        const updateData = {};

        if (newSl) updateData.stop_level = parseFloat(newSl);
        if (newTp) updateData.profit_level = parseFloat(newTp);

        if (trailingEnabled) {
            updateData.trailing_stop = {
                enabled: true,
                increment: parseFloat(trailingIncrement)
            };
        }

        try {
            const response = await fetch(`${this.apiUrl}/api/positions/${dealId}/update`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData)
            });

            if (response.ok) {
                this.showNotification('Position mise à jour avec succès', 'success');
                this.loadPositions();
            } else {
                const data = await response.json();
                this.showNotification(data.error || 'Erreur lors de la mise à jour', 'error');
            }
        } catch (error) {
            this.showNotification('Erreur de connexion', 'error');
            console.error(error);
        }
    }

    async closePosition(dealId, direction, size) {
        if (!confirm('Êtes-vous sûr de vouloir clôturer cette position ?')) {
            return;
        }

        // Opposite direction for closing
        const closeDirection = direction === 'BUY' ? 'SELL' : 'BUY';

        try {
            const response = await fetch(`${this.apiUrl}/api/positions/${dealId}/close`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ direction: closeDirection, size })
            });

            if (response.ok) {
                this.showNotification('Position clôturée avec succès', 'success');
                this.loadPositions();
            } else {
                const data = await response.json();
                this.showNotification(data.error || 'Erreur lors de la clôture', 'error');
            }
        } catch (error) {
            this.showNotification('Erreur de connexion', 'error');
            console.error(error);
        }
    }

    // Notifications
    showNotification(message, type = 'info') {
        const container = document.getElementById('notifications');

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;

        const icons = {
            success: '✓',
            error: '✗',
            info: 'ℹ'
        };

        notification.innerHTML = `
            <span class="notification-icon">${icons[type] || icons.info}</span>
            <span class="notification-message">${message}</span>
        `;

        container.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
}

// Initialize app
const app = new IGTradingApp();
