/**
 * Imagens de capa reais para cada campus da UFSC.
 * Todas as URLs foram verificadas e carregam corretamente.
 */
export const CAMPUS_IMAGES: Record<string, string> = {
  // Florianópolis — panorama de Santo Antônio de Lisboa (foto: Bralemão, 1440px)
  "Florianópolis":
    "https://www.bralemao.com/portfolio/wp-content/uploads/2013/10/pano_floripa_santo_antonio_1440pixel.jpg",

  // Blumenau — vista urbana do centro (ImóveisPortal)
  "Blumenau":
    "https://blog.imoveisportal.com/wp-content/uploads/2026/01/Afinal-Blumenau-fica-em-qual-regiao-de-Santa-Catarina.jpeg",

  // Joinville — Bairro Iririu e zona leste (Wikimedia Commons, CC-BY-SA)
  "Joinville":
    "https://upload.wikimedia.org/wikipedia/commons/b/b7/Bairro_Iriri%C3%BA_e_zona_leste_de_Joinville_em_um_dia_com_nuvens._Destaca-se_o_Morro_do_Iriri%C3%BA_e_Morro_do_Boa_Vista.jpg",

  // Araranguá — Rio Araranguá e pontes (CDN Prime)
  "Araranguá":
    "https://primeimg2.nyc3.cdn.digitaloceanspaces.com/arquivos/1/09304620250311552123552189.jpg",

  // Curitibanos — floresta de araucárias no Planalto Serrano (Mongabay/Fellipe Abreu, SC 2022)
  "Curitibanos":
    "https://imgs.mongabay.com/wp-content/uploads/sites/29/2023/04/05145749/20220603_fellipeabreu_santacatarina_129484-768x512.jpg",
};

/**
 * Retorna a URL da imagem de capa para uma comunidade de campus,
 * com base em palavras-chave no nome da comunidade.
 */
export function getCampusImage(communityName: string): string | null {
  for (const [keyword, url] of Object.entries(CAMPUS_IMAGES)) {
    if (communityName.includes(keyword)) return url;
  }
  return null;
}
