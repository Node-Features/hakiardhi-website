'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header, Footer } from '@/components';
import Section from '@/components/ui/Section';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { TYPOGRAPHY, SPACING } from '@/constants/design-tokens';

type OpportunityTab = 'volunteer' | 'partner' | 'careers' | 'internships';

const volunteerOpportunities = [
  {
    id: 'vol-1',
    title: 'Community Paralegal Trainer',
    type: 'Volunteer',
    location: 'Various Regions',
    commitment: 'Flexible',
    description: 'Help train community members on land rights and legal procedures. Share your legal expertise to empower grassroots advocates.',
    requirements: ['Legal background or experience', 'Swahili fluency', 'Community engagement skills'],
    icon: 'users',
  },
  {
    id: 'vol-2',
    title: 'Research Assistant',
    type: 'Volunteer',
    location: 'Remote/Dar es Salaam',
    commitment: '10-15 hours/week',
    description: 'Support our research team in documenting land rights cases, analyzing policy impacts, and producing reports.',
    requirements: ['Research skills', 'Data analysis capability', 'Academic writing experience'],
    icon: 'book',
  },
  {
    id: 'vol-3',
    title: 'Communications Volunteer',
    type: 'Volunteer',
    location: 'Remote',
    commitment: 'Flexible',
    description: 'Help tell our stories through social media, newsletters, and content creation to amplify our impact.',
    requirements: ['Writing/editing skills', 'Social media experience', 'Creative mindset'],
    icon: 'mail',
  },
];

const partnershipOpportunities = [
  {
    id: 'part-1',
    title: 'Corporate Partnership',
    type: 'Partnership',
    description: 'Partner with us through financial support, pro-bono services, or employee engagement programs to advance land rights.',
    benefits: ['CSR impact', 'Brand visibility', 'Employee engagement opportunities', 'Tax benefits'],
    icon: 'briefcase',
    color: 'blue',
  },
  {
    id: 'part-2',
    title: 'Academic Collaboration',
    type: 'Partnership',
    description: 'Collaborate on research projects, student placements, and knowledge exchange initiatives.',
    benefits: ['Research opportunities', 'Field access', 'Joint publications', 'Student engagement'],
    icon: 'book',
    color: 'green',
  },
  {
    id: 'part-3',
    title: 'NGO/CSO Partnership',
    type: 'Partnership',
    description: 'Join forces with like-minded organizations to amplify impact through coordinated advocacy and programs.',
    benefits: ['Resource sharing', 'Network expansion', 'Joint advocacy', 'Knowledge exchange'],
    icon: 'users',
    color: 'orange',
  },
  {
    id: 'part-4',
    title: 'Media Partnership',
    type: 'Partnership',
    description: 'Collaborate with media organizations to increase visibility of land rights issues and amplify community voices.',
    benefits: ['Story access', 'Expert sources', 'Impact documentation', 'Awareness campaigns'],
    icon: 'globe',
    color: 'red',
  },
];

const careerOpportunities = [
  {
    id: 'car-1',
    title: 'Senior Legal Officer',
    type: 'Full-time',
    department: 'Legal Services',
    location: 'Dar es Salaam',
    deadline: '2024-12-31',
    description: 'Lead our legal aid program, representing communities in land disputes and providing strategic legal counsel.',
    requirements: ['LLB or equivalent', '5+ years experience', 'Land law expertise', 'Swahili & English fluency'],
  },
  {
    id: 'car-2',
    title: 'Advocacy & Policy Officer',
    type: 'Full-time',
    department: 'Advocacy',
    location: 'Dar es Salaam',
    deadline: '2024-12-31',
    description: 'Drive policy advocacy initiatives, engage with stakeholders, and coordinate campaigns for land rights reform.',
    requirements: ['Degree in law, political science or related field', '3+ years advocacy experience', 'Policy analysis skills'],
  },
  {
    id: 'car-3',
    title: 'Monitoring & Evaluation Specialist',
    type: 'Full-time',
    department: 'Programs',
    location: 'Dar es Salaam',
    deadline: '2024-12-31',
    description: 'Design and implement M&E frameworks to track program impact and inform strategic decision-making.',
    requirements: ['M&E certification', 'Statistical analysis skills', 'Report writing experience', 'Database management'],
  },
];

const internshipOpportunities = [
  {
    id: 'int-1',
    title: 'Legal Intern',
    duration: '3-6 months',
    department: 'Legal Services',
    description: 'Gain hands-on experience in public interest law, supporting case preparation and legal research.',
    stipend: 'Available',
  },
  {
    id: 'int-2',
    title: 'Research Intern',
    duration: '3-6 months',
    department: 'Research',
    description: 'Contribute to ongoing research projects on land governance, policy analysis, and impact studies.',
    stipend: 'Available',
  },
  {
    id: 'int-3',
    title: 'Communications Intern',
    duration: '3-6 months',
    department: 'Communications',
    description: 'Support content creation, social media management, and documentation of program activities.',
    stipend: 'Available',
  },
];

function WorkWithUsPageContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<OpportunityTab>('volunteer');

  // Handle tab query parameter
  useEffect(() => {
    const tab = searchParams?.get('tab') as OpportunityTab;
    if (tab && ['volunteer', 'partner', 'careers', 'internships'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <Section variant="white" spacing="xs" className="pt-44 lg:pt-48 pb-16 bg-gradient-to-br from-zinc-50 via-gray-50 to-zinc-100 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-hakiardhi-red/20 to-transparent"></div>
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-gradient-to-br from-hakiardhi-red/5 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-gradient-to-br from-blue-500/5 to-transparent rounded-full blur-3xl"></div>

        <Section.Content className="relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* Tag Badge */}
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-gradient-to-r from-hakiardhi-red/10 to-brand-500/10 rounded-full mb-8 shadow-sm border border-hakiardhi-red/20">
              <Icon name="users" size="sm" className="text-hakiardhi-red" />
              <span className="text-sm font-bold text-hakiardhi-red uppercase tracking-wider">
                Join Our Mission
              </span>
            </div>

            {/* Main Heading */}
            <h1 className={`${TYPOGRAPHY.heading.h1.size} ${TYPOGRAPHY.heading.h1.weight} text-gray-900 mb-6 leading-tight`}>
              Work <span className="text-transparent bg-clip-text bg-gradient-to-r from-hakiardhi-red to-brand-500">With Us</span>
            </h1>

            {/* Description */}
            <p className={`${TYPOGRAPHY.body.lg.size} text-gray-700 ${TYPOGRAPHY.body.lg.lineHeight} max-w-3xl mx-auto mb-8`}>
              Join our team of passionate advocates, researchers, and professionals working to secure land rights
              for communities across Tanzania. Explore opportunities to contribute your skills and make a difference.
            </p>

            {/* Decorative divider */}
            <div className="flex items-center justify-center gap-2 mt-8">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-hakiardhi-red/30"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-hakiardhi-red"></div>
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-hakiardhi-red/30"></div>
            </div>
          </div>
        </Section.Content>
      </Section>

      {/* Opportunities Section */}
      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Tab Navigation */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            <button
              onClick={() => setActiveTab('volunteer')}
              className={`px-6 py-4 rounded-full font-semibold text-base transition-all duration-300 ${
                activeTab === 'volunteer'
                  ? 'bg-hakiardhi-red text-white shadow-lg scale-105'
                  : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-hakiardhi-red hover:scale-105'
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon name="hand-heart" size="sm" />
                <span>Volunteer</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('partner')}
              className={`px-6 py-4 rounded-full font-semibold text-base transition-all duration-300 ${
                activeTab === 'partner'
                  ? 'bg-hakiardhi-red text-white shadow-lg scale-105'
                  : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-hakiardhi-red hover:scale-105'
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon name="briefcase" size="sm" />
                <span>Partner With Us</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('careers')}
              className={`px-6 py-4 rounded-full font-semibold text-base transition-all duration-300 ${
                activeTab === 'careers'
                  ? 'bg-hakiardhi-red text-white shadow-lg scale-105'
                  : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-hakiardhi-red hover:scale-105'
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon name="briefcase" size="sm" />
                <span>Careers</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('internships')}
              className={`px-6 py-4 rounded-full font-semibold text-base transition-all duration-300 ${
                activeTab === 'internships'
                  ? 'bg-hakiardhi-red text-white shadow-lg scale-105'
                  : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-hakiardhi-red hover:scale-105'
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon name="user" size="sm" />
                <span>Internships</span>
              </div>
            </button>
          </div>

          {/* Volunteer Opportunities */}
          {activeTab === 'volunteer' && (
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-black text-gray-900 mb-3">
                  Volunteer Opportunities
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Share your skills and passion to support communities fighting for their land rights
                </p>
              </div>

              <div className="space-y-6">
                {volunteerOpportunities.map((opportunity) => (
                  <Card key={opportunity.id} variant="elevated" className="hover:shadow-xl transition-shadow duration-300">
                    <Card.Body className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-hakiardhi-red/10 to-red-100 flex items-center justify-center">
                            <Icon name={opportunity.icon as any} size="lg" className="text-hakiardhi-red" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="text-xl font-bold text-gray-900 mb-2">{opportunity.title}</h3>
                              <div className="flex flex-wrap gap-2">
                                <Badge variant="primary" size="sm">{opportunity.type}</Badge>
                                <span className="flex items-center gap-1 text-sm text-gray-600">
                                  <Icon name="map-pin" size="sm" className="text-hakiardhi-red" />
                                  {opportunity.location}
                                </span>
                                <span className="flex items-center gap-1 text-sm text-gray-600">
                                  <Icon name="clock" size="sm" className="text-hakiardhi-red" />
                                  {opportunity.commitment}
                                </span>
                              </div>
                            </div>
                          </div>
                          <p className="text-gray-700 mb-4">{opportunity.description}</p>
                          <div className="mb-4">
                            <p className="text-sm font-semibold text-gray-900 mb-2">Requirements:</p>
                            <ul className="space-y-1">
                              {opportunity.requirements.map((req, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                                  <Icon name="check-circle" size="sm" className="text-green-600 mt-0.5 flex-shrink-0" />
                                  <span>{req}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <Button variant="secondary" size="sm" href="/contact">
                            <Icon name="mail" size="sm" className="mr-2" />
                            Apply to Volunteer
                          </Button>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Partnership Opportunities */}
          {activeTab === 'partner' && (
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-black text-gray-900 mb-3">
                  Partnership Opportunities
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Collaborate with us to amplify impact and create sustainable change for land rights in Tanzania
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {partnershipOpportunities.map((opportunity) => {
                  const colorClasses = {
                    blue: { bg: 'from-blue-50 to-blue-100', icon: 'text-blue-600', border: 'border-blue-200' },
                    green: { bg: 'from-green-50 to-green-100', icon: 'text-green-600', border: 'border-green-200' },
                    orange: { bg: 'from-orange-50 to-orange-100', icon: 'text-orange-600', border: 'border-orange-200' },
                    red: { bg: 'from-red-50 to-red-100', icon: 'text-red-600', border: 'border-red-200' },
                  };
                  const colors = colorClasses[opportunity.color as keyof typeof colorClasses];

                  return (
                    <Card key={opportunity.id} variant="elevated" className="hover:shadow-xl transition-all duration-300 group">
                      <Card.Body className="p-6">
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${colors.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                          <Icon name={opportunity.icon as any} size="xl" className={colors.icon} />
                        </div>
                        <Badge variant="primary" size="sm" className="mb-3">{opportunity.type}</Badge>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">{opportunity.title}</h3>
                        <p className="text-gray-700 mb-4">{opportunity.description}</p>
                        <div className="mb-4">
                          <p className="text-sm font-semibold text-gray-900 mb-2">Partnership Benefits:</p>
                          <div className="grid grid-cols-2 gap-2">
                            {opportunity.benefits.map((benefit, idx) => (
                              <div key={idx} className="flex items-start gap-1.5">
                                <Icon name="check-circle" size="sm" className="text-green-600 mt-0.5 flex-shrink-0" />
                                <span className="text-xs text-gray-600">{benefit}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <Button variant="secondary" size="sm" href="/contact" fullWidth>
                          <Icon name="mail" size="sm" className="mr-2" />
                          Get in Touch
                        </Button>
                      </Card.Body>
                    </Card>
                  );
                })}
              </div>

              {/* Partnership CTA */}
              <div className="mt-12 bg-gradient-to-r from-hakiardhi-red/5 to-brand-500/5 rounded-2xl p-8 border-l-4 border-hakiardhi-red">
                <div className="flex items-start gap-4">
                  <Icon name="info" size="lg" className="text-hakiardhi-red mt-1" />
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      Custom Partnership Opportunities
                    </h3>
                    <p className="text-gray-700 mb-4">
                      Don't see the right fit? We're open to exploring creative partnerships tailored to your
                      organization's goals and our mission. Let's discuss how we can work together.
                    </p>
                    <Button variant="primary" size="md" href="/contact">
                      Contact Partnership Team
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Career Opportunities */}
          {activeTab === 'careers' && (
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-black text-gray-900 mb-3">
                  Current Vacancies
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Join our team of dedicated professionals working to advance land rights across Tanzania
                </p>
              </div>

              <div className="space-y-6">
                {careerOpportunities.map((opportunity) => (
                  <Card key={opportunity.id} variant="elevated" className="hover:shadow-xl transition-shadow duration-300">
                    <Card.Body className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{opportunity.title}</h3>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="success" size="sm">{opportunity.type}</Badge>
                            <Badge variant="info" size="sm">{opportunity.department}</Badge>
                            <span className="flex items-center gap-1 text-sm text-gray-600">
                              <Icon name="map-pin" size="sm" className="text-hakiardhi-red" />
                              {opportunity.location}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Deadline</p>
                          <p className="text-sm font-semibold text-hakiardhi-red">
                            {new Date(opportunity.deadline).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                      <p className="text-gray-700 mb-4">{opportunity.description}</p>
                      <div className="mb-4">
                        <p className="text-sm font-semibold text-gray-900 mb-2">Requirements:</p>
                        <ul className="space-y-1">
                          {opportunity.requirements.map((req, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                              <Icon name="check-circle" size="sm" className="text-green-600 mt-0.5 flex-shrink-0" />
                              <span>{req}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="flex gap-3">
                        <Button variant="primary" size="sm">
                          <Icon name="arrow-right" size="sm" className="mr-2" />
                          Apply Now
                        </Button>
                        <Button variant="secondary" size="sm">
                          <Icon name="info" size="sm" className="mr-2" />
                          View Details
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                ))}
              </div>

              {/* No Openings State */}
              {careerOpportunities.length === 0 && (
                <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-200">
                  <Icon name="briefcase" size="xl" className="text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No Current Openings</h3>
                  <p className="text-gray-600 mb-6">
                    We don't have any vacancies at the moment, but we're always looking for talented individuals.
                  </p>
                  <Button variant="secondary" size="md" href="/contact">
                    Submit General Application
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Internship Opportunities */}
          {activeTab === 'internships' && (
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-black text-gray-900 mb-3">
                  Internship Programs
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Gain valuable experience while contributing to meaningful work in land rights advocacy
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {internshipOpportunities.map((opportunity) => (
                  <Card key={opportunity.id} variant="elevated" className="hover:shadow-xl transition-all duration-300 h-full">
                    <Card.Body className="p-6 flex flex-col">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-hakiardhi-red/10 to-red-100 flex items-center justify-center mb-4">
                        <Icon name="user" size="md" className="text-hakiardhi-red" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{opportunity.title}</h3>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge variant="warning" size="sm">Internship</Badge>
                        <Badge variant="primary" size="sm">{opportunity.department}</Badge>
                      </div>
                      <p className="text-sm text-gray-700 mb-4 flex-grow">{opportunity.description}</p>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Icon name="clock" size="sm" className="text-hakiardhi-red" />
                          <span>{opportunity.duration}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Icon name="check-circle" size="sm" className="text-green-600" />
                          <span>Stipend {opportunity.stipend}</span>
                        </div>
                      </div>
                      <Button variant="secondary" size="sm" fullWidth href="/contact">
                        Apply Now
                      </Button>
                    </Card.Body>
                  </Card>
                ))}
              </div>

              {/* Internship Info */}
              <div className="bg-blue-50 rounded-2xl p-6 border-l-4 border-blue-500">
                <div className="flex items-start gap-3">
                  <Icon name="info" size="md" className="text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Internship Program Benefits</h4>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li className="flex items-start gap-2">
                        <Icon name="check-circle" size="sm" className="text-blue-600 mt-0.5 flex-shrink-0" />
                        <span>Hands-on experience in land rights advocacy and public interest work</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Icon name="check-circle" size="sm" className="text-blue-600 mt-0.5 flex-shrink-0" />
                        <span>Mentorship from experienced professionals in the field</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Icon name="check-circle" size="sm" className="text-blue-600 mt-0.5 flex-shrink-0" />
                        <span>Certificate of completion and reference letter upon successful completion</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Icon name="check-circle" size="sm" className="text-blue-600 mt-0.5 flex-shrink-0" />
                        <span>Opportunity to contribute to real projects with measurable impact</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Why Work With Us Section */}
      <section className="py-16 bg-gradient-to-br from-zinc-50 via-gray-50 to-zinc-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 mb-4">
              Why Work With <span className="text-hakiardhi-red">HakiArdhi</span>?
            </h2>
            <p className="text-gray-600">
              Join a passionate team dedicated to creating lasting change for land rights in Tanzania
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-hakiardhi-red/10 to-red-100 flex items-center justify-center mx-auto mb-4">
                <Icon name="heart" size="lg" className="text-hakiardhi-red" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Meaningful Impact</h3>
              <p className="text-sm text-gray-600">Work directly with communities creating real change</p>
            </div>
            <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center mx-auto mb-4">
                <Icon name="users" size="lg" className="text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Collaborative Culture</h3>
              <p className="text-sm text-gray-600">Work with passionate, skilled professionals</p>
            </div>
            <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center mx-auto mb-4">
                <Icon name="book" size="lg" className="text-green-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Learning Opportunities</h3>
              <p className="text-sm text-gray-600">Continuous professional development and growth</p>
            </div>
            <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center mx-auto mb-4">
                <Icon name="globe" size="lg" className="text-orange-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">National Reach</h3>
              <p className="text-sm text-gray-600">Work across Tanzania's diverse regions</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

export default function WorkWithUsPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hakiardhi-red mx-auto mb-4"></div>
            <p className="text-gray-600">Loading opportunities...</p>
          </div>
        </div>
        <Footer />
      </main>
    }>
      <WorkWithUsPageContent />
    </Suspense>
  );
}
