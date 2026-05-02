/* ===========================
   CALCULATOR — script.js
   =========================== */

// ── STATE VARIABLES ──────────────────────────────────────────────────────────
// These variables track what's happening in the calculator at any moment.

let currentInput = '';      // The number the user is currently typing
let previousInput = '';     // The number typed before pressing an operator
let operator = '';          // The operator selected (+, -, *, /)
let shouldResetScreen = false;  // True after pressing = (next number starts fresh)


// ── DOM REFERENCES ───────────────────────────────────────────────────────────
// Grab the two display elements so we can update them easily.

const resultEl   = document.getElementById('result');
const expressionEl = document.getElementById('expression');
const displayEl  = document.querySelector('.display');


// ── UPDATE DISPLAY ────────────────────────────────────────────────────────────
// Call this whenever the screen needs to refresh.

function updateDisplay(value) {
  // If the number is very long, shrink the font size
  if (String(value).length > 9) {
    resultEl.classList.add('small-text');
  } else {
    resultEl.classList.remove('small-text');
  }

  resultEl.textContent = value;
}


// ── INPUT NUMBER ──────────────────────────────────────────────────────────────
// Called when the user clicks a digit button (0–9).

function inputNumber(num) {
  // Remove any error styling when the user starts typing again
  displayEl.classList.remove('error');

  // If we just finished a calculation, start fresh
  if (shouldResetScreen) {
    currentInput = '';
    shouldResetScreen = false;
  }

  // Prevent numbers from getting too long (max 12 digits)
  if (currentInput.length >= 12) return;

  // Don't allow multiple leading zeros ("007" → just "7")
  if (currentInput === '0' && num === '0') return;

  // Append the digit to the current input string
  currentInput += num;

  updateDisplay(currentInput);
}


// ── INPUT DECIMAL ─────────────────────────────────────────────────────────────
// Adds a decimal point — but only if there isn't one already.

function inputDecimal() {
  // If we just finished a calculation, start fresh with "0."
  if (shouldResetScreen) {
    currentInput = '0';
    shouldResetScreen = false;
  }

  // Don't add a second decimal point
  if (currentInput.includes('.')) return;

  // If no number yet, start with "0."
  if (currentInput === '') currentInput = '0';

  currentInput += '.';
  updateDisplay(currentInput);
}


// ── INPUT OPERATOR ────────────────────────────────────────────────────────────
// Called when the user clicks +, −, ×, or ÷.

function inputOperator(op) {
  displayEl.classList.remove('error');

  // If there's already a pending calculation, compute it first
  // Example: user typed 5 + 3 and now presses × → calculate 8, then apply ×
  if (previousInput !== '' && currentInput !== '') {
    calculate();
  }

  // Save the current number as the "previous" number
  previousInput = currentInput || resultEl.textContent;
  currentInput = '';      // Ready to accept the next number
  operator = op;
  shouldResetScreen = false;

  // Show the expression at top of display (e.g., "8 +")
  expressionEl.textContent = `${previousInput} ${formatOperator(op)}`;

  // Highlight the active operator button
  highlightOperator(op);
}


// ── CALCULATE ─────────────────────────────────────────────────────────────────
// Called when the user presses "=". Does the actual math.

function calculate() {
  // Nothing to calculate if we don't have both numbers and an operator
  if (previousInput === '' || currentInput === '' || operator === '') return;

  const a = parseFloat(previousInput);   // Convert string to number
  const b = parseFloat(currentInput);
  let result;

  // ── THE MATH ──
  switch (operator) {
    case '+':
      result = a + b;
      break;
    case '-':
      result = a - b;
      break;
    case '*':
      result = a * b;
      break;
    case '/':
      // Special case: division by zero is not allowed
      if (b === 0) {
        showError("Can't divide by zero");
        return;
      }
      result = a / b;
      break;
    default:
      return;
  }

  // ── HANDLE FLOATING POINT WEIRDNESS ──
  // JavaScript: 0.1 + 0.2 = 0.30000000000000004
  // Fix: round to 10 decimal places
  result = parseFloat(result.toFixed(10));

  // Show the full equation in the small expression area
  expressionEl.textContent = `${previousInput} ${formatOperator(operator)} ${currentInput} =`;

  // Update the main display with the result
  updateDisplay(result);

  // Save result so it can be used in the next calculation
  currentInput = String(result);
  previousInput = '';
  operator = '';
  shouldResetScreen = true;

  // Remove operator button highlight
  clearOperatorHighlight();
}


