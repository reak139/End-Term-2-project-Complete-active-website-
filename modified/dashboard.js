/*************************
 * GLOBAL TOTALS
 *************************/
let totalExpense = 0;
let totalIncome = 0;
let monthlyBudget = 0;

/*************************
 * SHARED UTIL
 *************************/
function calculateCategoryTotal(categoryEl) {
    const inputs = categoryEl.querySelectorAll('input[type="number"]');
    let total = 0;

    inputs.forEach(input => {
        total += Number(input.value) || 0;
    });

    const totalEl = categoryEl.querySelector('.total-value');
    if (totalEl) totalEl.textContent = total;

    return total;
}

/*************************
 * EXPENSE LOGIC
 *************************/
function getExpenseData() {
    const categories = document.querySelectorAll('.expense-ticket');
    const data = {};

    categories.forEach(cat => {
        const name = cat.dataset.category;
        data[name] = calculateCategoryTotal(cat);
    });

    return data;
}

/*************************
 * EXPENSE CHART
 *************************/
const ctx = document.getElementById("expenseChart").getContext("2d");

const expenseChart = new Chart(ctx, {
    type: "pie",
    data: {
        labels: [],
        datasets: [{
            data: [],
            backgroundColor: [
                "#ff6b6b",
                "#feca57",
                "#48dbfb",
                "#1dd1a1",
                "#5f27cd",
                "#c8d6e5",
                "#ff9ff3"
            ],
            hoverOffset: 15
        }]
    },
    options: {
        plugins: {
            legend: {
                position: "top",
                labels: { color: "#fff" }
            }
        }
    }
});

function updateChart(expenseData) {
    expenseChart.data.labels = Object.keys(expenseData);
    expenseChart.data.datasets[0].data = Object.values(expenseData);
    expenseChart.update();
}

/*************************
 * SPENDING BREAKDOWN
 *************************/
function updateBreakdown(expenseData) {
    const container = document.getElementById("breakdownBars");
    container.innerHTML = "";

    const entries = Object.entries(expenseData)
        .filter(([, v]) => v > 0)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);

    const total = entries.reduce((s, [, v]) => s + v, 0);

    entries.forEach(([cat, val]) => {
        const percent = total ? ((val / total) * 100).toFixed(1) : 0;

        container.innerHTML += `
            <div class="breakdown-item">
                <div class="breakdown-header">
                    <span>${cat}</span>
                    <span>₹${val} (${percent}%)</span>
                </div>
                <div class="breakdown-bar">
                    <div class="breakdown-bar-fill" style="width:${percent}%"></div>
                </div>
            </div>
        `;
    });
}

/*************************
 * UPDATE EXPENSES
 *************************/
function updateExpenses() {
    if (!expensesSection || expensesSection.offsetParent === null) return;

    const expenseData = getExpenseData();
    updateChart(expenseData);
    updateBreakdown(expenseData);

    totalExpense = Object.values(expenseData)
        .reduce((sum, v) => sum + v, 0);

    updateBalance();
}

/*************************
 * INCOME LOGIC
 *************************/
function updateIncome() {
    if (!incomeSection || incomeSection.offsetParent === null) return;

    const incomeBox = incomeSection.querySelector('.ticket-boss');
    totalIncome = calculateCategoryTotal(incomeBox);

    updateBalance();
}

/*************************
 * BALANCE LOGIC
 *************************/
function updateBalance() {
    if (!balanceSection) return;

    document.getElementById("balanceIncome").textContent = totalIncome;
    document.getElementById("balanceExpenses").textContent = totalExpense;
    document.getElementById("monthlyBudget").textContent = monthlyBudget;

    const net = totalIncome - totalExpense;
    document.getElementById("netBalance").textContent = net;

    const statusEl = document.getElementById("balanceStatus");
    const insightEl = document.getElementById("spendingInsight");

    if (net > 0) {
        statusEl.textContent = "✅ Healthy Savings";
        statusEl.style.color = "#1dd1a1";
        insightEl.textContent = "You are saving more than you spend. Great job!";
    } else if (net === 0) {
        statusEl.textContent = "⚠️ Break-even";
        statusEl.style.color = "#feca57";
        insightEl.textContent = "Your income and expenses are equal.";
    } else {
        statusEl.textContent = "❌ Overspending";
        statusEl.style.color = "#ff6b6b";
        insightEl.textContent = "Your expenses exceed your income.";
    }
    // Update balance chart
    balanceChart.data.datasets[0].data = [totalIncome, totalExpense];
    balanceChart.update();

    updateFinancialHealth();
    updateInsights();
    updateBudgetUI();


}

/*************************
 * INPUT LISTENERS
 *************************/
document.querySelectorAll('.expense-ticket input[type="number"]')
    .forEach(i => {
        i.addEventListener("input", updateExpenses)
        i.addEventListener("input", saveAppState);
    });
    

