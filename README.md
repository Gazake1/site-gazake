# Gazake Bots — Protótipo

Protótipo com telas `index.html`, `login.html`, `signup.html` e servidor Node.js com SQLite para persistência.

Rodar localmente (Node.js):

```powershell
cd "c:\Users\tanji\OneDrive\Desktop\meu-site-login"
npm install
npm start
```

Abra http://localhost:3000

Banco de dados:
- `database.sqlite` será criado na raiz para usuários.
- `sessions.sqlite` será criado para armazenar sessões (persistem entre reinícios do servidor).

Admin debugging
- Crie uma variável `ADMIN_KEY` no painel com uma chave forte.
- Use o endpoint protegido `GET /admin/users` para listar usuários (retorna `id`, `name`, `email`).
- Autentique enviando o header `x-admin-key: <ADMIN_KEY>` ou `Authorization: Bearer <ADMIN_KEY>`.

`.env.example`
- Há um arquivo `.env.example` incluído com as variáveis recomendadas; copie para `.env` e ajuste conforme necessário.

Deploy no Easy Panel
- Certifique-se de apontar para a pasta do projeto e definir as variáveis de ambiente no painel:
	- `PORT` (opcional, padrão 3000)
	- `SESS_DB` (opcional, padrão `sessions.sqlite`)
	- `USERS_DB` (opcional, padrão `database.sqlite`)
	- `SESSION_SECRET` (defina um valor secreto em produção)
	- `TRUST_PROXY` = `1` se o painel usar proxy reverso (recomendado)
	- `COOKIE_SECURE` = `1` se sua app estiver atrás de HTTPS (recomendado em produção)

- O `Procfile` incluído (`web: node server.js`) facilita a inicialização em painéis que suportam Procfile. Caso o painel peça um comando de start, use `npm start`.

Nota: este é um protótipo — senhas são guardadas com hash (`bcryptjs`) mas não há migrações avançadas.
