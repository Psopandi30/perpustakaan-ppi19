import React, { useState, useEffect, useMemo } from 'react';
import { HadithIcon, RadioIcon, HomeIcon, BookOpenIcon, ArrowLeftIcon, LogoutIcon } from './icons/Icons';

// Types for the Hadith API data
interface ApiHadith {
    hadithnumber: number;
    arabicnumber: number;
    text: string;
    grades: any[];
}

interface CombinedHadith extends ApiHadith {
    arabicText: string;
}

interface ApiCollection {
    collection: {
        name: string;
        language: string;
    }[];
    hadiths: ApiHadith[];
}

interface UserHadithPageProps {
    onBack: () => void;
}

// List of available hadith collections (Indonesian editions)
const COLLECTIONS = [
    { name: 'Sahih Bukhari', slug: 'ind-bukhari' },
    { name: 'Sahih Muslim', slug: 'ind-muslim' },
    { name: 'Sunan Abu Dawud', slug: 'ind-abudawud' },
    { name: 'Jami at-Tirmidhi', slug: 'ind-tirmidhi' },
    { name: 'Sunan an-Nasa\'i', slug: 'ind-nasai' },
    { name: 'Sunan Ibn Majah', slug: 'ind-ibnmajah' },
];

// Explicit mapping from Indonesian slugs to Arabic slugs for reliability
const ARABIC_SLUG_MAP: Record<string, string> = {
    'ind-bukhari': 'ara-bukhari',
    'ind-muslim': 'ara-muslim',
    'ind-abudawud': 'ara-abudawud',
    'ind-tirmidhi': 'ara-tirmidhi',
    'ind-nasai': 'ara-nasai',
    'ind-ibnmajah': 'ara-ibnmajah',
};


const BATCH_SIZE = 30; // Number of hadiths to load at a time

