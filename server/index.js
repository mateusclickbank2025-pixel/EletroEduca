import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = Number(process.env.PORT || 3001);
app.use(express.json({ limit: '1mb' }));

let pool = null;
if (process.env.DATABASE_URL) {
  pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false }
  });
}

app.get('/api/health', async (_req, res) => {
  let database = 'not_configured';
  if (pool) {
    try { await pool.query('SELECT 1'); database = 'connected'; }
    catch { database = 'error'; }
  }
  res.json({ ok: true, app: 'EletroEduca', database, timestamp: new Date().toISOString() });
});

app.get('/api/plans', (_req, res) => {
  // Preços informativos iniciais; ainda não representam uma cobrança ativa.
  res.json([
    { id: 'monthly', name: 'Mensal', priceCents: 1999, durationMonths: 1, billing: 'recorrencia_pendente_configuracao' },
    { id: 'semester', name: 'Semestral', priceCents: 9990, durationMonths: 6, billing: 'pagamento_unico_pendente_configuracao' },
    { id: 'annual', name: 'Anual', priceCents: 17990, durationMonths: 12, billing: 'pagamento_unico_pendente_configuracao' }
  ]);
});

app.get('/api/projects', (_req, res) => {
  res.json([
    { id: 'battery-lamp', title: 'Pilha, interruptor e lâmpada', category: 'Iniciante', level: 'Básico', description: 'Explore um circuito simples de baixa tensão virtual.' },
    { id: 'open-closed', title: 'Circuito aberto e fechado', category: 'Iniciante', level: 'Básico', description: 'Compare o comportamento de um circuito conectado e desconectado.' },
    { id: 'series-resistors', title: 'Resistores em série', category: 'Iniciante', level: 'Intermediário', description: 'Estude conceitualmente a associação em série.' },
    { id: 'parallel-resistors', title: 'Resistores em paralelo', category: 'Iniciante', level: 'Intermediário', description: 'Explore uma associação em paralelo didática.' }
  ]);
});

app.post('/api/projects/save', async (req, res) => {
  const { name, project } = req.body || {};
  if (typeof name !== 'string' || !name.trim() || !project || typeof project !== 'object') {
    return res.status(400).json({ error: 'Informe um nome e os dados do projeto.' });
  }
  if (!pool) return res.status(503).json({ error: 'Banco de dados não configurado. Adicione PostgreSQL no Railway antes de salvar na nuvem.' });
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS saved_projects (
        id BIGSERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        project JSONB NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    const result = await pool.query(
      'INSERT INTO saved_projects (name, project) VALUES ($1, $2) RETURNING id, name, created_at',
      [name.trim().slice(0, 120), JSON.stringify(project)]
    );
    res.status(201).json(result.rows[0]);
  } catch (e) {
    console.error('save project failed', e.message);
    res.status(500).json({ error: 'Não foi possível salvar o projeto.' });
  }
});

const dist = path.resolve(__dirname, '../dist');
app.use(express.static(dist));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(dist, 'index.html'));
});

app.listen(port, '0.0.0.0', () => console.log(`EletroEduca rodando na porta ${port}`));
