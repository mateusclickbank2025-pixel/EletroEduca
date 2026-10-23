# EletroEduca — base inicial para Railway

Esta é uma **base inicial executável**, não uma implementação concluída de todos os requisitos do documento.

## Incluído nesta versão
- Interface web em React + Vite.
- Cena 3D com Three.js / React Three Fiber: câmera orbital, zoom e seleção de componentes.
- Demonstração visual de fios e escolha de cores.
- Biblioteca inicial de projetos.
- Página com os três preços de referência do documento.
- API Express com verificação de saúde.
- Preparação opcional para PostgreSQL e salvamento de projetos na nuvem.

## Ainda NÃO implementado
- Validação elétrica real, cálculos de circuitos, desfazer/refazer, desafios completos e montagem livre por terminais.
- Cadastro/login seguro, papéis e permissões.
- Painel funcional do proprietário, auditoria completa e relatórios financeiros.
- Integração real de pagamento, checkout, assinatura, reembolso ou webhooks.
- Testes automatizados abrangentes.

**Não cobre pagamentos reais nesta versão.** Os preços são apenas informativos. Não anuncie assinatura como ativa nem colete pagamento até implementar e testar um provedor real.

## Executar localmente
Requer Node.js 20 ou superior.

```bash
npm install
npm run dev
```

Abra a URL indicada pelo Vite, normalmente `http://localhost:5173`.

## Publicar no Railway
1. Extraia este ZIP.
2. Envie o conteúdo para um repositório GitHub seu.
3. No Railway, crie um projeto e escolha **Deploy from GitHub Repo**.
4. Selecione o repositório.
5. O Railway detectará Node.js e usará `npm run build` para build e `npm start` para iniciar.
6. Em Settings / Networking, gere um domínio público.
7. Confira `https://SEU-DOMINIO/api/health`.

## Banco PostgreSQL
1. Adicione um serviço PostgreSQL no mesmo projeto Railway.
2. Garanta que a variável `DATABASE_URL` do serviço web aponte para a variável de conexão do PostgreSQL, normalmente referenciada pelo Railway como `${{Postgres.DATABASE_URL}}` (o nome do serviço pode variar).
3. Faça novo deploy.
4. Verifique `/api/health`. O estado deve mostrar `database: "connected"`.
5. O endpoint de salvamento cria a tabela de projetos na primeira utilização. Em produção, substituir isso por migrações versionadas.

## Variáveis
- `PORT`: fornecida pelo Railway automaticamente.
- `DATABASE_URL`: conexão PostgreSQL; sem ela, a API funciona, mas salvamento em nuvem não.
- `DATABASE_SSL`: defina `false` apenas se o ambiente de banco exigir conexão sem SSL. Não altere sem entender a configuração do provedor.

## Próximas etapas recomendadas
1. Implementar autenticação, recuperação de conta e autorização no servidor.
2. Projetar modelo de dados e migrações.
3. Completar o motor de simulação elétrica e testes.
4. Escolher e integrar um provedor brasileiro de pagamento, validar webhooks e idempotência.
5. Implementar gestão de planos, assinaturas e painel do proprietário.
6. Executar testes de segurança, persistência e cobrança em ambiente de teste antes de produção.

## Segurança educacional
O laboratório é virtual e conceitual. Não use seus modelos como projeto executivo nem para energizar instalações reais.
