const defaults = {
  projectName: "Studio Musterstadt",
  area: 500,
  rentPerArea: 6,
  rent: 3000,
  utilities: 900,
  members: 750,
  grossFee: 39.9,
  vatRate: 19,
  personnelOne: 6000,
  personnelTwo: 1250,
  otherPersonnel: 0,
  marketing: 800,
  otherCosts: 2500,
  cleaning: 1000,
  equipment: 100000,
  buildout: 50000,
  otherInvestment: 10000,
  foundingCosts: 30000,
  reserveMonths: 3,
  equity: 100000,
  bankLoan: 200000,
  grants: 0,
  leaseFinancing: 0,
  loanInterest: 5.5,
  loanTermYears: 10,
  graceMonths: 0,
  monthlyLeasePayment: 0,
  startMembers: 350,
  rampMonths: 12,
  projectionMonths: 24,
  scenarioVariance: 15,
};

const APP_VERSION = "0.6.1";
const PROJECT_FILE_FORMAT = "studiocalculator-project";
const LEGACY_PROJECT_FILE_FORMATS = new Set(["studio-calculator-project"]);
const PROJECT_SCHEMA_VERSION = 1;
const MAX_PROJECT_FILE_SIZE = 100 * 1024;
const MAX_SHARE_PAYLOAD_LENGTH = 12000;
const SHARE_HASH_KEY = "project";
const STORAGE_KEYS = {
  draft: "studio-calculator:draft:v1",
  projects: "studio-calculator:projects:v1",
};

const form = document.querySelector("#calculatorForm");
const resultCard = document.querySelector("#resultCard");
const insights = document.querySelector("#insights");
const fundingStatus = document.querySelector("#fundingStatus");
const cashflowResult = document.querySelector("#cashflowResult");
const cashflowMap = document.querySelector("#cashflowMap");
const cashflowTableBody = document.querySelector("#cashflowTableBody");
const storageStatus = document.querySelector("#storageStatus");
const savedProjectSelect = document.querySelector("#savedProjectSelect");
const loadProjectButton = document.querySelector("#loadProjectButton");
const deleteProjectButton = document.querySelector("#deleteProjectButton");
const projectFileInput = document.querySelector("#projectFileInput");
const installAppButton = document.querySelector("#installAppButton");
const installStatus = document.querySelector("#installStatus");
const updateNotice = document.querySelector("#updateNotice");
const updateAppButton = document.querySelector("#updateAppButton");
let lastCapitalRequirement = 0;
let lastReportData = null;
let activeProjectId = null;
let autosaveTimer = null;
let storageAvailable = true;

