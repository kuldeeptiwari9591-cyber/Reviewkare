const fs = require('fs');
const path = require('path');
const storePath = path.join(__dirname, 'store.json');
const store = JSON.parse(fs.readFileSync(storePath, 'utf8'));

store.servicesByVertical = {
  clinic: ['Painless Root Canal', 'Clear Aligners', 'Dental Implants', 'Teeth Whitening', 'Laser Gum Care', 'General Dental Checkup'],
  cafe: ['Single-Origin Pour Over', 'Flaky Almond Croissant', 'Natural Sourdough Bread', 'Cold Brew Tonic', 'Avocado Sourdough Toast', 'Matcha Latte'],
  salon: ['Balayage Hair Color', 'Keratin Smoothing Therapy', 'Precision Scalp Fade', 'Hydra Facial Glow', 'Olaplex Hair Spa', 'Bridal Styling'],
  gym: ['Strength & Conditioning', 'Olympic Weightlifting', 'Powerlifting Squat & Bench', 'CrossFit MetCon HIIT', 'Personal Coaching', 'Mobility & Recovery']
};

store.qualityTagsByVertical = {
  clinic: ['Painless Treatment', 'Sterile Operatory', 'Explained Every Step', 'Zero Wait Time', 'Gentle Doctors'],
  cafe: ['Rich Roasting Notes', 'Flaky Warm Pastries', 'Quiet Aesthetic Vibe', 'Blazing Fast Wi-Fi', 'Attentive Baristas'],
  salon: ['Exact Color Match', 'Silky Smooth Finish', 'Relaxing Scalp Massage', 'Luxury Product Scent', 'Expert Consultation'],
  gym: ['Strict Form Cues', 'Immaculate Heavy Barbells', 'Supportive High-Energy Tribe', 'Progressive Overload', 'Clean Locker Rooms']
};

store.posIntegrations = [
  {
    provider: 'petpooja',
    name: 'Petpooja POS for Restaurants',
    status: 'connected',
    outletId: 'PP-IND-8041',
    outletName: 'The Roastery Artisan Cafe (12th Main)',
    webhookUrl: '/api/webhooks/pos/petpooja',
    eventsCaptured: 418,
    lastSync: '3 mins ago',
    autoTriggerDelay: '45 mins post-bill'
  },
  {
    provider: 'zenoti',
    name: 'Zenoti Salon & Medspa Software',
    status: 'connected',
    outletId: 'ZEN-LAVELLE-02',
    outletName: 'Bounce Hair Studio & Luxury Spa',
    webhookUrl: '/api/webhooks/pos/zenoti',
    eventsCaptured: 231,
    lastSync: '14 mins ago',
    autoTriggerDelay: 'Next morning 10:00 AM'
  },
  {
    provider: 'practo',
    name: 'Practo Ray Practice Management',
    status: 'connected',
    outletId: 'PRAC-100FT-901',
    outletName: 'Dr. Sharma Dental & Implant Clinic',
    webhookUrl: '/api/webhooks/pos/practo',
    eventsCaptured: 195,
    lastSync: '1 hour ago',
    autoTriggerDelay: '2 hours post-treatment'
  }
];

store.whatsappStudio = {
  status: 'connected',
  wabaId: 'WABA_992014881023',
  phoneNumber: '+91 80 4112 9088',
  verifiedName: 'Replyo Official Cloud Verified',
  metaCompliance: 'Meta Graph API v21.0 Live',
  templates: [
    {
      id: 'tpl_clinic_2h',
      vertical: 'clinic',
      name: 'clinic_post_consult_v2',
      header: 'Dr. Sharma Dental & Implant Clinic',
      bodyText: "Hi {{1}}, hope your tooth is feeling much better after today's {{2}} with {{3}}! If you have 20 seconds, could you share a quick review on Google Maps to help others in {{4}} find quality dental care?",
      buttonText: '⭐ 20-Second Review Copilot',
      delay: '120 mins',
      openRate: '96.4%',
      clickRate: '44.2%'
    },
    {
      id: 'tpl_cafe_45m',
      vertical: 'cafe',
      name: 'cafe_bill_settled_v1',
      header: 'The Roastery Artisan Cafe',
      bodyText: "Hi {{1}}, thank you for spending your day with us at The Roastery! How was the {{2}} served by {{3}} today? Tap below to leave a 15-second Google review and support our barista team!",
      buttonText: '☕ Rate The Roastery on Maps',
      delay: '45 mins',
      openRate: '98.1%',
      clickRate: '52.8%'
    },
    {
      id: 'tpl_salon_nextday',
      vertical: 'salon',
      name: 'salon_followup_glow',
      header: 'Bounce Hair Studio & Spa',
      bodyText: 'Hi {{1}}, hope you are loving your new {{2}} by {{3}}! If you love the result, tap below to share your experience on Google Maps.',
      buttonText: '✨ Share Your Style Review',
      delay: 'Next morning',
      openRate: '95.0%',
      clickRate: '39.1%'
    },
    {
      id: 'tpl_gym_milestone',
      vertical: 'gym',
      name: 'gym_workout_milestone',
      header: 'IronVault Strength & Conditioning',
      bodyText: 'Huge session today {{1}}! That {{2}} session with Coach {{3}} was intense. Mind giving a shoutout to the IronVault tribe on Google Maps?',
      buttonText: '💪 Rate IronVault on Google',
      delay: '30 mins',
      openRate: '94.8%',
      clickRate: '48.5%'
    }
  ]
};

