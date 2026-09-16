/* ===========================================================================
   Save editor copy — translation data only, no logic.

   Kept next to the tool rather than in web/js/i18n/dictionary.js so the home
   page does not download ~120 keys it will never render. page.js merges the
   two dictionaries for this page. Every key is prefixed "yl" so a merge can
   never shadow a site-wide key.

   Keys ending in "Msg" are the body paragraph of the matching title, which is
   what editor-format.js assumes when it derives bodyKey from titleKey.

   Town names are proper nouns and read the same in both languages; they are
   still listed twice, because the key-parity test is what stops a half-added
   language from silently blanking a chip.
   =========================================================================== */

export const EDITOR_DICT = {
  en: {
    // hero
    ylHeroLead:
      "A browser save editor for Pokémon Yellow Legacy, covering the trainer block: your name, trainer ID, money, Game Corner coins, gym badges and the towns Fly can reach. Drop a save in, change what you need, download it back. The checksum is repaired for you.",
    ylPrivacy: "Your save never leaves this tab. Everything runs in your browser, no upload, no server.",

    // dropzone
    ylDropTitle: "DROP YOUR .SAV HERE",
    ylDropHint: "A raw 32,768-byte save from Pokémon Yellow Legacy. Nothing is uploaded.",
    ylDropButton: "Choose a file",
    ylDropLabel: "Choose a Pokémon Yellow Legacy save file, or drop one here",

    // form
    ylPlayerData: "PLAYER DATA",
    ylFieldName: "TRAINER NAME (OT)",
    ylFieldId: "TRAINER ID",
    ylFieldMoney: "MONEY (₽)",
    ylFieldCoins: "GAME CORNER COINS",
    ylRollId: "Roll a random ID",
    ylIdHint: "0 – 65535 · shown as the ID on your trainer card",
    ylNameHint: "{left} characters left · over 7 can overflow in-game text boxes",
    ylMoneyHint: "max 999,999",
    ylCoinsHint: "max 9,999",

    // badges + fly
    ylBadgesTitle: "GYM BADGES",
    ylBadgeCount: "{n} of 8",
    ylFlyTitle: "FLY DESTINATIONS",
    ylTownCount: "{n} of 11",
    ylFlyNote:
      "Fly only lists towns you have visited. Ticking a town here makes it selectable on the town map. You still need the HM and a Pokémon that can learn it.",
    ylAll: "All",
    ylNone: "None",
    ylBadgeBoulder: "Boulder",
    ylBadgeCascade: "Cascade",
    ylBadgeThunder: "Thunder",
    ylBadgeRainbow: "Rainbow",
    ylBadgeSoul: "Soul",
    ylBadgeMarsh: "Marsh",
    ylBadgeVolcano: "Volcano",
    ylBadgeEarth: "Earth",
    ylTownPallet: "Pallet Town",
    ylTownViridian: "Viridian City",
    ylTownPewter: "Pewter City",
    ylTownCerulean: "Cerulean City",
    ylTownLavender: "Lavender Town",
    ylTownVermilion: "Vermilion City",
    ylTownCeladon: "Celadon City",
    ylTownFuchsia: "Fuchsia City",
    ylTownCinnabar: "Cinnabar Island",
    ylTownIndigo: "Indigo Plateau",
    ylTownSaffron: "Saffron City",

    // pending changes
    ylDiffTitle: "PENDING CHANGES",
    ylDiffNone: "none",
    ylDiffName: "Trainer name",
    ylDiffId: "Trainer ID",
    ylDiffMoney: "Money",
    ylDiffCoins: "Coins",
    ylDiffBadges: "Badges",
    ylDiffTowns: "Towns visited",
    ylDiffCaption: "Every field that differs from the loaded file, with the offset it will be written to.",
    ylColOffset: "OFFSET",
    ylColField: "FIELD",
    ylColChange: "CHANGE",

    // actions
    ylBtnDownload: "Download edited save",
    ylBtnRevert: "Revert changes",
    ylBtnAnother: "Load another save",
    ylHintIdle: "Load a save to start editing.",
    ylHintClean: "Nothing to revert — the draft matches the file.",

    // side panel
    ylStateTitle: "SAVE STATE",
    ylChecksumLabel: "CHECKSUM",
    ylLoadedLabel: "LOADED TRAINER",
    ylChecksumOk: "VALID",
    ylChecksumBad: "MISMATCH",
    ylChecksumOkNote: "Stored byte matches the computed sum.",
    ylChecksumBadNote: 'This save would show "file data is destroyed". Downloading from here repairs it.',
    ylReqTitle: "REQUIREMENTS",
    ylReq1: "A save from Pokémon Yellow Legacy (any version)",
    ylReq2: "A raw .sav file of exactly 32,768 bytes",
    ylReq3: "Not supported: vanilla Red/Blue/Yellow, save states (.st, .sgm, .ss1), archives, Gen 2 saves",

    // status + notices
    ylStatusIdle: "WAITING FOR FILE",
    ylStatusLoaded: "SAVE LOADED",
    ylStatusEdited: "UNSAVED EDITS",
    ylStatusError: "REFUSED",
    ylOkTitle: "Edited save downloaded",
    ylOkMsg: "Keep the original as a backup, then put the edited file where your save lives.",
    ylErrBadSize: "Bad file size",
    ylErrBadSizeMsg: "Expected a 32,768-byte .sav file. Save states and archives will not work.",
    ylErrNotYellowLegacy: "Not a Yellow Legacy save",
    ylErrNotYellowLegacyMsg:
      "The trainer block does not read as Yellow Legacy data. Only Pokémon Yellow Legacy save files are supported.",
    ylErrVanilla: "That is an official Gen 1 save",
    ylErrVanillaMsg:
      "This looks like vanilla Red, Blue or Yellow. Yellow Legacy keeps money, badges and coins 78 bytes further along, so editing it here would write to the wrong place. Use PKHeX for the official games.",
    ylErrRead: "Could not read the file",
    ylErrReadMsg: "Your browser could not read that file. Try selecting it again.",
    ylErrLib: "Editor core did not load",
    ylErrLibMsg: "Reload the page. If it keeps failing, the tool cannot run from a local file:// path.",
    ylErrWrite: "Could not write the save",
    ylErrWriteMsg: "Nothing was downloaded and your loaded file is unchanged.",

    // how to use
    ylHowEyebrow: "HOW TO USE ▸ 4 STEPS",
    ylHowTitle: "From save file to edited trainer",
    ylStep1Title: "Get your save file",
    ylStep1Body:
      "On an emulator the .sav sits next to your ROM (mGBA, BGB, SameBoy). On a flash cart or real cartridge, dump it with a GB Operator, GBxCart RW or similar.",
    ylStep2Title: "Drop it in",
    ylStep2Body:
      "The file is read locally and checked: exact size, a readable trainer and rival name, a sane bag and valid BCD wallet fields. The checksum is reported, not enforced, and a broken one gets fixed on the way out.",
    ylStep3Title: "Edit the player block",
    ylStep3Body:
      "Name, ID, money, coins, the eight badge bits and the eleven town-visited bits. Every pending change is listed with its offset before you download anything.",
    ylStep4Title: "Put it back",
    ylStep4Body:
      'Download the edited file, keep your original as a backup, and swap it in. Next boot the game loads it without the "file data is destroyed" screen.',

    // under the hood
    ylWhyEyebrow: "WHY THIS EXISTS",
    ylWhyTitle: "Built for Yellow Legacy, not for vanilla",
    ylWhyP1:
      "PKHeX is excellent, but it targets the official games. A romhack save is not what it was written for, and Yellow Legacy genuinely moves things: its bag holds 59 items instead of 20, which pushes money, badges, the trainer ID and coins 78 bytes further into the file. Point a vanilla editor at one and it writes confidently to the wrong address.",
    ylWhyP2:
      "So these offsets were derived from the Yellow Legacy source itself — assembled and linked to a symbol file, not copied from a Gen 1 reference. Right now it covers the player block. The goal is the kind of coverage you would expect from PKHeX: party and box Pokémon, items and the rest, added one verified field at a time rather than all at once and half-checked.",
    ylBytesEyebrow: "UNDER THE HOOD",
    ylBytesLead: "Every byte this editor can touch, and nothing else:",
    ylBytesWhat: "WHAT IT IS",
    ylBytesFormat: "FORMAT",
    ylRow1: "player name (Gen 1 text)",
    ylRow2: "money, 3 bytes BCD",
    ylRow3: "badges, bit 0 = Boulder",
    ylRow4: "trainer ID",
    ylRow5: "Game Corner coins",
    ylRow6: "towns visited (Fly)",
    ylRow7: "bank 1 checksum",
    ylBytesFoot:
      "The four gold offsets are the ones Yellow Legacy shifts; the towns, the gym mirror and the checksum sit where vanilla keeps them, because the hack reclaims 78 bytes of filler further down. The badge mask is also mirrored to 0x29D6 (wBeatGymFlags), which the game reads for gym statues and NPC text. Box banks 2 and 3 and their checksums are never touched.",

    // faq
    ylFaqEyebrow: "GOOD TO KNOW",
    ylFaq1Q: "Will this corrupt my save?",
    ylFaq1A:
      "It writes six fields and one checksum byte, nothing else. Still: the download is a separate file, so keep your original until you have booted the edited one.",
    ylFaq2Q: "Does it work on vanilla Yellow, Red or Blue?",
    ylFaq2A:
      "No, and it refuses them on purpose rather than quietly writing to the wrong offsets. For the official games use PKHeX, which is built and tested for them.",
    ylFaq3Q: "Why is my checksum already wrong?",
    ylFaq3A:
      'Usually because another tool edited the save and did not fix it, or the dump is partial. This editor recomputes it on download either way, which repairs the "file data is destroyed" screen.',

    ylFooterLegal:
      "Fan tool · Pokémon © Nintendo/Creatures/GAME FREAK. Yellow Legacy is a fan romhack. Not affiliated. Runs entirely in your browser, no file is uploaded."
  },

  pt: {
    ylHeroLead:
      "Um editor de save no navegador para Pokémon Yellow Legacy, cobrindo o bloco do treinador: nome, ID, dinheiro, fichas do Game Corner, insígnias e as cidades que o Fly alcança. Solte o save, mude o que precisa, baixe de volta. O checksum é corrigido pra você.",
    ylPrivacy: "Seu save nunca sai desta aba. Tudo roda no seu navegador, sem upload, sem servidor.",

    ylDropTitle: "ARRASTE SEU .SAV AQUI",
    ylDropHint: "Um save bruto de 32.768 bytes de Pokémon Yellow Legacy. Nada é enviado.",
    ylDropButton: "Escolher arquivo",
    ylDropLabel: "Escolha um save de Pokémon Yellow Legacy, ou solte um aqui",

    ylPlayerData: "DADOS DO JOGADOR",
    ylFieldName: "NOME DO TREINADOR (OT)",
    ylFieldId: "ID DO TREINADOR",
    ylFieldMoney: "DINHEIRO (₽)",
    ylFieldCoins: "FICHAS DO GAME CORNER",
    ylRollId: "Sortear um ID",
    ylIdHint: "0 – 65535 · é o ID que aparece no seu cartão",
    ylNameHint: "{left} caracteres restantes · acima de 7 pode estourar as caixas de texto do jogo",
    ylMoneyHint: "máx. 999.999",
    ylCoinsHint: "máx. 9.999",

    ylBadgesTitle: "INSÍGNIAS",
    ylBadgeCount: "{n} de 8",
    ylFlyTitle: "DESTINOS DE FLY",
    ylTownCount: "{n} de 11",
    ylFlyNote:
      "O Fly só lista cidades que você já visitou. Marcar aqui deixa a cidade selecionável no mapa. Você ainda precisa do HM e de um Pokémon que o aprenda.",
    ylAll: "Todas",
    ylNone: "Nenhuma",
    ylBadgeBoulder: "Pedra",
    ylBadgeCascade: "Cascata",
    ylBadgeThunder: "Trovão",
    ylBadgeRainbow: "Arco-íris",
    ylBadgeSoul: "Alma",
    ylBadgeMarsh: "Pântano",
    ylBadgeVolcano: "Vulcão",
    ylBadgeEarth: "Terra",
    ylTownPallet: "Pallet Town",
    ylTownViridian: "Viridian City",
    ylTownPewter: "Pewter City",
    ylTownCerulean: "Cerulean City",
    ylTownLavender: "Lavender Town",
    ylTownVermilion: "Vermilion City",
    ylTownCeladon: "Celadon City",
    ylTownFuchsia: "Fuchsia City",
    ylTownCinnabar: "Cinnabar Island",
    ylTownIndigo: "Indigo Plateau",
    ylTownSaffron: "Saffron City",

    ylDiffTitle: "MUDANÇAS PENDENTES",
    ylDiffNone: "nenhuma",
    ylDiffName: "Nome do treinador",
    ylDiffId: "ID do treinador",
    ylDiffMoney: "Dinheiro",
    ylDiffCoins: "Fichas",
    ylDiffBadges: "Insígnias",
    ylDiffTowns: "Cidades visitadas",
    ylDiffCaption: "Todo campo diferente do arquivo carregado, com o offset onde será escrito.",
    ylColOffset: "OFFSET",
    ylColField: "CAMPO",
    ylColChange: "MUDANÇA",

    ylBtnDownload: "Baixar save editado",
    ylBtnRevert: "Desfazer mudanças",
    ylBtnAnother: "Carregar outro save",
    ylHintIdle: "Carregue um save para começar a editar.",
    ylHintClean: "Nada para desfazer — o rascunho está igual ao arquivo.",

    ylStateTitle: "ESTADO DO SAVE",
    ylChecksumLabel: "CHECKSUM",
    ylLoadedLabel: "TREINADOR CARREGADO",
    ylChecksumOk: "VÁLIDO",
    ylChecksumBad: "DIVERGENTE",
    ylChecksumOkNote: "O byte salvo bate com a soma calculada.",
    ylChecksumBadNote: 'Este save mostraria "file data is destroyed". Baixar por aqui corrige.',
    ylReqTitle: "REQUISITOS",
    ylReq1: "Um save de Pokémon Yellow Legacy (qualquer versão)",
    ylReq2: "Um .sav bruto de exatamente 32.768 bytes",
    ylReq3:
      "Sem suporte: Red/Blue/Yellow originais, save states (.st, .sgm, .ss1), arquivos compactados, saves de Gen 2",

    ylStatusIdle: "AGUARDANDO ARQUIVO",
    ylStatusLoaded: "SAVE CARREGADO",
    ylStatusEdited: "EDIÇÕES PENDENTES",
    ylStatusError: "RECUSADO",
    ylOkTitle: "Save editado baixado",
    ylOkMsg: "Guarde o original como backup e coloque o arquivo editado no lugar do seu save.",
    ylErrBadSize: "Tamanho de arquivo inválido",
    ylErrBadSizeMsg: "Era esperado um .sav de 32.768 bytes. Save states e arquivos compactados não funcionam.",
    ylErrNotYellowLegacy: "Não é um save de Yellow Legacy",
    ylErrNotYellowLegacyMsg:
      "O bloco do treinador não parece dado de Yellow Legacy. Apenas saves de Pokémon Yellow Legacy são suportados.",
    ylErrVanilla: "Esse é um save de Gen 1 original",
    ylErrVanillaMsg:
      "Isso parece Red, Blue ou Yellow original. O Yellow Legacy guarda dinheiro, insígnias e fichas 78 bytes adiante, então editar aqui escreveria no lugar errado. Use o PKHeX para os jogos oficiais.",
    ylErrRead: "Não foi possível ler o arquivo",
    ylErrReadMsg: "Seu navegador não conseguiu ler esse arquivo. Tente selecioná-lo de novo.",
    ylErrLib: "O núcleo do editor não carregou",
    ylErrLibMsg: "Recarregue a página. Se continuar falhando, a ferramenta não roda a partir de um caminho file:// local.",
    ylErrWrite: "Não foi possível gravar o save",
    ylErrWriteMsg: "Nada foi baixado e seu arquivo carregado está inalterado.",

    ylHowEyebrow: "COMO USAR ▸ 4 PASSOS",
    ylHowTitle: "Do arquivo de save ao treinador editado",
    ylStep1Title: "Pegue seu save",
    ylStep1Body:
      "No emulador o .sav fica ao lado da ROM (mGBA, BGB, SameBoy). Em flash cart ou cartucho real, faça o dump com um GB Operator, GBxCart RW ou similar.",
    ylStep2Title: "Solte aqui",
    ylStep2Body:
      "O arquivo é lido localmente e verificado: tamanho exato, nome do treinador e do rival legíveis, mochila coerente e campos BCD válidos. O checksum é reportado, não exigido, e se estiver quebrado sai corrigido.",
    ylStep3Title: "Edite o bloco do jogador",
    ylStep3Body:
      "Nome, ID, dinheiro, fichas, os oito bits de insígnia e os onze bits de cidade visitada. Toda mudança pendente aparece com seu offset antes de você baixar.",
    ylStep4Title: "Devolva ao lugar",
    ylStep4Body:
      'Baixe o arquivo editado, guarde o original como backup e substitua. No próximo boot o jogo carrega sem a tela de "file data is destroyed".',

    ylWhyEyebrow: "POR QUE ISSO EXISTE",
    ylWhyTitle: "Feito para o Yellow Legacy, não para o jogo original",
    ylWhyP1:
      "O PKHeX é ótimo, mas ele mira nos jogos oficiais. Um save de romhack não é o caso de uso dele, e o Yellow Legacy muda coisas de verdade: a mochila guarda 59 itens em vez de 20, o que empurra dinheiro, insígnias, ID e fichas 78 bytes adiante no arquivo. Aponte um editor de vanilla para ele e a escrita vai confiante para o endereço errado.",
    ylWhyP2:
      "Então estes offsets foram derivados do próprio código do Yellow Legacy — montado e linkado até um arquivo de símbolos, não copiados de uma referência de Gen 1. Hoje ele cobre o bloco do jogador. A meta é a cobertura que você esperaria do PKHeX: Pokémon do party e das boxes, itens e o resto, adicionada um campo verificado por vez, em vez de tudo de uma vez e meio testado.",
    ylBytesEyebrow: "POR DENTRO",
    ylBytesLead: "Todo byte que este editor pode tocar, e mais nenhum:",
    ylBytesWhat: "O QUE É",
    ylBytesFormat: "FORMATO",
    ylRow1: "nome do jogador (texto Gen 1)",
    ylRow2: "dinheiro, 3 bytes BCD",
    ylRow3: "insígnias, bit 0 = Pedra",
    ylRow4: "ID do treinador",
    ylRow5: "fichas do Game Corner",
    ylRow6: "cidades visitadas (Fly)",
    ylRow7: "checksum do banco 1",
    ylBytesFoot:
      "Os quatro offsets em dourado são os que o Yellow Legacy desloca; as cidades, o espelho das insígnias e o checksum ficam onde o jogo original os deixa, porque o hack recupera 78 bytes de preenchimento mais adiante. A máscara de insígnias também é espelhada em 0x29D6 (wBeatGymFlags), que o jogo lê para estátuas e textos de NPC. Os bancos 2 e 3 (boxes) e seus checksums nunca são tocados.",

    ylFaqEyebrow: "BOM SABER",
    ylFaq1Q: "Isso vai corromper meu save?",
    ylFaq1A:
      "Ele escreve seis campos e um byte de checksum, nada além. Mesmo assim: o download é um arquivo separado, então guarde o original até bootar o editado.",
    ylFaq2Q: "Funciona no Yellow, Red ou Blue original?",
    ylFaq2A:
      "Não, e ele os recusa de propósito em vez de escrever silenciosamente nos offsets errados. Para os jogos oficiais use o PKHeX, que é feito e testado para eles.",
    ylFaq3Q: "Por que meu checksum já está errado?",
    ylFaq3A:
      'Normalmente porque outra ferramenta editou o save e não corrigiu, ou o dump está incompleto. Este editor recalcula no download de qualquer forma, o que resolve a tela de "file data is destroyed".',

    ylFooterLegal:
      "Ferramenta de fã · Pokémon © Nintendo/Creatures/GAME FREAK. Yellow Legacy é um romhack de fã. Sem afiliação. Roda inteiramente no seu navegador, nenhum arquivo é enviado."
  }
};