const euro = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const euroDetailed = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const decimal = new Intl.NumberFormat("de-DE", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

function value(id) {
  const parsed = Number.parseFloat(document.querySelector(`#${id}`).value);
  return Number.isFinite(parsed) ? Math.max(parsed, 0) : 0;
}

function setText(id, content) {
  document.querySelector(`#${id}`).textContent = content;
}

function setStorageStatus(message, state = "neutral") {
  storageStatus.textContent = message;
  storageStatus.dataset.state = state;
}

function normalizeProjectData(rawData = {}) {
  const normalized = {};

  Object.entries(defaults).forEach(([id, defaultValue]) => {
    const input = document.querySelector(`#${id}`);
    if (id === "projectName") {
      normalized[id] =
        typeof rawData[id] === "string"
          ? rawData[id].trim().slice(0, 160)
          : defaultValue;
      return;
    }

    const parsed = Number.parseFloat(rawData[id]);
    let nextValue = Number.isFinite(parsed) ? parsed : defaultValue;
    const minimum = Number.parseFloat(input.min);
    const maximum = Number.parseFloat(input.max);
    if (Number.isFinite(minimum)) nextValue = Math.max(minimum, nextValue);
    if (Number.isFinite(maximum)) nextValue = Math.min(maximum, nextValue);
    normalized[id] = nextValue;
  });

  return normalized;
}

function collectProjectData() {
  const rawData = {};
  Object.keys(defaults).forEach((id) => {
    rawData[id] = document.querySelector(`#${id}`).value;
  });
  return normalizeProjectData(rawData);
}

function applyProjectData(rawData) {
  const data = normalizeProjectData(rawData);
  Object.entries(data).forEach(([id, storedValue]) => {
    document.querySelector(`#${id}`).value = storedValue;
  });
  calculate();
  return data;
}

function createProjectId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `project-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function checkStorageAvailability() {
  try {
    const testKey = `${STORAGE_KEYS.draft}:test`;
    localStorage.setItem(testKey, "1");
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

function readSavedProjects() {
  if (!storageAvailable) return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.projects);
    if (stored === null) return [];
    const projects = JSON.parse(stored);
    if (!Array.isArray(projects)) throw new Error("Ungültige Projektliste");

    return projects
      .filter(
        (project) =>
          project &&
          typeof project.id === "string" &&
          project.data &&
          typeof project.data === "object",
      )
      .map((project) => {
        const data = normalizeProjectData(project.data);
        return {
          id: project.id,
          name:
            typeof project.name === "string" && project.name.trim()
              ? project.name.trim().slice(0, 160)
              : data.projectName || "Unbenanntes Projekt",
          savedAt:
            typeof project.savedAt === "string" ? project.savedAt : new Date(0).toISOString(),
          data,
        };
      })
      .sort((a, b) => b.savedAt.localeCompare(a.savedAt));
  } catch {
    setStorageStatus("Lokale Projektliste konnte nicht gelesen werden", "error");
    return [];
  }
}

function writeSavedProjects(projects) {
  if (!storageAvailable) return false;
  try {
    localStorage.setItem(STORAGE_KEYS.projects, JSON.stringify(projects));
    return true;
  } catch {
    setStorageStatus("Projekt konnte lokal nicht gespeichert werden", "error");
    return false;
  }
}

function updateProjectButtons() {
  const hasSelection = savedProjectSelect.value !== "";
  loadProjectButton.disabled = !hasSelection;
  deleteProjectButton.disabled = !hasSelection;
}

function renderSavedProjects(preferredId = "") {
  const projects = readSavedProjects();
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Gespeichertes Projekt wählen …";

  const options = projects.map((project) => {
    const option = document.createElement("option");
    option.value = project.id;
    const savedAt = new Date(project.savedAt);
    const dateLabel = Number.isNaN(savedAt.getTime())
      ? ""
      : ` · ${savedAt.toLocaleDateString("de-DE")}`;
    option.textContent = `${project.name}${dateLabel}`;
    return option;
  });

  savedProjectSelect.replaceChildren(placeholder, ...options);
  if (projects.some((project) => project.id === preferredId)) {
    savedProjectSelect.value = preferredId;
  }
  updateProjectButtons();
  return projects;
}

function saveDraft({ announce = true } = {}) {
  if (!storageAvailable) return false;
  try {
    localStorage.setItem(
      STORAGE_KEYS.draft,
      JSON.stringify({
        schemaVersion: PROJECT_SCHEMA_VERSION,
        savedAt: new Date().toISOString(),
        data: collectProjectData(),
      }),
    );
    if (announce) setStorageStatus("Entwurf automatisch gespeichert", "saved");
    return true;
  } catch {
    setStorageStatus("Automatisches Speichern nicht verfügbar", "error");
    return false;
  }
}

function queueDraftSave() {
  if (!storageAvailable) return;
  window.clearTimeout(autosaveTimer);
  setStorageStatus("Änderungen werden gespeichert …", "working");
  autosaveTimer = window.setTimeout(() => saveDraft(), 350);
}

function loadDraft() {
  if (!storageAvailable) return false;
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.draft);
    if (stored === null) return false;
    const draft = JSON.parse(stored);
    if (!draft?.data || typeof draft.data !== "object") {
      throw new Error("Ungültiger Entwurf");
    }
    applyProjectData(draft.data);
    setStorageStatus("Letzten Entwurf wiederhergestellt", "saved");
    return true;
  } catch {
    setStorageStatus("Gespeicherter Entwurf konnte nicht geladen werden", "error");
    return false;
  }
}

function saveNamedProject() {
  window.clearTimeout(autosaveTimer);
  const data = collectProjectData();
  const name = data.projectName || "Unbenanntes Projekt";
  const projects = readSavedProjects();
  let projectIndex = activeProjectId
    ? projects.findIndex((project) => project.id === activeProjectId)
    : -1;

  if (projectIndex < 0) {
    projectIndex = projects.findIndex(
      (project) => project.name.toLocaleLowerCase("de-DE") === name.toLocaleLowerCase("de-DE"),
    );
  }

  const savedProject = {
    id: projectIndex >= 0 ? projects[projectIndex].id : createProjectId(),
    name,
    savedAt: new Date().toISOString(),
    data,
  };

  if (projectIndex >= 0) projects.splice(projectIndex, 1);
  projects.unshift(savedProject);
  if (!writeSavedProjects(projects)) return;

  activeProjectId = savedProject.id;
  renderSavedProjects(activeProjectId);
  saveDraft({ announce: false });
  setStorageStatus(
    projectIndex >= 0 ? `„${name}“ aktualisiert` : `„${name}“ lokal gespeichert`,
    "saved",
  );
}

function loadSelectedProject() {
  window.clearTimeout(autosaveTimer);
  const project = readSavedProjects().find(
    (item) => item.id === savedProjectSelect.value,
  );
  if (!project) {
    setStorageStatus("Gespeichertes Projekt wurde nicht gefunden", "error");
    return;
  }

  activeProjectId = project.id;
  applyProjectData(project.data);
  saveDraft({ announce: false });
  setStorageStatus(`„${project.name}“ geladen`, "saved");
  document.querySelector("#projectName").focus();
}

function deleteSelectedProject() {
  const selectedId = savedProjectSelect.value;
  const projects = readSavedProjects();
  const project = projects.find((item) => item.id === selectedId);
  if (!project) return;
  if (!window.confirm(`Soll „${project.name}“ wirklich aus diesem Gerät gelöscht werden?`)) {
    return;
  }

  const remainingProjects = projects.filter((item) => item.id !== selectedId);
  if (!writeSavedProjects(remainingProjects)) return;
  if (activeProjectId === selectedId) activeProjectId = null;
  renderSavedProjects();
  setStorageStatus(`„${project.name}“ lokal gelöscht`, "neutral");
}

function buildProjectPayload() {
  const data = collectProjectData();
  const name = data.projectName || "Unbenanntes Projekt";
  return {
    format: PROJECT_FILE_FORMAT,
    schemaVersion: PROJECT_SCHEMA_VERSION,
    appVersion: APP_VERSION,
    exportedAt: new Date().toISOString(),
    project: { name, data },
  };
}

function validateProjectPayload(payload) {
  if (
    (payload?.format !== PROJECT_FILE_FORMAT &&
      !LEGACY_PROJECT_FILE_FORMATS.has(payload?.format)) ||
    payload.schemaVersion !== PROJECT_SCHEMA_VERSION ||
    !payload.project?.data ||
    typeof payload.project.data !== "object"
  ) {
    throw new Error("Unbekanntes Projektformat");
  }
  return normalizeProjectData(payload.project.data);
}

function buildProjectFile() {
  const payload = buildProjectPayload();
  const name = payload.project.name;
  const safeName = name
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9äöüÄÖÜß -]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
  return {
    blob: new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }),
    filename: `${safeName || "Studio-Projekt"}.studiocalculator.json`,
    name,
  };
}

function encodeProjectPayload(payload) {
  const bytes = new TextEncoder().encode(JSON.stringify(payload));
  let binary = "";
  for (let start = 0; start < bytes.length; start += 8192) {
    binary += String.fromCharCode(...bytes.subarray(start, start + 8192));
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function decodeProjectPayload(encoded) {
  if (!encoded || encoded.length > MAX_SHARE_PAYLOAD_LENGTH) {
    throw new Error("Ungültiger Freigabelink");
  }
  const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
}

function buildShareLink() {
  const payload = buildProjectPayload();
  const url = new URL(window.location.href);
  url.search = "";
  url.hash = `${SHARE_HASH_KEY}=${encodeProjectPayload(payload)}`;
  return { name: payload.project.name, url: url.toString() };
}

function downloadProjectFile(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function shareProjectLink() {
  const sharedProject = buildShareLink();

  if (typeof navigator.share === "function") {
    try {
      await navigator.share({
        title: `${sharedProject.name} · Studiocalculator`,
        text: "Studiocalculator-Projekt direkt öffnen und weiterbearbeiten.",
        url: sharedProject.url,
      });
      setStorageStatus("Freigabelink zur Weitergabe geöffnet", "saved");
      return;
    } catch (error) {
      if (error?.name === "AbortError") {
        setStorageStatus("Weitergabe abgebrochen", "neutral");
        return;
      }
    }
  }

  try {
    await navigator.clipboard.writeText(sharedProject.url);
    setStorageStatus("Freigabelink kopiert – jetzt versenden", "saved");
  } catch {
    window.prompt("Freigabelink kopieren:", sharedProject.url);
    setStorageStatus("Freigabelink zum Kopieren geöffnet", "neutral");
  }
}

function downloadCurrentProjectFile() {
  const projectFile = buildProjectFile();
  downloadProjectFile(projectFile.blob, projectFile.filename);
  setStorageStatus("Projektdatei als Sicherung heruntergeladen", "saved");
}

async function openProjectFile(file) {
  if (!file) return;
  try {
    if (file.size > MAX_PROJECT_FILE_SIZE) {
      throw new Error("Die Projektdatei ist zu groß");
    }
    const payload = JSON.parse(await file.text());
    const projectData = validateProjectPayload(payload);

    activeProjectId = null;
    window.clearTimeout(autosaveTimer);
    applyProjectData(projectData);
    savedProjectSelect.value = "";
    updateProjectButtons();
    saveDraft({ announce: false });
    const projectName = collectProjectData().projectName || "Unbenanntes Projekt";
    setStorageStatus(`„${projectName}“ aus Projektdatei geöffnet`, "saved");
    document.querySelector("#projectName").focus();
  } catch {
    setStorageStatus("Diese Projektdatei konnte nicht geöffnet werden", "error");
  } finally {
    projectFileInput.value = "";
  }
}

function openSharedProjectFromUrl() {
  const parameters = new URLSearchParams(window.location.hash.slice(1));
  const encodedProject = parameters.get(SHARE_HASH_KEY);
  if (encodedProject === null) return "none";

  const cleanUrl = `${window.location.pathname}${window.location.search}`;
  window.history.replaceState(null, "", cleanUrl);

  try {
    const payload = decodeProjectPayload(encodedProject);
    const projectData = validateProjectPayload(payload);
    activeProjectId = null;
    applyProjectData(projectData);
    savedProjectSelect.value = "";
    updateProjectButtons();
    saveDraft({ announce: false });
    const projectName = projectData.projectName || "Unbenanntes Projekt";
    setStorageStatus(`„${projectName}“ über Freigabelink geöffnet`, "saved");
    return "loaded";
  } catch {
    return "invalid";
  }
}

function initializeProjectStorage() {
  storageAvailable = checkStorageAvailability();
  if (!storageAvailable) {
    setStorageStatus("Lokales Speichern ist in diesem Browser blockiert", "error");
    document.querySelector("#saveProjectButton").disabled = true;
  }
  renderSavedProjects();
  const sharedProjectState = openSharedProjectFromUrl();
  if (sharedProjectState === "loaded") return;
  if (!loadDraft()) {
    calculate();
    if (storageAvailable) saveDraft();
  }
  if (sharedProjectState === "invalid") {
    setStorageStatus("Dieser Freigabelink ist ungültig oder beschädigt", "error");
  }
}

function formatMonths(months) {
  if (!Number.isFinite(months)) return "Nicht erreichbar";
  if (months < 12) return `${decimal.format(months)} Monate`;
  return `${decimal.format(months / 12)} Jahre`;
}

function annuityPayment(principal, monthlyInterest, months) {
  if (principal <= 0) return 0;
  if (monthlyInterest <= 0) return principal / months;
  return principal * (monthlyInterest / (1 - (1 + monthlyInterest) ** -months));
}

function operatingScenario(memberCount, grossFee, vatRate, monthlyCosts, debtService) {
  const netRevenue = (memberCount * grossFee) / (1 + vatRate / 100);
  const operatingResult = netRevenue - monthlyCosts;
  return {
    memberCount,
    operatingResult,
    cashflow: operatingResult - debtService,
  };
}

function renderScenario(name, scenario) {
  const state = scenario.cashflow >= 0 ? "positive" : "negative";
  document.querySelector(`#scenario${name}Card`).dataset.state = state;
  setText(`scenario${name}Status`, state === "positive" ? "Positiv" : "Negativ");
  setText(
    `scenario${name}Members`,
    Math.round(scenario.memberCount).toLocaleString("de-DE"),
  );
  setText(`scenario${name}Result`, `${euro.format(scenario.operatingResult)} / Mon.`);
  setText(`scenario${name}Cashflow`, `${euro.format(scenario.cashflow)} / Mon.`);
}

