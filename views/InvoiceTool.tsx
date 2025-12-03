import React, { useState, useRef, useEffect } from 'react'
import {
    Download,
    Plus,
    Trash2,
    FileText,
    Upload,
    Smartphone,
    BadgeInfo,
} from 'lucide-react'
import { Button, Card } from '../components/ui'
// @ts-ignore
import html2pdf from 'html2pdf.js'
import { collection, addDoc, doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../firebase'

interface InvoiceToolProps {
    onUsage: (cost: number) => Promise<boolean>
    userId?: string
}

export const InvoiceTool: React.FC<InvoiceToolProps> = ({
    onUsage,
    userId,
}) => {
    const [invoiceNumber, setInvoiceNumber] = useState('001')
    const [invoiceSequence, setInvoiceSequence] = useState(1)
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])
    const [currency, setCurrency] = useState('$')

    const [sender, setSender] = useState({
        name: '',
        email: '',
        address: '',
        phone: '',
        idDoc: '',
    })
    const [client, setClient] = useState({
        name: '',
        email: '',
        address: '',
        phone: '',
        idDoc: '',
    })

    const [items, setItems] = useState([
        { id: 1, desc: 'Concepto de servicio prestado', qty: 1, price: 100 },
    ])
    const [taxRate, setTaxRate] = useState(0)
    const [notes, setNotes] = useState('Gracias por su confianza.')

    const [logo, setLogo] = useState<string | null>(null)
    const [isDownloading, setIsDownloading] = useState(false)

    const invoiceRef = useRef<HTMLDivElement>(null)

    const subtotal = items.reduce((acc, item) => acc + item.qty * item.price, 0)
    const taxAmount = (subtotal * taxRate) / 100
    const total = subtotal + taxAmount

    useEffect(() => {
        const fetchInvoiceData = async () => {
            if (!userId) return
            try {
                const userDoc = await getDoc(doc(db, 'users', userId))
                if (userDoc.exists()) {
                    const data = userDoc.data()
                    if (data.lastInvoiceSequence) {
                        const nextNum = data.lastInvoiceSequence + 1
                        setInvoiceSequence(nextNum)
                        setInvoiceNumber(nextNum.toString().padStart(3, '0'))
                    }
                }
            } catch (error) {
                console.error('Error sequence', error)
            }
        }
        fetchInvoiceData()
    }, [userId])

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => setLogo(reader.result as string)
            reader.readAsDataURL(file)
        }
    }

    const addItem = () =>
        setItems([...items, { id: Date.now(), desc: '', qty: 1, price: 0 }])
    const removeItem = (id: number) =>
        setItems(items.filter((i) => i.id !== id))
    const updateItem = (id: number, field: string, value: any) =>
        setItems(items.map((i) => (i.id === id ? { ...i, [field]: value } : i)))

    const handleDownload = async () => {
        const canProceed = await onUsage(3)
        if (!canProceed) return

        setIsDownloading(true)

        if (userId) {
            try {
                await addDoc(collection(db, 'users', userId, 'history'), {
                    createdAt: new Date().toISOString(),
                    category: 'invoice',
                    clientName: client.name || 'Cliente Desconocido',
                    platform: 'Invoice Generator',
                    type: 'Factura PDF',
                    content: `Factura #${invoiceNumber} por ${currency}${total.toFixed(
                        2
                    )}`,
                    invoiceData: {
                        invoiceNumber,
                        date,
                        currency,
                        sender,
                        client,
                        items,
                        taxRate,
                        notes,
                        logo,
                        total,
                    },
                })

                await setDoc(
                    doc(db, 'users', userId),
                    { lastInvoiceSequence: invoiceSequence },
                    { merge: true }
                )
                const nextOne = invoiceSequence + 1
                setInvoiceSequence(nextOne)
            } catch (e) {
                console.error('Error guardando datos', e)
            }
        }

        const element = invoiceRef.current
        if (!element) {
            setIsDownloading(false)
            return
        }

        const opt = {
            margin: 0,
            filename: `factura-${invoiceNumber}-${client.name}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: {
                scale: 2,
                useCORS: true,
                scrollY: 0,
                // TRUCO: Le decimos que simule una ventana de 1200px aunque estemos en móvil
                // Esto hace que el PDF salga perfecto (A4) aunque en la pantalla se vea pequeño.
                windowWidth: 1200,
            },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        }

        html2pdf()
            .set(opt)
            .from(element)
            .save()
            .then(() => {
                setIsDownloading(false)
            })
    }

    return (
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-start pb-20">
            {/* --- COLUMNA IZQUIERDA: EDITOR (FORMULARIO) --- */}
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <FileText className="w-6 h-6 text-brand-600" />{' '}
                        Generador de Facturas
                    </h2>
                    <p className="text-slate-600 mt-1">
                        Crea facturas profesionales.
                        <span className="bg-brand-100 text-brand-800 text-xs font-bold px-2 py-0.5 rounded ml-2">
                            Costo: 3 Créditos
                        </span>
                    </p>
                </div>

                <Card className="p-6 shadow-md space-y-6">
                    {/* Configuración Básica */}
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">
                                Número #
                            </label>
                            <input
                                type="text"
                                value={invoiceNumber}
                                onChange={(e) => {
                                    setInvoiceNumber(e.target.value)
                                    const num = parseInt(e.target.value)
                                    if (!isNaN(num)) setInvoiceSequence(num)
                                }}
                                className="w-full p-2 border rounded"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">
                                Fecha
                            </label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full p-2 border rounded"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">
                                Moneda
                            </label>
                            <select
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value)}
                                className="w-full p-2 border rounded"
                            >
                                <option value="$">USD ($)</option>
                                <option value="€">EUR (€)</option>
                                <option value="£">GBP (£)</option>
                                <option value="Mx$">MXN ($)</option>
                            </select>
                        </div>
                    </div>

                    {/* Logo */}
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">
                            Tu Logo
                        </label>
                        <div className="flex items-center gap-4">
                            {logo && (
                                <img
                                    src={logo}
                                    alt="Logo preview"
                                    className="h-12 object-contain"
                                />
                            )}
                            <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded text-sm text-slate-700 flex items-center gap-2">
                                <Upload className="w-4 h-4" /> Subir Imagen
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoUpload}
                                    className="hidden"
                                />
                            </label>
                            {logo && (
                                <button
                                    onClick={() => setLogo(null)}
                                    className="text-red-500 text-xs"
                                >
                                    Eliminar
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Emisor y Receptor */}
                    <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-2 border-b border-slate-100 pb-4">
                            <h3 className="font-bold text-slate-800">
                                Tus Datos (Emisor)
                            </h3>
                            <input
                                placeholder="Tu Nombre / Empresa"
                                value={sender.name}
                                onChange={(e) =>
                                    setSender({
                                        ...sender,
                                        name: e.target.value,
                                    })
                                }
                                className="w-full p-2 border rounded text-sm"
                            />
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    placeholder="ID / DNI / RUT (Opcional)"
                                    value={sender.idDoc}
                                    onChange={(e) =>
                                        setSender({
                                            ...sender,
                                            idDoc: e.target.value,
                                        })
                                    }
                                    className="w-full p-2 border rounded text-sm"
                                />
                                <input
                                    placeholder="Teléfono (Opcional)"
                                    value={sender.phone}
                                    onChange={(e) =>
                                        setSender({
                                            ...sender,
                                            phone: e.target.value,
                                        })
                                    }
                                    className="w-full p-2 border rounded text-sm"
                                />
                            </div>
                            <input
                                placeholder="Email"
                                value={sender.email}
                                onChange={(e) =>
                                    setSender({
                                        ...sender,
                                        email: e.target.value,
                                    })
                                }
                                className="w-full p-2 border rounded text-sm"
                            />
                            <textarea
                                placeholder="Dirección Física"
                                value={sender.address}
                                onChange={(e) =>
                                    setSender({
                                        ...sender,
                                        address: e.target.value,
                                    })
                                }
                                className="w-full p-2 border rounded text-sm h-12 resize-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <h3 className="font-bold text-slate-800">
                                Cliente (Receptor)
                            </h3>
                            <input
                                placeholder="Nombre Cliente"
                                value={client.name}
                                onChange={(e) =>
                                    setClient({
                                        ...client,
                                        name: e.target.value,
                                    })
                                }
                                className="w-full p-2 border rounded text-sm"
                            />
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    placeholder="ID / DNI / RUT (Opcional)"
                                    value={client.idDoc}
                                    onChange={(e) =>
                                        setClient({
                                            ...client,
                                            idDoc: e.target.value,
                                        })
                                    }
                                    className="w-full p-2 border rounded text-sm"
                                />
                                <input
                                    placeholder="Teléfono (Opcional)"
                                    value={client.phone}
                                    onChange={(e) =>
                                        setClient({
                                            ...client,
                                            phone: e.target.value,
                                        })
                                    }
                                    className="w-full p-2 border rounded text-sm"
                                />
                            </div>
                            <input
                                placeholder="Email Cliente"
                                value={client.email}
                                onChange={(e) =>
                                    setClient({
                                        ...client,
                                        email: e.target.value,
                                    })
                                }
                                className="w-full p-2 border rounded text-sm"
                            />
                            <textarea
                                placeholder="Dirección Cliente"
                                value={client.address}
                                onChange={(e) =>
                                    setClient({
                                        ...client,
                                        address: e.target.value,
                                    })
                                }
                                className="w-full p-2 border rounded text-sm h-12 resize-none"
                            />
                        </div>
                    </div>

                    {/* Items */}
                    <div>
                        <h3 className="font-bold text-slate-800 mb-2">
                            Conceptos
                        </h3>
                        <div className="space-y-2">
                            {items.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex flex-col sm:flex-row gap-2 items-start sm:items-center border-b border-slate-100 pb-4 sm:border-0 sm:pb-0 mb-2 sm:mb-0"
                                >
                                    <input
                                        placeholder="Descripción"
                                        value={item.desc}
                                        onChange={(e) =>
                                            updateItem(
                                                item.id,
                                                'desc',
                                                e.target.value
                                            )
                                        }
                                        className="w-full sm:flex-1 p-2 border rounded text-sm"
                                    />
                                    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                                        <input
                                            type="number"
                                            placeholder="Cant."
                                            value={item.qty}
                                            onChange={(e) =>
                                                updateItem(
                                                    item.id,
                                                    'qty',
                                                    Number(e.target.value)
                                                )
                                            }
                                            className="w-20 p-2 border rounded text-sm"
                                        />
                                        <input
                                            type="number"
                                            placeholder="Precio"
                                            value={item.price}
                                            onChange={(e) =>
                                                updateItem(
                                                    item.id,
                                                    'price',
                                                    Number(e.target.value)
                                                )
                                            }
                                            className="flex-1 sm:w-24 p-2 border rounded text-sm"
                                        />
                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className="text-slate-400 hover:text-red-500 p-2"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <button
                                onClick={addItem}
                                className="text-sm text-brand-600 font-bold flex items-center gap-1 hover:underline mt-2"
                            >
                                <Plus className="w-4 h-4" /> Agregar Item
                            </button>
                        </div>
                    </div>

                    {/* Totales */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">
                                Notas
                            </label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="w-full p-2 border rounded text-sm h-20"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">
                                Impuestos (%)
                            </label>
                            <input
                                type="number"
                                value={taxRate}
                                onChange={(e) =>
                                    setTaxRate(Number(e.target.value))
                                }
                                className="w-full p-2 border rounded"
                            />
                        </div>
                    </div>

                    <Button
                        onClick={handleDownload}
                        isLoading={isDownloading}
                        className="w-full"
                    >
                        {isDownloading
                            ? 'Generando PDF...'
                            : `Descargar Factura (3 Créditos)`}
                    </Button>
                </Card>
            </div>

            {/* --- COLUMNA DERECHA: VISTA PREVIA --- */}
            {/* ARREGLO: Quitamos anchos fijos. Usamos w-full y sticky solo en desktop (lg) */}
            <div className="lg:sticky lg:top-6">
                <h3 className="text-sm font-bold text-slate-500 uppercase mb-2">
                    Vista Previa
                </h3>

                <div className="bg-slate-200 p-4 rounded-xl border border-slate-300 shadow-inner flex justify-center">
                    {/* HOJA A4 FLUIDA: w-full pero max-w de A4 */}
                    <div
                        id="invoice-preview"
                        ref={invoiceRef}
                        className="bg-white shadow-xl w-full max-w-[210mm] min-h-[197mm] overflow-x-auto p-8 md:p-12 text-slate-800 flex flex-col justify-between"
                        style={{ fontSize: '14px' }}
                    >
                        {/* ... CONTENIDO DE LA FACTURA (Igual que antes) ... */}
                        <div>
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    {logo ? (
                                        <img
                                            src={logo}
                                            alt="Logo"
                                            className="h-14 object-contain mb-2"
                                        />
                                    ) : (
                                        <h1 className="text-2xl font-bold text-brand-600 uppercase tracking-widest">
                                            Factura
                                        </h1>
                                    )}
                                    <div className="text-xs text-slate-500 mt-2">
                                        <p className="font-bold text-slate-900 text-sm">
                                            {sender.name || 'Tu Nombre'}
                                        </p>
                                        {sender.idDoc && (
                                            <p className="flex items-center gap-1">
                                                {/* <BadgeInfo className="w-3 h-3" />{' '} */}
                                                {sender.idDoc}
                                            </p>
                                        )}
                                        {sender.phone && (
                                            <p className="flex items-center gap-1">
                                                {/* <Smartphone className="w-3 h-3" />{' '} */}
                                                {sender.phone}
                                            </p>
                                        )}
                                        <p className="whitespace-pre-line">
                                            {sender.address || 'Tu Dirección'}
                                        </p>
                                        <p>{sender.email}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <h2 className="text-3xl font-light text-slate-200">
                                        INVOICE
                                    </h2>
                                    <div className="mt-2">
                                        <p className="font-bold text-slate-700 text-sm">
                                            #{invoiceNumber}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {date}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-8 border-b border-slate-100 pb-6">
                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                                    Facturar a:
                                </p>
                                <h3 className="text-lg font-bold text-slate-800">
                                    {client.name || 'Nombre Cliente'}
                                </h3>
                                <div className="text-xs text-slate-600 mt-1 space-y-0.5">
                                    {client.idDoc && <p>{client.idDoc}</p>}
                                    {client.phone && <p>{client.phone}</p>}
                                    <p className="whitespace-pre-line">
                                        {client.address || 'Dirección'}
                                    </p>
                                    <p>{client.email}</p>
                                </div>
                            </div>

                            <table className="w-full mb-8">
                                <thead>
                                    <tr className="border-b-2 border-slate-800">
                                        <th className="text-left py-2 font-bold uppercase text-[10px]">
                                            Descripción
                                        </th>
                                        <th className="text-right py-2 font-bold uppercase text-[10px] w-12">
                                            Cant.
                                        </th>
                                        <th className="text-right py-2 font-bold uppercase text-[10px] w-20">
                                            Precio
                                        </th>
                                        <th className="text-right py-2 font-bold uppercase text-[10px] w-20">
                                            Total
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="border-b border-slate-100"
                                        >
                                            <td className="py-3 text-slate-700 text-xs">
                                                {item.desc || 'Item...'}
                                            </td>
                                            <td className="py-3 text-right text-slate-600 text-xs">
                                                {item.qty}
                                            </td>
                                            <td className="py-3 text-right text-slate-600 text-xs">
                                                {currency}
                                                {item.price.toFixed(2)}
                                            </td>
                                            <td className="py-3 text-right font-bold text-slate-800 text-xs">
                                                {currency}
                                                {(
                                                    item.qty * item.price
                                                ).toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div className="flex justify-end mb-12">
                                <div className="w-56 space-y-2">
                                    <div className="flex justify-between text-slate-600 text-xs">
                                        <span>Subtotal:</span>
                                        <span>
                                            {currency}
                                            {subtotal.toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-slate-600 text-xs">
                                        <span>Impuestos ({taxRate}%):</span>
                                        <span>
                                            {currency}
                                            {taxAmount.toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between font-bold text-lg text-slate-900 border-t-2 border-slate-800 pt-2">
                                        <span>Total:</span>
                                        <span>
                                            {currency}
                                            {total.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-slate-200 pt-6">
                            <p className="font-bold text-xs mb-1">Notas:</p>
                            <p className="text-xs text-slate-500 whitespace-pre-line">
                                {notes}
                            </p>
                            <div className="mt-6 text-center text-[10px] text-slate-300">
                                Generado con ModoFreelanceOS
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
