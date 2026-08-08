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

const form = document.querySelector("#calculatorForm");
const resultCard = document.querySelector("#resultCard");
const insights = document.querySelector("#insights");
const fundingStatus = document.querySelector("#fundingStatus");
const cashflowResult = document.querySelector("#cashflowResult");
const cashflowMap = document.querySelector("#cashflowMap");
const cashflowTableBody = document.querySelector("#cashflowTableBody");
let lastCapitalRequirement = 0;
let lastReportData = null;

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
});

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

document.querySelector("#pdfButton").addEventListener("click", () => {
  preparePrintReport();
  const originalTitle = document.title;
  const safeProjectName = lastReportData.projectName.replace(/[\\/:*?"<>|]/g, "-");
  document.title = `${safeProjectName} – Studio Calculator`;
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

calculate();