function renderProjection({
  startMembers,
  targetMembers,
  rampMonths,
  projectionMonths,
  grossFee,
  vatRate,
  monthlyCosts,
  regularDebtService,
  graceDebtService,
  graceMonths,
}) {
  const months = [];
  let cumulativeCashflow = 0;
  let lowestCumulativeCashflow = 0;
  let firstPositiveMonth = null;

  for (let month = 1; month <= projectionMonths; month += 1) {
    const progress =
      rampMonths <= 1 ? 1 : Math.min((month - 1) / (rampMonths - 1), 1);
    const memberCount = startMembers + (targetMembers - startMembers) * progress;
    const debtService = month <= graceMonths ? graceDebtService : regularDebtService;
    const scenario = operatingScenario(
      memberCount,
      grossFee,
      vatRate,
      monthlyCosts,
      debtService,
    );
    cumulativeCashflow += scenario.cashflow;
    lowestCumulativeCashflow = Math.min(lowestCumulativeCashflow, cumulativeCashflow);
    if (firstPositiveMonth === null && scenario.cashflow >= 0) firstPositiveMonth = month;
    months.push({ month, cumulativeCashflow, ...scenario });
  }

  const finalMonth = months.at(-1);
  setText(
    "positiveCashflowMonth",
    firstPositiveMonth === null ? "Nicht erreicht" : `Monat ${firstPositiveMonth}`,
  );
  setText("rampLiquidityNeed", euro.format(Math.abs(lowestCumulativeCashflow)));
  setText("projectionCumulative", euro.format(cumulativeCashflow));
  setText(
    "projectionEndMembers",
    Math.round(finalMonth.memberCount).toLocaleString("de-DE"),
  );

  cashflowMap.replaceChildren(
    ...months.map((month) => {
      const item = document.createElement("div");
      item.className = "cashflow-month";
      item.dataset.state = month.cashflow >= 0 ? "positive" : "negative";
      item.setAttribute("role", "listitem");
      item.setAttribute(
        "aria-label",
        `Monat ${month.month}: ${Math.round(month.memberCount).toLocaleString("de-DE")} Mitglieder, ${euro.format(month.cashflow)} Cashflow.`,
      );
      item.title = `${euro.format(month.cashflow)} Cashflow`;
      item.textContent = `M${month.month}`;
      return item;
    }),
  );

  cashflowTableBody.replaceChildren(
    ...months.map((month) => {
      const row = document.createElement("tr");
      const monthCell = document.createElement("th");
      monthCell.scope = "row";
      monthCell.textContent = `Monat ${month.month}`;

      const values = [
        Math.round(month.memberCount).toLocaleString("de-DE"),
        euro.format(month.operatingResult),
        euro.format(month.cashflow),
        euro.format(month.cumulativeCashflow),
      ];
      const cells = values.map((content, index) => {
        const cell = document.createElement("td");
        cell.textContent = content;
        if ((index === 2 && month.cashflow < 0) || (index === 3 && month.cumulativeCashflow < 0)) {
          cell.dataset.state = "negative";
        }
        return cell;
      });
      row.append(monthCell, ...cells);
      return row;
    }),
  );

  return {
    months,
    cumulativeCashflow,
    liquidityNeed: Math.abs(lowestCumulativeCashflow),
    firstPositiveMonth,
    endMembers: finalMonth.memberCount,
  };
}

