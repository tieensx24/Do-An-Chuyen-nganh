import { useState, useEffect } from 'react';

const slides = [
  {
    image: '/home/image/home.jpg',
    tag: 'Chất lượng hàng đầu',
    title: 'Xây Dựng\nVững Chắc',
    sub: 'Vật liệu chính hãng, kiểm định nghiêm ngặt — đặt nền móng cho mọi công trình lớn nhỏ.',
  },
  {
    image: '/home/image/home2.jpg',
    tag: 'Giá cạnh tranh',
    title: 'Tiết Kiệm\nTối Đa',
    sub: 'Nguồn cung trực tiếp từ nhà máy, không qua trung gian — giá tốt nhất thị trường.',
  },
  {
    image: '/home/image/home3.jpg',
    tag: 'Giao hàng tận nơi',
    title: 'Đúng Hẹn\nTận Công Trình',
    sub: 'Hệ thống vận chuyển rộng khắp, đảm bảo tiến độ thi công của bạn không bị gián đoạn.',
  },
];

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startX, setStartX] = useState(0);
  const [animating, setAnimating] = useState(false);

  const goTo = (index) => {
    if (animating) return;
    setAnimating(true);
    setCurrentIndex(index);
    setTimeout(() => setAnimating(false), 600);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      goTo((currentIndex + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [currentIndex]);

  const handleDragStart = (e) => {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    setStartX(clientX);
  };

  const handleDragEnd = (e) => {
    if (!startX) return;
    const clientX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
    const diff = startX - clientX;
    if (diff > 50) goTo((currentIndex + 1) % slides.length);
    else if (diff < -50) goTo((currentIndex - 1 + slides.length) % slides.length);
    setStartX(0);
  };

  const slide = slides[currentIndex];

  return (
    <div
      onMouseDown={handleDragStart}
      onMouseUp={handleDragEnd}
      onTouchStart={handleDragStart}
      onTouchEnd={handleDragEnd}
      style={{
        position: 'relative',
        width: '100vw',
        minHeight: '100vh',
        marginLeft: 'calc(-50vw + 50%)',
        overflow: 'hidden',
        cursor: 'grab',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Be Vietnam Pro', 'Segoe UI', sans-serif",
      }}
    >
      {/* Background image layer */}
      <div
        key={currentIndex}
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url('${slide.image}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          animation: 'zoomIn 6s ease forwards',
        }}
      />

      {/* Gradient overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(135deg, rgba(10,22,15,0.82) 0%, rgba(10,22,15,0.55) 60%, rgba(10,22,15,0.3) 100%)',
      }} />

      {/* Decorative vertical line */}
      <div style={{
        position: 'absolute',
        left: '10%',
        top: '20%',
        bottom: '20%',
        width: '2px',
        background: 'linear-gradient(to bottom, transparent, rgba(168,213,181,0.6), transparent)',
      }} />

      {/* Content */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        maxWidth: '860px',
        padding: '40px 32px',
        textAlign: 'left',
        pointerEvents: 'none',
      }}>
        {/* Tag */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(168,213,181,0.15)',
          border: '1px solid rgba(168,213,181,0.35)',
          color: '#a8d5b5',
          fontSize: '0.75rem',
          fontWeight: '700',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          padding: '6px 16px',
          borderRadius: '999px',
          marginBottom: '28px',
          animation: 'fadeUp 0.6s ease both',
        }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#a8d5b5', display: 'inline-block' }} />
          {slide.tag}
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: 'clamp(2.8rem, 6vw, 5rem)',
          fontWeight: '900',
          color: '#ffffff',
          margin: '0 0 24px 0',
          lineHeight: '1.1',
          letterSpacing: '-0.03em',
          whiteSpace: 'pre-line',
          textShadow: '0 4px 24px rgba(0,0,0,0.3)',
          animation: 'fadeUp 0.6s 0.1s ease both',
        }}>
          {slide.title}
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: '1.05rem',
          color: 'rgba(255,255,255,0.75)',
          maxWidth: '520px',
          lineHeight: '1.75',
          margin: '0 0 40px 0',
          animation: 'fadeUp 0.6s 0.2s ease both',
        }}>
          {slide.sub}
        </p>

        {/* Buttons */}
        <div style={{
          display: 'flex',
          gap: '14px',
          flexWrap: 'wrap',
          animation: 'fadeUp 0.6s 0.3s ease both',
          pointerEvents: 'all',
        }}>
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onMouseOver={(e) => { e.currentTarget.style.background = '#c94a1a'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = '#d85a30'; e.currentTarget.style.transform = 'translateY(0)'; }}
            style={{
              padding: '14px 32px',
              fontSize: '0.95rem',
              fontWeight: '700',
              background: '#d85a30',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              letterSpacing: '0.01em',
            }}
          >
            Xem khuyến mãi
          </button>

          <button
            onMouseDown={(e) => e.stopPropagation()}
            onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'translateY(0)'; }}
            style={{
              padding: '14px 32px',
              fontSize: '0.95rem',
              fontWeight: '700',
              background: 'transparent',
              color: 'white',
              border: '1.5px solid rgba(255,255,255,0.45)',
              borderRadius: '10px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Danh mục sản phẩm
          </button>
        </div>
      </div>

      {/* Slide indicators */}
      <div style={{
        position: 'absolute',
        bottom: '40px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '10px',
        zIndex: 20,
      }}>
        {slides.map((_, i) => (
          <button
            key={i}
            onMouseDown={(e) => { e.stopPropagation(); goTo(i); }}
            style={{
              width: i === currentIndex ? '32px' : '8px',
              height: '8px',
              borderRadius: '999px',
              background: i === currentIndex ? '#a8d5b5' : 'rgba(255,255,255,0.35)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              padding: 0,
            }}
          />
        ))}
      </div>

      {/* Slide counter */}
      <div style={{
        position: 'absolute',
        bottom: '40px',
        right: '48px',
        color: 'rgba(255,255,255,0.5)',
        fontSize: '0.8rem',
        fontWeight: '600',
        letterSpacing: '0.08em',
        zIndex: 20,
        fontVariantNumeric: 'tabular-nums',
      }}>
        {String(currentIndex + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
      </div>

      {/* Arrow nav */}
      {[
        { dir: 'left', label: '‹', action: () => goTo((currentIndex - 1 + slides.length) % slides.length), pos: { left: '24px' } },
        { dir: 'right', label: '›', action: () => goTo((currentIndex + 1) % slides.length), pos: { right: '24px' } },
      ].map(({ dir, label, action, pos }) => (
        <button
          key={dir}
          onMouseDown={(e) => { e.stopPropagation(); action(); }}
          onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; }}
          onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
          style={{
            position: 'absolute',
            top: '50%',
            transform: 'translateY(-50%)',
            ...pos,
            zIndex: 20,
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: 'white',
            fontSize: '1.5rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s',
          }}
        >
          {label}
        </button>
      ))}

      {/* Stats bar */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'rgba(10,22,15,0.75)',
        backdropFilter: 'blur(12px)',
        borderTop: '1px solid rgba(168,213,181,0.15)',
        display: 'flex',
        justifyContent: 'center',
        gap: '0',
        zIndex: 15,
        padding: '0',
      }}>
        {[
          { value: '500+', label: 'Sản phẩm' },
          { value: '10+', label: 'Năm kinh nghiệm' },
          { value: '5.000+', label: 'Khách hàng' },
          { value: '24/7', label: 'Hỗ trợ' },
        ].map((stat, i) => (
          <div key={i} style={{
            flex: 1,
            maxWidth: '200px',
            textAlign: 'center',
            padding: '18px 12px',
            borderRight: i < 3 ? '1px solid rgba(255,255,255,0.08)' : 'none',
          }}>
            <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#a8d5b5', lineHeight: 1 }}>{stat.value}</div>
            <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', marginTop: '4px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes zoomIn {
          from { transform: scale(1.05); }
          to { transform: scale(1); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
