// Newspaper Clipping & Real-world Emergency Grid Visual Assets for 3D Infinite Gallery

// Helper to create high-resolution canvas text textures with realistic burnt/charred newspaper edges
function createNewsCardDataUrl(
  headline: string,
  subhead: string,
  bodyText: string,
  tag: string,
  accentColor: string = '#dc2626'
): string {
  if (typeof document === 'undefined') return '';

  const canvas = document.createElement('canvas');
  canvas.width = 860;
  canvas.height = 620;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // 1. Base dark charred boundary
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, 860, 620);

  // 2. Aged vintage newsprint paper background with ragged scorched perimeter
  ctx.save();
  ctx.beginPath();
  // Draw irregular ragged burnt paper contour
  ctx.moveTo(35, 30);
  ctx.lineTo(825, 25);
  ctx.lineTo(835, 585);
  ctx.lineTo(30, 595);
  ctx.closePath();
  ctx.clip();

  // Vintage yellowish/amber aged paper fill
  const paperGrad = ctx.createLinearGradient(0, 0, 860, 620);
  paperGrad.addColorStop(0, '#f2e8cf');
  paperGrad.addColorStop(0.5, '#ebdcc0');
  paperGrad.addColorStop(1, '#dfcbb0');
  ctx.fillStyle = paperGrad;
  ctx.fillRect(0, 0, 860, 620);

  // Scorched paper fibers & grain
  for (let i = 0; i < 400; i++) {
    ctx.fillStyle = i % 2 === 0 ? 'rgba(120, 80, 40, 0.04)' : 'rgba(0, 0, 0, 0.03)';
    const rx = Math.random() * 860;
    const ry = Math.random() * 620;
    const rw = Math.random() * 4 + 1;
    const rh = Math.random() * 2 + 1;
    ctx.fillRect(rx, ry, rw, rh);
  }

  // 3. Heavy burnt/charred vignette edges
  const edgeBurn = ctx.createRadialGradient(430, 310, 240, 430, 310, 460);
  edgeBurn.addColorStop(0, 'rgba(0, 0, 0, 0)');
  edgeBurn.addColorStop(0.65, 'rgba(80, 40, 20, 0.25)');
  edgeBurn.addColorStop(0.85, 'rgba(40, 15, 5, 0.65)');
  edgeBurn.addColorStop(0.98, 'rgba(10, 5, 0, 0.95)');
  edgeBurn.addColorStop(1, '#050200');
  ctx.fillStyle = edgeBurn;
  ctx.fillRect(0, 0, 860, 620);

  // 4. Burn holes & scorched corner marks
  const burnSpots = [
    { x: 50, y: 45, r: 35 },
    { x: 810, y: 40, r: 42 },
    { x: 45, y: 575, r: 48 },
    { x: 815, y: 570, r: 52 },
    { x: 740, y: 180, r: 28 },
  ];
  for (const s of burnSpots) {
    const sGrad = ctx.createRadialGradient(s.x, s.y, s.r * 0.2, s.x, s.y, s.r);
    sGrad.addColorStop(0, '#0a0502');
    sGrad.addColorStop(0.5, '#2e1205');
    sGrad.addColorStop(0.85, 'rgba(90, 40, 10, 0.5)');
    sGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = sGrad;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
  }

  // 5. Classic double-line newspaper masthead
  ctx.strokeStyle = '#2b231d';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(60, 75);
  ctx.lineTo(800, 75);
  ctx.stroke();

  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(60, 80);
  ctx.lineTo(800, 80);
  ctx.stroke();

  // News publication bar
  ctx.fillStyle = '#4a3b32';
  ctx.font = 'bold 15px "Times New Roman", Times, Georgia, serif';
  ctx.fillText('NATIONAL EMERGENCY ARCHIVE • INVESTIGATIVE DOSSIER', 65, 65);

  ctx.fillStyle = accentColor;
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText(tag.toUpperCase(), 640, 65);

  // Headline in authentic bold newspaper serif
  ctx.fillStyle = '#17120e';
  ctx.font = 'bold 36px "Times New Roman", Times, Georgia, serif';
  
  // Word wrap for headline
  const words = headline.split(' ');
  let line = '';
  let y = 125;
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > 680 && n > 0) {
      ctx.fillText(line, 65, y);
      line = words[n] + ' ';
      y += 44;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, 65, y);

  // Subheader
  y += 26;
  ctx.fillStyle = '#4a3b32';
  ctx.font = 'italic bold 19px "Times New Roman", Times, Georgia, serif';
  ctx.fillText(subhead, 65, y);

  // Divider line
  y += 18;
  ctx.strokeStyle = '#8a7767';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(65, y);
  ctx.lineTo(795, y);
  ctx.stroke();

  // Body content in newspaper serif style
  y += 28;
  ctx.fillStyle = '#261e18';
  ctx.font = '16px "Times New Roman", Times, Georgia, serif';

  const bodyLines = bodyText.split('\n');
  let currentY = y;
  for (const bl of bodyLines) {
    if (currentY < 520) {
      ctx.fillText(bl, 65, currentY);
      currentY += 25;
    }
  }

  // Warning Footer Pill
  ctx.fillStyle = '#1c140e';
  ctx.beginPath();
  ctx.roundRect(65, 532, 730, 36, 6);
  ctx.fill();

  ctx.strokeStyle = '#b91c1c';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = '#fef2f2';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText('PRATHMIKTA EMERGENCY GRID: ZERO-DELAY TRIAGE • INSTANT BED LOCK • SAVING GOLDEN HOUR', 78, 555);

  ctx.restore();

  return canvas.toDataURL('image/png');
}

