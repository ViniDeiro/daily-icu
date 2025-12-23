import app from "../src/app";
import serverless from "serverless-http";

const handler = serverless(app, {
  request: (req: any) => {
    if (typeof req.url === "string" && req.url.startsWith("/api")) {
      const next = req.url.replace(/^\/api/, "");
      req.url = next.length ? next : "/";
    }
  }
});

export default handler;

