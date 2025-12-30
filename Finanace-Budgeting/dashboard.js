/*************************************************
 * GLOBAL DATA MODELS
 *************************************************/

// Expense totals by category
const categoryTotals = {
  "Basic-living-expenses": 0,
  "Transportation": 0,
  "Food": 0,
  "Education": 0,
  "Lifestyle-Entertainment": 0,
  "Health": 0,
  "Savings": 0
};

// Income totals
const incomeTotals = {
  business: 0,
  salary: 0,
  investments: 0,
  rental: 0,
  other: 0
};

// Budget
let monthlyBudget = 0;


/*************************************************
 * MONTH LABEL
 *************************************************/
const monthLabel = document.getElementById("monthLabel");
if (monthLabel) {
  const now = new Date();
  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];
  monthLabel.textContent = `${months[now.getMonth()]} ${now.getFullYear()}`;
}


/*************************************************
 * EXPENSE CHART
 *************************************************/
const expenseCtx = document.getElementById("expenseChart")?.getContext("2d");

const expenseChart = expenseCtx
  ? new Chart(expenseCtx, {
      type: "pie",
      data: {
        labels: [
          "Basic Living",
          "Transportation",
          "Food",
          "Education",
          "Lifestyle",
          "Health",
          "Savings"
        ],
        datasets: [{
          data: Object.values(categoryTotals),
          backgroundColor: [
            "#f06292",
            "#ba68c8",
            "#64b5f6",
            "#4db6ac",
            "#ffd54f",
            "#81c784",
            "#9575cd"
          ]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: "bottom" }
        }
      }
    })
  : null;


/*************************************************
 * CATEGORY FILTER
 *************************************************/
const select = document.querySelector(".choose");
const expenseTickets = document.querySelectorAll(".expense-ticket");
const resetFilterBtn = document.getElementById("resetFilter");

