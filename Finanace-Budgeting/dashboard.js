// =======================
// CATEGORY TOTALS (TOP)
// =======================
const categoryTotals = {
    "Basic-living-expenses": 0,
    "Transportation": 0,
    "Food": 0,
    "Education": 0,
    "Lifestyle-Entertainment": 0,
    "Health": 0,
    "Savings": 0
};

// =======================
// CHART SETUP
// =======================
const ctx = document.getElementById('expenseChart').getContext('2d');

const expenseChart = new Chart(ctx, {
    type: 'pie',
    data: {
        labels: [
            'Basic Living',
            'Transportation',
            'Food',
            'Education',
            'Lifestyle',
            'Health',
            'Savings'
        ],
        datasets: [{
            data: Object.values(categoryTotals),
            backgroundColor: [
                '#f06292',
                '#ba68c8',
                '#64b5f6',
                '#4db6ac',
                '#ffd54f',
                '#81c784',
                '#9575cd'
            ]
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: { position: 'bottom' }
        }
    }
});

// =======================
// CATEGORY FILTER
// =======================
const select = document.querySelector('.choose');
const expenseTickets = document.querySelectorAll('.expense-ticket');

select.addEventListener('change', () => {
    const selected = select.value;

    if (selected === '') {
        tickets.forEach(ticket => {
            ticket.classList.remove("hidden", "centered");
        });
        return;
    }

    expenseTickets.forEach(ticket => {
        if (ticket.dataset.category === selected) {
            ticket.classList.remove("hidden");
            ticket.classList.add("centered");

            setTimeout(() => {
                ticket.scrollIntoView({ behavior: "smooth", block: "center" });
            }, 200);

        } else {
            ticket.classList.add("hidden");
            ticket.classList.remove("centered");
        }
    });
});

// =======================
// TOTAL CALCULATION
// =======================
expenseTickets.forEach(ticket => {
    const inputs = ticket.querySelectorAll('input[type="number"]');
    const totalspan = ticket.querySelector('.total-value');

    function calculateTotal() {
        let total = 0;
        inputs.forEach(input => {
            total += Number(input.value) || 0;
        });

        totalspan.textContent = total;

        const category = ticket.dataset.category;
        categoryTotals[category] = total;

        expenseChart.data.datasets[0].data = Object.values(categoryTotals);
        expenseChart.update();
        updateBalance();

    }

    inputs.forEach(input => {
        input.addEventListener('input', calculateTotal);
    });
});
const modeCards = document.querySelectorAll('.mode-card');

const expensesSection = document.getElementById('expensesSection');
const incomeSection = document.getElementById('incomeSection');
const balanceSection = document.getElementById('balanceSection');

modeCards.forEach(card => {
    card.addEventListener('click', () => {

        const mode = card.dataset.mode;
        localStorage.setItem('activeMode', mode);

        // remove active state
        modeCards.forEach(c => c.classList.remove('active'));

        card.classList.add('active');

        // hide all sections
        expensesSection.style.display = 'none';
        incomeSection.style.display = 'none';
        balanceSection.style.display = 'none';

        // show selected section
        if (mode === 'expenses') expensesSection.style.display = 'block';
        if (mode === 'income') incomeSection.style.display = 'block';
        if (mode === 'balance') balanceSection.style.display = 'block';
    });
});
// =======================
// RESTORE LAST ACTIVE MODE
// =======================
const savedMode = localStorage.getItem('activeMode') || 'expenses';

// remove active from all cards
modeCards.forEach(card => card.classList.remove('active'));

// hide all sections
expensesSection.style.display = 'none';
incomeSection.style.display = 'none';
balanceSection.style.display = 'none';

// activate saved mode
modeCards.forEach(card => {
    if (card.dataset.mode === savedMode) {
        card.classList.add('active');
    }
});

// show correct section
if (savedMode === 'expenses') expensesSection.style.display = 'block';
if (savedMode === 'income') incomeSection.style.display = 'block';
if (savedMode === 'balance') balanceSection.style.display = 'block';

/* =========================
   INCOME TOTALS (DATA MODEL)
========================= */
const incomeTotals = {
    business: 0,
    salary: 0,
    investments: 0,
    rental: 0,
    other: 0
};
/* =========================
   INCOME CHART SETUP
========================= */
const incomeCtx = document
    .getElementById('incomeChart')
    .getContext('2d');

const incomeChart = new Chart(incomeCtx, {
    type: 'doughnut',
    data: {
        labels: [
            'Business / Freelancing',
            'Salary',
            'Investments',
            'Rental / Passive',
            'Other Income'
        ],
        datasets: [{
            data: Object.values(incomeTotals),
            backgroundColor: [
                '#81c784',
                '#4caf50',
                '#64b5f6',
                '#ffd54f',
                '#ff8a65'
            ]
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: { position: 'bottom' }
        }
    }
});
/* =========================
   INCOME TOTAL CALCULATION
========================= */
const incomeInputs = document.querySelectorAll(
    '#incomeSection input[type="number"]'
);
const incomeTotalSpan = document.querySelector(
    '#incomeSection .total-value'
);

function calculateIncome() {
    incomeTotals.business     = Number(incomeInputs[0].value) || 0;
    incomeTotals.salary       = Number(incomeInputs[1].value) || 0;
    incomeTotals.investments  = Number(incomeInputs[2].value) || 0;
    incomeTotals.rental       = Number(incomeInputs[3].value) || 0;
    incomeTotals.other        = Number(incomeInputs[4].value) || 0;

    const total = Object.values(incomeTotals)
        .reduce((sum, val) => sum + val, 0);

    incomeTotalSpan.textContent = total;

    incomeChart.data.datasets[0].data =
        Object.values(incomeTotals);

    incomeChart.update();
    updateBalance();

}

incomeInputs.forEach(input => {
    input.addEventListener('input', calculateIncome);
});
/* =========================
   BALANCE CALCULATION
========================= */

const balanceIncomeEl = document.getElementById('balanceIncome');
const balanceExpensesEl = document.getElementById('balanceExpenses');
const netBalanceEl = document.getElementById('netBalance');
const balanceStatusEl = document.getElementById('balanceStatus');

function updateBalance() {
    const totalIncome = Object.values(incomeTotals).reduce((a, b) => a + b, 0);
    const totalExpenses = Object.values(categoryTotals).reduce((a, b) => a + b, 0);

    const netBalance = totalIncome - totalExpenses;

    balanceIncomeEl.textContent = totalIncome;
    balanceExpensesEl.textContent = totalExpenses;
    netBalanceEl.textContent = netBalance;

    balanceStatusEl.classList.remove('positive', 'negative');

    if (netBalance >= 0) {
        balanceStatusEl.textContent = 'Surplus 💰';
        balanceStatusEl.classList.add('positive');
    } else {
        balanceStatusEl.textContent = 'Deficit ⚠️';
        balanceStatusEl.classList.add('negative');
    }

    updateBalanceChart(totalIncome, totalExpenses);
    if (totalIncome > 0) {
    const expensePercent = ((totalExpenses / totalIncome) * 100).toFixed(1);
    console.log(`You spent ${expensePercent}% of your income this month`);
}

}
/* =========================
   BALANCE CHART
========================= */

const balanceCtx = document.getElementById('balanceChart').getContext('2d');

const balanceChart = new Chart(balanceCtx, {
    type: 'bar',
    data: {
        labels: ['Income', 'Expenses'],
        datasets: [{
            data: [0, 0],
            backgroundColor: ['#4caf50', '#f44336']
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: { display: false }
        }
    }
});

function updateBalanceChart(income, expenses) {
    balanceChart.data.datasets[0].data = [income, expenses];
    balanceChart.update();
}
