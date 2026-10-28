'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import QRCode from 'qrcode'
import { Share2, QrCode, Copy, Check, ExternalLink, Printer, Download, Sparkles, Store } from 'lucide-react'

interface VendorStoreShareCardProps {
  store: {
    id: string
    name: string
    slug: string
    logo_url?: string | null
    description?: string | null
    rating?: number
    review_count?: number
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = (e) => reject(e)
    img.src = src
  })
}

function drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, w, h, r)
  } else {
    ctx.moveTo(x + r, y)
    ctx.arcTo(x + w, y, x + w, y + h, r)
    ctx.arcTo(x + w, y + h, x, y + h, r)
    ctx.arcTo(x, y + h, x, y, r)
    ctx.arcTo(x, y, x + w, y, r)
    ctx.closePath()
  }
}

export function VendorStoreShareCard({ store }: VendorStoreShareCardProps) {
  const [copied, setCopied] = useState(false)
  const [qrDataUrl, setQrDataUrl] = useState<string>('')
  const [isGeneratingPoster, setIsGeneratingPoster] = useState(false)
  const [showPrintModal, setShowPrintModal] = useState(false)

  // URL absolue de la boutique
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://bricelo.com'
  const storeUrl = `${origin}/boutique/${store.slug}`

  // Générer le QR code haute définition
  useEffect(() => {
    QRCode.toDataURL(storeUrl, {
      width: 480,
      margin: 2,
      color: {
        dark: '#0D1B2E',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'H',
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Erreur génération QR Code:', err))
  }, [storeUrl])

  function handleCopy() {
    navigator.clipboard.writeText(storeUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  function handleShareWhatsApp() {
    const text = `🛍️ *Découvrez la boutique officielle de ${store.name} sur BRICÉLO !*\n\nConsultez tous nos produits disponibles, nos nouveautés et commandez en direct avec livraison rapide partout au Cameroun :\n👉 ${storeUrl}\n\n✅ Produits authentiques, prix direct et paiement sécurisé (Orange Money, MTN MoMo, Espèces).`
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  // Télécharger l'affiche complète (avec le texte sous le carré)
  async function handleDownloadPoster() {
    if (!qrDataUrl || isGeneratingPoster) return
    setIsGeneratingPoster(true)

    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const width = 1200
      const height = 1600
      canvas.width = width
      canvas.height = height

      // 1. Fond blanc pur et propre
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, width, height)

      // Bordure extérieure raffinée
      ctx.strokeStyle = '#E2E8F0'
      ctx.lineWidth = 10
      drawRoundedRect(ctx, 20, 20, width - 40, height - 40, 32)
      ctx.stroke()

      // Bandeau d'en-tête bleu nuit Bricélo
      ctx.fillStyle = '#0D1B2E'
      ctx.save()
      ctx.beginPath()
      drawRoundedRect(ctx, 20, 20, width - 40, 130, 32)
      ctx.clip()
      ctx.fillRect(20, 20, width - 40, 130)
      ctx.restore()

      // Texte en-tête BRICÉLO
      ctx.fillStyle = '#F59E0B'
      ctx.font = 'bold 24px system-ui, -apple-system, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('BRICÉLO  •  BOUTIQUE OFFICIELLE CERTIFIÉE', width / 2, 85)

      let currentY = 195

      // 2. Logo rond de la boutique (si présent)
      if (store.logo_url) {
        try {
          const logoImg = await loadImage(store.logo_url)
          const logoSize = 130
          const logoX = (width - logoSize) / 2
          const logoY = currentY

          ctx.save()
          ctx.beginPath()
          ctx.arc(width / 2, logoY + logoSize / 2, logoSize / 2, 0, Math.PI * 2)
          ctx.clip()
          ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize)
          ctx.restore()

          // Bordure du logo
          ctx.strokeStyle = '#E2E8F0'
          ctx.lineWidth = 5
          ctx.beginPath()
          ctx.arc(width / 2, logoY + logoSize / 2, logoSize / 2, 0, Math.PI * 2)
          ctx.stroke()

          currentY += logoSize + 30
        } catch {
          currentY += 25
        }
      } else {
        currentY += 35
      }

      // 3. Nom officiel de la boutique
      ctx.fillStyle = '#0D1B2E'
      ctx.font = '900 52px system-ui, -apple-system, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'alphabetic'
      const storeName = store.name.length > 32 ? store.name.substring(0, 30) + '...' : store.name
      ctx.fillText(storeName, width / 2, currentY)
      currentY += 46

      // Slogan / description
      ctx.fillStyle = '#64748B'
      ctx.font = '500 24px system-ui, -apple-system, sans-serif'
      ctx.fillText('Retrouvez tous nos produits & commandez en direct sur internet', width / 2, currentY)
      currentY += 60

      // 4. Cadre élégant pour le QR Code
      const qrBoxSize = 580
      const qrBoxX = (width - qrBoxSize) / 2
      const qrBoxY = currentY

      ctx.fillStyle = '#F8FAFC'
      drawRoundedRect(ctx, qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 36)
      ctx.fill()
      ctx.strokeStyle = '#CBD5E1'
      ctx.lineWidth = 4
      ctx.stroke()

      // Dessin du QR Code à l'intérieur
      const qrImg = await loadImage(qrDataUrl)
      const qrPadding = 35
      ctx.drawImage(qrImg, qrBoxX + qrPadding, qrBoxY + qrPadding, qrBoxSize - (qrPadding * 2), qrBoxSize - (qrPadding * 2))

      currentY = qrBoxY + qrBoxSize + 60

      // 5. 🎯 TEXTE DIRECTEMENT SOUS LE CARRÉ DU QR CODE
      ctx.fillStyle = '#0D1B2E'
      ctx.font = '900 40px system-ui, -apple-system, sans-serif'
      ctx.fillText('Scannez pour visiter ma boutique', width / 2, currentY)
      currentY += 46

      ctx.fillStyle = '#2563EB'
      ctx.font = 'bold 26px monospace, system-ui, sans-serif'
      ctx.fillText(`bricelo.com/boutique/${store.slug}`, width / 2, currentY)
      currentY += 42

      ctx.fillStyle = '#64748B'
      ctx.font = '500 22px system-ui, -apple-system, sans-serif'

      // 6. Pied de page avec garanties
      const footerY = height - 90
      ctx.strokeStyle = '#E2E8F0'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(80, footerY - 45)
      ctx.lineTo(width - 80, footerY - 45)
      ctx.stroke()

      ctx.fillStyle = '#0F172A'
      ctx.font = 'bold 22px system-ui, -apple-system, sans-serif'
      ctx.fillText('✓ Produits 100% Authentiques   •   ✓ Paiement Sécurisé   •   ✓ Livraison Rapide', width / 2, footerY)

      // Export Blob & Téléchargement
      canvas.toBlob((blob) => {
        if (!blob) return
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `affiche-boutique-${store.slug}.png`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }, 'image/png')
    } catch (err) {
      console.error('Erreur lors de la génération de l\'affiche PNG:', err)
    } finally {
      setIsGeneratingPoster(false)
    }
  }

  // Télécharger le QR code brut (carré seul)
  function handleDownloadRawQr() {
    if (!qrDataUrl) return
    const a = document.createElement('a')
    a.href = qrDataUrl
    a.download = `qrcode-${store.slug}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  function handlePrintFlyer() {
    setShowPrintModal(true)
    setTimeout(() => {
      window.print()
    }, 400)
  }

  return (
    <div className="mt-12 pt-8 border-t border-[var(--color-slate-200)] flex flex-col gap-8">
      {/* En-tête de section */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-bold mb-2">
          <Sparkles className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
          <span>Visibilité & Ventes Directes</span>
        </div>
        <h2 className="text-xl font-black text-[var(--color-navy-900)] tracking-tight">
          Partagez votre boutique & générez plus de commandes
        </h2>
        <p className="text-sm text-[var(--color-slate-500)] mt-1 max-w-2xl">
          Faites la promotion de votre vitrine exclusive auprès de vos clients WhatsApp, Facebook, ou affichez votre QR Code physique sur votre comptoir de vente (Akwa, Mokolo, Marché Central, etc.).
        </p>
      </div>

      {/* Bloc principal avec 2 colonnes : Actions & QR Code + Mockup WhatsApp */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* COLONNE GAUCHE (7 cols) : Liens, Bouton WhatsApp & QR Code */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          {/* Boîte Lien Unique */}
          <div className="bg-white rounded-2xl border border-[var(--color-slate-200)] p-5 shadow-xs">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-[var(--color-slate-500)] mb-2">
              Votre lien officiel BRICÉLO
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-[var(--color-slate-50)] border border-[var(--color-slate-200)] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono text-[var(--color-navy-900)] truncate select-all">
                {storeUrl}
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="px-4 py-2.5 rounded-xl border border-[var(--color-slate-200)] bg-white hover:bg-[var(--color-slate-50)] text-xs font-bold text-[var(--color-navy-900)] transition-all flex items-center gap-1.5 shrink-0 shadow-2xs active:scale-95"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4 text-slate-500" />}
                <span>{copied ? 'Copié !' : 'Copier'}</span>
              </button>
              <a
                href={`/boutique/${store.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl border border-[var(--color-slate-200)] bg-white hover:bg-[var(--color-slate-50)] text-slate-600 transition-all shrink-0 shadow-2xs"
                title="Voir la vitrine en direct"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>

            {/* Bouton Partager sur WhatsApp Officiel */}
            <div className="mt-4 pt-4 border-t border-[var(--color-slate-100)]">
              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="w-full py-3.5 px-5 rounded-xl font-extrabold text-sm text-white bg-[#25D366] hover:bg-[#1EBE5D] transition-all shadow-md flex items-center justify-center gap-2.5 active:scale-[0.99] cursor-pointer"
              >
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.173.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.043.072.043.419-.101.824z" />
                </svg>
                <span>Partager ma boutique sur WhatsApp</span>
              </button>
            </div>
          </div>

          {/* Boîte QR Code Physique */}
          <div className="bg-white rounded-2xl border border-[var(--color-slate-200)] p-5 shadow-xs flex flex-col sm:flex-row items-center gap-5">
            <div className="relative p-3 rounded-2xl bg-white border-2 border-slate-200 shadow-md shrink-0 flex flex-col items-center">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt={`QR Code ${store.name}`} className="h-32 w-32 object-contain rounded-lg" />
              ) : (
                <div className="h-32 w-32 flex items-center justify-center bg-slate-50 rounded-lg">
                  <QrCode className="h-8 w-8 text-slate-300 animate-pulse" />
                </div>
              )}
              {/* Texte directement sous le carré */}
              <span className="text-[11px] font-extrabold text-[var(--color-navy-900)] mt-2 text-center max-w-[140px] leading-tight">
                Scannez pour visiter ma boutique
              </span>
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h3 className="font-bold text-sm text-[var(--color-navy-900)] flex items-center justify-center sm:justify-start gap-1.5">
                <QrCode className="h-4 w-4 text-[var(--color-accent)]" />
                <span>QR Code & Affiche de comptoir</span>
              </h3>
              <p className="text-xs text-[var(--color-slate-500)] mt-1 leading-relaxed">
                Vos clients scannent ce code avec leur téléphone pour voir tout votre catalogue sans installer d’application.
              </p>
              <div className="flex items-center justify-center sm:justify-start gap-2 mt-3.5 flex-wrap">
                <button
                  type="button"
                  onClick={handleDownloadPoster}
                  disabled={isGeneratingPoster || !qrDataUrl}
                  className="px-4 py-2.5 rounded-xl bg-[var(--color-navy-900)] hover:bg-[var(--color-navy-800)] text-white text-xs font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
                  title="Télécharger l'affiche prête à imprimer avec logo, QR Code et texte d'invitation"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>{isGeneratingPoster ? 'Génération...' : "Télécharger l'affiche"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadRawQr}
                  className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  title="Télécharger uniquement le code carré sans l'affiche"
                >
                  <QrCode className="h-3.5 w-3.5" />
                  <span>QR seul</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrintFlyer}
                  className="px-3 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Imprimer A4</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* COLONNE DROITE (5 cols) : Mockup WhatsApp Live Preview */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[var(--color-slate-500)]">
              Aperçu WhatsApp personnalisé
            </span>
            <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              En direct
            </span>
          </div>

          {/* Cadre mockup WhatsApp réaliste */}
          <div className="rounded-2xl border border-slate-300 dark:border-slate-800 bg-[#EFEAE2] p-4 shadow-sm relative overflow-hidden">
            {/* Texture de fond WhatsApp subtile */}
            <div className="text-[11px] text-center text-slate-500 font-medium mb-3 bg-white/80 backdrop-blur-xs py-0.5 px-3 rounded-full w-fit mx-auto shadow-2xs">
              Aujourd&apos;hui
            </div>

            {/* Bulle de message envoyée (verte WhatsApp) */}
            <div className="bg-[#D9FDD3] text-slate-900 rounded-xl rounded-tr-none p-3 shadow-xs max-w-[94%] ml-auto border border-emerald-100">
              <p className="text-xs font-medium leading-relaxed mb-2.5">
                Bonjour ! Retrouvez tous nos produits et nouveautés sur notre boutique officielle :
              </p>

              {/* Carte d'aperçu de lien WhatsApp */}
              <div className="rounded-lg overflow-hidden bg-white/90 border border-emerald-200/80 shadow-2xs">
                {/* Image du logo de la boutique */}
                <div className="relative h-28 w-full bg-slate-100 flex items-center justify-center overflow-hidden border-b border-emerald-100">
                  {store.logo_url ? (
                    <Image
                      src={store.logo_url}
                      alt={store.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-slate-400">
                      <Store className="h-8 w-8 text-slate-400" />
                      <span className="text-[10px] font-bold uppercase">{store.name}</span>
                    </div>
                  )}
                </div>

                {/* Titre et description de la carte */}
                <div className="p-2.5">
                  <p className="text-xs font-bold text-slate-900 truncate leading-snug">
                    Boutique officielle {store.name} | BRICÉLO
                  </p>
                  <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed mt-0.5">
                    {store.description || `Découvrez la boutique officielle de ${store.name} sur Bricelo. Produits certifiés, livraison rapide et paiement sécurisé.`}
                  </p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide mt-1.5 flex items-center gap-1 font-semibold">
                    <span>bricelo.com</span>
                  </p>
                </div>
              </div>

              {/* Lien & Timestamp */}
              <div className="flex items-center justify-between mt-2 pt-1">
                <span className="text-[11px] text-emerald-800 font-semibold underline truncate max-w-[170px]">
                  bricelo.com/boutique/{store.slug}
                </span>
                <span className="text-[9px] text-slate-500 font-medium flex items-center gap-1">
                  12:45
                  <span className="text-emerald-600 font-bold">✓✓</span>
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 text-center mt-3 font-medium">
              ✨ C&apos;est exactement ainsi que votre boutique apparaîtra aux yeux de vos clients sur WhatsApp.
            </p>
          </div>
        </div>
      </div>

      {/* ── FICHE IMPRIMABLE A4 (Seulement lors du print) ── */}
      {showPrintModal && (
        <div className="hidden print:flex fixed inset-0 bg-white z-[99999] flex-col items-center justify-between p-12 text-center text-slate-900">
          <div className="w-full flex justify-between items-center border-b pb-6">
            <span className="text-2xl font-black tracking-tight text-[var(--color-navy-900)]">BRICÉLO</span>
            <span className="text-sm font-bold text-slate-500">Boutique Officielle Certifiée</span>
          </div>

          <div className="flex flex-col items-center my-auto">
            {store.logo_url && (
              <img
                src={store.logo_url}
                alt={store.name}
                className="h-28 w-28 object-cover rounded-2xl border-4 border-slate-200 mb-6 shadow-md"
              />
            )}
            <h1 className="text-4xl font-black mb-2">{store.name}</h1>
            <p className="text-lg text-slate-600 max-w-md mb-8">
              Commandez tous nos produits en ligne avec livraison rapide directement chez vous ou sur votre chantier.
            </p>

            <div className="p-4 bg-white border-4 border-slate-900 rounded-3xl shadow-xl mb-6">
              {qrDataUrl && <img src={qrDataUrl} alt="QR Code" className="h-64 w-64 object-contain" />}
            </div>

            <p className="text-xl font-extrabold text-slate-900 mb-1">
              Scannez pour visiter ma boutique
            </p>
            <p className="text-sm font-mono text-slate-500">{storeUrl}</p>
          </div>

          <div className="w-full grid grid-cols-3 gap-4 border-t pt-6 text-xs text-slate-600 font-semibold">
            <div>✓ Produits 100% Authentiques</div>
            <div>✓ Paiement Mobile Money & Cash</div>
            <div>✓ Livraison Express à Domicile</div>
          </div>
        </div>
      )}
    </div>
  )
}
