# assets/videos

Pasta para vídeos locais embutidos no bundle do app.

## Vídeo de abertura (loading screen)

Coloque aqui o vídeo de abertura do app com o nome **exato**:

```
assets/videos/intro.mp4
```

O componente [`src/components/AppIntroVideo.tsx`](../../src/components/AppIntroVideo.tsx)
faz `require("../../assets/videos/intro.mp4")` — se o arquivo não existir, o
build (Metro) falhará.

### Especificação recomendada
- **Formato:** `.mp4` (H.264 + AAC) — suportado nativamente em iOS e Android
- **Orientação:** horizontal (16:9) — o app aplica `ResizeMode.COVER`, ou seja,
  o vídeo é ampliado para preencher a tela inteira do celular (corta as laterais = zoom)
- **Duração:** ~7 segundos (a abertura)
- **Áudio:** opcional — o som é reproduzido por padrão; para silenciar, altere
  `isMuted={false}` para `isMuted` em `AppIntroVideo.tsx`

### Corte do 1º segundo + fade-in
- O primeiro segundo do vídeo **não é exibido**: o componente inicia a
  reprodução em `positionMillis = 1000` (`CUT_FIRST_MS` em `AppIntroVideo.tsx`),
  então o vídeo original pode manter a parte inicial (logo/ruído) sem aparecer.
- Um **fade-in** (overlay preto que some em ~400ms) disfarça o corte, evitando
  a impressão de transição abrupta. Ajuste `CUT_FIRST_MS` e `FADE_DURATION_MS`
  em `AppIntroVideo.tsx` se precisar.
