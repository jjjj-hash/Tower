# Instagram Limpo

Filtro pessoal para usar o Instagram no iPhone **sem Reels, sem publicidade, sem sugestões e sem Explorar**,
vendo só as contas que segues. Uso privado.

## O que é (e o que não é)

- É **um ficheiro** (`instagram-limpo.user.js`) que corre no Safari, através da app gratuita
  **Userscripts**, sempre que abres o instagram.com.
- **Esconde** coisas no teu ecrã. Não muda nada na tua conta, não envia dados para lado nenhum
  e não vê a tua palavra-passe: fazes login na página do próprio Instagram.
- **Não é** uma app da App Store nem uma versão modificada do Instagram.

| Fica | Desaparece |
|---|---|
| Feed de quem segues ("A seguir") | Separador Reels, Reels no feed e nos perfis |
| Stories de quem segues | Publicações e stories "Patrocinado" |
| Mensagens (os Reels enviados por mensagem continuam a abrir) | "Sugestões para ti" e publicações de quem não segues |
| Publicar, comentar, gostar, pesquisar contas | Grelha do Explorar |

## Segurança e legalidade (resumo)

- **Userscripts:** app gratuita da App Store, de código aberto (GPL-3.0). A ficha da loja declara que não recolhe dados.
  Dá-lhe autorização **só para instagram.com** e, mesmo no pior cenário, ela não toca noutros sites.
- **Este filtro:** é curto, legível e não faz ligações à internet. Podes pedir a qualquer pessoa que o reveja.
- **Conta do Instagram:** o risco é baixo. Para o Instagram, és um Safari normal. Os termos do Instagram não gostam de
  modificações, mas esconder elementos no teu ecrã é comparável a um bloqueador de anúncios.
  A consequência realista de uma violação dos termos é a suspensão da conta, e não um problema criminal.
- **Portugal/UE:** não se conhece lei que proíba bloquear publicidade no teu próprio dispositivo para uso pessoal.
  Isto é orientação, não parecer jurídico.
- **Não distribuir:** é para uso pessoal. Não publiques isto como app nem uses o nome ou a marca Instagram.
- Ativa a **verificação em dois passos** no Instagram (boa prática de qualquer forma).

---

## Instalação no iPhone (≈ 10 minutos)

> Os nomes dos menus podem variar ligeiramente consoante a versão do iOS. Se algo não bater certo, manda-me uma captura de ecrã.

### 1. Instalar a Userscripts
1. Abre a App Store e procura **Userscripts** (programador: Justin Wasack). É gratuita.
2. Instala-a.

### 2. Escolher a pasta dos filtros
1. Abre a app **Userscripts**.
2. Toca na opção para escolher ou mudar a pasta dos scripts.
3. Escolhe ou cria uma pasta, por exemplo **iCloud Drive → Userscripts** ou **No meu iPhone → Userscripts**.

### 3. Pôr o ficheiro `instagram-limpo.user.js` nessa pasta
Escolhe uma das formas:
- **Por link (o repositório é público):** no Safari do iPhone abre
  `https://raw.githubusercontent.com/jjjj-hash/Tower/claude/instagram-app-no-reels-bumr83/instagram-limpo.user.js`.
  Com a extensão já ativa (passo 4), abre o menu das extensões → **Userscripts**, e deve aparecer a opção de instalar o script.
  Se não aparecer, usa uma das formas abaixo.
- **Pela conversa com o Claude:** abre o ficheiro `instagram-limpo.user.js` que te enviei, toca em
  partilhar → **Guardar em Ficheiros** → escolhe a pasta do passo 2.
- **Pelo GitHub:** abre o ficheiro no repositório, no Safari. Mantém o dedo no botão **Raw** →
  **Descarregar ficheiro ligado**. Depois, na app **Ficheiros**, move-o de *Descargas* para a pasta do passo 2.

Confirma que o nome termina em **`.user.js`** (e não em `.txt`).

### 4. Ativar a extensão no Safari, só para o Instagram
1. **Definições → Apps → Safari → Extensões** (em versões mais antigas: **Definições → Safari → Extensões**).
2. Ativa a **Userscripts**.
3. Em **Outros sites** escolhe **Negar** (ou **Perguntar**).
4. Abre o Safari, vai a **instagram.com** e abre o menu da página (o botão **"aA"** ou **"…"** ao lado do endereço,
   conforme a versão) → **Userscripts** → **Permitir sempre neste site**.

