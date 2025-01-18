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

// History-Stack initialisieren
let historyStack = [];

// Funktion zum Speichern des aktuellen Zustands
function saveState() {
  historyStack.push({
    lines: JSON.parse(JSON.stringify(lines)),
    currentLine: currentLine,
    classicTerms: JSON.parse(JSON.stringify(classicTerms)),
    classicLastOp: classicLastOp,
    total: total,
    lastOperator: lastOperator,
    calcMode: calcMode
  });
}

// Funktion zum Wiederherstellen des letzten Zustands
function restoreState() {
  if (historyStack.length === 0) {
    showStatus("Keine weiteren Schritte rückgängig!", "red");
    return;
  }
  const lastState = historyStack.pop();
  lines = lastState.lines;
  currentLine = lastState.currentLine;
  classicTerms = lastState.classicTerms;
  classicLastOp = lastState.classicLastOp;
  total = lastState.total;
  lastOperator = lastState.lastOperator;
  calcMode = lastState.calcMode;
  // Aktualisiere den Modus-Select
  const modeSelect = rightPanel.querySelector("select");
  modeSelect.value = calcMode;
  showStatus("Letzten Schritt rückgängig gemacht.", "blue");
  updateDisplay();
}

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
function showModal(message, onConfirm, onCancel) {
  // Modal erstellen
  const modalOverlay = document.createElement("div");
  modalOverlay.style.position = "fixed";
  modalOverlay.style.top = "0";
  modalOverlay.style.left = "0";
  modalOverlay.style.width = "100%";
  modalOverlay.style.height = "100%";
  modalOverlay.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
  modalOverlay.style.display = "flex";
  modalOverlay.style.justifyContent = "center";
  modalOverlay.style.alignItems = "center";
  modalOverlay.style.zIndex = "9999";

  const modalBox = document.createElement("div");
  modalBox.style.backgroundColor = "#ffffff";
  modalBox.style.padding = "20px";
  modalBox.style.borderRadius = "10px";
  modalBox.style.textAlign = "center";
  modalBox.style.boxShadow = "0 0 15px rgba(0, 0, 0, 0.5)";
  modalBox.style.width = "300px";

  const modalMessage = document.createElement("p");
  modalMessage.textContent = message;
  modalMessage.style.marginBottom = "20px";
  modalMessage.style.color = "#000000";

  const buttonContainer = document.createElement("div");
  buttonContainer.style.display = "flex";
  buttonContainer.style.justifyContent = "space-between";

  const confirmButton = document.createElement("button");
  confirmButton.textContent = "Ja, zurücksetzen";
  confirmButton.style.backgroundColor = "#ff0000";
  confirmButton.style.color = "#ffffff";
  confirmButton.style.border = "none";
  confirmButton.style.padding = "10px";
  confirmButton.style.borderRadius = "5px";
  confirmButton.style.cursor = "pointer";
  confirmButton.style.marginRight = "10px";

  const cancelButton = document.createElement("button");
  cancelButton.textContent = "Abbrechen";
  cancelButton.style.backgroundColor = "#007bff";
  cancelButton.style.color = "#ffffff";
  cancelButton.style.border = "none";
  cancelButton.style.padding = "10px";
  cancelButton.style.borderRadius = "5px";
  cancelButton.style.cursor = "pointer";

  buttonContainer.appendChild(confirmButton);
  buttonContainer.appendChild(cancelButton);
  modalBox.appendChild(modalMessage);
  modalBox.appendChild(buttonContainer);
  modalOverlay.appendChild(modalBox);
  document.body.appendChild(modalOverlay);

  // Event-Listener für die Buttons
  confirmButton.addEventListener("click", () => {
    onConfirm();
    document.body.removeChild(modalOverlay);
  });

  cancelButton.addEventListener("click", () => {
    if (onCancel) onCancel();
    document.body.removeChild(modalOverlay);
  });
}



/**
 * 7) Reset
 */
