// Newspaper Clipping & Real-world Emergency Grid Visual Assets for 3D Infinite Gallery

// Helper to create high-resolution canvas text textures for newspaper articles
function createNewsCardDataUrl(
  headline: string,
  subhead: string,
  bodyText: string,
  tag: string,
  accentColor: string = '#dc2626'
): string {
  if (typeof document === 'undefined') return '';

  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 560;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Vintage newsprint textured background
  ctx.fillStyle = '#fbf9f4';
  ctx.fillRect(0, 0, 800, 560);

  // Border & Newspaper header line
  ctx.strokeStyle = '#e2ded5';
  ctx.lineWidth = 4;
  ctx.strokeRect(16, 16, 768, 528);

  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(32, 60);
  ctx.lineTo(768, 60);
  ctx.stroke();

  // News publication bar
  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 16px "Times New Roman", Times, serif';
  ctx.fillText('NATIONAL HEALTHCARE INVESTIGATION • SPECIAL REPORT', 34, 48);

  ctx.fillStyle = accentColor;
  ctx.font = 'bold 15px sans-serif';
  ctx.fillText(tag.toUpperCase(), 640, 48);

  // Headline
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 36px "Times New Roman", Times, serif';
  
  // Word wrap for headline
  const words = headline.split(' ');
  let line = '';
  let y = 110;
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > 720 && n > 0) {
      ctx.fillText(line, 36, y);
      line = words[n] + ' ';
      y += 44;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, 36, y);

  // Subheader
  y += 30;
  ctx.fillStyle = '#475569';
  ctx.font = 'italic bold 20px "Times New Roman", Times, serif';
  ctx.fillText(subhead, 36, y);

  // Divider line
  y += 20;
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(36, y);
  ctx.lineTo(764, y);
  ctx.stroke();

  // Body content in newspaper 2-column layout
  y += 30;
  ctx.fillStyle = '#334155';
  ctx.font = '16px "Times New Roman", Times, serif';

  const bodyLines = bodyText.split('\n');
  let currentY = y;
  for (const bl of bodyLines) {
    if (currentY < 480) {
      ctx.fillText(bl, 36, currentY);
      currentY += 24;
    }
  }

  // Warning Footer Pill
  ctx.fillStyle = accentColor;
  ctx.beginPath();
  ctx.roundRect(36, 490, 728, 36, 6);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText('PRATHMIKTA MISSION: ZERO-DELAY TRIAGE • INSTANT BED VISIBILITY • SAVING THE GOLDEN HOUR', 48, 513);

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

  return [
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
    {
      src: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&auto=format&fit=crop&q=80',
      alt: 'Critical Care Medical Support',
      title: 'Unified Emergency Grid',
      type: 'photo',
    },
    {
      src: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800&auto=format&fit=crop&q=80',
      alt: 'Hospital Emergency Entrance & Green Corridor',
      title: 'Seamless Pre-Arrival Handover',
      type: 'photo',
    },
  ];
}
