const storageKey = "larpantomWalletConfig";
const clone = (value) => JSON.parse(JSON.stringify(value));
const defaults = clone(window.WALLET_CONFIG);
const saved = JSON.parse(localStorage.getItem(storageKey) || "null");
let config = saved ? { ...defaults, ...saved } : defaults;
const defaultAssetsByName = new Map(defaults.assets.map((asset) => [asset.name, asset]));
let migratedSavedAssets = false;

config.assets = config.assets.map((asset) => {
  const defaultAsset = defaultAssetsByName.get(asset.name);

  if (!defaultAsset || asset.image) {
    return asset;
  }

  migratedSavedAssets = true;
  return {
    ...asset,
    logo: defaultAsset.logo,
    image: defaultAsset.image,
    badge: defaultAsset.badge
  };
});

if (migratedSavedAssets) {
  localStorage.setItem(storageKey, JSON.stringify(config));
}

const $ = (selector, root = document) => root.querySelector(selector);
const assetsRoot = $("[data-assets]");
const settingsDialog = $("[data-settings-dialog]");
const receiveDialog = $("[data-receive-dialog]");
const settingsForm = $("[data-settings-form]");
const assetFields = $("[data-asset-fields]");

const logoMarkup = {
  solana: '<span></span><span></span><span></span>',
  hulvin: '<strong>₿</strong>',
  usdt: '<strong>₮</strong>',
  setosi: '<strong>◔</strong>',
  polygon: '<strong>◇</strong>'
};

const escapeHtml = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    };
    return entities[character];
  });

const blankAsset = () => ({
  name: "New Asset",
  amount: "0 TOKEN",
  value: "$0.00",
  delta: "$0.00",
  deltaType: "neutral",
  logo: "custom",
  image: "",
  badge: false
});

const getAssetInput = (field, name) => field.querySelector(`[name="${name}"]`);

function render() {
  document.documentElement.style.setProperty("--accent", config.accent);
  $("[data-wallet-name]").textContent = config.walletName;
  $("[data-wallet-initial]").textContent = config.walletInitial || config.walletName.charAt(0);
  $("[data-balance]").textContent = config.balance;
  $("[data-change]").textContent = config.change;
  $("[data-percent]").textContent = config.percent;
  $("[data-address]").textContent = config.receiveAddress;

  assetsRoot.innerHTML = config.assets
    .map(
      (asset) => `
        <article class="asset-card">
          <div class="token-logo ${escapeHtml(asset.logo || "custom")}">
            ${
              asset.image
                ? `<img src="${escapeHtml(asset.image)}" alt="" />`
                : logoMarkup[asset.logo] || `<strong>${escapeHtml(asset.name.charAt(0))}</strong>`
            }
            ${asset.badge ? '<span class="chain-badge">≡</span>' : ""}
          </div>
          <div class="asset-copy">
            <h2>${escapeHtml(asset.name)}</h2>
            <p>${escapeHtml(asset.amount)}</p>
          </div>
          <div class="asset-value">
            <strong>${escapeHtml(asset.value)}</strong>
            <span class="${escapeHtml(asset.deltaType || "neutral")}">${escapeHtml(asset.delta)}</span>
          </div>
        </article>
      `
    )
    .join("");
}

function fillSettingsForm() {
  settingsForm.walletName.value = config.walletName;
  settingsForm.balance.value = config.balance;
  settingsForm.change.value = config.change;
  settingsForm.percent.value = config.percent;
  settingsForm.accent.value = config.accent;
  renderAssetEditor();
}

