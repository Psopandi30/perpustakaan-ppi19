import React, { useState, useEffect } from 'react';
import * as db from '../db';
import type { PlaylistItem, Information, Banner, Article, GeneralBook } from '../types';
import { resolveImageUrl, getYoutubeEmbedUrl } from '../utils/media';
import { UserIcon } from './icons/Icons';

interface LandingPageProps {
  onLoginClick: () => void;
  settings: {
    libraryName: string;
    loginLogo: string;
  };
}

const LandingPage: React.FC<LandingPageProps> = ({ onLoginClick, settings }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [hijriDate, setHijriDate] = useState('');
  const [prayerTimes, setPrayerTimes] = useState<{ name: string; time: string }[]>([]);
  const [playlist, setPlaylist] = useState<PlaylistItem[]>([]);
  const [information, setInformation] = useState<Information | null>(null);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [featuredBooks, setFeaturedBooks] = useState<GeneralBook[]>([]);
  const [selectedBook, setSelectedBook] = useState<GeneralBook | null>(null);
  const [isRadioPlaying, setIsRadioPlaying] = useState(true); // Default auto-play attempt
  const [isLoading, setIsLoading] = useState(true);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Calculate Hijri date (simplified)
  useEffect(() => {
    const calculateHijriDate = () => {
      const now = new Date();
      const hijriYear = Math.floor((now.getFullYear() - 622) * 0.97) + 1;
      const hijriMonth = ['Muharram', 'Safar', 'Rabi\'ul Awal', 'Rabi\'ul Akhir', 'Jumadil Awal', 'Jumadil Akhir', 'Rajab', 'Sya\'ban', 'Ramadhan', 'Syawal', 'Dzulqa\'dah', 'Dzulhijjah'];
      const monthIndex = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / (1000 * 60 * 60 * 24 * 29.5)) % 12;
      const day = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / (1000 * 60 * 60 * 24)) % 30 + 1;
      setHijriDate(`${day} ${hijriMonth[monthIndex]} ${hijriYear} H`);
    };
    calculateHijriDate();
  }, [currentTime]);

  // Calculate prayer times (simplified for Garut, Indonesia)
  useEffect(() => {
    const calculatePrayerTimes = () => {
      const times = [
        { name: 'Subuh', time: '04:30' },
        { name: 'Dzuhur', time: '12:00' },
        { name: 'Ashar', time: '15:30' },
        { name: 'Maghrib', time: '18:00' },
        { name: 'Isya', time: '19:30' }
      ];
      setPrayerTimes(times);
    };
    calculatePrayerTimes();
  }, []);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch all data in parallel
        const [playlistData, infoData, bannerData, articleData, booksData, writtenData, bulletinData, asatidzData, materiData, khutbahData] = await Promise.all([
          db.fetchPlaylist(),
          db.fetchInformation(),
          db.fetchBanners(),
          db.fetchArticles(),
          db.fetchGeneralBooks(),
          db.fetchWrittenWorks(),
          db.fetchBulletins(),
          db.fetchKaryaAsatidz(),
          db.fetchMateriDakwah(),
          db.fetchKhutbahJumat()
        ]);

        // Filter and sort active playlist items
        const activeItems = (playlistData || []).filter(i => i.isActive).sort((a, b) => a.order - b.order);
        setPlaylist(activeItems);

        if (infoData && infoData.length > 0) {
          setInformation(infoData[infoData.length - 1]);
        }
        setBanners(bannerData ? bannerData.slice(0, 2) : []);
        setArticles(articleData ? articleData.slice(0, 5) : []);

        // Aggregate featured items from all categories
        let allFeatured: any[] = [
          ...(booksData || []).filter(b => b.isFeatured).map(b => ({ ...b, itemType: 'general' })),
          ...(writtenData || []).filter(b => b.isFeatured).map(b => ({ ...b, itemType: 'written' })),
          ...(bulletinData || []).filter(b => b.isFeatured).map(b => ({ ...b, itemType: 'bulletin' })),
          ...(asatidzData || []).filter(b => b.isFeatured).map(b => ({ ...b, itemType: 'asatidz' })),
          ...(materiData || []).filter(b => b.isFeatured).map(b => ({ ...b, itemType: 'materi' })),
          ...(khutbahData || []).filter(b => b.isFeatured).map(b => ({ ...b, itemType: 'khutbah' })),
        ];

        // Fallback: If no items are featured manually, show the latest items from each category
        if (allFeatured.length === 0) {
          const latestLimit = 2; // Take top 2 from each
          allFeatured = [
            ...(booksData || []).slice(0, latestLimit).map(b => ({ ...b, itemType: 'general' })),
            ...(writtenData || []).slice(0, latestLimit).map(b => ({ ...b, itemType: 'written' })),
            ...(bulletinData || []).slice(0, latestLimit).map(b => ({ ...b, itemType: 'bulletin' })),
            ...(asatidzData || []).slice(0, latestLimit).map(b => ({ ...b, itemType: 'asatidz' })),
            ...(materiData || []).slice(0, latestLimit).map(b => ({ ...b, itemType: 'materi' })),
            ...(khutbahData || []).slice(0, latestLimit).map(b => ({ ...b, itemType: 'khutbah' })),
          ];
          // Sort nicely (randomized or by ID) to mix them
          allFeatured.sort(() => 0.5 - Math.random());
        }

        setFeaturedBooks(allFeatured);
      } catch (error) {
        console.error('Error loading landing page data:', error);
        setPlaylist([]);
        setInformation(null);
        setBanners([]);
        setArticles([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Initialize hijri date on mount
  useEffect(() => {
    if (!hijriDate) {
      const now = new Date();
      const hijriYear = Math.floor((now.getFullYear() - 622) * 0.97) + 1;
      const hijriMonth = ['Muharram', 'Safar', 'Rabi\'ul Awal', 'Rabi\'ul Akhir', 'Jumadil Awal', 'Jumadil Akhir', 'Rajab', 'Sya\'ban', 'Ramadhan', 'Syawal', 'Dzulqa\'dah', 'Dzulhijjah'];
      const monthIndex = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / (1000 * 60 * 60 * 24 * 29.5)) % 12;
      const day = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / (1000 * 60 * 60 * 24)) % 30 + 1;
      setHijriDate(`${day} ${hijriMonth[monthIndex]} ${hijriYear} H`);
    }
  }, []);

  // Calculate prayer times (simplified for Garut, Indonesia)
  useEffect(() => {
    const calculatePrayerTimes = () => {
      const times = [
        { name: 'Subuh', time: '04:30' },
        { name: 'Dzuhur', time: '12:00' },
        { name: 'Ashar', time: '15:30' },
        { name: 'Maghrib', time: '18:00' },
        { name: 'Isya', time: '19:30' }
      ];
      setPrayerTimes(times);
    };
    calculatePrayerTimes();
  }, []);

  // Initialize hijri date on mount
  useEffect(() => {
    if (!hijriDate) {
      const now = new Date();
      const hijriYear = Math.floor((now.getFullYear() - 622) * 0.97) + 1;
      const hijriMonth = ['Muharram', 'Safar', 'Rabi\'ul Awal', 'Rabi\'ul Akhir', 'Jumadil Awal', 'Jumadil Akhir', 'Rajab', 'Sya\'ban', 'Ramadhan', 'Syawal', 'Dzulqa\'dah', 'Dzulhijjah'];
      const monthIndex = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / (1000 * 60 * 60 * 24 * 29.5)) % 12;
      const day = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / (1000 * 60 * 60 * 24)) % 30 + 1;
      setHijriDate(`${day} ${hijriMonth[monthIndex]} ${hijriYear} H`);
    }
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Helper to extract Video ID for Playlist Construction
  const getYoutubeVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const getPlaylistSrc = () => {
    if (playlist.length === 0) return null;
    const videoIds = playlist.map(item => getYoutubeVideoId(item.youtubeLink)).filter(id => id !== null);
    if (videoIds.length === 0) return null;

    const firstId = videoIds[0];
    const restIds = videoIds.slice(1).join(',');

    // Add autoplay. For audio mode (hidden player), we want sound, so we don't mute by default.
    // However, browsers might block unmuted autoplay.
    return (isAudioMode: boolean = false) => {
      let src = `https://www.youtube.com/embed/${firstId}?autoplay=1`;

      // If it's NOT audio mode (visual player), we might mute to ensure it plays (standard behavior)
      // But for this specific "Radio" feature, we want sound.
      // Let's rely on standard autoplay=1.

      if (restIds) {
        src += `&playlist=${restIds}&loop=1`;
      }
      return src;
    };
  };

  const getSrc = getPlaylistSrc();
  const playlistSrc = getSrc ? getSrc(false) : null; // Default src (legacy)
  const audioSrc = getSrc ? getSrc(true) : null; // Audio src (unmuted)
  const isLive = playlist.length > 0;
  const currentTitle = isLive ? playlist[0].title : '';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header - Clean Minimal Design */}
      <header className="bg-slate-800 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center gap-4">
            {/* Logo + Title - Left Side */}
            <div className="flex items-center gap-2 md:gap-3 flex-1">
              {settings.loginLogo ? (
                <img
                  src={settings.loginLogo}
                  alt="Logo"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none'; // Hide if broken
                  }}
                  className="w-8 h-8 md:w-10 md:h-10 rounded-lg object-cover shadow-sm border border-white/20 flex-shrink-0 bg-white"
                />
              ) : null}
              <span className="text-[10px] mobile-s:text-xs sm:text-sm md:text-sm leading-tight text-white uppercase tracking-wide">
                {settings.libraryName}
              </span>
            </div>

            {/* Login Button - Right Side */}
            <button
              onClick={onLoginClick}
              className="bg-white/10 text-white p-2 md:p-2.5 rounded-lg hover:bg-white/20 transition-colors flex-shrink-0"
              title="Login"
            >
              <UserIcon className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section: Compact DateTime & Prayer Times */}
      <div className="bg-dark-teal text-white shadow-lg overflow-hidden relative">
        <div className="absolute top-0 right-0 p-12 bg-white opacity-5 rounded-full transform translate-x-1/3 -translate-y-1/3 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 p-8 bg-brand-yellow opacity-5 rounded-full transform -translate-x-1/3 translate-y-1/3 blur-2xl"></div>

        <div className="container mx-auto px-4 py-2 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-8">
            {/* Date & Time - Left Side */}
            <div className="flex items-center gap-4 md:gap-6">
              <div className="text-3xl md:text-4xl font-bold tracking-tight font-mono text-brand-yellow">
                {formatTime(currentTime)}
              </div>
              <div className="border-l border-white/20 pl-4">
                <div className="text-sm md:text-base font-medium opacity-90">
                  {formatDate(currentTime)}
                </div>
                <div className="text-xs md:text-sm opacity-75 mt-0.5">
                  {hijriDate || '...'}
                </div>
              </div>
            </div>

            {/* Prayer Times - Right Side (Compact Row) */}
            <div className="w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              <div className="flex gap-2 min-w-max">
                {prayerTimes.map((prayer, idx) => (
                  <div key={idx} className="bg-white/10 rounded-lg px-2 py-1.5 flex flex-col items-center min-w-[60px] border border-white/5">
                    <span className="text-[9px] text-brand-yellow font-medium uppercase tracking-wider">{prayer.name}</span>
                    <span className="text-xs font-bold mt-0.5">{prayer.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Main Column (Left) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Bookshelf & Audio Player Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative">
              <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2 uppercase tracking-wide">
                  <span className="relative flex h-2 w-2">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${!isLoading && isLive ? 'bg-red-400' : 'bg-gray-400'}`}></span>
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${!isLoading && isLive ? 'bg-red-500' : 'bg-gray-500'}`}></span>
                  </span>
                  Rak Buku Pilihan
                </h2>

                <div className="flex items-center gap-3">
                  {/* Radio Player Widget */}
                  {!isLoading && isLive && (
                    <div className={`flex items-center gap-3 px-3 py-1.5 rounded-full border transition-all duration-500 ${isRadioPlaying ? 'bg-gradient-to-r from-gray-900 to-gray-800 border-gray-700 shadow-md' : 'bg-gray-50 border-gray-200'}`}>

                      {/* Status Indicator & Text */}
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isRadioPlaying ? 'bg-green-400' : 'bg-gray-400'}`}></span>
                          <span className={`relative inline-flex rounded-full h-2 w-2 ${isRadioPlaying ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                        </span>
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${isRadioPlaying ? 'text-green-400' : 'text-gray-400'}`}>
                          {isRadioPlaying ? 'Live Radio' : 'Radio Off'}
                        </span>
                      </div>

                      {/* Animated Visualizer (Only visible when playing) */}
                      {isRadioPlaying && (
                        <div className="flex items-end gap-0.5 h-3 mx-1">
                          <div className="w-0.5 bg-green-500 animate-[pulse_0.6s_ease-in-out_infinite] h-full"></div>
                          <div className="w-0.5 bg-green-500 animate-[pulse_1.1s_ease-in-out_infinite] h-[60%]"></div>
                          <div className="w-0.5 bg-green-500 animate-[pulse_0.8s_ease-in-out_infinite] h-[90%]"></div>
                          <div className="w-0.5 bg-green-500 animate-[pulse_1.3s_ease-in-out_infinite] h-[50%]"></div>
                        </div>
                      )}

                      {/* Control Button */}
                      <button
                        onClick={() => setIsRadioPlaying(!isRadioPlaying)}
                        className={`w-6 h-6 flex items-center justify-center rounded-full transition-all duration-200 transform hover:scale-110 ${isRadioPlaying ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-dark-teal text-white hover:bg-teal-700'}`}
                        title={isRadioPlaying ? 'Matikan Suara' : 'Dengarkan Radio'}
                      >
                        {isRadioPlaying ? (
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                        ) : (
                          <svg className="w-3 h-3 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Hidden Audio Player (YouTube Iframe) */}
              {isLive && audioSrc && isRadioPlaying && (
                <div className="absolute top-0 left-0 w-[1px] h-[1px] overflow-hidden opacity-0 pointer-events-none">
                  <iframe
                    src={audioSrc}
                    width="1"
                    height="1"
                    allow="autoplay; encrypted-media"
                    title="Radio Stream"
                  />
                </div>
              )}

              <div className="p-8 bg-gradient-to-br from-slate-800 to-gray-900 relative overflow-hidden">
                {/* Ambient Light Effects */}
                <div className="absolute top-0 left-1/4 w-1/2 h-64 bg-yellow-500/10 blur-[100px] rounded-full pointer-events-none"></div>

                {/* Bookshelf Interface */}
                <div className="min-h-[340px] relative perspective-1000">
                  {/* Background Shelves */}
                  <div className="absolute inset-0 flex flex-col justify-around pointer-events-none select-none py-8">
                    {[1, 2].map(i => (
                      <div key={i} className="relative group">
                        {/* Shelf Top Surface */}
                        <div className="w-full h-4 bg-[#5c4033] shadow-inner relative z-10"></div>
                        {/* Shelf Edge (Front) */}
                        <div className="w-full h-3 bg-[#3e2b22] shadow-lg relative z-20 rounded-b-sm transform translate-y-[-2px]"></div>
                        {/* Shadow under shelf */}
                        <div className="w-full h-12 bg-black/40 blur-xl absolute top-4 z-0"></div>
                      </div>
                    ))}
                  </div>

                  {/* Books Container */}
                  {isLoading ? (
                    <div className="flex flex-col justify-center items-center h-full pt-16 relative z-30">
                      <div className="w-12 h-12 border-4 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin mb-4"></div>
                      <p className="text-gray-400 font-light tracking-wider text-sm">Memuat koleksi...</p>
                    </div>
                  ) : featuredBooks.length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-6 sm:gap-8 relative z-30 px-6 sm:px-12 py-8">
                      {featuredBooks.map((book: any) => (
                        <div
                          key={`${book.itemType || 'book'}-${book.id}`}
                          className="relative group cursor-pointer transition-all duration-500 ease-out transform hover:-translate-y-4 hover:scale-105 hover:z-50"
                          onClick={() => setSelectedBook(book)}
                        >
                          {/* Single Book */}
                          <div className="relative aspect-[2/3] rounded-r-md shadow-2xl transition-all duration-300 transform perspective-origin-left preserve-3d group-hover:rotate-y-[-15deg]">
                            {/* Book Spine Effect (Left Side) */}
                            <div className="absolute left-0 top-0 bottom-0 w-3 bg-gray-800 transform -translate-x-full skew-y-[20deg] origin-right opacity-80 group-hover:opacity-100 transition-opacity"></div>

                            {/* Book Cover */}
                            <div className="w-full h-full bg-white rounded-r-sm overflow-hidden border-l border-white/10 relative">
                              {/* Glossy Overlay */}
                              <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-white/10 pointer-events-none z-10"></div>

                              {book.coverLink ? (
                                <img src={resolveImageUrl(book.coverLink)} alt={book.judul} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center bg-teal-900 p-2 text-center">
                                  <div className="w-full h-full border border-yellow-500/30 flex items-center justify-center p-1">
                                    <span className="text-yellow-500/80 font-serif text-[10px] leading-tight line-clamp-3 uppercase tracking-widest">
                                      {book.judul}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Reflection/Shadow below book */}
                          <div className="absolute -bottom-4 left-2 right-2 h-4 bg-black/60 blur-md rounded-[100%] transform scale-x-90 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2"></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col justify-center items-center h-full pt-20 text-gray-400/50 relative z-30">
                      <svg className="w-16 h-16 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                      <p className="font-light tracking-widest text-sm uppercase">Koleksi Segera Hadir</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Information Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2 bg-gray-50">
                <svg className="w-4 h-4 text-brand-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Informasi Layanan</h2>
              </div>
              <div className="p-4">
                {information ? (
                  <div className="bg-blue-50/30 p-4 rounded-xl border border-blue-50 hover:border-blue-100 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-800 text-base">{information.judul}</h3>
                      <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 whitespace-nowrap">
                        {new Date(information.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-gray-600 text-xs md:text-sm leading-relaxed">{information.isi}</p>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400 text-xs italic">
                    Belum ada informasi layanan terbaru
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Column (Right) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Banner Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                <h2 className="text-sm font-bold text-gray-800 border-l-2 border-brand-yellow pl-2 uppercase tracking-wide">Highlights</h2>
              </div>
              <div className="p-4 space-y-3">
                {banners.length > 0 ? (
                  banners.map((banner) => (
                    <div key={banner.id} className="group relative overflow-hidden rounded-lg shadow-sm hover:shadow transition-all">
                      {banner.linkUrl ? (
                        <a href={banner.linkUrl} target="_blank" rel="noopener noreferrer" className="block">
                          <img
                            src={resolveImageUrl(banner.imageUrl)}
                            alt={banner.judul}
                            className="w-full h-24 object-cover transform group-hover:scale-105 transition-transform duration-500"
                          />
                        </a>
                      ) : (
                        <img
                          src={resolveImageUrl(banner.imageUrl)}
                          alt={banner.judul}
                          className="w-full h-24 object-cover transform group-hover:scale-105 transition-transform duration-500"
                        />
                      )}
                    </div>
                  ))
                ) : (
                  <div className="h-24 bg-gray-50 rounded-lg border border-dashed border-gray-200 flex items-center justify-center text-gray-400 text-xs">
                    Slot Banner
                  </div>
                )}
              </div>
            </div>

            {/* Articles Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                <h2 className="text-sm font-bold text-gray-800 border-l-2 border-dark-teal pl-2 uppercase tracking-wide">Artikel Terbaru</h2>
              </div>
              <div className="divide-y divide-gray-50">
                {articles.length > 0 ? (
                  articles.map((article) => (
                    <div
                      key={article.id}
                      onClick={() => setSelectedArticle(article)}
                      className="p-3 hover:bg-gray-50 transition-colors cursor-pointer group"
                    >
                      <h3 className="font-medium text-gray-800 text-sm line-clamp-2 group-hover:text-dark-teal mb-1">{article.judul}</h3>
                      <div className="flex items-center text-[10px] text-gray-400 gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        {new Date(article.tanggalTerbit).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-400 text-xs py-4">
                    Belum ada artikel
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer - Minimalist */}
      <footer className="bg-dark-teal text-white py-4 mt-auto border-t-4 border-brand-yellow">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs text-brand-yellow/90 mb-1">© {new Date().getFullYear()} Sistem Informasi Literasi Membaca</p>
          <p className="text-[10px] text-gray-400">Development by Pendi Sopandi, S. Kom, ITS</p>
        </div>
      </footer>

      {/* Book Detail Modal */}
      {selectedBook && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl overflow-hidden flex flex-col animate-slide-up">
            <div className="relative">
              {selectedBook.coverLink ? (
                <img src={resolveImageUrl(selectedBook.coverLink)} alt={selectedBook.judul} className="w-full h-64 object-cover" />
              ) : (
                <div className="w-full h-64 bg-dark-teal flex items-center justify-center text-white p-4 text-center">
                  {selectedBook.judul}
                </div>
              )}
              <button
                onClick={() => setSelectedBook(null)}
                className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <div className="p-5">
              <h2 className="text-xl font-bold text-gray-800 mb-2 leading-tight">{selectedBook.judul}</h2>
              <div className="space-y-2 mb-6">
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 mr-2 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                  {selectedBook.namaPenulis}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 mr-2 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  {new Date(selectedBook.tanggalTerbit).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              </div>

              {selectedBook.drafLink && (
                <a
                  href={selectedBook.drafLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full py-2.5 bg-dark-teal text-white text-center rounded-lg font-medium hover:bg-teal-800 transition-colors shadow-sm"
                >
                  Buka Buku
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Article Reader Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-slide-up">

            {/* Modal Header */}
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <h2 className="font-bold text-gray-800 text-lg line-clamp-1">Baca Artikel</h2>
              <button
                onClick={() => setSelectedArticle(null)}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="overflow-y-auto p-6">
              <h1 className="text-2xl font-bold text-dark-teal mb-2">{selectedArticle.judul}</h1>
              <div className="flex items-center text-sm text-gray-500 mb-6 gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                {new Date(selectedArticle.tanggalTerbit).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </div>

              {selectedArticle.imageUrl && (
                <img
                  src={resolveImageUrl(selectedArticle.imageUrl)}
                  alt={selectedArticle.judul}
                  className="w-full md:w-3/4 mx-auto max-h-64 object-cover rounded-xl mb-6 shadow-sm"
                />
              )}

              <div
                className="prose prose-sm md:prose-base max-w-none text-gray-700 leading-relaxed text-justify hyphens-auto"
                dangerouslySetInnerHTML={{ __html: selectedArticle.konten || '<p>Tidak ada konten.</p>' }}
              />
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t bg-gray-50 flex justify-end">
              <button
                onClick={() => setSelectedArticle(null)}
                className="px-6 py-2 bg-dark-teal text-white rounded-lg hover:bg-teal-800 transition-colors font-medium text-sm"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
