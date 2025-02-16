// src/index.ts
import express, {
  ErrorRequestHandler,
  Express,
  Request,
  Response,
} from "express";
import dotenv from "dotenv";
import { createOllama } from "ollama-ai-provider";
import { generateText, streamText } from "ai";
import axios from "axios";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const OLLAMA_HOST = process.env.OLLAMA_HOST || "http://localhost:11434";
const fallbackModel = process.env.OLLAMA_DEFAULT_MODEL || "llama3.2:3b";

const ollama = createOllama({
  baseURL: OLLAMA_HOST,
});

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

// Standard endpoint (non-streaming)
app.post("/ollama", async (req, res): Promise<void> => {
  const { model, prompt } = req.body;

  if (!prompt) {
    res.status(400).json({ error: "Missing 'prompt'" });
  }
  console.log(
    "Prompt: ",
    JSON.stringify({
      model: model || fallbackModel,
      prompt: prompt,
    })
  );

  try {
    const response = await fetch(`${OLLAMA_HOST}/api/generate`, {
      body: JSON.stringify({
        model: model || fallbackModel,
        prompt: prompt,
        stream: false,
      }),
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log(response);

    const data = await response.json();
    console.log(data?.response);
    res.json({ response: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Streaming endpoint
app.post("/ollama/stream", async (req, res): Promise<void> => {
  const { model, prompt } = req.body;

  if (!prompt) {
    res.status(400).json({ error: "Missing 'prompt'" });
    return;
  }

  res.setHeader("Content-Type", "text/plain"); // Streaming text
  res.setHeader("Transfer-Encoding", "chunked"); // Enable streaming

  try {
    const response = await fetch(`${OLLAMA_HOST}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model || fallbackModel,
        prompt,
        stream: true,
      }),
    });

    if (!response.body) {
      throw new Error("Response body is null");
    }

    const reader = response.body.getReader();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const text = new TextDecoder().decode(value);
      res.write(text);
    }

    res.end();
  } catch (error: any) {
    res.write(`Error: ${error.message}`);
    res.end();
  }
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
