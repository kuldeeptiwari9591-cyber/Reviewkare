// Replyo Multi-Vertical Domain Taxonomy & Adaptive Question Engine
// Calibrated for Indian Local Businesses: Friction, Cognitive Load & Compliance

const VERTICAL_PROFILES = {
  clinic: {
    id: 'clinic',
    name: 'Healthcare, Dental & Aesthetic Clinics',
    shortName: 'Clinics & Healthcare',
    flowType: 'trust', // 4-step deep trust flow
    badge: 'High Trust / Clinical Care',
    questionCount: 4,
    description: 'Deep trust flow for medical, dental and aesthetic practices. Strict NMC 2023 ethics and Zero-PHI data governance.',
    icon: 'shield',
    onboarding: {
      businessNameLabel: 'Clinic / Hospital / Practice Name',
      businessNamePlaceholder: 'e.g. Apex Dental & Implant Clinic',
      ownerNameLabel: 'Lead Doctor / Practice Director',
      ownerNamePlaceholder: 'e.g. Dr. Ananya Sharma, MDS',
      customField1Label: 'Clinical Specialization',
      customField1Placeholder: 'e.g. Advanced Implantology, Clear Aligners, Dermatology',
      customField2Label: 'Emergency Quarantine WhatsApp',
      customField2Placeholder: 'e.g. +91 98450 11223 (For 1-3★ de-escalation)',
      defaultServices: ['Painless Root Canal', 'Clear Aligners', 'Laser Teeth Whitening', 'Dental Implants', 'Routine Consultation'],
      defaultQualities: ['Painless Procedure', 'Sterile Operatory', 'Gentle Doctor Care', 'Zero Wait Time', 'Transparent Pricing'],
      staffRole: 'Attending Doctor / Specialist',
      defaultStaff: ['Dr. Sneha (Endodontist)', 'Dr. Rajesh (Implantologist)', 'Clinic Care Team']
    },
    qrFlow: {
      step1Title: 'Overall Patient Experience',
      step2Title: 'Which procedure or treatment did you receive?',
      step3Title: 'How was the clinical care & hygiene?',
      step4Title: 'Which doctor or caregiver attended to you?',
      showStaff: true,
      showQuality: true,
      recoveryMessage: 'We deeply regret your experience fell short of 5 stars. Would you like our Medical Director to call you directly within 15 minutes to assist you offline?'
    }
  },

  cafe: {
    id: 'cafe',
    name: 'Specialty Cafes, Bakeries & Quick Bites',
    shortName: 'Cafes & Bakeries',
    flowType: 'micro', // 2-step ultra-fast micro flow
    badge: 'Micro-Flow (<15s) / High Velocity',
    questionCount: 2,
    description: 'Ultra-fast 2-step review capture for quick service cafes, coffee roasters, and takeaway bakeries. High completion rate under 15 seconds.',
    icon: 'coffee',
    onboarding: {
      businessNameLabel: 'Cafe / Roastery / Bakery Name',
      businessNamePlaceholder: 'e.g. The Roastery Artisan Cafe',
      ownerNameLabel: 'Founder / Head Barista Name',
      ownerNamePlaceholder: 'e.g. Shreyas Rao',
      customField1Label: 'Signature Menu Items',
      customField1Placeholder: 'e.g. Ethiopian Pour Over, Sourdough Croissant, Flat White',
      customField2Label: 'Counter POS System',
      customField2Placeholder: 'e.g. Petpooja POS, UrbanPiper, Manual Counter',
      defaultServices: ['Specialty Pour Over', 'Sourdough Croissant', 'Signature Cold Brew', 'Artisan Flat White', 'Avocado Toast'],
      defaultQualities: ['Rich Specialty Beans', 'Cozy Aesthetic Vibe', 'Super Fast Service', 'Great Work Ambience', 'Freshly Baked'],
      staffRole: 'Barista / Server',
      defaultStaff: ['Barista Shreyas', 'Coffee Team', 'Counter Staff']
    },
    qrFlow: {
      step1Title: 'How was your coffee & visit today?',
      step2Title: 'What did you enjoy most?', // Combines item + vibe into 1 tap
      showStaff: false, // Micro flow skips staff step for zero friction
      showQuality: false,
      recoveryMessage: 'We are truly sorry your experience wasn’t 5 stars! Would you like our manager to personally connect with you to make it right on your next coffee?'
    }
  },

  restaurant: {
    id: 'restaurant',
    name: 'Restaurants, Dining & Gastropubs',
    shortName: 'Dining & Restaurants',
    flowType: 'standard', // 3-step dining flow
    badge: 'Dining Flow / Table & Bill Presenter',
    questionCount: 3,
    description: 'Engineered for dining tables and leather bill presenters. Weaves food taste, culinary keywords, and server hospitality into Google Maps.',
    icon: 'utensils',
    onboarding: {
      businessNameLabel: 'Restaurant / Dining Lounge Name',
      businessNamePlaceholder: 'e.g. Saffron Bistro & Dining Bar',
      ownerNameLabel: 'Restaurateur / General Manager',
      ownerNamePlaceholder: 'e.g. Chef Kabir Mehra',
      customField1Label: 'Cuisine Specialty',
      customField1Placeholder: 'e.g. Modern Awadhi, Wood-Fired Italian, Pan-Asian',
      customField2Label: 'Floor Manager Direct Phone',
      customField2Placeholder: 'e.g. +91 98112 33445 (For instant table resolution)',
      defaultServices: ['Wood-Fired Pizza', 'Signature Biryani', 'Truffle Pasta', 'Cocktail Tasting', 'Sunday Brunch Buffet'],
      defaultQualities: ['Authentic Taste', 'Warm Hospitality', 'Vibrant Ambience', 'Quick Food Service', 'Great Music'],
      staffRole: 'Attending Server / Captain',
      defaultStaff: ['Captain Vikram', 'Server Rahul', 'Bar Team', 'Floor Staff']
    },
    qrFlow: {
      step1Title: 'How was your dining experience?',
      step2Title: 'Which signature dish or drink stood out?',
      step3Title: 'Which server or captain took care of your table?',
      showStaff: true,
      showQuality: false,
      recoveryMessage: 'We are sorry your dining experience fell short of 5 stars! Would you like our Floor Manager to stop by your table or call you directly to make this right?'
    }
  },

  salon: {
    id: 'salon',
    name: 'Hair Salons, Luxury Spas & Aesthetics',
    shortName: 'Salons & Spas',
    flowType: 'standard', // 3-step stylist flow
    badge: 'Stylist Flow / Mirror QR',
    questionCount: 3,
    description: 'Designed for mirror QR cards and receptionist checkouts. Attributes 5-star reviews to attending stylists with tip/bonus recognition.',
    icon: 'sparkles',
    onboarding: {
      businessNameLabel: 'Salon / Spa / Aesthetic Studio Name',
      businessNamePlaceholder: 'e.g. Bounce Hair Studio & Luxury Spa',
      ownerNameLabel: 'Creative Director / Salon Owner',
      ownerNamePlaceholder: 'e.g. Priya Sundaram',
      customField1Label: 'Hero Treatments',
      customField1Placeholder: 'e.g. Ash Blonde Balayage, Keratin Smoothening, Hydrafacial',
      customField2Label: 'Frontline Tipping Mode',
      customField2Placeholder: 'e.g. Direct UPI Ledger, Weekly Performance Bonus',
      defaultServices: ['Ash Blonde Balayage', 'Keratin Smoothening', 'Hydrafacial Glow', 'Ayurvedic Head Massage', 'Gel Nail Art'],
      defaultQualities: ['Flawless Finish', 'Relaxing Ambiance', 'Expert Color Consultation', 'Premium Products', 'Courteous Stylists'],
      staffRole: 'Attending Stylist / Colorist',
      defaultStaff: ['Senior Stylist Farhan', 'Colorist Neha', 'Aesthetician Deepa']
    },
    qrFlow: {
      step1Title: 'How was your styling session today?',
      step2Title: 'Which service or treatment did you get?',
      step3Title: 'Who was your attending stylist / colorist?',
      showStaff: true,
      showQuality: false,
      recoveryMessage: 'We are deeply concerned your salon visit wasn’t 5 stars. Would you like our Salon Director to call you directly to offer a complimentary touch-up?'
    }
  },

  gym: {
    id: 'gym',
    name: 'Gyms, CrossFit Boxes & Athletic Clubs',
    shortName: 'Gyms & Fitness',
    flowType: 'standard', // 3-step fitness flow
    badge: 'Fitness Flow / Turnstile & Locker Exit',
    questionCount: 3,
    description: 'Optimized for turnstile check-ins and locker room exits. Boosts coach attribution and emphasizes facility hygiene on Google Maps.',
    icon: 'activity',
    onboarding: {
      businessNameLabel: 'Gym / Fitness Hub / Box Name',
      businessNamePlaceholder: 'e.g. IronVault Strength & CrossFit Club',
      ownerNameLabel: 'Head Coach / Club Founder',
      ownerNamePlaceholder: 'e.g. Coach Aryan Deshmukh',
      customField1Label: 'Training Focus',
      customField1Placeholder: 'e.g. Olympic Weightlifting, HIIT Conditioning, Functional Strength',
      customField2Label: 'Facility Highlights',
      customField2Placeholder: 'e.g. Rogue Barbells, Clean Showers, Dedicated Turf',
      defaultServices: ['Personal Coaching', 'Deadlift & Barbell Tech', 'HIIT Conditioning', 'Strength & Mobility', 'Nutrition Guidance'],
      defaultQualities: ['Spotless Cleanliness', 'Encouraging Community', 'Top-Tier Equipment', 'Knowledgeable Coaches', 'Great Workout Energy'],
      staffRole: 'Personal Trainer / Coach',
      defaultStaff: ['Coach Aryan', 'Coach Neha', 'Floor Trainer Team']
    },
    qrFlow: {
      step1Title: 'How was today’s workout?',
      step2Title: 'What training did you focus on today?',
      step3Title: 'Which trainer or coach guided your workout?',
      showStaff: true,
      showQuality: false,
      recoveryMessage: 'We take our training and facility standards seriously. Would you like our Head Coach to connect with you regarding your session feedback?'
    }
  },

  coaching: {
    id: 'coaching',
    name: 'Coaching Institutes & Academic Academies',
    shortName: 'Coaching & Education',
    flowType: 'trust', // 4-step academic trust flow
    badge: 'Academic Trust Flow / Student & Parent',
    questionCount: 4,
    description: 'Calibrated for student rank announcements, parent-teacher counseling desks, and competitive exam batches.',
    icon: 'book',
    onboarding: {
      businessNameLabel: 'Institute / Academy / Tuition Name',
      businessNamePlaceholder: 'e.g. Apex IIT-JEE & NEET Academy',
      ownerNameLabel: 'Director / Academic Dean',
      ownerNamePlaceholder: 'e.g. Prof. R. K. Verma',
      customField1Label: 'Target Competitive Exams',
      customField1Placeholder: 'e.g. JEE Advanced, NEET Biology, UPSC, Class 10/12 Boards',
      customField2Label: 'Academic Counseling Desk Phone',
      customField2Placeholder: 'e.g. +91 99001 22334 (Parent feedback hotline)',
      defaultServices: ['JEE Advanced Foundation', 'NEET Repeater Batch', 'Doubt Clearing Sessions', 'Class 12 Board Prep', 'Weekend Test Series'],
      defaultQualities: ['Concept Clarity', 'Dedicated Faculty Mentorship', 'Rigorous Test Series', 'Comprehensive Study Material', 'Individual Attention'],
      staffRole: 'Faculty Mentor / HOD',
      defaultStaff: ['Verma Sir (Physics)', 'Gupta Sir (Chemistry)', 'Dr. Sen (Biology)', 'Academic Mentor Team']
    },
    qrFlow: {
      step1Title: 'How was your learning experience?',
      step2Title: 'Which course or batch are you enrolled in?',
      step3Title: 'What academic benefit helped you most?',
      step4Title: 'Which faculty mentor or teacher guided you?',
      showStaff: true,
      showQuality: true,
      recoveryMessage: 'Academic excellence and student support are our core mission. Would you like our Academic Dean to discuss your feedback personally?'
    }
  },

  auto: {
    id: 'auto',
    name: 'Automotive Garages & Detailing Studios',
    shortName: 'Auto Repair & Detailing',
    flowType: 'standard', // 3-step service trust flow
    badge: 'Service Trust / Customer Lounge & Delivery',
    questionCount: 3,
    description: 'Designed for vehicle service handovers and detailing bays. Emphasizes estimate honesty, genuine parts, and master technician attribution.',
    icon: 'tool',
    onboarding: {
      businessNameLabel: 'Garage / Service Center / Detailing Name',
      businessNamePlaceholder: 'e.g. MotoCraft Multi-Brand Car Care',
      ownerNameLabel: 'Managing Partner / Workshop Head',
      ownerNamePlaceholder: 'e.g. Imran Khan',
      customField1Label: 'Core Services Offered',
      customField1Placeholder: 'e.g. Periodic Maintenance, Ceramic Coating, AC Repair, Dent/Paint',
      customField2Label: 'Workshop Manager Escalation Number',
      customField2Placeholder: 'e.g. +91 98455 66778',
      defaultServices: ['Periodic Service & Oil Change', 'Ceramic Paint Protection', 'Brake & Suspension Overhaul', 'AC Gas & Disinfection', 'Body Denting & Painting'],
      defaultQualities: ['Transparent Estimate', 'Genuine OEM Parts', 'On-Time Car Delivery', 'Clean Customer Lounge', 'Honest Mechanic Advice'],
      staffRole: 'Service Advisor / Master Technician',
      defaultStaff: ['Advisor Imran', 'Master Tech Rajesh', 'Detailing Specialist Ali']
    },
    qrFlow: {
      step1Title: 'How was your vehicle service experience?',
      step2Title: 'Which service or repair was performed today?',
      step3Title: 'Which service advisor or technician handled your car?',
      showStaff: true,
      showQuality: false,
      recoveryMessage: 'Vehicle safety and estimate transparency are our top priorities. Would you like our Workshop Manager to call you right away regarding your car service?'
    }
  },

  hospitality: {
    id: 'hospitality',
    name: 'Hotels, Boutique Stays & Resorts',
    shortName: 'Hotels & Boutique Stays',
    flowType: 'standard', // 3-step guest flow
    badge: 'Guest Hospitality / Front Desk & Keycard Drop',
    questionCount: 3,
    description: 'Tailored for keycard checkouts, front-desk counters, and dining patios. Emphasizes room cleanliness, scenic view, and concierge warmth.',
    icon: 'home',
    onboarding: {
      businessNameLabel: 'Hotel / Resort / Heritage Stay Name',
      businessNamePlaceholder: 'e.g. The Tamara Mountain Resort & Spa',
      ownerNameLabel: 'General Manager / Property Host',
      ownerNamePlaceholder: 'e.g. Anand Mahindra / Reshma Sen',
      customField1Label: 'Property Highlights',
      customField1Placeholder: 'e.g. Infinity Pool, Farm-to-Table Breakfast, Mountain View Suite',
      customField2Label: 'Duty Manager Emergency Phone',
      customField2Placeholder: 'e.g. +91 97400 11223',
      defaultServices: ['Mountain View Suite', 'Farm-to-Table Breakfast', 'Spa & Wellness Treatment', 'Candlelight Dinner', 'Concierge Tour Guidance'],
      defaultQualities: ['Spotless Room Cleanliness', 'Warm Guest Hospitality', 'Scenic Natural Surroundings', 'Delicious Food Buffet', 'Smooth Fast Check-in'],
      staffRole: 'Concierge / Host Team Member',
      defaultStaff: ['Front Desk Team', 'Host Reshma', 'Chef Team', 'Housekeeping Staff']
    },
    qrFlow: {
      step1Title: 'How was your stay experience with us?',
      step2Title: 'What did you enjoy most about the property?',
      step3Title: 'Which team member or host made your stay special?',
      showStaff: true,
      showQuality: false,
      recoveryMessage: 'We deeply regret your stay fell short of 5 stars. Would you like our General Manager on duty to speak with you directly to assist you?'
    }
  }
};

