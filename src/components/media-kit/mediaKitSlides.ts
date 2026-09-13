/**
 * Media Kit slide data.
 *
 * Each slide has three image URLs — one per supported language.
 * Images are hosted on Imgur and match the content from
 * https://zimnymagazine.com/anuncie-conosco/
 */

export type MediaKitSlideData = {
  id: number;
  pt: string;
  en: string;
  es: string;
};

const BASE = "https://i.imgur.com";

export const MEDIA_KIT_SLIDES: MediaKitSlideData[] = [
  { id: 1,  pt: `${BASE}/lbT0cZM.jpeg`, en: `${BASE}/JHTeuSF.jpeg`, es: `${BASE}/a9HC8Hj.jpeg` },
  { id: 2,  pt: `${BASE}/Ge7TTQh.jpeg`, en: `${BASE}/3Ay3LRy.jpeg`, es: `${BASE}/szq48zJ.jpeg` },
  { id: 3,  pt: `${BASE}/S0koTgM.png`,  en: `${BASE}/twzhNQ9.png`,  es: `${BASE}/Slwth0q.png`  },
  { id: 4,  pt: `${BASE}/j0GysKg.png`,  en: `${BASE}/nctyIhU.png`,  es: `${BASE}/7azjLsu.png`  },
  { id: 5,  pt: `${BASE}/T11oOQk.jpeg`, en: `${BASE}/LD4zKQb.jpeg`, es: `${BASE}/rlknCYA.jpeg` },
  { id: 6,  pt: `${BASE}/aLO88gQ.png`,  en: `${BASE}/5QOffWE.png`,  es: `${BASE}/ACSwSmR.png`  },
  { id: 7,  pt: `${BASE}/FqK3dZq.png`,  en: `${BASE}/fIlB5m4.png`,  es: `${BASE}/ycBDjbA.png`  },
  { id: 8,  pt: `${BASE}/LoSWkEg.png`,  en: `${BASE}/RdZPb3A.png`,  es: `${BASE}/wopPhDL.png`  },
  { id: 9,  pt: `${BASE}/qGPNhv5.png`,  en: `${BASE}/AHHdS5N.png`,  es: `${BASE}/MiE7DGH.png`  },
  { id: 10, pt: `${BASE}/XfJ4rjI.png`,  en: `${BASE}/j7apUwW.png`,  es: `${BASE}/cgZgvXh.png`  },
  { id: 11, pt: `${BASE}/U4wut2a.png`,  en: `${BASE}/dzC6KQV.png`,  es: `${BASE}/boJDYgl.png`  },
  { id: 12, pt: `${BASE}/ve3uex0.jpeg`, en: `${BASE}/vk9cy8a.jpeg`, es: `${BASE}/B2BkZcQ.jpeg` },
];
