'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header, Footer } from '@/components';
import Section from '@/components/ui/Section';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import Card from '@/components/ui/Card';
import { TYPOGRAPHY, SPACING } from '@/constants/design-tokens';

type DonationType = 'one-time' | 'monthly';
type DonorLocation = 'tanzania' | 'international';
type PaymentMethod = 'mobile-money' | 'card' | 'paypal';

const PRESET_AMOUNTS = {
  tanzania: [10000, 25000, 50000, 100000, 250000, 500000],
  international: [10, 25, 50, 100, 250, 500],
};

const MOBILE_PROVIDERS = ['M-Pesa (Vodacom)', 'Tigo Pesa', 'Airtel Money', 'Halo Pesa'];

function DonatePageContent() {
  const searchParams = useSearchParams();
  const [donationType, setDonationType] = useState<DonationType>('one-time');
  const [donorLocation, setDonorLocation] = useState<DonorLocation>('tanzania');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mobile-money');
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [mobileProvider, setMobileProvider] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    country: '',
    anonymous: false,
  });

  // Handle query parameters for monthly donations
  useEffect(() => {
    const type = searchParams?.get('type');
    if (type === 'monthly') {
      setDonationType('monthly');
    }
  }, [searchParams]);

  const amounts = donorLocation === 'tanzania' ? PRESET_AMOUNTS.tanzania : PRESET_AMOUNTS.international;
  const currency = donorLocation === 'tanzania' ? 'TZS' : 'USD';

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    setSelectedAmount(null);
  };

  const handleDonorLocationChange = (location: DonorLocation) => {
    setDonorLocation(location);
    setSelectedAmount(null);
    setCustomAmount('');
    // Set default payment method based on location
    setPaymentMethod(location === 'tanzania' ? 'mobile-money' : 'card');
  };

  const finalAmount = customAmount ? parseFloat(customAmount) : selectedAmount;

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <Section variant="white" spacing="xs" className="pt-44 lg:pt-48 pb-16 bg-gradient-to-br from-zinc-50 via-gray-50 to-zinc-100 relative overflow-hidden">
        {/* Subtle decorative elements */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-hakiardhi-red/20 to-transparent"></div>
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-gradient-to-br from-hakiardhi-red/5 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-gradient-to-br from-brand-500/5 to-transparent rounded-full blur-3xl"></div>

        <Section.Content className="relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* Tag Badge */}
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-gradient-to-r from-hakiardhi-red/10 to-brand-500/10 rounded-full mb-8 shadow-sm border border-hakiardhi-red/20">
              <Icon name="heart" size="sm" className="text-hakiardhi-red" />
              <span className="text-sm font-bold text-hakiardhi-red uppercase tracking-wider">
                Make a Difference
              </span>
            </div>

            {/* Main Heading */}
            <h1 className={`${TYPOGRAPHY.heading.h1.size} ${TYPOGRAPHY.heading.h1.weight} text-gray-900 mb-6 leading-tight`}>
              Support <span className="text-transparent bg-clip-text bg-gradient-to-r from-hakiardhi-red to-brand-500">Land Rights</span> in Tanzania
            </h1>

            {/* Description */}
            <p className={`${TYPOGRAPHY.body.lg.size} text-gray-700 ${TYPOGRAPHY.body.lg.lineHeight} max-w-3xl mx-auto mb-8`}>
              Your donation provides legal aid, training, and protection to families fighting for their land rights.
              Every contribution creates lasting change for communities across Tanzania.
            </p>

            {/* Impact Stats - Quick Visual */}
            <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto mt-10">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-200/50">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-hakiardhi-red/10 to-red-100 mx-auto mb-3">
                  <Icon name="shield-check" size="md" className="text-hakiardhi-red" />
                </div>
                <p className="text-2xl font-black text-gray-900 mb-1">30+</p>
                <p className="text-xs font-semibold text-gray-600">Years Experience</p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-200/50">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-green-50 to-green-100 mx-auto mb-3">
                  <Icon name="users" size="md" className="text-green-600" />
                </div>
                <p className="text-2xl font-black text-gray-900 mb-1">5M+</p>
                <p className="text-xs font-semibold text-gray-600">Lives Touched</p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-200/50">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 mx-auto mb-3">
                  <Icon name="check-circle" size="md" className="text-blue-600" />
                </div>
                <p className="text-2xl font-black text-gray-900 mb-1">100%</p>
                <p className="text-xs font-semibold text-gray-600">Transparent</p>
              </div>
            </div>

            {/* Decorative divider */}
            <div className="flex items-center justify-center gap-2 mt-10">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-hakiardhi-red/30"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-hakiardhi-red"></div>
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-hakiardhi-red/30"></div>
            </div>
          </div>
        </Section.Content>
      </Section>

      {/* Main Donation Form Section */}
      <section className="py-12 lg:py-16 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Donation Form */}
              <div className="lg:col-span-2">
                <Card variant="elevated" className="overflow-hidden">
                  <Card.Body className="p-0">
                    {/* Donation Type Tabs */}
                    <div className="border-b border-gray-200 bg-gray-50 p-6">
                      <label className="block text-sm font-bold text-gray-700 mb-3">
                        Donation Frequency
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => setDonationType('one-time')}
                          className={`px-6 py-4 rounded-xl font-semibold text-base transition-all duration-300 ${
                            donationType === 'one-time'
                              ? 'bg-hakiardhi-red text-white shadow-lg scale-105'
                              : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-hakiardhi-red'
                          }`}
                        >
                          <div className="flex items-center justify-center gap-2">
                            <Icon name="heart" size="sm" />
                            <span>One-Time Gift</span>
                          </div>
                        </button>
                        <button
                          onClick={() => setDonationType('monthly')}
                          className={`px-6 py-4 rounded-xl font-semibold text-base transition-all duration-300 ${
                            donationType === 'monthly'
                              ? 'bg-hakiardhi-red text-white shadow-lg scale-105'
                              : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-hakiardhi-red'
                          }`}
                        >
                          <div className="flex items-center justify-center gap-2">
                            <Icon name="refresh" size="sm" />
                            <span>Monthly Giving</span>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Donor Location */}
                    <div className="border-b border-gray-200 bg-gray-50 p-6">
                      <label className="block text-sm font-bold text-gray-700 mb-3">
                        I am donating from
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => handleDonorLocationChange('tanzania')}
                          className={`px-6 py-4 rounded-xl font-semibold text-base transition-all duration-300 ${
                            donorLocation === 'tanzania'
                              ? 'bg-hakiardhi-red text-white shadow-lg scale-105'
                              : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-hakiardhi-red'
                          }`}
                        >
                          <div className="flex items-center justify-center gap-2">
                            <Icon name="map-pin" size="sm" />
                            <span>Tanzania</span>
                          </div>
                        </button>
                        <button
                          onClick={() => handleDonorLocationChange('international')}
                          className={`px-6 py-4 rounded-xl font-semibold text-base transition-all duration-300 ${
                            donorLocation === 'international'
                              ? 'bg-hakiardhi-red text-white shadow-lg scale-105'
                              : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-hakiardhi-red'
                          }`}
                        >
                          <div className="flex items-center justify-center gap-2">
                            <Icon name="globe" size="sm" />
                            <span>International</span>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Amount Selection */}
                    <div className="p-6 border-b border-gray-200">
                      <label className="block text-sm font-bold text-gray-700 mb-4">
                        Select Amount ({currency})
                      </label>
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        {amounts.map((amount) => (
                          <button
                            key={amount}
                            onClick={() => handleAmountSelect(amount)}
                            className={`px-4 py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
                              selectedAmount === amount
                                ? 'bg-hakiardhi-red text-white shadow-lg scale-105'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-gray-200 hover:border-hakiardhi-red'
                            }`}
                          >
                            {currency} {amount.toLocaleString()}
                          </button>
                        ))}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Or enter custom amount
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                            {currency}
                          </span>
                          <input
                            type="number"
                            value={customAmount}
                            onChange={(e) => handleCustomAmountChange(e.target.value)}
                            placeholder="Enter amount"
                            className="w-full pl-16 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-hakiardhi-red focus:ring-4 focus:ring-hakiardhi-red/10 transition-all text-lg font-semibold text-gray-900"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Payment Method Tabs */}
                    <div className="p-6 border-b border-gray-200">
                      <label className="block text-sm font-bold text-gray-700 mb-4">
                        Payment Method
                      </label>

                      {/* Payment Method Tab Buttons */}
                      <div className={`grid gap-3 mb-6 ${
                        donorLocation === 'tanzania' ? 'grid-cols-2' : 'grid-cols-2'
                      }`}>
                        {donorLocation === 'tanzania' && (
                          <button
                            onClick={() => setPaymentMethod('mobile-money')}
                            className={`px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
                              paymentMethod === 'mobile-money'
                                ? 'bg-hakiardhi-red text-white shadow-lg'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-gray-200'
                            }`}
                          >
                            <div className="flex items-center justify-center gap-2">
                              <Icon name="phone" size="sm" />
                              <span>Mobile Money</span>
                            </div>
                          </button>
                        )}
                        <button
                          onClick={() => setPaymentMethod('card')}
                          className={`px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
                            paymentMethod === 'card'
                              ? 'bg-hakiardhi-red text-white shadow-lg'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-gray-200'
                          }`}
                        >
                          <div className="flex items-center justify-center gap-2">
                            <Icon name="credit-card" size="sm" />
                            <span>Credit/Debit Card</span>
                          </div>
                        </button>
                        {donorLocation === 'international' && (
                          <button
                            onClick={() => setPaymentMethod('paypal')}
                            className={`px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
                              paymentMethod === 'paypal'
                                ? 'bg-hakiardhi-red text-white shadow-lg'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-gray-200'
                            }`}
                          >
                            <div className="flex items-center justify-center gap-2">
                              <span className="font-bold">PayPal</span>
                            </div>
                          </button>
                        )}
                      </div>

                      {/* Payment Method Content */}
                      <div className="bg-gray-50 rounded-xl p-6">
                        {/* Mobile Money Form */}
                        {paymentMethod === 'mobile-money' && donorLocation === 'tanzania' && (
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select Mobile Provider
                              </label>
                              <select
                                value={mobileProvider}
                                onChange={(e) => setMobileProvider(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-hakiardhi-red focus:ring-4 focus:ring-hakiardhi-red/10 transition-all text-gray-900"
                              >
                                <option value="">Choose provider...</option>
                                {MOBILE_PROVIDERS.map((provider) => (
                                  <option key={provider} value={provider}>
                                    {provider}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Mobile Number
                              </label>
                              <input
                                type="tel"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                placeholder="e.g., 0712345678"
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-hakiardhi-red focus:ring-4 focus:ring-hakiardhi-red/10 transition-all text-gray-900"
                              />
                            </div>
                            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                              <div className="flex items-start gap-3">
                                <Icon name="info" size="sm" className="text-blue-600 mt-0.5" />
                                <p className="text-sm text-blue-800">
                                  <strong>USSD Push:</strong> You will receive a prompt on your phone to authorize the payment.
                                  Please ensure your phone is on and has network coverage.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Card Payment Form */}
                        {paymentMethod === 'card' && (
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Card Number
                              </label>
                              <input
                                type="text"
                                placeholder="1234 5678 9012 3456"
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-hakiardhi-red focus:ring-4 focus:ring-hakiardhi-red/10 transition-all text-gray-900"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Expiry Date
                                </label>
                                <input
                                  type="text"
                                  placeholder="MM/YY"
                                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-hakiardhi-red focus:ring-4 focus:ring-hakiardhi-red/10 transition-all text-gray-900"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  CVV
                                </label>
                                <input
                                  type="text"
                                  placeholder="123"
                                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-hakiardhi-red focus:ring-4 focus:ring-hakiardhi-red/10 transition-all text-gray-900"
                                />
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Icon name="shield-check" size="sm" className="text-green-600" />
                              <span>Your payment information is secure and encrypted</span>
                            </div>
                          </div>
                        )}

                        {/* PayPal */}
                        {paymentMethod === 'paypal' && donorLocation === 'international' && (
                          <div className="text-center py-6">
                            <div className="mb-4">
                              <Icon name="check-circle" size="xl" className="text-blue-600 mx-auto" />
                            </div>
                            <p className="text-gray-700 mb-4">
                              You will be redirected to PayPal to complete your donation securely.
                            </p>
                            <div className="inline-flex items-center gap-2 text-sm text-gray-600">
                              <Icon name="shield-check" size="sm" className="text-green-600" />
                              <span>Secure PayPal checkout</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Donor Information */}
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">
                        Your Information
                      </h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              First Name *
                            </label>
                            <input
                              type="text"
                              value={formData.firstName}
                              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-hakiardhi-red focus:ring-4 focus:ring-hakiardhi-red/10 transition-all text-gray-900"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Last Name *
                            </label>
                            <input
                              type="text"
                              value={formData.lastName}
                              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-hakiardhi-red focus:ring-4 focus:ring-hakiardhi-red/10 transition-all text-gray-900"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address *
                          </label>
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-hakiardhi-red focus:ring-4 focus:ring-hakiardhi-red/10 transition-all text-gray-900"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Country *
                          </label>
                          <input
                            type="text"
                            value={formData.country}
                            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                            placeholder={donorLocation === 'tanzania' ? 'Tanzania' : 'Your country'}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-hakiardhi-red focus:ring-4 focus:ring-hakiardhi-red/10 transition-all text-gray-900"
                          />
                        </div>
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            id="anonymous"
                            checked={formData.anonymous}
                            onChange={(e) => setFormData({ ...formData, anonymous: e.target.checked })}
                            className="w-5 h-5 text-hakiardhi-red border-gray-300 rounded focus:ring-hakiardhi-red"
                          />
                          <label htmlFor="anonymous" className="text-sm text-gray-700">
                            Make my donation anonymous
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="p-6 bg-gray-50 border-t border-gray-200">
                      <Button
                        variant="primary"
                        size="lg"
                        fullWidth
                        disabled={!finalAmount || finalAmount <= 0}
                        className="!py-4 !text-lg hover:!bg-black"
                      >
                        <span className="flex items-center justify-center gap-2">
                          <Icon name="heart" size="sm" />
                          {donationType === 'monthly' ? 'Start Monthly Donation' : 'Complete Donation'}
                          {finalAmount && ` - ${currency} ${finalAmount.toLocaleString()}`}
                        </span>
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </div>

              {/* Right Column - Impact & Trust */}
              <div className="lg:col-span-1 space-y-6">
                {/* Your Impact */}
                <Card variant="elevated">
                  <Card.Body className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Icon name="heart" size="sm" className="text-hakiardhi-red" />
                      Your Impact
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                        <Icon name="check-circle" size="sm" className="text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-gray-900">Legal Aid</p>
                          <p className="text-xs text-gray-600">Free legal support for families in land disputes</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                        <Icon name="check-circle" size="sm" className="text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-gray-900">Training Programs</p>
                          <p className="text-xs text-gray-600">Community education on land rights</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                        <Icon name="check-circle" size="sm" className="text-orange-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-gray-900">Advocacy</p>
                          <p className="text-xs text-gray-600">Policy reform for land governance</p>
                        </div>
                      </div>
                    </div>
                  </Card.Body>
                </Card>

                {/* Trust Indicators */}
                <Card variant="elevated">
                  <Card.Body className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      Why Donate?
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Icon name="shield-check" size="sm" className="text-hakiardhi-red mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-gray-900">Secure Donation</p>
                          <p className="text-xs text-gray-600">Bank-level encryption</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Icon name="check-circle" size="sm" className="text-hakiardhi-red mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-gray-900">Tax Deductible</p>
                          <p className="text-xs text-gray-600">Receipt provided for tax purposes</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Icon name="eye" size="sm" className="text-hakiardhi-red mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-gray-900">100% Transparent</p>
                          <p className="text-xs text-gray-600">Annual reports published</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Icon name="users" size="sm" className="text-hakiardhi-red mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-gray-900">30+ Years</p>
                          <p className="text-xs text-gray-600">Trusted experience</p>
                        </div>
                      </div>
                    </div>
                  </Card.Body>
                </Card>

                {/* Contact */}
                <Card variant="elevated">
                  <Card.Body className="p-6">
                    <h3 className="text-sm font-bold text-gray-900 mb-3">
                      Questions about donating?
                    </h3>
                    <p className="text-xs text-gray-600 mb-4">
                      Our team is here to help you make a difference.
                    </p>
                    <Button variant="secondary" size="sm" href="/contact" fullWidth>
                      <Icon name="mail" size="sm" className="mr-2" />
                      Contact Us
                    </Button>
                  </Card.Body>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

export default function DonatePage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hakiardhi-red mx-auto mb-4"></div>
            <p className="text-gray-600">Loading donation form...</p>
          </div>
        </div>
        <Footer />
      </main>
    }>
      <DonatePageContent />
    </Suspense>
  );
}