function syncRentFields(sourceId) {
  const area = value("area");
  const rentInput = document.querySelector("#rent");
  const rentPerAreaInput = document.querySelector("#rentPerArea");

  if (sourceId === "rent") {
    const rentPerArea = area > 0 ? value("rent") / area : 0;
    rentPerAreaInput.value = rentPerArea.toFixed(2);
  } else if (sourceId === "rentPerArea" || sourceId === "area") {
    const monthlyRent = area * value("rentPerArea");
    rentInput.value = monthlyRent.toFixed(2);
  }
}

function calculate() {
  const area = value("area");
  const rent = value("rent");
  const utilities = value("utilities");
  const members = value("members");
  const grossFee = value("grossFee");
  const vatRate = value("vatRate");
  const reserveMonths = value("reserveMonths");

  const personnel =
    value("personnelOne") + value("personnelTwo") + value("otherPersonnel");
  const monthlyCosts =
    rent +
    utilities +
    personnel +
    value("marketing") +
    value("otherCosts") +
    value("cleaning");
  const grossRevenue = members * grossFee;
  const netFee = grossFee / (1 + vatRate / 100);
  const netRevenue = grossRevenue / (1 + vatRate / 100);
  const monthlyResult = netRevenue - monthlyCosts;
  const annualResult = monthlyResult * 12;
  const margin = netRevenue > 0 ? (monthlyResult / netRevenue) * 100 : null;
  const breakEven = netFee > 0 ? Math.ceil(monthlyCosts / netFee) : null;
  const resultPerArea = area > 0 ? monthlyResult / area : null;

  const investment =
    value("equipment") +
    value("buildout") +
    value("otherInvestment") +
    value("foundingCosts");
  const liquidityReserve = monthlyCosts * reserveMonths;
  const capitalRequirement = investment + liquidityReserve;
  lastCapitalRequirement = capitalRequirement;
  const paybackMonths =
    monthlyResult > 0 ? capitalRequirement / monthlyResult : Number.POSITIVE_INFINITY;

  const equity = value("equity");
  const bankLoan = value("bankLoan");
  const grants = value("grants");
  const leaseFinancing = value("leaseFinancing");
  const totalFunding = equity + bankLoan + grants + leaseFinancing;
  const financingGap = capitalRequirement - totalFunding;
  const equityRatio = capitalRequirement > 0 ? (equity / capitalRequirement) * 100 : null;

  const monthlyInterest = value("loanInterest") / 100 / 12;
  const totalLoanMonths = Math.max(1, Math.round(value("loanTermYears") * 12));
  const graceMonths = Math.min(
    Math.round(value("graceMonths")),
    Math.max(0, totalLoanMonths - 1),
  );
  const repaymentMonths = totalLoanMonths - graceMonths;
  const monthlyLoanPayment = annuityPayment(bankLoan, monthlyInterest, repaymentMonths);
  const gracePayment = bankLoan * monthlyInterest;
  const totalInterest = Math.max(
    0,
    gracePayment * graceMonths + monthlyLoanPayment * repaymentMonths - bankLoan,
  );
  const monthlyLeasePayment = value("monthlyLeasePayment");
  const monthlyDebtService = monthlyLoanPayment + monthlyLeasePayment;
  const graceDebtService = gracePayment + monthlyLeasePayment;
  const cashflowAfterFinancing = monthlyResult - monthlyDebtService;
  const dscr = monthlyDebtService > 0 ? monthlyResult / monthlyDebtService : null;
  const equityReturn = equity > 0 ? (cashflowAfterFinancing * 12 * 100) / equity : null;
  const equityPaybackMonths =
    equity > 0 && cashflowAfterFinancing > 0
      ? equity / cashflowAfterFinancing
      : Number.POSITIVE_INFINITY;

  const scenarioVariance = Math.min(value("scenarioVariance"), 100) / 100;
  const conservativeScenario = operatingScenario(
    Math.max(0, Math.round(members * (1 - scenarioVariance) + 1e-9)),
    grossFee,
    vatRate,
    monthlyCosts,
    monthlyDebtService,
  );
  const baseScenario = operatingScenario(
    members,
    grossFee,
    vatRate,
    monthlyCosts,
    monthlyDebtService,
  );
  const optimisticScenario = operatingScenario(
    Math.round(members * (1 + scenarioVariance) + 1e-9),
    grossFee,
    vatRate,
    monthlyCosts,
    monthlyDebtService,
  );

  renderScenario("Conservative", conservativeScenario);
  renderScenario("Base", baseScenario);
  renderScenario("Optimistic", optimisticScenario);
  const varianceLabel = decimal.format(scenarioVariance * 100);
  setText("scenarioConservativeAssumption", `−${varianceLabel} % Mitglieder`);
  setText("scenarioOptimisticAssumption", `+${varianceLabel} % Mitglieder`);

  const startMembers = value("startMembers");
  const rampMonths = Math.max(1, Math.min(60, Math.round(value("rampMonths"))));
  const projectionMonths = Math.max(
    1,
    Math.min(60, Math.round(value("projectionMonths"))),
  );
  const projection = renderProjection({
    startMembers,
    targetMembers: members,
    rampMonths,
    projectionMonths,
    grossFee,
    vatRate,
    monthlyCosts,
    regularDebtService: monthlyDebtService,
    graceDebtService,
    graceMonths,
  });

  const projectName = document.querySelector("#projectName").value.trim();
  setText("resultProject", projectName || "Unbenanntes Projekt");
  setText("monthlyResult", euro.format(monthlyResult));
  setText("annualResult", `${euro.format(annualResult)} pro Jahr`);
  setText("netRevenue", euro.format(netRevenue));
  setText("monthlyCosts", euro.format(monthlyCosts));
  setText("breakEven", breakEven === null ? "–" : breakEven.toLocaleString("de-DE"));
  setText("margin", margin === null ? "–" : `${decimal.format(margin)} %`);
  setText(
    "resultPerArea",
    resultPerArea === null ? "–" : `${euroDetailed.format(resultPerArea)} / m²`,
  );
  setText("capitalRequirement", euro.format(capitalRequirement));
  setText("payback", formatMonths(paybackMonths));
  setText("cashflowAfterFinancing", euro.format(cashflowAfterFinancing));
  setText("equityRatio", equityRatio === null ? "–" : `${decimal.format(equityRatio)} %`);
  setText("monthlyLoanPayment", `${euro.format(monthlyLoanPayment)} / Mon.`);
  setText("monthlyDebtService", `${euro.format(monthlyDebtService)} / Mon.`);
  setText("dscr", dscr === null ? "Nicht anwendbar" : `${decimal.format(dscr)} ×`);
  setText(
    "equityReturn",
    equityReturn === null ? "Nicht anwendbar" : `${decimal.format(equityReturn)} % p. a.`,
  );
  setText("gracePayment", `${euro.format(gracePayment)} / Mon.`);
  setText("totalInterest", euro.format(totalInterest));
  setText("equityPayback", formatMonths(equityPaybackMonths));

  let fundingState = "covered";
  let fundingLabel = "Gedeckt";
  let fundingSummary = "Kapitalbedarf vollständig gedeckt";
  let financingBalanceText = "Vollständig gedeckt";
  if (financingGap > 0.5) {
    fundingState = "gap";
    fundingLabel = "Lücke";
    fundingSummary = `${euro.format(financingGap)} Finanzierungslücke`;
    financingBalanceText = `${euro.format(financingGap)} Lücke`;
  } else if (financingGap < -0.5) {
    fundingState = "surplus";
    fundingLabel = "Überdeckung";
    fundingSummary = `${euro.format(Math.abs(financingGap))} Überdeckung`;
    financingBalanceText = `${euro.format(Math.abs(financingGap))} Überdeckung`;
  }
  fundingStatus.dataset.state = fundingState;
  fundingStatus.textContent = fundingLabel;
  setText("fundingInputSummary", fundingSummary);
  setText("financingGap", financingBalanceText);
  cashflowResult.dataset.state = cashflowAfterFinancing >= 0 ? "positive" : "negative";

  let state = "positive";
  let assessment = "Tragfähig";
  if (monthlyResult < 0) {
    state = "negative";
    assessment = "Nicht tragfähig";
  } else if (margin === null || margin < 5) {
    state = "balanced";
    assessment = "Knapp kalkuliert";
  }
  resultCard.dataset.state = state;
  setText("assessment", assessment);

  lastReportData = {
    projectName: projectName || "Unbenanntes Projekt",
    assessment,
    area,
    rentPerArea: value("rentPerArea"),
    rent,
    utilities,
    members,
    grossFee,
    vatRate,
    personnel,
    marketing: value("marketing"),
    cleaning: value("cleaning"),
    otherCosts: value("otherCosts"),
    monthlyCosts,
    netRevenue,
    monthlyResult,
    annualResult,
    margin,
    breakEven,
    resultPerArea,
    investment,
    liquidityReserve,
    capitalRequirement,
    equity,
    bankLoan,
    grants,
    leaseFinancing,
    financingGap,
    loanInterest: value("loanInterest"),
    loanTermYears: value("loanTermYears"),
    monthlyDebtService,
    cashflowAfterFinancing,
    conservativeScenario,
    baseScenario,
    optimisticScenario,
    scenarioVariance,
    startMembers,
    rampMonths,
    projectionMonths,
    projection,
  };

  const comparisonMax = Math.max(netRevenue, monthlyCosts, 1);
  document.querySelector("#revenueBar").style.width =
    `${(netRevenue / comparisonMax) * 100}%`;
  document.querySelector("#costBar").style.width =
    `${(monthlyCosts / comparisonMax) * 100}%`;

  const memberGap = breakEven === null ? null : members - breakEven;
  const insightItems = [];

  if (monthlyResult >= 0) {
    insightItems.push(
      `Der laufende Betrieb erzeugt rechnerisch ${euro.format(monthlyResult)} Überschuss pro Monat.`,
    );
  } else {
    insightItems.push(
      `Der laufende Betrieb weist rechnerisch ${euro.format(Math.abs(monthlyResult))} Unterdeckung pro Monat auf.`,
    );
  }

  if (memberGap !== null && memberGap >= 0) {
    insightItems.push(
      `Die Planung liegt ${memberGap.toLocaleString("de-DE")} Mitglieder über dem Break-even.`,
    );
  } else if (memberGap !== null) {
    insightItems.push(
      `Für den Break-even fehlen ${Math.abs(memberGap).toLocaleString("de-DE")} Mitglieder bei unverändertem Beitrag.`,
    );
  } else {
    insightItems.push("Ohne Monatsbeitrag kann kein Mitglieder-Break-even berechnet werden.");
  }

  insightItems.push(
    `Im Kapitalbedarf sind ${euro.format(investment)} Investitionen und ${euro.format(liquidityReserve)} Reserve enthalten.`,
  );

  if (financingGap > 0.5) {
    insightItems.push(
      `Die Kapitalstruktur lässt noch eine Finanzierungslücke von ${euro.format(financingGap)} offen.`,
    );
  } else if (financingGap < -0.5) {
    insightItems.push(
      `Die eingetragene Finanzierung liegt ${euro.format(Math.abs(financingGap))} über dem Kapitalbedarf.`,
    );
  } else {
    insightItems.push("Die eingetragene Finanzierung deckt den Kapitalbedarf vollständig.");
  }

  if (monthlyDebtService > 0) {
    const cashflowDirection =
      cashflowAfterFinancing >= 0 ? "ein Überschuss" : "eine Unterdeckung";
    insightItems.push(
      `Nach ${euro.format(monthlyDebtService)} monatlichem Schuldendienst verbleibt ${cashflowDirection} von ${euro.format(Math.abs(cashflowAfterFinancing))}.`,
    );
  } else {
    insightItems.push("Ohne Darlehens- oder Leasingrate entspricht der Cashflow dem Betriebsergebnis.");
  }

  insights.replaceChildren(
    ...insightItems.map((text) => {
      const item = document.createElement("li");
      item.textContent = text;
      return item;
    }),
  );
}

