worker = new Worker("worker.js");
worker.postMessage({ type: "start" });
let modal;
let closeButton;
window.addEventListener("load", function () {
  modal = document.querySelector(".modal");
  closeButton = document.querySelector(".close-button");

  closeButton.addEventListener("click", toggleLogModal);
  window.addEventListener("click", windowOnClick);
});
function toggleLogModal(log) {
  modal.classList.toggle("show-modal");
}

function windowOnClick(event) {
  if (event.target === modal) {
    toggleLogModal();
  }
}

const addTarget = () => {
  // get value of textbox named username
  const target = document.getElementById("username").value;
  worker.postMessage({ type: "add", target: target });
};

const deleteTarget = (target) => {
  worker.postMessage({ type: "delete", target: target });
};

const toggleTarget = (target) => {
  worker.postMessage({ type: "toggle", target: target });
};

const viewLog = (target) => {
  worker.postMessage({ type: "messageLog", target: target });
};

const createRow = (index, target, count) => {
  return `<tr>
            <td>${index}</td>
            <td>${target.username}</td>
            <td style="text-align: center">${count}</td>
            <td style="text-align: center">
              <span
                class="textButton"
                onclick="toggleTarget('${target.username}')"
                style="color: ${target.active ? "green" : "red"}"
                >${target.active ? "ON" : "OFF"}</span>

              <span style="margin: 10px"></span>
              <span class="textButton" href="#popup1" onclick="viewLog('${
                target.username
              }')">LOG</span>
              <span style="margin: 10px"></span>
              <span class="textButton" onclick="deleteTarget('${
                target.username
              }')">DEL</span>
            </td>
          </tr>`;
};

const emptyRow = () => {
  // create a row with a single cell that spans all columns
  return `<tr><td colspan="4" style="text-align: center">No Victims Yet</td></tr>`;
};

const updateView = (log, targets) => {
  const table = document.getElementById("log");
  table.innerHTML = "";
  // if no targets, or no active targets, then return empty row
  if (!targets) {
    table.innerHTML = emptyRow();
    return;
  }
  // sort targets based on active and count
  targets.sort((a, b) => {
    if (a.active && !b.active) return -1;
    if (!a.active && b.active) return 1;
    if (a.active && b.active) {
      const countA = log[a.username] || 0;
      const countB = log[b.username] || 0;
      return countB - countA;
    }
    return 0;
  });
  
  targets.forEach((target, index) => {
    const count = log[target.username] || 0;
    table.innerHTML += createRow(index + 1, target, count);
  });
};

const prepareLogModal = (log) => {
  if (log.length == 0) return;
  const logViewer = document.getElementById("logViewer");
  logViewer.innerHTML = "";
  
  log.forEach((message) => {
    const li = document.createElement("li");
    li.innerHTML = `Sent (${message.dateTime}): ` + message.text;
    logViewer.appendChild(li);
  });
  const logTitle = document.getElementById("logTitle");
  logTitle.innerHTML = `Log for ${log[0].username}`;
};

const receivedWorkerMessage = async (e) => {
  switch (e.data.type) {
    case "log":
      updateView(e.data.log, e.data.targets);
      break;
    case "messageLog":
      prepareLogModal(e.data.log);
      toggleLogModal();
      break;
    default:
      break;
  }
};

worker.onmessage = receivedWorkerMessage;
