import React, { useState, useEffect } from 'react';
import * as db from '../db';
import type { PlaylistItem, Information, Banner, Article } from '../types';
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
  const [isFloating, setIsFloating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const videoAnchorRef = React.useRef<HTMLDivElement>(null);

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
        const [playlistData, infoData, bannerData, articleData] = await Promise.all([
          db.fetchPlaylist(),
          db.fetchInformation(),
          db.fetchBanners(),
          db.fetchArticles()
        ]);

        // Filter and sort active playlist items
        const activeItems = (playlistData || []).filter(i => i.isActive).sort((a, b) => a.order - b.order);
        setPlaylist(activeItems);

        if (infoData && infoData.length > 0) {
          setInformation(infoData[infoData.length - 1]);
        }
        setBanners(bannerData ? bannerData.slice(0, 2) : []);
        setArticles(articleData ? articleData.slice(0, 5) : []);
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

  // Initialize prayer times on mount
  useEffect(() => {
    if (prayerTimes.length === 0) {
      const times = [
        { name: 'Subuh', time: '04:30' },
        { name: 'Dzuhur', time: '12:00' },
        { name: 'Ashar', time: '15:30' },
        { name: 'Maghrib', time: '18:00' },
        { name: 'Isya', time: '19:30' }
      ];
      setPrayerTimes(times);
    }
  }, []);

  // Handle Scroll for Floating Video
  useEffect(() => {
    const handleScroll = () => {
      if (videoAnchorRef.current) {
        const rect = videoAnchorRef.current.getBoundingClientRect();
        const shouldFloat = rect.bottom < 120;
        setIsFloating(shouldFloat);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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

    // Add mute=1 for reliable autoplay
    let src = `https://www.youtube.com/embed/${firstId}?autoplay=1&mute=1`;
    if (restIds) {
      src += `&playlist=${restIds}&loop=1`;
    }
    return src;
  };

  const playlistSrc = getPlaylistSrc();
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
            {/* Live Streaming Card with Floating Behavior */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative">
              <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2 uppercase tracking-wide">
                  <span className="relative flex h-2 w-2">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${!isLoading && isLive ? 'bg-red-400' : 'bg-gray-400'}`}></span>
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${!isLoading && isLive ? 'bg-red-500' : 'bg-gray-500'}`}></span>
                  </span>
                  Live Streaming
                </h2>
                {!isLoading && (
                  isLive ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-100 text-red-600">
                      On Air
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-gray-200 text-gray-500">
                      Offline
                    </span>
                  )
                )}
              </div>

              <div className="p-4" ref={videoAnchorRef}>
                {/* Placeholder to prevent layout shift when floating */}
                <div style={{ height: isFloating ? videoAnchorRef.current?.offsetHeight || 'auto' : 0 }} className={isFloating ? "aspect-video" : ""} />

                <div
                  className={`
                    transition-all duration-300 ease-in-out origin-bottom-right
                    ${isFloating
                      ? 'fixed bottom-20 right-4 z-50 w-64 md:w-80 shadow-2xl rounded-xl border-2 border-white ring-1 ring-black/10'
                      : 'relative w-full aspect-video rounded-lg shadow-sm'
                    }
                    bg-black overflow-hidden
                  `}
                >
                  {isFloating && (
                    <button
                      onClick={() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full z-10 transition-colors"
                      title="Kembali ke atas"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      </svg>
                    </button>
                  )}

                  {isLoading ? (
                    <div className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center">
                      <p className="text-gray-400 text-xs font-semibold">Memuat Siaran...</p>
                    </div>
                  ) : (
                    isLive && playlistSrc ? (
                      <iframe
                        src={playlistSrc}
                        className="w-full h-full"
                        loading="eager"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex flex-col items-center justify-center text-gray-400">
                        <div className="p-3 bg-white rounded-full mb-2">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                        </div>
                        <p className="text-xs font-medium">Tidak ada siaran langsung</p>
                      </div>
                    )
                  )}
                </div>

                {!isLoading && isLive && currentTitle && (
                  <div className="mt-3">
                    <div className="text-sm font-semibold text-gray-800">{currentTitle}</div>
                    <p className="text-[10px] text-gray-500 mt-1 flex items-center gap-1 italic">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      (Ketuk video untuk mengaktifkan suara)
                    </p>
                  </div>
                )}
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
                    <div key={article.id} className="p-3 hover:bg-gray-50 transition-colors cursor-pointer group">
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
    </div>
  );
};

export default LandingPage;
