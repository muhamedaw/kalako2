import QRCode from 'qrcode'

export async function makeQrCodeDataUrl(text: string): Promise<string> {
  return QRCode.toDataURL(text, { width: 256, margin: 1 })
}
