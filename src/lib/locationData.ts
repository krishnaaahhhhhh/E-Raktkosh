import { StateInfo, DiseaseCondition, HospitalFacility, EmergencyTier } from '../types';

export const EMERGENCY_TIERS: EmergencyTier[] = [
  {
    id: 'patient',
    tierNumber: 1,
    name: 'Patient Emergency Portal (/patient)',
    hindiName: 'मरीज व नागरिक आपातकालीन पोर्टल',
    roleTitle: 'Patient (/patient)',
    description: 'Rapid symptom triage, live GPS ambulance tracking, vital entry & hospital discovery.',
    iconName: 'Smartphone',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    isPrimary: true
  },
  {
    id: 'hospital',
    tierNumber: 2,
    name: 'Hospital ER Command Center (/hospital)',
    hindiName: 'अस्पताल इमरजेंसी व ट्रॉमा कमांड सेंटर',
    roleTitle: 'Hospital (/hospital)',
    description: 'Inbound emergency queue, live ECG waveform monitors, floor bed matrix & pharmacy stock.',
    iconName: 'Building2',
    badgeColor: 'bg-red-500/20 text-red-300 border-red-500/40'
  },
  {
    id: 'coordinate',
    tierNumber: 3,
    name: 'Emergency Coordination & 108 DEOC (/coordinate)',
    hindiName: '108 केंद्रीय समन्वय व जिला नियंत्रण कक्ष',
    roleTitle: 'Coordinate (/coordinate)',
    description: 'District-wide hospital capacity grid, live ambulance fleet tracking & load balancing.',
    iconName: 'Layers',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40'
  },
  {
    id: 'paramedic',
    tierNumber: 4,
    name: '108 Paramedic Ambulance Crew',
    hindiName: 'पैरामेडिक 108 एम्बुलेंस रिस्पॉन्डर',
    roleTitle: 'Paramedic (108 Crew)',
    description: 'On-scene vitals transmission, 12-lead ECG stream & hospital pre-arrival alert.',
    iconName: 'Ambulance',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40'
  },
  {
    id: 'dual_split',
    tierNumber: 0,
    name: 'Dual Split Simulation',
    hindiName: 'लाइव स्प्लिट सिमुलेशन',
    roleTitle: 'Split View',
    description: 'Side-by-side live sync of Patient & Hospital ER.',
    iconName: 'Split',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
  }
];

