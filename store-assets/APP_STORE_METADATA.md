# ZIMNY — Metadados da App Store (prontos pra colar)

> App Store Connect → ZIMNY → Distribuição → versão 1.0.1
> Tudo abaixo segue os limites de caracteres da Apple (indicados em cada campo).

---

## 1. Localizações a criar no ASC

Crie **3 localizações** na versão: **English (U.S.)**, **Portuguese (Brazil)**, **Spanish (Latin America)** — o app já tem i18n pros 3 idiomas, isso amplia alcance sem custo.

---

## 2. Nome do app (30 chars)

| Idioma | Nome |
|---|---|
| EN | `ZIMNY Magazine` |
| PT-BR | `ZIMNY Magazine` |
| ES | `ZIMNY Magazine` |

*(O registro já foi criado como "ZIMNY"; dá pra editar o nome na aba App Information — "ZIMNY Magazine" é mais descritivo e ajuda busca.)*

## 3. Subtítulo (30 chars)

| Idioma | Subtítulo |
|---|---|
| EN | `Stories. News. Community.` |
| PT-BR | `Histórias. Notícias. Comunidade.` *(31c — usar `Histórias, notícias, cultura`)* |
| ES | `Historias. Noticias. Comunidad.` |

## 4. Texto promocional (170 chars — pode mudar sem nova build)

**EN:**
```
Your community in one app. ZIMNY Magazine brings you news, events, podcasts and stories from the Brazilian community across New England — anywhere, anytime.
```

**PT-BR:**
```
Sua comunidade num só lugar. Notícias, eventos, podcasts e histórias da comunidade brasileira em New England — onde você estiver.
```

## 5. Descrição (4000 chars)

### English (U.S.)

```
ZIMNY Magazine — the voice of the Brazilian community in the United States.

Born from an unwavering purpose: to give voice, visibility, and belonging to the stories that truly matter. Founded by immigrants, ZIMNY has become one of the most modern and influential magazines in Massachusetts — combining sophisticated design, relevant content, and a deep connection with our community.

WHAT YOU FIND IN THE APP

• NEWS — Local coverage that matters to the Brazilian community in New England, updated daily from zimnymagazine.com.

• EVENTS — Galas, launches, festivals and community gatherings. See what's happening and never miss out.

• PODCAST — Exclusive interviews and real stories, produced by our editorial team.

• ZYTV — Our video channel with coverage, interviews and behind-the-scenes of everything we produce.

• MAGAZINE EDITIONS — Browse and read every published edition of the printed magazine.

• EVENT COVERAGE & GALLERIES — Professional photo galleries from the events that shape our community.

• COLUMNISTS — Voices that analyze, comment and inspire.

• SAVE YOUR FAVORITES — Bookmark any article and read it later, offline too.

• IN ENGLISH, PORTUGUESE AND SPANISH — The whole app speaks your language.

More than a magazine, ZIMNY is a movement of connection, positioning and transformation. A bridge between immigrants and their new world — where real stories gain recognition and identities are valued.

Download now and be part of it.

—
ZIMNY Media Corporation · zimnymagazine.com
```

### Português (Brasil)

```
ZIMNY Magazine — a voz da comunidade brasileira nos Estados Unidos.

Nascemos de um propósito inabalável: dar voz, visibilidade e pertencimento às histórias que realmente importam. Fundada por imigrantes, a ZIMNY se consolidou como uma das revistas mais modernas e influentes de Massachusetts — unindo design sofisticado, conteúdo relevante e conexão profunda com a nossa comunidade.

O QUE VOCÊ ENCONTRA NO APP

• NOTÍCIAS — Cobertura local que importa para a comunidade brasileira em New England, atualizada direto do zimnymagazine.com.

• EVENTOS — Galas, lançamentos, festivais e encontros. Saiba o que está acontecendo e nunca fique de fora.

• PODCAST — Entrevistas exclusivas e histórias reais, produzidas pelo nosso time editorial.

• ZYTV — Nosso canal de vídeos com coberturas, entrevistas e bastidores de tudo que produzimos.

• EDIÇÕES DA REVISTA — Folheie e leia todas as edições publicadas da revista impressa.

• COBERTURAS E GALERIAS — Galerias profissionais dos eventos que movimentam a nossa comunidade.

• COLUNISTAS — Vozes que analisam, comentam e inspiram.

• SALVE SEUS FAVORITOS — Marque artigos para ler depois, inclusive offline.

• EM PORTUGUÊS, INGLÊS E ESPANHOL — O app inteiro no seu idioma.

Mais do que uma revista, a ZIMNY é um movimento de conexão, posicionamento e transformação. Uma ponte entre o imigrante e o seu novo mundo — onde histórias reais ganham reconhecimento e identidades são valorizadas.

Baixe agora e faça parte.

—
Zimny Media Corporation · zimnymagazine.com
```

