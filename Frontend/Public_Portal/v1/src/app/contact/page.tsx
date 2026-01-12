import { Header, Footer, DonorsSection, ContactForm } from '@/components';
import Section from '@/components/ui/Section';
import Grid from '@/components/ui/Grid';
import Card from '@/components/ui/Card';
import Icon from '@/components/ui/Icon';
import SectionHeader from '@/components/features/SectionHeader';
import { SPACING, TYPOGRAPHY } from '@/constants/design-tokens';

export const metadata = {
  title: 'Contact Us | HakiArdhi',
  description:
    'Get in touch with HakiArdhi for land rights inquiries, legal aid requests, partnerships, or general questions. We\'re here to help communities protect their land rights.',
  keywords: ['contact', 'legal aid', 'land rights assistance', 'Tanzania', 'HakiArdhi contact'],
};

export default function ContactPage() {
  const contactMethods = [
    {
      icon: 'map-pin',
      title: 'Visit Us',
      subtitle: 'Our Office Location',
      lines: ['Plot 2/3, Kijitonyama', 'Mwai Kibaki Road', 'Dar es Salaam, Tanzania'],
      action: {
        label: 'Get Directions',
        href: 'https://maps.google.com/?q=HakiArdhi+Dar+es+Salaam',
      },
    },
    {
      icon: 'phone',
      title: 'Call or Email',
      subtitle: 'Reach Our Team',
      lines: ['+255 784 646 752', '+255 22 277 3034', 'info@hakiardhi.or.tz'],
      action: {
        label: 'Send Email',
        href: 'mailto:info@hakiardhi.or.tz',
      },
    },
    {
      icon: 'clock',
      title: 'Working Hours',
      subtitle: 'When We\'re Available',
      lines: ['Monday - Friday: 08:00 - 17:00', 'Saturday: Closed', 'Sunday & Public Holidays: Closed'],
    },
  ];

  const faqs = [
    {
      question: 'How quickly will I get a response?',
      answer:
        'We aim to respond to all inquiries within 24-48 hours during working days. Urgent legal aid requests are prioritized and typically receive a response within 24 hours.',
    },
    {
      question: 'Do you provide free legal aid?',
      answer:
        'Yes, we provide free legal aid and counseling to qualifying individuals and communities. Please visit our Legal Aid page or contact us directly to learn about eligibility criteria.',
    },
    {
      question: 'How can I partner with HakiArdhi?',
      answer:
        'We welcome partnerships with organizations that share our vision. Please select "Partnership Opportunity" as your inquiry type and provide details about your organization and proposed collaboration.',
    },
    {
      question: 'Are you currently hiring?',
      answer:
        'Job opportunities are posted on our website when available. You can also submit your CV and cover letter through this contact form by selecting "Employment Inquiry" as your subject.',
    },
  ];

  return (
    <main id="main-content" className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <Section variant="white" spacing="xs" className="pt-44 lg:pt-48 pb-8">
        <Section.Content>
          <div className="text-center max-w-4xl mx-auto">
            <h1 className={`${TYPOGRAPHY.heading.h1.size} ${TYPOGRAPHY.heading.h1.weight} text-gray-900 mb-6`}>
              Get in Touch
            </h1>
            <p className={`${TYPOGRAPHY.body.lg.size} text-gray-600 ${TYPOGRAPHY.body.lg.lineHeight}`}>
              Have questions about land rights? Need legal assistance? Want to partner with us?
              We're here to help. Reach out to our team today.
            </p>
          </div>
        </Section.Content>
      </Section>

      {/* Contact Methods Section */}
      <Section variant="light" spacing="lg">
        <Section.Content>
          <SectionHeader
            title="Contact Information"
            description="Multiple ways to reach our team"
            align="center"
          />

          <Grid cols={{ base: 1, md: 3 }} gap="lg">
            {contactMethods.map((method, index) => (
              <div
                key={method.title}
                className="opacity-0 animate-fade-in"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animationFillMode: 'forwards',
                }}
              >
                <Card variant="elevated" hoverEffect="lift" className="h-full">
                  <Card.Body className="p-6 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-hakiardhi-red to-red-600 rounded-full flex items-center justify-center">
                      <Icon name={method.icon as any} size="xl" className="text-white" />
                    </div>
                    <h3 className={`${TYPOGRAPHY.heading.h4.size} ${TYPOGRAPHY.heading.h4.weight} text-gray-900 mb-2`}>
                      {method.title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">{method.subtitle}</p>
                    <div className="space-y-2 mb-6">
                      {method.lines.map((line, idx) => (
                        <p key={idx} className="text-sm text-gray-600">
                          {line}
                        </p>
                      ))}
                    </div>
                    {method.action && (
                      <a
                        href={method.action.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 min-h-[44px] bg-hakiardhi-red text-white rounded-lg text-sm font-semibold hover:bg-black transition-all duration-300 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hakiardhi-red focus-visible:ring-offset-2"
                      >
                        {method.action.label}
                        <Icon name="arrow-right" size="sm" />
                      </a>
                    )}
                  </Card.Body>
                </Card>
              </div>
            ))}
          </Grid>
        </Section.Content>
      </Section>

      {/* Contact Form & Map Section */}
      <section className="hakiardhi-section bg-gray-50 relative overflow-hidden">
        {/* Decorative gradient orbs */}
        <div className="absolute top-0 left-1/4 w-80 h-80 bg-gradient-to-br from-orange-500/10 to-brand-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-brand-500/10 to-success-500/10 rounded-full blur-3xl"></div>

        <div className="hakiardhi-container relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Contact Form */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className={`${TYPOGRAPHY.heading.h2.size} ${TYPOGRAPHY.heading.h2.weight} text-gray-900 mb-3`}>
                Send Us a Message
              </h2>
              <p className="text-gray-600 mb-6">
                Fill out the form below and our team will get back to you within 24-48 hours.
              </p>
              <ContactForm />
            </div>

            {/* Map & Info */}
            <div>
              <div className="bg-white rounded-2xl p-8 shadow-lg mb-6">
                <h2 className={`${TYPOGRAPHY.heading.h2.size} ${TYPOGRAPHY.heading.h2.weight} text-gray-900 mb-6`}>
                  Find Us
                </h2>

                <div className="relative h-[400px] rounded-xl overflow-hidden mb-6">
                  {/* Placeholder for Google Maps */}
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                    <div className="text-center">
                      <Icon name="map-pin" size="xl" className="text-hakiardhi-red mx-auto mb-4" />
                      <p className="text-gray-700 font-semibold mb-2">HakiArdhi Office</p>
                      <p className="text-gray-600 text-sm mb-4">Kijitonyama, Dar es Salaam</p>
                      <a
                        href="https://maps.google.com/?q=HakiArdhi+Dar+es+Salaam"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-hakiardhi-red text-white rounded-lg font-semibold hover:bg-black transition-colors"
                      >
                        <Icon name="map-pin" size="sm" />
                        Open in Google Maps
                      </a>
                    </div>
                  </div>

                  {/* Actual Google Maps Embed (Uncomment and add coordinates) */}
                  {/* <iframe
                    title="HakiArdhi Office Location"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d..."
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  /> */}
                </div>

                {/* Quick Contact Info */}
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <Icon name="map-pin" size="sm" className="text-hakiardhi-red flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-gray-900 text-sm mb-1">Address</p>
                      <p className="text-sm text-gray-600">Plot 2/3, Kijitonyama, Mwai Kibaki Road</p>
                      <p className="text-sm text-gray-600">Dar es Salaam, Tanzania</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <Icon name="phone" size="sm" className="text-hakiardhi-red flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-gray-900 text-sm mb-1">Phone</p>
                      <p className="text-sm text-gray-600">+255 784 646 752</p>
                      <p className="text-sm text-gray-600">+255 22 277 3034</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <Icon name="mail" size="sm" className="text-hakiardhi-red flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-gray-900 text-sm mb-1">Email</p>
                      <p className="text-sm text-gray-600">info@hakiardhi.or.tz</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <Section variant="white" spacing="lg">
        <Section.Content>
          <div className="max-w-4xl mx-auto">
            <SectionHeader
              title="Frequently Asked Questions"
              description="Quick answers to common questions about contacting us"
              align="center"
            />

            <div className="space-y-4 mt-8">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="opacity-0 animate-fade-in"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animationFillMode: 'forwards',
                  }}
                >
                  <Card variant="elevated" className="hover:shadow-lg transition-shadow duration-300">
                    <Card.Body className="p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-start gap-3">
                        <Icon name="alert-circle" size="sm" className="text-hakiardhi-red flex-shrink-0 mt-1" />
                        {faq.question}
                      </h3>
                      <p className="text-gray-600 leading-relaxed pl-8">{faq.answer}</p>
                    </Card.Body>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </Section.Content>
      </Section>

      {/* Emergency Contact Banner */}
      <section className="relative py-16 lg:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-hakiardhi-red to-red-700"></div>
        <div className="absolute inset-0 bg-[url('/images/hero_1.JPG')] opacity-10 bg-cover bg-center"></div>

        <div className="hakiardhi-container relative z-10">
          <div className="max-w-3xl mx-auto text-center text-white">
            <div className="w-20 h-20 mx-auto mb-6 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <Icon name="phone" size="xl" className="text-white" />
            </div>
            <h2 className={`${TYPOGRAPHY.heading.h2.size} ${TYPOGRAPHY.heading.h2.weight} text-white mb-4`}>
              Need Urgent Legal Assistance?
            </h2>
            <p className={`${TYPOGRAPHY.body.lg.size} mb-6 text-white/90`}>
              If you need immediate legal aid related to land rights, call our toll-free hotline
            </p>
            <a
              href="tel:0800711555"
              className="inline-flex items-center gap-3 px-8 py-4 min-h-[56px] bg-white !text-hakiardhi-red rounded-full text-base sm:text-lg md:text-xl lg:text-2xl font-bold hover:bg-black hover:!text-white transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-hakiardhi-red"
            >
              <Icon name="phone" size="lg" className="!text-hakiardhi-red" />
              0 800 711 555
            </a>
            <p className={`${TYPOGRAPHY.body.sm.size} mt-4 text-white/75`}>
              Available Monday - Friday, 08:00 - 17:00
            </p>
          </div>
        </div>
      </section>

      {/* Donors Section */}
      <DonorsSection />

      <Footer />
    </main>
  );
}
