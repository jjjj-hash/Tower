# Instagram Limpo — plano (uso pessoal)

Estado: **filtro v0.1.0 instalado e a funcionar no iPhone.** O modo Web App (ecrã inteiro) não corre extensões.
O browser predefinido é o Brave, por isso o ícone do ecrã principal é um atalho (app Atalhos → "Abrir URL"
`x-safari-https://www.instagram.com/?variant=following`) que obriga a abrir no Safari. Está testado e funciona.
Falta acompanhar uns dias para ver o que escapa ao filtro.

## Objetivo
Usar o Instagram no iPhone sem Reels, sem publicidade, sem sugestões e sem Explorar,
vendo só as contas que sigo. Uso privado, não é para distribuir.

## Decisões
- **Abordagem:** uma camada sobre o site oficial (instagram.com). O Instagram mostra a página e
  um filtro esconde o que não se quer. Não se usa a API não oficial nem um servidor intermediário,
  por causa do risco de bloqueio da conta e porque a palavra-passe passaria por terceiros.
- **Dispositivo:** iPhone, versão do iOS por confirmar. As instruções cobrem o iOS 26 e versões anteriores.
- **Onde corre o filtro:** a app gratuita **Userscripts** (Safari, código aberto GPL-3.0), com
  autorização **só para instagram.com**.
- **Ícone no ecrã principal:** o utilizador quer **ecrã inteiro**. Ainda não está confirmado que a
  extensão funciona no modo "Web App". Primeiro testa-se e, se não funcionar, decide-se entre:
  abrir no Safari (com barra de endereço) ou uma app própria (precisa de Mac e de reinstalar a cada 7 dias
  ou pagar cerca de 99 €/ano à Apple).

## O filtro tem de
- Esconder: separador Reels, Reels no feed, separador Reels nos perfis, bloquear /reels/.
- **Mostrar** os Reels enviados por mensagem (DM).
- Esconder publicações e stories "Patrocinado".
- Esconder "Sugestões para ti" e publicações de contas que não sigo.
- Esconder a grelha do Explorar e manter a pesquisa de contas.
- Abrir sempre o feed "A seguir" (/?variant=following), com proteção contra ciclos de redirecionamento.
- Manter: feed de quem sigo, Stories, Mensagens, publicar, comentar e gostar.
- Mostrar o aviso "Filtro ativo" durante uns segundos, que serve para testar o modo ecrã inteiro.

## Limites (já explicados ao utilizador)
- Não consigo testar com a conta real. A primeira versão baseia-se em marcas estáveis da página
  e depois ajusta-se com capturas de ecrã.
- O Instagram muda o site com frequência, por isso o filtro vai precisar de manutenção ocasional.
- Desde 2022 quase todos os vídeos são Reels, por isso os vídeos de amigos também desaparecem do feed.
  Fica uma opção para mudar isso.
- Se a app oficial estiver instalada, os links podem abri-la em vez do Safari.

## Próximos passos
1. ~~Escrever `instagram-limpo.user.js`~~ (feito)
2. ~~Testes automáticos num Instagram simulado~~ (feito: `node test/run-tests.js`)
3. ~~README com as instruções para o iPhone~~ (feito)
4. ~~Teste no iPhone real~~ (funciona no Safari; no modo Web App não funciona; escolhido o ícone a abrir no Safari)
5. Ajustar o filtro a partir das capturas de ecrã do que escapar.
6. ~~Repositório público ou privado~~ (decidido: público)
