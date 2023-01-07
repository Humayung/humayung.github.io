// Description: This script is used to connect to the Diffusion API and send a prompt to the model. It also receives the output from the model and displays it on the page.

window.onload = () => {
  document.getElementById("submit").onclick = () => {
    // return if no prompt is entered
    if (document.getElementById("prompt").value == "") {
      return;
    }
    prompt = document.getElementById("prompt").value;
    // inform the status
    document.getElementById("status").innerHTML = "Processing...";
    createNewRequest(prompt);
  };
};
const showOutputs = (data) => {
  // showOutputs outputs on image elements by classname
  let outputImages = document.getElementsByClassName("output-image");
  // console.log(data['0'])
  for (let i = 0; i < data.length; i++) {
    console.log(data[i]);
    outputImages[i].src = data[i];
  }
  // inform the status
  document.getElementById("status").innerHTML = "Done!";
};

const createNewRequest = (prompt) => {
  let socket = new WebSocket(
    "wss://stabilityai-stable-diffusion-1.hf.space/queue/join"
  );

  socket.addEventListener("message", (event) => {
    let message = event.data;
    let parsedMessage = JSON.parse(message);
    switch (parsedMessage.msg) {
      case "send_hash":
        socket.send('{ "session_hash": "rgmb2v00k6", "fn_index": 2 }');
        break;
      case "send_data":
        socket.send(
          `{ "fn_index":2, "data": ["${prompt}"], "session_hash": "rgmb2v00k6" }`
        );
        break;
      case "process_completed":
        showOutputs(parsedMessage.output.data["0"]);
        break;
    }
  });
};