export const INDIAN_STATES: StateInfo[] = [
  {
    id: 'delhi-ncr',
    name: 'Delhi NCR',
    hindiName: 'दिल्ली एनसीआर',
    code: 'DL',
    cities: [
      { id: 'delhi', name: 'New Delhi / Central Delhi', hindiName: 'नई दिल्ली / मध्य दिल्ली', lat: 28.6139, lng: 77.2090, isPopular: true },
      { id: 'south-delhi', name: 'South Delhi (AIIMS / Safdarjung)', hindiName: 'दक्षिण दिल्ली', lat: 28.5672, lng: 77.2100, isPopular: true },
      { id: 'noida', name: 'Noida / Greater Noida', hindiName: 'नोएडा / ग्रेटर नोएडा', lat: 28.5355, lng: 77.3910, isPopular: true },
      { id: 'gurugram', name: 'Gurugram (Gurgaon)', hindiName: 'गुरुग्राम', lat: 28.4595, lng: 77.0266, isPopular: true },
      { id: 'ghaziabad', name: 'Ghaziabad', hindiName: 'गाज़ियाबाद', lat: 28.6692, lng: 77.4538 },
      { id: 'faridabad', name: 'Faridabad', hindiName: 'फरीदाबाद', lat: 28.4089, lng: 77.3178 }
    ]
  },
  {
    id: 'uttar-pradesh',
    name: 'Uttar Pradesh',
    hindiName: 'उत्तर प्रदेश',
    code: 'UP',
    cities: [
      { id: 'lucknow', name: 'Lucknow', hindiName: 'लखनऊ (KGMU / SGPGI)', lat: 26.8467, lng: 80.9462, isPopular: true },
      { id: 'kanpur', name: 'Kanpur', hindiName: 'कानपुर', lat: 26.4499, lng: 80.3319, isPopular: true },
      { id: 'varanasi', name: 'Varanasi (Kashi)', hindiName: 'वाराणसी (BHU ट्रॉमा सेंटर)', lat: 25.3176, lng: 82.9739, isPopular: true },
      { id: 'noida-up', name: 'Noida / Gr. Noida', hindiName: 'नोएडा', lat: 28.5355, lng: 77.3910, isPopular: true },
      { id: 'agra', name: 'Agra', hindiName: 'आगरा', lat: 27.1767, lng: 78.0081 },
      { id: 'prayagraj', name: 'Prayagraj (Allahabad)', hindiName: 'प्रयागराज', lat: 25.4358, lng: 81.8463 },
      { id: 'meerut', name: 'Meerut', hindiName: 'मेरठ', lat: 28.9845, lng: 77.7064 },
      { id: 'gorakhpur', name: 'Gorakhpur (AIIMS)', hindiName: 'गोरखपुर', lat: 26.7606, lng: 83.3732 }
    ]
  },
  {
    id: 'maharashtra',
    name: 'Maharashtra',
    hindiName: 'महाराष्ट्र',
    code: 'MH',
    cities: [
      { id: 'mumbai', name: 'Mumbai (South & Central)', hindiName: 'मुंबई', lat: 18.9894, lng: 72.8295, isPopular: true },
      { id: 'mumbai-suburban', name: 'Mumbai Suburbs & Andheri', hindiName: 'मुंबई उपनगर / अंधेरी', lat: 19.1136, lng: 72.8697, isPopular: true },
      { id: 'pune', name: 'Pune', hindiName: 'पुणे', lat: 18.5204, lng: 73.8567, isPopular: true },
      { id: 'nagpur', name: 'Nagpur (AIIMS)', hindiName: 'नागपुर', lat: 21.1458, lng: 79.0882, isPopular: true },
      { id: 'thane', name: 'Thane & Navi Mumbai', hindiName: 'ठाणे व नवी मुंबई', lat: 19.2183, lng: 72.9781 },
      { id: 'nashik', name: 'Nashik', hindiName: 'नासिक', lat: 19.9975, lng: 73.7898 }
    ]
  },
  {
    id: 'karnataka',
    name: 'Karnataka',
    hindiName: 'कर्नाटक',
    code: 'KA',
    cities: [
      { id: 'bengaluru-central', name: 'Bengaluru (Central & Victoria)', hindiName: 'बेंगलुरु (सेंट्रल)', lat: 12.9716, lng: 77.5946, isPopular: true },
      { id: 'bengaluru-south', name: 'Bengaluru (Jayanagar / Nimhans)', hindiName: 'बेंगलुरु (साउथ / निमहंस)', lat: 12.9352, lng: 77.5937, isPopular: true },
      { id: 'bengaluru-whitefield', name: 'Bengaluru (Whitefield / IT Corridor)', hindiName: 'बेंगलुरु (व्हाइटफील्ड)', lat: 12.9698, lng: 77.7500, isPopular: true },
      { id: 'mysuru', name: 'Mysuru (Mysore)', hindiName: 'मैसूर', lat: 12.2958, lng: 76.6394 },
      { id: 'mangaluru', name: 'Mangaluru', hindiName: 'मंगलुरु', lat: 12.9141, lng: 74.8560 }
    ]
  },
  {
    id: 'rajasthan',
    name: 'Rajasthan',
    hindiName: 'राजस्थान',
    code: 'RJ',
    cities: [
      { id: 'jaipur', name: 'Jaipur (SMS Trauma / Eternal)', hindiName: 'जयपुर (एसएमएस अस्पताल)', lat: 26.9124, lng: 75.7873, isPopular: true },
      { id: 'jodhpur', name: 'Jodhpur (AIIMS)', hindiName: 'जोधपुर (एम्स)', lat: 26.2389, lng: 73.0243, isPopular: true },
      { id: 'udaipur', name: 'Udaipur', hindiName: 'उदयपुर', lat: 24.5854, lng: 73.7125 },
      { id: 'kota', name: 'Kota', hindiName: 'कोटा', lat: 25.2138, lng: 75.8648 }
    ]
  },
  {
    id: 'gujarat',
    name: 'Gujarat',
    hindiName: 'गुजरात',
    code: 'GJ',
    cities: [
      { id: 'ahmedabad', name: 'Ahmedabad (Civil / UN Mehta)', hindiName: 'अहमदाबाद (सिविल अस्पताल)', lat: 23.0225, lng: 72.5714, isPopular: true },
      { id: 'surat', name: 'Surat', hindiName: 'सूरत', lat: 21.1702, lng: 72.8311, isPopular: true },
      { id: 'vadodara', name: 'Vadodara (Baroda)', hindiName: 'वडोदरा', lat: 22.3072, lng: 73.1812 },
      { id: 'rajkot', name: 'Rajkot (AIIMS)', hindiName: 'राजकोट', lat: 22.3039, lng: 70.8022 }
    ]
  },
  {
    id: 'telangana',
    name: 'Telangana',
    hindiName: 'तेलंगाना',
    code: 'TG',
    cities: [
      { id: 'hyderabad', name: 'Hyderabad (NIMS / Osmania / Secunderabad)', hindiName: 'हैदराबाद', lat: 17.3850, lng: 78.4867, isPopular: true },
      { id: 'hyderabad-hitec', name: 'Hyderabad (Gachibowli / Hitec City)', hindiName: 'हैदराबाद (हाइटेक सिटी)', lat: 17.4435, lng: 78.3772, isPopular: true },
      { id: 'warangal', name: 'Warangal', hindiName: 'वारंगल', lat: 17.9689, lng: 79.5941 }
    ]
  },
  {
    id: 'tamil-nadu',
    name: 'Tamil Nadu',
    hindiName: 'तमिलनाडु',
    code: 'TN',
    cities: [
      { id: 'chennai', name: 'Chennai (MMC / Rajiv Gandhi GH / Apollo)', hindiName: 'चेन्नई', lat: 13.0827, lng: 80.2707, isPopular: true },
      { id: 'coimbatore', name: 'Coimbatore', hindiName: 'कोयंबटूर', lat: 11.0168, lng: 76.9558, isPopular: true },
      { id: 'madurai', name: 'Madurai (AIIMS / GRH)', hindiName: 'मदुरै', lat: 9.9252, lng: 78.1198 }
    ]
  },
  {
    id: 'west-bengal',
    name: 'West Bengal',
    hindiName: 'पश्चिम बंगाल',
    code: 'WB',
    cities: [
      { id: 'kolkata', name: 'Kolkata (SSKM / IPGMER / Medical College)', hindiName: 'कोलकाता', lat: 22.5726, lng: 88.3639, isPopular: true },
      { id: 'kolkata-saltlake', name: 'Kolkata (Salt Lake / New Town)', hindiName: 'कोलकाता (साल्ट लेक)', lat: 22.5868, lng: 88.4178, isPopular: true },
      { id: 'siliguri', name: 'Siliguri (North Bengal Med)', hindiName: 'सिलीगुड़ी', lat: 26.7271, lng: 88.3953 }
    ]
  },
  {
    id: 'madhya-pradesh',
    name: 'Madhya Pradesh',
    hindiName: 'मध्य प्रदेश',
    code: 'MP',
    cities: [
      { id: 'bhopal', name: 'Bhopal (AIIMS / Hamidia)', hindiName: 'भोपाल (एम्स)', lat: 23.2599, lng: 77.4126, isPopular: true },
      { id: 'indore', name: 'Indore (MY Hospital / Bombay Hosp)', hindiName: 'इंदौर', lat: 22.7196, lng: 75.8577, isPopular: true },
      { id: 'gwalior', name: 'Gwalior (JAH)', hindiName: 'ग्वालियर', lat: 26.2183, lng: 78.1828 },
      { id: 'jabalpur', name: 'Jabalpur (NSCB Med)', hindiName: 'जबलपुर', lat: 23.1815, lng: 79.9864 }
    ]
  },
  {
    id: 'bihar',
    name: 'Bihar',
    hindiName: 'बिहार',
    code: 'BR',
    cities: [
      { id: 'patna', name: 'Patna (AIIMS / PMCH / IGIMS)', hindiName: 'पटना (एम्स / पीएमसीएच)', lat: 25.5941, lng: 85.1376, isPopular: true },
      { id: 'gaya', name: 'Gaya (ANMMCH)', hindiName: 'गया', lat: 24.7955, lng: 85.0002 },
      { id: 'muzaffarpur', name: 'Muzaffarpur (SKMCH)', hindiName: 'मुजफ्फरपुर', lat: 26.1209, lng: 85.3647 }
    ]
  },
  {
    id: 'punjab-haryana',
    name: 'Punjab & Chandigarh',
    hindiName: 'पंजाब व चंडीगढ़',
    code: 'PB',
    cities: [
      { id: 'chandigarh', name: 'Chandigarh (PGIMER / GMCH 32)', hindiName: 'चंडीगढ़ (पीजीआई)', lat: 30.7333, lng: 76.7794, isPopular: true },
      { id: 'ludhiana', name: 'Ludhiana (DMC / CMC)', hindiName: 'लुधियाना', lat: 30.9010, lng: 75.8573, isPopular: true },
      { id: 'amritsar', name: 'Amritsar (GMC)', hindiName: 'अमृतसर', lat: 31.6340, lng: 74.8723 }
    ]
  }
];

