'use strict';
// Expense Categories
const CATEGORIES = ["Food", "Travel", "Bills", "Shopping", "Other"];
const STORAGE_KEY = "expenses-v1";

// DOM Elements
const form = document.getElementById("expense-form");
const descInput = document.getElementById("desc");
const amtInput = document.getElementById("amt");
const catInput = document.getElementById("category");
const dateInput = document.getElementById("date");
const errorDiv = document.getElementById("form-error");
const monthSelect = document.getElementById("month-select");
const exportBtn = document.getElementById("export-csv");
const summaryTotal = document.getElementById("summary-total-value");
const summaryCount = document.getElementById("summary-count-value");
const summaryCat = document.getElementById("summary-category-value");
const barChart = document.getElementById("bar-chart");
const listNode = document.getElementById("expenses-list");

// Helpers
function getTodayStr() {
    const d = new Date();
    return d.toISOString().slice(0, 10);
}
function pad2(n) {
    return n < 10 ? "0" + n : n;
}
function toMonthStr(date) {
    // e.g. 2024-06
    if (!date) return "";
    return date.slice(0, 7);
}
function categorize(expenses) {
    const sums = {};
    for (const cat of CATEGORIES) sums[cat] = 0;
    expenses.forEach(e => {
        sums[e.category] += e.amount;
    });
    return sums;
}
function largestCategory(sums) {
    let max = 0,
        cat = "—";
    for (const [c, v] of Object.entries(sums)) {
        if (v > max) {
            max = v;
            cat = c;
        }
    }
    return max === 0 ? "—" : cat;
}

function formatINR(amt) {
    return `

${amt.toLocaleString("en-IN", {maximumFractionDigits: 2})}`;
}
function niceDate(str) {
    // Display as DD MMM YYYY
    const d = new Date(str);
    return `${pad2(d.getDate())} ${d.toLocaleString('en-US', {month: 'short'})} ${d.getFullYear()}`;
}

// Storage
function loadExpenses() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch {
        return [];
    }
}
function saveExpenses(arr) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
}

// State
defaultMonth();
function defaultMonth() {
    const today = getTodayStr();
    monthSelect.value = toMonthStr(today);
    dateInput.value = today;
}

let expenses = loadExpenses();
let visibleExpenses = [];

function update() {
    // CURRENT MONTH FILTER
    const selectedMonth = monthSelect.value;
    visibleExpenses = expenses.filter(e => toMonthStr(e.date) === selectedMonth);
    visibleExpenses.sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt);
    renderList();
    renderSummary();
    renderBarChart();
}

function renderList() {
    listNode.innerHTML = '';
    if (!visibleExpenses.length) {
        listNode.innerHTML = '<li class="no-expense-msg">No expenses for this month.</li>';
        return;
    }
    for (const e of visibleExpenses) {
        const li = document.createElement('li');
        li.className = 'expense-item';
        li.innerHTML = `<div class="expense-info">
           <div class="expense-description">${escapeHTML(e.description)}</div>
           <div class="expense-details">
              <span class="expense-amount">₹${formatINR(e.amount)}</span>
              <span>${e.category}</span>
              <span>${niceDate(e.date)}</span>
           </div></div><button class="delete-btn" data-id="${e.id}">Delete</button>`;
        const btn = li.querySelector('.delete-btn');
        btn.addEventListener('click', () => deleteExpense(e.id));
        listNode.appendChild(li);
    }
}

function renderSummary() {
    const total = visibleExpenses.reduce((s, e) => s + e.amount, 0);
    summaryTotal.textContent = '₹' + formatINR(total);
    summaryCount.textContent = visibleExpenses.length;
    const byCat = categorize(visibleExpenses);
    summaryCat.textContent = largestCategory(byCat);
}

function renderBarChart() {
    const vals = categorize(visibleExpenses);
    const max = Math.max(...Object.values(vals));
    barChart.innerHTML = '';
    if (max === 0) {
        barChart.innerHTML = `<div style="color:#999;padding:0.7em 0 0.7em 0.3em">No expenses to show.</div>`;
        return;
    }
    for (const cat of CATEGORIES) {
        const v = vals[cat];
        const pct = max > 0 ? (v / max * 100) : 0;
        barChart.innerHTML += `<div class="bar"><span class="bar-label">${cat}</span><div class="bar-outer"><div class="bar-inner" style="width:${pct}%;background:${barColor(cat)}"></div></div><span class="bar-amount">₹${formatINR(v)}</span></div>`;
    }
}
function barColor(cat) {
    switch (cat) {
        case 'Food': return '#2f80ed';
        case 'Travel': return '#01b781';
        case 'Bills': return '#ffae43';
        case 'Shopping': return '#d164c2';
        case 'Other': return '#737a8d';
        default: return '#ccc';
    }
}

// Escape HTML for safe rendering
function escapeHTML(str) {
    return (str || '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
}

// Delete
function deleteExpense(id) {
    expenses = expenses.filter(e => e.id !== id);
    saveExpenses(expenses);
    update();
}

// Form submission
form.addEventListener('submit', function(ev) {
    ev.preventDefault();
    errorDiv.textContent = '';
    const description = descInput.value.trim();
    let amount = parseFloat(amtInput.value);
    const category = catInput.value;
    const date = dateInput.value || getTodayStr();
    if (!description) {
        errorDiv.textContent = 'Description is required.';
        return;
    }
    if (!(amount > 0)) {
        errorDiv.textContent = 'Amount must be positive.';
        return;
    }
    if (!CATEGORIES.includes(category)) {
        errorDiv.textContent = 'Invalid category.';
        return;
    }
    // Save expense
    const expense = {
        id: 'e' + Date.now() + Math.floor(Math.random()*10000),
        description,
        amount: Math.round(amount * 100) / 100,
        category,
        date,
        createdAt: Date.now()
    };
    expenses.push(expense);
    saveExpenses(expenses);
    form.reset();
    // Reset date to today and category to first by default
    dateInput.value = getTodayStr();
    catInput.value = CATEGORIES[0];
    update();
});

// Default inputs
window.addEventListener('DOMContentLoaded', () => {
    defaultMonth();
    dateInput.value = getTodayStr();
    catInput.value = CATEGORIES[0];
    update();
});

// Month selector change
monthSelect.addEventListener('change', update);

// CSV export
exportBtn.addEventListener('click', function() {
    if (!visibleExpenses.length) return;
    let csv = 'Description,Amount,Category,Date\n';
    for (const e of visibleExpenses) {
        csv += `"${CSVsafe(e.description)}",${e.amount},"${e.category}",${e.date}\n`;
    }
    const blob = new Blob([csv], {type: 'text/csv'}),
        url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const m = monthSelect.value||'expenses';
    a.download = `expenses-${m}.csv`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 20);
});
function CSVsafe(s) {
    return (s||'').replace(/"/g, '""');
}