*(A descrição em espanhol segue a mesma estrutura — posso gerar se quiser incluir a terceira localização.)*

## 6. Palavras-chave (100 chars cada idioma)

**EN:** `brazilian,magazine,brazil,news,community,immigrant,portuguese,new england,boston,events`

**PT-BR:** `revista,brasileira,boston,noticias,comunidade,brasil,eventos,imigrante,new england,podcast`

## 7. URL de suporte / Marketing

- Support URL: `https://zimnymagazine.com/contato`
- Marketing URL: `https://zimnymagazine.com`
- Privacy Policy URL: **OBRIGATÓRIO** → `https://zimnymagazine.com/app-privacidade` *(página precisa existir — ver seção Privacidade abaixo)*

## 8. Copyright

`© 2026 Zimny Media Corporation`

---

# PRIVACIDADE (bloco obrigatório do questionário)

Respostas pro "App Privacy" (Privacy Nutrition Labels):

| Pergunta | Resposta |
|---|---|
| O app coleta dados vinculados à identidade? | **Não** (login é mock/local; favoritos ficam só no device) |
| Dados usados para rastreamento (tracking)? | **Não** |
| Dados coletados mas não vinculados? | **Analytics de uso** apenas se houver SDK de analytics — hoje não há; responder "No data collected" é o mais seguro |

⚠️ **Antes do submit**: criar a página `https://zimnymagazine.com/app-privacidade` (posso escrever o HTML — me confirma se sobe por FTP ou crio no WordPress). Sem essa URL a Apple bloqueia o submit.

---

# SCREENSHOTS (obrigatório: 6.7" e 5.5", ou só 6.7")

**Como capturar rápido (método simulador):**
1. No terminal: `npx expo start` → pressionar `i` (abre simulador iPhone)
2. Em cada tela: `Cmd+S` salva screenshot no Desktop do Mac... *ou*, como estamos no Windows:
2b. Rodar o app num iPhone real via **Expo Go**, tirar prints nativos (botão lateral + volume up)
3. Enviar os PNGs aqui no chat que eu recorto, redimensiono pra 1290×2796 (6.7") e monto as versões com moldura

**Roteiro das telas (ordem recomendada — conta uma história):**

| # | Tela | Por quê |
|---|---|---|
| 1 | Home com destaque editorial | primeira impressão: conteúdo premium |
| 2 | Matéria aberta (leitura) | mostra experiência de leitura limpa |
| 3 | Eventos/coberturas | prova de movimento e comunidade |
| 4 | Galeria de fotos de evento | visual forte, glamour |
| 5 | Podcast/ZYTV | multimídia |
| 6 | Perfil/favoritos | utilidade pessoal |

Mínimo exigido: **1 screenshot por tamanho**; recomendado 4–6.

---

# CHECKLIST FINAL DO SUBMIT

- [ ] 3 localizações criadas + textos colados
- [ ] Screenshots 6.7" enviados (mínimo 1, ideal 6)
- [ ] Página de privacidade no ar (`/app-privacidade`)
- [ ] Questionário App Privacy respondido ("No data collected")
- [ ] Classificação etária: questionnaire → provavelmente **4+** (conteúdo jornalístico não altera)
- [ ] Age rating declarado, copyright e URLs preenchidos
- [ ] Build 7 selecionada na versão 1.0.1
- [ ] **Submit for Review** (aperta tu!)