export const EMERGENCY_DISEASE_CONDITIONS: DiseaseCondition[] = [
  {
    id: 'heart-attack',
    name: 'Heart Attack / Chest Pain / STEMI',
    hindiName: 'हार्ट अटैक / सीने में तेज दर्द / दिल का दौरा',
    category: 'cardiac',
    urgency: 'CRITICAL',
    description: 'Crushing chest pressure radiating to arm/jaw, sweating, shortness of breath. Golden hour STEMI intervention.',
    hindiDescription: 'सीने में भारीपन, बायीं बांह या जबड़े में दर्द, ठंडा पसीना और घबराहट। तुरंत कैथ लैब व ईसीजी आवश्यक।',
    iconName: 'HeartPulse',
    requiredFeatures: ['Cath Lab 24x7', 'Cardiac ICU (CCU)', 'Interventional Cardiologist'],
    recommendedDepartment: 'Floor 1 Cardiology & Primary Angioplasty CCU'
  },
  {
    id: 'stroke-paralysis',
    name: 'Acute Stroke / Paralysis / Code FAST',
    hindiName: 'स्ट्रोक / लकवा / मस्तिष्क आघात (Code FAST)',
    category: 'stroke',
    urgency: 'CRITICAL',
    description: 'Sudden facial droop, arm weakness, slurred speech, acute confusion within thrombolysis window (<4.5 hrs).',
    hindiDescription: 'चेहरा टेढ़ा होना, हाथ-पैर में अचानक कमजोरी, आवाज लड़खड़ाना या बेहोशी। तुरंत न्यूरो आईसीयू व सीटी स्कैन जरूरी।',
    iconName: 'Brain',
    requiredFeatures: ['Stroke Unit 24x7', 'Emergency CT / MRI', 'Neurosurgeon On-Call'],
    recommendedDepartment: 'Floor 2 Neuro-Resuscitation & Stroke ICU'
  },
  {
    id: 'trauma-accident',
    name: 'Severe Road Accident / Polytrauma / Fractures',
    hindiName: 'सड़क दुर्घटना / गंभीर चोट / फ्रैक्चर / रक्तस्राव',
    category: 'trauma',
    urgency: 'CRITICAL',
    description: 'High-velocity collision, severe hemorrhage, head trauma, open bone fractures, penetrating injuries.',
    hindiDescription: 'सड़क हादसा, अत्यधिक खून बहना, सिर में गंभीर चोट या हड्डी टूटना। लेवल-1 ट्रॉमा resus आवश्यक।',
    iconName: 'ShieldAlert',
    requiredFeatures: ['Level 1 / 2 Trauma Center', 'Emergency Operation Theater', 'Blood Bank 24x7'],
    recommendedDepartment: 'Ground Floor Red Resuscitation Bay (Trauma OT)'
  },
  {
    id: 'respiratory-oxygen',
    name: 'Severe Breathing Trouble / Asthma / Oxygen Drop',
    hindiName: 'सांस लेने में भारी तकलीफ / अस्थमा / ऑक्सीजन गिरावट',
    category: 'respiratory',
    urgency: 'CRITICAL',
    description: 'SpO2 < 90%, choking, severe wheezing, COPD exacerbation, acute respiratory distress syndrome.',
    hindiDescription: 'दम घुटना, ऑक्सीजन सेचुरेशन में तेज गिरावट, सीने से सीटी जैसी आवाज या नीला पड़ना। वेंटिलेटर स्टैंडबाय।',
    iconName: 'Wind',
    requiredFeatures: ['Mechanical Ventilators', 'High Flow Oxygen (HFNC)', 'Pulmonology ICU'],
    recommendedDepartment: 'Floor 0 Acute Airway Resuscitation & High Flow O2'
  },
  {
    id: 'burn-injury',
    name: 'Severe Burn Injury / Electrical Shock / Acid Burn',
    hindiName: 'आग से जलना / बिजली का झटका / एसिड बर्न',
    category: 'burn',
    urgency: 'CRITICAL',
    description: 'Thermal burns (>15% BSA), high voltage electrical burns, chemical burns requiring sterile fluid resuscitation.',
    hindiDescription: 'आग, गर्म तरल या करंट से गहरा जलना। विशेष बर्न आईसीयू और स्टेराइल ड्रेसिंग सुविधा।',
    iconName: 'Flame',
    requiredFeatures: ['Dedicated Burn ICU', 'Sterile Isolation Beds', 'Plastic Surgery'],
    recommendedDepartment: 'Floor 0 Advanced Burn Resuscitation Unit'
  },
  {
    id: 'abdominal-gastro',
    name: 'Severe Abdominal Pain / Internal Bleeding / Appendicitis',
    hindiName: 'पेट में असहनीय दर्द / आंतरिक रक्तस्राव / अपेंडिक्स',
    category: 'general',
    urgency: 'URGENT',
    description: 'Acute abdomen, board-like rigidity, vomiting blood, suspected perforated ulcer or pancreatitis.',
    hindiDescription: 'अचानक पेट में भयंकर दर्द, खून की उल्टी, तेज मरोड़ व उल्टी। इमरजेंसी अल्ट्रासाउंड व सर्जिकल टीम।',
    iconName: 'Activity',
    requiredFeatures: ['Emergency Ultrasound / CT', 'General Surgery Team', 'ICU Backup'],
    recommendedDepartment: 'Floor 0 Surgical Observation & Triage Bay'
  },
  {
    id: 'maternity-pregnancy',
    name: 'Pregnancy Emergency / Labor Pain / Eclampsia',
    hindiName: 'गर्भावस्था आपातकाल / प्रसव पीड़ा / प्री-एक्लेम्पसिया',
    category: 'general',
    urgency: 'URGENT',
    description: 'Active labor, high BP in pregnancy, severe bleeding, reduced fetal movement, emergency C-section standby.',
    hindiDescription: 'अचानक प्रसव दर्द, तेज रक्तस्राव, उच्च रक्तचाप या दौरे। लेबर रूम व एनआईसीयू (NICU) बैकअप।',
    iconName: 'Heart',
    requiredFeatures: ['Obstetrics & Gynaecology 24x7', 'NICU / Infant Resuscitation', 'Emergency OT'],
    recommendedDepartment: 'Floor 3 Maternal & Neonatal Emergency Suite'
  },
  {
    id: 'pediatric-emergency',
    name: 'Child & Infant Emergency / Febrile Seizures',
    hindiName: 'बच्चों व नवजात की इमरजेंसी / तेज बुखार के दौरे',
    category: 'general',
    urgency: 'URGENT',
    description: 'Pediatric seizure, severe dehydration, accidental poisoning, difficulty breathing in infant.',
    hindiDescription: 'शिशु को तेज बुखार में झटका, सांस की रुकावट या कोई वस्तु निगलना। बाल रोग विशेषज्ञ (PICU)।',
    iconName: 'UserCheck',
    requiredFeatures: ['Pediatric ICU (PICU)', 'Pediatrician On-Duty', 'Specialized Child Resus'],
    recommendedDepartment: 'Floor 0 Pediatric Emergency & Resuscitation'
  },
  {
    id: 'poison-unconscious',
    name: 'Unconscious / Toxic Ingestion / Snake Bite / Poisoning',
    hindiName: 'बेहोशी / जहर या जहरीला कीड़ा काटना / टॉक्सिकोलॉजी',
    category: 'general',
    urgency: 'CRITICAL',
    description: 'Unresponsive patient, snake venom envenomation, pesticide/drug overdose, toxicology resus.',
    hindiDescription: 'मरीज का होश में न होना, सांप का काटना, दवा या जहर का ओवरडोज। एंटी-वेनम व गैस्ट्रिक लवाज।',
    iconName: 'ShieldPlus',
    requiredFeatures: ['Anti-Venom Stock', 'Toxicology Antidotes', 'Dialysis Backup'],
    recommendedDepartment: 'Floor 0 Resuscitation Bay 6 (Toxicology & Antidote)'
  }
];

