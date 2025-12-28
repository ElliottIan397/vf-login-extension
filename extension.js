console.log("🚨 LOGIN EXTENSION FILE EXECUTED");

const AUTH_URL = "https://vf-nc-gateway.onrender.com/vf/login";
const ACTION_NAME = "login_form";

const loginExtension = {
    name: ACTION_NAME,
    type: "response",

    match: ({ trace }) => trace?.type === ACTION_NAME,

    render: ({ element }) => {
        const container = document.createElement("div");

        container.innerHTML = `
  <div style="font-family:system-ui,sans-serif;padding:8px">
    <input id="vfEmail" type="email" placeholder="Email" required style="width:100%;padding:8px;margin-bottom:8px" />
    <input id="vfPassword" type="password" placeholder="Password" required style="width:100%;padding:8px;margin-bottom:8px" />
    <button type="button" id="vfLoginBtn" style="width:100%;padding:10px">Log in</button>
    <div id="vfErr" style="color:#b00020;margin-top:6px"></div>
  </div>
`;

        element.appendChild(container);

        const err = container.querySelector("#vfErr");
        const emailEl = container.querySelector("#vfEmail");
        const passEl = container.querySelector("#vfPassword");
        const loginBtn = container.querySelector("#vfLoginBtn");

        const onSubmit = async () => {
            console.log("🟡 LOGIN SUBMIT HANDLER FIRED");

            err.textContent = "";
            loginBtn.disabled = true;
            loginBtn.textContent = "Logging in...";

            const email = emailEl.value.trim();
            const password = passEl.value;

            console.log("🟡 ABOUT TO CALL AUTH", { email });

            try {
                const res = await fetch(AUTH_URL, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password }),
                });

                console.log("🟢 FETCH RETURNED", res);

                if (!res.ok) throw new Error("Login failed");

                const data = await res.json();
                console.log("🟢 AUTH RESPONSE", data);

                if (!data.sessionToken) throw new Error("No session token");

                window.voiceflow.chat.interact({
                    type: "complete",
                    payload: {
                        isAuthenticated: true,
                        sessionToken: data.sessionToken,
                    },
                });

                loginBtn.textContent = "Logged in";
            } catch (e) {
                console.error("🔴 LOGIN ERROR", e);
                err.textContent = "Invalid email or password";
                loginBtn.disabled = false;
                loginBtn.textContent = "Log in";
            } finally {
                passEl.value = "";
            }
        };

        loginBtn.addEventListener("click", onSubmit);

        return () => loginBtn.removeEventListener("click", onSubmit);
    },
};

window.vfExtensions = window.vfExtensions || [];
window.vfExtensions.push(loginExtension);