if (select) {
  select.addEventListener("change", () => {
    const selected = select.value;

    if (selected === "") {
      expenseTickets.forEach(t => t.classList.remove("hidden", "centered"));
      return;
    }

    expenseTickets.forEach(ticket => {
      if (ticket.dataset.category === selected) {
        ticket.classList.remove("hidden");
        ticket.classList.add("centered");
        setTimeout(() => {
          ticket.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 150);
      } else {
        ticket.classList.add("hidden");
        ticket.classList.remove("centered");
      }
    });
  });
}

if (resetFilterBtn) {
  resetFilterBtn.addEventListener("click", () => {
    select.value = "";
    expenseTickets.forEach(t => t.classList.remove("hidden", "centered"));
  });
}


/*************************************************
 * EXPENSE TOTAL CALCULATION
 *************************************************/
expenseTickets.forEach(ticket => {
  const inputs = ticket.querySelectorAll('input[type="number"]');
  const totalSpan = ticket.querySelector(".total-value");

  function calculateExpense() {
    let total = 0;
    inputs.forEach(input => total += Number(input.value) || 0);

    totalSpan.textContent = total;
    categoryTotals[ticket.dataset.category] = total;

    if (expenseChart) {
      expenseChart.data.datasets[0].data = Object.values(categoryTotals);
      expenseChart.update();
    }

    updateBalance();
  }

  inputs.forEach(input => input.addEventListener("input", calculateExpense));
});


/*************************************************
 * MODE SWITCH (EXPENSE / INCOME / BALANCE)
 *************************************************/
const modeCards = document.querySelectorAll(".mode-card");
const expensesSection = document.getElementById("expensesSection");
const incomeSection = document.getElementById("incomeSection");
const balanceSection = document.getElementById("balanceSection");

modeCards.forEach(card => {
  card.addEventListener("click", () => {
    const mode = card.dataset.mode;
    localStorage.setItem("activeMode", mode);

    modeCards.forEach(c => c.classList.remove("active"));
    card.classList.add("active");

    expensesSection.style.display = "none";
    incomeSection.style.display = "none";
    balanceSection.style.display = "none";

    if (mode === "expenses") expensesSection.style.display = "block";
    if (mode === "income") incomeSection.style.display = "block";
    if (mode === "balance") balanceSection.style.display = "block";
  });
});

// Restore last mode
const savedMode = localStorage.getItem("activeMode") || "expenses";
modeCards.forEach(c => c.classList.remove("active"));
document.querySelector(`.mode-card[data-mode="${savedMode}"]`)?.classList.add("active");
expensesSection.style.display = savedMode === "expenses" ? "block" : "none";
incomeSection.style.display = savedMode === "income" ? "block" : "none";
balanceSection.style.display = savedMode === "balance" ? "block" : "none";


/*************************************************
 * INCOME CHART
 *************************************************/
const incomeCtx = document.getElementById("incomeChart")?.getContext("2d");

const incomeChart = incomeCtx
  ? new Chart(incomeCtx, {
      type: "doughnut",
      data: {
        labels: [
          "Business",
          "Salary",
          "Investments",
          "Rental",
          "Other"
        ],
        datasets: [{
          data: Object.values(incomeTotals),
          backgroundColor: [
            "#81c784",
            "#4caf50",
            "#64b5f6",
            "#ffd54f",
            "#ff8a65"
          ]
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { position: "bottom" } }
      }
    })
  : null;


/*************************************************
 * INCOME CALCULATION
 *************************************************/
const incomeInputs = document.querySelectorAll("#incomeSection input[type='number']");
const incomeTotalSpan = document.querySelector("#incomeSection .total-value");

function calculateIncome() {
  const keys = Object.keys(incomeTotals);
  keys.forEach((key, i) => incomeTotals[key] = Number(incomeInputs[i].value) || 0);

  const total = Object.values(incomeTotals).reduce((a, b) => a + b, 0);
  incomeTotalSpan.textContent = total;

  if (incomeChart) {
    incomeChart.data.datasets[0].data = Object.values(incomeTotals);
    incomeChart.update();
  }

  updateBalance();
}

incomeInputs.forEach(input => input.addEventListener("input", calculateIncome));


/*************************************************
 * BALANCE + BUDGET
 *************************************************/
const balanceIncomeEl = document.getElementById("balanceIncome");
const balanceExpensesEl = document.getElementById("balanceExpenses");
const netBalanceEl = document.getElementById("netBalance");
const balanceStatusEl = document.getElementById("balanceStatus");
const spendingInsight = document.getElementById("spendingInsight");
const monthlyBudgetEl = document.getElementById("monthlyBudget");
const budgetWarning = document.getElementById("budgetWarning");

// Restore budget
const savedBudget = localStorage.getItem("monthlyBudget");
if (savedBudget) {
  monthlyBudget = Number(savedBudget);
  monthlyBudgetEl.textContent = monthlyBudget;
}

// Set budget
document.getElementById("setBudgetBtn")?.addEventListener("click", () => {
  const value = prompt("Enter monthly budget:");
  if (value && !isNaN(value)) {
    monthlyBudget = Number(value);
    monthlyBudgetEl.textContent = monthlyBudget;
    localStorage.setItem("monthlyBudget", monthlyBudget);
    updateBalance();
  }
});

// Review expenses
document.getElementById("reviewExpensesBtn")?.addEventListener("click", () => {
  localStorage.setItem("activeMode", "expenses");
  location.reload();
});


/*************************************************
 * UPDATE BALANCE
 *************************************************/
function updateBalance() {
  const totalIncome = Object.values(incomeTotals).reduce((a, b) => a + b, 0);
  const totalExpenses = Object.values(categoryTotals).reduce((a, b) => a + b, 0);
  const netBalance = totalIncome - totalExpenses;

  balanceIncomeEl.textContent = totalIncome;
  balanceExpensesEl.textContent = totalExpenses;
  netBalanceEl.textContent = netBalance;

  balanceStatusEl.classList.remove("positive", "negative");

  if (netBalance >= 0) {
    balanceStatusEl.textContent = "Surplus 💰";
    balanceStatusEl.classList.add("positive");
  } else {
    balanceStatusEl.textContent = "Deficit ⚠️";
    balanceStatusEl.classList.add("negative");
  }

  if (monthlyBudget > 0 && totalExpenses > monthlyBudget) {
    budgetWarning.classList.remove("hidden");
  } else {
    budgetWarning.classList.add("hidden");
  }

  if (totalIncome > 0) {
    const percent = ((totalExpenses / totalIncome) * 100).toFixed(1);
    spendingInsight.textContent = `You spent ${percent}% of your income this month.`;
  } else {
    spendingInsight.textContent = "";
  }

  updateBalanceChart(totalIncome, totalExpenses);
}


/*************************************************
 * BALANCE CHART
 *************************************************/
const balanceCtx = document.getElementById("balanceChart")?.getContext("2d");

const balanceChart = balanceCtx
  ? new Chart(balanceCtx, {
      type: "bar",
      data: {
        labels: ["Income", "Expenses"],
        datasets: [{
          data: [0, 0],
          backgroundColor: ["#4caf50", "#f44336"]
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } }
      }
    })
  : null;

function updateBalanceChart(income, expenses) {
  if (!balanceChart) return;
  balanceChart.data.datasets[0].data = [income, expenses];
  balanceChart.update();
}
