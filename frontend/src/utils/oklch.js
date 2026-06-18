/**
 * Utility to convert OKLCH color strings to standard RGB/RGBA strings.
 * This is crucial because html2canvas / html2pdf.js does not support OKLCH
 * and will crash when parsing Tailwind v4 compiled color styles.
 */

export function oklchToRgb(colorStr) {
  if (typeof colorStr !== 'string' || !colorStr.includes('oklch')) {
    return colorStr;
  }

  // Regex to match oklch(L C H) or oklch(L C H / A)
  // Supports percentages, decimals, spaces, and slashes.
  const match = colorStr.match(/oklch\(\s*([\d.]+%?)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+%?))?\s*\)/i);
  if (!match) {
    return colorStr;
  }

  let LStr = match[1];
  let CStr = match[2];
  let HStr = match[3];
  let AStr = match[4];

  // 1. Parse Lightness (L)
  let L = 0;
  if (LStr.endsWith('%')) {
    L = parseFloat(LStr) / 100;
  } else {
    L = parseFloat(LStr);
  }

  // 2. Parse Chroma (C)
  let C = parseFloat(CStr);

  // 3. Parse Hue (H)
  let H = parseFloat(HStr);

  // 4. Parse Alpha (A)
  let alpha = 1;
  if (AStr) {
    if (AStr.endsWith('%')) {
      alpha = parseFloat(AStr) / 100;
    } else {
      alpha = parseFloat(AStr);
    }
  }

  // OKLCH to sRGB conversion math:
  // Convert H to radians
  const hRad = (H * Math.PI) / 180;
  
  // Convert OKLCH to OKLab
  const oklab_a = C * Math.cos(hRad);
  const oklab_b = C * Math.sin(hRad);

  // Convert OKLab to LMS
  const l = L + 0.3963377774 * oklab_a + 0.2158037573 * oklab_b;
  const m = L - 0.1055613458 * oklab_a - 0.0638541728 * oklab_b;
  const s = L - 0.0894841775 * oklab_a - 1.2914855480 * oklab_b;

  // LMS to LMS cubics
  const l_cube = l * l * l;
  const m_cube = m * m * m;
  const s_cube = s * s * s;

  // LMS cubics to linear sRGB
  const r_lin = +4.0767416621 * l_cube - 3.3077115913 * m_cube + 0.2309699292 * s_cube;
  const g_lin = -1.2684380046 * l_cube + 2.6097574011 * m_cube - 0.3413193965 * s_cube;
  const b_lin = -0.0041960863 * l_cube - 0.7034186148 * m_cube + 1.7076147010 * s_cube;

  // Linear sRGB to standard sRGB (gamma correction)
  const gammaCorrect = (c) => {
    if (c <= 0.0031308) {
      return 12.92 * c;
    } else {
      return 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
    }
  };

  const r = Math.min(255, Math.max(0, Math.round(gammaCorrect(r_lin) * 255)));
  const g = Math.min(255, Math.max(0, Math.round(gammaCorrect(g_lin) * 255)));
  const b = Math.min(255, Math.max(0, Math.round(gammaCorrect(b_lin) * 255)));

  if (AStr !== undefined) {
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  } else {
    return `rgb(${r}, ${g}, ${b})`;
  }
}

/**
 * Replaces all oklch(...) matches in a string with their rgb(...) or rgba(...) equivalents.
 */
export function replaceOklchWithRgb(value) {
  if (typeof value !== 'string' || !value.includes('oklch')) {
    return value;
  }
  
  // Replace all oklch(...) occurrences in the string
  return value.replace(/oklch\(\s*([\d.]+%?)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+%?))?\s*\)/gi, (match) => {
    return oklchToRgb(match);
  });
}
