const defaults = {
  projectName: "Studio Musterstadt",
  area: 750,
  rent: 7500,
  utilities: 2200,
  members: 950,
  grossFee: 39.9,
  vatRate: 19,
  personnelOne: 14000,
  personnelTwo: 4500,
  otherPersonnel: 0,
  marketing: 1500,
  otherCosts: 2500,
  equipment: 180000,
  buildout: 120000,
  otherInvestment: 25000,
  reserveMonths: 3,
};

const form = document.querySelector("#calculatorForm");
const resultCard = document.querySelector("#resultCard");
const insights = document.querySelector("#insights");

const euro = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
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

function formatMonths(months) {
  if (!Number.isFinite(months)) return "Nicht erreichbar";
  if (months < 12) return `${decimal.format(months)} Monate`;
  return `${decimal.format(months / 12)} Jahre`;
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
    rent + utilities + personnel + value("marketing") + value("otherCosts");
  const grossRevenue = members * grossFee;
  const netFee = grossFee / (1 + vatRate / 100);
  const netRevenue = grossRevenue / (1 + vatRate / 100);
  const monthlyResult = netRevenue - monthlyCosts;
  const annualResult = monthlyResult * 12;
  const margin = netRevenue > 0 ? (monthlyResult / netRevenue) * 100 : null;
  const breakEven = netFee > 0 ? Math.ceil(monthlyCosts / netFee) : null;
  const resultPerArea = area > 0 ? monthlyResult / area : null;

  const investment =
    value("equipment") + value("buildout") + value("otherInvestment");
  const liquidityReserve = monthlyCosts * reserveMonths;
  const capitalRequirement = investment + liquidityReserve;
  const paybackMonths =
    monthlyResult > 0 ? capitalRequirement / monthlyResult : Number.POSITIVE_INFINITY;

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
    resultPerArea === null ? "–" : `${euro.format(resultPerArea)} / m²`,
  );
  setText("capitalRequirement", euro.format(capitalRequirement));
  setText("payback", formatMonths(paybackMonths));

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

  insights.replaceChildren(
    ...insightItems.map((text) => {
      const item = document.createElement("li");
      item.textContent = text;
      return item;
    }),
  );
}

form.addEventListener("input", calculate);

document.querySelector("#resetButton").addEventListener("click", () => {
  Object.entries(defaults).forEach(([id, defaultValue]) => {
    document.querySelector(`#${id}`).value = defaultValue;
  });
  calculate();
  document.querySelector("#projectName").focus();
});

calculate();
