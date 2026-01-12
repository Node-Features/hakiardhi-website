import ProgramCard, { ProgramCardProps } from '../features/ProgramCard';
import SectionHeader from '../features/SectionHeader';
import Button from '../ui/Button';

export interface ProgramsSectionProps {
  title?: string;
  description?: string;
  programs?: ProgramCardProps[];
  showViewAllButton?: boolean;
  viewAllLink?: string;
  viewAllText?: string;
  bgColor?: 'white' | 'gray';
  className?: string;
}

export default function ProgramsSection({
  title = 'Our Programs',
  description = 'Comprehensive initiatives designed to protect land rights and empower communities through education, legal support, and advocacy.',
  programs: programsProp,
  showViewAllButton = true,
  viewAllLink = '/programs',
  viewAllText = 'View All Programs',
  bgColor = 'gray',
  className = '',
}: ProgramsSectionProps) {
  const defaultPrograms = [
    {
      title: 'School of HakiArdhi',
      description: 'Comprehensive training programs for community leaders, land rights monitors, and activists on land rights, advocacy, and resource management.',
      image: '/images/public_debate_1.JPG',
      link: '/programs/school',
      buttonText: 'Learn More',
    },
    {
      title: 'Legal Aid & Counseling',
      description: '24/7 free legal support for communities facing land disputes, providing expert guidance and representation in court cases.',
      image: '/images/public_debate_2.JPG',
      link: '/programs/legal-aid',
      buttonText: 'Learn More',
    },
    {
      title: 'Research & Documentation',
      description: 'In-depth studies on land tenure systems, indigenous practices, and policy analysis to inform evidence-based advocacy.',
      image: '/images/hero_1.JPG',
      link: '/programs/research',
      buttonText: 'Learn More',
    },
    {
      title: 'Policy Advocacy',
      description: 'Working with government bodies and stakeholders to promote fair land policies and reforms that ensure social justice.',
      image: '/images/hero_2.JPG',
      link: '/programs/advocacy',
      buttonText: 'Learn More',
    },
  ];

  const programs = programsProp || defaultPrograms;

  return (
    <section
      className={`relative py-16 lg:py-24 overflow-hidden ${className}`}
      style={{
        background: 'linear-gradient(to bottom, #000000 0%, #1a1a1a 50%, #000000 100%)',
      }}
    >
      {/* Background decoration */}
      <div className="absolute top-1/3 left-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl"></div>

      {/* Header Container */}
      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-10 lg:mb-12">
          <h2 className="text-3xl lg:text-5xl font-black text-white mb-4 lg:mb-6">
            {title.split(' ').map((word, index) =>
              word === 'Programs' ? (
                <span key={index} className="text-brand-500">Programs</span>
              ) : (
                <span key={index}> {word}</span>
              )
            )}
          </h2>
          <p className="text-base lg:text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed">
            {description}
          </p>
        </div>
      </div>

      {/* Programs Grid - Full Width Cards without container */}
      <div className="relative z-10 py-8 lg:py-12 px-4 sm:px-6 lg:px-8 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {programs.map((program, index) => (
            <div
              key={index}
              className="transition-all duration-500 opacity-0 animate-fade-in"
              style={{
                animationDelay: `${index * 120}ms`,
                animationFillMode: 'forwards',
              }}
            >
              <ProgramCard
                title={program.title}
                description={program.description}
                image={program.image}
                link={program.link}
                buttonText={program.buttonText}
              />
            </div>
          ))}
        </div>
      </div>

      {/* CTA with elegant styling - In Container */}
      {showViewAllButton && (
        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <div className="text-center">
            <Button
              href={viewAllLink}
              variant="primary"
              size="lg"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              }
              iconPosition="right"
            >
              {viewAllText}
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
