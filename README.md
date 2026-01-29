# Gazake Bots — Protótipo

Pequeno protótipo com 3 telas: `index.html`, `login.html`, `signup.html`.

Para abrir localmente, abra `index.html` no navegador ou rode um servidor simples (recomendado):

```powershell
python -m http.server 8000
```

Depois acesse http://localhost:8000

Ou rode com Node.js (recomendado para sessão e APIs):

```powershell
npm install
npm start
```

Depois acesse http://localhost:3000

Banco de dados:
- O servidor criará `database.sqlite` na raiz do projeto automaticamente.
- Para limpar os dados, remova o arquivo `database.sqlite`.

Nota: este é um protótipo — senhas são armazenadas com hash, mas não há migrações avançadas nem backups.
