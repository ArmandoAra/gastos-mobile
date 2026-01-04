

export enum LanguageCode {
    EN = 'en',
    ES = 'es',
    PT = 'pt',
}

export interface Language {
    code: LanguageCode;
    name: string;
    native: string;
    flag: string;
}


export const languages: Language[] = [
    { code: LanguageCode.EN, name: 'English', native: 'English', flag: '🇬🇧' },
    { code: LanguageCode.ES, name: 'Spanish', native: 'Español', flag: '🇪🇸' },
    { code: LanguageCode.PT, name: 'Portuguese', native: 'Português', flag: '🇧🇷' },
] as const;
