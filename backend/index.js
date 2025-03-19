import cors from 'cors';
import cookieParser from 'cookie-parser';
import { configureSecurityMiddleware } from './middleware/securityMiddleware.js';

// ... existing code ...

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurar CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Aplicar medidas de seguridad
configureSecurityMiddleware(app);

// ... existing code ... 