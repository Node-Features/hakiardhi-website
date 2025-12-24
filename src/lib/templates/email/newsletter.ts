/**
 * Monthly Newsletter Email Template
 * Engaging newsletter with stories, updates, and calls-to-action
 */

import {
  generateEmailTemplate,
  heading,
  textBlock,
  bulletList,
  statsRow,
  alertBox,
} from './base-template';

export interface NewsletterData {
  subscriberName?: string;
  month: string;
  year: number;
  featuredStory: {
    title: string;
    summary: string;
    imageUrl?: string;
    readMoreUrl: string;
  };
  monthlyStats?: {
    casesHandled: number;
    peopleTrained: number;
    communitiesReached: number;
  };
  upcomingEvents?: Array<{
    title: string;
    date: string;
    location: string;
    registerUrl?: string;
  }>;
  recentBlogs?: Array<{
    title: string;
    excerpt: string;
    url: string;
  }>;
  callToAction?: {
    title: string;
    description: string;
    buttonText: string;
    url: string;
  };
}

export function generateMonthlyNewsletter(data: NewsletterData): string {
  const {
    subscriberName,
    month,
    year,
    featuredStory,
    monthlyStats,
    upcomingEvents,
    recentBlogs,
    callToAction,
  } = data;

  // Build monthly stats section
  const statsSection = monthlyStats
    ? `
    ${heading(`${month} ${year} Impact at a Glance`, 2)}
    ${statsRow([
      { number: monthlyStats.casesHandled.toString(), label: 'Legal Aid Cases Handled' },
      { number: monthlyStats.peopleTrained.toString(), label: 'Community Members Trained' },
      { number: monthlyStats.communitiesReached.toString(), label: 'Communities Reached' },
    ])}
  `
    : '';

  // Build events section
  const eventsSection = upcomingEvents
    ? `
    ${heading('Upcoming Events & Training', 2)}
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom: 24px;">
      ${upcomingEvents
        .map(
          event => `
        <tr>
          <td style="padding: 16px; background-color: #f9fafb; border-left: 4px solid #D62828; border-radius: 8px; margin-bottom: 12px;">
            <p style="font-size: 16px; font-weight: 600; color: #101828; margin-bottom: 4px;">${event.title}</p>
            <p style="font-size: 14px; color: #667085; margin-bottom: 4px;">📅 ${event.date}</p>
            <p style="font-size: 14px; color: #667085; margin-bottom: ${event.registerUrl ? '8px' : '0'};">📍 ${event.location}</p>
            ${
              event.registerUrl
                ? `
            <a href="${event.registerUrl}" style="font-size: 14px; color: #D62828; font-weight: 600; text-decoration: none;">Register Now →</a>
            `
                : ''
            }
          </td>
        </tr>
        <tr><td style="height: 12px;"></td></tr>
      `
        )
        .join('')}
    </table>
  `
    : '';

  // Build blog section
  const blogsSection = recentBlogs
    ? `
    ${heading('Latest from Our Blog & Research', 2)}
    ${recentBlogs
      .map(
        blog => `
      ${textBlock(`<strong style="color: #101828;">${blog.title}</strong><br>${blog.excerpt} <a href="${blog.url}" style="color: #D62828; font-weight: 600; text-decoration: none;">Read more →</a>`)}
    `
      )
      .join('')}
  `
    : '';

  // Build CTA section
  const ctaSection = callToAction
    ? `
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-top: 32px; margin-bottom: 24px; background: linear-gradient(135deg, #D62828 0%, #b71c1c 100%); border-radius: 12px; padding: 32px; text-align: center;">
      <tr>
        <td>
          <h2 style="font-size: 24px; font-weight: 700; color: #FFFFFF; margin-bottom: 12px;">${callToAction.title}</h2>
          <p style="font-size: 16px; color: #FBEAEA; line-height: 1.7; margin-bottom: 24px;">${callToAction.description}</p>
          <table cellpadding="0" cellspacing="0" role="presentation" align="center">
            <tr>
              <td style="border-radius: 24px; background-color: #FFFFFF;">
                <a href="${callToAction.url}" style="display: inline-block; padding: 12px 40px; font-size: 16px; font-weight: 600; color: #D62828; text-decoration: none; border-radius: 24px;">
                  ${callToAction.buttonText}
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `
    : '';

  const bodyContent = `
    ${heading(`${month} ${year} Newsletter`, 1)}

    ${textBlock('Habari from the HakiArdhi team! Here are the latest updates on our work defending land rights and empowering communities across Tanzania.')}

    ${statsSection}

    ${heading('Featured Story: ' + featuredStory.title, 2)}

    ${
      featuredStory.imageUrl
        ? `
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom: 16px;">
      <tr>
        <td>
          <img src="${featuredStory.imageUrl}" alt="${featuredStory.title}" width="100%" style="display: block; border-radius: 8px; height: auto;" />
        </td>
      </tr>
    </table>
    `
        : ''
    }

    ${textBlock(featuredStory.summary)}

    <table cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom: 32px;">
      <tr>
        <td>
          <a href="${featuredStory.readMoreUrl}" style="font-size: 16px; color: #D62828; font-weight: 600; text-decoration: none;">Read the full story →</a>
        </td>
      </tr>
    </table>

    ${eventsSection}

    ${blogsSection}

    ${ctaSection}

    ${textBlock('Thank you for being part of the HakiArdhi community. Together, we are securing land rights for all.')}
  `;

  return generateEmailTemplate({
    logoUrl: `${process.env.NEXT_PUBLIC_APP_URL}/images/logo-white.png`,
    preheaderText: `${month} ${year} - Featured: ${featuredStory.title}`,
    recipientName: subscriberName,
    bodyContent,
    footerText:
      'You are receiving this newsletter because you subscribed to HakiArdhi updates.',
    socialLinks: {
      facebook: 'https://facebook.com/hakiardhi',
      twitter: 'https://twitter.com/hakiardhi',
      instagram: 'https://instagram.com/hakiardhi',
      linkedin: 'https://linkedin.com/company/hakiardhi',
      youtube: 'https://youtube.com/@hakiardhi',
    },
    unsubscribeUrl: `${process.env.NEXT_PUBLIC_APP_URL}/newsletter/unsubscribe`,
  });
}
