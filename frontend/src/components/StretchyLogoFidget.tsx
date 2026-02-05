import { useEffect, useRef, useState, useMemo } from 'react';

const GRID_SIZE = 20;
const SPRING = 0.1;
const DAMPING = 0.85;
const DRAG_FORCE = 0.25;

class Point {
  x: number;
  y: number;
  ox: number;
  oy: number;
  vx: number;
  vy: number;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.ox = x;
    this.oy = y;
    this.vx = 0;
    this.vy = 0;
  }
  update() {
    const dx = this.ox - this.x;
    const dy = this.oy - this.y;
    this.vx += dx * SPRING;
    this.vy += dy * SPRING;
    this.vx *= DAMPING;
    this.vy *= DAMPING;
    this.x += this.vx;
    this.y += this.vy;
  }
}

// Default Playroom logo: simple SVG (fits phone, stretchy-friendly)
const PLAYROOM_DEFAULT_LOGO =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 80" width="200" height="80"><rect width="200" height="80" fill="#1a202c"/><text x="100" y="50" font-family="system-ui,sans-serif" font-size="28" font-weight="700" fill="#e94560" text-anchor="middle" dominant-baseline="middle">Playroom</text></svg>'
  );

export type StretchyImageSource = 'playroom' | 'venue-logo' | 'custom';

export interface StretchyLogoFidgetProps {
  /** Source of the image: default Playroom, scraped venue logo, or host custom URL */
  imageSource?: StretchyImageSource;
  /** When imageSource is 'venue-logo', use this URL (e.g. from scrape / Apply event details) */
  venueLogoUrl?: string | null;
  /** When imageSource is 'custom', use this URL (host upload or custom image) */
  customImageUrl?: string | null;
}

