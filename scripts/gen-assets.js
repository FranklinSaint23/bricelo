const fs = require('fs')
const path = require('path')
const sharp = require('sharp')

async function run() {
  // 1. Logo
  const logoBuf = fs.readFileSync(path.join(__dirname, '../public/logo.png'))
  const logoBase64 = `data:image/png;base64,${logoBuf.toString('base64')}`

  // 2. Signature SVG -> PNG
  // Styled like an authentic executive cursive signature for "Bricélo"
  const signatureSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 200" width="500" height="200">
    <g fill="none" stroke="#0d1b2e" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round">
      <!-- Grand B élégant avec boucle descendante -->
      <path d="M 60 45 C 55 85 50 135 48 165" />
      <path d="M 46 55 C 65 30 120 25 125 65 C 128 92 90 98 56 102" />
      <path d="M 56 102 C 95 98 135 106 130 142 C 124 165 85 170 48 165" />
      <!-- Enchaînement 'ric' -->
      <path d="M 126 138 C 138 112 152 108 165 112 C 168 126 160 136 172 134" />
      <path d="M 172 134 C 182 112 190 110 194 133" />
      <circle cx="191" cy="95" r="3" fill="#0d1b2e" />
      <path d="M 198 130 C 212 108 228 110 216 122 C 204 134 218 136 226 134" />
      <!-- 'é' avec accent énergique -->
      <path d="M 226 134 C 242 124 242 110 230 110 C 218 112 220 134 236 134" />
      <path d="M 230 98 L 242 88" stroke-width="4" />
      <!-- 'l' montant avec grande boucle -->
      <path d="M 236 134 C 255 70 270 35 274 38 C 276 46 264 105 272 135" />
      <!-- 'o' fluide -->
      <path d="M 272 135 C 290 110 306 110 306 124 C 304 138 286 138 285 122 C 285 110 302 114 316 112" />
      <!-- Paraphe / Trait de signature expressif sous le nom -->
      <path d="M 316 112 C 365 96 420 84 400 120 C 378 158 225 180 80 174 C 40 172 32 165 68 160 C 140 150 310 156 450 144" stroke-width="4" />
    </g>
  </svg>
  `

  const sigBuf = await sharp(Buffer.from(signatureSvg)).png().toBuffer()
  const sigBase64 = `data:image/png;base64,${sigBuf.toString('base64')}`

  // 3. Stylized "Merci" SVG -> PNG (similar to the image: stencil/bold distressed or clean serif in Bricélo accent)
  const merciSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 100" width="320" height="100">
    <text x="10" y="75" font-family="'Impact', 'Arial Black', sans-serif" font-weight="900" font-size="78" fill="#d97706" letter-spacing="4">
      Merci
    </text>
  </svg>
  `
  const merciBuf = await sharp(Buffer.from(merciSvg)).png().toBuffer()
  const merciBase64 = `data:image/png;base64,${merciBuf.toString('base64')}`

  const fileContent = `// Auto-generated PDF assets for Bricélo Invoices & Receipts
export const BRICELO_LOGO_BASE64 = "${logoBase64}";
export const BRICELO_SIGNATURE_BASE64 = "${sigBase64}";
export const BRICELO_MERCI_BASE64 = "${merciBase64}";
`

  fs.writeFileSync(path.join(__dirname, '../src/lib/pdf-assets.ts'), fileContent)
  console.log('Successfully generated src/lib/pdf-assets.ts')
}

run().catch(console.error)