### 5. Testar no Safari
1. Em **instagram.com**, inicia sessão normalmente.
2. Deves ver no topo, durante uns segundos, o aviso **"🧹 Filtro ativo"**.
3. Confirma que o botão dos Reels desapareceu da barra de baixo.

Se o aviso não aparecer, ainda não está a funcionar. Revê os passos 3 e 4 ou manda-me uma captura de ecrã.

---

## Ícone no ecrã principal (teste do ecrã inteiro)

Não está confirmado que as extensões do Safari funcionam quando o site abre como "Web App" (ecrã inteiro).
Por isso é preciso testar.

### Se tens iOS 26
1. No Safari, em instagram.com: **Partilhar → Adicionar ao ecrã principal**.
2. Deixa **ativada** a opção **"Abrir como Web App"** e confirma.
3. Abre o ícone novo. **A web app tem a sessão separada do Safari, por isso vais ter de iniciar sessão outra vez.**
4. Procura o aviso **"🧹 Filtro ativo"**:
   - **Aparece e os Reels sumiram** → o ecrã inteiro funciona. Está feito. 🎉
   - **Não aparece** → apaga o ícone e repete o passo 1 com **"Abrir como Web App" desativado**.
     O ícone passa a abrir no Safari (com a barra de endereço), e aí o filtro funciona.

### Se tens iOS 18 ou anterior (ou não sabes)
1. Tenta o mesmo: **Partilhar → Adicionar ao ecrã principal**, e abre o ícone.
2. Se o aviso não aparecer, usa a app **Atalhos**:
   **+** → **Adicionar ação** → **Abrir URL** → `https://www.instagram.com/?variant=following`
   → toca no nome do atalho → **Adicionar ao ecrã principal**. O ícone abre o Instagram no Safari, já com o filtro.

### A app oficial do Instagram
Se a app oficial estiver instalada, alguns links (incluindo o atalho) podem abri-la em vez do Safari, e lá os Reels
e a publicidade continuam todos. Se queres mesmo largar os Reels, o mais eficaz é **apagar a app oficial**.

Se o ecrã inteiro não funcionar e não aceitares a barra do Safari, a alternativa é uma app própria, que precisa de Mac.
Ver `PLANO.md`.

---

## Configuração

No topo do ficheiro `instagram-limpo.user.js` há uma lista de opções `true`/`false`:

| Opção | O que faz |
|---|---|
| `esconderReels` | Separador Reels, Reels no feed e separador Reels dos perfis |
| `reelsNasMensagens` | `true` = Reels enviados por mensagem continuam a abrir |
| `esconderPublicidade` | Publicações e stories "Patrocinado" |
| `esconderSugestoes` | "Sugestões para ti" e publicações de contas que não segues |
| `esconderExplorar` | Grelha do Explorar |
| `permitirPesquisa` | Mantém a pesquisa de contas |
| `feedSoQuemSigo` | Abre sempre o feed "A seguir" |
| `mostrarIndicador` | Aviso "Filtro ativo" ao abrir |

## Quando alguma coisa escapar ao filtro

O Instagram muda o site com frequência, por isso algumas vezes por ano o filtro vai precisar de ajustes.
Quando vires um Reel, um anúncio ou uma sugestão que devia estar escondido:
1. Tira uma **captura de ecrã**.
2. Diz-me **onde** estavas (feed, perfil, stories, mensagens) e **o que** escapou.
3. Eu ajusto o filtro e substituis o ficheiro na pasta da Userscripts.

## Limites conhecidos

- **Não foi testado com uma conta real.** A primeira versão baseia-se em marcas da página que costumam mudar pouco.
  Os testes automáticos usam um Instagram simulado e validam a lógica, mas não a página real.
- Desde 2022 quase todos os vídeos são Reels. **Os vídeos das contas que segues também desaparecem do feed.**
  Para os voltares a ver, muda `esconderReels` para `false` (mas aí voltam todos os Reels).
- Publicações em colaboração com uma conta que não segues podem ser escondidas por engano.
- Nas stories, um anúncio fica tapado por um ecrã preto. Toca à direita para avançar.
- Se o Instagram deixar de respeitar o feed "A seguir", o filtro deixa de redirecionar, mas continua a
  esconder as sugestões.
- Notificações push: provavelmente não vais ter. Vê as notificações quando abres.

## Para programadores: testes

```bash
node test/run-tests.js
```

Usa o Playwright para abrir `test/mock-instagram.html` (um Instagram simulado) com o filtro e verifica o que fica
visível ou escondido.
