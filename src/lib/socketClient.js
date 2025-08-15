
let socket = null;

export const connectWebSocket = (userId, onMessage) => {
  if (socket || !userId) return;

  socket = new WebSocket(`wss://livechat-back-end.vercel.app/?userId=${userId}`);

  socket.onopen = () => {
    console.log("WebSocket connected");
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.type === "newMessage" && onMessage) {
        onMessage(data.message);
      }
    } catch (err) {
      console.error("Invalid WS message", err);
    }
  };

  socket.onclose = () => {
    console.log("WebSocket disconnected");
    socket = null;
  };

  socket.onerror = (err) => {
    console.error("WebSocket error:", err);
  };
};


export const sendWebSocketMessage = (data) => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(data));
  }
};

export const disconnectWebSocket = () => {
  if (socket) {
    socket.close();
    socket = null;
  }
};
