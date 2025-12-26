import { Header, Footer } from '@/components';
import Icon from '@/components/ui/Icon';

export default function AccessibilityPage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-40 pb-16 lg:pt-48 lg:pb-24">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-hakiardhi-red/10 rounded-xl flex items-center justify-center">
              <Icon name="accessibility" size="lg" className="text-hakiardhi-red" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-gray-900">Accessibility Statement</h1>
          </div>
          <p className="text-lg text-gray-600">
            Last Updated: November 21, 2025
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          {/* Commitment */}
          <section className="mb-10">
            <h2 className="text-2xl font-black text-gray-900 mb-4">1. Our Commitment to Accessibility</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              HakiArdhi (Land Rights Research & Resources Institute) is committed to ensuring digital accessibility for all people, including those with disabilities. We continuously work to improve the user experience for everyone and apply relevant accessibility standards.
            </p>
            <p className="text-gray-700 leading-relaxed">
              We believe that access to information about land rights is a fundamental right, and we strive to make our website accessible to the widest possible audience, regardless of technology or ability.
            </p>
          </section>

          {/* Standards */}
          <section className="mb-10">
            <h2 className="text-2xl font-black text-gray-900 mb-4">2. Accessibility Standards</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We aim to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards, developed by the World Wide Web Consortium (W3C). These guidelines explain how to make web content more accessible to people with disabilities and user-friendly for everyone.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Our goal is to meet or exceed these standards across our website to ensure equitable access to our resources and services.
            </p>
          </section>

          {/* Features */}
          <section className="mb-10">
            <h2 className="text-2xl font-black text-gray-900 mb-4">3. Accessibility Features</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Our website includes the following accessibility features:
            </p>

            <h3 className="text-xl font-bold text-gray-900 mb-3">3.1 Navigation and Structure</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
              <li>Clear and consistent navigation structure across all pages</li>
              <li>Logical heading hierarchy (H1, H2, H3, etc.) for easy navigation with screen readers</li>
              <li>Descriptive page titles that clearly indicate content</li>
              <li>Skip navigation links to bypass repetitive content</li>
              <li>Breadcrumb navigation to help users understand their location within the site</li>
              <li>Keyboard-accessible menus and interactive elements</li>
            </ul>

            <h3 className="text-xl font-bold text-gray-900 mb-3">3.2 Visual Design</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
              <li>Sufficient color contrast ratios between text and backgrounds (minimum 4.5:1 for normal text)</li>
              <li>Text that can be resized up to 200% without loss of content or functionality</li>
              <li>Clear focus indicators for keyboard navigation</li>
              <li>Content that does not rely solely on color to convey information</li>
              <li>Responsive design that adapts to different screen sizes and orientations</li>
              <li>Readable fonts with appropriate sizing and spacing</li>
            </ul>

            <h3 className="text-xl font-bold text-gray-900 mb-3">3.3 Content and Media</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
              <li>Alternative text (alt text) for all informative images</li>
              <li>Descriptive link text that indicates the link's destination or purpose</li>
              <li>Transcripts or captions for audio and video content where available</li>
              <li>Documents provided in accessible formats where possible (e.g., accessible PDFs, Word documents)</li>
              <li>Plain language and clear writing to improve readability</li>
              <li>Proper labeling of form fields and clear error messages</li>
            </ul>

            <h3 className="text-xl font-bold text-gray-900 mb-3">3.4 Technical Features</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
              <li>Semantic HTML markup for proper content structure</li>
              <li>ARIA (Accessible Rich Internet Applications) labels where appropriate</li>
              <li>Compatible with assistive technologies such as screen readers, screen magnifiers, and speech recognition software</li>
              <li>Forms that can be completed using keyboard only</li>
              <li>No content that flashes more than three times per second (to prevent seizures)</li>
            </ul>
          </section>

          {/* Assistive Technologies */}
          <section className="mb-10">
            <h2 className="text-2xl font-black text-gray-900 mb-4">4. Compatible Assistive Technologies</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Our website is designed to be compatible with the following assistive technologies:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
              <li><strong>Screen Readers:</strong> JAWS, NVDA, VoiceOver, TalkBack</li>
              <li><strong>Screen Magnifiers:</strong> ZoomText, MAGic</li>
              <li><strong>Speech Recognition Software:</strong> Dragon NaturallySpeaking</li>
              <li><strong>Alternative Input Devices:</strong> Switch devices, eye-tracking systems</li>
              <li><strong>Browser Accessibility Features:</strong> Text-to-speech, high contrast modes, custom stylesheets</li>
            </ul>
          </section>

          {/* Browser Support */}
          <section className="mb-10">
            <h2 className="text-2xl font-black text-gray-900 mb-4">5. Supported Browsers and Devices</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Our website is optimized for use with the following browsers and platforms:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
              <li><strong>Desktop Browsers:</strong> Google Chrome, Mozilla Firefox, Safari, Microsoft Edge (latest versions)</li>
              <li><strong>Mobile Browsers:</strong> Safari (iOS), Chrome (Android)</li>
              <li><strong>Operating Systems:</strong> Windows, macOS, Linux, iOS, Android</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              We recommend keeping your browser updated to the latest version for the best experience and security.
            </p>
          </section>

          {/* Keyboard Navigation */}
          <section className="mb-10">
            <h2 className="text-2xl font-black text-gray-900 mb-4">6. Keyboard Navigation</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Our website is fully navigable using only a keyboard. Here are some helpful keyboard shortcuts:
            </p>
            <div className="bg-gray-50 p-6 rounded-xl space-y-3">
              <div className="flex items-start gap-4">
                <span className="font-mono font-bold text-hakiardhi-red min-w-[100px]">Tab</span>
                <span className="text-gray-700">Move to the next interactive element</span>
              </div>
              <div className="flex items-start gap-4">
                <span className="font-mono font-bold text-hakiardhi-red min-w-[100px]">Shift + Tab</span>
                <span className="text-gray-700">Move to the previous interactive element</span>
              </div>
              <div className="flex items-start gap-4">
                <span className="font-mono font-bold text-hakiardhi-red min-w-[100px]">Enter</span>
                <span className="text-gray-700">Activate links and buttons</span>
              </div>
              <div className="flex items-start gap-4">
                <span className="font-mono font-bold text-hakiardhi-red min-w-[100px]">Space</span>
                <span className="text-gray-700">Activate buttons, checkboxes, and scroll page</span>
              </div>
              <div className="flex items-start gap-4">
                <span className="font-mono font-bold text-hakiardhi-red min-w-[100px]">Arrow Keys</span>
                <span className="text-gray-700">Navigate within menus and radio button groups</span>
              </div>
              <div className="flex items-start gap-4">
                <span className="font-mono font-bold text-hakiardhi-red min-w-[100px]">Esc</span>
                <span className="text-gray-700">Close modal dialogs and dropdown menus</span>
              </div>
            </div>
          </section>

          {/* Known Limitations */}
          <section className="mb-10">
            <h2 className="text-2xl font-black text-gray-900 mb-4">7. Known Limitations</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              While we strive for full accessibility, we acknowledge that some areas of our website may not yet meet all accessibility standards. We are actively working to address these issues:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
              <li>Some older PDF documents may not be fully accessible; we are working to remediate these files</li>
              <li>Some third-party content (embedded videos, maps, or social media feeds) may have accessibility limitations beyond our control</li>
              <li>Complex data visualizations may require alternative text descriptions for full accessibility</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              If you encounter accessibility barriers, please let us know so we can provide alternative access or prioritize improvements.
            </p>
          </section>

          {/* Third-Party Content */}
          <section className="mb-10">
            <h2 className="text-2xl font-black text-gray-900 mb-4">8. Third-Party Content</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Our website may contain links to external websites and embedded content from third parties. We cannot guarantee the accessibility of external content, as it is beyond our control. However, we strive to link only to accessible resources whenever possible.
            </p>
            <p className="text-gray-700 leading-relaxed">
              If you encounter an inaccessible external resource that we link to, please contact us, and we will try to provide alternative access to the information or find a more accessible alternative.
            </p>
          </section>

          {/* Accessibility Tools */}
          <section className="mb-10">
            <h2 className="text-2xl font-black text-gray-900 mb-4">9. Helpful Accessibility Tools</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              In addition to our built-in accessibility features, you may find these tools helpful:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
              <li><strong>Browser Settings:</strong> Most browsers allow you to adjust text size, colors, and contrast. Check your browser's accessibility settings.</li>
              <li><strong>Operating System Features:</strong> Windows, macOS, iOS, and Android include built-in accessibility features like screen readers, voice control, and display adjustments.</li>
              <li><strong>Browser Extensions:</strong> Extensions like Read&Write, Mercury Reader, or Dark Reader can enhance accessibility.</li>
              <li><strong>Mobile Accessibility:</strong> Both iOS (VoiceOver) and Android (TalkBack) offer powerful built-in screen readers.</li>
            </ul>
          </section>

          {/* Ongoing Efforts */}
          <section className="mb-10">
            <h2 className="text-2xl font-black text-gray-900 mb-4">10. Ongoing Accessibility Efforts</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              We are committed to continually improving accessibility. Our ongoing efforts include:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
              <li>Regular accessibility audits and testing with assistive technologies</li>
              <li>Training our staff and content creators on accessibility best practices</li>
              <li>Incorporating accessibility requirements into our design and development processes</li>
              <li>Testing with users who have disabilities to gather real-world feedback</li>
              <li>Staying current with evolving accessibility standards and technologies</li>
              <li>Prioritizing accessibility in all new features and content</li>
            </ul>
          </section>

          {/* Feedback */}
          <section className="mb-10">
            <h2 className="text-2xl font-black text-gray-900 mb-4">11. Feedback and Contact</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We welcome your feedback on the accessibility of our website. If you encounter accessibility barriers or have suggestions for improvement, please let us know:
            </p>

            <div className="bg-hakiardhi-red/5 border-l-4 border-hakiardhi-red p-6 rounded-xl mb-4">
              <h4 className="font-bold text-gray-900 mb-3">When contacting us about accessibility, please include:</h4>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 text-sm">
                <li>The web page or content you're trying to access</li>
                <li>A description of the problem you encountered</li>
                <li>The assistive technology you're using (if applicable)</li>
                <li>Your browser and operating system</li>
              </ul>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl border-l-4 border-hakiardhi-red">
              <p className="font-bold text-gray-900 mb-2">Accessibility Contact</p>
              <p className="text-gray-700">HakiArdhi - Land Rights Research & Resources Institute</p>
              <p className="text-gray-700">Email: <a href="mailto:info@hakiardhi.or.tz" className="text-hakiardhi-red hover:underline">info@hakiardhi.or.tz</a></p>
              <p className="text-gray-700">Phone: 0800 711 555</p>
              <p className="text-gray-700">Address: Dar es Salaam, Tanzania</p>
              <p className="text-gray-700 mt-3 text-sm">We aim to respond to accessibility feedback within 5 business days.</p>
            </div>
          </section>

          {/* Alternative Access */}
          <section className="mb-10">
            <h2 className="text-2xl font-black text-gray-900 mb-4">12. Alternative Access to Information</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have difficulty accessing any content or using any features on our website, we are happy to provide information in an alternative format. We can provide:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
              <li>Documents in large print, audio format, or Braille</li>
              <li>Assistance accessing our legal aid services through alternative channels</li>
              <li>Information via email, phone, or in-person consultation</li>
              <li>Simplified summaries of complex content</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              Please contact us to request alternative formats, and we will work with you to meet your needs.
            </p>
          </section>

          {/* Legal Framework */}
          <section className="mb-10">
            <h2 className="text-2xl font-black text-gray-900 mb-4">13. Legal and Regulatory Compliance</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We are committed to complying with applicable accessibility laws and regulations, including:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
              <li>The United Nations Convention on the Rights of Persons with Disabilities (CRPD)</li>
              <li>Tanzania's Persons with Disabilities Act, 2010</li>
              <li>International web accessibility standards (WCAG 2.1)</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              As an organization advocating for human rights, we recognize that accessibility is a fundamental aspect of social justice and inclusion.
            </p>
          </section>

          {/* Updates */}
          <section className="mb-10">
            <h2 className="text-2xl font-black text-gray-900 mb-4">14. Updates to This Statement</h2>
            <p className="text-gray-700 leading-relaxed">
              We review and update this Accessibility Statement regularly to reflect improvements to our website and changes to accessibility standards. The "Last Updated" date at the top of this page indicates when this statement was most recently revised.
            </p>
          </section>
        </div>
      </div>

      <Footer />
    </main>
  );
}
