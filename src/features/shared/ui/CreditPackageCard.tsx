import React from 'react';
import { Zap } from 'lucide-react';
import { Button } from './index';

export const CREDIT_PACKAGES = [
    { credits: 10, price: '$0.99', oldPrice: '$1.20', buyUrl: 'https://modofreelanceos.gumroad.com/l/10-creditos' },
    { credits: 30, price: '$2.49', oldPrice: '$2.97', buyUrl: 'https://modofreelanceos.gumroad.com/l/30-creditos', highlighted: true },
    { credits: 60, price: '$4.99', oldPrice: '$5.99', buyUrl: 'https://modofreelanceos.gumroad.com/l/60-creditos' },
];

interface CreditPackageCardProps {
    credits: number;
    price: string;
    oldPrice: string;
    buyUrl: string;
    highlighted?: boolean;
}

export const CreditPackageCard: React.FC<CreditPackageCardProps> = ({
    credits,
    price,
    oldPrice,
    buyUrl,
    highlighted = false,
}) => {
    return (
        <div className={`p-4 rounded-xl border transition-all hover:shadow-md flex flex-col items-center text-center ${highlighted
            ? 'bg-brand-50 dark:bg-brand-900/10 border-brand-200 dark:border-brand-800 scale-105 shadow-sm'
            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
            }`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${highlighted ? 'bg-brand-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-brand-600 dark:text-brand-400'
                }`}>
                <Zap className="w-5 h-5 fill-current" />
            </div>

            <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                {credits} <span className="text-sm font-medium opacity-70">Créditos</span>
            </h4>

            <div className="flex items-center gap-2 mb-4">
                <span className="text-lg font-bold text-slate-900 dark:text-white">{price}</span>
                <span className="text-xs text-slate-400 line-through">{oldPrice}</span>
            </div>

            <Button
                variant={highlighted ? 'primary' : 'outline'}
                onClick={() => window.open(buyUrl, '_blank')}
                className="w-full text-xs py-2"
            >
                Comprar
            </Button>
        </div>
    );
};
