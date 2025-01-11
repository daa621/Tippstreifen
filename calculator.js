/**
 * 1) Überschrift
 */
const heading = document.querySelector("h1");

/**
 * 2) Hauptcontainer
 */
const mainContainer = document.querySelector(".main-container");

/**
 * 3) Linkes Panel
 */
const leftPanel = document.querySelector(".left-panel");
const rechenContainer = leftPanel.querySelector(".rechen-container");
const rechenPre = rechenContainer.querySelector("pre");
const statusPanel = leftPanel.querySelector(".status-panel");

function showStatus(msg, color = "black") {
  statusPanel.style.color = color;
  statusPanel.innerText = msg;
}

/**
 * 4) Variablen
 */
let lines = [];
let currentLine = "";
// CLASSIC: Array + Operator
let classicTerms = [];
let classicLastOp = null;
// MODERN:
let total = null;
let lastOperator = null;
let calcMode = "classic";
const BLINK_CURSOR = "_";
let showCursor = true;

setInterval(() => {
  showCursor = !showCursor;
  updateDisplay();
}, 500);

/**
 * 5) Anzeige aktualisieren
 */
function updateDisplay() {
  const htmlLines = lines.map(lineObj => {
    return `<span style="color:${lineObj.color}; font-weight:${lineObj.bold ? 'bold' : 'normal'}">${lineObj.text}</span>`;
  });
  const dispLine = currentLine + (showCursor ? BLINK_CURSOR : " ");
  htmlLines.push(`<span style="color:black; font-weight:normal">${dispLine}</span>`);
  rechenPre.innerHTML = htmlLines.join("\n");
  rechenContainer.scrollTop = rechenContainer.scrollHeight;
}

/**
 * 6) Zahl parsen / formatieren
 */
const decimalInput = document.querySelector(".decimal-container input");

function formatNumber(num) {
  const decimals = parseInt(decimalInput.value, 10) || 3;
  let fixedString = num.toFixed(decimals);
  let [intPart, fracPart] = fixedString.split(".");
  intPart = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  if (fracPart) {
    return intPart + "," + fracPart;
  } else {
    return intPart;
  }
}

function parseNumber(str) {
  let isPercent = false;
  if (str.endsWith("%")) {
    isPercent = true;
    str = str.slice(0, -1);
  }
  const num = parseFloat(str.replace(",", "."));
  return { num, isPercent };
}

/**
 * 7) Reset
 */
function resetAll() {
  lines = [];
  currentLine = "";
  // Classic
  classicTerms = [];
  classicLastOp = null;
  // Modern
  total = null;
  lastOperator = null;
  showStatus("Seite zurückgesetzt!", "blue");
  updateDisplay();
}

/**
 * 8) Key-Events
 */
leftPanel.addEventListener("click", () => {
  leftPanel.focus();
});

leftPanel.addEventListener("keydown", (ev) => {
  ev.preventDefault();
  const key = ev.key;
  if (key === "Delete") {
    resetAll();
    return;
  }
  if (key === "Enter") {
    handleEnter();
    return;
  }
  if (key === "Backspace") {
    currentLine = currentLine.slice(0, -1);
    updateDisplay();
    return;
  }
  if (["+", "-", "*", "/"].includes(key)) {
    handleOperator(key);
    return;
  }
  if (/[0-9,%.]/.test(key)) {
    if (key === ".") {
      if (!currentLine.includes(",")) {
        currentLine += ",";
      }
    } else if (key === "%") {
      if (!currentLine.includes("%")) {
        currentLine += "%";
      }
    } else {
      currentLine += key;
    }
    updateDisplay();
    return;
  }
});

/**
 * 9) CLASSIC
 * + / - => sofort
 * * / / => erst beim nächsten Wert
 */
