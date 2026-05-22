import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { prisma } from './db/client';
import { chatRoutes } from './routes/chat.routes';
import { conversationRoutes } from './routes/conversations.routes';
import { logsRoutes } from './routes/logs.routes';
import { metricsRoutes } from './routes/metrics.routes';
import { configRoutes } from './routes/config.routes';
import { env } from './config/env';
import { hasApiKey } from './providers';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { startQueueWorker } from './ingestion/eventQueue';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGINS.split(',').map((o) => o.trim()),
    credentials: true,
  })
);
app.use(express.json());
app.use(requestLogger);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/chat', chatRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/metrics', metricsRoutes);
app.use('/api/config', configRoutes);

app.use(errorHandler);

startQueueWorker();

async function start() {
  try {
    await prisma.$connect();
    console.log('Database connected');
  } catch (err) {
    console.error(
      'Database connection failed. Run: npm run dev (auto SQLite) or fix DATABASE_URL in .env'
    );
    console.error(err);
    process.exit(1);
  }

  const server = app.listen(env.PORT, () => {
    console.log(`Backend running on :${env.PORT}`);
    if (env.MOCK_LLM) {
      console.log('⚠ AI mode: MOCK (set MOCK_LLM=false + API key in .env for real answers)');
    } else if (hasApiKey('anthropic') || hasApiKey('openai') || hasApiKey('gemini')) {
      console.log('✓ AI mode: LIVE (real model responses when you chat)');
    } else {
      console.log('⚠ AI mode: MOCK — add ANTHROPIC_API_KEY, OPENAI_API_KEY, or GEMINI_API_KEY to .env');
    }
  });

  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      console.error(
        `\nPort ${env.PORT} is already in use. Another backend is still running.\n` +
          `Windows: netstat -ano | findstr :${env.PORT}  then  taskkill /PID <pid> /F\n` +
          `Or run: npm run kill-port\n`
      );
      process.exit(1);
    }
    throw err;
  });
}

start();
