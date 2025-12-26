import {
  Header,
  HeroSection,
  ImpactBanner,
  OurStorySection,
  TestimonialsSection,
  AIChatbotBanner,
  ProgramsGallerySection,
  HowYouCanHelpSection,
  NewsPublicNoticeSection,
  DonorsSection,
  Footer,
} from '@/components';

export default function Home() {
  return (
    <main id="main-content" className="min-h-screen bg-white">
      <Header />

      {/* 1. HERO - Stunning imagery with powerful headline */}
      <HeroSection />

      {/* 2. IMPACT AT A GLANCE - Immediate credibility with key stats (Light zinc) */}
      <ImpactBanner />

      {/* 3. OUR STORY - Problem → Solution → Why It Matters (White, visual-rich) */}
      <OurStorySection />

      {/* 4. SUCCESS STORIES - Testimonials from School of HakiArdhi & beneficiaries (Light zinc) */}
      <TestimonialsSection />

      {/* 5. AI CHATBOT BANNER - 24/7 Legal Aid via WhatsApp (Green theme) */}
      <AIChatbotBanner />

      {/* 6. PROGRAMS GALLERY - Visual showcase of interventions (Light, image-focused) */}
      <ProgramsGallerySection />

      {/* 7. HOW YOU CAN HELP - Donation CTAs & support options (White) */}
      <HowYouCanHelpSection />

      {/* 8. PARTNERS & TRUST SIGNALS - Donors, certifications (Light zinc) */}
      <DonorsSection />

      {/* 9. LATEST NEWS - Activity proof, transparency (White) */}
      <NewsPublicNoticeSection />

      <Footer />
    </main>
  );
}