function handleOperatorClassic(op) {
  const trim = currentLine.trim();
  if (!trim) {
    // kein Wert => merken wir uns nur den Operator
    classicLastOp = op;
    return;
  }
  const { num, isPercent } = parseNumber(trim);
  if (isNaN(num)) {
    lines.push({ text: `??? ${currentLine}`, color: "black", bold: false });
    currentLine = "";
    updateDisplay();
    return;
  }
  let value = num;
  if (isPercent) value /= 100;
  // Flag, ob wir diese "value" schon mit * oder / verarbeitet haben
  let usedThisNumber = false;
  // 1) Falls wir noch * / offen haben => wende es JETZT an
  if (classicLastOp === "*" || classicLastOp === "/") {
    if (classicTerms.length === 0) {
      // Kein Summand => pushen
      classicTerms.push(value);
      lines.push({ text: formatNumber(value) + classicLastOp, color: "black", bold: false });
    } else {
      let lastVal = classicTerms[classicTerms.length - 1];
      if (classicLastOp === "*") {
        let result = lastVal * value;
        classicTerms[classicTerms.length - 1] = result;
        lines.push({ text: formatNumber(value) + "*", color: "black", bold: false });
      } else {
        // classicLastOp === "/"
        if (value === 0) {
          lines.push({ text: `${formatNumber(lastVal)}/0 => Division durch 0!`, color: "red", bold: false });
          currentLine = "";
          updateDisplay();
          return;
        }
        let result = lastVal / value;
        classicTerms[classicTerms.length - 1] = result;
        lines.push({ text: formatNumber(value) + "/", color: "black", bold: false });
      }
    }
    // operation verbraucht
    classicLastOp = null;
    usedThisNumber = true; // Wir haben "value" in * / verarbeitet
  }
  // 2) Neuer Operator => falls wir "value" noch nicht benutzt haben
  if (!usedThisNumber) {
    if (op === "+") {
      classicTerms.push(+value);
      lines.push({ text: formatNumber(value) + "+", color: "black", bold: false });
    } else if (op === "-") {
      classicTerms.push(-value);
      lines.push({ text: formatNumber(value) + "-", color: "red", bold: false });
    } else if (op === "*") {
      if (classicTerms.length === 0) {
        classicTerms.push(value);
        lines.push({ text: formatNumber(value) + "*", color: "black", bold: false });
      } else {
        lines.push({ text: formatNumber(value), color: "black", bold: false });
        classicTerms.push(value);
        lines.push({ text: "*", color: "black", bold: false });
      }
    } else if (op === "/") {
      if (classicTerms.length === 0) {
        classicTerms.push(value);
        lines.push({ text: formatNumber(value) + "/", color: "black", bold: false });
      } else {
        lines.push({ text: formatNumber(value), color: "black", bold: false });
        classicTerms.push(value);
        lines.push({ text: "/", color: "black", bold: false });
      }
    }
  }
  // 3) Falls op * / => wir merken uns das
  if (op === "*" || op === "/") {
    classicLastOp = op;
  } else {
    // + oder -
    classicLastOp = null;
  }
  currentLine = "";
  updateDisplay();
}

function handleEnterClassic() {
  const trim = currentLine.trim();
  const { num, isPercent } = parseNumber(trim);
  if (!isNaN(num) && trim !== "") {
    let value = num;
    if (isPercent) value /= 100;
    // Falls noch * / offen => wende sie jetzt an
    if (classicLastOp === "*" || classicLastOp === "/") {
      if (classicTerms.length === 0) {
        classicTerms.push(value);
        lines.push({ text: formatNumber(value) + classicLastOp, color: "black", bold: false });
      } else {
        let lastVal = classicTerms[classicTerms.length - 1];
        if (classicLastOp === "*") {
          let result = lastVal * value;
          classicTerms[classicTerms.length - 1] = result;
          lines.push({ text: formatNumber(value) + "*", color: "black", bold: false });
        } else {
          if (value === 0) {
            lines.push({ text: `/${value} => Division durch 0!`, color: "red", bold: false });
            currentLine = "";
            updateDisplay();
            return;
          }
          let result = lastVal / value;
          classicTerms[classicTerms.length - 1] = result;
          lines.push({ text: formatNumber(value) + "/", color: "black", bold: false });
        }
      }
      classicLastOp = null;
    } else {
      // sonst tun wir so, als wäre es +value
      classicTerms.push(+value);
      lines.push({ text: formatNumber(value), color: "black", bold: false });
    }
  }
  // Summieren
  let totalSum = classicTerms.reduce((acc, val) => acc + val, 0);
  let finalColor = (totalSum < 0 ? "red" : "black");
  lines.push({ text: formatNumber(totalSum), color: finalColor, bold: true });
  lines.push({ text: "", color: "black", bold: false });
  // Reset
  currentLine = "";
  classicTerms = [];
  classicLastOp = null;
  updateDisplay();
}