function reportRow(values, negativeIndexes = []) {
  const row = document.createElement("tr");
  values.forEach((content, index) => {
    const cell = document.createElement(index === 0 ? "th" : "td");
    if (index === 0) cell.scope = "row";
    if (negativeIndexes.includes(index)) cell.dataset.state = "negative";
    cell.textContent = content;
    row.append(cell);
  });
  return row;
}

function preparePrintReport() {
  if (lastReportData === null) return;
  const data = lastReportData;
  const fundingBalance =
    data.financingGap > 0.5
      ? `${euro.format(data.financingGap)} Lücke`
      : data.financingGap < -0.5
        ? `${euro.format(Math.abs(data.financingGap))} Überdeckung`
        : "Vollständig gedeckt";

  setText("printProjectName", data.projectName);
  setText(
    "printGeneratedAt",
    new Intl.DateTimeFormat("de-DE", { dateStyle: "long" }).format(new Date()),
  );
  setText("printAssessment", data.assessment);
  setText("printMonthlyResult", euro.format(data.monthlyResult));
  setText("printCashflow", euro.format(data.cashflowAfterFinancing));
  setText("printCapitalRequirement", euro.format(data.capitalRequirement));

  setText("printArea", `${decimal.format(data.area)} m²`);
  setText("printRentPerArea", `${euroDetailed.format(data.rentPerArea)} / m²`);
  setText("printRent", `${euro.format(data.rent)} / Monat`);
  setText("printMembers", data.members.toLocaleString("de-DE"));
  setText("printGrossFee", euroDetailed.format(data.grossFee));
  setText("printNetRevenue", euro.format(data.netRevenue));
  setText("printMonthlyCosts", euro.format(data.monthlyCosts));
  setText(
    "printBreakEven",
    data.breakEven === null
      ? "Nicht berechenbar"
      : `${data.breakEven.toLocaleString("de-DE")} Mitglieder`,
  );

  setText("printPersonnel", euro.format(data.personnel));
  setText("printUtilities", euro.format(data.utilities));
  setText("printMarketing", euro.format(data.marketing));
  setText("printCleaning", euro.format(data.cleaning));
  setText("printOtherCosts", euro.format(data.otherCosts));
  setText("printMargin", data.margin === null ? "–" : `${decimal.format(data.margin)} %`);
  setText(
    "printResultPerArea",
    data.resultPerArea === null ? "–" : `${euroDetailed.format(data.resultPerArea)} / m²`,
  );
  setText("printAnnualResult", euro.format(data.annualResult));

  setText("printInvestment", euro.format(data.investment));
  setText("printReserve", euro.format(data.liquidityReserve));
  setText("printEquity", euro.format(data.equity));
  setText("printLoan", euro.format(data.bankLoan));
  setText("printGrants", euro.format(data.grants));
  setText("printLeaseFinancing", euro.format(data.leaseFinancing));
  setText("printFundingBalance", fundingBalance);
  setText("printInterest", `${decimal.format(data.loanInterest)} % p. a.`);
  setText("printTerm", `${decimal.format(data.loanTermYears)} Jahre`);
  setText("printDebtService", `${euro.format(data.monthlyDebtService)} / Monat`);

  const variance = decimal.format(data.scenarioVariance * 100);
  const scenarioRows = [
    [`Vorsichtig (−${variance} %)`, data.conservativeScenario],
    ["Basis", data.baseScenario],
    [`Optimistisch (+${variance} %)`, data.optimisticScenario],
  ].map(([label, scenario]) =>
    reportRow(
      [
        label,
        Math.round(scenario.memberCount).toLocaleString("de-DE"),
        euro.format(scenario.operatingResult),
        euro.format(scenario.cashflow),
      ],
      scenario.cashflow < 0 ? [3] : [],
    ),
  );
  document.querySelector("#printScenarioRows").replaceChildren(...scenarioRows);

  setText("printStartMembers", Math.round(data.startMembers).toLocaleString("de-DE"));
  setText("printTargetMembers", Math.round(data.members).toLocaleString("de-DE"));
  setText("printRampMonths", `${data.rampMonths.toLocaleString("de-DE")} Monate`);
  setText(
    "printProjectionMonths",
    `${data.projectionMonths.toLocaleString("de-DE")} Monate`,
  );
  setText(
    "printPositiveMonth",
    data.projection.firstPositiveMonth === null
      ? "Nicht erreicht"
      : `Monat ${data.projection.firstPositiveMonth}`,
  );
  setText("printRampNeed", euro.format(data.projection.liquidityNeed));
  setText("printProjectionCumulative", euro.format(data.projection.cumulativeCashflow));

  document.querySelector("#printCashflowRows").replaceChildren(
    ...data.projection.months.map((month) =>
      reportRow(
        [
          `Monat ${month.month}`,
          Math.round(month.memberCount).toLocaleString("de-DE"),
          euro.format(month.operatingResult),
          euro.format(month.cashflow),
          euro.format(month.cumulativeCashflow),
        ],
        [
          ...(month.cashflow < 0 ? [3] : []),
          ...(month.cumulativeCashflow < 0 ? [4] : []),
        ],
      ),
    ),
  );

  document.querySelector("#printReport").setAttribute("aria-hidden", "false");
}