function getVerticalConfig(verticalId = 'clinic') {
  if (!verticalId) return VERTICAL_PROFILES['clinic'];
  const key = String(verticalId).toLowerCase().trim();
  const aliasMap = {
    clinics: 'clinic',
    doctor: 'clinic',
    dental: 'clinic',
    healthcare: 'clinic',
    cafes: 'cafe',
    bakery: 'cafe',
    bakeries: 'cafe',
    coffee: 'cafe',
    restaurants: 'restaurant',
    dining: 'restaurant',
    food: 'restaurant',
    salons: 'salon',
    spa: 'salon',
    spas: 'salon',
    gyms: 'gym',
    fitness: 'gym',
    crossfit: 'gym',
    coaching: 'coaching',
    academy: 'coaching',
    education: 'coaching',
    school: 'coaching',
    classes: 'coaching',
    auto: 'auto',
    garage: 'auto',
    mechanic: 'auto',
    detailing: 'auto',
    hospitality: 'hospitality',
    hotel: 'hospitality',
    hotels: 'hospitality',
    resort: 'hospitality'
  };
  const resolved = aliasMap[key] || key;
  return VERTICAL_PROFILES[resolved] || VERTICAL_PROFILES['clinic'];
}

function generateVerticalReviewDraft(verticalId, submission, businessName) {
  const cfg = getVerticalConfig(verticalId);
  const vId = cfg.id;
  const rating = submission.rating || 5;
  const services = Array.isArray(submission.selectedServices) && submission.selectedServices.length > 0
    ? submission.selectedServices.join(', ')
    : 'services';
  const staff = submission.staffName && submission.staffName !== 'Our Team' ? submission.staffName : '';
  const lang = submission.language || 'hi-en';
  const qualities = Array.isArray(submission.qualityTags) && submission.qualityTags.length > 0
    ? submission.qualityTags.join(' and ')
    : 'great';

  // 1. CAFE (Micro Flow - Short, Punchy, High Energy)
  if (vId === 'cafe') {
    if (lang === 'hi-en') {
      return `Loved the vibe at ${businessName}! Had the ${services}. Quality ekdum top-notch thi aur service super fast. Indiranagar me coffee lovers ke liye best spot!`;
    }
    if (lang === 'hi') {
      return `${businessName} में बहुत अच्छा अनुभव रहा! ${services} का स्वाद बेहतरीन था और कैफे का माहौल बहुत सुखद था।`;
    }
    return `Great experience at ${businessName}! The ${services} was absolutely fantastic and served quickly. Cozy ambiance and great coffee!`;
  }

  // 2. CLINIC (Deep Trust Flow - Professional, Sterile, Painless)
  if (vId === 'clinic') {
    const docMention = staff ? ` Special thanks to ${staff} for being extremely patient and explaining the procedure clearly.` : '';
    if (lang === 'hi-en') {
      return `Visited ${businessName} for ${services}. Experience bohot painless aur comfortable tha.${docMention} Clinic hygiene aur sterilization 10/10 hai. Highly recommended!`;
    }
    if (lang === 'hi') {
      return `${businessName} में ${services} के लिए परामर्श लिया। उपचार बिल्कुल दर्द-रहित और सुरक्षित रहा।${docMention ? ` ${staff} का व्यवहार बहुत संवेदनशील और सराहनीय था।` : ''} क्लिनिक की स्वच्छता उत्कृष्ट है।`;
    }
    return `Consulted ${businessName} for ${services}. The procedure was completely painless and carried out with highest clinical sterility.${docMention} Highly recommended for trusted healthcare!`;
  }

  // 3. RESTAURANT (Dining Flow - Food taste, Ambience, Server)
  if (vId === 'restaurant') {
    const serverMention = staff ? ` Attending service by ${staff} was prompt and courteous.` : '';
    if (lang === 'hi-en') {
      return `Had an amazing dinner at ${businessName}! Tried their ${services} - taste bohot authentic aur fresh tha.${serverMention} Ambience is perfect for family and friends.`;
    }
    if (lang === 'hi') {
      return `${businessName} में भोजन का अनुभव शानदार रहा! ${services} बहुत स्वादिष्ट था। वातावरण और सेवा दोनों बेहतरीन रहे।`;
    }
    return `Fantastic dining experience at ${businessName}. The ${services} was prepared to perfection with rich flavors.${serverMention} Definitely coming back again!`;
  }

  // 4. SALON (Stylist Flow - Transformation, Balayage, Vibe)
  if (vId === 'salon') {
    const stylistMention = staff ? ` Huge shoutout to ${staff} for the perfect styling and consultation!` : '';
    if (lang === 'hi-en') {
      return `Visited ${businessName} for ${services}. Hair & skin feel amazing!${stylistMention} The salon ambiance is super clean and luxurious. 5 stars!`;
    }
    if (lang === 'hi') {
      return `${businessName} में ${services} की सेवा ली। परिणाम बहुत आकर्षक और संतोषजनक रहा। स्टाफ बहुत कुशल और विनम्र है।`;
    }
    return `Superb session at ${businessName} for ${services}. Great consultation and flawless execution.${stylistMention} The salon is clean, luxurious, and welcoming.`;
  }

  // 5. GYM (Fitness Flow - Workout, Coach, Community)
  if (vId === 'gym') {
    const coachMention = staff ? ` Special shoutout to ${staff} for technique corrections and motivation.` : '';
    if (lang === 'hi-en') {
      return `Working out at ${businessName} has been a game-changer! Great sessions for ${services}.${coachMention} Equipment is top-tier and gym hygiene is spotless.`;
    }
    if (lang === 'hi') {
      return `${businessName} का फिटनेस वातावरण बहुत ऊर्जावान है। ${services} में कोच का मार्गदर्शन बहुत उपयोगी रहा। सभी उपकरण आधुनिक हैं।`;
    }
    return `Incredible training atmosphere at ${businessName}. Focus on ${services} has improved my strength and form.${coachMention} Highly recommend this facility!`;
  }

  // 6. COACHING (Academic Flow - Concept clarity, Exam prep)
  if (vId === 'coaching') {
    const facultyMention = staff ? ` Deep gratitude to ${staff} for personalized mentorship and doubt clearing.` : '';
    if (lang === 'hi-en') {
      return `Enrolled at ${businessName} for ${services}. Concept clarity aur test series bohot strong hai.${facultyMention} Best academy for serious exam preparation!`;
    }
    if (lang === 'hi') {
      return `${businessName} में ${services} की तैयारी बहुत उत्कृष्ट रही। शिक्षकों का मार्गदर्शन और अध्ययन सामग्री परीक्षा के लिए अत्यंत उपयोगी है।`;
    }
    return `Exceptional academic guidance at ${businessName} for ${services}. The concept depth, regular mock tests, and mentorship have helped tremendously.${facultyMention}`;
  }

  // 7. AUTO (Service Trust - Transparency, Parts, Advisor)
  if (vId === 'auto') {
    const techMention = staff ? ` Service Advisor ${staff} gave an upfront transparent estimate with no hidden costs.` : '';
    if (lang === 'hi-en') {
      return `Got my vehicle serviced at ${businessName} for ${services}. Workmanship bohot professional tha.${techMention} Car feels as good as new. Genuine parts and on-time delivery!`;
    }
    if (lang === 'hi') {
      return `${businessName} में वाहन की ${services} कराई। कार्य अत्यंत संतोषजनक और समय पर पूरा हुआ। सभी शुल्क पारदर्शी रहे।`;
    }
    return `Very satisfied with ${businessName} for ${services}. Complete transparency on parts and pricing.${techMention} Vehicle running smooth and delivered right on time!`;
  }

  // 8. HOSPITALITY (Hotel Flow - Comfort, Scenic, Concierge)
  if (vId === 'hospitality') {
    const teamMention = staff ? ` Attentive hospitality from ${staff} made our trip memorable.` : '';
    if (lang === 'hi-en') {
      return `Had a wonderful stay at ${businessName}! The ${services} was highlight of our trip.${teamMention} Rooms were spotless and scenic views are breathtaking.`;
    }
    if (lang === 'hi') {
      return `${businessName} में प्रवास का अनुभव अत्यंत सुखद रहा। स्वच्छता, भोजन और सेवा सभी पांच सितारा गुणवत्ता के रहे।`;
    }
    return `Memorable stay at ${businessName}. Loved the ${services} and peaceful setting.${teamMention} Staff was warm and welcoming throughout our stay.`;
  }

  // Generic fallback
  return `Had a great experience at ${businessName} for ${services}. The service was genuinely ${qualities}. Highly recommended!`;
}

module.exports = {
  VERTICAL_PROFILES,
  getVerticalConfig,
  generateVerticalReviewDraft
};