/**
 * 10) MODERN
 */
function handleOperatorModern(op) {
  const { num, isPercent } = parseNumber(currentLine.trim());
  if (!currentLine.trim() || isNaN(num)) {
    lastOperator = op;
    currentLine = "";
    updateDisplay();
    return;
  }
  if (lastOperator === null) {
    if (isPercent) {
      total = num / 100;
    } else {
      total = num;
    }
    const color = (total < 0) ? "red" : "black";
    lines.push({ text: (isPercent ? `${formatNumber(num)}%` : formatNumber(num)) + op, color, bold: false });
    lastOperator = op;
    currentLine = "";
    updateDisplay();
    return;
  }
  let value = num;
  if (isPercent) {
    if (lastOperator === '+' || lastOperator === '-') {
      value = total * (num / 100);
    } else if (lastOperator === '*' || lastOperator === '/') {
      value = num / 100;
    }
  }
  switch (lastOperator) {
    case "+":
      total += value;
      break;
    case "-":
      total -= value;
      break;
    case "*":
      total *= value;
      break;
    case "/":
      if (value === 0) {
        lines.push({ text: `${currentLine} (Division durch 0!)`, color: "red", bold: false });
        currentLine = "";
        updateDisplay();
        return;
      }
      total /= value;
      break;
  }
  const partialColor = (total < 0 ? "red" : "black");
  lines.push({ text: (isPercent ? `${formatNumber(num)}%` : formatNumber(value)) + lastOperator, color: partialColor, bold: false });
  lastOperator = op;
  currentLine = "";
  updateDisplay();
}

function handleEnterModern() {
  const { num, isPercent } = parseNumber(currentLine.trim());
  if (currentLine.trim() !== "" && !isNaN(num)) {
    let value = num;
    if (isPercent && lastOperator !== null) {
      if (lastOperator === '+' || lastOperator === '-') {
        value = total * (num / 100);
      } else if (lastOperator === '*' || lastOperator === '/') {
        value = num / 100;
      }
    }
    if (lastOperator !== null) {
      switch (lastOperator) {
        case "+":
          total += value;
          break;
        case "-":
          total -= value;
          break;
        case "*":
          total *= value;
          break;
        case "/":
          if (value === 0) {
            lines.push({ text: `${currentLine} (Division durch 0!)`, color: "red", bold: false });
            currentLine = "";
            updateDisplay();
            return;
          }
          total /= value;
          break;
      }
      lines.push({ text: (isPercent ? `${formatNumber(num)}%` : formatNumber(value)) + lastOperator, color: "black", bold: false });
    } else {
      if (total === null) {
        total = isPercent ? num / 100 : num;
      } else {
        total = isPercent ? num / 100 : num;
      }
    }
  }
  const finalColor = (total < 0 ? "red" : "black");
  lines.push({ text: formatNumber(total), color: finalColor, bold: true });
  lines.push({ text: "", color: "black", bold: false });
  lastOperator = null;
  currentLine = "";
  total = null;
  updateDisplay();
}

/**
 * 11) Gemeinsame Handler
 */
function handleOperator(op) {
  if (calcMode === "classic") {
    handleOperatorClassic(op);
  } else {
    handleOperatorModern(op);
  }
}

function handleEnter() {
  if (calcMode === "classic") {
    handleEnterClassic();
  } else {
    handleEnterModern();
  }
}

/**
 * 12) Rechter Bereich
 */