form.addEventListener("input", (event) => {
  syncRentFields(event.target.id);
  calculate();
  queueDraftSave();
});

document.querySelector("#resetButton").addEventListener("click", () => {
  window.clearTimeout(autosaveTimer);
  Object.entries(defaults).forEach(([id, defaultValue]) => {
    document.querySelector(`#${id}`).value = defaultValue;
  });
  activeProjectId = null;
  savedProjectSelect.value = "";
  updateProjectButtons();
  calculate();
  saveDraft();
  document.querySelector("#projectName").focus();
});

document.querySelector("#saveProjectButton").addEventListener("click", saveNamedProject);

savedProjectSelect.addEventListener("change", updateProjectButtons);

loadProjectButton.addEventListener("click", loadSelectedProject);

deleteProjectButton.addEventListener("click", deleteSelectedProject);

document.querySelector("#shareLinkButton").addEventListener("click", () => {
  shareProjectLink();
});

document.querySelector("#downloadProjectButton").addEventListener("click", () => {
  downloadCurrentProjectFile();
});

document.querySelector("#openProjectFileButton").addEventListener("click", () => {
  projectFileInput.click();
});

projectFileInput.addEventListener("change", () => {
  openProjectFile(projectFileInput.files?.[0]);
});

document.querySelector("#balanceFinancing").addEventListener("click", () => {
  const uncoveredAmount = Math.max(
    0,
    lastCapitalRequirement - value("equity") - value("grants") - value("leaseFinancing"),
  );
  document.querySelector("#bankLoan").value = Math.round(uncoveredAmount);
  calculate();
  queueDraftSave();
  document.querySelector("#bankLoan").focus();
});

