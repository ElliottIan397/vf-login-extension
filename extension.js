// ===== CONFIG =====
const AUTH_URL = "https://YOUR_BACKEND/auth/login"; // <-- change this
const ACTION_NAME = "login_form";                   // <-- must match VF Custom Action name

// ===== RESPONSE EXTENSION =====
const loginExtension = {
    name: ACTION_NAME,
    type: "response",

    // This extension runs when VF emits a trace with this action name.
    match: ({ trace }) => {
        console.log("LOGIN EXTENSION TRACE:", trace);
        return trace?.payload?.name === ACTION_NAME;
    },

    render: ({ element }) => {
        // Build UI inside the chat bubble/container provided by VF
        element.innerHTML = `
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

        const form = element.querySelector("#vfLoginForm");
        const err = element.querySelector("#vfErr");
        const emailEl = element.querySelector("#vfEmail");
        const passEl = element.querySelector("#vfPassword");
        const btn = form.querySelector("button");

        const onSubmit = async (e) => {
            e.preventDefault();
            err.textContent = "";
            btn.disabled = true;
            btn.textContent = "Logging in...";

            try {
                const email = emailEl.value.trim();
                const password = passEl.value; // do NOT log this

                const res = await fetch(AUTH_URL, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "omit",
                    body: JSON.stringify({ email, password }),
                });

                if (!res.ok) throw new Error("Login failed");

                const data = await res.json();
                const { customerId, sessionToken } = data;

                // Inject identity into VF (NO PASSWORD)
                window.voiceflow?.chat?.setVariables?.({
                    isAuthenticated: true,
                    customerId,
                    sessionToken,
                });

                // Optional: let the flow continue via an event
                window.voiceflow?.chat?.send?.({
                    type: "event",
                    payload: { name: "login_success" },
                });

                // Lock the form after success
                btn.textContent = "Logged in";
            } catch (e2) {
                err.textContent = "Invalid email or password";
                btn.disabled = false;
                btn.textContent = "Log in";
            } finally {
                // wipe the password field no matter what
                passEl.value = "";
            }
        };

        form.addEventListener("submit", onSubmit);

        // Cleanup function VF will call if it re-renders/tears down this message
        return () => {
            form.removeEventListener("submit", onSubmit);
        };
    },
};

// Export to the global scope so your web chat snippet can register it
window.vfExtensions = window.vfExtensions || [];
window.vfExtensions.push(loginExtension);
