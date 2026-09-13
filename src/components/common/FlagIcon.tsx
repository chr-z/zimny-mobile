/**
 * FlagIcon — Vector flag icons (SVG) for the supported app languages.
 *
 * Replaces emoji flags with crisp, consistent vector renderings so the UI
 * looks identical across platforms (iOS / Android / Web). Rendered at a 3:2
 * aspect ratio with rounded corners.
 */
import { memo } from "react";
import { View } from "react-native";
import Svg, { Circle, G, Path, Polygon, Rect } from "react-native-svg";

export type FlagCode = "pt" | "en" | "es";

// ─── Helpers ───────────────────────────────────────────────────────────────

/** 5-point star polygon points string centered at (cx, cy). */
function starPoints(cx: number, cy: number, r: number, innerRatio = 0.382): string {
  const pts: string[] = [];
  const steps = 10;
  for (let i = 0; i < steps; i++) {
    const angle = (Math.PI / steps) * i * 2 - Math.PI / 2;
    const rad = i % 2 === 0 ? r : r * innerRatio;
    pts.push(`${(cx + Math.cos(angle) * rad).toFixed(2)},${(cy + Math.sin(angle) * rad).toFixed(2)}`);
  }
  return pts.join(" ");
}

// ─── Brazil ────────────────────────────────────────────────────────────────

function BrazilFlag() {
  // Stars on the blue globe: a clean arc above and below the white band.
  const stars: ReadonlyArray<readonly [number, number]> = [
    [108, 52],
    [150, 44],
    [192, 52],
    [126, 60],
    [174, 60],
    [112, 150],
    [150, 158],
    [188, 150],
    [128, 143],
    [172, 143],
  ];
  return (
    <G>
      <Rect x={0} y={0} width={300} height={200} fill="#009C3B" />
      <Polygon points="150,18 282,100 150,182 18,100" fill="#FFDF00" />
      <Circle cx={150} cy={100} r={66} fill="#002776" />
      {/* White motto band (rounded horizontal bar across the globe) */}
      <Rect x={88} y={90} width={124} height={22} rx={11} fill="#FFFFFF" />
      {stars.map(([x, y], i) => (
        <Polygon key={i} points={starPoints(x, y, 5)} fill="#FFFFFF" />
      ))}
    </G>
  );
}

// ─── USA ───────────────────────────────────────────────────────────────────

function UsaFlag() {
  const stripeH = 200 / 13;
  const cantonW = 120;
  const cantonH = stripeH * 7;
  const rowSpacing = cantonH / 10;
  const colSpacing = cantonW / 12;

  const stars: Array<[number, number]> = [];
  for (let r = 0; r < 9; r++) {
    const count = r % 2 === 0 ? 6 : 5;
    const y = rowSpacing * (r + 1);
    for (let c = 0; c < count; c++) {
      const x = r % 2 === 0 ? colSpacing * (2 * c + 1) : colSpacing * (2 * c + 2);
      stars.push([x, y]);
    }
  }

  return (
    <G>
      {Array.from({ length: 13 }, (_, i) => (
        <Rect
          key={i}
          x={0}
          y={i * stripeH}
          width={300}
          height={stripeH + 0.2}
          fill={i % 2 === 0 ? "#B22234" : "#FFFFFF"}
        />
      ))}
      <Rect x={0} y={0} width={cantonW} height={cantonH} fill="#3C3B6E" />
      {stars.map(([x, y], i) => (
        <Polygon key={i} points={starPoints(x, y, 3.8)} fill="#FFFFFF" />
      ))}
    </G>
  );
}

// ─── Spain ─────────────────────────────────────────────────────────────────

function SpainFlag() {
  return (
    <G>
      <Rect x={0} y={0} width={300} height={50} fill="#AA151B" />
      <Rect x={0} y={50} width={300} height={100} fill="#F1BF00" />
      <Rect x={0} y={150} width={300} height={50} fill="#AA151B" />
      {/* Simplified coat of arms (red shield, gold outline) */}
      <G>
        <Path
          d="M138 66 L162 66 L162 88 C162 104 150 114 150 114 C150 114 138 104 138 88 Z"
          fill="#AA151B"
          stroke="#B0A020"
          strokeWidth={2}
        />
        <Rect x={145} y={70} width={3.5} height={36} fill="#F1BF00" />
        <Rect x={151.5} y={70} width={3.5} height={36} fill="#F1BF00" />
      </G>
    </G>
  );
}

// ─── Component ─────────────────────────────────────────────────────────────

export const FlagIcon = memo(function FlagIcon({
  code,
  width = 24,
  borderRadius = 3,
}: {
  code: FlagCode;
  width?: number;
  borderRadius?: number;
}) {
  const height = Math.round((width * 2) / 3);
  return (
    <View
      style={{
        width,
        height,
        borderRadius,
        overflow: "hidden",
      }}
    >
      <Svg width={width} height={height} viewBox="0 0 300 200">
        {code === "pt" && <BrazilFlag />}
        {code === "en" && <UsaFlag />}
        {code === "es" && <SpainFlag />}
      </Svg>
    </View>
  );
});