document.querySelector("#pdfButton").addEventListener("click", () => {
  preparePrintReport();
  const originalTitle = document.title;
  const safeProjectName = lastReportData.projectName.replace(/[\\/:*?"<>|]/g, "-");
  document.title = `${safeProjectName} – Studiocalculator`;
  window.addEventListener(
    "afterprint",
    () => {
      document.title = originalTitle;
      document.querySelector("#printReport").setAttribute("aria-hidden", "true");
    },
    { once: true },
  );
  window.print();
});

window.addEventListener("beforeprint", preparePrintReport);

window.addEventListener("beforeunload", () => {
  window.clearTimeout(autosaveTimer);
  saveDraft({ announce: false });
});

window.addEventListener("storage", (event) => {
  if (event.key === STORAGE_KEYS.projects) renderSavedProjects(activeProjectId);
});

window.addEventListener("hashchange", () => {
  const sharedProjectState = openSharedProjectFromUrl();
  if (sharedProjectState === "invalid") {
    setStorageStatus("Dieser Freigabelink ist ungültig oder beschädigt", "error");
  }
});

let deferredInstallPrompt = null;
let appReloading = false;
let serviceWorkerControlled = Boolean(navigator.serviceWorker?.controller);

function isAppMode() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

function isIOSDevice() {
  return (
    /iphone|ipad|ipod/i.test(window.navigator.userAgent) ||
    (window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1)
  );
}

function showInstallOption() {
  if (isAppMode()) {
    installAppButton.hidden = true;
    installStatus.textContent = "Als App geöffnet";
    return;
  }

  if (deferredInstallPrompt) {
    installAppButton.hidden = false;
    installAppButton.textContent = "App installieren";
    installStatus.textContent = "";
    return;
  }

  if (isIOSDevice()) {
    installAppButton.hidden = false;
    installAppButton.textContent = "Zum Home-Bildschirm";
    installStatus.textContent = "";
  }
}

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  showInstallOption();
});