document.querySelectorAll('#incomeSection input[type="number"]')
    .forEach(i => {
        i.addEventListener("input", updateIncome)
        i.addEventListener("input", saveAppState);
    });

/*************************
 * MODE SWITCH
 *************************/
const modeCards = document.querySelectorAll(".mode-card");
const expensesSection = document.querySelector(".expensesSection");
const incomeSection = document.getElementById("incomeSection");
const balanceSection = document.getElementById("balanceSection");

modeCards.forEach(card => {
    card.addEventListener("click", () => {
        modeCards.forEach(c => c.classList.remove("active"));
        card.classList.add("active");

        const mode = card.dataset.mode;

        expensesSection.style.display = mode === "expenses" ? "block" : "none";
        incomeSection.style.display = mode === "income" ? "block" : "none";
        balanceSection.style.display = mode === "balance" ? "block" : "none";

        if (mode === "balance") updateBalance();
        saveAppState(); 
    });
});

/*************************
 * SIDEBAR TOGGLE
 *************************/
const toggleBtn = document.querySelector(".toggle-btn");
const sidebar = document.querySelector(".expense-sidebar");

toggleBtn.addEventListener("click", () => {
    sidebar.classList.toggle("open");
});

/*************************
 * SIDEBAR CATEGORY FILTER
 *************************/
const visuals = document.querySelector(".visuals");
const chartContainer = document.querySelector(".chart-container");
const breakdownContainer = document.querySelector(".spending-breakdown");
const sideButtons = document.querySelectorAll(".side-btn");
const expenseTickets = document.querySelectorAll(".expense-ticket");

// store original parent
expenseTickets.forEach(ticket => {
    ticket.dataset.originalParentId = ticket.parentElement.id;
});


sideButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        if (expensesSection.offsetParent === null) return;

        const view = btn.dataset.view;
        const category = btn.dataset.category;

        if (view === "overview") {
            chartContainer.style.display = "block";
            breakdownContainer.style.display = "block";

            expenseTickets.forEach(ticket => {
                const originalParent = document.getElementById(
                    ticket.dataset.originalParentId
                );

                if (originalParent && ticket.parentElement !== originalParent) {
                    originalParent.appendChild(ticket); // restore ONLY if moved
                }

                ticket.style.display = "none"; // always hide tickets in overview
            });

            sidebar.classList.remove("open");
            return;
        }


        // ===== CATEGORY VIEW =====
        chartContainer.style.display = "none";
        breakdownContainer.style.display = "none";

        expenseTickets.forEach(ticket => {
            if (ticket.dataset.category === category) {
                visuals.appendChild(ticket);      // 🔥 MOVE ticket
                ticket.style.display = "flex";
            } else {
                ticket.style.display = "none";
            }
        });

        sidebar.classList.remove("open");
        btn.classList.add("active");
saveAppState();

    });
});

const tags = document.querySelectorAll(".balance-header-tags .tag");
const tabCurrent = document.getElementById("tab-current");
const tabHealth = document.getElementById("tab-health");
const tabInsights = document.getElementById("tab-insights");

tags.forEach(tag => {
    tag.addEventListener("click", () => {
        tags.forEach(t => t.classList.remove("active"));
        tag.classList.add("active");

        tabCurrent.classList.add("hidden");
        tabHealth.classList.add("hidden");
        tabInsights.classList.add("hidden");

        if (tag.textContent.includes("Current")) tabCurrent.classList.remove("hidden");
        if (tag.textContent.includes("Health")) tabHealth.classList.remove("hidden");
        if (tag.textContent.includes("Insights")) tabInsights.classList.remove("hidden");
    });
});
function updateFinancialHealth() {
    const healthStatus = document.getElementById("healthStatus");
    const healthMessage = document.getElementById("healthMessage");

    if (!healthStatus || !healthMessage) return;

    const savingRate = totalIncome
        ? ((totalIncome - totalExpense) / totalIncome) * 100
        : 0;

    if (savingRate >= 30) {
        healthStatus.textContent = "Excellent Financial Health 💪";
        healthMessage.textContent =
            "You are saving more than 30% of your income. Keep it up!";
    }
    else if (savingRate >= 10) {
        healthStatus.textContent = "Stable Financial Health 🙂";
        healthMessage.textContent =
            "You have a decent saving rate, but there is room for improvement.";
    }
    else if (savingRate < 10 && savingRate > 0) {
        healthStatus.textContent = "Poor Financial Health ⚠️";
        healthMessage.textContent =
            "Your expenses are too close to (or exceeding) your income.";
    } else {
        if (savingRate == 0) {
            healthStatus.textContent = "Please first enter the values required if so or you are left with no money."
        } else if (savingRate < 0) {
            healthStatus.textContent = "You are in debt"
            healthMessage.textContent = ""
        }
    }
}
function updateInsights() {
    const list = document.getElementById("insightsList");
    if (!list) return;

    list.innerHTML = "";

    if (totalExpense > totalIncome) {
        list.innerHTML += "<li>❌ You are spending more than you earn.</li>";
    }

    if (monthlyBudget > 0 && totalExpense > monthlyBudget) {
        list.innerHTML += "<li>⚠️ You have exceeded your monthly budget.</li>";
    }

    if (totalIncome > 0 && totalExpense / totalIncome > 0.7) {
        list.innerHTML += "<li>📉 Expenses are over 70% of your income.</li>";
    }

    if (list.innerHTML === "") {
        list.innerHTML = "<li>✅ No major financial risks detected.</li>";
    }
}
function updateBudgetUI() {
    const percentEl = document.getElementById("budgetPercent");
    const fill = document.getElementById("budgetProgressFill");
    const warning = document.getElementById("budgetWarning");

    if (!percentEl || !fill || monthlyBudget === 0) return;

    const percent = Math.min((totalExpense / monthlyBudget) * 100, 100);
    percentEl.textContent = `${percent.toFixed(0)}%`;
    fill.style.width = `${percent}%`;

    if (totalExpense > monthlyBudget) {
        warning.classList.remove("hidden");
    } else {
        warning.classList.add("hidden");
    }
}
const setBudgetBtn = document.getElementById("setBudgetBtn");

