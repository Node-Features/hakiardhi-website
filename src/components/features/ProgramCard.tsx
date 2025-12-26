import Image from 'next/image';
import Button from '../ui/Button';

export interface ProgramCardProps {
  title: string;
  description: string;
  image: string;
  link: string;
  buttonText?: string;
  category?: string;
  date?: string;
  location?: string;
  participants?: number;
  className?: string;
}

export default function ProgramCard({
  title,
  description,
  image,
  link,
  buttonText = 'Learn More',
  category,
  date,
  location,
  participants,
  className = '',
}: ProgramCardProps) {
  return (
    <div
      className={`group bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm rounded-2xl border border-brand-500/20 hover:border-brand-500/40 transition-all duration-300 overflow-hidden ${className}`}
    >
      {/* Image Section */}
      <div className="relative h-48 overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-all duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      </div>

      {/* Content Section */}
      <div className="p-6 lg:p-8">
        {/* Category Badge */}
        {category && (
          <div className="mb-3">
            <span className="px-3 py-1 text-xs font-bold bg-brand-500/20 text-brand-400 rounded-full border border-brand-500/30">
              {category}
            </span>
          </div>
        )}

        <h3 className="text-2xl font-black text-white mb-3 group-hover:text-brand-500 transition-colors">
          {title}
        </h3>
        <p className="text-gray-300 mb-4 leading-relaxed">
          {description}
        </p>

        {/* Metadata Section */}
        {(date || location || participants) && (
          <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-gray-400">
            {date && (
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span>{new Date(date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              </div>
            )}
            {location && (
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span>{location}</span>
              </div>
            )}
            {participants && (
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
                <span>{participants} Participants</span>
              </div>
            )}
          </div>
        )}

        {/* Button */}
        <Button
          href={link}
          variant="secondary"
          size="md"
          iconPosition="right"
          icon={
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          }
        >
          {buttonText}
        </Button>
      </div>
    </div>
  );
}
