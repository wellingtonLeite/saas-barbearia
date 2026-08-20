export interface BarberAvatarPreset {
  id: string;
  name: string;
  roleTitle: string;
  image_url: string;
}

export interface ServicePreset {
  id: string;
  name: string;
  suggestedCategory: string;
  duration_minutes: number;
  suggestedPrice: number;
  description: string;
  image_url: string;
  badge?: string;
}

export const BARBER_AVATAR_PRESETS: BarberAvatarPreset[] = [
  {
    id: "barber-1",
    name: "Mestre Barbeiro",
    roleTitle: "Especialista em Degradê & Barba",
    image_url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "barber-2",
    name: "Barber Fade Master",
    roleTitle: "Especialista em Navalhados",
    image_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "barber-3",
    name: "Barber Vintage",
    roleTitle: "Cortes Clássicos & Tesoura",
    image_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "barber-4",
    name: "Stylist Moderno",
    roleTitle: "Visagismo & Pigmentação",
    image_url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "barber-5",
    name: "Senior Groomer",
    roleTitle: "Barboterapia & Cuidados VIP",
    image_url: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "barber-6",
    name: "Master Hair Stylist",
    roleTitle: "Cortes Modernos & Texturização",
    image_url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "barber-7",
    name: "Expert Fade",
    roleTitle: "Skin Fade & Free Hand",
    image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "barber-8",
    name: "Color & Trend Barber",
    roleTitle: "Platinados & Química Capilar",
    image_url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80"
  }
];

export const SERVICE_PRESETS: ServicePreset[] = [
  {
    id: "fade",
    name: "Corte Degradê / Fade (Low, Mid, High)",
    suggestedCategory: "Cabelo",
    duration_minutes: 40,
    suggestedPrice: 45.0,
    description: "Degradê suave e milimétrico nas laterais com navalha/shaver, alinhamento de topo e acabamento com pomada matte.",
    image_url: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=600&q=80",
    badge: "Mais Pedido"
  },
  {
    id: "pompadour",
    name: "Pompadour / Social Moderno",
    suggestedCategory: "Cabelo",
    duration_minutes: 35,
    suggestedPrice: 40.0,
    description: "Corte elegante com volume estruturado no topo, laterais na tesoura ou máquina e finalização com secador e fixador.",
    image_url: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80",
    badge: "Elegante"
  },
  {
    id: "buzzcut",
    name: "Buzz Cut / Militar Navalhado",
    suggestedCategory: "Cabelo",
    duration_minutes: 25,
    suggestedPrice: 35.0,
    description: "Corte prático e simétrico, pente único ou degrade suave com contorno e pezinho alinhados na navalha afiada.",
    image_url: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=600&q=80",
    badge: "Prático"
  },
  {
    id: "barba-alinhada",
    name: "Barba Alinhada & Barboterapia",
    suggestedCategory: "Barba",
    duration_minutes: 30,
    suggestedPrice: 35.0,
    description: "Alinhamento com navalha, toalha quente com óleos essenciais, massagem facial e hidratação com balm artesanal.",
    image_url: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=600&q=80",
    badge: "Relaxante"
  },
  {
    id: "barba-lenhador",
    name: "Barba Estilo Lenhador / Full Beard",
    suggestedCategory: "Barba",
    duration_minutes: 35,
    suggestedPrice: 40.0,
    description: "Desenho e simetria para barbas longas e volumosas, corte das pontas duplas, hidratação profunda e alinhamento térmico.",
    image_url: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=80",
    badge: "Estilo Único"
  },
  {
    id: "pigmentacao",
    name: "Pigmentação de Barba & Cabelo",
    suggestedCategory: "Tratamentos",
    duration_minutes: 30,
    suggestedPrice: 30.0,
    description: "Preenchimento de falhas e realce dos contornos com tinta hipoalergênica temporária de alta durabilidade e acabamento natural.",
    image_url: "https://images.unsplash.com/photo-1567894340315-735d7c361db0?auto=format&fit=crop&w=600&q=80",
    badge: "Definição"
  },
  {
    id: "hidratacao",
    name: "Hidratação & Selagem Capilar",
    suggestedCategory: "Tratamentos",
    duration_minutes: 40,
    suggestedPrice: 50.0,
    description: "Lavagem profunda com shampoo revitalizante, máscara de nutrição intensiva e selagem dos fios com calor.",
    image_url: "https://images.unsplash.com/photo-1517832606589-7629c339590a?auto=format&fit=crop&w=600&q=80",
    badge: "Cuidado VIP"
  },
  {
    id: "combo-vip",
    name: "Combo VIP (Cabelo + Barba + Toalha Quente)",
    suggestedCategory: "Combos",
    duration_minutes: 60,
    suggestedPrice: 75.0,
    description: "Experiência completa 88Barber: corte estilizado a sua escolha, barba completa com barboterapia e finalização premium.",
    image_url: "https://images.unsplash.com/photo-1593702295094-aea22597af65?auto=format&fit=crop&w=600&q=80",
    badge: "Mais Vendido"
  },
  {
    id: "platinado",
    name: "Platinado / Nevou Global",
    suggestedCategory: "Química & Cor",
    duration_minutes: 90,
    suggestedPrice: 120.0,
    description: "Descoloração segura com produtos profissionais de proteção dos fios, tonalização platinada/branca e hidratação pós-química.",
    image_url: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=600&q=80",
    badge: "Tendência"
  }
];
