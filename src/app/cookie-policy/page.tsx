import { Header, Footer } from '@/components';
import Icon from '@/components/ui/Icon';

export default function CookiePolicyPage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-40 pb-16 lg:pt-48 lg:pb-24">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-hakiardhi-red/10 rounded-xl flex items-center justify-center">
              <Icon name="cookie" size="lg" className="text-hakiardhi-red" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-gray-900">Cookie Policy</h1>
          </div>
          <p className="text-lg text-gray-600">
            Last Updated: November 21, 2025
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          {/* Introduction */}
          <section className="mb-10">
            <h2 className="text-2xl font-black text-gray-900 mb-4">1. What Are Cookies?</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and provide information to website owners.
            </p>
            <p className="text-gray-700 leading-relaxed">
              HakiArdhi uses cookies and similar tracking technologies to enhance your experience on our website, analyze site usage, and support our advocacy and outreach efforts.
            </p>
          </section>

          {/* Types of Cookies */}
          <section className="mb-10">
            <h2 className="text-2xl font-black text-gray-900 mb-4">2. Types of Cookies We Use</h2>

            <h3 className="text-xl font-bold text-gray-900 mb-3">2.1 Essential Cookies</h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              These cookies are necessary for the website to function properly. They enable basic features such as:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
              <li>Page navigation and access to secure areas</li>
              <li>Remembering your preferences and settings</li>
              <li>Ensuring website security and preventing fraud</li>
              <li>Load balancing to optimize performance</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-4">
              <strong>Duration:</strong> Session cookies (deleted when you close your browser) or up to 1 year
            </p>

            <h3 className="text-xl font-bold text-gray-900 mb-3">2.2 Analytics and Performance Cookies</h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              These cookies help us understand how visitors interact with our website by collecting anonymous information about:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
              <li>Pages visited and time spent on each page</li>
              <li>Links clicked and navigation paths</li>
              <li>Error messages encountered</li>
              <li>Device type, browser, and screen resolution</li>
              <li>Geographic location (country/city level only)</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-4">
              We use this information to improve our website structure, content, and user experience.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              <strong>Duration:</strong> Up to 2 years
            </p>

            <h3 className="text-xl font-bold text-gray-900 mb-3">2.3 Functionality Cookies</h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              These cookies enable enhanced functionality and personalization, such as:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
              <li>Remembering your language preference</li>
              <li>Storing your cookie consent choices</li>
              <li>Remembering if you've dismissed notifications</li>
              <li>Maintaining your session when you return to the site</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-4">
              <strong>Duration:</strong> Up to 1 year
            </p>

            <h3 className="text-xl font-bold text-gray-900 mb-3">2.4 Marketing and Targeting Cookies</h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              With your consent, we may use cookies to:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
              <li>Show relevant content and campaigns based on your interests</li>
              <li>Measure the effectiveness of our outreach and advocacy campaigns</li>
              <li>Track conversions from our newsletter and donation campaigns</li>
              <li>Prevent you from seeing the same message repeatedly</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-4">
              These cookies may be set by our trusted partners and advertising networks to build a profile of your interests.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              <strong>Duration:</strong> Up to 2 years
            </p>
          </section>

          {/* Third-Party Cookies */}
          <section className="mb-10">
            <h2 className="text-2xl font-black text-gray-900 mb-4">3. Third-Party Cookies</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We work with trusted third-party service providers who may set cookies on our website. These include:
            </p>

            <div className="bg-gray-50 p-6 rounded-xl mb-4">
              <h4 className="font-bold text-gray-900 mb-2">Google Analytics</h4>
              <p className="text-gray-700 text-sm leading-relaxed mb-2">
                We use Google Analytics to analyze website traffic and user behavior. Google Analytics uses cookies to collect anonymous data about page views, session duration, and traffic sources.
              </p>
              <p className="text-gray-700 text-sm">
                Learn more: <a href="https://policies.google.com/technologies/cookies" target="_blank" rel="noopener noreferrer" className="text-hakiardhi-red hover:underline">Google's Cookie Policy</a>
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl mb-4">
              <h4 className="font-bold text-gray-900 mb-2">Social Media Platforms</h4>
              <p className="text-gray-700 text-sm leading-relaxed mb-2">
                When you share our content on social media or interact with embedded social media content, those platforms may set cookies to track your interactions. These cookies are governed by the respective platform's privacy policies.
              </p>
              <p className="text-gray-700 text-sm">
                Platforms we integrate with: Facebook, Twitter/X, YouTube, LinkedIn
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl mb-4">
              <h4 className="font-bold text-gray-900 mb-2">Payment Processors</h4>
              <p className="text-gray-700 text-sm leading-relaxed">
                When you make a donation, our payment processors (e.g., Stripe, PayPal) may use cookies to process your transaction securely and prevent fraud. These are governed by their respective privacy policies.
              </p>
            </div>
          </section>

          {/* Managing Cookies */}
          <section className="mb-10">
            <h2 className="text-2xl font-black text-gray-900 mb-4">4. How to Manage Cookies</h2>

            <h3 className="text-xl font-bold text-gray-900 mb-3">4.1 Cookie Consent Tool</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              When you first visit our website, you'll see a cookie consent banner allowing you to accept or customize your cookie preferences. You can change these preferences at any time by clicking the "Cookie Settings" link in our website footer.
            </p>

            <h3 className="text-xl font-bold text-gray-900 mb-3">4.2 Browser Settings</h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              Most web browsers allow you to control cookies through their settings. You can:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
              <li>View what cookies are stored and delete them individually or all at once</li>
              <li>Block third-party cookies</li>
              <li>Block cookies from specific websites</li>
              <li>Block all cookies from being set</li>
              <li>Delete all cookies when you close your browser</li>
            </ul>

            <p className="text-gray-700 leading-relaxed mb-3">
              <strong>How to manage cookies in popular browsers:</strong>
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
              <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-hakiardhi-red hover:underline">Google Chrome</a></li>
              <li><a href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" target="_blank" rel="noopener noreferrer" className="text-hakiardhi-red hover:underline">Mozilla Firefox</a></li>
              <li><a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-hakiardhi-red hover:underline">Safari</a></li>
              <li><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-hakiardhi-red hover:underline">Microsoft Edge</a></li>
            </ul>

            <h3 className="text-xl font-bold text-gray-900 mb-3">4.3 Important Notes</h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              Please be aware that:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
              <li>Blocking or deleting cookies may impact your experience on our website and prevent certain features from working properly</li>
              <li>If you use multiple devices or browsers, you'll need to set your cookie preferences on each one</li>
              <li>Some essential cookies cannot be disabled as they are necessary for the website to function</li>
            </ul>
          </section>

          {/* Do Not Track */}
          <section className="mb-10">
            <h2 className="text-2xl font-black text-gray-900 mb-4">5. Do Not Track Signals</h2>
            <p className="text-gray-700 leading-relaxed">
              Some browsers include a "Do Not Track" (DNT) feature that signals to websites that you do not want to be tracked. Currently, there is no universal standard for how websites should respond to DNT signals. We do not currently respond to DNT signals, but we respect your cookie preferences set through our cookie consent tool or browser settings.
            </p>
          </section>

          {/* Other Tracking Technologies */}
          <section className="mb-10">
            <h2 className="text-2xl font-black text-gray-900 mb-4">6. Other Tracking Technologies</h2>

            <h3 className="text-xl font-bold text-gray-900 mb-3">6.1 Web Beacons and Pixels</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              We may use web beacons (also known as pixel tags or clear GIFs) in our emails and on our website. These are small electronic files that help us understand user behavior, track email open rates, and measure campaign effectiveness.
            </p>

            <h3 className="text-xl font-bold text-gray-900 mb-3">6.2 Local Storage</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              We may use local storage (such as HTML5 localStorage) to store preferences and improve website performance. Like cookies, you can clear local storage through your browser settings.
            </p>
          </section>

          {/* Updates */}
          <section className="mb-10">
            <h2 className="text-2xl font-black text-gray-900 mb-4">7. Changes to This Cookie Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Cookie Policy from time to time to reflect changes in technology, legislation, or our practices. We will notify you of significant changes by posting the updated policy on our website with a new "Last Updated" date. We encourage you to review this policy periodically.
            </p>
          </section>

          {/* More Information */}
          <section className="mb-10">
            <h2 className="text-2xl font-black text-gray-900 mb-4">8. More Information</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              For more information about how we collect, use, and protect your personal data, please read our <a href="/privacy-policy" className="text-hakiardhi-red hover:underline">Privacy Policy</a>.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              To learn more about cookies in general, visit <a href="https://www.allaboutcookies.org" target="_blank" rel="noopener noreferrer" className="text-hakiardhi-red hover:underline">www.allaboutcookies.org</a>.
            </p>
          </section>

          {/* Contact */}
          <section className="mb-10">
            <h2 className="text-2xl font-black text-gray-900 mb-4">9. Contact Us</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have questions about our use of cookies or this Cookie Policy, please contact us:
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
