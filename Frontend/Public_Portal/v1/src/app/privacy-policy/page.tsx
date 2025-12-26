import { Header, Footer } from '@/components';
import Icon from '@/components/ui/Icon';

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-40 pb-16 lg:pt-48 lg:pb-24">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-hakiardhi-red/10 rounded-xl flex items-center justify-center">
              <Icon name="shield-check" size="lg" className="text-hakiardhi-red" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-gray-900">Privacy Policy</h1>
          </div>
          <p className="text-lg text-gray-600">
            Last Updated: November 21, 2025
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          {/* Introduction */}
          <section className="mb-10">
            <h2 className="text-2xl font-black text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              HakiArdhi (Land Rights Research & Resources Institute) ("we," "us," or "our") is committed to protecting your privacy and personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services.
            </p>
            <p className="text-gray-700 leading-relaxed">
              By accessing or using our services, you agree to this Privacy Policy. If you do not agree with our policies and practices, please do not use our services.
            </p>
          </section>

          {/* Information We Collect */}
          <section className="mb-10">
            <h2 className="text-2xl font-black text-gray-900 mb-4">2. Information We Collect</h2>

            <h3 className="text-xl font-bold text-gray-900 mb-3">2.1 Personal Information</h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              We may collect personal information that you voluntarily provide to us, including:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
              <li>Name and contact information (email address, phone number, mailing address)</li>
              <li>Demographic information (age, gender, location)</li>
              <li>Information provided when requesting legal aid or services</li>
              <li>Donation and payment information (processed through secure third-party providers)</li>
              <li>Employment information when applying for positions</li>
              <li>Newsletter subscription preferences</li>
            </ul>

            <h3 className="text-xl font-bold text-gray-900 mb-3">2.2 Automatically Collected Information</h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              When you visit our website, we may automatically collect:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
              <li>IP address and browser type</li>
              <li>Device information and operating system</li>
              <li>Pages visited and time spent on our website</li>
              <li>Referring website addresses</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </section>

          {/* How We Use Your Information */}
          <section className="mb-10">
            <h2 className="text-2xl font-black text-gray-900 mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
              <li>Provide and improve our services, including legal aid and advocacy</li>
              <li>Respond to inquiries and support requests</li>
              <li>Process donations and issue receipts</li>
              <li>Send newsletters and communications about our work (with your consent)</li>
              <li>Analyze website usage and improve user experience</li>
              <li>Comply with legal obligations and protect our rights</li>
              <li>Conduct research and produce reports on land rights issues</li>
            </ul>
          </section>

          {/* Information Sharing */}
          <section className="mb-10">
            <h2 className="text-2xl font-black text-gray-900 mb-4">4. Information Sharing and Disclosure</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              We do not sell, trade, or rent your personal information. We may share your information only in the following circumstances:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
              <li><strong>Service Providers:</strong> Trusted third-party service providers who assist in operating our website, processing payments, or delivering services (under strict confidentiality agreements)</li>
              <li><strong>Legal Requirements:</strong> When required by law, court order, or legal process</li>
              <li><strong>Protection of Rights:</strong> To protect our rights, property, or safety, or that of our users or the public</li>
              <li><strong>Partners:</strong> With partner organizations when collaborating on projects, with your explicit consent</li>
              <li><strong>Anonymized Data:</strong> Aggregated, anonymized data for research, reporting, or advocacy purposes</li>
            </ul>
          </section>

          {/* Data Security */}
          <section className="mb-10">
            <h2 className="text-2xl font-black text-gray-900 mb-4">5. Data Security</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
              <li>Encryption of sensitive data in transit and at rest</li>
              <li>Regular security assessments and updates</li>
              <li>Access controls and authentication procedures</li>
              <li>Staff training on data protection and privacy</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
            </p>
          </section>

          {/* Your Rights */}
          <section className="mb-10">
            <h2 className="text-2xl font-black text-gray-900 mb-4">6. Your Rights</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              You have the following rights regarding your personal information:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
              <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
              <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
              <li><strong>Deletion:</strong> Request deletion of your personal information (subject to legal obligations)</li>
              <li><strong>Objection:</strong> Object to processing of your personal information for certain purposes</li>
              <li><strong>Withdrawal of Consent:</strong> Withdraw consent for marketing communications at any time</li>
              <li><strong>Data Portability:</strong> Request transfer of your data to another organization</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              To exercise these rights, please contact us at <a href="mailto:info@hakiardhi.or.tz" className="text-hakiardhi-red hover:underline">info@hakiardhi.or.tz</a>.
            </p>
          </section>

          {/* Children's Privacy */}
          <section className="mb-10">
            <h2 className="text-2xl font-black text-gray-900 mb-4">7. Children's Privacy</h2>
            <p className="text-gray-700 leading-relaxed">
              Our services are not directed to individuals under the age of 18. We do not knowingly collect personal information from children. If you believe we have inadvertently collected information from a child, please contact us immediately.
            </p>
          </section>

          {/* International Transfers */}
          <section className="mb-10">
            <h2 className="text-2xl font-black text-gray-900 mb-4">8. International Data Transfers</h2>
            <p className="text-gray-700 leading-relaxed">
              HakiArdhi is based in Tanzania. If you are accessing our services from outside Tanzania, your information may be transferred to, stored, and processed in Tanzania or other countries. We ensure appropriate safeguards are in place for such transfers.
            </p>
          </section>

          {/* Cookies */}
          <section className="mb-10">
            <h2 className="text-2xl font-black text-gray-900 mb-4">9. Cookies and Tracking Technologies</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              We use cookies and similar tracking technologies to enhance your experience. You can control cookies through your browser settings. For more information, please see our <a href="/cookie-policy" className="text-hakiardhi-red hover:underline">Cookie Policy</a>.
            </p>
          </section>

          {/* Changes to Policy */}
          <section className="mb-10">
            <h2 className="text-2xl font-black text-gray-900 mb-4">10. Changes to This Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the new policy on our website with an updated "Last Updated" date. Your continued use of our services after such changes constitutes acceptance of the updated policy.
            </p>
          </section>

          {/* Contact */}
          <section className="mb-10">
            <h2 className="text-2xl font-black text-gray-900 mb-4">11. Contact Us</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have questions, concerns, or requests regarding this Privacy Policy or our privacy practices, please contact us:
            </p>
            <div className="bg-gray-50 p-6 rounded-xl border-l-4 border-hakiardhi-red">
              <p className="font-bold text-gray-900 mb-2">HakiArdhi</p>
              <p className="text-gray-700">Land Rights Research & Resources Institute</p>
              <p className="text-gray-700">Email: <a href="mailto:info@hakiardhi.or.tz" className="text-hakiardhi-red hover:underline">info@hakiardhi.or.tz</a></p>
              <p className="text-gray-700">Phone: 0800 711 555</p>
              <p className="text-gray-700">Address: Dar es Salaam, Tanzania</p>
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </main>
  );
}