window.addEventListener("appinstalled", () => {
  deferredInstallPrompt = null;
  installAppButton.hidden = true;
  installStatus.textContent = "App wurde installiert";
});

installAppButton.addEventListener("click", async () => {
  if (deferredInstallPrompt) {
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    showInstallOption();
    return;
  }

  if (isIOSDevice()) {
    window.alert(
      "Auf dem iPhone oder iPad: Unten auf „Teilen“ tippen und anschließend „Zum Home-Bildschirm“ wählen.",
    );
  }
});

function showUpdateNotice(worker) {
  updateNotice.hidden = false;
  updateAppButton.onclick = () => worker.postMessage({ type: "SKIP_WAITING" });
}

async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;

  try {
    const registration = await navigator.serviceWorker.register("service-worker.js", {
      scope: "./",
    });

    if (registration.waiting && navigator.serviceWorker.controller) {
      showUpdateNotice(registration.waiting);
    }

    registration.addEventListener("updatefound", () => {
      const installingWorker = registration.installing;
      if (!installingWorker) return;
      installingWorker.addEventListener("statechange", () => {
        if (
          installingWorker.state === "installed" &&
          navigator.serviceWorker.controller
        ) {
          showUpdateNotice(installingWorker);
        }
      });
    });

    window.setTimeout(() => registration.update(), 2500);
  } catch {
    installStatus.textContent = "Offline-Nutzung ist in diesem Browser nicht verfügbar";
  }
}

navigator.serviceWorker?.addEventListener("controllerchange", () => {
  if (!serviceWorkerControlled) {
    serviceWorkerControlled = true;
    return;
  }
  if (appReloading) return;
  appReloading = true;
  window.location.reload();
});

showInstallOption();
registerServiceWorker();
initializeProjectStorage();
