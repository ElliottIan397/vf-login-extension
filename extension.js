(function () {
  const form = document.getElementById("loginForm");
  const errorDiv = document.getElementById("error");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorDiv.textContent = "";

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const res = await fetch("https://YOUR_BACKEND/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "omit", // IMPORTANT: no cookies
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) throw new Error("Login failed");

      const { customerId, sessionToken } = await res.json();

      // Inject identity into Voiceflow (NO PASSWORD)
      window.voiceflow.chat.setVariables({
        isAuthenticated: true,
        customerId,
        sessionToken
      });

      // Optional: signal completion
      window.voiceflow.chat.send({
        type: "event",
        payload: { name: "login_success" }
      });

    } catch (err) {
      errorDiv.textContent = "Invalid email or password";
    }
  });
})();