function resetAll() {
  showModal(
    "Bist Du sicher, dass Du den Rechenstreifen und alle Eingaben zurücksetzen möchtest?",
    () => {
      // Speichere den Zustand vor dem Reset
      saveState();

      lines = [];
      currentLine = "";
      // Classic
      classicTerms = [];
      classicLastOp = null;
      // Modern
      total = null;
      lastOperator = null;

      // Eingabefelder für Name und PIN leeren
      const nameInput = document.querySelector('input[placeholder="Name, Vorname"]');
      const pinInput = document.querySelector('input[placeholder="PIN"]');
      if (nameInput) nameInput.value = "";
      if (pinInput) pinInput.value = "";

      showStatus("Rechenstreifen zurückgesetzt!", "blue");
      updateDisplay();
    },
    () => {
      showStatus("Reset abgebrochen.", "red");
    }
  );
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
    // Speichere den Zustand vor dem Löschen
    saveState();
    
    currentLine = currentLine.slice(0, -1);
    updateDisplay();
    return;
  }
  if (["+", "-", "*", "/"].includes(key)) {
    // Speichere den Zustand vor dem Operator
    saveState();
    
    handleOperator(key);
    return;
  }
  if (/[0-9,%.]/.test(key)) {
    // Speichere den Zustand vor der Eingabe
    saveState();
    
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
  // Speichere den Zustand vor dem Operator
  saveState();
  
  const trim = currentLine.trim();
  if (!trim) {
    // Kein Wert => merken wir uns nur den Operator
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
      lines.push({ text: formatNumber(value) + op, color: "black", bold: false });
    } else {
      let lastVal = classicTerms[classicTerms.length - 1];
      if (classicLastOp === "*") {
        let result = lastVal * value;
        classicTerms[classicTerms.length - 1] = result;
        lines.push({ text: formatNumber(value) + op, color: "black", bold: false });
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
        lines.push({ text: formatNumber(value) + op, color: "black", bold: false });
      }
    }
    // Operation verbraucht
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
    } else if (op === "*" || op === "/") {
      if (classicTerms.length === 0) {
        classicTerms.push(value);
        lines.push({ text: formatNumber(value) + op, color: "black", bold: false });
      } else {
        lines.push({ text: formatNumber(value), color: "black", bold: false });
        classicTerms.push(value);
        lines.push({ text: op, color: "black", bold: false });
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
  // Speichere den Zustand vor dem Enter
  saveState();
  
  const trim = currentLine.trim();
  const { num, isPercent } = parseNumber(trim);
  
  if (!isNaN(num) && trim !== "") {
    let value = num;
    if (isPercent) value /= 100;
    
    // Falls noch * / offen => wende sie jetzt an
    if (classicLastOp === "*" || classicLastOp === "/") {
      if (classicTerms.length === 0) {
        classicTerms.push(value);
        // Kein Operator anfügen
        lines.push({ text: formatNumber(value), color: "black", bold: false });
      } else {
        let lastVal = classicTerms[classicTerms.length - 1];
        if (classicLastOp === "*") {
          let result = lastVal * value;
          classicTerms[classicTerms.length - 1] = result;
          // Kein Operator anfügen
          lines.push({ text: formatNumber(value), color: "black", bold: false });
        } else {
          // classicLastOp === "/"
          if (value === 0) {
            lines.push({ text: `/${value} => Division durch 0!`, color: "red", bold: false });
            currentLine = "";
            updateDisplay();
            return;
          }
          let result = lastVal / value;
          classicTerms[classicTerms.length - 1] = result;
          // Kein Operator anfügen
          lines.push({ text: formatNumber(value), color: "black", bold: false });
        }
      }
      classicLastOp = null;
    } else {
      // Falls der letzte Operator + oder - ist, den Operator beibehalten
      if (classicLastOp === "+" || classicLastOp === "-") {
        // Den Wert mit dem Operator anfügen
        const operatorColor = (classicLastOp === "-") ? "red" : "black";
        lines.push({ text: formatNumber(value) + classicLastOp, color: operatorColor, bold: false });
        // Den Wert entsprechend dem Operator hinzufügen
        if (classicLastOp === "-") {
          classicTerms.push(-value);
        } else {
          classicTerms.push(+value);
        }
      } else {
        // Kein vorheriger Operator, einfach den Wert hinzufügen
        classicTerms.push(+value);
        lines.push({ text: formatNumber(value), color: "black", bold: false });
      }
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
  // Speichere den Zustand vor dem Operator
  saveState();
  
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
  // Speichere den Zustand vor dem Enter
  saveState();
  
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
  // Speichere den Zustand vor dem Moduswechsel
  saveState();
  
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
    // Speichere den Zustand vor dem Operator
    saveState();
    
    const op = button.innerText;
    handleOperator(op);
    leftPanel.focus();
  });
});

// Reset-Button
const resetButton = rightPanel.querySelector(".reset-button");
resetButton.addEventListener("click", () => {
  resetAll();
  leftPanel.focus();
});

// Zurück-Button
const zurueckButton = rightPanel.querySelector(".zurueck-button");
zurueckButton.addEventListener("click", () => {
  restoreState();
  leftPanel.focus();
});

/*
Numerische Buttons wurden entfernt
// Numerische Buttons wurden entfernt
// const numbersContainer = rightPanel.querySelector(".numbers-container");
// const numberButtons = numbersContainer.querySelectorAll("button");
// numberButtons.forEach(button => {
//   button.addEventListener("click", () => {
//     const num = button.innerText;
//     if (num === ",") {
//       if (!currentLine.includes(",")) {
//         currentLine += ",";
//       }
//     } else {
//       currentLine += num;
//     }
//     updateDisplay();
//     leftPanel.focus();
//   });
// });
*/

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
          font-size: 12px; /* Gesamte Schriftgröße auf 12px gesetzt */
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
          font-size: 12px; /* Schriftgröße auf 12px gesetzt */
          vertical-align: top;
        }
        th {
          text-align: left;
          background-color: #f9f9f9;
        }
        .rechnung-text {
          text-align: right;
          padding-right: 12px;
        }
        .user-input {
          width: 70%;
        }
        .user-input input {
          width: 100%;
          padding: 4px;
          border: 1px solid #ccc;
          border-radius: 3px;
          font-size: 12px; /* Schriftgröße auf 12px gesetzt */
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
          font-size: 12px; /* Schriftgröße für Überschriften und Absätze auf 12px gesetzt */
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
