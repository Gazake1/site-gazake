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

Nota: este é um protótipo — senhas são guardadas com hash (`bcryptjs`) mas não há migrações avançadas.
