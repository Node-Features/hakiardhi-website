'use client';

import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { THRESHOLDS } from '@/constants/design-tokens';
import Button from '../ui/Button';
import Icon from '../ui/Icon';

export interface AIChatbotBannerProps {
  className?: string;
}

export default function AIChatbotBanner({ className = '' }: AIChatbotBannerProps) {
  const [sectionRef, isVisible] = useIntersectionObserver({
    threshold: THRESHOLDS.intersection.low,
    freezeOnceVisible: true,
  });

  return (
    <section
      ref={sectionRef}
      className={`relative py-16 lg:py-20 overflow-hidden ${className}`}
    >
      {/* Animated Background - WhatsApp Green Theme */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-500 via-emerald-600 to-green-600"></div>

      {/* Animated Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

      {/* Pattern Overlay */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
        backgroundSize: '32px 32px'
      }}></div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div
          className={`transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="grid lg:grid-cols-2 gap-8 items-center max-w-6xl mx-auto">
            {/* Left - Content */}
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-white/20 backdrop-blur-md rounded-full mb-6 border border-white/30">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                </span>
                <span className="text-sm font-bold text-white uppercase tracking-wider">
                  AI-Powered • 24/7 Available
                </span>
              </div>

              {/* Heading */}
              <h2 className="text-3xl lg:text-5xl font-black text-white mb-6 leading-tight">
                Get Instant Legal Help via <span className="block mt-2">WhatsApp!</span>
              </h2>

              {/* Description */}
              <p className="text-lg lg:text-xl text-white/95 mb-8 leading-relaxed">
                Our AI-powered chatbot provides immediate legal guidance on land rights, incident reporting,
                and connects you with our legal team when needed - all for FREE.
              </p>

              {/* Features List */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                    <Icon name="check-circle" size="sm" className="text-white" />
                  </div>
                  <span className="text-white font-semibold text-sm">24/7 Availability</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                    <Icon name="check-circle" size="sm" className="text-white" />
                  </div>
                  <span className="text-white font-semibold text-sm">Instant Response</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                    <Icon name="check-circle" size="sm" className="text-white" />
                  </div>
                  <span className="text-white font-semibold text-sm">Swahili & English</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                    <Icon name="check-circle" size="sm" className="text-white" />
                  </div>
                  <span className="text-white font-semibold text-sm">100% Free</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  href="https://wa.me/+255784646752"
                  variant="dark"
                  size="lg"
                  icon={<Icon name="phone" size="sm" />}
                  iconPosition="left"
                  className="whitespace-nowrap"
                >
                  Start WhatsApp Chat
                </Button>
                <Button
                  href="tel:0800711555"
                  variant="dark"
                  size="lg"
                  icon={<Icon name="phone" size="sm" />}
                  iconPosition="left"
                  className="whitespace-nowrap"
                >
                  Call 0800 711 555
                </Button>
              </div>

              {/* Alternative Contact */}
              <p className="text-sm text-white/80 mt-4">
                Or call our office line: <a href="tel:+255784646752" className="font-bold underline hover:text-white">0784 646 752</a>
              </p>
            </div>

            {/* Right - WhatsApp Chat Preview */}
            <div className="relative">
              {/* Phone Mockup */}
              <div className="relative max-w-sm mx-auto">
                {/* Floating Badge */}
                <div className="absolute -top-6 -left-6 bg-white rounded-full px-4 py-2 shadow-2xl border-2 border-white/20 z-20 animate-bounce">
                  <p className="text-sm font-bold text-green-600">✨ AI-Powered</p>
                </div>

                {/* Phone Frame */}
                <div className="bg-white rounded-[3rem] shadow-2xl p-4 relative transform hover:scale-105 transition-transform duration-300">
                  {/* Screen */}
                  <div className="bg-gradient-to-b from-green-50 to-white rounded-[2.5rem] overflow-hidden border-8 border-gray-900">
                    {/* WhatsApp Header */}
                    <div className="bg-green-600 px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                          <Icon name="phone" size="sm" className="text-green-600" />
                        </div>
                        <div>
                          <p className="text-white font-bold text-sm">HakiArdhi Legal Bot</p>
                          <p className="text-green-100 text-xs">Online</p>
                        </div>
                      </div>
                    </div>

                    {/* Chat Messages */}
                    <div className="p-4 space-y-3 min-h-[300px]" style={{
                      backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h100v100H0z\' fill=\'%23f0f0f0\' fill-opacity=\'.05\'/%3E%3C/svg%3E")'
                    }}>
                      {/* Bot Message */}
                      <div className="flex gap-2">
                        <div className="bg-white rounded-2xl rounded-tl-none px-4 py-2.5 shadow-sm max-w-[75%]">
                          <p className="text-xs text-gray-800">
                            👋 Habari! I'm here to help with land rights issues. How can I assist you?
                          </p>
                        </div>
                      </div>

                      {/* User Message */}
                      <div className="flex gap-2 justify-end">
                        <div className="bg-green-500 rounded-2xl rounded-tr-none px-4 py-2.5 shadow-sm max-w-[75%]">
                          <p className="text-xs text-white">
                            I need help with a land dispute
                          </p>
                        </div>
                      </div>

                      {/* Bot Response with Options */}
                      <div className="flex gap-2">
                        <div className="bg-white rounded-2xl rounded-tl-none px-4 py-2.5 shadow-sm max-w-[85%]">
                          <p className="text-xs text-gray-800 mb-2">
                            I can help! Choose an option:
                          </p>
                          <div className="space-y-1.5">
                            <button className="w-full px-3 py-1.5 bg-green-50 rounded-lg text-xs font-medium text-green-700 hover:bg-green-100 transition-colors text-left">
                              📋 Report Incident
                            </button>
                            <button className="w-full px-3 py-1.5 bg-green-50 rounded-lg text-xs font-medium text-green-700 hover:bg-green-100 transition-colors text-left">
                              💬 Get Legal Advice
                            </button>
                            <button className="w-full px-3 py-1.5 bg-green-50 rounded-lg text-xs font-medium text-green-700 hover:bg-green-100 transition-colors text-left">
                              👨‍⚖️ Talk to Lawyer
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Typing Indicator */}
                      <div className="flex gap-2">
                        <div className="bg-white rounded-2xl rounded-tl-none px-4 py-2.5 shadow-sm">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Stats */}
                <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl px-6 py-4 shadow-2xl border-2 border-white/20 z-20">
                  <p className="text-3xl font-black text-green-600 mb-1">&lt;2min</p>
                  <p className="text-xs text-gray-600 font-semibold">Response Time</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Accent */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
    </section>
  );
}
