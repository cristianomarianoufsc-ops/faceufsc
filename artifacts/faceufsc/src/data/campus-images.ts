/**
 * Imagens de capa para cada campus da UFSC.
 * Mapeadas por palavras-chave do nome da comunidade.
 */
export const CAMPUS_IMAGES: Record<string, string> = {
  // Campus Florianópolis — vista panorâmica do Morro da Cruz (Wikimedia Commons, CC BY-SA)
  "Florianópolis":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Morro_da_Cruz%2C_Florian%C3%B3polis_-_SC%2C_Brazil_-_panoramio_%28cropped%29.jpg/1200px-Morro_da_Cruz%2C_Florian%C3%B3polis_-_SC%2C_Brazil_-_panoramio_%28cropped%29.jpg",

  // Campus Blumenau — Vale do Itajaí (Unsplash, Matheus Bertelli)
  "Blumenau":
    "https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=1200&h=400&fit=crop&q=80",

  // Campus Joinville — cidade moderna / polo industrial (Unsplash)
  "Joinville":
    "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200&h=400&fit=crop&q=80",

  // Campus Araranguá — costa sul de Santa Catarina (Unsplash)
  "Araranguá":
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=400&fit=crop&q=80",

  // Campus Curitibanos — planalto serrano / araucárias (Unsplash)
  "Curitibanos":
    "https://images.unsplash.com/photo-1448375240586-882707db888b?w=1200&h=400&fit=crop&q=80",
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
