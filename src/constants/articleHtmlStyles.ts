import type { MixedStyleRecord } from "@native-html/transient-render-engine";

/** Tipografia editorial para o corpo HTML do WordPress (luxo / leitura longa).
 *  Cores dark por padrão — unificadas com a estética escura da home.
 *  O seletor de tema no ReaderPanel ainda pode sobrescrever via scaledTagsStyles. */
export const articleTagsStyles: MixedStyleRecord = {
  body: {
    margin: 0,
  },
  p: {
    fontSize: 18,
    lineHeight: 29,
    color: "#E0DFD9",
    marginTop: 0,
    marginBottom: 18,
  },
  h1: {
    fontFamily: "Georgia",
    fontSize: 28,
    lineHeight: 34,
    color: "#FFFFFF",
    marginTop: 32,
    marginBottom: 12,
  },
  h2: {
    fontFamily: "Georgia",
    fontSize: 24,
    lineHeight: 30,
    color: "#FFFFFF",
    marginTop: 28,
    marginBottom: 10,
  },
  h3: {
    fontFamily: "Georgia",
    fontSize: 20,
    lineHeight: 26,
    color: "#FFFFFF",
    marginTop: 24,
    marginBottom: 8,
  },
  img: {
    width: "100%",
    borderRadius: 2,
    marginTop: 8,
    marginBottom: 16,
  },
  figure: {
    marginTop: 8,
    marginBottom: 16,
  },
  figcaption: {
    fontSize: 13,
    color: "rgba(255,255,255,0.45)",
    marginTop: 6,
  },
  a: {
    color: "#C9A84C",
    textDecorationLine: "underline",
    textDecorationColor: "rgba(201,168,76,0.45)",
    textDecorationStyle: "solid",
  },
  blockquote: {
    borderLeftWidth: 2,
    borderLeftColor: "rgba(255,255,255,0.2)",
    paddingLeft: 14,
    marginVertical: 16,
    fontStyle: "italic",
  },
  ul: {
    marginBottom: 16,
  },
  ol: {
    marginBottom: 16,
  },
  li: {
    fontSize: 18,
    lineHeight: 29,
    color: "#E0DFD9",
    marginBottom: 8,
  },
};
