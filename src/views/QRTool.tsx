import React, { useState, useRef } from 'react'
import QRCode from 'react-qr-code'
import { QrCode, Link } from 'lucide-react'
import { addDoc, collection } from 'firebase/firestore'
import { db } from '../config/firebase'
import { downloadFile } from '../utils/downloadUtils'
import { Button, Card, ConfirmationModal } from '../components/ui'

interface QRToolProps {
    onUsage: (cost: number) => Promise<boolean>
    userId?: string
}

export const QRTool: React.FC<QRToolProps> = ({ onUsage, userId }) => {
    const [text, setText] = useState('')
    const [fgColor, setFgColor] = useState('#000000')
    const qrRef = useRef<HTMLDivElement>(null)
    const [modal, setModal] = useState({
        isOpen: false,
        title: '',
        message: '',
    })
    const handleDownload = async () => {
        if (!text) return
        const canProceed = await onUsage(1)
        if (!canProceed) return
        try {
            const svg = qrRef.current?.querySelector('svg')
            if (svg) {
                const svgData = new XMLSerializer().serializeToString(svg)
                const canvas = document.createElement('canvas')
                const ctx = canvas.getContext('2d')
                const img = new Image()

                img.onload = async () => {
                    canvas.width = 512
                    canvas.height = 512
                    if (ctx) {
                        ctx.fillStyle = '#ffffff'
                        ctx.fillRect(0, 0, canvas.width, canvas.height)
                        ctx.drawImage(img, 0, 0, 512, 512)
                        const pngUrl = canvas.toDataURL('image/png')
                        if (userId) {
                            try {
                                await addDoc(
                                    collection(db, 'users', userId, 'history'),
                                    {
                                        createdAt: new Date().toISOString(),
                                        category: 'logo',
                                        clientName: 'Código QR',
                                        platform: 'QR Generator',
                                        type: 'QR Code',
                                        content: `Enlace: ${text}`,
                                        imageUrl: pngUrl,
                                    },
                                )
                            } catch (e) {
                                console.error('Error guardando historial', e)
                            }
                        }

                        await downloadFile(pngUrl, `qr-${Date.now()}.png`)
                    }
                }
                img.onerror = () => {
                    setModal({
                        isOpen: true,
                        title: 'Error',
                        message: 'No se pudo procesar el código QR.',
                    })
                }
                img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
            } else {
                throw new Error('No se encontró el elemento QR.')
            }
        } catch (error: any) {
            setModal({
                isOpen: true,
                title: 'Error',
                message: error.message || 'Error desconocido',
            })
        }
    }

    return (
        <div className="max-w-4xl mx-auto">
            <ConfirmationModal
                isOpen={modal.isOpen}
                onClose={() => setModal({ ...modal, isOpen: false })}
                onConfirm={() => setModal({ ...modal, isOpen: false })}
                title={modal.title}
                message={modal.message}
                confirmText="Ok"
                cancelText=""
                isDanger={true}
            />
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <QrCode className="w-6 h-6 text-brand-600" /> Generador QR
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                    Crea códigos QR para tus clientes.{' '}
                    <span className="bg-brand-100 dark:bg-brand-900/30 text-brand-800 dark:text-brand-300 text-xs font-bold px-2 py-0.5 rounded">
                        Costo: 1 Crédito
                    </span>
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="p-6 space-y-4 h-fit">
                    <div>
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                            <Link className="w-4 h-4" /> URL o Texto
                        </label>
                        <input
                            type="text"
                            placeholder="https://miweb.com"
                            className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-brand-500 bg-white dark:bg-slate-900 dark:text-white"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 block">
                            Color del Código
                        </label>
                        <input
                            type="color"
                            className="w-full h-10 cursor-pointer rounded border p-1 bg-white dark:bg-slate-700"
                            value={fgColor}
                            onChange={(e) => setFgColor(e.target.value)}
                        />
                    </div>
                    <Button
                        onClick={handleDownload}
                        disabled={!text}
                        className="w-full"
                    >
                        Generar y Descargar (1 Crédito)
                    </Button>
                </Card>

                <div
                    className="flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-xl p-8 border border-slate-200 dark:border-slate-700"
                    ref={qrRef}
                >
                    {text ? (
                        <div className="bg-white p-4 rounded-xl shadow-sm">
                            <QRCode value={text} fgColor={fgColor} size={200} />
                        </div>
                    ) : (
                        <div className="text-slate-400 text-center">
                            <QrCode className="w-16 h-16 mx-auto mb-2 opacity-20" />{' '}
                            <p>Ingresa un texto para previsualizar</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
