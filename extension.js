console.log("🚨 LOGIN EXTENSION FILE EXECUTED");

// ===== CONFIG =====
const AUTH_URL = "https://YOUR_BACKEND/auth/login"; // <-- change this
const ACTION_NAME = "login_form";                   // <-- must match VF Custom Action name

// ===== RESPONSE EXTENSION =====
const loginExtension = {
    name: ACTION_NAME,
    type: "response",

    // This extension runs when VF emits a trace with this action name.
    match: ({ trace }) => {
        console.log("🔥 TRACE SEEN:", trace);
        return false;
    },

    render: ({ element }) => {
        // Create a container node (DO NOT write directly to element.innerHTML)
        const container = document.createElement("div");

        container.innerHTML = `
    <div style="font-family:system-ui,sans-serif;padding:8px">
      <form id="vfLoginForm">
        <input
          id="vfEmail"
          type="email"
          placeholder="Email"
          required
          style="width:100%;padding:8px;margin:0 0 8px 0"
        />
        <input
          id="vfPassword"
          type="password"
          placeholder="Password"
          required
          style="width:100%;padding:8px;margin:0 0 8px 0"
        />
        <button type="submit" style="width:100%;padding:10px;cursor:pointer">
          Log in
        </button>
        <div id="vfErr" style="color:#b00020;margin-top:6px"></div>
      </form>
    </div>
  `;

        // Append into Voiceflow-managed element
        element.appendChild(container);

        // Wire up handlers AFTER append
        const form = container.querySelector("#vfLoginForm");
        const err = container.querySelector("#vfErr");
        const emailEl = container.querySelector("#vfEmail");
        const passEl = container.querySelector("#vfPassword");
        const btn = form.querySelector("button");

        const onSubmit = async (e) => {
            e.preventDefault();
            err.textContent = "";
            btn.disabled = true;
            btn.textContent = "Logging in...";

            try {
                const email = emailEl.value.trim();
                const password = passEl.value; // never log

                const res = await fetch(AUTH_URL, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "omit",
                    body: JSON.stringify({ email, password }),
                });

                if (!res.ok) throw new Error("Login failed");

                const { customerId, sessionToken } = await res.json();

                window.voiceflow.chat.setVariables({
                    isAuthenticated: true,
                    customerId,
                    sessionToken,
                });

                window.voiceflow.chat.send({
                    type: "event",
                    payload: { name: "login_success" },
                });

                btn.textContent = "Logged in";
            } catch (err2) {
                err.textContent = "Invalid email or password";
                btn.disabled = false;
                btn.textContent = "Log in";
            } finally {
                passEl.value = "";
            }
        };

        form.addEventListener("submit", onSubmit);

        // Cleanup hook (required)
        return () => {
            form.removeEventListener("submit", onSubmit);
        };
    },
}

// Export to the global scope so your web chat snippet can register it
window.vfExtensions = window.vfExtensions || [];
window.vfExtensions.push(loginExtension);