function renderAssetEditor() {
  assetFields.innerHTML = config.assets
    .map(
      (asset, index) => `
        <fieldset class="asset-edit" data-index="${index}">
          <legend>${escapeHtml(asset.name || `Asset ${index + 1}`)}</legend>
          <label>
            Name
            <input name="name" type="text" value="${escapeHtml(asset.name)}" autocomplete="off" />
          </label>
          <label>
            Amount
            <input name="amount" type="text" value="${escapeHtml(asset.amount)}" autocomplete="off" />
          </label>
          <label>
            Value
            <input name="value" type="text" value="${escapeHtml(asset.value)}" autocomplete="off" />
          </label>
          <label>
            Change
            <input name="delta" type="text" value="${escapeHtml(asset.delta)}" autocomplete="off" />
          </label>
          <label>
            Change color
            <select name="deltaType">
              <option value="positive" ${asset.deltaType === "positive" ? "selected" : ""}>Green</option>
              <option value="negative" ${asset.deltaType === "negative" ? "selected" : ""}>Red</option>
              <option value="neutral" ${asset.deltaType === "neutral" ? "selected" : ""}>Gray</option>
            </select>
          </label>
          <label>
            Logo style
            <select name="logo">
              ${["solana", "hulvin", "usdt", "setosi", "polygon", "custom"]
                .map((logo) => `<option value="${logo}" ${asset.logo === logo ? "selected" : ""}>${logo}</option>`)
                .join("")}
            </select>
          </label>
          <label>
            Image URL/path
            <input name="image" type="text" value="${escapeHtml(asset.image || "")}" autocomplete="off" placeholder="optional" />
          </label>
          <label class="checkbox-label">
            <input name="badge" type="checkbox" ${asset.badge ? "checked" : ""} />
            Show small chain badge
          </label>
          <button class="plain-button small remove-asset" type="button" data-remove-asset>Remove</button>
        </fieldset>
      `
    )
    .join("");
}

function readSettingsForm() {
  const walletName = settingsForm.walletName.value.trim() || defaults.walletName;
  const assets = [...assetFields.querySelectorAll(".asset-edit")].map((field) => ({
    name: getAssetInput(field, "name").value.trim() || "Asset",
    amount: getAssetInput(field, "amount").value.trim(),
    value: getAssetInput(field, "value").value.trim(),
    delta: getAssetInput(field, "delta").value.trim(),
    deltaType: getAssetInput(field, "deltaType").value,
    logo: getAssetInput(field, "logo").value,
    image: getAssetInput(field, "image").value.trim(),
    badge: getAssetInput(field, "badge").checked
  }));

  return {
    ...config,
    walletName,
    walletInitial: walletName.charAt(0),
    balance: settingsForm.balance.value.trim() || defaults.balance,
    change: settingsForm.change.value.trim() || defaults.change,
    percent: settingsForm.percent.value.trim() || defaults.percent,
    accent: settingsForm.accent.value,
    assets
  };
}

function saveCurrentSettings() {
  config = readSettingsForm();
  localStorage.setItem(storageKey, JSON.stringify(config));
  render();
}

function openDialog(dialog) {
  if (typeof dialog.showModal === "function") {
    dialog.showModal();
  } else {
    dialog.setAttribute("open", "");
  }
}

function closeDialog(dialog) {
  if (typeof dialog.close === "function") {
    dialog.close();
  } else {
    dialog.removeAttribute("open");
  }
}

document.querySelectorAll("[data-open-settings]").forEach((button) => {
  button.addEventListener("click", () => {
    fillSettingsForm();
    openDialog(settingsDialog);
  });
});

document.querySelectorAll("[data-open-receive]").forEach((button) => {
  button.addEventListener("click", () => openDialog(receiveDialog));
});

settingsForm.addEventListener("submit", (event) => {
  event.preventDefault();
  saveCurrentSettings();
  closeDialog(settingsDialog);
});

settingsForm.addEventListener("input", saveCurrentSettings);
settingsForm.addEventListener("change", saveCurrentSettings);

$("[data-add-asset]").addEventListener("click", () => {
  saveCurrentSettings();
  config.assets = [...config.assets, blankAsset()];
  renderAssetEditor();
  localStorage.setItem(storageKey, JSON.stringify(config));
  render();
  if (assetFields.lastElementChild) {
    assetFields.lastElementChild.scrollIntoView({ behavior: "smooth", block: "center" });
  }
});

assetFields.addEventListener("click", (event) => {
  if (!event.target.matches("[data-remove-asset]")) {
    return;
  }

  const field = event.target.closest(".asset-edit");
  const index = Number(field.dataset.index);
  saveCurrentSettings();
  config.assets = config.assets.filter((_, assetIndex) => assetIndex !== index);
  renderAssetEditor();
  localStorage.setItem(storageKey, JSON.stringify(config));
  render();
});

$("[data-reset]").addEventListener("click", () => {
  localStorage.removeItem(storageKey);
  config = clone(defaults);
  fillSettingsForm();
  localStorage.setItem(storageKey, JSON.stringify(config));
  render();
});

document.querySelectorAll("[data-action]").forEach((button) => {
  button.addEventListener("click", () => {
    button.animate(
      [
        { transform: "scale(1)" },
        { transform: "scale(.97)" },
        { transform: "scale(1)" }
      ],
      { duration: 180, easing: "ease-out" }
    );
  });
});

render();
