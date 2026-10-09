import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Sparkles, ArrowRight, ChevronLeft, ChevronRight, Building2 } from 'lucide-react';

export const HeroBanner = ({
  platform = 'RETAIL',
  defaultTitle,
  defaultSubtitle,
  defaultCtaText = 'Shop Collection',
  defaultCtaLink = '/catalog',
}) => {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    fetchBanners();
  }, [platform]);

  const fetchBanners = async () => {
    try {
      const res = await axios.get(`/api/banners?platform=${platform}`);
      if (res.data.success && res.data.banners && res.data.banners.length > 0) {
        setBanners(res.data.banners);
      } else {
        setBanners([]);
      }
    } catch (err) {
      console.error('Error loading banners:', err);
      setBanners([]);
    }
  };

  // Auto-advance slider every 5 seconds unless paused on hover
  useEffect(() => {
    if (banners.length <= 1 || isPaused) return;
    const interval = setInterval(() => {
      goToSlide((currentIndex + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length, currentIndex, isPaused]);

  const goToSlide = (index) => {
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const handlePrev = () => {
    const prev = currentIndex === 0 ? banners.length - 1 : currentIndex - 1;
    goToSlide(prev);
  };

  const handleNext = () => {
    const next = (currentIndex + 1) % banners.length;
    goToSlide(next);
  };

  // If active banners are configured by Admin for this platform
  if (banners.length > 0) {
    const currentBanner = banners[currentIndex];

    return (
      <section
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="relative bg-onyx-950 text-white min-h-[480px] md:min-h-[540px] flex items-center overflow-hidden border-b border-gold-500/30 group"
      >
        {/* Render Background Images with smooth opacity transition */}
        {banners.map((b, idx) => (
          <div
            key={b.id}
            className={`absolute inset-0 z-0 bg-cover bg-center transition-all duration-1000 ease-in-out ${
              idx === currentIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
            }`}
            style={{ backgroundImage: `url('${b.image}')` }}
          />
        ))}

        {/* Dark Overlay Gradient for contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-onyx-950 via-onyx-950/85 to-transparent z-10" />

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
          <div
            className={`max-w-xl space-y-5 transition-all duration-500 transform ${
              isTransitioning ? 'opacity-75 translate-y-1' : 'opacity-100 translate-y-0'
            }`}
          >
            <div className="inline-flex items-center gap-2 bg-gold-500/20 text-gold-400 border border-gold-500/40 px-3.5 py-1 rounded-full text-[11px] font-bold tracking-widest uppercase shadow">
              {platform === 'B2B' ? <Building2 className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>{platform === 'B2B' ? 'B2B Wholesale Promotion' : 'Featured Luxury Collection'}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white leading-tight drop-shadow-md">
              {currentBanner.title}
            </h1>

            {currentBanner.subtitle && (
              <p className="text-sm text-gray-200 leading-relaxed font-light drop-shadow">
                {currentBanner.subtitle}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 pt-2">
              {currentBanner.link ? (
                currentBanner.link.startsWith('http') ? (
                  <a
                    href={currentBanner.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gold-500 text-onyx-950 font-bold px-6 py-3 rounded text-xs uppercase tracking-wider hover:bg-gold-400 transition-all shadow-lg flex items-center gap-2"
                  >
                    <span>Explore Promotion</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                ) : (
                  <Link
                    to={currentBanner.link}
                    className="bg-gold-500 text-onyx-950 font-bold px-6 py-3 rounded text-xs uppercase tracking-wider hover:bg-gold-400 transition-all shadow-lg flex items-center gap-2"
                  >
                    <span>Explore Promotion</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )
              ) : (
                <Link
                  to={platform === 'B2B' ? '/b2b/catalog' : '/catalog'}
                  className="bg-gold-500 text-onyx-950 font-bold px-6 py-3 rounded text-xs uppercase tracking-wider hover:bg-gold-400 transition-all shadow-lg flex items-center gap-2"
                >
                  <span>{defaultCtaText}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Carousel Prev/Next Controls & Slide Progress */}
        {banners.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-onyx-950/80 text-gold-400 hover:bg-gold-500 hover:text-onyx-950 border border-gold-500/40 transition-all shadow-xl backdrop-blur-sm"
              title="Previous Banner"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-onyx-950/80 text-gold-400 hover:bg-gold-500 hover:text-onyx-950 border border-gold-500/40 transition-all shadow-xl backdrop-blur-sm"
              title="Next Banner"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Pagination Controls & Slide Counter */}
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 bg-onyx-950/70 border border-gold-500/30 px-3.5 py-1.5 rounded-full backdrop-blur-sm">
              <span className="text-[10px] font-mono font-bold text-gold-400">
                {currentIndex + 1} / {banners.length}
              </span>

              <div className="flex items-center gap-1.5">
                {banners.map((b, idx) => (
                  <button
                    key={b.id}
                    onClick={() => goToSlide(idx)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      currentIndex === idx ? 'w-6 bg-gold-500 shadow-sm' : 'w-2 bg-white/40 hover:bg-white/80'
                    }`}
                    title={`Slide ${idx + 1}: ${b.title}`}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </section>
    );
  }

  // Fallback default hero header if no active banners
  return (
    <section className="relative bg-onyx-950 text-white min-h-[460px] md:min-h-[500px] flex items-center overflow-hidden border-b border-gold-500/30">
      <div className="absolute inset-0 z-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center" />
      <div className="absolute inset-0 bg-gradient-to-r from-onyx-950 via-onyx-950/80 to-transparent z-10" />

      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div className="max-w-xl space-y-6">
          <div className="inline-flex items-center gap-2 bg-gold-500/10 text-gold-500 border border-gold-500/30 px-3 py-1 rounded-full text-xs tracking-widest uppercase font-semibold">
            {platform === 'B2B' ? <Building2 className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>{platform === 'B2B' ? 'B2B Wholesale Portal' : 'Solid 14K Gold & ASTM F136 Titanium'}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-serif font-bold text-white leading-tight">
            {defaultTitle || (platform === 'B2B' ? 'Wholesale Catalog & Studio Supplies' : 'Elegance In Every Piercing')}
          </h1>

          <p className="text-sm text-gray-300 leading-relaxed font-light">
            {defaultSubtitle ||
              (platform === 'B2B'
                ? 'Exclusive wholesale pricing and studio supplies for verified piercing studios.'
                : 'Discover biocompatible luxury body jewelry crafted for nostrils, septums, helices, and tragus piercings. Designed with precision clasping and sealed sterile packaging.')}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              to={defaultCtaLink}
              className="bg-gold-500 text-onyx-950 font-bold px-6 py-3 rounded text-xs uppercase tracking-wider hover:bg-gold-400 transition-all shadow-lg flex items-center gap-2"
            >
              <span>{defaultCtaText}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
