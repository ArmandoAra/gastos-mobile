import { format, parseISO } from 'date-fns';
import { es, enUS, ptBR } from 'date-fns/locale';

const locales = { es, en: enUS, pt: ptBR };

export function formatDate(
    dateString: string,
    formatStr: string = 'PP',
    locale: string = 'es'
): string {
    const date = parseISO(dateString);
    return format(date, formatStr, { locale: locales[locale as keyof typeof locales] });
}

export function formatRelativeDate(dateString: string, locale: string = 'es'): string {
    const date = parseISO(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;

    return formatDate(dateString, 'PP', locale);
}

// obtiene la fecha y retorna un string con el formato "dd MMM" (ej. "05 Sep") y en el idioma correcto
export function formatCycleDate(dateString: string, locale: string = 'es'): string {
    return formatDate(dateString, 'dd MMM', locale);
}

// export function 