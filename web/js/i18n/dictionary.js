/* ===========================================================================
   i18n dictionary — translation data only, no logic.
   Keys are referenced from the DOM via [data-i18n="<key>"] and from the music
   player status label (musicNowPlaying / musicPaused). Add a language by adding
   a sibling object.
   =========================================================================== */

export const DEFAULT_LANG = "en";

export const DICT = {
  en: {
    // Header · all-pages menu (shared by every page)
    navMenu: "ALL PAGES",
    navPages: "PAGES",
    navElsewhere: "ELSEWHERE",
    navClose: "CLOSE",
    navHomeName: "Home",
    navHomeDesc: "trainer card, links & about",
    navGamesName: "Games",
    navGamesDesc: "2 Game Boy builds & patches",
    navToolsName: "Cool Tools",
    navToolsDesc: "2 save tools that fix old games",
    navBlogName: "Field Notes",
    navBlogDesc: "long-form writing on backend craft",

    bioRole: "Software engineer · Pokémon ROM hacker · JDM enthusiast",
    bioLine: "Backend systems by day, Game Boy ROMs by night, chasing apexes on the weekend.",
    projTitleSub: "An RTC-free, MBC5 fork of Pokémon Crystal Legacy.",
    projLead: "Crystal Legacy was never designed to run on cartridges without an RTC, so on those it quietly corrupts your save. This patch fixes that, and stacks a bunch of quality-of-life improvements on top. Check it out.",
    statRtc: "RTC writes",
    statSave: "save intact",
    statTime: "time control",
    ctaDownload: "Download the patch",
    ctaOpen: "Open project",
    ctaSource: "Source",
    ctaGames: "All my games",
    ctaLegacySite: "Open the site",
    ctaLegacyRelease: "Latest release",

    // Section select — the three doors off the home page
    secTitle: "Where to go next",
    secSub: "Three places worth your click.",
    cardGamesDesc:
      "Game Boy builds and patches: Gen 2 with the clock handed back to the player, plus the Crystal Legacy fork.",
    cardGamesMeta: "2 builds · GBC",
    cardToolsDesc:
      "Small browser utilities that fix things old games got wrong. Starting with a Mario Tennis save patcher.",
    cardToolsMeta: "2 tools · N64 & Game Boy",
    cardBlogName: "FIELD NOTES",
    cardBlogDesc:
      "Long-form writing on backend craft: the systems, the trade-offs and the lessons that only show up in production.",
    cardOpen: "Open",
    cardVisit: "Read",

    linksTitle: "Connect",
    linkedinSub: "professional profile",
    twitterSub: "thoughts & dev chatter",
    instagramSub: "life & builds",
    mentoriaSub: "1:1 tech mentoring",
    amaSub: "ask me anything",
    githubSub: "code & ROM hacks",
    emailSub: "say hello",

    // Cool Tools hub (/tools/)
    toolsLead:
      "Small, single-purpose utilities I built because something annoyed me and nobody else had fixed it. They run entirely in your browser. No accounts, no uploads, no server.",
    toolsBadgeLocal: "Runs in your browser",
    toolsBadgeFree: "Free · no sign-up",
    toolsCardLead:
      "Mario Tennis for Game Boy Color locks four characters and four minigames behind an N64, the N64 cartridge and a Transfer Pak. This patcher writes the exact same bytes a real Transfer Pak session writes, verified on a real cartridge, so you can unlock them from your save file alone.",
    toolsUnlocksLabel: "UNLOCKS",
    toolsChipMinigames: "+ 4 minigames",
    toolsStatBytes: "bytes changed",
    toolsStatUploads: "uploads",
    toolsStatReversible: "reversible",
    toolsCtaOpen: "Open the patcher",
    toolsCardHint: "accepts a 32 KiB .sav (USA)",

    // Cool Tools hub · tool 02 card
    toolsYlLead:
      "A save editor for Pokémon Yellow Legacy that runs in the browser instead of on Windows. Edit the trainer block — name, ID, money, Game Corner coins, gym badges and the towns Fly can reach — at the offsets the romhack actually uses, not the vanilla ones. The bank 1 checksum is recalculated on the way out.",
    toolsYlEditsLabel: "EDITS",
    toolsYlChipName: "OT name",
    toolsYlChipId: "Trainer ID",
    toolsYlChipMoney: "Money",
    toolsYlChipCoins: "Coins",
    toolsYlChipBadges: "8 badges",
    toolsYlChipFly: "11 Fly points",
    toolsYlStatFields: "fields written",
    toolsYlStatChecksum: "checksum repair",
    toolsYlCta: "Open the editor",
    toolsYlHint: "Yellow Legacy save files only",
    toolsRequestEyebrow: "REQUESTS",
    toolsRequestLead:
      "Know some retro content locked behind hardware nobody owns anymore? Tell me. Reverse-engineering save formats is my kind of weekend.",
    toolsCtaEmail: "Email me",
    toolsFooterLegal:
      "Fan tools. Trademarks belong to their owners. Not affiliated. Everything runs locally in your browser.",

    // Games hub (/games/)
    gamesLead:
      "Every game I have built or patched, gathered in one place: what each one changes, why it exists, and how to get your hands on it.",
    gamesBannerAlt: "Pixel art of a Game Boy Color with Pikachu and Pichu",
    gamesIndexTitle: "INDEX",
    gamesIndexCount: "2 entries",
    gamesIndexNext: "next build in progress",
    gamesStatusLive: "LIVE",
    gamesStatusExternal: "OWN SITE",
    gamesGen2Lead:
      "Gold, Silver and Crystal with the cartridge clock handed over to the player. Nothing is gated behind sleeping on it any more: set the day or the hour from the Pokégear and the daily and weekly events happen now. It also keeps the clock from corrupting your save, which on RTC-less hardware it otherwise can.",
    gamesChipGsBall: "+ GS Ball event",
    gamesStatRtc: "real days waited",
    gamesStatSave: "save format kept",
    gamesStatRoms: "ROMs patched",
    gamesCtaOpenPage: "Open the game page",
    gamesGen2Hint: "bring your own base ROM",
    gamesLegacyLead:
      "The same RTC surgery applied to Pokémon Crystal Legacy, TheSmithPlays' rebalance hack. It has its own illustrated walkthrough site and tagged releases.",
    gamesRowBase: "BASE",
    gamesRowClock: "CLOCK",
    gamesRowClockVal: "Frozen · Pokégear",
    gamesRowSite: "SITE",
    gamesFooterLegal:
      "Fan projects. Trademarks belong to their owners. Not affiliated. No ROM distributed.",

    // Game · Pokémon Gen 2: Timeless (/games/pokemon-gen-2-timeless/)
    gen2HeroLead:
      "Gold, Silver and Crystal, rebuilt so the clock answers to you instead of to the calendar. Everything else is the game you remember, for the player who now gets one free hour on a weeknight, instead of the whole summer holiday they had back then.",
    gen2CtaBuilds: "See the builds",
    gen2CtaHow: "How to get it",
    gen2CrystalLead:
      "Vanilla Crystal with the clock in your hands: open the Pokégear, set the day or the hour, and the events that used to cost you a real day happen now. Berries, haircuts, the Trainer House and the bargain shop stay repeatable. Same 32 KB save, byte-for-byte compatible both ways, and the locked GS Ball / Celebi event is switched on, matching the Virtual Console release.",
    gen2GoldLead:
      "The Gold and Silver counterpart of the same work: a clock you set instead of one that sets you, and the daily freebies made repeatable so nothing is gated behind sleeping on it. Weekday and hour gates are kept, so the events still feel like themselves. Player-facing guide included in Portuguese.",
    gen2RowBase: "BASE ROM",
    gen2RowClock: "CLOCK",
    gen2RowClockVal: "Frozen · Pokégear",
    gen2RowExtra: "EXTRA",
    gen2RowFreebies: "FREEBIES",
    gen2RowFreebiesVal: "Always available",
    gen2RowDocs: "DOCS",
    gen2GetEyebrow: "HOW TO GET IT",
    gen2GetTitle: "Bring your own ROM",
    gen2GetLead:
      "No ROMs are distributed here, the same rule the release pages document. You supply the base game you already own, and the patch is applied on your side.",
    gen2Step1: "Read the build docs on the repo: TIMELESS.md for what changed, INSTALL.md for the toolchain.",
    gen2Step2:
      "Provide your own legally-dumped base ROM. Nothing is uploaded anywhere; the work happens on your machine.",
    gen2Step3: "Build or patch it yourself, then check cart byte $0147 reads 1B: MBC5 + RAM + battery, no RTC.",
    gen2CtaInstall: "Build instructions",
    gen2GetNote: "existing .sav files keep working, no byte patching",
    gen2BugEyebrow: "WHY THE CLOCK HAD TO GO",
    gen2BugLead:
      "The clock was a design decision from an era when a Game Boy cartridge had very limited memory: make the player wait, and the game lasts longer. Wait for night to catch a Hoothoot, wait a full day for the berries. The kids it was written for now have jobs and families, and none of that time. The Timeless patch brings the games into the present, changing and improving only the mechanics the clock touches.",
    gen2BugStep1Key: "Padding removed",
    gen2BugStep1: "nothing is stretched out by waiting for real time",
    gen2BugStep2Key: "Time you control",
    gen2BugStep2: "night, weekday and the day counter, set from the Pokégear",
    gen2BugStep3Key: "Nothing else touched",
    gen2BugStep3: "only the clock changes, and no RTC writes near your save",
    gen2RelatedEyebrow: "RELATED BUILD",
    gen2LegacyLead:
      "The same RTC work applied to Pokémon Crystal Legacy, TheSmithPlays' rebalance hack, shipped as MBC5 with a full illustrated walkthrough site in English and Portuguese.",
    gen2FooterLegal:
      "Fan project. Pokémon © Nintendo / Game Freak. Not affiliated. No ROM distributed.",
    aboutTitle: "Driver Profile",
    garageTitle: "GARAGE",
    bannerCaption: "Hoenn legends clash: rain vs drought.",
    saveTitle: "SAVE DATA",
    lRide: "DAILY DRIVER",
    lStyle: "STYLE",
    lMain: "MAIN GAME",
    lSide: "SIDE QUEST",
    lClass: "CLASS",

    // Donate (shared — every page carries this above its footer)
    donateKicker: "SUPPORT ▸ DONATE",
    donateOptional: "OPTIONAL",
    donateTitle: "Consider donating",
    donateLead:
      "If this tool, patch or work helped you, consider donating. It helps me keep the next build coming.",
    donateNote: "Any amount is fine. Everything here stays free either way.",
    donateScanA: "SCAN WITH",
    donateScanB: "YOUR BANK",
    donateBrOnly: "BR ONLY",
    donateQrAlt: "Pix QR code",
    donateCopy: "COPY Pix KEY",
    donateCopied: "COPIED ✓",
    donateKofiTitle: "KO-FI · CARD DONATION",
    donateKofiOpen: "Donate on Ko-fi",
    donateKofiClose: "Hide Ko-fi",
    donateKofiArtAlt: "Meowth",
    donateExplain:
      "Pix is Brazil only, it works through Brazilian banks. Outside Brazil, use Ko-fi below: any currency, any card.",
    donateKeyLabel: "Pix KEY",

    footerNote: "Built with caffeine, Pokémon & boost.",
    musicNowPlaying: "NOW PLAYING",
    musicPaused: "PAUSED"
  },
  pt: {
    // Header · all-pages menu (shared by every page)
    navMenu: "PÁGINAS",
    navPages: "PÁGINAS",
    navElsewhere: "EM OUTROS LUGARES",
    navClose: "FECHAR",
    navHomeName: "Início",
    navHomeDesc: "trainer card, links & sobre",
    navGamesName: "Games",
    navGamesDesc: "2 builds e patches de Game Boy",
    navToolsName: "Cool Tools",
    navToolsDesc: "2 ferramentas de save para jogos antigos",
    navBlogName: "Anotações",
    navBlogDesc: "textos longos sobre backend de verdade",

    bioRole: "Engenheiro de software · romhacker de Pokémon · entusiasta JDM",
    bioLine: "Backend de dia, ROMs de Game Boy de noite, curvas no fim de semana.",
    projTitleSub: "Um fork sem RTC, em MBC5, do Pokémon Crystal Legacy.",
    projLead: "O Crystal Legacy nunca foi feito para rodar em cartuchos sem RTC, então neles ele corrompe seu save silenciosamente. Este patch corrige isso e ainda adiciona várias melhorias de qualidade de vida por cima. Dá uma olhada.",
    statRtc: "escritas RTC",
    statSave: "save intacto",
    statTime: "controle do tempo",
    ctaDownload: "Baixar o patch",
    ctaOpen: "Abrir projeto",
    ctaSource: "Código",
    ctaGames: "Todos os jogos",
    ctaLegacySite: "Abrir o site",
    ctaLegacyRelease: "Última release",

    // Section select — the three doors off the home page
    secTitle: "Para onde ir agora",
    secSub: "Três lugares que valem o clique.",
    cardGamesDesc:
      "Builds e patches de Game Boy: a Gen 2 com o relógio nas mãos do jogador e o fork do Crystal Legacy.",
    cardGamesMeta: "2 builds · GBC",
    cardToolsDesc:
      "Utilitários de navegador que consertam o que jogos antigos erraram. Começando pelo patcher de save do Mario Tennis.",
    cardToolsMeta: "2 ferramentas · N64 e Game Boy",
    cardBlogName: "ANOTAÇÕES",
    cardBlogDesc:
      "Textos longos sobre backend de verdade: os sistemas, os trade-offs e as lições que só aparecem em produção.",
    cardOpen: "Abrir",
    cardVisit: "Ler",

    linksTitle: "Conecte-se",
    linkedinSub: "perfil profissional",
    twitterSub: "ideias & papo dev",
    instagramSub: "vida & projetos",
    mentoriaSub: "mentoria tech 1:1",
    amaSub: "pergunte qualquer coisa",
    githubSub: "código & ROM hacks",
    emailSub: "manda um oi",

    // Cool Tools hub (/tools/)
    toolsLead:
      "Utilitários pequenos e de propósito único que eu criei porque algo me incomodava e ninguém tinha resolvido. Rodam inteiramente no seu navegador. Sem conta, sem upload, sem servidor.",
    toolsBadgeLocal: "Roda no seu navegador",
    toolsBadgeFree: "Grátis · sem cadastro",
    toolsCardLead:
      "Mario Tennis de Game Boy Color tranca quatro personagens e quatro minigames atrás de um N64, o cartucho de N64 e um Transfer Pak. Este patcher escreve exatamente os mesmos bytes que uma sessão real de Transfer Pak escreve, verificado em cartucho real, então você desbloqueia tudo só com o seu save.",
    toolsUnlocksLabel: "DESBLOQUEIA",
    toolsChipMinigames: "+ 4 minigames",
    toolsStatBytes: "bytes alterados",
    toolsStatUploads: "uploads",
    toolsStatReversible: "reversível",
    toolsCtaOpen: "Abrir o patcher",
    toolsCardHint: "aceita um .sav de 32 KiB (USA)",

    // Cool Tools hub · tool 02 card
    toolsYlLead:
      "Um editor de save para Pokémon Yellow Legacy que roda no navegador em vez de no Windows. Edite o bloco do treinador — nome, ID, dinheiro, fichas do Game Corner, insígnias e as cidades que o Fly alcança — nos offsets que o romhack realmente usa, não nos do jogo original. O checksum do banco 1 é recalculado na saída.",
    toolsYlEditsLabel: "EDITA",
    toolsYlChipName: "Nome (OT)",
    toolsYlChipId: "ID",
    toolsYlChipMoney: "Dinheiro",
    toolsYlChipCoins: "Fichas",
    toolsYlChipBadges: "8 insígnias",
    toolsYlChipFly: "11 pontos de Fly",
    toolsYlStatFields: "campos escritos",
    toolsYlStatChecksum: "correção de checksum",
    toolsYlCta: "Abrir o editor",
    toolsYlHint: "apenas saves de Yellow Legacy",
    toolsRequestEyebrow: "PEDIDOS",
    toolsRequestLead:
      "Conhece algum conteúdo retrô trancado atrás de hardware que ninguém mais tem? Me conta. Engenharia reversa de save é meu tipo de fim de semana.",
    toolsCtaEmail: "Me manda um email",
    toolsFooterLegal:
      "Ferramentas de fã. Marcas pertencem aos seus donos. Sem afiliação. Tudo roda localmente no seu navegador.",

    // Games hub (/games/)
    gamesLead:
      "Todos os jogos que eu construí ou modifiquei, reunidos num só lugar: o que cada um muda, por que existe e como colocar a mão nele.",
    gamesBannerAlt: "Pixel art de um Game Boy Color com Pikachu e Pichu",
    gamesIndexTitle: "ÍNDICE",
    gamesIndexCount: "2 entradas",
    gamesIndexNext: "próxima build em andamento",
    gamesStatusLive: "NO AR",
    gamesStatusExternal: "SITE PRÓPRIO",
    gamesGen2Lead:
      "Gold, Silver e Crystal com o relógio do cartucho entregue ao jogador. Nada mais depende de dormir e voltar amanhã: ajuste o dia ou a hora pelo Pokégear e os eventos diários e semanais acontecem agora. De bônus, o relógio deixa de corromper o seu save, coisa que em hardware sem RTC ele pode fazer.",
    gamesChipGsBall: "+ evento da GS Ball",
    gamesStatRtc: "dias reais de espera",
    gamesStatSave: "formato do save",
    gamesStatRoms: "ROMs corrigidas",
    gamesCtaOpenPage: "Abrir a página do jogo",
    gamesGen2Hint: "use a sua própria ROM base",
    gamesLegacyLead:
      "A mesma cirurgia de RTC aplicada ao Pokémon Crystal Legacy, o hack de rebalanceamento do TheSmithPlays. Tem site explicativo próprio e releases publicadas.",
    gamesRowBase: "BASE",
    gamesRowClock: "RELÓGIO",
    gamesRowClockVal: "Congelado · Pokégear",
    gamesRowSite: "SITE",
    gamesFooterLegal:
      "Projetos de fã. Marcas pertencem aos seus donos. Sem afiliação. Nenhuma ROM distribuída.",

    // Game · Pokémon Gen 2: Timeless (/games/pokemon-gen-2-timeless/)
    gen2HeroLead:
      "Gold, Silver e Crystal, reconstruídos para o relógio responder a você e não ao calendário. Todo o resto é o jogo que você lembra, para quem hoje tem somente uma hora livre à noite durante algum dia da semana, ao invés de todas as férias de verão como antigamente.",
    gen2CtaBuilds: "Ver as builds",
    gen2CtaHow: "Como obter",
    gen2CrystalLead:
      "Crystal original com o relógio nas suas mãos: abra o Pokégear, ajuste o dia ou a hora, e os eventos que custavam um dia real acontecem agora. Berries, corte de cabelo, Trainer House e a loja de ofertas seguem repetíveis. Mesmo save de 32 KB, compatível byte a byte nos dois sentidos, e o evento bloqueado da GS Ball / Celebi vem ativado, como no Virtual Console.",
    gen2GoldLead:
      "A versão Gold e Silver do mesmo trabalho: um relógio que você ajusta em vez de um que manda em você, e os brindes diários repetíveis para nada depender de dormir e voltar amanhã. As travas de dia da semana e de horário continuam lá, então os eventos seguem com a cara deles. Guia para jogadores incluído em português.",
    gen2RowBase: "ROM BASE",
    gen2RowClock: "RELÓGIO",
    gen2RowClockVal: "Congelado · Pokégear",
    gen2RowExtra: "EXTRA",
    gen2RowFreebies: "BRINDES",
    gen2RowFreebiesVal: "Sempre disponíveis",
    gen2RowDocs: "DOCS",
    gen2GetEyebrow: "COMO OBTER",
    gen2GetTitle: "Traga a sua própria ROM",
    gen2GetLead:
      "Nenhuma ROM é distribuída aqui, a mesma regra que as páginas de release documentam. Você usa o jogo base que já possui, e o patch é aplicado do seu lado.",
    gen2Step1: "Leia a documentação no repositório: TIMELESS.md para o que mudou, INSTALL.md para a toolchain.",
    gen2Step2:
      "Use a sua própria ROM, extraída legalmente. Nada é enviado para lugar algum; tudo acontece na sua máquina.",
    gen2Step3:
      "Compile ou aplique o patch você mesmo, e confira que o byte $0147 do cartucho é 1B: MBC5 + RAM + bateria, sem RTC.",
    gen2CtaInstall: "Instruções de build",
    gen2GetNote: "saves existentes continuam funcionando, sem patch de bytes",
    gen2BugEyebrow: "POR QUE O RELÓGIO SAIU",
    gen2BugLead:
      "O relógio foi uma decisão de design de uma época em que um cartucho de Game Boy tinha um espaço de memória bem limitado: faça o jogador esperar, e o jogo dura mais. Esperar a noite para pegar um Hoothoot, esperar um dia inteiro pelas berries. As crianças para quem isso foi escrito hoje têm trabalho e família, e não têm esse tempo. O patch Timeless traz os jogos para os dias atuais, mudando e melhorando somente as mecânicas onde o horário afeta.",
    gen2BugStep1Key: "Enrolação removida",
    gen2BugStep1: "nada é esticado à base de esperar o tempo real",
    gen2BugStep2Key: "Tempo no seu controle",
    gen2BugStep2: "noite, dia da semana e contador de dias, pelo Pokégear",
    gen2BugStep3Key: "Nada além disso",
    gen2BugStep3: "só o relógio muda, e nenhuma escrita de RTC perto do save",
    gen2RelatedEyebrow: "BUILD RELACIONADA",
    gen2LegacyLead:
      "O mesmo trabalho de RTC aplicado ao Pokémon Crystal Legacy, o hack de rebalanceamento do TheSmithPlays, em MBC5, com um site explicativo completo em inglês e português.",
    gen2FooterLegal:
      "Projeto de fã. Pokémon © Nintendo / Game Freak. Sem afiliação. Nenhuma ROM distribuída.",
    aboutTitle: "Perfil do Piloto",
    garageTitle: "GARAGEM",
    bannerCaption: "Lendas de Hoenn em confronto: chuva vs seca.",
    saveTitle: "DADOS DO SAVE",
    lRide: "CARRO",
    lStyle: "ESTILO",
    lMain: "JOGO PRINCIPAL",
    lSide: "MISSÃO PARALELA",
    lClass: "CLASSE",

    // Donate (shared — every page carries this above its footer)
    donateKicker: "APOIE ▸ DOE",
    donateOptional: "OPCIONAL",
    donateTitle: "Considere doar",
    donateLead:
      "Se esta ferramenta, patch ou trabalho te ajudou, considere doar. Isso me ajuda a tirar o próximo projeto do papel.",
    donateNote: "Qualquer valor ajuda. Tudo aqui continua de graça de qualquer forma.",
    donateScanA: "ESCANEIE NO",
    donateScanB: "SEU BANCO",
    donateBrOnly: "SÓ BR",
    donateQrAlt: "QR code do Pix",
    donateCopy: "COPIAR CHAVE Pix",
    donateCopied: "COPIADO ✓",
    donateKofiTitle: "KO-FI · DOAÇÃO NO CARTÃO",
    donateKofiOpen: "Doar no Ko-fi",
    donateKofiClose: "Esconder o Ko-fi",
    donateKofiArtAlt: "Meowth",
    donateExplain:
      "O Pix funciona só em bancos brasileiros. De fora do Brasil, use o Ko-fi abaixo: qualquer moeda, qualquer cartão.",
    donateKeyLabel: "CHAVE Pix",

    footerNote: "Feito com cafeína, Pokémon e turbo.",
    musicNowPlaying: "TOCANDO AGORA",
    musicPaused: "PAUSADO"
  }
};
