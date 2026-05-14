import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { IObservationImageApi } from '../interfaces/observations';

interface Props {
  images: IObservationImageApi[] | null;
  alt?: string;
}

export default function ObservationImageCarousel({ images, alt = '' }: Props) {
  const [current, setCurrent] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const items = images ?? [];
  const count = items.length;
  const prev = () => setCurrent((i) => (i - 1 + count) % count);
  const next = () => setCurrent((i) => (i + 1) % count);

  // Thumbnail for the card view, full-res for the lightbox
  const thumbSrc = (i: number) => items[i]?.thumbnail ?? items[i]?.image ?? '';
  const fullSrc = (i: number) => items[i]?.image ?? '';

  useEffect(() => {
    if (!lightbox) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'Escape') setLightbox(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightbox, count]);

  if (count === 0) return null;

  return (
    <>
      <div className='relative w-full h-80 bg-black select-none'>
        <img
          key={current}
          src={thumbSrc(current)}
          alt={alt}
          onClick={() => setLightbox(true)}
          className='w-full h-full object-cover cursor-zoom-in'
        />

        {count > 1 && (
          <>
            <button
              onClick={prev}
              className='absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors'
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={next}
              className='absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors'
            >
              <ChevronRight size={20} />
            </button>

            <div className='absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5'>
              {items.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${i === current ? 'bg-white w-4' : 'bg-white/50'}`}
                />
              ))}
            </div>
          </>
        )}

        {count > 1 && (
          <div className='absolute top-3 right-3 bg-black/50 text-white text-xs font-bold px-2.5 py-1 rounded-full'>
            {current + 1} / {count}
          </div>
        )}
      </div>

      {lightbox && (
        <div
          className='fixed inset-0 z-50 bg-black/95 flex items-center justify-center'
          onClick={() => setLightbox(false)}
        >
          <button
            onClick={() => setLightbox(false)}
            className='absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors'
          >
            <X size={20} />
          </button>

          {count > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                className='absolute left-4 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors'
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                className='absolute right-4 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors'
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}

          <img
            src={fullSrc(current)}
            alt={alt}
            onClick={(e) => e.stopPropagation()}
            className='max-w-full max-h-full object-contain rounded-lg shadow-2xl'
          />

          {count > 1 && (
            <div className='absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2'>
              {items.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrent(i);
                  }}
                  className={`w-2 h-2 rounded-full transition-all ${i === current ? 'bg-white w-5' : 'bg-white/40'}`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
