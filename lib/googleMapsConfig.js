// Array de libraries do Google Maps precisa ser uma referência ESTÁVEL
// (mesmo array sempre) — se for recriado a cada render, o
// @react-google-maps/api recarrega o script sem necessidade e gera
// avisos no console. Por isso fica isolado aqui, fora de componentes.
export const GOOGLE_MAPS_LIBRARIES = [];
export const GOOGLE_MAPS_SCRIPT_ID = "cultura-unificada-google-maps";
