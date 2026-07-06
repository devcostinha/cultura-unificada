// ====================================================================
// Listas fixas usadas em formulários e filtros por toda a aplicação.
// Centralizar aqui evita repetir/divergir as mesmas opções em vários
// arquivos diferentes.
// ====================================================================

// Áreas de atuação artística — usadas no cadastro de artista E como
// categoria de evento no Calendário Unificado (mesma lista, propósito
// consistente nas duas telas).
export const AREAS_ATUACAO = [
  "Música",
  "Dança",
  "Teatro",
  "Artes Visuais",
  "Literatura",
  "Circo",
  "Audiovisual",
  "Outros",
];

// Bairros / subregiões da Zona Leste de São Paulo. Lista curada com os
// mais conhecidos; "Outra região da Zona Leste" cobre o que não estiver
// listado.
export const BAIRROS_ZONA_LESTE = [
  "Água Rasa",
  "Artur Alvim",
  "Cangaíba",
  "Carrão",
  "Cidade Tiradentes",
  "Ermelino Matarazzo",
  "Guaianases",
  "Iguatemi",
  "Itaim Paulista",
  "Itaquera",
  "Jardim Helena",
  "José Bonifácio",
  "Lajeado",
  "Parque do Carmo",
  "Penha",
  "Sapopemba",
  "Sacomã",
  "São Mateus",
  "São Miguel Paulista",
  "São Rafael",
  "Tatuapé",
  "Vila Curuçá",
  "Vila Formosa",
  "Vila Matilde",
  "Vila Prudente",
  "Outra região da Zona Leste",
];

// Categorias de projeto cultural no Mapeamento Cultural.
export const CATEGORIAS_PROJETO_MAPA = [
  "Espaço Cultural",
  "Sarau",
  "Coletivo",
  "Escola de Arte",
  "Projeto Social",
  "Outros",
];

// Categorias de edital.
export const CATEGORIAS_EDITAL = [
  "Edital Federal",
  "Edital Estadual",
  "Edital Municipal",
  "Edital de Iniciativa Privada",
];

// Subcategorias exibidas apenas quando a categoria é "Edital de Iniciativa Privada".
export const SUBCATEGORIAS_EDITAL_PRIVADO = [
  "Empresa Privada",
  "Fundação ou Instituto",
  "Outros",
];

// Períodos para o filtro avançado do Calendário Unificado (sugestão de melhoria 3).
export const PERIODOS_FILTRO = [
  { value: "todos", label: "Todos os períodos" },
  { value: "semana", label: "Próximos 7 dias" },
  { value: "mes", label: "Próximos 30 dias" },
];

// Centro aproximado da Zona Leste de São Paulo (região de Itaquera/São
// Mateus), usado para centralizar o Google Maps quando a página de
// Mapeamento Cultural carrega.
export const CENTRO_ZONA_LESTE = { lat: -23.5430, lng: -46.4730 };
