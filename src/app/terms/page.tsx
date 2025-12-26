import { Header, Footer } from '@/components';
import Icon from '@/components/ui/Icon';

export default function TermsOfUsePage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-40 pb-16 lg:pt-48 lg:pb-24">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-hakiardhi-red/10 rounded-xl flex items-center justify-center">
              <Icon name="file-text" size="lg" className="text-hakiardhi-red" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-gray-900">Terms of Use</h1>
          </div>
          <p className="text-lg text-gray-600">
            Last Updated: November 21, 2025
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          {/* Introduction */}
          <section className="mb-10">
            <h2 className="text-2xl font-black text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Welcome to HakiArdhi (Land Rights Research & Resources Institute). By accessing or using our website, services, and resources, you agree to be bound by these Terms of Use and all applicable laws and regulations.
            </p>
            <p className="text-gray-700 leading-relaxed">
              If you do not agree with any part of these terms, you must not use our services. We reserve the right to modify these terms at any time, and your continued use constitutes acceptance of those changes.
            </p>
          </section>

          {/* Use of Services */}
          <section className="mb-10">
            <h2 className="text-2xl font-black text-gray-900 mb-4">2. Use of Services</h2>

            <h3 className="text-xl font-bold text-gray-900 mb-3">2.1 Permitted Use</h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              You may use our services for lawful purposes only. You agree to use our resources, information, and services in accordance with:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
              <li>All applicable local, national, and international laws and regulations</li>
              <li>These Terms of Use and any additional terms applicable to specific services</li>
              <li>The rights of others and respect for human dignity</li>
              <li>Ethical standards appropriate for a land rights advocacy organization</li>
            </ul>

            <h3 className="text-xl font-bold text-gray-900 mb-3">2.2 Prohibited Activities</h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              You agree not to:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
              <li>Use our services for any unlawful purpose or to solicit unlawful activity</li>
              <li>Transmit any harmful code, viruses, or malicious software</li>
              <li>Attempt to gain unauthorized access to our systems or networks</li>
              <li>Impersonate HakiArdhi, our staff, or any other person or entity</li>
              <li>Interfere with or disrupt the integrity or performance of our services</li>
              <li>Collect or harvest personal information about other users</li>
              <li>Use automated systems to access our services without permission</li>
              <li>Reproduce, redistribute, or commercially exploit our content without authorization</li>
            </ul>
          </section>

          {/* Intellectual Property */}
          <section className="mb-10">
            <h2 className="text-2xl font-black text-gray-900 mb-4">3. Intellectual Property Rights</h2>

            <h3 className="text-xl font-bold text-gray-900 mb-3">3.1 Our Content</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              All content on this website, including text, graphics, logos, images, research papers, reports, and software, is the property of HakiArdhi or its content suppliers and is protected by copyright, trademark, and other intellectual property laws.
            </p>

            <h3 className="text-xl font-bold text-gray-900 mb-3">3.2 Limited License</h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              We grant you a limited, non-exclusive, non-transferable license to:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
              <li>Access and view content for personal, non-commercial use</li>
              <li>Download and print materials for educational or advocacy purposes (with proper attribution)</li>
              <li>Share our content through social media using provided sharing tools</li>
            </ul>

            <h3 className="text-xl font-bold text-gray-900 mb-3">3.3 Restrictions</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              You may not modify, reproduce, distribute, create derivative works, publicly display, or commercially exploit any content without our express written permission, except as permitted under applicable copyright law or these terms.
            </p>
          </section>

          {/* User Content */}
          <section className="mb-10">
            <h2 className="text-2xl font-black text-gray-900 mb-4">4. User-Generated Content</h2>

            <h3 className="text-xl font-bold text-gray-900 mb-3">4.1 Your Submissions</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you submit content to us (including comments, testimonials, stories, or other materials), you grant HakiArdhi a non-exclusive, royalty-free, perpetual, worldwide license to use, reproduce, modify, publish, and distribute such content for our organizational purposes.
            </p>

            <h3 className="text-xl font-bold text-gray-900 mb-3">4.2 Your Responsibility</h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              You represent and warrant that:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
              <li>You own or have the necessary rights to submit the content</li>
              <li>Your content does not violate any laws or third-party rights</li>
              <li>Your content is accurate and not misleading</li>
              <li>Your content does not contain defamatory, obscene, or offensive material</li>
            </ul>
          </section>

          {/* Legal Aid Services */}
          <section className="mb-10">
            <h2 className="text-2xl font-black text-gray-900 mb-4">5. Legal Aid and Professional Services</h2>

            <h3 className="text-xl font-bold text-gray-900 mb-3">5.1 Not Legal Advice</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Information provided on this website is for general educational purposes only and does not constitute legal advice. You should not rely on this information as a substitute for professional legal counsel. Always consult with a qualified attorney for advice on your specific situation.
            </p>

            <h3 className="text-xl font-bold text-gray-900 mb-3">5.2 No Attorney-Client Relationship</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Use of this website or communication with HakiArdhi staff does not create an attorney-client relationship. Such relationships are formed only through formal engagement and written agreement.
            </p>

            <h3 className="text-xl font-bold text-gray-900 mb-3">5.3 Service Availability</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Our legal aid services are subject to availability, eligibility criteria, and resource constraints. We reserve the right to decline cases based on our capacity, expertise, or organizational priorities.
            </p>
          </section>

          {/* Disclaimers */}
          <section className="mb-10">
            <h2 className="text-2xl font-black text-gray-900 mb-4">6. Disclaimers</h2>

            <h3 className="text-xl font-bold text-gray-900 mb-3">6.1 "As Is" Basis</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Our services are provided "as is" and "as available" without warranties of any kind, either express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement.
            </p>

            <h3 className="text-xl font-bold text-gray-900 mb-3">6.2 Accuracy of Information</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              While we strive to provide accurate and up-to-date information, we make no representations or warranties regarding the completeness, accuracy, reliability, or availability of content on our website. Laws and regulations change frequently, and information may become outdated.
            </p>

            <h3 className="text-xl font-bold text-gray-900 mb-3">6.3 Third-Party Links</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Our website may contain links to third-party websites. We are not responsible for the content, accuracy, or practices of these external sites. Inclusion of any link does not imply endorsement.
            </p>
          </section>

          {/* Limitation of Liability */}
          <section className="mb-10">
            <h2 className="text-2xl font-black text-gray-900 mb-4">7. Limitation of Liability</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              To the fullest extent permitted by law, HakiArdhi, its directors, employees, partners, and affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from or related to your use of our services, including but not limited to:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
              <li>Loss of profits, data, or business opportunities</li>
              <li>Service interruptions or system failures</li>
              <li>Errors or omissions in content</li>
              <li>Unauthorized access to your information</li>
              <li>Actions or omissions of third parties</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              Our total liability for any claims arising from these terms or your use of our services shall not exceed the amount you paid to us, if any, in the past twelve months.
            </p>
          </section>

          {/* Indemnification */}
          <section className="mb-10">
            <h2 className="text-2xl font-black text-gray-900 mb-4">8. Indemnification</h2>
            <p className="text-gray-700 leading-relaxed">
              You agree to indemnify, defend, and hold harmless HakiArdhi and its directors, employees, partners, and affiliates from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from your use of our services, violation of these terms, or infringement of any rights of another party.
            </p>
          </section>

          {/* Donations */}
          <section className="mb-10">
            <h2 className="text-2xl font-black text-gray-900 mb-4">9. Donations and Payments</h2>

            <h3 className="text-xl font-bold text-gray-900 mb-3">9.1 Voluntary Contributions</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              All donations to HakiArdhi are voluntary and non-refundable unless required by law. Donations are used to support our land rights advocacy, legal aid, research, and community empowerment programs.
            </p>

            <h3 className="text-xl font-bold text-gray-900 mb-3">9.2 Tax Receipts</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Donation receipts will be issued for tax purposes where applicable. Consult with your tax advisor regarding the deductibility of donations in your jurisdiction.
            </p>

            <h3 className="text-xl font-bold text-gray-900 mb-3">9.3 Payment Processing</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Payment processing is handled by secure third-party providers. We do not store your complete payment card information on our servers.
            </p>
          </section>

          {/* Privacy */}
          <section className="mb-10">
            <h2 className="text-2xl font-black text-gray-900 mb-4">10. Privacy</h2>
            <p className="text-gray-700 leading-relaxed">
              Your use of our services is also governed by our <a href="/privacy-policy" className="text-hakiardhi-red hover:underline">Privacy Policy</a>, which explains how we collect, use, and protect your personal information. Please review our Privacy Policy to understand our practices.
            </p>
          </section>

          {/* Termination */}
          <section className="mb-10">
            <h2 className="text-2xl font-black text-gray-900 mb-4">11. Termination</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We reserve the right to suspend or terminate your access to our services at any time, without notice, for conduct that we believe violates these Terms of Use, is harmful to other users, or is otherwise inappropriate.
            </p>
            <p className="text-gray-700 leading-relaxed">
              You may discontinue use of our services at any time. Upon termination, your right to use our services will immediately cease.
            </p>
          </section>

          {/* Governing Law */}
          <section className="mb-10">
            <h2 className="text-2xl font-black text-gray-900 mb-4">12. Governing Law and Dispute Resolution</h2>

            <h3 className="text-xl font-bold text-gray-900 mb-3">12.1 Applicable Law</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              These Terms of Use shall be governed by and construed in accordance with the laws of the United Republic of Tanzania, without regard to its conflict of law provisions.
            </p>

            <h3 className="text-xl font-bold text-gray-900 mb-3">12.2 Dispute Resolution</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Any disputes arising from these terms or your use of our services shall be resolved through good faith negotiations. If negotiations fail, disputes shall be submitted to mediation before resorting to litigation in the courts of Tanzania.
            </p>
          </section>

          {/* General Provisions */}
          <section className="mb-10">
            <h2 className="text-2xl font-black text-gray-900 mb-4">13. General Provisions</h2>

            <h3 className="text-xl font-bold text-gray-900 mb-3">13.1 Severability</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              If any provision of these terms is found to be invalid or unenforceable, the remaining provisions shall continue in full force and effect.
            </p>

            <h3 className="text-xl font-bold text-gray-900 mb-3">13.2 Entire Agreement</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              These Terms of Use, together with our Privacy Policy and any other legal notices published by us, constitute the entire agreement between you and HakiArdhi regarding use of our services.
            </p>

            <h3 className="text-xl font-bold text-gray-900 mb-3">13.3 Waiver</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Our failure to enforce any right or provision in these terms shall not constitute a waiver of such right or provision.
            </p>

            <h3 className="text-xl font-bold text-gray-900 mb-3">13.4 Assignment</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              You may not assign or transfer these terms or your rights under them without our prior written consent. We may assign these terms without restriction.
            </p>
          </section>

          {/* Contact */}
          <section className="mb-10">
            <h2 className="text-2xl font-black text-gray-900 mb-4">14. Contact Us</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have questions about these Terms of Use, please contact us:
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
