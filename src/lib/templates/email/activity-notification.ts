/**
 * Activity & Assignment Notification Email Template
 * For staff assignments, beneficiary notifications, and training invitations
 */

import {
  generateEmailTemplate,
  heading,
  textBlock,
  alertBox,
  bulletList,
} from './base-template';

export interface ActivityNotificationData {
  recipientName: string;
  notificationType: 'assignment' | 'beneficiary_selection' | 'training_invitation' | 'assignment_change';
  activityName: string;
  activityDescription?: string;
  activityType?: string;
  startDate: string;
  endDate?: string;
  location?: string;
  dueDate?: string;
  assignedBy?: string;
  responsibilities?: string[];
  requirements?: string[];
  trainingDetails?: {
    trainer: string;
    topics: string[];
    materialsUrl?: string;
  };
  changes?: {
    field: string;
    oldValue: string;
    newValue: string;
  }[];
  actionRequired?: string;
  confirmationUrl?: string;
}

export function generateActivityNotification(data: ActivityNotificationData): string {
  const {
    recipientName,
    notificationType,
    activityName,
    activityDescription,
    activityType,
    startDate,
    endDate,
    location,
    dueDate,
    assignedBy,
    responsibilities,
    requirements,
    trainingDetails,
    changes,
    actionRequired,
    confirmationUrl,
  } = data;

  // Title based on notification type
  const titles = {
    assignment: 'New Activity Assignment',
    beneficiary_selection: 'You\'ve Been Selected as a Beneficiary',
    training_invitation: 'Training Session Invitation',
    assignment_change: 'Activity Assignment Updated',
  };

  // Build details section
  const detailsSection = `
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom: 24px; background-color: #f9fafb; border-radius: 8px; padding: 24px;">
      <tr>
        <td style="padding-bottom: 12px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="35%" style="font-size: 14px; font-weight: 600; color: #667085;">Activity:</td>
              <td style="font-size: 14px; color: #101828; font-weight: 700;">${activityName}</td>
            </tr>
          </table>
        </td>
      </tr>
      ${
        activityType
          ? `
      <tr>
        <td style="padding-bottom: 12px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="35%" style="font-size: 14px; font-weight: 600; color: #667085;">Type:</td>
              <td style="font-size: 14px; color: #101828;">${activityType}</td>
            </tr>
          </table>
        </td>
      </tr>
      `
          : ''
      }
      <tr>
        <td style="padding-bottom: 12px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="35%" style="font-size: 14px; font-weight: 600; color: #667085;">Start Date:</td>
              <td style="font-size: 14px; color: #101828;">📅 ${startDate}</td>
            </tr>
          </table>
        </td>
      </tr>
      ${
        endDate
          ? `
      <tr>
        <td style="padding-bottom: 12px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="35%" style="font-size: 14px; font-weight: 600; color: #667085;">End Date:</td>
              <td style="font-size: 14px; color: #101828;">📅 ${endDate}</td>
            </tr>
          </table>
        </td>
      </tr>
      `
          : ''
      }
      ${
        location
          ? `
      <tr>
        <td style="padding-bottom: 12px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="35%" style="font-size: 14px; font-weight: 600; color: #667085;">Location:</td>
              <td style="font-size: 14px; color: #101828;">📍 ${location}</td>
            </tr>
          </table>
        </td>
      </tr>
      `
          : ''
      }
      ${
        dueDate
          ? `
      <tr>
        <td style="padding-bottom: 12px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="35%" style="font-size: 14px; font-weight: 600; color: #667085;">Due Date:</td>
              <td style="font-size: 14px; color: #D62828; font-weight: 700;">⏰ ${dueDate}</td>
            </tr>
          </table>
        </td>
      </tr>
      `
          : ''
      }
      ${
        assignedBy
          ? `
      <tr>
        <td>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="35%" style="font-size: 14px; font-weight: 600; color: #667085;">Assigned By:</td>
              <td style="font-size: 14px; color: #101828;">${assignedBy}</td>
            </tr>
          </table>
        </td>
      </tr>
      `
          : ''
      }
    </table>
  `;

  // Responsibilities section
  const responsibilitiesSection = responsibilities
    ? `
    ${heading('Your Responsibilities', 2)}
    ${bulletList(responsibilities)}
  `
    : '';

  // Requirements section
  const requirementsSection = requirements
    ? `
    ${heading('Requirements', 2)}
    ${bulletList(requirements)}
  `
    : '';

  // Training details section
  const trainingSection = trainingDetails
    ? `
    ${heading('Training Details', 2)}
    ${textBlock(`<strong>Trainer:</strong> ${trainingDetails.trainer}`)}
    ${heading('Topics to be covered:', 3)}
    ${bulletList(trainingDetails.topics)}
    ${
      trainingDetails.materialsUrl
        ? textBlock(`<a href="${trainingDetails.materialsUrl}" style="color: #D62828; font-weight: 600; text-decoration: none;">Download Training Materials →</a>`)
        : ''
    }
  `
    : '';

  // Changes section (for updates)
  const changesSection = changes
    ? `
    ${heading('Changes Made', 2)}
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom: 24px;">
      ${changes
        .map(
          change => `
        <tr>
          <td style="padding: 12px; background-color: #FEF6EE; border-left: 4px solid #fb6514; border-radius: 8px; margin-bottom: 8px;">
            <p style="font-size: 14px; font-weight: 600; color: #101828; margin-bottom: 4px;">${change.field}</p>
            <p style="font-size: 14px; color: #667085; margin-bottom: 2px;">
              <span style="text-decoration: line-through; color: #98a2b3;">Old: ${change.oldValue}</span>
            </p>
            <p style="font-size: 14px; color: #fb6514; font-weight: 600; margin: 0;">
              New: ${change.newValue}
            </p>
          </td>
        </tr>
        <tr><td style="height: 8px;"></td></tr>
      `
        )
        .join('')}
    </table>
  `
    : '';

  // Message based on notification type
  const introMessages = {
    assignment: `You have been assigned to a new activity. Please review the details below and confirm your availability.`,
    beneficiary_selection: `Congratulations! You have been selected as a beneficiary for the following activity. This is an opportunity for you to benefit from our programs.`,
    training_invitation: `You are invited to attend the following training session. This training is designed to enhance your skills and knowledge.`,
    assignment_change: `There have been updates to your activity assignment. Please review the changes below.`,
  };

  const bodyContent = `
    ${heading(titles[notificationType], 1)}

    ${textBlock(introMessages[notificationType])}

    ${dueDate ? alertBox(`⏰ Please confirm your participation by <strong>${dueDate}</strong>`, 'info') : ''}

    ${detailsSection}

    ${activityDescription ? textBlock(`<strong>Description:</strong> ${activityDescription}`) : ''}

    ${responsibilitiesSection}

    ${requirementsSection}

    ${trainingSection}

    ${changesSection}

    ${actionRequired ? alertBox(actionRequired, 'warning') : ''}

    ${textBlock('If you have any questions or concerns, please contact your supervisor or the project coordinator.')}
  `;

  return generateEmailTemplate({
    logoUrl: `${process.env.NEXT_PUBLIC_APP_URL}/images/logo-white.png`,
    preheaderText: `${titles[notificationType]}: ${activityName}`,
    recipientName,
    bodyContent,
    ctaButton: confirmationUrl
      ? {
          text: 'Confirm Participation',
          url: confirmationUrl,
        }
      : undefined,
    secondaryButton: {
      text: 'View in Dashboard',
      url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/activities`,
    },
    footerText:
      'This is an automated notification. Please do not reply to this email. For assistance, contact info@hakiardhi.or.tz',
    socialLinks: {
      facebook: 'https://facebook.com/hakiardhi',
      twitter: 'https://twitter.com/hakiardhi',
      linkedin: 'https://linkedin.com/company/hakiardhi',
    },
  });
}
