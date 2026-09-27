const SERVER_HOST = "http://localhost:8000";
const API_HOST = `${SERVER_HOST}/api`;
let api_token = undefined;
let ws = null; // WebSocket connection

/**
 * Call API
 * @param {string} path
 * @param {string} method
 * @param {Object|undefined} body
 * @returns {Object}
 */
const callApi = async (path, method, body = undefined) => {
    const headers = {
        "Content-Type": "application/json"
    };
    if (api_token) {
        headers["Authorization"] = api_token;
    }
    const response = await fetch(`${API_HOST}/${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined
    });

    const bodyResult = await response.json();
    if (response.status < 200 || response.status >= 400) {
        const err = `Error trying to call ${path}.${bodyResult.error || ""}`;
        console.error(err);
        throw new Error(err);
    }
    return bodyResult;
}

/**
 * Establish WebSocket connection for real-time notifications
 */
const connectWebSocket = (api_token) => {
    if (!api_token) {
        console.log("WebSocket: no token, cannot connect");
        return;
    }

    ws = new WebSocket(`${SERVER_HOST}/ws`);
    ws.addEventListener("open", (event) => {
        ws.send(JSON.stringify({
            "token":api_token
        }));
    });
    ws.addEventListener("message", (event) => {
        try {
            const data = JSON.parse(event.data);
            if (data.type === 'match') {
                console.log("WebSocket: match notification received", data);
                // Reload dashboard to show new match
                loadDashboard();
            } else if (data.type === 'error') {
                console.error("WebSocket error:", data.message);
            }
        } catch (e) {
            console.error("WebSocket: failed to parse message", e, event.data);
        }
    });

    ws.addEventListener("close", () => {
        console.log("WebSocket: disconnected");
        ws = null;
    })
    ws.addEventListener("error", (error) => {
        console.error("WebSocket error:", error);
        ws = null;
    });
};

/**
 * Close WebSocket connection
 */
const disconnectWebSocket = () => {
    if (ws) {
        ws.close();
        ws = null;
    }
};

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
                }else {
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
            matches: []
        };
    },
    methods: {
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
            const email = document.getElementById("txtEmail").value;
            const username = document.getElementById("txtUsername").value;

            if (!email || !username) {
                alert("Please enter both email and username");
                return;
            }

            try {
                const {token} = await this.callApi("signin", "POST", { email, username })
                this.api_token = token;
                this.isLoggedIn = true;
                
                // Connect WebSocket for real-time notifications
                connectWebSocket(token);
                
                await this.loadDashboard();
                ViewManager.loadView(HOME_VIEW);
            } catch (err) {
                console.error("Signin failed:", err);
            }
        },

        async loadDashboard() {
            const data = await this.callApi("dashboard", "GET")
            document.getElementById("lblHomeUsername").textContent = data.username;
            document.getElementById("lblHomePoints").textContent = `${data.points} Points`;

            this.matches = data.matches || [];
            const dashboardBody = document.getElementById("dashboardBody");
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

        async searchMatch() {
            //! TODO: if we want a token we need to ask fist and then call
            const evtSource = new EventSource(`${API_HOST}/match-notification?tmp=${txtEmail.value}`);
            evtSource.addEventListener("notice", (e) => {
                //! TO DELETE
                console.log("SSE notice:", e); 
            });
            evtSource.addEventListener("update", (e) => {
                //! TO DELETE
                console.log("SSE update:", e);
            });

            evtSource.addEventListener("message", (e) => {
                console.log("SSE Message:", e, "now:", Date.now())
                evtSource.close()
            });
            evtSource.onerror = (err) => {
                console.error("SSE failed:", err);
                evtSource.close()
            };

            const data = await this.callApi("search-match", "POST", {game: "TIC-TAC-TOE"});
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
            ViewManager.closeRightPanel();
            ViewManager.loadView(LOGIN_VIEW);

            // Clear form
            document.getElementById("txtEmail").value = "";
            document.getElementById("txtUsername").value = "";

            // Disconnect WebSocket
            disconnectWebSocket();
        }
    },

    mounted() {
        // Event listeners for DOM elements
        const btnSignin = document.getElementById("btnSignin");
        if (btnSignin) {
            btnSignin.addEventListener("click", () => this.signin());
        }

        const txtEmail = document.getElementById("txtEmail");
        const txtUsername = document.getElementById("txtUsername");

        const btnHomeMatch = document.getElementById("btnHomeMatch");
        if (btnHomeMatch) {
            btnHomeMatch.addEventListener("click", this.searchMatch);
        }

        const btnHamburger = document.getElementById("btnHamburger");
        if (btnHamburger) {
            btnHamburger.addEventListener("click", this.toggleRightPanel);
        }

        const btnLogout = document.getElementById("btnLogout");
        if (btnLogout) {
            btnLogout.addEventListener("click", this.logout);
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
            disconnectWebSocket();
        });
    }
}).mount("#loginSection");
