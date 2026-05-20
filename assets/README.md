# assets/

## reel-music.mp3

Traccia musicale di sottofondo per il Reel Instagram generato da `npm run reel`.

**Come aggiungere la musica:**
1. Scarica un brano royalty-free (30-60 secondi di loop bastano)
   - [Pixabay Music](https://pixabay.com/music/) — gratuito, no attribution
   - [YouTube Audio Library](https://studio.youtube.com/channel/UCxxxxxx/music) — gratuito
2. Rinomina il file in `reel-music.mp3`
3. Mettilo in questa cartella (`assets/reel-music.mp3`)
4. Committa nel repo: `git add assets/reel-music.mp3 && git commit -m "add reel music"`
5. Aggiungi il secret su GitHub Actions se non già presente

Il file viene usato automaticamente dalla GitHub Action ogni mattina.
Se non presente, il reel viene generato ugualmente ma senza audio.
