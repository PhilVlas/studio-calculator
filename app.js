const defaults = {
  projectName: "Studio Musterstadt",
  area: 500,
  rentPerArea: 6,
  rent: 3000,
  utilities: 900,
  members: 500,
  grossFee: 39.9,
  vatRate: 19,
  personnelOne: 6000,
  personnelTwo: 1250,
  otherPersonnel: 0,
  marketing: 800,
  otherCosts: 2500,
  cleaning: 1000,
  equipment: 100000,
  buildout: 120000,
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
};

const form = document.querySelector("#calculatorForm");
const resultCard = document.querySelector("#resultCard");
const insights = document.querySelector("#insights");
const fundingStatus = document.querySelector("#fundingStatus");
const cashflowResult = document.querySelector("#cashflowResult");
let lastCapitalRequirement = 0;

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

function calculate() {
  const area = value("area");
  const rent = area * value("rentPerArea");
  document.querySelector("#rent").value = rent.toFixed(2);
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
  const monthlyDebtService = monthlyLoanPayment + value("monthlyLeasePayment");
  const cashflowAfterFinancing = monthlyResult - monthlyDebtService;
  const dscr = monthlyDebtService > 0 ? monthlyResult / monthlyDebtService : null;
  const equityReturn = equity > 0 ? (cashflowAfterFinancing * 12 * 100) / equity : null;
  const equityPaybackMonths =
    equity > 0 && cashflowAfterFinancing > 0
      ? equity / cashflowAfterFinancing
      : Number.POSITIVE_INFINITY;

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
    const cashflowDirection = cashflowAfterFinancing >= 0 ? "Überschuss" : "Unterdeckung";
    insightItems.push(
      `Nach ${euro.format(monthlyDebtService)} monatlichem Schuldendienst verbleibt eine ${cashflowDirection} von ${euro.format(Math.abs(cashflowAfterFinancing))}.`,
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

form.addEventListener("input", calculate);

document.querySelector("#resetButton").addEventListener("click", () => {
  Object.entries(defaults).forEach(([id, defaultValue]) => {
    document.querySelector(`#${id}`).value = defaultValue;
  });
  calculate();
  document.querySelector("#projectName").focus();
});

document.querySelector("#balanceFinancing").addEventListener("click", () => {
  const uncoveredAmount = Math.max(
    0,
    lastCapitalRequirement - value("equity") - value("grants") - value("leaseFinancing"),
  );
  document.querySelector("#bankLoan").value = Math.round(uncoveredAmount);
  calculate();
  document.querySelector("#bankLoan").focus();
});

calculate();
