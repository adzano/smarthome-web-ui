const API_BASE_URL = (window.SMART_HOME_API_URL || "").replace(/\/$/, "");
const presets = [
  ["cool_19", "Cool 19°C", "Dingin maksimal"],
  ["cool_20", "Cool 20°C", "Pengaturan nyaman"],
  ["cool_20_fan_auto", "Cool 20°C · Fan Auto", "Kipas otomatis"],
  ["cool_20_fan_high", "Cool 20°C · Fan High", "Kipas tinggi"],
];

const $ = (selector) => document.querySelector(selector);
const loginView = $("#login-view");
const dashboardView = $("#dashboard-view");
const loginForm = $("#login-form");
const loginButton = $("#login-button");
const loginMessage = $("#login-message");
const logoutButton = $("#logout-button");
const connection = $("#connection");
const deviceBadge = $("#device-badge");
const deviceDetail = $("#device-detail");
const message = $("#message");
const presetContainer = $("#presets");
let refreshTimer;

async function api(path, options = {}) {
  const response = await fetch(API_BASE_URL + path, {
    credentials: "same-origin",
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
  });
  const isJson = response.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await response.json() : null;
  if (!response.ok) throw new Error(data?.detail || "Permintaan gagal");
  return data;
}

function showLogin(text = "") {
  clearInterval(refreshTimer);
  loginMessage.textContent = text;
  loginView.hidden = false;
  dashboardView.hidden = true;
  $("#password").value = "";
  $("#username").focus();
}

function showDashboard() {
  loginView.hidden = true;
  dashboardView.hidden = false;
  refreshDevice();
  clearInterval(refreshTimer);
  refreshTimer = setInterval(refreshDevice, 20000);
}

function setControlsDisabled(disabled) {
  presetContainer.querySelectorAll("button").forEach((button) => { button.disabled = disabled; });
}

async function refreshDevice() {
  try {
    const [health, device] = await Promise.all([api("/health"), api("/api/v1/devices/ac-sharp-1")]);
    const online = device.online && health.broker === "connected";
    connection.textContent = health.broker === "connected" ? "Server dan broker aktif" : "Server aktif · broker terputus";
    connection.className = "status " + (health.broker === "connected" ? "connected" : "warning");
    deviceBadge.textContent = online ? "Online" : "Menunggu ESP32";
    deviceBadge.className = "badge " + (online ? "online" : "offline");
    deviceDetail.textContent = online ? "ESP32 siap menerima perintah melalui MQTT." : "Belum menerima status perangkat. Perintah tetap dapat dicoba setelah ESP32 tersambung.";
    setControlsDisabled(health.broker !== "connected");
  } catch (error) {
    if (error.message === "Authentication required") return showLogin("Sesi Anda telah berakhir. Silakan masuk lagi.");
    connection.textContent = "Tidak dapat menghubungi server";
    connection.className = "status warning";
    deviceBadge.textContent = "Tidak tersedia";
    deviceBadge.className = "badge offline";
    setControlsDisabled(true);
  }
}

async function sendPreset(preset, label) {
  setControlsDisabled(true);
  message.textContent = "Mengirim " + label + "…";
  try {
    const data = await api("/api/v1/devices/ac-sharp-1/commands", {
      method: "POST",
      body: JSON.stringify({ preset }),
    });
    message.textContent = data.message || label + " telah dikirim.";
  } catch (error) {
    message.textContent = error.message === "Authentication required" ? "Sesi berakhir. Silakan masuk lagi." : "Perintah gagal: " + error.message;
    if (error.message === "Authentication required") showLogin("Sesi Anda telah berakhir. Silakan masuk lagi.");
  } finally {
    refreshDevice();
  }
}

for (const [preset, label, detail] of presets) {
  const button = document.createElement("button");
  button.className = "preset";
  button.type = "button";
  button.innerHTML = "<strong>" + label + "</strong><small>" + detail + "</small>";
  button.addEventListener("click", () => sendPreset(preset, label));
  presetContainer.append(button);
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  loginButton.disabled = true;
  loginMessage.textContent = "Memeriksa akun…";
  try {
    await api("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ username: $("#username").value, password: $("#password").value }),
    });
    showDashboard();
  } catch (error) {
    loginMessage.textContent = error.message === "Invalid credentials" ? "Username atau password tidak sesuai." : error.message;
  } finally {
    loginButton.disabled = false;
  }
});

logoutButton.addEventListener("click", async () => {
  try { await api("/api/v1/auth/logout", { method: "POST" }); } catch (_) { }
  showLogin();
});

api("/api/v1/auth/me")
  .then((session) => (session.authenticated ? showDashboard() : showLogin()))
  .catch(() => showLogin("Server tidak dapat dijangkau."));

if ("serviceWorker" in navigator && window.isSecureContext) {
  navigator.serviceWorker.register("service-worker.js").catch(() => {});
}