setBudgetBtn.addEventListener("click", () => {
    const value = prompt("Enter your monthly budget:");

    if (!value || isNaN(value) || Number(value) <= 0) return;

    monthlyBudget = Number(value);
    document.getElementById("monthlyBudget").textContent = monthlyBudget;

    updateBudgetUI();
    saveAppState();

});
/*************************
 * BALANCE CHART
 *************************/
const balanceCtx = document.getElementById("balanceChart").getContext("2d");

const balanceChart = new Chart(balanceCtx, {
    type: "bar",
    data: {
        labels: ["Income", "Expenses"],
        datasets: [{
            label: "Amount (₹)",
            data: [0, 0],
            backgroundColor: ["#1dd1a1", "#ff6b6b"],
            borderRadius: 10
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: { display: false }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: { color: "#fff" }
            },
            x: {
                ticks: { color: "#fff" }
            }
        }
    }
});

const APP_STATE_KEY = "expenseAppState_v1";

function saveAppState() {
    const state = {
        expenses: {},
        income: {},
        monthlyBudget,
        activeMode: document.querySelector(".mode-card.active")?.dataset.mode || "expenses",
        sidebarView: document.querySelector(".side-btn.active")?.dataset.view || "overview",
        sidebarCategory: document.querySelector(".side-btn.active")?.dataset.category || null
    };

    // save expense inputs
    document.querySelectorAll(".expense-ticket").forEach(ticket => {
        const cat = ticket.dataset.category;
        state.expenses[cat] = [];

        ticket.querySelectorAll('input[type="number"]').forEach(input => {
            state.expenses[cat].push(input.value);
        });
    });

    // save income inputs
    document.querySelectorAll("#incomeSection input[type='number']").forEach(
        (input, idx) => state.income[idx] = input.value
    );

    localStorage.setItem(APP_STATE_KEY, JSON.stringify(state));
}
function restoreAppState() {
    const raw = localStorage.getItem(APP_STATE_KEY);
    if (!raw) return;

    const state = JSON.parse(raw);

    // restore expense inputs
    document.querySelectorAll(".expense-ticket").forEach(ticket => {
        const cat = ticket.dataset.category;
        if (!state.expenses[cat]) return;

        const inputs = ticket.querySelectorAll('input[type="number"]');
        inputs.forEach((input, i) => {
            input.value = state.expenses[cat][i] || "";
        });
    });

    // restore income inputs
    document.querySelectorAll("#incomeSection input[type='number']").forEach(
        (input, idx) => {
            input.value = state.income?.[idx] || "";
        }
    );

    // restore budget
    if (state.monthlyBudget) {
        monthlyBudget = state.monthlyBudget;
        document.getElementById("monthlyBudget").textContent = monthlyBudget;
    }

    // 🔥 recompute everything using YOUR existing logic
    updateExpenses();
    updateIncome();
    forceUpdateIncome(); 
    updateBudgetUI();
    updateBalance();
    if (state.activeMode) {
        const modeCard = document.querySelector(
            `.mode-card[data-mode="${state.activeMode}"]`
        );
        modeCard?.click(); // 🔥 triggers your existing mode logic
    }

    // restore sidebar view
    if (state.sidebarView === "overview") {
        document.querySelector('[data-view="overview"]')?.click();
    } 
    else if (state.sidebarCategory) {
        document.querySelector(
            `.side-btn[data-category="${state.sidebarCategory}"]`
        )?.click();
    }
}
document.addEventListener("DOMContentLoaded", restoreAppState);
function forceUpdateIncome() {
    const incomeBox = incomeSection.querySelector('.ticket-boss');
    totalIncome = calculateCategoryTotal(incomeBox);
}

