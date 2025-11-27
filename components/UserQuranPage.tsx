import React, { useState, useEffect, useMemo } from 'react';
import type { QuranChapter, QuranSurahDetail, QuranVerse } from '../types';
import { QuranIcon, RadioIcon, HomeIcon, ArrowLeftIcon, LogoutIcon } from './icons/Icons';

interface UserQuranPageProps {
    onBack: () => void;
}

// Menggunakan EQuran.id API v2.0 - Gratis, tidak perlu API key
const API_BASE_URL = 'https://equran.id/api/v2';

// Helper function to convert numbers to Arabic-Indic numerals
const toArabicNumber = (num: number): string => {
    const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return String(num).split('').map(digit => arabicNumbers[parseInt(digit, 10)]).join('');
};

// Font Size Control Icons
const PlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
);

const MinusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
    </svg>
);

const MoonIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
    </svg>
);

const SunIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
    </svg>
);

// Surah Detail Component
const SurahDetailPage: React.FC<{ surah: QuranChapter, onBack: () => void }> = ({ surah, onBack }) => {
    const [surahDetail, setSurahDetail] = useState<QuranSurahDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [arabicFontSize, setArabicFontSize] = useState(32); // Default 32px (text-3xl)
    const [translationFontSize, setTranslationFontSize] = useState(16); // Default 16px (text-base)
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        const fetchSurahDetail = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // EQuran.id API: /surat/{nomor} untuk mendapatkan detail surah dengan ayat-ayatnya
                const response = await fetch(`${API_BASE_URL}/surat/${surah.id}`);

                if (!response.ok) {
                    throw new Error(`Gagal memuat detail surah. Status: ${response.status}`);
                }

                const result = await response.json();

                // EQuran.id API mengembalikan { code: 200, message: "OK", data: {...} }
                const data = result.data || {};
                const versesData = data.ayat || [];

                if (versesData.length === 0) {
                    throw new Error('Tidak ada ayat yang ditemukan untuk surah ini.');
                }

                // Transform data dari EQuran.id API ke format yang diharapkan
                const verses: QuranVerse[] = versesData.map((verse: any) => ({
                    id: verse.nomorAyat || verse.nomor,
                    verse_number: verse.nomorAyat || verse.nomor,
                    text_imlaei: verse.teksArab || verse.ar || verse.text || '',
                    translation: verse.teksIndonesia || verse.idn || verse.translation || 'Terjemahan tidak ditemukan.',
                }));

                const surahNumber = data.nomor || surah.id;
                const surahType = data.tempatTurun === 'Mekah' ? 'meccan' : 'medinan';

                setSurahDetail({
                    id: surahNumber,
                    name_simple: data.namaLatin || surah.name_simple || data.nama || '',
                    name_arabic: data.nama || surah.name_arabic || '',
                    revelation_place: surahType === 'meccan' ? 'makkah' : 'medinan',
                    verses_count: data.jumlahAyat || verses.length,
                    bismillah_pre: surahNumber !== 1 && surahNumber !== 9, // Bismillah ada di semua surah kecuali At-Tawbah
                    verses: verses
                });

            } catch (err) {
                setError(err instanceof Error ? err.message : 'Terjadi kesalahan tidak terduga.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchSurahDetail();
    }, [surah.id]);

    const bgColor = isDarkMode ? 'bg-gray-900' : 'bg-gray-50';
    const cardBg = isDarkMode ? 'bg-gray-800' : 'bg-white';
    const textColor = isDarkMode ? 'text-gray-100' : 'text-gray-800';
    const textSecondary = isDarkMode ? 'text-gray-300' : 'text-gray-600';
    const borderColor = isDarkMode ? 'border-gray-700' : 'border-gray-200';

    return (
        <div className={`${bgColor} min-h-screen font-sans flex flex-col transition-colors duration-300`}>
            <header className="bg-dark-teal text-white p-4 flex justify-between items-center sticky top-0 z-20 shadow-md">
                <div className="flex items-center space-x-2 overflow-hidden">
                    <QuranIcon className="w-7 h-7 flex-shrink-0"/>
                    <h1 className="text-xl font-semibold truncate">
                        {surah.name_simple} ({surah.name_arabic})
                    </h1>
                </div>
                <div className="flex items-center space-x-2">
                    {/* Font Size Controls */}
                    <div className="hidden sm:flex items-center space-x-1 bg-white/10 rounded-lg px-2 py-1">
                        <button 
                            onClick={() => setArabicFontSize(prev => Math.max(20, prev - 4))}
                            className="p-1 hover:bg-white/20 rounded transition-colors"
                            title="Perkecil font Arab"
                        >
                            <MinusIcon className="w-4 h-4" />
                        </button>
                        <span className="text-xs px-2">{arabicFontSize}px</span>
                        <button 
                            onClick={() => setArabicFontSize(prev => Math.min(48, prev + 4))}
                            className="p-1 hover:bg-white/20 rounded transition-colors"
                            title="Perbesar font Arab"
                        >
                            <PlusIcon className="w-4 h-4" />
                        </button>
                    </div>
                    {/* Dark Mode Toggle */}
                    <button 
                        onClick={() => setIsDarkMode(!isDarkMode)}
                        className="p-2 hover:bg-white/10 rounded-md transition-colors"
                        title={isDarkMode ? "Mode Terang" : "Mode Gelap"}
                    >
                        {isDarkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
                    </button>
                    <button onClick={onBack} className="flex items-center space-x-1 hover:bg-white/10 p-2 rounded-md flex-shrink-0">
                        <ArrowLeftIcon className="w-6 h-6"/>
                        <span className="text-sm hidden sm:inline">Kembali</span>
                    </button>
                </div>
            </header>
            
            <main className={`flex-grow p-4 space-y-6 pb-24 ${bgColor} transition-colors duration-300`}>
                {isLoading && <p className={`text-center ${textSecondary} py-8`}>Memuat ayat...</p>}
                {error && <p className="text-center text-red-500 py-8">{error}</p>}
                {surahDetail && (
                    <>
                        <div className={`${cardBg} p-6 rounded-xl shadow-lg text-center border ${borderColor} transition-colors duration-300`}>
                             <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-teal-400' : 'text-dark-teal'}`}>{surahDetail.name_simple}</h2>
                             <p className={`text-2xl mt-2 ${textColor}`} style={{ fontFamily: 'Amiri, Scheherazade New, serif' }}>{surahDetail.name_arabic}</p>
                             <p className={`text-sm ${textSecondary} mt-2 capitalize`}>{surahDetail.revelation_place} • {surahDetail.verses_count} Ayat</p>
                        </div>
                        {surahDetail.bismillah_pre && (
                             <div 
                                className={`text-center my-8 ${textColor}`} 
                                dir="rtl" 
                                style={{ 
                                    fontFamily: 'Amiri, Scheherazade New, serif',
                                    fontSize: `${arabicFontSize + 8}px`,
                                    lineHeight: '2.5',
                                    letterSpacing: '2px'
                                }}
                            >
                                بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ
                             </div>
                        )}
                        <div className="space-y-6">
                            {surahDetail.verses.map((verse) => (
                                <div 
                                    key={verse.id} 
                                    className={`${cardBg} p-6 rounded-xl shadow-md border ${borderColor} transition-all duration-300 hover:shadow-lg`}
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <span className={`font-bold ${isDarkMode ? 'text-teal-400' : 'text-dark-teal'} text-lg`}>
                                            Ayat {verse.verse_number}
                                        </span>
                                        {/* Translation Font Size Control */}
                                        <div className="flex items-center space-x-1 text-xs">
                                            <button 
                                                onClick={() => setTranslationFontSize(prev => Math.max(12, prev - 2))}
                                                className={`p-1 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded transition-colors`}
                                                title="Perkecil font terjemahan"
                                            >
                                                <MinusIcon className="w-3 h-3" />
                                            </button>
                                            <span className={textSecondary}>Terjemahan</span>
                                            <button 
                                                onClick={() => setTranslationFontSize(prev => Math.min(24, prev + 2))}
                                                className={`p-1 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded transition-colors`}
                                                title="Perbesar font terjemahan"
                                            >
                                                <PlusIcon className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="mb-6 pb-6 border-b border-gray-300/30">
                                        <p 
                                            className="text-right leading-relaxed"
                                            dir="rtl"
                                            style={{ 
                                                fontFamily: 'Amiri, Scheherazade New, serif',
                                                fontSize: `${arabicFontSize}px`,
                                                lineHeight: '2.2',
                                                color: isDarkMode ? '#f3f4f6' : '#1f2937',
                                                letterSpacing: '1px'
                                            }}
                                        >
                                            {verse.text_imlaei}
                                            {/* Nomor Ayat di Akhir Teks Arab - Sederhana */}
                                            <span 
                                                style={{ 
                                                    fontSize: `${arabicFontSize * 0.5}px`,
                                                    color: isDarkMode ? '#5eead4' : '#0d9488',
                                                    marginRight: '12px',
                                                    marginLeft: '12px',
                                                    fontWeight: 'bold'
                                                }}
                                                dir="ltr"
                                            >
                                                ({verse.verse_number})
                                            </span>
                                        </p>
                                    </div>
                                    <p 
                                        className={`${textSecondary} text-justify leading-relaxed`}
                                        style={{ 
                                            fontSize: `${translationFontSize}px`,
                                            lineHeight: '1.8',
                                            fontStyle: 'normal'
                                        }}
                                    >
                                        <span className={`font-bold ${isDarkMode ? 'text-teal-400' : 'text-dark-teal'} mr-2`}>
                                            [{verse.verse_number}]
                                        </span>
                                        {verse.translation.replace(/<sup[^>]*>.*?<\/sup>/g, '')}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </main>

            <footer className={`fixed bottom-0 left-0 right-0 ${cardBg} shadow-[0_-2px_10px_rgba(0,0,0,0.1)] rounded-t-2xl border-t ${borderColor} transition-colors duration-300`}>
                 <div className="flex justify-around items-center p-2">
                    <button onClick={onBack} className="flex flex-col items-center text-gray-500 hover:text-dark-teal transition-colors space-y-1">
                        <RadioIcon className="w-7 h-7"/>
                        <span className="text-xs">Live Streaming</span>
                    </button>
                    <button onClick={onBack} className="flex flex-col items-center text-gray-500 hover:text-dark-teal transition-colors space-y-1">
                        <HomeIcon className="w-7 h-7"/>
                        <span className="text-xs">Home</span>
                    </button>
                    <button onClick={onBack} className="flex flex-col items-center text-gray-500 hover:text-dark-teal transition-colors space-y-1">
                        <LogoutIcon className="w-7 h-7" />
                        <span className="text-xs">Keluar</span>
                    </button>
                </div>
            </footer>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Scheherazade+New:wght@400;700&display=swap');
                body {
                    scroll-behavior: smooth;
                }
            `}</style>
        </div>
    );
};


// Main Page Component
const UserQuranPage: React.FC<UserQuranPageProps> = ({ onBack }) => {
    const [surahs, setSurahs] = useState<QuranChapter[]>([]);
    const [selectedSurah, setSelectedSurah] = useState<QuranChapter | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        const fetchSurahs = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // EQuran.id API: /surat untuk mendapatkan daftar semua surah
                const response = await fetch(`${API_BASE_URL}/surat`);
                if (!response.ok) {
                    throw new Error(`Gagal memuat daftar surah. Status: ${response.status}`);
                }
                const result = await response.json();
                
                // EQuran.id API mengembalikan { code: 200, message: "OK", data: [...] }
                const surahsData = result.data || [];
                
                if (surahsData.length === 0) {
                    throw new Error('Tidak ada data surah yang ditemukan.');
                }
                
                // Transform data dari EQuran.id API ke format yang diharapkan
                const transformedSurahs: QuranChapter[] = surahsData.map((surah: any) => ({
                    id: surah.nomor,
                    name_simple: surah.namaLatin || surah.nama,
                    name_arabic: surah.nama,
                    revelation_place: surah.tempatTurun === 'Mekah' ? 'makkah' : 'medinan',
                    verses_count: surah.jumlahAyat,
                    translated_name: {
                        name: surah.arti || surah.namaLatin
                    }
                }));
                
                setSurahs(transformedSurahs);
            } catch (err) {
                if (process.env.NODE_ENV === 'development') {
                    console.error('Error fetching surahs:', err);
                }
                setError(err instanceof Error ? err.message : 'Terjadi kesalahan tidak terduga.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchSurahs();
    }, []);

    const filteredSurahs = useMemo(() => {
        if (!searchQuery) return surahs;
        return surahs.filter(s => {
            const searchLower = searchQuery.toLowerCase();
            return (
                s.name_simple?.toLowerCase().includes(searchLower) ||
                s.translated_name?.name?.toLowerCase().includes(searchLower) ||
                s.name_arabic?.toLowerCase().includes(searchLower) ||
                s.id.toString().includes(searchQuery)
            );
        });
    }, [surahs, searchQuery]);

    if (selectedSurah) {
        return <SurahDetailPage surah={selectedSurah} onBack={() => setSelectedSurah(null)} />;
    }

    const bgColor = isDarkMode ? 'bg-gray-900' : 'bg-gray-100';
    const cardBg = isDarkMode ? 'bg-gray-800' : 'bg-white';
    const textColor = isDarkMode ? 'text-gray-100' : 'text-gray-800';
    const textSecondary = isDarkMode ? 'text-gray-300' : 'text-gray-600';
    const borderColor = isDarkMode ? 'border-gray-700' : 'border-gray-200';

    return (
        <div className={`${bgColor} min-h-screen font-sans flex flex-col transition-colors duration-300`}>
            <header className="bg-dark-teal text-white p-4 flex justify-between items-center sticky top-0 z-20 shadow-md">
                <div className="flex items-center space-x-2">
                    <QuranIcon className="w-7 h-7"/>
                    <h1 className="text-xl font-semibold">Al-Quran</h1>
                </div>
                <button 
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className="p-2 hover:bg-white/10 rounded-md transition-colors"
                    title={isDarkMode ? "Mode Terang" : "Mode Gelap"}
                >
                    {isDarkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
                </button>
            </header>
            
            <div className={`sticky top-[72px] z-10 ${bgColor} px-4 pt-4 pb-2 transition-colors duration-300`}>
                <input
                    type="text"
                    placeholder="Cari surah (nama atau nomor)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full px-4 py-3 ${isDarkMode ? 'bg-gray-800 text-gray-100 border-gray-700 placeholder-gray-400' : 'bg-white text-gray-700 border-gray-300'} border rounded-full focus:outline-none focus:ring-2 focus:ring-dark-teal transition-colors duration-300`}
                    aria-label="Search Surah"
                />
            </div>

            <main className={`flex-grow p-4 pb-24 ${bgColor} transition-colors duration-300`}>
                {isLoading && <p className={`text-center ${textSecondary} py-8`}>Memuat surah...</p>}
                {error && <p className="text-center text-red-500 py-8">{error}</p>}
                {!isLoading && !error && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredSurahs.map(surah => (
                            <button 
                                key={surah.id} 
                                onClick={() => setSelectedSurah(surah)}
                                className={`w-full text-left flex items-center justify-between p-4 ${cardBg} rounded-xl shadow-md ${borderColor} border hover:shadow-lg hover:border-dark-teal/50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dark-teal`}
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="relative flex-shrink-0">
                                        <svg className={`w-12 h-12 ${isDarkMode ? 'text-yellow-400' : 'text-brand-yellow'}`} viewBox="0 0 24 24">
                                            <path d="M12 2 L19.07 4.93 L22 12 L19.07 19.07 L12 22 L4.93 19.07 L2 12 L4.93 4.93 Z" stroke="currentColor" strokeWidth="0.5" fill="currentColor" fillOpacity="0.1"/>
                                        </svg>
                                        <span className={`absolute inset-0 flex items-center justify-center font-bold ${isDarkMode ? 'text-teal-400' : 'text-dark-teal'}`}>{surah.id}</span>
                                    </div>
                                    <div className="flex-grow">
                                        <h3 className={`font-bold ${isDarkMode ? 'text-teal-400' : 'text-dark-teal'}`}>
                                          {surah.name_simple} <span className={`font-normal ${textSecondary} text-sm`}>({surah.translated_name.name})</span>
                                        </h3>
                                        <p className={`text-xs ${textSecondary} uppercase mt-1 capitalize`}>{surah.revelation_place} • {surah.verses_count} AYAT</p>
                                    </div>
                                </div>
                                <p className={`text-2xl text-right ${isDarkMode ? 'text-teal-400' : 'text-dark-teal'} flex-shrink-0 pl-2`} style={{fontFamily: 'Amiri, Scheherazade New, serif'}}>{surah.name_arabic}</p>
                            </button>
                        ))}
                    </div>
                )}
            </main>

            <footer className={`fixed bottom-0 left-0 right-0 ${cardBg} shadow-[0_-2px_10px_rgba(0,0,0,0.1)] rounded-t-2xl border-t ${borderColor} transition-colors duration-300`}>
                <div className="flex justify-around items-center p-2">
                     <button onClick={onBack} className="flex flex-col items-center text-gray-500 hover:text-dark-teal transition-colors space-y-1">
                        <RadioIcon className="w-7 h-7"/>
                        <span className="text-xs">Live Streaming</span>
                    </button>
                    <button onClick={onBack} className="flex flex-col items-center text-dark-teal transition-colors space-y-1">
                        <HomeIcon className="w-7 h-7"/>
                        <span className="text-xs font-bold">Home</span>
                    </button>
                    <button onClick={onBack} className="flex flex-col items-center text-gray-500 hover:text-dark-teal transition-colors space-y-1">
                        <LogoutIcon className="w-7 h-7"/>
                        <span className="text-xs">Keluar</span>
                    </button>
                </div>
            </footer>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Scheherazade+New:wght@400;700&display=swap');
                body {
                    scroll-behavior: smooth;
                }
            `}</style>
        </div>
    );
};

export default UserQuranPage;