export default function StretchyLogoFidget({
  imageSource = 'playroom',
  venueLogoUrl = null,
  customImageUrl = null,
}: StretchyLogoFidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointsRef = useRef<Point[]>([]);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  /** Local override: user chose "Load image" or "Reset to default" this session */
  const [localOverrideUrl, setLocalOverrideUrl] = useState<string | null>(null);
  const dragRef = useRef({ active: false, x: 0, y: 0 });
  const rafRef = useRef<number>(0);

  const resolvedUrl = useMemo(() => {
    if (localOverrideUrl) return localOverrideUrl;
    if (imageSource === 'venue-logo' && venueLogoUrl) return venueLogoUrl;
    if (imageSource === 'custom' && customImageUrl) return customImageUrl;
    return PLAYROOM_DEFAULT_LOGO;
  }, [localOverrideUrl, imageSource, venueLogoUrl, customImageUrl]);

  const loadImage = (src: string) => {
    const img = new Image();
    img.crossOrigin = src.startsWith('data:') ? '' : 'anonymous';
    img.onload = () => {
      imgRef.current = img;
      setImgLoaded(true);
    };
    img.onerror = () => setImgLoaded(false);
    img.src = src;
  };

  useEffect(() => {
    loadImage(resolvedUrl);
  }, [resolvedUrl]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || !imgLoaded || !imgRef.current) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = 400;
    let h = 400;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      w = canvas.width = Math.floor(rect.width);
      h = canvas.height = Math.floor(rect.height);
      buildGrid();
    };

    function buildGrid() {
      if (!imgRef.current) return;
      const img = imgRef.current;
      const cols = Math.floor(img.width / GRID_SIZE);
      const rows = Math.floor(img.height / GRID_SIZE);
      const startX = (w - img.width) / 2;
      const startY = (h - img.height) / 2;
      const points: Point[] = [];
      for (let y = 0; y <= rows; y++) {
        for (let x = 0; x <= cols; x++) {
          points.push(new Point(startX + x * GRID_SIZE, startY + y * GRID_SIZE));
        }
      }
      pointsRef.current = points;
    }

    resize();
    const ro = new ResizeObserver(() => resize());
    ro.observe(container);

    const applyDrag = (x: number, y: number) => {
      for (const p of pointsRef.current) {
        const dx = p.x - x;
        const dy = p.y - y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          const force = (1 - dist / 120) * DRAG_FORCE;
          p.vx += dx * force;
          p.vy += dy * force;
        }
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const points = pointsRef.current;
      const img = imgRef.current;
      if (!img || points.length === 0) return;

      let i = 0;
      for (let y = 0; y < img.height; y += GRID_SIZE) {
        for (let x = 0; x < img.width; x += GRID_SIZE) {
          const p = points[i++];
          if (p) {
            ctx.drawImage(img, x, y, GRID_SIZE, GRID_SIZE, p.x, p.y, GRID_SIZE, GRID_SIZE);
          }
        }
      }
    };

    const update = () => {
      for (const p of pointsRef.current) p.update();
    };

    const loop = () => {
      update();
      draw();
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    const handlePointerDown = (e: PointerEvent) => {
      dragRef.current.active = true;
      dragRef.current.x = e.clientX;
      dragRef.current.y = e.clientY;
      applyDrag(e.clientX, e.clientY);
    };
    const handlePointerMove = (e: PointerEvent) => {
      if (!dragRef.current.active) return;
      dragRef.current.x = e.clientX;
      dragRef.current.y = e.clientY;
      applyDrag(e.clientX, e.clientY);
    };
    const handlePointerUp = () => {
      dragRef.current.active = false;
    };

    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointerleave', handlePointerUp);
    window.addEventListener('resize', resize);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('pointerleave', handlePointerUp);
      cancelAnimationFrame(rafRef.current);
    };
  }, [imgLoaded]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      if (dataUrl) {
        setLocalOverrideUrl(dataUrl);
        loadImage(dataUrl);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const usePlayroomDefault = () => {
    setLocalOverrideUrl(null);
    loadImage(PLAYROOM_DEFAULT_LOGO);
  };

  const useVenueLogo = () => {
    if (!venueLogoUrl) return;
    setLocalOverrideUrl(venueLogoUrl);
    loadImage(venueLogoUrl);
  };

  const useCustomUrl = () => {
    if (!customImageUrl) return;
    setLocalOverrideUrl(customImageUrl);
    loadImage(customImageUrl);
  };

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 480,
        margin: '0 auto',
        background: '#111',
        borderRadius: 12,
        overflow: 'hidden',
      }}
    >
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          touchAction: 'none',
          width: '100%',
          minHeight: 240,
          height: 'min(380px, 70vw)',
        }}
      >
        <canvas
          ref={canvasRef}
          width={400}
          height={380}
          style={{ display: 'block', width: '100%', height: '100%', objectFit: 'contain' }}
        />
        {!imgLoaded && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#111',
              color: '#666',
            }}
          >
            Loading…
          </div>
        )}
      </div>
      <div
        style={{
          padding: '14px 16px',
          background: '#1a202c',
          borderTop: '1px solid #333',
        }}
      >
        <p
          style={{
            margin: '0 0 10px 0',
            fontSize: 12,
            fontWeight: 600,
            color: '#a0aec0',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          Logo — default Playroom, venue/scraped, or load your own
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
          <button
            type="button"
            onClick={usePlayroomDefault}
            style={{
              padding: '10px 18px',
              background: '#2d3748',
              color: '#e2e8f0',
              border: '1px solid #4a5568',
              borderRadius: 8,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            Default (Playroom)
          </button>
          {venueLogoUrl && (
            <button
              type="button"
              onClick={useVenueLogo}
              style={{
                padding: '10px 18px',
                background: '#2d3748',
                color: '#e2e8f0',
                border: '1px solid #4a5568',
                borderRadius: 8,
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              Venue / scraped logo
            </button>
          )}
          {customImageUrl && customImageUrl !== venueLogoUrl && (
            <button
              type="button"
              onClick={useCustomUrl}
              style={{
                padding: '10px 18px',
                background: '#2d3748',
                color: '#e2e8f0',
                border: '1px solid #4a5568',
                borderRadius: 8,
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              Host custom image
            </button>
          )}
          <label
            style={{
              padding: '10px 18px',
              background: '#4a5568',
              color: '#fff',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            Load image
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </div>
    </div>
  );
}
