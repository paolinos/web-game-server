const SERVER_HOST = "http://localhost:8000";
const API_HOST = `${SERVER_HOST}/api`;

const LOGIN_VIEW = "loginSection";
const HOME_VIEW = "homeSection";
const GAME_VIEW = "gameSection";

/**
 * View Manager for switching between sections
 */
const ViewManager = (() => {
    let _views = {};
    let _activeView = undefined;

    return {
        setView: (key, initCallback) => {
            const element = document.getElementById(key);
            _views[key] = {
                element: element,
                cb: initCallback
            };
            if (element) {
                element.style.display = "none";
            }
        },
        loadView: (key) => {
            const view = _views[key];
            if (view) {
                if (_activeView) {
                    _activeView.element.style.display = "none";
                    _activeView = undefined;
                }
                if (view.cb) {
                    view.cb();
                }
                if (view.element.id === LOGIN_VIEW) {
                    view.element.style.removeProperty('display');
                } else {
                    view.element.style.display = "block";
                }
                _activeView = view;
            }
        },
        closeRightPanel: () => {
            const panel = document.getElementById("rightPanel");
            if (panel) {
                panel.classList.remove("active");
            }
        }
    };
})();

// Vue-based view management for smoother transitions
const { createApp } = Vue;

createApp({
    data() {
        return {
            api_token: undefined,
            isLoggedIn: false,
            rightPanelVisible: false,
            matches: [],
            ws: null,
            socketId: null,
            email: "",
            username: "",
            reconnectAttempts: 0,
            maxReconnectAttempts: 5,
            baseReconnectDelay: 1000
        };
    },
    methods: {
        showError(message) {
            console.error(message);
            alert(message);
        },

        async callApi(path, method, body = undefined) {
            const headers = { "Content-Type": "application/json" };
            if (this.api_token) {
                headers["Authorization"] = this.api_token;
            }

            const response = await fetch(`${API_HOST}/${path}`, {
                method,
                headers,
                body: body ? JSON.stringify(body) : undefined
            });
            const bodyResult = await response.json();
            if (response.status < 200 || response.status >= 400) {
                throw new Error(`Error trying to call ${path}.${bodyResult.error || ""}`);
            }
            return bodyResult;
        },

        async signin() {
            if (!this.email || !this.username) {
                this.showError("Please enter both email and username");
                return;
            }

            try {
                const { token } = await this.callApi("signin", "POST", {
                    email: this.email,
                    username: this.username
                });
                this.api_token = token;
                this.isLoggedIn = true;

                this.connectWebSocket(token);
                await this.loadDashboard();
                ViewManager.loadView(HOME_VIEW);
            } catch (err) {
                this.showError("Signin failed: " + err.message);
            }
        },

        async loadDashboard() {
            const data = await this.callApi("dashboard", "GET");

            const lblHomeUsername = document.getElementById("lblHomeUsername");
            if (lblHomeUsername) {
                lblHomeUsername.textContent = data.username;
            }

            const lblHomePoints = document.getElementById("lblHomePoints");
            if (lblHomePoints) {
                lblHomePoints.textContent = `${data.points} Points`;
            }

            this.matches = data.matches || [];
            const dashboardBody = document.getElementById("dashboardBody");
            if (!dashboardBody) {
                return;
            }

            dashboardBody.innerHTML = "";
            for (const match of this.matches) {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${match.game}</td>
                    <td>${match.points}</td>
                    <td>${match.playedAt || "N/A"}</td>
                `;
                dashboardBody.appendChild(tr);
            }
        },

        searchMatch() {
            if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
                this.showError("WebSocket is not connected. Please sign in again.");
                return;
            }

            this.ws.send(JSON.stringify({
                type: "match.search",
                game: "TIC-TAC-TOE"
            }));
        },

        toggleRightPanel() {
            this.rightPanelVisible = !this.rightPanelVisible;
            const panel = document.getElementById("rightPanel");
            if (panel) {
                panel.classList.toggle("active", this.rightPanelVisible);
            }
        },

        logout() {
            this.api_token = undefined;
            this.isLoggedIn = false;
            this.rightPanelVisible = false;
            this.email = "";
            this.username = "";
            this.socketId = null;
            ViewManager.closeRightPanel();
            ViewManager.loadView(LOGIN_VIEW);
            this.disconnectWebSocket();
        },

        connectWebSocket(token) {
            if (!token) {
                console.log("WebSocket: no token, cannot connect");
                return;
            }

            if (this.ws) {
                this.disconnectWebSocket();
            }

            try {
                this.ws = new WebSocket(`${SERVER_HOST}/ws`);
            } catch (err) {
                this.showError("Failed to create WebSocket: " + err.message);
                return;
            }

            this.ws.addEventListener("open", () => {
                this.ws.send(JSON.stringify({ token }));
            });

            this.ws.addEventListener("message", (event) => {
                // Handle server ping-pong heartbeat
                if (event.data === "ping") {
                    this.ws.send("pong");
                    return;
                }

                try {
                    const data = JSON.parse(event.data);
                    if (data.type === 'connected') {
                        this.socketId = data.socketId;
                        this.reconnectAttempts = 0;
                        console.log("WebSocket: connected", data.socketId);
                    } else if (data.type === 'match') {
                        console.log("WebSocket: match notification received", data);
                        this.loadDashboard();
                        ViewManager.loadView(GAME_VIEW);
                    } else if (data.type === 'match.search.waiting') {
                        console.log("WebSocket: waiting for match", data);
                    } else if (data.type === 'error') {
                        this.showError("Server error: " + data.message);
                    }
                } catch (e) {
                    console.error("WebSocket: failed to parse message", e, event.data);
                }
            });

            this.ws.addEventListener("close", () => {
                console.log("WebSocket: disconnected");
                this.ws = null;
                this.socketId = null;
                this.attemptReconnect();
            });

            this.ws.addEventListener("error", (error) => {
                console.error("WebSocket error:", error);
                this.showError("WebSocket connection error");
            });
        },

        attemptReconnect() {
            if (!this.isLoggedIn || !this.api_token) {
                return;
            }
            if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                this.showError("WebSocket: max reconnection attempts reached");
                return;
            }

            this.reconnectAttempts++;
            const delay = Math.min(
                this.baseReconnectDelay * Math.pow(2, this.reconnectAttempts),
                30000
            );
            console.log(`WebSocket: reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

            setTimeout(() => {
                if (this.isLoggedIn && this.api_token) {
                    this.connectWebSocket(this.api_token);
                }
            }, delay);
        },

        disconnectWebSocket() {
            this.reconnectAttempts = this.maxReconnectAttempts; // prevent auto-reconnect
            if (this.ws) {
                this.ws.close();
                this.ws = null;
            }
            this.socketId = null;
        }
    },

    mounted() {
        // Event listeners for DOM elements
        const btnSignin = document.getElementById("btnSignin");
        if (btnSignin) {
            btnSignin.addEventListener("click", () => this.signin());
        }

        const btnHomeMatch = document.getElementById("btnHomeMatch");
        if (btnHomeMatch) {
            btnHomeMatch.addEventListener("click", () => this.searchMatch());
        }

        const btnHamburger = document.getElementById("btnHamburger");
        if (btnHamburger) {
            btnHamburger.addEventListener("click", () => this.toggleRightPanel());
        }

        const btnLogout = document.getElementById("btnLogout");
        if (btnLogout) {
            btnLogout.addEventListener("click", () => this.logout());
        }

        // Initialize view manager
        ViewManager.setView(LOGIN_VIEW);
        ViewManager.setView(HOME_VIEW, () => {
            console.log("Init Home");
            this.loadDashboard();
        });
        ViewManager.setView(GAME_VIEW, () => {
            console.log("Init Game");
        });

        // Start with login view
        ViewManager.loadView(LOGIN_VIEW);

        // Clean up WebSocket on page unload
        window.addEventListener('beforeunload', () => {
            this.disconnectWebSocket();
        });
    }
}).mount("#loginSection");