// ── CLEAR ALL ─────────────────────────────────────────────────────────────────
// Resets everything — like pressing the "AC" button on a real calculator.

function clearAll() {
  currentInput = '';
  previousInput = '';
  operator = '';
  shouldResetScreen = false;

  updateDisplay('0');
  expressionEl.textContent = '';
  displayEl.classList.remove('error');
  clearOperatorHighlight();
}


// ── TOGGLE SIGN ───────────────────────────────────────────────────────────────
// Switches the current number between positive and negative.

function toggleSign() {
  if (!currentInput || currentInput === '0') return;

  // If it starts with a minus, remove it. Otherwise, add one.
  if (currentInput.startsWith('-')) {
    currentInput = currentInput.slice(1);
  } else {
    currentInput = '-' + currentInput;
  }

  updateDisplay(currentInput);
}


// ── PERCENT ───────────────────────────────────────────────────────────────────
// Converts the current number to a percentage (divides by 100).

function inputPercent() {
  if (!currentInput) return;

  currentInput = String(parseFloat(currentInput) / 100);
  updateDisplay(currentInput);
}


// ── SHOW ERROR ────────────────────────────────────────────────────────────────
// Shows an error message on screen (e.g., divide by zero).

function showError(message) {
  displayEl.classList.add('error');
  resultEl.textContent = message;
  expressionEl.textContent = '';

  // Clear state so calculator is ready after the error
  currentInput = '';
  previousInput = '';
  operator = '';
  shouldResetScreen = true;
  clearOperatorHighlight();
}


// ── HELPER: FORMAT OPERATOR ───────────────────────────────────────────────────
// Converts internal operator symbols to display-friendly ones.

function formatOperator(op) {
  const map = { '+': '+', '-': '−', '*': '×', '/': '÷' };
  return map[op] || op;
}


// ── HELPER: HIGHLIGHT ACTIVE OPERATOR BUTTON ──────────────────────────────────
// Adds a visual highlight to the currently selected operator button.

function highlightOperator(op) {
  clearOperatorHighlight();

  // Map operator symbols to button text labels
  const labelMap = { '+': '+', '-': '−', '*': '×', '/': '÷' };
  const label = labelMap[op];

  // Find the matching button and add the 'active' class
  document.querySelectorAll('.btn-operator').forEach(btn => {
    if (btn.textContent === label) {
      btn.classList.add('active');
    }
  });
}


// ── HELPER: CLEAR OPERATOR HIGHLIGHT ─────────────────────────────────────────

function clearOperatorHighlight() {
  document.querySelectorAll('.btn-operator').forEach(btn => {
    btn.classList.remove('active');
  });
}


// ── KEYBOARD SUPPORT ──────────────────────────────────────────────────────────
// Lets users type on their keyboard instead of clicking buttons.

document.addEventListener('keydown', (event) => {
  const key = event.key;

  if (key >= '0' && key <= '9') inputNumber(key);
  else if (key === '.') inputDecimal();
  else if (key === '+') inputOperator('+');
  else if (key === '-') inputOperator('-');
  else if (key === '*') inputOperator('*');
  else if (key === '/') { event.preventDefault(); inputOperator('/'); }  // prevent browser search
  else if (key === 'Enter' || key === '=') calculate();
  else if (key === 'Escape') clearAll();
  else if (key === 'Backspace') {
    // Delete the last digit typed
    currentInput = currentInput.slice(0, -1);
    updateDisplay(currentInput || '0');
  }
});