store.disputes = [
  {
    id: 'disp_01',
    businessId: 'b_clinic',
    reviewerName: 'Anand S. (New Profile, 1 review)',
    rating: 1,
    reviewText: 'Worst clinic in Indiranagar. Scammers charging 10x market rate. Go to my dental clinic down the road instead.',
    violationType: 'Conflict of Interest & Competitor Smear Attack',
    googlePolicySection: 'Maps User Content Policy § 3.2 - Fake Engagement & Deceptive Content',
    status: 'ready_to_file',
    evidenceScore: '98% Policy Breach Probability',
    dossier: 'Account created same day with 0 prior local reviews. Explicit promotional solicitation for competing clinic violates FTC 16 CFR Part 465 and Google Maps Conflict of Interest Policy.'
  },
  {
    id: 'disp_02',
    businessId: 'b_cafe',
    reviewerName: 'Ex-Server Vikram',
    rating: 1,
    reviewText: 'Management is terrible, rude owners, do not eat here.',
    violationType: 'Former Employee Retaliation',
    googlePolicySection: 'Google GBP Policy § 1.4 - Conflict of Interest (Current/Former Employees)',
    status: 'ready_to_file',
    evidenceScore: '94% Policy Breach Probability',
    dossier: 'Reviewer identified as former employee terminated on 12th Oct 2026. Reviews by current or former employees are strictly prohibited under Google Conflict of Interest guidelines.'
  }
];

store.sentimentAspects = [
  { aspect: 'Staff Courtesy & Care', score: 98, mentions: 184, trend: '+12%', status: 'exceptional' },
  { aspect: 'Service & Clinical Outcome', score: 96, mentions: 142, trend: '+8%', status: 'exceptional' },
  { aspect: 'Hygiene & Sterilization', score: 97, mentions: 126, trend: '+5%', status: 'exceptional' },
  { aspect: 'Ambience & Atmosphere', score: 92, mentions: 94, trend: '+4%', status: 'healthy' },
  { aspect: 'Wait Times & Punctuality', score: 86, mentions: 68, trend: '-2%', status: 'attention_needed' },
  { aspect: 'Billing Transparency', score: 91, mentions: 53, trend: '+3%', status: 'healthy' }
];

store.hardwareCatalog = [
  { id: 'hw_acrylic', name: 'Minimalist Countertop Acrylic Stand', price: '₹1,499', material: 'Laser-etched high-gloss acrylic with embedded NTAG213 NFC chip', leadTime: '2-3 business days' },
  { id: 'hw_gold', name: 'Brushed Gold Brass Executive Stand', price: '₹2,499', material: 'Solid anodized brushed gold metal with dual-frequency NFC + UV QR', leadTime: '3-4 business days' },
  { id: 'hw_walnut', name: 'Artisanal American Walnut Stand', price: '₹1,999', material: 'Hand-finished organic walnut wood with concealed high-range NFC antenna', leadTime: '3-4 business days' },
  { id: 'hw_billcard', name: 'Leatherette Bill-Folder Tap Cards (Pack of 10)', price: '₹2,999', material: 'Waterproof matte PVC cards engineered for cafe & restaurant check folders', leadTime: '2 business days' }
];

fs.writeFileSync(storePath, JSON.stringify(store, null, 2), 'utf8');
console.log('Successfully enriched store.json with enterprise modules!');
