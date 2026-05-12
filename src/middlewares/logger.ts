import morgan from 'morgan';
import { Request, Response } from 'express';

// Use 'dev' format in development for colourised, concise output.
// Use 'combined' in production for Apache-style full logs (useful for log aggregators).
const format = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';

// Skip logging for health-check routes to keep noise low
const skip = (req: Request, _res: Response): boolean =>
  req.path === '/health';

const logger = morgan(format, { skip });

export default logger;
