// ---------- Build the UI with the DOM ----------
var calculator = document.createElement("div");
calculator.id = "calculator";

var display = document.createElement("div");
display.id = "display";
display.textContent = "0";
calculator.appendChild(display);

var keys = document.createElement("div");
keys.id = "keys";
calculator.appendChild(keys);
document.body.insertBefore(calculator, document.body.firstChild);

var layout = [
  ["C", "clear"], ["\u2190", "back"], [".", ""], ["\u00d7", "op"],
  ["7", ""], ["8", ""], ["9", ""], ["/", "op"],
  ["4", ""], ["5", ""], ["6", ""], ["-", "op"],
  ["1", ""], ["2", ""], ["3", ""], ["+", "op"],
  ["0", ""], ["00", ""], ["%", "op"], ["=", "equals"]
];

layout.forEach(function (item) {
  var btn = document.createElement("button");
  btn.type = "button";
  btn.textContent = item[0];
  btn.id = "btn-" + item[0];
  if (item[1]) btn.className = item[1];
  btn.addEventListener("click", function () {
    handleInput(item[0]);
    btn.blur();
  });
  keys.appendChild(btn);
});

// ---------- Arithmetic functions ----------
function add(a, b) { return a + b; }
function subtract(a, b) { return a - b; }
function multiply(a, b) { return a * b; }
function divide(a, b) {
  if (b === 0) throw new Error("Division by zero");
  return a / b;
}
function modulus(a, b) {
  if (b === 0) throw new Error("Division by zero");
  return a % b;
}

var operations = {
  "+": { prec: 1, fn: add },
  "-": { prec: 1, fn: subtract },
  "\u00d7": { prec: 2, fn: multiply },
  "/": { prec: 2, fn: divide },
  "%": { prec: 2, fn: modulus }
};

// ---------- Infix expression evaluation ----------
function tokenize(expr) {
  var tokens = [];
  var num = "";
  for (var i = 0; i < expr.length; i++) {
    var ch = expr[i];
    if (operations[ch]) {
      var prev = tokens[tokens.length - 1];
      var unaryMinus = ch === "-" && num === "" && (prev === undefined || operations[prev]);
      if (unaryMinus) {
        num = "-";
      } else {
        if (num === "" || num === "-") throw new Error("Invalid expression");
        tokens.push(parseFloat(num));
        num = "";
        tokens.push(ch);
      }
    } else {
      num += ch;
    }
  }
  if (num === "" || num === "-") throw new Error("Invalid expression");
  tokens.push(parseFloat(num));
  return tokens;
}

function evaluate(expr) {
  var tokens = tokenize(expr);
  var output = [];
  var stack = [];

  tokens.forEach(function (t) {
    if (typeof t === "number") {
      output.push(t);
    } else {
      while (stack.length && operations[stack[stack.length - 1]].prec >= operations[t].prec) {
        output.push(stack.pop());
      }
      stack.push(t);
    }
  });
  while (stack.length) output.push(stack.pop());

  var values = [];
  output.forEach(function (t) {
    if (typeof t === "number") {
      values.push(t);
    } else {
      var b = values.pop();
      var a = values.pop();
      values.push(operations[t].fn(a, b));
    }
  });
  return values[0];
}

// ---------- Input handling ----------
var current = "";

function updateDisplay() {
  display.textContent = current === "" ? "0" : current;
}

function handleInput(value) {
  if (value === "C") {
    current = "";
  } else if (value === "\u2190") {
    current = current.slice(0, -1);
  } else if (value === "=") {
    if (current === "") return;
    try {
      var result = evaluate(current);
      current = String(parseFloat(result.toFixed(10)));
    } catch (e) {
      current = "";
      display.textContent = "Error";
      return;
    }
  } else if (operations[value]) {
    var last = current.slice(-1);
    if (current === "" && value !== "-") return;
    if (operations[last] && value !== "-") {
      current = current.slice(0, -1) + value; // replace operator
    } else if (operations[last] && operations[current.slice(-2, -1)]) {
      return; // avoid stacking more than one unary minus
    } else {
      current += value;
    }
  } else {
    current += value;
  }
  updateDisplay();
}

// Keyboard: only number keys allowed
document.addEventListener("keydown", function (event) {
  var ignored = ["Shift", "Control", "Alt", "Meta", "Tab", "CapsLock"];
  if (ignored.indexOf(event.key) !== -1) return;

  if (event.key >= "0" && event.key <= "9" && event.key.length === 1) {
    handleInput(event.key);
  } else {
    event.preventDefault();
    alert("Only numbers are allowed");
  }
});