const UserHadithPage: React.FC<UserHadithPageProps> = ({ onBack }) => {
    const [selectedCollection, setSelectedCollection] = useState<{ name: string; slug: string } | null>(null);
    const [hadiths, setHadiths] = useState<CombinedHadith[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [displayCount, setDisplayCount] = useState(BATCH_SIZE);

    // Fetch hadiths when a collection is selected
    useEffect(() => {
        if (!selectedCollection) return;

        const fetchHadiths = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const indSlug = selectedCollection.slug;
                const araSlug = ARABIC_SLUG_MAP[indSlug];

                if (!araSlug) {
                    throw new Error('Koleksi hadis Arab yang sesuai tidak ditemukan.');
                }

                const [indResponse, araResponse] = await Promise.all([
                    fetch(`https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/${indSlug}.json`),
                    fetch(`https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/${araSlug}.json`)
                ]);

                if (!indResponse.ok || !araResponse.ok) {
                    throw new Error('Gagal memuat data hadis. Silakan coba lagi.');
                }

                const indData: ApiCollection = await indResponse.json();
                const araData: ApiCollection = await araResponse.json();

                const arabicMap = new Map(araData.hadiths.map(h => [h.hadithnumber, h.text]));

                const combinedHadiths: CombinedHadith[] = indData.hadiths.map(indHadith => ({
                    ...indHadith,
                    arabicText: arabicMap.get(indHadith.hadithnumber) || 'Teks Arab tidak ditemukan.'
                }));
                
                setHadiths(combinedHadiths);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Terjadi kesalahan tidak terduga.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchHadiths();
    }, [selectedCollection]);
    
    // Filter hadiths based on the search query
    const filteredHadiths = useMemo(() => {
        if (!searchQuery) {
            return hadiths;
        }
        return hadiths.filter(h =>
            h.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
            h.arabicText.toLowerCase().includes(searchQuery.toLowerCase()) ||
            `no. ${h.hadithnumber}`.includes(searchQuery.toLowerCase())
        );
    }, [hadiths, searchQuery]);

    // Reset display count when search query changes
    useEffect(() => {
        setDisplayCount(BATCH_SIZE);
    }, [searchQuery]);

    // Get the currently visible hadiths based on displayCount
    const visibleHadiths = useMemo(() => {
        return filteredHadiths.slice(0, displayCount);
    }, [filteredHadiths, displayCount]);
    
    const handleLoadMore = () => {
        setDisplayCount(prevCount => prevCount + BATCH_SIZE);
    };

    const handleBackToCollections = () => {
        setSelectedCollection(null);
        setHadiths([]);
        setSearchQuery('');
        setError(null);
        setDisplayCount(BATCH_SIZE);
    };

    // View 2: Displaying the list of hadiths from a selected collection
    if (selectedCollection) {
        return (
             <div className="bg-gray-100 min-h-screen font-sans flex flex-col">
                <header className="bg-dark-teal text-white p-4 flex justify-between items-center sticky top-0 z-20">
                    <div className="flex items-center space-x-2">
                        <HadithIcon className="w-7 h-7"/>
                        <h1 className="text-xl font-semibold truncate" title={selectedCollection.name}>{selectedCollection.name}</h1>
                    </div>
                    <button onClick={handleBackToCollections} className="flex items-center space-x-1 hover:bg-white/10 p-2 rounded-md flex-shrink-0">
                        <ArrowLeftIcon className="w-6 h-6"/>
                        <span className="text-sm hidden sm:inline">Kembali</span>
                    </button>
                </header>
                
                <div className="sticky top-[72px] z-10 bg-gray-100 px-4 pt-4 pb-2">
                    <input
                        type="text"
                        placeholder="Cari hadis (nomor, teks, atau arab)..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-dark-teal"
                        aria-label="Search Hadith"
                    />
                </div>
                
                <main className="flex-grow px-4 pb-24">
                    {isLoading && <p className="text-center text-gray-600 py-8">Memuat hadis...</p>}
                    {error && <p className="text-center text-red-500 py-8">{error}</p>}
                    {!isLoading && !error && (
                         <div className="space-y-4">
                            {visibleHadiths.length > 0 ? visibleHadiths.map(h => (
                                <div key={h.hadithnumber} className="bg-white p-4 rounded-lg shadow border border-gray-200">
                                    <p className="font-bold text-dark-teal mb-2">Hadis No. {h.hadithnumber}</p>
                                     <p className="text-right text-2xl leading-loose mb-4" dir="rtl" style={{ fontFamily: 'Amiri, serif' }}>
                                        {h.arabicText}
                                    </p>
                                    <p className="text-gray-700 leading-relaxed text-justify">{h.text}</p>
                                </div>
                            )) : (
                                <p className="text-center text-gray-500 py-8">
                                    {searchQuery ? "Tidak ada hadis yang cocok." : "Tidak ada hadis untuk ditampilkan."}
                                </p>
                            )}
                            {filteredHadiths.length > displayCount && (
                                <div className="text-center mt-6">
                                    <button
                                        onClick={handleLoadMore}
                                        className="bg-dark-teal text-white font-semibold py-2 px-6 rounded-full hover:bg-opacity-90 transition-colors"
                                    >
                                        Muat Lebih Banyak
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </main>
    
                <footer className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-2px_5px_rgba(0,0,0,0.1)] rounded-t-2xl">
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
                    @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap');
                `}</style>
            </div>
        );
    }
    
    // View 1: Displaying the list of hadith collections
    const CollectionCard: React.FC<{ collection: { name: string; slug: string; } }> = ({ collection }) => (
        <div className="flex flex-col items-center space-y-2">
            <button 
                onClick={() => setSelectedCollection(collection)} 
                className="w-full h-32 bg-white rounded-md flex-shrink-0 flex flex-col items-center justify-center text-center text-xs text-gray-600 p-1 border-2 border-black hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-dark-teal"
                aria-label={`Pilih ${collection.name}`}
            >
                <BookOpenIcon className="w-12 h-12 text-dark-teal"/>
            </button>
            <h3 className="text-sm font-semibold text-dark-teal text-center w-full">{collection.name}</h3>
        </div>
    );

    return (
        <div className="bg-dark-teal min-h-screen font-sans flex flex-col">
            <header className="bg-dark-teal text-white p-4 flex items-center sticky top-0 z-10">
                 <div className="w-10 h-10 bg-white rounded-md flex items-center justify-center">
                    <HadithIcon className="w-8 h-8 text-dark-teal" />
                 </div>
            </header>
            <div className="flex-grow bg-white rounded-t-3xl pt-6">
                <main className="px-4 space-y-4 pb-24">
                    <h2 className="text-lg font-bold text-dark-teal">KUMPULAN HADIST</h2>
                    <p className="text-sm text-gray-600">Pilih kitab hadis untuk dibaca dan dicari.</p>
                    <div className="grid grid-cols-3 gap-x-4 gap-y-6 pt-4">
                        {COLLECTIONS.map(collection => (
                            <CollectionCard key={collection.slug} collection={collection} />
                        ))}
                    </div>
                </main>
            </div>

            <footer className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-2px_5px_rgba(0,0,0,0.1)] rounded-t-2xl">
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
        </div>
    );
};

export default UserHadithPage;