export interface GalleryItem {
  src: string;
  alt: string;
  title?: string;
  type?: 'news' | 'photo';
}

export function getEmergencyGalleryImages(): GalleryItem[] {
  // Ensure we generate newspaper data URLs dynamically on client
  const isClient = typeof window !== 'undefined';

  const news1 = isClient
    ? createNewsCardDataUrl(
        "‘Ran from one hospital to another’: A mother’s ordeal to save her son's life",
        "New Delhi: 12 agonizing hours lost finding an available trauma specialist.",
        "• Jyoti Lochab ran from one hospital to another pleading for admission\n• Patient was sent back & forth between 3 hospitals due to lack of night specialists\n• 'We folded our hands before doctors... AIIMS admitted him only at 4:30 AM'\n• Critical window lost during golden hour transit delay.",
        "Hospital Delay Case 01",
        "#dc2626"
      )
    : 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&auto=format&fit=crop&q=80';

  const news2 = isClient
    ? createNewsCardDataUrl(
        "DELAYED, INADEQUATE TREATMENT, SAYS FAMILY",
        "Tragic loss reported as patient shifted late to emergency intensive care.",
        "• Admitted at 11 AM, shifted to emergency intensive unit only late in the evening\n• Family alleges lack of immediate triage evaluation during initial critical hours\n• Inquiry initiated into delay in life-saving resuscitation protocol\n• Unavailability of immediate bed availability data caused critical transit delays.",
        "Emergency Audit 02",
        "#b91c1c"
      )
    : 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80';

  const news3 = isClient
    ? createNewsCardDataUrl(
        "Golden Hour Lost in Transit: 50% Trauma Deaths Preventable",
        "WHO & AIIMS Report highlights lack of real-time multi-hospital grid.",
        "• 8 out of 10 ambulances dispatched without prior hospital bed confirmation\n• Average 42 minutes wasted in finding emergency facilities with open ICU beds\n• Prathmikta live triage grid eliminates blind ambulance dispatches\n• Connecting citizen, paramedic, 108 DEOC and hospital in one live telemetry link.",
        "Golden Hour Data",
        "#991b1b"
      )
    : 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=800&auto=format&fit=crop&q=80';

  const newsBlaze = isClient
    ? createNewsCardDataUrl(
        "BLAZE ENGULFS TEXTILE MARKET, CRORES LOST",
        "Short circuit triggers massive inferno; emergency units battle 14 hours.",
        "• High-intensity fire breaks out in congested commercial district\n• Fire tenders face narrow transit corridors and water pressure delays\n• Over 40 emergency personnel deployed for zero-casualty evacuation\n• Rapid response and early warning systems prove decisive.",
        "Fire Archive 01",
        "#ea580c"
      )
    : 'https://images.unsplash.com/photo-1574786198875-49f5d09fd2b5?w=800&auto=format&fit=crop&q=80';

  const newsShortCircuit = isClient
    ? createNewsCardDataUrl(
        "SHORT CIRCUIT BLAMED FOR BLAZE",
        "Overheating transformer causes localized power grid explosion.",
        "• Dense urban wiring sparks multiple fire pockets across 3 storeys\n• Emergency response teams establish green transit corridor\n• Smoke inhalation victims shifted to nearby specialized trauma care\n• Real-time dispatch telemetry coordinates triage handoff.",
        "Disaster Report 02",
        "#f59e0b"
      )
    : 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80';

  const newsTransformer = isClient
    ? createNewsCardDataUrl(
        "TRANSFORMER OVERLOAD SPARK TRIGGERS INFERNO",
        "Midnight alert mobilizes citywide emergency & burn trauma wards.",
        "• Rapid triage network locks immediate ICU and burn beds\n• Paramedics deploy on-site oxygen and vital stabilization\n• Zero door-to-treatment lag achieved through pre-arrival hospital alert.",
        "Urgent Dispatch 03",
        "#ef4444"
      )
    : 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80';

  return [
    {
      src: newsBlaze,
      alt: 'Blaze Engulfs Textile Market, Crores Lost',
      title: 'Disaster Archive: Urban Fire Response',
      type: 'news',
    },
    {
      src: newsShortCircuit,
      alt: 'Short Circuit Blamed for Blaze',
      title: 'Emergency Power Grid Hazard',
      type: 'news',
    },
    {
      src: newsTransformer,
      alt: 'Transformer Overload Spark Triggers Inferno',
      title: 'Burn Trauma & Emergency Triage',
      type: 'news',
    },
    {
      src: news1,
      alt: "Ran from one hospital to another - A mother's ordeal to save her son's life",
      title: "Real Emergency Case: 12 Hours Lost in Search of Beds",
      type: 'news',
    },
    {
      src: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=800&auto=format&fit=crop&q=80',
      alt: 'Emergency Ambulance Response',
      title: 'Rapid Ambulance Telemetry',
      type: 'photo',
    },
    {
      src: news2,
      alt: 'Delayed Inadequate Treatment Says Family',
      title: 'Hospital Transit Delays Cost Lives',
      type: 'news',
    },
    {
      src: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&auto=format&fit=crop&q=80',
      alt: 'Emergency ICU Ward & Life Support',
      title: 'Real-Time Bed Availability',
      type: 'photo',
    },
    {
      src: news3,
      alt: 'Golden Hour Lost in Transit Report',
      title: 'Every Second Counts in the Golden Hour',
      type: 'news',
    },
    {
      src: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80',
      alt: 'Emergency Trauma Triage Team',
      title: 'Pre-Hospital Triage Protocol',
      type: 'photo',
    },
  ];
}