const rightPanel = document.querySelector(".right-panel");
const nameInput = rightPanel.querySelector('input[type="text"]');
const pinInput = rightPanel.querySelector('input[type="password"]');

// Modus-Auswahl
const modeSelect = rightPanel.querySelector("select");
modeSelect.addEventListener("change", () => {
  calcMode = modeSelect.value;
  // Reset
  classicTerms = [];
  classicLastOp = null;
  total = null;
  lastOperator = null;
  lines = [];
  currentLine = "";
  showStatus(`Modus gewechselt zu: ${calcMode}`, "blue");
  updateDisplay();
});

// Operator-Buttons
const operatorButtons = rightPanel.querySelectorAll(".operator-container .button");
operatorButtons.forEach(button => {
  button.addEventListener("click", () => {
    const op = button.innerText;
    handleOperator(op);
    leftPanel.focus();
  });
});

// Numerische Buttons
const numbersContainer = rightPanel.querySelector(".numbers-container");
const numberButtons = numbersContainer.querySelectorAll("button");
numberButtons.forEach(button => {
  button.addEventListener("click", () => {
    const num = button.innerText;
    if (num === ",") {
      if (!currentLine.includes(",")) {
        currentLine += ",";
      }
    } else {
      currentLine += num;
    }
    updateDisplay();
    leftPanel.focus();
  });
});

// Drucken-Button
const druckenButton = rightPanel.querySelector(".drucken-button");
druckenButton.addEventListener("click", () => {
  const newWindow = window.open("", "_blank", "width=800,height=600");
  const nameValue = nameInput.value.trim() || "Unbekannt";
  const pinValue = pinInput.value.trim() || "Nicht angegeben";
  const now = new Date();
  const dateString = now.toLocaleDateString("de-DE");
  const timeString = now.toLocaleTimeString("de-DE");
  const rechenstreifenContent = lines.map(line => {
    return `
    <tr>
      <td class="rechnung-text">${line.text.trim()}</td>
      <td class="user-input"><input type="text" name="note" /></td>
    </tr>`;
  }).join("");
  newWindow.document.write(`
    <html>
    <head>
      <title>Druckansicht</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
          line-height: 1.2;
          background-color: #ffffff;
          color: #000000;
          font-size: 10px; /* Gesamte Schriftgröße auf 10px gesetzt */
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th, td {
          padding: 0px 8px; /* Vertikales Padding auf 0, horizontales bleibt 8px */
          border: none; /* Alle Rahmen entfernen */
          font-family: 'Courier New', monospace;
          font-size: 10px; /* Schriftgröße auf 10px gesetzt */
          vertical-align: top;
        }
        th {
          text-align: left;
          background-color: #f9f9f9;
        }
        .rechnung-text {
          text-align: right;
          padding-right: 10px;
        }
        .user-input {
          width: 70%;
        }
        .user-input input {
          width: 100%;
          padding: 4px;
          border: 1px solid #ccc;
          border-radius: 3px;
          font-size: 10px; /* Schriftgröße auf 10px gesetzt */
          box-sizing: border-box;
        }
        tr:hover {
          background-color: #f1f1f1;
        }
        table, tr, td, th {
          border-spacing: 0;
          border-collapse: collapse;
        }
        h2, p {
          font-size: 10px; /* Schriftgröße für Überschriften und Absätze auf 10px gesetzt */
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Tippstreifen 2.0 - Berechnung</h2>
        <p><strong>Name:</strong> ${nameValue}</p>
        <p><strong>PIN:</strong> ${pinValue}</p>
        <p><strong>Datum:</strong> ${dateString} ${timeString}</p>
        <br>
        <table>
          <thead>
            <tr>
              <th>Berechnung</th>
              <th>Notizen</th>
            </tr>
          </thead>
          <tbody>
            ${rechenstreifenContent}
          </tbody>
        </table>
      </div>
    </body>
    </html>
  `);
  newWindow.document.close();
});

/**
 * 13) START
 */
updateDisplay();
leftPanel.focus();
