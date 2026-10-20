const API_BASE_URL = "http://127.0.0.1:8000";
const presets = [
  ["cool_19", "Cool 19°C"],
  ["cool_20", "Cool 20°C"],
  ["cool_20_fan_auto", "Cool 20°C · Fan Auto"],
  ["cool_20_fan_high", "Cool 20°C · Fan High"],
];

const connection = document.querySelector("#connection");
const message = document.querySelector("#message");
const container = document.querySelector("#presets");

async function sendPreset(preset, label) {
  message.textContent = `Mengirim ${label}…`;
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/devices/ac-sharp-1/commands`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ preset }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || "Perintah gagal");
    message.textContent = data.message;
  } catch (error) {
    message.textContent = `Tidak dapat terhubung ke backend: ${error.message}`;
  }
}

for (const [preset, label] of presets) {
  const button = document.createElement("button");
  button.textContent = label;
  button.addEventListener("click", () => sendPreset(preset, label));
  container.append(button);
}

fetch(`${API_BASE_URL}/health`)
  .then((response) => response.json())
  .then((data) => {
    connection.textContent = `Backend aktif · ${data.mode}`;
    connection.classList.add("connected");
  })
  .catch(() => {
    connection.textContent = "Backend belum aktif";
  });
