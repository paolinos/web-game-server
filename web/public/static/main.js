const SERVER_HOST = "http://localhost:8000/api";
let api_token = undefined;

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
    const response = await fetch(`${SERVER_HOST}/${path}`, {
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

            const response = await fetch(`${SERVER_HOST}/${path}`, {
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

            const {token} = await this.callApi("signin", "POST", { email, username })
            this.api_token = token;
            this.isLoggedIn = true;
            await this.loadDashboard();
            ViewManager.loadView(HOME_VIEW);
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
            const evtSource = new EventSource(`${SERVER_HOST}/match-notification?tmp=${txtEmail.value}`);
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
    }
}).mount("#loginSection");
