# NF Link Studio

Site estático responsivo, inspirado no estilo preto e vermelho das capturas enviadas.

## Como abrir

1. Extraia `nf-link-studio.zip`.
2. Abra `index.html` no Chrome, Edge ou outro navegador atualizado.
3. Informe **somente um token legítimo já emitido pela Netflix para uma conta que você administra**, ou um link original da Netflix contendo `?nftoken=`.
4. Toque em **Formatar links**, depois use **Copiar** ou **Abrir** nos três formatos.

## O que o site faz

- Formata o mesmo token, informado pelo usuário, em três endereços (`/unsupported`, `/login`, `/tv2`) ilustrados nas capturas.
- Exibe botões de copiar/abrir e informações opcionais preenchidas pelo usuário.
- Mantém cota demonstrativa de 3 formatações por dia no navegador via `localStorage`.
- Funciona sem servidor, login, bibliotecas externas, APIs ou coleta de dados.
- NÃO salva o token no `localStorage`, cookies ou servidor; mantém os links apenas na memória da aba.

## Limites importantes

Este NÃO é um gerador de `nftoken` e **não cria contas, sessões ou credenciais Netflix**. Somente a Netflix pode emitir tokens reais. O painel não consulta a Netflix e não confirma validade, plano, vencimento ou compatibilidade dos links. Copiar um mesmo token entre caminhos não garante que eles funcionem. Não compartilhe tokens de acesso com pessoas não autorizadas.

As informações opcionais (e-mail, plano, validade) são somente para visualização e não são verificadas. A cota local é demonstrativa, não um controle seguro em servidor. Para hospedar, carregue os três arquivos (`index.html`, `styles.css`, `script.js`) em um serviço de hospedagem estática (ex.: GitHub Pages, Netlify ou Cloudflare Pages). Use HTTPS.
