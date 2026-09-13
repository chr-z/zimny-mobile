/**
 * MarketingDigitalScreen — Ecossistema Completo de Marketing Digital & Tecnologia.
 *
 * Página dedicada de Marketing Digital, totalmente redesenhada:
 *  - Hero com identidade própria (kicker, título, subtítulo e métricas-chave).
 *  - Comparação de pacotes em carrossel horizontal com "peek" — o próximo card
 *    fica parcialmente visível, permitindo comparar os planos lado a lado
 *    deslizando, sem depender de rolagem vertical.
 *  - Base de serviços atualizada e completa, incluindo os novos serviços de
 *    tecnologia (3D, Motion, IA, Automação, Assistente Virtual etc.).
 *  - CTA de atendimento humano direto.
 *
 * Todo o conteúdo (planos e serviços) é trilíngue: os dados usam o tipo
 * LocalizedText { pt, en, es } e são resolvidos pelo idioma ativo do app.
 *
 * Estética: Quiet Luxury (preto & branco) com acento lilás (#8C5CD0),
 * identidade da seção de Marketing Digital.
 */
import FontAwesome from "@expo/vector-icons/FontAwesome";
import React, { useCallback, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Linking,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { GlassView } from "@/src/components/common/GlassView";
import { color, font, radius, spacing } from "@/src/constants/designTokens";
import { useTranslation } from "@/src/i18n";

// ─── Contatos ───────────────────────────────────────────────────────────────
const WHATSAPP_NUMBER = "+19785596949";
const WHATSAPP_DIGITS = WHATSAPP_NUMBER.replace(/\D/g, "");
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_DIGITS}`;
const EMAIL_ADDRESS = "info@zimnymagazine.com";

// ─── Constantes de layout do carrossel ──────────────────────────────────────
const { width: SCREEN_W } = Dimensions.get("window");
const PLAN_SIDE_MARGIN = 16; // margem externa (equivale a spacing.lg)
const PLAN_PEEK = 56; // quanto do próximo card fica visível (efeito lado a lado)
const PLAN_GAP = 12; // espaçamento entre cards
const PLAN_W = SCREEN_W - PLAN_SIDE_MARGIN * 2 - PLAN_PEEK;
const PLAN_SNAP = PLAN_W + PLAN_GAP;

// ─── Tipos ──────────────────────────────────────────────────────────────────
/** Texto em três idiomas (pt / en / es). */
interface LocalizedText {
  pt: string;
  en: string;
  es: string;
}

interface ServiceFeature {
  title: LocalizedText;
  description: LocalizedText;
}

interface ServiceCategory {
  id: string;
  iconName: React.ComponentProps<typeof FontAwesome>["name"];
  categoryName: LocalizedText;
  tagline: LocalizedText;
  features: ServiceFeature[];
}

interface Plan {
  planKey: "essential" | "prestige" | "legacy";
  name: string;
  badge: LocalizedText;
  accentColor: string;
  tagline: LocalizedText;
  priceHighlight: LocalizedText;
  includedCategories: { title: LocalizedText; items: LocalizedText[] }[];
  exclusiveBonuses: LocalizedText[];
}

// ─── Base de Serviços (trilíngue e completa) ────────────────────────────────
const ALL_SERVICES: ServiceCategory[] = [
  {
    id: "web_apps",
    iconName: "laptop",
    categoryName: {
      pt: "Desenvolvimento Web & Apps",
      en: "Web & App Development",
      es: "Desarrollo Web y Apps",
    },
    tagline: {
      pt: "Sua vitrine digital completa",
      en: "Your complete digital storefront",
      es: "Tu vitrina digital completa",
    },
    features: [
      {
        title: { pt: "Website Profissional", en: "Professional Website", es: "Sitio Web Profesional" },
        description: {
          pt: "Site bonito, rápido e que funciona perfeitamente no celular e no computador — a porta de entrada da sua marca na internet.",
          en: "A beautiful, fast website that works perfectly on mobile and desktop — the gateway to your brand online.",
          es: "Un sitio web bonito, rápido y que funciona perfectamente en móvil y ordenador: la puerta de entrada de tu marca en internet.",
        },
      },
      {
        title: { pt: "E-commerce", en: "E-commerce", es: "E-commerce" },
        description: {
          pt: "Loja virtual completa com carrinho, pagamentos e catálogo de produtos para vender online 24 horas por dia.",
          en: "A complete online store with cart, payments, and product catalog to sell online 24 hours a day.",
          es: "Tienda virtual completa con carrito, pagos y catálogo de productos para vender en línea 24 horas al día.",
        },
      },
      {
        title: { pt: "Landing Page", en: "Landing Page", es: "Landing Page" },
        description: {
          pt: "Página de alta conversão para campanhas, captura de clientes e lançamento de produtos específicos.",
          en: "A high-conversion page for campaigns, lead capture, and launching specific products.",
          es: "Página de alta conversión para campañas, captura de clientes y lanzamiento de productos específicos.",
        },
      },
      {
        title: { pt: "Sistemas Personalizados", en: "Custom Systems", es: "Sistemas Personalizados" },
        description: {
          pt: "Painéis e sistemas de gestão sob medida para controlar agendamentos, clientes, estoque e vendas.",
          en: "Custom dashboards and management systems to control appointments, customers, inventory, and sales.",
          es: "Paneles y sistemas de gestión a medida para controlar citas, clientes, inventario y ventas.",
        },
      },
      {
        title: { pt: "Softwares Sob Medida", en: "Custom Software", es: "Software a Medida" },
        description: {
          pt: "Software desenvolvido exatamente para o seu processo, integrado à operação da sua empresa.",
          en: "Software built exactly for your process, integrated into your company's operations.",
          es: "Software desarrollado exactamente para tu proceso, integrado a la operación de tu empresa.",
        },
      },
      {
        title: { pt: "APP Mobile", en: "Mobile App", es: "APP Móvil" },
        description: {
          pt: "Aplicativo próprio para iOS e Android, publicado na App Store e no Google Play para seus clientes.",
          en: "Your own iOS and Android app, published on the App Store and Google Play for your customers.",
          es: "Aplicación propia para iOS y Android, publicada en App Store y Google Play para tus clientes.",
        },
      },
    ],
  },
  {
    id: "design_3d_motion",
    iconName: "cube",
    categoryName: { pt: "Design 3D & Motion", en: "3D & Motion Design", es: "Diseño 3D y Motion" },
    tagline: {
      pt: "Design que impressiona",
      en: "Design that impresses",
      es: "Diseño que impresiona",
    },
    features: [
      {
        title: {
          pt: "Modelação 3D (Produtos)",
          en: "3D Modeling (Products)",
          es: "Modelado 3D (Productos)",
        },
        description: {
          pt: "Modelos 3D dos seus produtos para catálogos, e-commerce e anúncios, com realismo profissional.",
          en: "3D models of your products for catalogs, e-commerce, and ads with professional realism.",
          es: "Modelos 3D de tus productos para catálogos, e-commerce y anuncios, con realismo profesional.",
        },
      },
      {
        title: {
          pt: "Motion Design (Animação)",
          en: "Motion Design (Animation)",
          es: "Motion Design (Animación)",
        },
        description: {
          pt: "Animações de marca, intros, GIFs e vídeos animados que dão vida e personalidade à sua identidade.",
          en: "Brand animations, intros, GIFs, and animated videos that bring life and personality to your identity.",
          es: "Animaciones de marca, intros, GIFs y videos animados que dan vida y personalidad a tu identidad.",
        },
      },
    ],
  },
  {
    id: "automation_ai",
    iconName: "lightbulb-o",
    categoryName: {
      pt: "Automação & Inteligência Artificial",
      en: "Automation & Artificial Intelligence",
      es: "Automatización e Inteligencia Artificial",
    },
    tagline: {
      pt: "Tecnologia que trabalha por você",
      en: "Technology that works for you",
      es: "Tecnología que trabaja por ti",
    },
    features: [
      {
        title: {
          pt: "Automação de Processos",
          en: "Process Automation",
          es: "Automatización de Procesos",
        },
        description: {
          pt: "Fluxos automáticos que eliminam tarefas manuais, reduzem erros e aceleram a sua operação.",
          en: "Automated workflows that eliminate manual tasks, reduce errors, and speed up your operations.",
          es: "Flujos automáticos que eliminan tareas manuales, reducen errores y aceleran tu operación.",
        },
      },
      {
        title: { pt: "Integração de IA", en: "AI Integration", es: "Integración de IA" },
        description: {
          pt: "Inteligência artificial aplicada ao seu negócio: análise de dados, geração de conteúdo e decisões mais inteligentes.",
          en: "Artificial intelligence applied to your business: data analysis, content generation, and smarter decisions.",
          es: "Inteligencia artificial aplicada a tu negocio: análisis de datos, generación de contenido y decisiones más inteligentes.",
        },
      },
      {
        title: {
          pt: "Assistente Virtual 24 horas",
          en: "24/7 Virtual Assistant",
          es: "Asistente Virtual 24 horas",
        },
        description: {
          pt: "Atendimento automático por mensagens e e-mail, respondendo seus clientes a qualquer hora do dia.",
          en: "Automated support via messages and email, answering your customers at any time of day.",
          es: "Atención automática por mensajes y correo, respondiendo a tus clientes a cualquier hora.",
        },
      },
      {
        title: {
          pt: "Agentes de Atendimento",
          en: "Support Agents",
          es: "Agentes de Atención",
        },
        description: {
          pt: "Agentes inteligentes que atendem, qualificam e direcionam clientes em vários canais ao mesmo tempo.",
          en: "Smart agents that serve, qualify, and route customers across multiple channels at once.",
          es: "Agentes inteligentes que atienden, califican y direccionan clientes en varios canales a la vez.",
        },
      },
    ],
  },
  {
    id: "seo_google",
    iconName: "search",
    categoryName: {
      pt: "SEO & Presença no Google",
      en: "SEO & Google Presence",
      es: "SEO y Presencia en Google",
    },
    tagline: {
      pt: "Apareça para quem procura",
      en: "Show up for those who search",
      es: "Aparece para quien busca",
    },
    features: [
      {
        title: {
          pt: "SEO (Otimização para Busca)",
          en: "SEO (Search Optimization)",
          es: "SEO (Optimización para Búsqueda)",
        },
        description: {
          pt: "Ajustes no seu site para aparecer nas primeiras pesquisas do Google sem pagar por clique.",
          en: "Website tweaks to rank at the top of Google searches without paying per click.",
          es: "Ajustes en tu sitio para aparecer en las primeras búsquedas de Google sin pagar por clic.",
        },
      },
      {
        title: {
          pt: "Google Meu Negócio",
          en: "Google Business Profile",
          es: "Google Mi Negocio",
        },
        description: {
          pt: "Sua empresa no Google Maps com fotos, telefone e avaliações dos clientes.",
          en: "Your business on Google Maps with photos, phone number, and customer reviews.",
          es: "Tu empresa en Google Maps con fotos, teléfono y reseñas de clientes.",
        },
      },
      {
        title: {
          pt: "Diretórios Locais",
          en: "Local Directories",
          es: "Directorios Locales",
        },
        description: {
          pt: "Cadastro da sua marca nos principais guias regionais dos EUA para gerar autoridade e relevância local.",
          en: "Listing your brand in top US regional directories to build authority and local relevance.",
          es: "Registro de tu marca en las principales guías regionales de EE. UU. para generar autoridad y relevancia local.",
        },
      },
    ],
  },
  {
    id: "traffic_ads",
    iconName: "bullhorn",
    categoryName: {
      pt: "Tráfego Pago & Anúncios",
      en: "Paid Traffic & Ads",
      es: "Tráfico Pagado y Anuncios",
    },
    tagline: {
      pt: "Resultados mensuráveis",
      en: "Measurable results",
      es: "Resultados medibles",
    },
    features: [
      {
        title: {
          pt: "Meta Ads (Instagram & Facebook)",
          en: "Meta Ads (Instagram & Facebook)",
          es: "Meta Ads (Instagram y Facebook)",
        },
        description: {
          pt: "Anúncios para as pessoas certas, próximas do seu negócio e do seu público-alvo.",
          en: "Ads shown to the right people, close to your business and your target audience.",
          es: "Anuncios para las personas adecuadas, cerca de tu negocio y de tu público objetivo.",
        },
      },
      {
        title: { pt: "Google Ads", en: "Google Ads", es: "Google Ads" },
        description: {
          pt: "Apareça exatamente para quem está pesquisando o seu serviço agora no Google.",
          en: "Show up exactly for people searching for your service on Google right now.",
          es: "Aparece exactamente para quienes están buscando tu servicio ahora en Google.",
        },
      },
      {
        title: {
          pt: "TikTok & YouTube Ads",
          en: "TikTok & YouTube Ads",
          es: "Anuncios en TikTok y YouTube",
        },
        description: {
          pt: "Anúncios em vídeo nas redes sociais que mais crescem no mundo.",
          en: "Video ads on the fastest-growing social networks in the world.",
          es: "Anuncios en video en las redes sociales de más rápido crecimiento del mundo.",
        },
      },
      {
        title: { pt: "Remarketing", en: "Remarketing", es: "Remarketing" },
        description: {
          pt: "Anúncios estratégicos para quem já visitou seu site, mas ainda não comprou.",
          en: "Strategic ads for people who already visited your site but haven't bought yet.",
          es: "Anuncios estratégicos para quienes ya visitaron tu sitio pero aún no compraron.",
        },
      },
    ],
  },
  {
    id: "social_audiovisual",
    iconName: "instagram",
    categoryName: {
      pt: "Redes Sociais & Audiovisual",
      en: "Social Media & Audiovisual",
      es: "Redes Sociales y Audiovisual",
    },
    tagline: {
      pt: "Conteúdo que engaja",
      en: "Content that engages",
      es: "Contenido que engancha",
    },
    features: [
      {
        title: { pt: "Reels & TikTok", en: "Reels & TikTok", es: "Reels y TikTok" },
        description: {
          pt: "Vídeos curtos com roteiro, edição rápida e legendas para prender a atenção e gerar alcance.",
          en: "Short videos with scripting, fast editing, and captions to grab attention and drive reach.",
          es: "Videos cortos con guion, edición rápida y subtítulos para captar la atención y generar alcance.",
        },
      },
      {
        title: {
          pt: "Posts & Carrosséis",
          en: "Posts & Carousels",
          es: "Publicaciones y Carruseles",
        },
        description: {
          pt: "Artes visuais e conteúdos que educam, engajam e criam autoridade para o seu público.",
          en: "Visuals and content that educate, engage, and build authority with your audience.",
          es: "Artes visuales y contenido que educa, engancha y crea autoridad con tu público.",
        },
      },
      {
        title: {
          pt: "Gravação Presencial",
          en: "On-Site Recording",
          es: "Grabación Presencial",
        },
        description: {
          pt: "Nossa equipe vai até o seu negócio com câmera e iluminação profissional (região de Massachusetts).",
          en: "Our team comes to your business with professional camera and lighting (Massachusetts region).",
          es: "Nuestro equipo va a tu negocio con cámara e iluminación profesional (región de Massachusetts).",
        },
      },
      {
        title: { pt: "Sessão de Fotos", en: "Photo Shoot", es: "Sesión de Fotos" },
        description: {
          pt: "Book fotográfico da sua equipe, estrutura e produtos para usar em todos os materiais.",
          en: "A photo book of your team, facilities, and products to use across all materials.",
          es: "Book fotográfico de tu equipo, instalaciones y productos para usar en todos los materiales.",
        },
      },
    ],
  },
  {
    id: "branding_strategy",
    iconName: "star",
    categoryName: {
      pt: "Marca, Estratégia & Operação",
      en: "Brand, Strategy & Operations",
      es: "Marca, Estrategia y Operación",
    },
    tagline: {
      pt: "Posicionamento de longo prazo",
      en: "Long-term positioning",
      es: "Posicionamiento a largo plazo",
    },
    features: [
      {
        title: {
          pt: "Branding & Logomarca",
          en: "Branding & Logo",
          es: "Branding y Logotipo",
        },
        description: {
          pt: "Criação ou reformulação da sua logo, cores e estilo visual para sua empresa parecer grande.",
          en: "Create or refresh your logo, colors, and visual style so your business looks big.",
          es: "Creación o renovación de tu logo, colores y estilo visual para que tu empresa parezca grande.",
        },
      },
      {
        title: { pt: "Persona & Bio", en: "Persona & Bio", es: "Persona y Bio" },
        description: {
          pt: "Estudo detalhado do seu cliente ideal e textos estratégicos para o seu perfil.",
          en: "In-depth study of your ideal customer and strategic copy for your profile.",
          es: "Estudio detallado de tu cliente ideal y textos estratégicos para tu perfil.",
        },
      },
      {
        title: {
          pt: "Integração entre Departamentos",
          en: "Department Integration",
          es: "Integración entre Departamentos",
        },
        description: {
          pt: "Conecta equipes, sistemas e setores da sua empresa em um único fluxo de trabalho.",
          en: "Connects your teams, systems, and departments into a single workflow.",
          es: "Conecta equipos, sistemas y sectores de tu empresa en un único flujo de trabajo.",
        },
      },
      {
        title: { pt: "Presença Zimny", en: "Zimny Presence", es: "Presencia Zimny" },
        description: {
          pt: "Anúncios na Revista, no Podcast e nas redes sociais da Zimny Magazine.",
          en: "Ads in the Magazine, Podcast, and social media of Zimny Magazine.",
          es: "Anuncios en la Revista, el Podcast y las redes sociales de Zimny Magazine.",
        },
      },
    ],
  },
];

// ─── Planos (trilíngues, badges sem emojis) ─────────────────────────────────
const PLANS: Plan[] = [
  {
    planKey: "essential",
    name: "ESSENTIAL",
    badge: { pt: "COMECE CERTO", en: "START RIGHT", es: "EMPIEZA BIEN" },
    accentColor: "#32C878",
    tagline: {
      pt: "O feijão com arroz perfeito para estruturar sua empresa no ambiente digital e gerar os primeiros clientes.",
      en: "The perfect foundation to structure your business online and generate your first customers.",
      es: "La base perfecta para estructurar tu empresa en el entorno digital y generar tus primeros clientes.",
    },
    priceHighlight: {
      pt: "Ideal para Pequenos Negócios",
      en: "Ideal for Small Businesses",
      es: "Ideal para Pequeños Negocios",
    },
    includedCategories: [
      {
        title: {
          pt: "Redes Sociais (Conteúdo Semanal)",
          en: "Social Media (Weekly Content)",
          es: "Redes Sociales (Contenido Semanal)",
        },
        items: [
          { pt: "10 Vídeos Editados (Reels/TikTok)", en: "10 Edited Videos (Reels/TikTok)", es: "10 Videos Editados (Reels/TikTok)" },
          { pt: "6 Posts Estáticos + 4 Posts Carrossel", en: "6 Static Posts + 4 Carousel Posts", es: "6 Publicaciones Estáticas + 4 Carruseles" },
          { pt: "Legendas estratégicas + Ajuda nos Stories", en: "Strategic captions + Stories help", es: "Leyendas estratégicas + Ayuda en Stories" },
          { pt: "Calendário de postagens organizado", en: "Organized posting calendar", es: "Calendario de publicaciones organizado" },
        ],
      },
      {
        title: {
          pt: "Tráfego Pago & Anúncios",
          en: "Paid Traffic & Ads",
          es: "Tráfico Pagado y Anuncios",
        },
        items: [
          { pt: "Gestão de Anúncios no Instagram e Facebook", en: "Instagram & Facebook ad management", es: "Gestión de anuncios en Instagram y Facebook" },
          { pt: "Gestão de Anúncios no Google Ads", en: "Google Ads management", es: "Gestión de anuncios en Google Ads" },
        ],
      },
      {
        title: {
          pt: "Identidade & Marca",
          en: "Identity & Brand",
          es: "Identidad y Marca",
        },
        items: [
          { pt: "Criação ou reformulação de Logomarca", en: "Logo creation or refresh", es: "Creación o renovación de logotipo" },
          { pt: "Perfil do Instagram configurado (Bio e Destaques)", en: "Instagram profile set up (Bio & Highlights)", es: "Perfil de Instagram configurado (Bio y Destacados)" },
        ],
      },
    ],
    exclusiveBonuses: [
      {
        pt: "1 Gravação profissional de vídeo por mês (exclusivo para região de MA)",
        en: "1 professional video recording per month (exclusive to MA region)",
        es: "1 grabación profesional de video al mes (exclusivo para la región de MA)",
      },
    ],
  },
  {
    planKey: "prestige",
    name: "PRESTIGE",
    badge: { pt: "O MAIS VENDIDO", en: "BEST SELLER", es: "EL MÁS VENDIDO" },
    accentColor: "#4A90D9",
    tagline: {
      pt: "Para empresas que querem acelerar o crescimento, postar quase todo dia e ter presença na mídia Zimny.",
      en: "For businesses that want to accelerate growth, post almost every day, and have a presence on Zimny media.",
      es: "Para empresas que quieren acelerar su crecimiento, publicar casi todos los días y tener presencia en los medios Zimny.",
    },
    priceHighlight: {
      pt: "Crescimento Rápido",
      en: "Fast Growth",
      es: "Crecimiento Rápido",
    },
    includedCategories: [
      {
        title: {
          pt: "Redes Sociais (Segunda a Sábado)",
          en: "Social Media (Monday to Saturday)",
          es: "Redes Sociales (Lunes a Sábado)",
        },
        items: [
          { pt: "12 Vídeos Editados (Reels/TikTok)", en: "12 Edited Videos (Reels/TikTok)", es: "12 Videos Editados (Reels/TikTok)" },
          { pt: "8 Posts Estáticos + 4 Posts Carrossel", en: "8 Static Posts + 4 Carousel Posts", es: "8 Publicaciones Estáticas + 4 Carruseles" },
          { pt: "Criação de capas profissionais para os vídeos", en: "Professional cover creation for videos", es: "Creación de portadas profesionales para videos" },
          { pt: "Acompanhamento de métricas mensais", en: "Monthly metrics tracking", es: "Seguimiento de métricas mensuales" },
        ],
      },
      {
        title: {
          pt: "Tráfego & Anúncios",
          en: "Traffic & Ads",
          es: "Tráfico y Anuncios",
        },
        items: [
          { pt: "Gestão Completa de Meta Ads (Insta/Face)", en: "Complete Meta Ads management (Insta/Face)", es: "Gestión completa de Meta Ads (Insta/Face)" },
          { pt: "Configuração de rastreamento de conversões", en: "Conversion tracking setup", es: "Configuración de seguimiento de conversiones" },
        ],
      },
      {
        title: {
          pt: "Mídia Zimny & Autoridade",
          en: "Zimny Media & Authority",
          es: "Medios Zimny y Autoridad",
        },
        items: [
          { pt: "Sponsor Semanal no Podcast da Zimny Magazine", en: "Weekly sponsor on the Zimny Magazine Podcast", es: "Sponsor semanal en el Podcast de Zimny Magazine" },
          { pt: "Anúncio Mensal na Revista Zimny Impressa (3x4)", en: "Monthly ad in the Zimny Magazine (3x4)", es: "Anuncio mensual en la Revista Zimny Impresa (3x4)" },
          { pt: "1 Gravação de vídeo profissional presencial (MA)", en: "1 professional on-site video recording (MA)", es: "1 grabación de video profesional presencial (MA)" },
        ],
      },
    ],
    exclusiveBonuses: [
      {
        pt: "Anúncio mensal garantido na Revista Zimny",
        en: "Guaranteed monthly ad in Zimny Magazine",
        es: "Anuncio mensual garantizado en la Revista Zimny",
      },
    ],
  },
  {
    planKey: "legacy",
    name: "LEGACY",
    badge: {
      pt: "DOMÍNIO TOTAL DE MERCADO",
      en: "FULL MARKET DOMINANCE",
      es: "DOMINIO TOTAL DEL MERCADO",
    },
    accentColor: "#F5A623",
    tagline: {
      pt: "Presença digital diária, site próprio, gravação presencial, anúncios e toda a força do ecossistema Zimny.",
      en: "Daily digital presence, your own website, on-site recording, ads, and the full power of the Zimny ecosystem.",
      es: "Presencia digital diaria, sitio propio, grabación presencial, anuncios y toda la fuerza del ecosistema Zimny.",
    },
    priceHighlight: {
      pt: "Solução Completa 360°",
      en: "Complete 360° Solution",
      es: "Solución Completa 360°",
    },
    includedCategories: [
      {
        title: {
          pt: "Redes Sociais (Todos os dias)",
          en: "Social Media (Every day)",
          es: "Redes Sociales (Todos los días)",
        },
        items: [
          { pt: "14 Vídeos Editados (Reels/TikTok)", en: "14 Edited Videos (Reels/TikTok)", es: "14 Videos Editados (Reels/TikTok)" },
          { pt: "10 Posts Estáticos + 6 Carrosséis", en: "10 Static Posts + 6 Carousels", es: "10 Publicaciones Estáticas + 6 Carruseles" },
          { pt: "Orientação diária para publicação de Stories", en: "Daily guidance for posting Stories", es: "Orientación diaria para publicar Stories" },
        ],
      },
      {
        title: {
          pt: "Presença Web & Tecnologia",
          en: "Web Presence & Technology",
          es: "Presencia Web y Tecnología",
        },
        items: [
          { pt: "Criação e Manutenção do seu Website Profissional", en: "Creation and maintenance of your professional website", es: "Creación y mantenimiento de tu sitio web profesional" },
          { pt: "Apareça no Google (Configuração de SEO Local)", en: "Show up on Google (Local SEO setup)", es: "Aparece en Google (Configuración de SEO local)" },
        ],
      },
      {
        title: {
          pt: "Audiovisual & Mídia de Elite",
          en: "Audiovisual & Elite Media",
          es: "Audiovisual y Medios de Élite",
        },
        items: [
          { pt: "1 Gravação Profissional de Vídeo por mês (MA)", en: "1 professional video recording per month (MA)", es: "1 grabación profesional de video al mes (MA)" },
          { pt: "Book Fotográfico da sua empresa e produtos", en: "Photo book of your company and products", es: "Book fotográfico de tu empresa y productos" },
          { pt: "Divulgação no Podcast, TikTok, Instagram, YouTube e Eventos da Zimny", en: "Promotion on the Podcast, TikTok, Instagram, YouTube, and Zimny events", es: "Divulgación en Podcast, TikTok, Instagram, YouTube y eventos de Zimny" },
        ],
      },
    ],
    exclusiveBonuses: [
      {
        pt: "Anúncio de 1/2 Página na Revista Zimny Impressa",
        en: "1/2 page ad in the Zimny Magazine",
        es: "Anuncio de media página en la Revista Zimny Impresa",
      },
      {
        pt: "Mentoria Exclusiva com Bruno Zimny em Eventos de Networking",
        en: "Exclusive mentoring with Bruno Zimny at networking events",
        es: "Mentoría exclusiva con Bruno Zimny en eventos de networking",
      },
    ],
  },
];

// ─── Componente Principal ───────────────────────────────────────────────────
export function MarketingDigitalScreen() {
  const { t, language } = useTranslation();
  const [activeTab, setActiveTab] = useState<"plans" | "services">("plans");
  const [planIndex, setPlanIndex] = useState(0);
  const planListRef = useRef<FlatList<Plan>>(null);

  // Resolve texto trilíngue pelo idioma ativo.
  const loc = useCallback((s: LocalizedText) => s[language], [language]);

  const handleWhatsApp = useCallback(() => {
    Linking.openURL(WHATSAPP_URL).catch(() => {});
  }, []);

  const handleEmail = useCallback(() => {
    Linking.openURL(`mailto:${EMAIL_ADDRESS}`).catch(() => {});
  }, []);

  const handlePhone = useCallback(() => {
    Linking.openURL(`tel:${WHATSAPP_NUMBER.replace(/\D/g, "")}`).catch(() => {});
  }, []);

  const goToPlan = useCallback((index: number) => {
    planListRef.current?.scrollToIndex({ index, animated: true });
    setPlanIndex(index);
  }, []);

  const handlePlanMomentumEnd = useCallback((e: any) => {
    const newIndex = Math.round(e.nativeEvent.contentOffset.x / PLAN_SNAP);
    setPlanIndex(Math.max(0, Math.min(PLANS.length - 1, newIndex)));
  }, []);

  const getPlanLayout = useCallback(
    (_: any, index: number) => ({
      length: PLAN_SNAP,
      offset: PLAN_SNAP * index,
      index,
    }),
    []
  );

  const renderPlanCard = useCallback(
    ({ item }: { item: Plan }) => (
      <View style={styles.planCardShell}>
        <GlassView intensity={55} tint="dark" style={styles.planCard}>
          {/* Linha de destaque no topo */}
          <View style={[styles.planAccent, { backgroundColor: item.accentColor }]} />

          {/* Badge */}
          <View style={[styles.planBadge, { backgroundColor: `${item.accentColor}1A` }]}>
            <Text style={[styles.planBadgeText, { color: item.accentColor }]}>
              {item.badge[language]}
            </Text>
          </View>

          <Text style={styles.planName}>{item.name}</Text>
          <Text style={styles.planTagline}>{item.tagline[language]}</Text>
          <Text style={[styles.planHighlight, { color: item.accentColor }]}>
            {item.priceHighlight[language]}
          </Text>

          <View style={styles.divider} />

          {/* Categorias de entregáveis */}
          {item.includedCategories.map((cat, idx) => (
            <View key={idx} style={styles.categoryBlock}>
              <Text style={styles.categoryTitle}>{cat.title[language]}</Text>
              {cat.items.map((it, i) => (
                <View key={i} style={styles.bulletRow}>
                  <FontAwesome name="check-circle" size={13} color={item.accentColor} />
                  <Text style={styles.bulletText}>{it[language]}</Text>
                </View>
              ))}
            </View>
          ))}

          {/* Bônus */}
          {item.exclusiveBonuses.length > 0 && (
            <View
              style={[
                styles.bonusBlock,
                {
                  backgroundColor: `${item.accentColor}0D`,
                  borderColor: `${item.accentColor}30`,
                },
              ]}
            >
              <Text style={[styles.bonusTitle, { color: item.accentColor }]}>
                {t("marketing.bonus_exclusivos")}
              </Text>
              {item.exclusiveBonuses.map((bonus, bIdx) => (
                <Text key={bIdx} style={styles.bonusText}>
                  • {bonus[language]}
                </Text>
              ))}
            </View>
          )}

          {/* CTA */}
          <Pressable
            style={[styles.cardCta, { backgroundColor: item.accentColor }]}
            onPress={handleWhatsApp}
          >
            <FontAwesome name="whatsapp" size={16} color="#000" />
            <Text style={styles.cardCtaText}>{t("marketing.quero_este_plano")}</Text>
          </Pressable>
        </GlassView>
      </View>
    ),
    [handleWhatsApp, t, language]
  );

  return (
    <ScrollView
      style={styles.shell}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={false} onRefresh={() => {}} tintColor="#FFFFFF" />
      }
    >
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <View style={styles.heroSection}>
        <Text style={styles.heroBadge}>{t("marketing.hero_kicker")}</Text>
        <Text style={styles.heroTitle}>{t("marketing.hero_title")}</Text>
        <Text style={styles.heroSubtitle}>{t("marketing.hero_subtitle")}</Text>

        {/* Métricas-chave */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>14+</Text>
            <Text style={styles.statLabel}>{t("marketing.stat_servicos")}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>3</Text>
            <Text style={styles.statLabel}>{t("marketing.stat_pacotes")}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>24h</Text>
            <Text style={styles.statLabel}>{t("marketing.stat_atendimento")}</Text>
          </View>
        </View>
      </View>

      {/* ── Aba Selector ─────────────────────────────────────────── */}
      <View style={styles.tabContainer}>
        <Pressable
          style={[styles.tabButton, activeTab === "plans" && styles.tabButtonActive]}
          onPress={() => setActiveTab("plans")}
        >
          <Text style={[styles.tabText, activeTab === "plans" && styles.tabTextActive]}>
            {t("marketing.pacotes_prontos")}
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tabButton, activeTab === "services" && styles.tabButtonActive]}
          onPress={() => setActiveTab("services")}
        >
          <Text style={[styles.tabText, activeTab === "services" && styles.tabTextActive]}>
            {t("marketing.o_que_fazemos")}
          </Text>
        </Pressable>
      </View>

      {/* ── CONTEÚDO 1: Pacotes (carrossel lado a lado) ──────────── */}
      {activeTab === "plans" ? (
        <View style={styles.plansSection}>
          <Text style={styles.sectionIntro}>{t("marketing.pacotes_intro")}</Text>

          <View style={styles.compareHintRow}>
            <FontAwesome name="arrows-h" size={13} color="#A78BD8" />
            <Text style={styles.compareHint}>{t("marketing.compare_hint")}</Text>
          </View>

          <FlatList
            ref={planListRef}
            horizontal
            data={PLANS}
            keyExtractor={(p) => p.planKey}
            renderItem={renderPlanCard}
            showsHorizontalScrollIndicator={false}
            snapToInterval={PLAN_SNAP}
            snapToAlignment="start"
            decelerationRate="fast"
            contentContainerStyle={styles.planListContent}
            onMomentumScrollEnd={handlePlanMomentumEnd}
            getItemLayout={getPlanLayout}
            initialScrollIndex={0}
          />

          {/* Dots */}
          <View style={styles.dotsRow}>
            {PLANS.map((_, index) => (
              <Pressable
                key={index}
                onPress={() => goToPlan(index)}
                style={[styles.dot, index === planIndex ? styles.dotActive : styles.dotInactive]}
              />
            ))}
          </View>
        </View>
      ) : (
        /* ── CONTEÚDO 2: Serviços atualizados e explicados ──────── */
        <View style={styles.servicesSection}>
          <Text style={styles.sectionIntro}>{t("marketing.servicos_intro")}</Text>

          {ALL_SERVICES.map((cat) => (
            <View key={cat.id} style={styles.serviceCard}>
              <View style={styles.serviceHeader}>
                <View style={styles.serviceIconWrap}>
                  <FontAwesome name={cat.iconName} size={18} color="#C9B8F0" />
                </View>
                <View style={styles.serviceHeaderText}>
                  <Text style={styles.serviceCategoryName}>{loc(cat.categoryName)}</Text>
                  <Text style={styles.serviceCategoryTagline}>{loc(cat.tagline)}</Text>
                </View>
              </View>

              <View style={styles.serviceFeatures}>
                {cat.features.map((feat, fIdx) => (
                  <View key={fIdx} style={styles.serviceFeature}>
                    <View style={styles.serviceFeatureDot} />
                    <View style={styles.serviceFeatureBody}>
                      <Text style={styles.serviceFeatureTitle}>{loc(feat.title)}</Text>
                      <Text style={styles.serviceFeatureDesc}>{loc(feat.description)}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      )}

      {/* ── Footer CTA (Atendimento Humano Direto) ───────────────── */}
      <View style={styles.ctaSection}>
        <GlassView intensity={65} tint="dark" style={styles.ctaCard}>
          <Text style={styles.ctaBadge}>{t("marketing.cta_especialista")}</Text>
          <Text style={styles.ctaTitle}>{t("marketing.cta_titulo")}</Text>
          <Text style={styles.ctaDescription}>{t("marketing.cta_descricao")}</Text>

          <View style={styles.ctaRow}>
            <Pressable style={styles.ctaButton} onPress={handlePhone}>
              <FontAwesome name="phone" size={18} color="#5AC8FA" />
              <Text style={styles.ctaButtonLabel}>{t("contact.ligar")}</Text>
            </Pressable>

            <Pressable style={styles.ctaButton} onPress={handleEmail}>
              <FontAwesome name="envelope" size={18} color="#8E8E93" />
              <Text style={styles.ctaButtonLabel}>{t("contact.email")}</Text>
            </Pressable>

            <Pressable
              style={[styles.ctaButton, styles.ctaWhatsappHighlight]}
              onPress={handleWhatsApp}
            >
              <FontAwesome name="whatsapp" size={20} color="#FFF" />
              <Text style={[styles.ctaButtonLabel, { color: "#FFF" }]}>
                {t("contact.whatsapp")}
              </Text>
            </Pressable>
          </View>
        </GlassView>
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

// ─── Estilos ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: color.dark.surface,
  },
  scrollContent: {
    paddingTop: spacing.md,
  },

  // ── Hero ──
  heroSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  heroBadge: {
    fontSize: 10,
    fontWeight: "800",
    color: "#A78BD8",
    letterSpacing: 2,
    marginBottom: spacing.xs,
  },
  heroTitle: {
    fontFamily: font.serif,
    fontSize: font.size.display,
    fontWeight: "700",
    color: color.dark.text,
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  heroSubtitle: {
    fontSize: font.size.small,
    color: color.dark.textSecondary,
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.xl,
    backgroundColor: "rgba(140, 92, 208, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(140, 92, 208, 0.22)",
    borderRadius: radius.xl,
    paddingVertical: spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: font.size.headline,
    fontWeight: "800",
    color: "#C9B8F0",
    letterSpacing: 0.5,
  },
  statLabel: {
    fontSize: font.size.kicker,
    fontWeight: "700",
    letterSpacing: 1.5,
    color: color.dark.textSecondary,
    marginTop: 2,
    textTransform: "uppercase",
  },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    height: 28,
    backgroundColor: "rgba(255,255,255,0.12)",
  },

  // ── Tabs ──
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: radius.md,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: radius.sm,
  },
  tabButtonActive: {
    backgroundColor: "rgba(140, 92, 208, 0.35)",
  },
  tabText: {
    fontSize: 13,
    color: color.dark.textTertiary,
    fontWeight: "600",
  },
  tabTextActive: {
    color: color.dark.text,
  },

  // ── Seção de Planos (carrossel) ──
  plansSection: {
    paddingHorizontal: spacing.lg,
  },
  sectionIntro: {
    fontSize: 13,
    color: color.dark.textSecondary,
    lineHeight: 19,
    marginBottom: spacing.md,
  },
  compareHintRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: spacing.md,
  },
  compareHint: {
    fontSize: font.size.kicker,
    fontWeight: "700",
    letterSpacing: 2,
    color: "#A78BD8",
    textTransform: "uppercase",
  },
  planListContent: {
    paddingHorizontal: PLAN_SIDE_MARGIN,
    paddingBottom: spacing.xs,
  },
  planCardShell: {
    width: PLAN_W,
    marginRight: PLAN_GAP,
  },
  planCard: {
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    position: "relative",
    overflow: "hidden",
  },
  planAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  planBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    marginBottom: spacing.sm,
  },
  planBadgeText: {
    fontSize: font.size.kicker,
    fontWeight: "900",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  planName: {
    fontSize: font.size.headline,
    fontWeight: "800",
    color: color.dark.text,
    letterSpacing: 1,
  },
  planTagline: {
    fontSize: font.size.caption,
    color: color.dark.textSecondary,
    marginTop: 4,
    lineHeight: 16,
  },
  planHighlight: {
    fontSize: 11,
    fontWeight: "700",
    marginTop: spacing.xs,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
    marginVertical: spacing.md,
  },
  categoryBlock: {
    marginBottom: spacing.md,
  },
  categoryTitle: {
    fontSize: font.size.caption,
    fontWeight: "700",
    color: color.dark.text,
    marginBottom: spacing.xs,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginVertical: 3,
  },
  bulletText: {
    fontSize: font.size.caption,
    color: color.dark.textSecondary,
    flex: 1,
    lineHeight: 16,
  },
  bonusBlock: {
    marginTop: spacing.xs,
    padding: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  bonusTitle: {
    fontSize: font.size.kicker,
    fontWeight: "800",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  bonusText: {
    fontSize: font.size.caption,
    color: color.dark.textSecondary,
    lineHeight: 16,
  },
  cardCta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: radius.md,
    marginTop: spacing.lg,
  },
  cardCtaText: {
    color: "#000",
    fontWeight: "800",
    fontSize: 12,
    letterSpacing: 0.5,
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: spacing.md,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 24,
    backgroundColor: "#C9B8F0",
    borderRadius: 4,
  },
  dotInactive: {
    backgroundColor: color.dark.textTertiary,
  },

  // ── Seção de Serviços ──
  servicesSection: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  serviceCard: {
    backgroundColor: "rgba(255,255,255,0.03)",
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: "rgba(140, 92, 208, 0.18)",
  },
  serviceHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  serviceIconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(140, 92, 208, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(140, 92, 208, 0.3)",
  },
  serviceHeaderText: {
    flex: 1,
  },
  serviceCategoryName: {
    fontSize: 15,
    fontWeight: "700",
    color: color.dark.text,
  },
  serviceCategoryTagline: {
    fontSize: font.size.caption,
    color: color.dark.textTertiary,
    marginTop: 2,
  },
  serviceFeatures: {
    gap: spacing.md,
  },
  serviceFeature: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  serviceFeatureDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 5,
    backgroundColor: "#8C5CD0",
  },
  serviceFeatureBody: {
    flex: 1,
  },
  serviceFeatureTitle: {
    fontSize: font.size.small,
    fontWeight: "600",
    color: "#D6C7F2",
  },
  serviceFeatureDesc: {
    fontSize: font.size.caption,
    color: color.dark.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },

  // ── Footer CTA ──
  ctaSection: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
  },
  ctaCard: {
    borderRadius: radius.xl,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: "rgba(140, 92, 208, 0.25)",
    alignItems: "center",
  },
  ctaBadge: {
    fontSize: font.size.kicker,
    fontWeight: "800",
    letterSpacing: 2,
    color: "#A78BD8",
    marginBottom: spacing.sm,
    textTransform: "uppercase",
  },
  ctaTitle: {
    fontSize: 15,
    letterSpacing: 1,
    color: color.dark.text,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  ctaDescription: {
    fontSize: font.size.caption,
    color: color.dark.textTertiary,
    textAlign: "center",
    marginBottom: spacing.lg,
    lineHeight: 17,
  },
  ctaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    width: "100%",
    gap: spacing.sm,
  },
  ctaButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: radius.md,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  ctaWhatsappHighlight: {
    backgroundColor: "#25D366",
    borderColor: "#25D366",
  },
  ctaButtonLabel: {
    fontSize: font.size.caption,
    color: color.dark.textSecondary,
    fontWeight: "700",
    marginTop: 4,
  },
  bottomSpacer: {
    height: 48,
  },
});
