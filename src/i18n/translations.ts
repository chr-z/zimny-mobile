/**
 * translations.ts — Full trilingual dictionary (pt / en / es).
 *
 * Every key in TranslationMap must be a TranslationKey defined in types.ts.
 * This ensures compile-time safety: if you add a key here without adding it
 * to types.ts (or vice versa), TypeScript will error.
 */
import type { AppLanguage, TranslationKey } from "./types";

type TranslationMap = Record<TranslationKey, Record<AppLanguage, string>>;

export const translations: TranslationMap = {
  // ═══════════════════════════════════════════════════════════════
  // NAVEGAÇÃO (SmartHeader / Tabs)
  // ═══════════════════════════════════════════════════════════════
  "header.slogan": {
    pt: "A 1ª REVISTA TRILINGUE MENSAL DE NEW ENGLAND",
    en: "THE 1ST MONTHLY TRILINGUAL MAGAZINE IN NEW ENGLAND",
    es: "LA 1ª REVISTA TRILINGÜE MENSUAL DE NEW ENGLAND",
  },
  "nav.noticias":        { pt: "Notícias",     en: "News",         es: "Noticias" },
  "nav.revista":         { pt: "Revista",      en: "Magazine",     es: "Revista" },
  "nav.podcast":         { pt: "Podcast",      en: "Podcast",      es: "Podcast" },
  "nav.tv":              { pt: "ZyTV",         en: "ZyTV",         es: "ZyTV" },
  "nav.cobertura":       { pt: "Cobertura",    en: "Coverage",     es: "Cobertura" },
  "nav.eventos":         { pt: "Eventos",      en: "Events",       es: "Eventos" },
  "nav.marketing":       { pt: "Marketing",    en: "Marketing",    es: "Marketing" },
  "nav.colunistas":      { pt: "Colunistas",   en: "Columnists",   es: "Columnistas" },

  // ═══════════════════════════════════════════════════════════════
  // DRAWER MENU
  // ═══════════════════════════════════════════════════════════════
  "drawer.home": {
    pt: "Home",
    en: "Home",
    es: "Inicio",
  },
  "drawer.ultimas_noticias": {
    pt: "Últimas notícias",
    en: "Latest news",
    es: "Últimas noticias",
  },
  "drawer.artigos_reportagens": {
    pt: "Artigos e reportagens",
    en: "Articles & reports",
    es: "Artículos y reportajes",
  },
  "drawer.edicoes_impressas": {
    pt: "Edições impressas e digitais",
    en: "Print & digital editions",
    es: "Ediciones impresas y digitales",
  },
  "drawer.episodios_series": {
    pt: "Episódios e séries originais",
    en: "Episodes & original series",
    es: "Episodios y series originales",
  },
  "drawer.producao_zimny": {
    pt: "Produção Zimny",
    en: "Zimny Production",
    es: "Producción Zimny",
  },
  "drawer.configuracoes": {
    pt: "Configurações",
    en: "Settings",
    es: "Configuración",
  },
  "drawer.subtitle_config": {
    pt: "Idiomas, notificações e preferências",
    en: "Language, notifications & preferences",
    es: "Idioma, notificaciones y preferencias",
  },
  "drawer.anuncie_conosco": {
    pt: "Anuncie Conosco",
    en: "Advertise With Us",
    es: "Anuncie Con Nosotros",
  },
  "drawer.midia_kit": {
    pt: "Mídia Kit & Contato",
    en: "Media Kit & Contact",
    es: "Media Kit & Contacto",
  },
  "drawer.publicidade_exclusiva": {
    pt: "PUBLICIDADE EXCLUSIVA",
    en: "EXCLUSIVE ADVERTISING",
    es: "PUBLICIDAD EXCLUSIVA",
  },
  "drawer.anuncie_descricao": {
    pt: "Posicione sua marca na Zimny Magazine e conquiste atenção, autoridade e resultado entre um público de alto padrão.",
    en: "Position your brand in Zimny Magazine and earn attention, authority, and results among a high-standard audience.",
    es: "Posicione su marca en Zimny Magazine y consiga atención, autoridad y resultados entre una audiencia de alto nivel.",
  },
  "drawer.anuncie_agora": {
    pt: "QUERO ANUNCIAR",
    en: "I WANT TO ADVERTISE",
    es: "QUIERO ANUNCIAR",
  },
  "drawer.dyn_prefix": {
    pt: "Sua marca",
    en: "Your brand",
    es: "Tu marca",
  },
  "drawer.dyn_word_1": {
    pt: "no topo",
    en: "on top",
    es: "en la cima",
  },
  "drawer.dyn_word_2": {
    pt: "em destaque",
    en: "in the spotlight",
    es: "en el foco",
  },
  "drawer.dyn_word_3": {
    pt: "em alta",
    en: "on the rise",
    es: "en ascenso",
  },
  "drawer.dyn_word_4": {
    pt: "na ZIMNY",
    en: "on ZIMNY",
    es: "en ZIMNY",
  },
  "drawer.dyn_subline": {
    pt: "Alcance um público de alto padrão.",
    en: "Reach a high-standard audience.",
    es: "Alcance una audiencia de alto nivel.",
  },
  "drawer.cobertura_eventos": {
    pt: "Coberturas",
    en: "Coverage",
    es: "Coberturas",
  },
  "drawer.cobertura_subtitle": {
    pt: "Coberturas em vídeo",
    en: "Video coverage",
    es: "Coberturas en video",
  },
  "drawer.ao_vivo": {
    pt: "Ao Vivo",
    en: "Live",
    es: "En Vivo",
  },
  "drawer.tv_subtitle": {
    pt: "Zimny TV 24h",
    en: "Zimny TV 24/7",
    es: "Zimny TV 24h",
  },
  "drawer.marketing_subtitle": {
    pt: "Soluções para marcas",
    en: "Brand solutions",
    es: "Soluciones para marcas",
  },
  "drawer.colunistas_subtitle": {
    pt: "Colunistas e especialistas",
    en: "Columnists & experts",
    es: "Columnistas y expertos",
  },
  "drawer.redes_sociais": {
    pt: "Redes Sociais",
    en: "Social Media",
    es: "Redes Sociales",
  },
  "drawer.sobre_zimny": {
    pt: "Sobre a Zimny",
    en: "About Zimny",
    es: "Acerca de Zimny",
  },
  "drawer.sobre_subtitle": {
    pt: "Nossa trajetória e manifesto editorial",
    en: "Our journey and editorial manifesto",
    es: "Nuestra trayectoria y manifiesto editorial",
  },
  "drawer.contato_subtitle": {
    pt: "WhatsApp, telefone, e-mail e site",
    en: "WhatsApp, phone, email and website",
    es: "WhatsApp, teléfono, correo y sitio web",
  },
  // ═══════════════════════════════════════════════════════════════
  // PUSH (Notificações)
  // ═══════════════════════════════════════════════════════════════
  "push.kicker":             { pt: "NOTIFICAÇÕES",            en: "NOTIFICATIONS",        es: "NOTIFICACIONES" },
  "push.titulo":             { pt: "Novas notícias",          en: "New stories",          es: "Nuevas noticias" },
  "push.hint":               { pt: "Receba um aviso quando a ZIMNY publicar", en: "Get notified when ZIMNY publishes", es: "Recibe un aviso cuando ZIMNY publique" },
  "push.indisponivel_titulo":{ pt: "Notificações indisponíveis", en: "Notifications unavailable", es: "Notificaciones no disponibles" },
  "push.indisponivel_msg":   { pt: "Não conseguimos ativar as notificações neste dispositivo agora. Tente novamente mais tarde.", en: "We couldn't enable notifications on this device right now. Please try again later.", es: "No pudimos activar las notificaciones en este dispositivo ahora. Inténtalo más tarde." },
  "push.permissao_titulo":   { pt: "Ative nas configurações",  en: "Enable in Settings",   es: "Actívalo en Ajustes" },
  "push.permissao_msg":      { pt: "A permissão de notificações está desligada para o app ZIMNY. Ative em Ajustes → Notificações.", en: "Notification permission is off for the ZIMNY app. Enable it in Settings → Notifications.", es: "El permiso de notificaciones está desactivado para la app ZIMNY. Actívalo en Ajustes → Notificaciones." },
  "push.prompt_titulo":      { pt: "Não perca nenhuma atualização", en: "Never miss an update", es: "No te pierdas ninguna actualización" },
  "push.prompt_msg":         { pt: "As atualizações da ZIMNY chegam primeiro pra quem ativa o alerta. Um toque e pronto. Você pode mudar de ideia quando quiser.", en: "ZIMNY updates reach you the moment they're live. One tap and you're in. You can change your mind anytime.", es: "Las actualizaciones de ZIMNY llegan primero a quien activa la alerta. Un toque y listo. Siempre puedes cambiar de opinión." },
  "push.prompt_permitir":    { pt: "Permitir",                  en: "Allow",                 es: "Permitir" },
  "push.prompt_fora":        { pt: "Prefiro ficar de fora",     en: "I'll pass",             es: "Prefiero no participar" },
  "drawer.fechar_menu": {
    pt: "Fechar Menu",
    en: "Close Menu",
    es: "Cerrar Menú",
  },

  // ═══════════════════════════════════════════════════════════════
  // HEADER / LAYOUT
  // ═══════════════════════════════════════════════════════════════
  "header.ver_mais":     { pt: "VER MAIS",          en: "SEE MORE",     es: "VER MÁS" },
  "intro.skip":          { pt: "Pular",             en: "Skip",         es: "Saltar" },
  "layout.sobre_zimny":  { pt: "Sobre a Zimny",     en: "About Zimny",  es: "Acerca de Zimny" },
  "layout.configuracoes":{ pt: "Configurações",     en: "Settings",     es: "Configuración" },

  // ═══════════════════════════════════════════════════════════════
  // COBERTURA
  // ═══════════════════════════════════════════════════════════════
  "cobertura.midia":     { pt: "MÍDIA",             en: "MEDIA",        es: "MEDIOS" },
  "cobertura.sem_midia": { pt: "Nenhuma mídia encontrada", en: "No media found", es: "No se encontraron medios" },
  "cobertura.fallback":  { pt: "Cobertura",         en: "Coverage",     es: "Cobertura" },

  // ═══════════════════════════════════════════════════════════════
  // SETTINGS (Configurações)
  // ═══════════════════════════════════════════════════════════════
  "settings.aparencia":     { pt: "Aparência",          en: "Appearance",           es: "Apariencia" },
  "settings.claro":         { pt: "Claro",              en: "Light",                es: "Claro" },
  "settings.escuro":        { pt: "Escuro",             en: "Dark",                 es: "Oscuro" },
  "settings.sistema_auto":  { pt: "Sistema (automático)",en: "System (automatic)",  es: "Sistema (automático)" },
  "settings.tamanho_fonte": { pt: "Tamanho da Fonte",   en: "Font Size",            es: "Tamaño de Fuente" },
  "settings.pequena":       { pt: "Pequena",            en: "Small",                es: "Pequeña" },
  "settings.normal":        { pt: "Normal",             en: "Normal",               es: "Normal" },
  "settings.grande":        { pt: "Grande",             en: "Large",                es: "Grande" },
  "settings.muito_grande":  { pt: "Muito Grande",       en: "Extra Large",          es: "Muy Grande" },
  "settings.enorme":        { pt: "Enorme",             en: "Huge",                 es: "Enorme" },
  "settings.idioma":        { pt: "Idioma / Language",  en: "Language",             es: "Idioma" },
  "settings.sobre":         { pt: "Sobre",              en: "About",                es: "Acerca de" },
  "settings.versao":        { pt: "Versão",             en: "Version",              es: "Versión" },
  "settings.expo_sdk":      { pt: "Expo SDK",           en: "Expo SDK",             es: "Expo SDK" },
  "settings.automatico":    { pt: "Automático",         en: "Automatic",            es: "Automático" },
  "settings.idioma_atual":  { pt: "Idioma atual",       en: "Current language",     es: "Idioma actual" },
  "settings.override_manual":{ pt: "Override manual",   en: "Manual override",      es: "Anulación manual" },
  "settings.sua_experiencia": {
    pt: "Personalize como você lê os posts e artigos da Zimny.",
    en: "Customize how you read Zimny's posts and articles.",
    es: "Personaliza cómo lees los posts y artículos de Zimny.",
  },
  "settings.leitura":        { pt: "LEITURA",           en: "READING",              es: "LECTURA" },
  "settings.tema_leitura":   { pt: "Tema de Leitura",   en: "Reading Theme",        es: "Tema de Lectura" },
  "settings.tema_leitura_hint": {
    pt: "Claro ou escuro ao ler posts e artigos",
    en: "Light or dark while reading posts and articles",
    es: "Claro u oscuro al leer posts y artículos",
  },
  "settings.tamanho_fonte_hint": {
    pt: "Ajuste o tamanho do texto na leitura",
    en: "Adjust the text size while reading",
    es: "Ajusta el tamaño del texto al leer",
  },
  "settings.preview":        { pt: "PRÉ-VISUALIZAÇÃO",  en: "PREVIEW",              es: "VISTA PREVIA" },
  "settings.aplicado_leitura": {
    pt: "Aplicado à leitura de posts e artigos",
    en: "Applied to reading posts and articles",
    es: "Aplicado a la lectura de posts y artículos",
  },
  "settings.preview_titulo": { pt: "A arte de viver o presente", en: "The Art of Living the Present", es: "El Arte de Vivir el Presente" },
  "settings.preview_autor":  { pt: "Por Redação ZIMNY",          en: "By ZIMNY Editorial",           es: "Por Redacción ZIMNY" },
  "settings.preview_corpo": {
    pt: "Cada instante é uma página em branco prestes a ser escrita — e é nessa folha em branco que a vida acontece: sem roteiro, sem ensaio, apenas com a coragem de quem se permite começar.",
    en: "Every moment is a blank page about to be written — and it is on that blank page that life happens: without a script, without rehearsal, only with the courage of those who allow themselves to begin.",
    es: "Cada instante es una página en blanco a punto de escribirse — y es en esa página en blanco donde la vida sucede: sin guion, sin ensayo, solo con el coraje de quienes se permiten comenzar.",
  },
  "settings.aumentar":       { pt: "Aumentar",          en: "Increase",             es: "Aumentar" },
  "settings.diminuir":       { pt: "Diminuir",          en: "Decrease",             es: "Disminuir" },
  "settings.tema_preview_claro": { pt: "Modo claro",    en: "Light mode",           es: "Modo claro" },
  "settings.tema_preview_escuro":{ pt: "Modo escuro",   en: "Dark mode",            es: "Modo oscuro" },
  "settings.idioma_kicker":  { pt: "IDIOMA",            en: "LANGUAGE",             es: "IDIOMA" },
  "settings.sobre_kicker":   { pt: "SOBRE",             en: "ABOUT",                es: "ACERCA DE" },

  // ═══════════════════════════════════════════════════════════════
  // CONTACT (Ligar / E-mail / WhatsApp)
  // ═══════════════════════════════════════════════════════════════
  "contact.ligar":    { pt: "Ligar",    en: "Call",    es: "Llamar" },
  "contact.email":    { pt: "E-mail",   en: "Email",   es: "Correo" },
  "contact.whatsapp": { pt: "WhatsApp", en: "WhatsApp", es: "WhatsApp" },
  "contact.title": {
    pt: "Fale Conosco",
    en: "Contact Us",
    es: "Contáctenos",
  },
  "contact.subtitle": {
    pt: "Tire suas dúvidas, envie sugestões de pauta, fale com a redação ou anuncie sua marca.",
    en: "Ask questions, send story tips, reach the newsroom or advertise your brand.",
    es: "Resuelve tus dudas, envía sugerencias de temas, contacta a la redacción o anuncia tu marca.",
  },
  "contact.telefone":         { pt: "Telefone",        en: "Phone",             es: "Teléfono" },
  "contact.chamar_whatsapp":  { pt: "Chamar no WhatsApp", en: "Chat on WhatsApp", es: "Chatear por WhatsApp" },
  "contact.enviar_email":     { pt: "Enviar e-mail",   en: "Send email",        es: "Enviar correo" },
  "contact.siga_nos":         { pt: "Siga a Zimny",    en: "Follow Zimny",      es: "Síguenos" },
  "contact.visite_site":      { pt: "Visite nosso site", en: "Visit our website", es: "Visita nuestro sitio" },
  "contact.fale_conosco":     { pt: "FALE CONOSCO",    en: "CONTACT US",        es: "CONTÁCTENOS" },
  "contact.resposta_rapida": {
    pt: "Resposta rápida em horário comercial",
    en: "Quick response during business hours",
    es: "Respuesta rápida en horario comercial",
  },

  // ═══════════════════════════════════════════════════════════════
  // TV
  // ═══════════════════════════════════════════════════════════════
  "tv.no_ar":         { pt: "NO AR",       en: "ON AIR",       es: "AL AIRE" },
  "tv.a_seguir":      { pt: "A SEGUIR",    en: "UP NEXT",      es: "A CONTINUACIÓN" },
  "tv.revista":       { pt: "REVISTA",     en: "MAGAZINE",     es: "REVISTA" },
  "tv.digital":       { pt: "DIGITAL",     en: "DIGITAL",      es: "DIGITAL" },
  "tv.eventos":       { pt: "EVENTOS",     en: "EVENTS",       es: "EVENTOS" },
  "tv.zimny":         { pt: "ZIMNY",       en: "ZIMNY",        es: "ZIMNY" },
  "tv.porta_entrada": { pt: "Porta de Entrada", en: "Gateway", es: "Puerta de Entrada" },
  "tv.programacao":   { pt: "PROGRAMAÇÃO",       en: "SCHEDULE",  es: "PROGRAMACIÓN" },
  "tv.sem_programas": { pt: "Nenhum programa na grade", en: "No programs in the schedule", es: "Ningún programa en la parrilla" },
  "tv.autoridade":    { pt: "Autoridade",        en: "Authority", es: "Autoridad" },
  "tv.alcance":       { pt: "Alcance",           en: "Reach",     es: "Alcance" },
  "tv.conexoes":      { pt: "Conexões",          en: "Connections", es: "Conexiones" },
  "tv.headline": {
    pt: "Anuncie na ZYTV",
    en: "Advertise on ZYTV",
    es: "Anuncie en ZYTV",
  },
  "tv.cta_subtitle": {
    pt: "Conecte-se com milhares de pessoas",
    en: "Connect with thousands of people",
    es: "Conéctate con miles de personas",
  },
  "tv.contact_info": { pt: "NOSSOS CONTATOS", en: "CONTACT INFO", es: "CONTACTO" },
  "tv.fale_conosco":   { pt: "FALE CONOSCO",      en: "TALK TO US",    es: "HABLE CON NOSOTROS" },
  "tv.stat_viewers":   { pt: "Espectadores",       en: "Viewers",        es: "Espectadores" },
  "tv.stat_live":      { pt: "No ar",              en: "On air",         es: "En el aire" },
  "tv.stat_engagement":{ pt: "Engajamento",        en: "Engagement",     es: "Interacción" },
  "tv.stat_high":      { pt: "Alto",               en: "High",           es: "Alto" },

  // ═══════════════════════════════════════════════════════════════
  // PODCAST
  // ═══════════════════════════════════════════════════════════════
  "podcast.headline": {
    pt: "SUA EMPRESA TEM UM LUGAR DE FALA",
    en: "YOUR BUSINESS HAS A VOICE",
    es: "TU EMPRESA TIENE UN LUGAR DE PALABRA",
  },
  "podcast.subtitle": {
    pt: "Conte a história da sua marca no podcast da Zimny e se torne autoridade no mercado americano.",
    en: "Tell your brand's story on the Zimny podcast and become an authority in the American market.",
    es: "Cuenta la historia de tu marca en el podcast de Zimny y conviértete en autoridad en el mercado americano.",
  },

  // ── Sponsor Banner ─────────────────────────────────────────────
"podcast.sponsor_tag": {
    pt: "OPORTUNIDADE ÚNICA",
    en: "UNIQUE OPPORTUNITY",
    es: "OPORTUNIDAD ÚNICA",
  },
  "podcast.sponsor_title": {
    pt: "Conecte sua marca ao público americano",
    en: "Connect your brand to the American audience",
    es: "Conecta tu marca con el público americano",
  },
  "podcast.sponsor_reach": {
    pt: "+10k Executivos & Clientes/mês",
    en: "+10k Executives & Clients/month",
    es: "+10k Ejecutivos y Clientes/mes",
  },
  "podcast.sponsor_benefit_1": {
    pt: "Comercial em vídeo e menção ao vivo nos episódios",
    en: "Video commercial and live mention in episodes",
    es: "Comercial en video y mención en vivo en los episodios",
  },
  "podcast.sponsor_benefit_2": {
    pt: "Anúncio garantido na Revista Zimny",
    en: "Guaranteed ad in Zimny Magazine",
    es: "Anuncio garantizado en la Revista Zimny",
  },
  "podcast.sponsor_benefit_3": {
    pt: "Tráfego direto através de links no app e redes sociais.",
    en: "Direct traffic through links in the app and social media.",
    es: "Tráfico directo a través de enlaces en la aplicación y redes sociales.",
  },
  "podcast.sponsor_cta": {
    pt: "ANUNCIE AGORA",
    en: "ADVERTISE NOW",
    es: "ANUNCIA AHORA",
  },

  // ═══════════════════════════════════════════════════════════════
  // MARKETING DIGITAL
  // ═══════════════════════════════════════════════════════════════
  "marketing.titulo": {
    pt: "Marketing Digital",
    en: "Digital Marketing",
    es: "Marketing Digital",
  },
  "marketing.subtitulo": {
    pt: "Planos estratégicos para posicionar sua marca no mercado americano com excelência e resultados mensuráveis.",
    en: "Strategic plans to position your brand in the American market with excellence and measurable results.",
    es: "Planes estratégicos para posicionar tu marca en el mercado americano con excelencia y resultados medibles.",
  },
  "marketing.cta_titulo": {
    pt: "PRECISA DE UM PROJETO SOB MEDIDA?",
    en: "NEED A CUSTOM PROJECT?",
    es: "¿NECESITA UN PROYECTO A MEDIDA?",
  },
  "marketing.hero_title": {
    pt: "Acelere o seu negócio nos EUA",
    en: "Accelerate your business in the USA",
    es: "Acelere su negocio en los EE.UU.",
  },
  "marketing.hero_subtitle": {
    pt: "Sem enrolação ou termos difíceis. Nós cuidamos do seu site, anúncios, vídeos e aplicativo para você focar apenas em atender seus novos clientes.",
    en: "No jargon or complicated terms. We take care of your website, ads, videos, and app so you can focus on serving your new customers.",
    es: "Sin rodeos ni términos complicados. Nosotros nos encargamos de su sitio web, anuncios, videos y aplicación para que usted se concentre en atender a sus nuevos clientes.",
  },
  "marketing.cta_descricao": {
    pt: "Solicite uma consultoria gratuita e descubra o plano ideal para sua empresa.",
    en: "Request a free consultation and discover the ideal plan for your business.",
    es: "Solicite una consultoría gratuita y descubra el plan ideal para su empresa.",
  },
  "marketing.legacy_nome":       { pt: "LEGACY",              en: "LEGACY",              es: "LEGACY" },
  "marketing.legacy_subtitulo":  { pt: "Postagens Everyday (X) Mensal", en: "Everyday Posts (X) Monthly", es: "Publicaciones Everyday (X) Mensual" },
  "marketing.legacy_tag":        { pt: "★ MAIS COMPLETO",     en: "★ MOST COMPLETE",     es: "★ MÁS COMPLETO" },
  "marketing.prestige_nome":     { pt: "PRESTIGE",            en: "PRESTIGE",            es: "PRESTIGE" },
  "marketing.prestige_subtitulo":{ pt: "Seg a Sábado (X) Mensal", en: "Mon to Sat (X) Monthly", es: "Lun a Sáb (X) Mensual" },
  "marketing.prestige_tag":      { pt: "⚡ MAIS ESCOLHIDO",   en: "⚡ MOST CHOSEN",       es: "⚡ MÁS ELEGIDO" },
  "marketing.essential_nome":    { pt: "ESSENTIAL",           en: "ESSENTIAL",           es: "ESSENTIAL" },
  "marketing.essential_subtitulo":{ pt: "Seg a Sexta (X) Mensal", en: "Mon to Fri (X) Monthly", es: "Lun a Vie (X) Mensual" },
  "marketing.essential_tag":     { pt: "💰 MELHOR CUSTO-BENEFÍCIO", en: "💰 BEST VALUE", es: "💰 MEJOR RELACIÓN CALIDAD-PRECIO" },

  // ═══════════════════════════════════════════════════════════════
  // ABOUT (Quem Somos)
  // ═══════════════════════════════════════════════════════════════
  "about.titulo": {
    pt: "Sobre a ZIMNY Magazine",
    en: "About ZIMNY Magazine",
    es: "Acerca de ZIMNY Magazine",
  },
  "about.paragrafo_1": {
    pt: "A ZIMNY Magazine nasceu de um propósito inabalável: dar voz, visibilidade e pertencimento às histórias que realmente importam. Fundada por brasileiros que imigraram para os Estados Unidos em busca de novas oportunidades, a ZIMNY consolidou-se como uma das revistas mais modernas e influentes de Massachusetts, unindo design sofisticado, conteúdo relevante e uma conexão profunda com a comunidade imigrante.",
    en: "ZIMNY Magazine was born from an unwavering purpose: to give voice, visibility, and belonging to the stories that truly matter. Founded by Brazilians who immigrated to the United States in search of new opportunities, ZIMNY has established itself as one of the most modern and influential magazines in Massachusetts, combining sophisticated design, relevant content, and a deep connection with the immigrant community.",
    es: "ZIMNY Magazine nació de un propósito inquebrantable: dar voz, visibilidad y pertenencia a las historias que realmente importan. Fundada por brasileños que inmigraron a los Estados Unidos en busca de nuevas oportunidades, ZIMNY se ha consolidado como una de las revistas más modernas e influyentes de Massachusetts, combinando diseño sofisticado, contenido relevante y una conexión profunda con la comunidad inmigrante.",
  },
  "about.paragrafo_2": {
    pt: "Criada com a missão de acolher, fortalecer e representar, a ZIMNY Magazine tornou-se uma ponte entre o imigrante e o seu novo mundo — um espaço onde histórias reais ganham reconhecimento e onde identidades são valorizadas.",
    en: "Created with the mission to welcome, strengthen, and represent, ZIMNY Magazine has become a bridge between immigrants and their new world — a space where real stories gain recognition and where identities are valued.",
    es: "Creada con la misión de acoger, fortalecer y representar, ZIMNY Magazine se ha convertido en un puente entre el inmigrante y su nuevo mundo — un espacio donde las historias reales ganan reconocimiento y donde las identidades son valoradas.",
  },
  "about.paragrafo_3": {
    pt: "Mais do que uma revista, a ZIMNY é um movimento de conexão, posicionamento e transformação.",
    en: "More than a magazine, ZIMNY is a movement of connection, positioning, and transformation.",
    es: "Más que una revista, ZIMNY es un movimiento de conexión, posicionamiento y transformación.",
  },
  "about.essencia_titulo": {
    pt: "Nossa Essência",
    en: "Our Essence",
    es: "Nuestra Esencia",
  },
  "about.essencia_p1": {
    pt: "A ZIMNY Magazine existe para restaurar algo que muitos imigrantes perdem ao chegar em um novo país: o senso de pertencimento.",
    en: "ZIMNY Magazine exists to restore something many immigrants lose when arriving in a new country: the sense of belonging.",
    es: "ZIMNY Magazine existe para restaurar algo que muchos inmigrantes pierden al llegar a un nuevo país: el sentido de pertenencia.",
  },
  "about.essencia_p2": {
    pt: "Em um cenário onde o imigrante frequentemente enfrenta invisibilidade, insegurança emocional e o desafio de reconstruir sua vida do zero, a ZIMNY surge como um espaço de acolhimento, representatividade e fortalecimento psicológico.",
    en: "In a scenario where immigrants often face invisibility, emotional insecurity, and the challenge of rebuilding their lives from scratch, ZIMNY emerges as a space of welcome, representation, and psychological strengthening.",
    es: "En un escenario donde el inmigrante a menudo enfrenta invisibilidad, inseguridad emocional y el desafío de reconstruir su vida desde cero, ZIMNY surge como un espacio de acogida, representación y fortalecimiento psicológico.",
  },
  "about.essencia_p3": {
    pt: "Acreditamos que informação, autocuidado, identidade e visibilidade são ferramentas essenciais de transformação.",
    en: "We believe that information, self-care, identity, and visibility are essential tools for transformation.",
    es: "Creemos que la información, el autocuidado, la identidad y la visibilidad son herramientas esenciales de transformación.",
  },
  "about.essencia_p4": {
    pt: "Cada página é construída com um propósito claro: mostrar que nenhuma história é pequena demais e que cada trajetória merece ser vista, respeitada e celebrada.",
    en: "Every page is built with a clear purpose: to show that no story is too small and that every journey deserves to be seen, respected, and celebrated.",
    es: "Cada página se construye con un propósito claro: mostrar que ninguna historia es demasiado pequeña y que cada trayectoria merece ser vista, respetada y celebrada.",
  },
  "about.entregamos_titulo": {
    pt: "O que entregamos",
    en: "What we deliver",
    es: "Lo que ofrecemos",
  },
  "about.entregamos_intro": {
    pt: "A ZIMNY Magazine oferece uma experiência editorial completa, refletindo a vida real da nossa comunidade por meio de conteúdos que abordam:",
    en: "ZIMNY Magazine offers a complete editorial experience, reflecting the real life of our community through content that covers:",
    es: "ZIMNY Magazine ofrece una experiencia editorial completa, reflejando la vida real de nuestra comunidad a través de contenidos que abordan:",
  },
  "about.entregamos_1_titulo": {
    pt: "Bem-estar e saúde emocional",
    en: "Wellness and emotional health",
    es: "Bienestar y salud emocional",
  },
  "about.entregamos_1_desc": {
    pt: "Promovemos equilíbrio, autoestima e autocuidado através de colunas dedicadas à saúde, bem-estar e estética.",
    en: "We promote balance, self-esteem, and self-care through columns dedicated to health, wellness, and aesthetics.",
    es: "Promovemos equilibrio, autoestima y autocuidado a través de columnas dedicadas a la salud, el bienestar y la estética.",
  },
  "about.entregamos_2_titulo": {
    pt: "Identidade, cultura e estilo de vida",
    en: "Identity, culture, and lifestyle",
    es: "Identidad, cultura y estilo de vida",
  },
  "about.entregamos_2_desc": {
    pt: "Celebramos nossas raízes, histórias, moda, empreendedorismo, maternidade e os desafios e conquistas de viver entre duas culturas.",
    en: "We celebrate our roots, stories, fashion, entrepreneurship, motherhood, and the challenges and achievements of living between two cultures.",
    es: "Celebramos nuestras raíces, historias, moda, emprendimiento, maternidad y los desafíos y logros de vivir entre dos culturas.",
  },
  "about.entregamos_3_titulo": {
    pt: "Sobrevivência prática e crescimento pessoal",
    en: "Practical survival and personal growth",
    es: "Supervivencia práctica y crecimiento personal",
  },
  "about.entregamos_3_desc": {
    pt: "Oferecemos orientação, informação e histórias que fortalecem e inspiram imigrantes em sua jornada.",
    en: "We offer guidance, information, and stories that strengthen and inspire immigrants on their journey.",
    es: "Ofrecemos orientación, información e historias que fortalecen e inspiran a inmigrantes en su viaje.",
  },
  "about.entregamos_4_titulo": {
    pt: "Histórias reais e representatividade",
    en: "Real stories and representation",
    es: "Historias reales y representatividad",
  },
  "about.entregamos_4_desc": {
    pt: "Damos visibilidade a empresários, famílias, artistas e líderes que estão construindo novos caminhos nos Estados Unidos.",
    en: "We give visibility to entrepreneurs, families, artists, and leaders who are building new paths in the United States.",
    es: "Damos visibilidad a emprendedores, familias, artistas y líderes que están construyendo nuevos caminos en los Estados Unidos.",
  },
  "about.entregamos_5_titulo": {
    pt: "Reconhecimento e credibilidade",
    en: "Recognition and credibility",
    es: "Reconocimiento y credibilidad",
  },
  "about.entregamos_5_desc": {
    pt: "A ZIMNY Magazine é vencedora do Troféu Imprensa Destaque 2025, um reconhecimento que reforça nosso compromisso com a excelência, verdade e impacto social.",
    en: "ZIMNY Magazine is the winner of the Troféu Imprensa Destaque 2025, an award that reinforces our commitment to excellence, truth, and social impact.",
    es: "ZIMNY Magazine es ganadora del Troféu Imprensa Destaque 2025, un reconocimiento que refuerza nuestro compromiso con la excelencia, la verdad y el impacto social.",
  },
  "about.ecossistema_titulo": {
    pt: "Um ecossistema completo de comunicação",
    en: "A complete communication ecosystem",
    es: "Un ecosistema completo de comunicación",
  },
  "about.ecossistema_intro": {
    pt: "A ZIMNY Magazine faz parte de um ecossistema integrado com a Luz Production, conectando mídia, eventos, marketing e posicionamento estratégico. Esse ecossistema inclui:",
    en: "ZIMNY Magazine is part of an integrated ecosystem with Luz Production, connecting media, events, marketing, and strategic positioning. This ecosystem includes:",
    es: "ZIMNY Magazine es parte de un ecosistema integrado con Luz Production, conectando medios, eventos, marketing y posicionamiento estratégico. Este ecosistema incluye:",
  },
  "about.ecossistema_item_1": {
    pt: "Revista impressa com distribuição estratégica",
    en: "Print magazine with strategic distribution",
    es: "Revista impresa con distribución estratégica",
  },
  "about.ecossistema_item_2": {
    pt: "Portal digital trilíngue",
    en: "Trilingual digital portal",
    es: "Portal digital trilingüe",
  },
  "about.ecossistema_item_3": {
    pt: "Podcast e entrevistas exclusivas",
    en: "Podcast and exclusive interviews",
    es: "Podcast y entrevistas exclusivas",
  },
  "about.ecossistema_item_4": {
    pt: "Cobertura de eventos e histórias da comunidade",
    en: "Event coverage and community stories",
    es: "Cobertura de eventos e historias de la comunidad",
  },
  "about.ecossistema_item_5": {
    pt: "Plataformas de visibilidade empresarial",
    en: "Business visibility platforms",
    es: "Plataformas de visibilidad empresarial",
  },
  "about.ecossistema_item_6": {
    pt: "Assessoria pessoal e em eventos de networking",
    en: "Personal advisory and networking events",
    es: "Asesoría personal y en eventos de networking",
  },
  "about.ecossistema_item_7": {
    pt: "Assessoria em marketing digital",
    en: "Digital marketing advisory",
    es: "Asesoría en marketing digital",
  },
  "about.ecossistema_item_8": {
    pt: "Produção de eventos e experiências exclusivas",
    en: "Event production and exclusive experiences",
    es: "Producción de eventos y experiencias exclusivas",
  },
  "about.ecossistema_outro": {
    pt: "Mais do que mídia, oferecemos autoridade, conexão e posicionamento.",
    en: "More than media, we offer authority, connection, and positioning.",
    es: "Más que medios, ofrecemos autoridad, conexión y posicionamiento.",
  },
  "about.trilingue_titulo": {
    pt: "A ZIMNY agora é trilíngue",
    en: "ZIMNY is now trilingual",
    es: "ZIMNY ahora es trilingüe",
  },
  "about.trilingue_intro": {
    pt: "Em 2026, a ZIMNY Magazine inicia um novo capítulo de expansão com o lançamento de seu portal totalmente trilíngue, oferecendo conteúdo em:",
    en: "In 2026, ZIMNY Magazine begins a new chapter of expansion with the launch of its fully trilingual portal, offering content in:",
    es: "En 2026, ZIMNY Magazine inicia un nuevo capítulo de expansión con el lanzamiento de su portal totalmente trilingüe, ofreciendo contenido en:",
  },
  "about.trilingue_item_1": { pt: "Português", en: "Portuguese", es: "Portugués" },
  "about.trilingue_item_2": { pt: "Inglês",    en: "English",    es: "Inglés" },
  "about.trilingue_item_3": { pt: "Espanhol",  en: "Spanish",    es: "Español" },
  "about.trilingue_outro": {
    pt: "Essa evolução permite conectar a comunidade imigrante ao público americano e ampliar ainda mais o alcance das histórias, marcas e protagonistas que representamos.",
    en: "This evolution allows us to connect the immigrant community with the American audience and further expand the reach of the stories, brands, and protagonists we represent.",
    es: "Esta evolución permite conectar a la comunidad inmigrante con el público americano y ampliar aún más el alcance de las historias, marcas y protagonistas que representamos.",
  },
  "about.impressa_titulo": {
    pt: "Nossa edição impressa",
    en: "Our print edition",
    es: "Nuestra edición impresa",
  },
  "about.impressa_intro": {
    pt: "A edição impressa é um dos pilares mais fortes da ZIMNY Magazine e um dos principais canais de conexão com o público.",
    en: "The print edition is one of the strongest pillars of ZIMNY Magazine and one of the main channels of connection with the audience.",
    es: "La edición impresa es uno de los pilares más fuertes de ZIMNY Magazine y uno de los principales canales de conexión con el público.",
  },
  "about.impressa_en_titulo": {
    pt: "Edição mensal em inglês",
    en: "Monthly English edition",
    es: "Edición mensual en inglés",
  },
  "about.impressa_en_item_1": {
    pt: "Mais de 2.000 exemplares por edição",
    en: "Over 2,000 copies per edition",
    es: "Más de 2.000 ejemplares por edición",
  },
  "about.impressa_en_item_2": {
    pt: "Distribuição gratuita e estratégica",
    en: "Free and strategic distribution",
    es: "Distribución gratuita y estratégica",
  },
  "about.impressa_en_item_3": {
    pt: "Foco no público americano e multicultural",
    en: "Focus on American and multicultural audience",
    es: "Enfoque en el público americano y multicultural",
  },
  "about.impressa_pt_titulo": {
    pt: "Edição premium em português (semestral)",
    en: "Premium Portuguese edition (biannual)",
    es: "Edición premium en portugués (semestral)",
  },
  "about.impressa_pt_item_1": {
    pt: "Conteúdo exclusivo e altamente editorial",
    en: "Exclusive and highly editorial content",
    es: "Contenido exclusivo y altamente editorial",
  },
  "about.impressa_pt_item_2": {
    pt: "Edições especiais e colecionáveis",
    en: "Special and collectible editions",
    es: "Ediciones especiales y coleccionables",
  },
  "about.impressa_pt_item_3": {
    pt: "Forte conexão emocional com a comunidade brasileira",
    en: "Strong emotional connection with the Brazilian community",
    es: "Fuerte conexión emocional con la comunidad brasileña",
  },
  "about.distribuicao_titulo": {
    pt: "Distribuição e Cobertura",
    en: "Distribution and Coverage",
    es: "Distribución y Cobertura",
  },
  "about.distribuicao_intro": {
    pt: "A ZIMNY Magazine está presente nas regiões onde nossa comunidade vive, trabalha e empreende, garantindo alcance estratégico e impacto real:",
    en: "ZIMNY Magazine is present in the regions where our community lives, works, and undertakes, ensuring strategic reach and real impact:",
    es: "ZIMNY Magazine está presente en las regiones donde nuestra comunidad vive, trabaja y emprende, garantizando alcance estratégico e impacto real:",
  },
  "about.distribuicao_ma_titulo": { pt: "Massachusetts (MA)", en: "Massachusetts (MA)", es: "Massachusetts (MA)" },
  "about.distribuicao_ma_desc": {
    pt: "Nossa base e o coração da operação, com distribuição em cidades-chave e centros empresariais brasileiros e americanos.",
    en: "Our base and the heart of the operation, with distribution in key cities and Brazilian and American business centers.",
    es: "Nuestra base y el corazón de la operación, con distribución en ciudades clave y centros empresariales brasileños y americanos.",
  },
  "about.distribuicao_ri_titulo": { pt: "Rhode Island (RI)", en: "Rhode Island (RI)", es: "Rhode Island (RI)" },
  "about.distribuicao_ri_desc": {
    pt: "Presença ativa em uma região com forte concentração da comunidade brasileira, ampliando a conexão entre marcas e público.",
    en: "Active presence in a region with a strong concentration of the Brazilian community, expanding the connection between brands and audience.",
    es: "Presencia activa en una región con fuerte concentración de la comunidad brasileña, ampliando la conexión entre marcas y público.",
  },
  "about.distribuicao_nh_titulo": {
    pt: "New Hampshire (NH) & Connecticut (CT)",
    en: "New Hampshire (NH) & Connecticut (CT)",
    es: "New Hampshire (NH) & Connecticut (CT)",
  },
  "about.distribuicao_nh_desc": {
    pt: "Atendendo a uma comunidade imigrante em constante crescimento e a uma demanda crescente por visibilidade e representação.",
    en: "Serving a constantly growing immigrant community and an increasing demand for visibility and representation.",
    es: "Atendiendo a una comunidad inmigrante en constante crecimiento y a una demanda creciente de visibilidad y representación.",
  },
  "about.distribuicao_me_titulo": {
    pt: "Maine (ME) & Vermont (VT)",
    en: "Maine (ME) & Vermont (VT)",
    es: "Maine (ME) & Vermont (VT)",
  },
  "about.distribuicao_me_desc": {
    pt: "Levando informação, representatividade e oportunidades a mais estados da Nova Inglaterra, expandindo o alcance da nossa missão.",
    en: "Bringing information, representation, and opportunities to more New England states, expanding the reach of our mission.",
    es: "Llevando información, representación y oportunidades a más estados de Nueva Inglaterra, expandiendo el alcance de nuestra misión.",
  },
  "about.footer_titulo": {
    pt: "A ZIMNY Magazine existe para garantir que nenhuma história seja invisível.",
    en: "ZIMNY Magazine exists to ensure that no story is invisible.",
    es: "ZIMNY Magazine existe para garantizar que ninguna historia sea invisible.",
  },
  "about.footer_p1": {
    pt: "Existimos para dar voz. Para criar pertencimento. Para conectar culturas. Para fortalecer identidades. Para transformar histórias em legado.",
    en: "We exist to give voice. To create belonging. To connect cultures. To strengthen identities. To transform stories into legacy.",
    es: "Existimos para dar voz. Para crear pertenencia. Para conectar culturas. Para fortalecer identidades. Para transformar historias en legado.",
  },
  "about.footer_p2": {
    pt: "A ZIMNY Magazine é para aqueles que tiveram coragem de recomeçar.",
    en: "ZIMNY Magazine is for those who had the courage to start over.",
    es: "ZIMNY Magazine es para aquellos que tuvieron el coraje de empezar de nuevo.",
  },
  "about.footer_cta_1": { pt: "É sobre identidade.",       en: "It's about identity.",       es: "Se trata de identidad." },
  "about.footer_cta_2": { pt: "É sobre pertencimento.",     en: "It's about belonging.",      es: "Se trata de pertenencia." },
  "about.footer_cta_3": { pt: "É sobre protagonismo.",      en: "It's about protagonism.",    es: "Se trata de protagonismo." },
  "about.footer_cta_4": { pt: "É sobre você.",              en: "It's about you.",            es: "Se trata de ti." },
  "about.footer_cta_5": { pt: "E é por você.",              en: "And it's for you.",          es: "Y es por ti." },
  "about.contato_intro": {
    pt: "Fale com a equipe ZIMNY — dúvidas, sugestões de pauta ou anúncios. Respondemos rapidinho.",
    en: "Talk to the ZIMNY team — questions, story tips or advertising. We reply quickly.",
    es: "Habla con el equipo ZIMNY — dudas, sugerencias de temas o publicidad. Respondemos rápido.",
  },

  // ═══════════════════════════════════════════════════════════════
  // COMMON / GERAL
  // ═══════════════════════════════════════════════════════════════
  "common.carregando":       { pt: "Carregando...",       en: "Loading...",       es: "Cargando..." },
  "common.erro":             { pt: "Erro",                en: "Error",            es: "Error" },
  "common.tentar_novamente": { pt: "Tentar novamente",    en: "Try again",        es: "Intentar de nuevo" },
  "common.voltar":           { pt: "Voltar",              en: "Back",             es: "Volver" },
  "common.compartilhar":     { pt: "Compartilhar",        en: "Share",            es: "Compartir" },
  "common.favoritos":        { pt: "Favoritos",           en: "Favorites",        es: "Favoritos" },
  "common.buscar":           { pt: "Buscar",              en: "Search",           es: "Buscar" },
  "common.pesquisar":        { pt: "Pesquisar",           en: "Search",           es: "Buscar" },
  "common.cobertura":        { pt: "Cobertura",           en: "Coverage",         es: "Cobertura" },
  "common.destaque":         { pt: "DESTAQUE",            en: "HIGHLIGHT",        es: "DESTACADO" },
  "common.continue_lendo":   { pt: "CONTINUE LENDO",      en: "CONTINUE READING", es: "CONTINÚA LEYENDO" },
  "common.idioma_edicao":    { pt: "IDIOMA DA EDIÇÃO",    en: "EDITION LANGUAGE",  es: "IDIOMA DE LA EDICIÓN" },
  "common.ver_mais":         { pt: "VER MAIS",            en: "SEE MORE",         es: "VER MÁS" },
  "common.mais_eventos":     { pt: "MAIS EVENTOS",        en: "MORE EVENTS",      es: "MÁS EVENTOS" },

  // ═══════════════════════════════════════════════════════════════
  // HOME
  // ═══════════════════════════════════════════════════════════════
  "home.revista_zimny":      { pt: "Revista Zimny",             en: "Zimny Magazine",            es: "Revista Zimny" },
  "home.coberturas":         { pt: "Coberturas",                en: "Coverage",                  es: "Coberturas" },
  "home.coluna_do_dia":      { pt: "Coluna do Dia",             en: "Column of the Day",         es: "Columna del Día" },
  "home.producoes_eventos":  { pt: "Produções de eventos",      en: "Event Productions",         es: "Producciones de eventos" },
  "home.galerias":           { pt: "Galerias",                  en: "Galleries",                 es: "Galerías" },
  "home.marketing_digital":  { pt: "Marketing Digital",         en: "Digital Marketing",         es: "Marketing Digital" },
  "home.marketing_services": { pt: "NOSSOS SERVIÇOS",           en: "OUR SERVICES",              es: "NUESTROS SERVICIOS" },
  "home.service_3d":            { pt: "Modelação 3D (Produtos)",      en: "3D Modeling (Products)",     es: "Modelado 3D (Productos)" },
  "home.service_motion":        { pt: "Motion Design (Animação)",     en: "Motion Design (Animation)",  es: "Motion Design (Animación)" },
  "home.service_website":       { pt: "Website",                     en: "Website",                    es: "Website" },
  "home.service_ecommerce":     { pt: "E-commerce",                  en: "E-commerce",                 es: "E-commerce" },
  "home.service_landing":       { pt: "Landing Page",                en: "Landing Page",               es: "Landing Page" },
  "home.service_sistemas":      { pt: "Sistemas",                    en: "Systems",                    es: "Sistemas" },
  "home.service_automacao":     { pt: "Automação",                   en: "Automation",                 es: "Automatización" },
  "home.service_assistente":    { pt: "Assistente Virtual 24h",      en: "24/7 Virtual Assistant",     es: "Asistente Virtual 24h" },
  "home.service_softwares":     { pt: "Softwares",                   en: "Software",                   es: "Software" },
  "home.service_ia":            { pt: "Integração de IA",            en: "AI Integration",             es: "Integración de IA" },
  "home.service_agentes":       { pt: "Agentes de Atendimento",      en: "Support Agents",             es: "Agentes de Atención" },
  "home.service_integracao":    { pt: "Integração entre Departamentos", en: "Department Integration",  es: "Integración de Departamentos" },
  "home.service_personalizados":{ pt: "Sistemas Personalizados",     en: "Custom Systems",             es: "Sistemas Personalizados" },
  "home.service_app":           { pt: "APP Mobile",                  en: "Mobile App",                 es: "APP Móvil" },
  "home.podcast":            { pt: "Podcast",                   en: "Podcast",                   es: "Podcast" },
  "home.editorias":          { pt: "Editorias",                 en: "Sections",                  es: "Secciones" },
  "home.hero_kicker":        { pt: "EXCLUSIVO · EDIÇÃO ATUAL",  en: "EXCLUSIVE · CURRENT ISSUE", es: "EXCLUSIVO · EDICIÓN ACTUAL" },
  "home.hero_capa":          { pt: "CAPA",                      en: "COVER",                     es: "PORTADA" },

  // ═══════════════════════════════════════════════════════════════
  // HOME — "Anuncie na Revista" (hardcoded, sem plugin)
  // ═══════════════════════════════════════════════════════════════
  "home.anuncie_revista_title": {
    pt: "ANUNCIE NA REVISTA!",
    en: "ADVERTISE WITH US!",
    es: "¡ANUNCIE EN LA REVISTA!",
  },
  "home.anuncie_revista_desc": {
    pt: "Revista impressa mensalmente na língua inglesa e distribuída de forma gratuita aos arredores de MA, NH, CT, ME, RI e VT.",
    en: "Monthly print magazine, distributed for free across    MA, NH, CT, ME, RI, and VT.",
    es: "Revista impresa mensualmente en inglés y distribuida de forma gratuita en las áreas de MA, NH, CT, ME, RI y VT.",
  },
  "home.anuncie_revista_cta": {
    pt: "ANUNCIE AGORA",
    en: "ADVERTISE NOW",
    es: "ANUNCIA AHORA",
  },

  // ═══════════════════════════════════════════════════════════════
  // ERROR STATES
  // ═══════════════════════════════════════════════════════════════
  "error.padrao_titulo":     { pt: "Algo deu errado",                    en: "Something went wrong",              es: "Algo salió mal" },
  "error.padrao_msg":        { pt: "Verifique sua conexão e tente novamente.", en: "Check your connection and try again.", es: "Verifique su conexión e intente de nuevo." },

  // ═══════════════════════════════════════════════════════════════
  // MAGAZINE
  // ═══════════════════════════════════════════════════════════════
  "magazine.indisponivel_titulo": { pt: "Edições indisponíveis",                          en: "Editions unavailable",                    es: "Ediciones no disponibles" },
  "magazine.indisponivel_msg":    { pt: "Não foi possível carregar as edições da revista.", en: "Could not load magazine editions.",       es: "No se pudieron cargar las ediciones de la revista." },

  // ═══════════════════════════════════════════════════════════════
  // PODCAST
  // ═══════════════════════════════════════════════════════════════
  "podcast.indisponivel_titulo": { pt: "Podcast indisponível",                                       en: "Podcast unavailable",                                  es: "Podcast no disponible" },
  "podcast.indisponivel_msg":    { pt: "Não foi possível carregar os episódios do YouTube no momento.", en: "Could not load YouTube episodes at this time.",          es: "No se pudieron cargar los episodios de YouTube en este momento." },

  // ═══════════════════════════════════════════════════════════════
  // TV (additional)
  // ═══════════════════════════════════════════════════════════════
  "tv.indisponivel_titulo": { pt: "Transmissão indisponível",                          en: "Transmission unavailable",                  es: "Transmisión no disponible" },
  "tv.indisponivel_msg":    { pt: "Não foi possível carregar a Zimny TV no momento.",    en: "Could not load Zimny TV at this time.",      es: "No se pudo cargar Zimny TV en este momento." },
  "tv.sem_transmissao":    { pt: "Nenhuma transmissão disponível no momento",           en: "No transmission available at this time",     es: "Ninguna transmisión disponible en este momento" },
  "tv.ao_vivo_tag":        { pt: "AO VIVO",                                             en: "LIVE",                                      es: "EN VIVO" },
  "tv.termina_as":         { pt: "Termina às",                                           en: "Ends at",                                   es: "Termina a las" },

  // ═══════════════════════════════════════════════════════════════
  // COBERTURA (additional)
  // ═══════════════════════════════════════════════════════════════
  "cobertura.erro_carregar": { pt: "Erro ao carregar vídeos", en: "Error loading videos", es: "Error al cargar videos" },
  "cobertura.sem_videos":    { pt: "Nenhum vídeo encontrado", en: "No videos found",      es: "No se encontraron videos" },

  // ═══════════════════════════════════════════════════════════════
  // EVENTS (additional)
  // ═══════════════════════════════════════════════════════════════
  "events.erro_carregar": { pt: "Erro ao carregar eventos", en: "Error loading events", es: "Error al cargar eventos" },
  "events.sem_eventos":   { pt: "Nenhum evento encontrado", en: "No events found",      es: "No se encontraron eventos" },

  // ═══════════════════════════════════════════════════════════════
  // COLUNISTAS
  // ═══════════════════════════════════════════════════════════════
  "colunistas.titulo":        { pt: "COLUNISTAS",                                 en: "COLUMNISTS",                                es: "COLUMNISTAS" },
  "colunistas.subtitulo":     { pt: "{{count}} colunistas · {{fixed}} com coluna fixa", en: "{{count}} columnists · {{fixed}} with fixed column", es: "{{count}} columnistas · {{fixed}} con columna fija" },
  "colunistas.sem_colunistas":{ pt: "Nenhum colunista encontrado",                en: "No columnists found",                       es: "No se encontraron columnistas" },
  "colunistas.colunista":     { pt: "Colunista",                                  en: "Columnist",                                es: "Columnista" },
  "colunistas.sem_artigos":   { pt: "Nenhum artigo encontrado",                   en: "No articles found",                        es: "No se encontraron artículos" },
  "colunistas.artigo_count":  { pt: "{{count}} artigo",                           en: "{{count}} article",                        es: "{{count}} artículo" },
  "colunistas.artigos_count": { pt: "{{count}} artigos",                          en: "{{count}} articles",                       es: "{{count}} artículos" },
  "colunistas.segunda":       { pt: "SEGUNDA-FEIRA",                              en: "MONDAY",                                    es: "LUNES" },
  "colunistas.terca":         { pt: "TERÇA-FEIRA",                                en: "TUESDAY",                                   es: "MARTES" },
  "colunistas.quarta":        { pt: "QUARTA-FEIRA",                               en: "WEDNESDAY",                                 es: "MIÉRCOLES" },
  "colunistas.quinta":        { pt: "QUINTA-FEIRA",                               en: "THURSDAY",                                  es: "JUEVES" },
  "colunistas.sexta":         { pt: "SEXTA-FEIRA",                                en: "FRIDAY",                                    es: "VIERNES" },
  "colunistas.sabado":        { pt: "SÁBADO",                                     en: "SATURDAY",                                  es: "SÁBADO" },
  "colunistas.domingo":       { pt: "DOMINGO",                                    en: "SUNDAY",                                    es: "DOMINGO" },

  // ═══════════════════════════════════════════════════════════════
  // AUTHOR LABELS
  // ═══════════════════════════════════════════════════════════════
  "author.ceo_editor":  { pt: "CEO & Editor-Chefe",  en: "CEO & Editor-in-Chief",  es: "CEO y Editor Jefe" },
  "author.redacao":     { pt: "Redação",             en: "Editorial Team",         es: "Redacción" },
  "author.colunista":   { pt: "Colunista",           en: "Columnist",              es: "Columnista" },

  // ═══════════════════════════════════════════════════════════════
  // LOGIN
  // ═══════════════════════════════════════════════════════════════
  "login.sessao":     { pt: "Sessão",                                                                        en: "Session",                                                                       es: "Sesión" },
  "login.sair":       { pt: "Sair",                                                                          en: "Log out",                                                                       es: "Salir" },
  "login.acesso":     { pt: "Acesso",                                                                        en: "Access",                                                                        es: "Acceso" },
  "login.entrar":     { pt: "Entrar",                                                                        en: "Sign in",                                                                       es: "Iniciar sesión" },
  "login.email":      { pt: "E-mail",                                                                        en: "Email",                                                                         es: "Correo electrónico" },
  "login.senha":      { pt: "Senha",                                                                         en: "Password",                                                                      es: "Contraseña" },
  "login.disclaimer": { pt: "Autenticação de demonstração — substitua por API segura.",                       en: "Demo authentication — replace with secure API.",                              es: "Autenticación de demostración — reemplazar con API segura." },

  // ═══════════════════════════════════════════════════════════════
  // TAB LABELS
  // ═══════════════════════════════════════════════════════════════
  "tab.home":       { pt: "HOME",              en: "HOME",              es: "INICIO" },
  "tab.noticias":   { pt: "NOTÍCIAS",          en: "NEWS",              es: "NOTICIAS" },
  "tab.revista":    { pt: "REVISTA",           en: "MAGAZINE",          es: "REVISTA" },
  "tab.podcast":    { pt: "PODCAST",           en: "PODCAST",           es: "PODCAST" },
  "tab.cobertura":  { pt: "COBERTURA",         en: "COVERAGE",          es: "COBERTURA" },
  "tab.ao_vivo":    { pt: "AO VIVO",           en: "LIVE",              es: "EN VIVO" },
  "tab.eventos":    { pt: "EVENTOS",           en: "EVENTS",            es: "EVENTOS" },
  "tab.marketing":  { pt: "MARKETING DIGITAL", en: "DIGITAL MARKETING", es: "MARKETING DIGITAL" },
  "tab.colunistas": { pt: "COLUNISTAS",        en: "COLUMNISTS",        es: "COLUMNISTAS" },
  "tab.explorar":   { pt: "EXPLORAR",          en: "EXPLORE",           es: "EXPLORAR" },

  // ═══════════════════════════════════════════════════════════════
  // MARKETING DIGITAL (additional)
  // ═══════════════════════════════════════════════════════════════
  "marketing.pacotes_prontos":  { pt: "Pacotes Prontos",                                            en: "Ready Packages",                                      es: "Paquetes Listos" },
  "marketing.o_que_fazemos":    { pt: "O Que Fazemos",                                              en: "What We Do",                                         es: "Lo Que Hacemos" },
  "marketing.bonus_exclusivos": { pt: "BÔNUS EXCLUSIVOS",                                           en: "EXCLUSIVE BONUSES",                                   es: "BONIFICACIONES EXCLUSIVAS" },
  "marketing.quero_este_plano": { pt: "QUERO ESTE PLANO",                                           en: "I WANT THIS PLAN",                                   es: "QUIERO ESTE PLAN" },
  "marketing.explicacao_intro": { pt: "Entenda abaixo tudo o que nossa agência pode fazer pela sua empresa, explicado de forma simples:", en: "Below is everything our agency can do for your business, explained simply:", es: "A continuación, todo lo que nuestra agencia puede hacer por su empresa, explicado de forma sencilla:" },
  "marketing.destaques_bonus":  { pt: "Destaques / Bônus",                                          en: "Highlights / Bonuses",                                es: "Destacados / Bonificaciones" },
  "marketing.hero_kicker":      { pt: "MARKETING DIGITAL & TECNOLOGIA",                             en: "DIGITAL MARKETING & TECHNOLOGY",                      es: "MARKETING DIGITAL Y TECNOLOGÍA" },
  "marketing.stat_servicos":    { pt: "Serviços",                                                   en: "Services",                                            es: "Servicios" },
  "marketing.stat_pacotes":     { pt: "Pacotes",                                                    en: "Packages",                                            es: "Paquetes" },
  "marketing.stat_atendimento": { pt: "Atendimento 24h",                                            en: "24/7 Support",                                        es: "Atención 24h" },
  "marketing.pacotes_intro":    { pt: "Escolha o nível ideal para o seu momento e deslize para comparar os pacotes lado a lado.", en: "Pick the ideal level for your moment and swipe to compare packages side by side.", es: "Elige el nivel ideal para tu momento y desliza para comparar los paquetes lado a lado." },
  "marketing.compare_hint":     { pt: "Deslize para comparar lado a lado",                          en: "Swipe to compare side by side",                       es: "Desliza para comparar lado a lado" },
  "marketing.servicos_intro":   { pt: "Tudo o que nossa agência faz pela sua empresa — atualizado e explicado de forma simples.", en: "Everything our agency does for your business — updated and explained simply.", es: "Todo lo que nuestra agencia hace por su empresa — actualizado y explicado de forma sencilla." },
  "marketing.cta_especialista": { pt: "Fale com um especialista",                                   en: "Talk to an expert",                                   es: "Habla con un experto" },

  // ═══════════════════════════════════════════════════════════════
  // NEWS (Notícias — subcategorias editoriais e estados)
  // ═══════════════════════════════════════════════════════════════
  "news.cat_206": { pt: "New England", en: "New England", es: "New England" },
  "news.cat_207": { pt: "Comunidade", en: "Community", es: "Comunidad" },
  "news.cat_208": { pt: "Mundo", en: "World", es: "Mundo" },
  "news.cat_209": { pt: "Cultura", en: "Culture", es: "Cultura" },
  "news.cat_210": { pt: "Business", en: "Business", es: "Business" },
  "news.cat_211": { pt: "Ciência & Tecnologia", en: "Science & Tech", es: "Ciencia y Tecnología" },
  "news.cat_212": { pt: "Esportes", en: "Sports", es: "Deportes" },
  "news.indisponivel_titulo": { pt: "Notícias indisponíveis", en: "News unavailable", es: "Noticias no disponibles" },
  "news.indisponivel_msg": {
    pt: "Não foi possível carregar as notícias. Verifique sua conexão.",
    en: "Could not load the news. Check your connection.",
    es: "No se pudieron cargar las noticias. Verifica tu conexión.",
  },
  "news.categoria_erro_titulo": { pt: "Sem notícias", en: "No stories", es: "Sin noticias" },
  "news.categoria_erro_msg": {
    pt: "Não foi possível carregar esta categoria. Verifique sua conexão.",
    en: "Could not load this category. Check your connection.",
    es: "No se pudo cargar esta categoría. Verifica tu conexión.",
  },
  "news.categoria_vazia": {
    pt: "Nenhuma notícia publicada nesta categoria ainda.",
    en: "No stories published in this category yet.",
    es: "Aún no hay noticias publicadas en esta categoría.",
  },
  "news.categoria_numero": { pt: "Categoria {{id}}", en: "Category {{id}}", es: "Categoría {{id}}" },

  // ═══════════════════════════════════════════════════════════════
  // LANGUAGE SWITCHER
  // ═══════════════════════════════════════════════════════════════
  "language.pt":             { pt: "PT",                  en: "PT",               es: "PT" },
  "language.en":             { pt: "EN",                  en: "EN",               es: "EN" },
  "language.es":             { pt: "ES",                  en: "ES",               es: "ES" },
  "language.portugues":      { pt: "Português",           en: "Portuguese",       es: "Portugués" },
  "language.english":        { pt: "Inglês",              en: "English",          es: "Inglés" },
  "language.espanol":        { pt: "Espanhol",            en: "Spanish",          es: "Español" },
};