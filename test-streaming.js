async function fetchStreamingResponse() {
  const response = await fetch("http://localhost:3000/ollama/stream", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "llama3.2:3b", prompt: "Tell me a joke" }),
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    console.log(decoder.decode(value, { stream: true })); // Logs streamed output
  }
}

await fetchStreamingResponse();