// Helper to filter hospitals by State, City, and Condition
export function getHospitalsForLocation(
  allHospitals: Record<string, HospitalFacility>,
  stateId?: string,
  cityId?: string,
  diseaseId?: string
): HospitalFacility[] {
  const hospitalList = Object.values(allHospitals);
  
  if (!stateId && !cityId && !diseaseId) {
    return hospitalList;
  }

  return hospitalList.filter((hosp) => {
    // City match
    if (cityId) {
      const cityMatches =
        hosp.city.toLowerCase().includes(cityId.toLowerCase()) ||
        hosp.address.toLowerCase().includes(cityId.toLowerCase());
      if (!cityMatches) return false;
    }

    // State match
    if (stateId && hosp.state) {
      const stateObj = INDIAN_STATES.find(s => s.id === stateId);
      if (stateObj && !hosp.state.toLowerCase().includes(stateObj.name.toLowerCase())) {
        return false;
      }
    }

    // Disease capability match if requested
    if (diseaseId) {
      if (diseaseId === 'heart-attack' && !hosp.cathLabActive) return false;
      if (diseaseId === 'stroke-paralysis' && !hosp.strokeReady) return false;
      if (diseaseId === 'burn-injury' && !hosp.burnUnitReady) return false;
    }

    return true;
  });
}
