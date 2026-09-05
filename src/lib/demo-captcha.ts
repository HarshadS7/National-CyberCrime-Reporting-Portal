/**
 * DEMO MODE — a stand-in for the real CAPTCHA required by finding P0-2 (see
 * FRONTEND_PLAN.md and CaptchaField.tsx). It renders a code as an inline SVG
 * data URI so pages are visually and functionally complete before the real
 * challenge is agreed with the platform/security team.
 *
 * It verifies nothing server-side. Do not treat this as a security control,
 * and do not ship it to production — Phase 1 must replace it.
 */

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I — avoids ambiguity

function randomCode(length = 5) {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return out;
}

export interface DemoCaptcha {
  challengeId: string;
  imageDataUri: string;
}

export function generateDemoCaptcha(): DemoCaptcha {
  const code = randomCode();
  const challengeId = `demo-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;

  const letters = code
    .split("")
    .map((ch, i) => {
      const x = 16 + i * 27;
      const y = 34 + (i % 2 === 0 ? -3 : 3);
      const rotate = (i % 2 === 0 ? -1 : 1) * (6 + i * 2);
      return `<text x="${x}" y="${y}" transform="rotate(${rotate} ${x} ${y})" font-family="monospace" font-size="26" font-weight="700" fill="#16233a">${ch}</text>`;
    })
    .join("");

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="56">` +
    `<rect width="160" height="56" fill="#e9edf3"/>` +
    `<line x1="4" y1="10" x2="150" y2="46" stroke="#b3bece" stroke-width="2"/>` +
    `<line x1="4" y1="46" x2="150" y2="10" stroke="#b3bece" stroke-width="2"/>` +
    letters +
    `</svg>`;

  return {
    challengeId,
    imageDataUri: `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`,
  };
}
