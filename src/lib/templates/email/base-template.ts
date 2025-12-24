/**
 * Email Base Template
 * HakiArdhi branded email template matching Public Portal design
 *
 * Brand Colors:
 * - Primary Red: #D62828
 * - Black: #000000
 * - White: #FFFFFF
 * - Gray Light: #f9fafb
 * - Gray Border: #e4e7ec
 * - Gray Text: #667085
 */

export interface EmailTemplateData {
  logoUrl: string;
  preheaderText?: string;
  headerTitle?: string;
  recipientName?: string;
  bodyContent: string;
  ctaButton?: {
    text: string;
    url: string;
  };
  secondaryButton?: {
    text: string;
    url: string;
  };
  footerText?: string;
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
  };
  unsubscribeUrl?: string;
}

/**
 * Generate base HTML email template
 */
export function generateEmailTemplate(data: EmailTemplateData): string {
  const {
    logoUrl,
    preheaderText,
    headerTitle,
    recipientName,
    bodyContent,
    ctaButton,
    secondaryButton,
    footerText,
    socialLinks,
    unsubscribeUrl,
  } = data;

  const currentYear = new Date().getFullYear();

  return `
<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="x-apple-disable-message-reformatting">
  <meta http-equiv="x-ua-compatible" content="ie=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="format-detection" content="telephone=no, date=no, address=no, email=no">
  <!--[if mso]>
  <xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml>
  <![endif]-->
  <title>${headerTitle || 'HakiArdhi - Land Rights Research & Resources Institute'}</title>
  <style>
    /* Reset styles */
    body, table, td, a {
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    table, td {
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    img {
      -ms-interpolation-mode: bicubic;
      border: 0;
      height: auto;
      line-height: 100%;
      outline: none;
      text-decoration: none;
    }

    /* Body styles */
    body {
      margin: 0;
      padding: 0;
      width: 100%;
      background-color: #f9fafb;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    /* Typography */
    h1, h2, h3, p {
      margin: 0;
      padding: 0;
    }

    h1 {
      font-size: 28px;
      font-weight: 700;
      color: #101828;
      line-height: 1.3;
      margin-bottom: 16px;
    }

    h2 {
      font-size: 22px;
      font-weight: 600;
      color: #101828;
      line-height: 1.4;
      margin-bottom: 12px;
    }

    h3 {
      font-size: 18px;
      font-weight: 600;
      color: #101828;
      line-height: 1.5;
      margin-bottom: 8px;
    }

    p {
      font-size: 16px;
      font-weight: 400;
      color: #667085;
      line-height: 1.7;
      margin-bottom: 16px;
    }

    .caption {
      font-size: 14px;
      color: #98a2b3;
      line-height: 1.6;
    }

    /* Button styles */
    .button-primary {
      display: inline-block;
      padding: 12px 40px;
      font-size: 16px;
      font-weight: 600;
      color: #FFFFFF !important;
      text-decoration: none;
      border-radius: 24px;
      background-color: #D62828;
    }

    .button-secondary {
      display: inline-block;
      padding: 12px 40px;
      font-size: 16px;
      font-weight: 600;
      color: #D62828 !important;
      text-decoration: none;
      border-radius: 24px;
      background-color: #FBEAEA;
    }

    /* Responsive */
    @media only screen and (max-width: 600px) {
      .wrapper {
        width: 100% !important;
      }
      .content {
        padding: 24px !important;
      }
      h1 {
        font-size: 24px !important;
      }
      h2 {
        font-size: 20px !important;
      }
      .button-primary, .button-secondary {
        display: block !important;
        width: 100% !important;
        text-align: center !important;
      }
    }

    /* Preheader text (hidden) */
    .preheader {
      display: none;
      max-height: 0;
      max-width: 0;
      opacity: 0;
      overflow: hidden;
      mso-hide: all;
      visibility: hidden;
    }
  </style>
</head>

<body style="margin: 0; padding: 0; background-color: #f9fafb;">

  ${preheaderText ? `
  <!-- Preheader text -->
  <div class="preheader">
    ${preheaderText}
  </div>
  ` : ''}

  <!-- Email wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #f9fafb;">
    <tr>
      <td align="center" style="padding: 40px 20px;">

        <!-- Main content container (600px) -->
        <table class="wrapper" width="600" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);">

          <!-- Header (Red bar with logo) -->
          <tr>
            <td style="padding: 24px 40px; background-color: #D62828; border-radius: 8px 8px 0 0;">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <!-- Logo -->
                  <td width="180">
                    <img src="${logoUrl}" alt="HakiArdhi" width="160" style="display: block; height: auto;" />
                  </td>
                  <!-- Contact info -->
                  <td align="right" style="color: #FFFFFF; font-size: 14px; font-weight: 500;">
                    <span style="display: block;">Mon - Fri: 08:00 - 17:00</span>
                    <span style="display: block; margin-top: 4px;">+255 784 646 752</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          ${recipientName ? `
          <!-- Greeting -->
          <tr>
            <td class="content" style="padding: 32px 40px 0 40px;">
              <p style="font-size: 18px; color: #101828; margin-bottom: 24px;">
                Habari ${recipientName},
              </p>
            </td>
          </tr>
          ` : ''}

          <!-- Body content -->
          <tr>
            <td class="content" style="padding: ${recipientName ? '0 40px 40px 40px' : '40px'};">
              ${bodyContent}
            </td>
          </tr>

          ${ctaButton ? `
          <!-- Primary CTA Button -->
          <tr>
            <td align="center" style="padding: 0 40px 32px 40px;">
              <table cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td style="border-radius: 24px; background-color: #D62828;">
                    <a href="${ctaButton.url}" class="button-primary" style="display: inline-block; padding: 12px 40px; font-size: 16px; font-weight: 600; color: #FFFFFF; text-decoration: none; border-radius: 24px; background-color: #D62828;">
                      ${ctaButton.text}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ` : ''}

          ${secondaryButton ? `
          <!-- Secondary Button -->
          <tr>
            <td align="center" style="padding: 0 40px 32px 40px;">
              <table cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td style="border-radius: 24px; background-color: #FBEAEA;">
                    <a href="${secondaryButton.url}" class="button-secondary" style="display: inline-block; padding: 12px 40px; font-size: 16px; font-weight: 600; color: #D62828; text-decoration: none; border-radius: 24px; background-color: #FBEAEA;">
                      ${secondaryButton.text}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ` : ''}

          <!-- Divider -->
          <tr>
            <td style="padding: 0 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td style="border-top: 1px solid #e4e7ec;"></td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer (Light gray background) -->
          <tr>
            <td style="padding: 32px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px;">

              ${footerText ? `
              <p class="caption" style="font-size: 14px; color: #667085; line-height: 1.6; margin-bottom: 16px;">
                ${footerText}
              </p>
              ` : ''}

              ${socialLinks ? `
              <!-- Social media icons -->
              <table cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom: 16px;">
                <tr>
                  ${socialLinks.facebook ? `
                  <td style="padding-right: 12px;">
                    <a href="${socialLinks.facebook}" style="text-decoration: none;">
                      <img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" width="24" height="24" alt="Facebook" style="display: block;" />
                    </a>
                  </td>
                  ` : ''}
                  ${socialLinks.twitter ? `
                  <td style="padding-right: 12px;">
                    <a href="${socialLinks.twitter}" style="text-decoration: none;">
                      <img src="https://cdn-icons-png.flaticon.com/512/733/733579.png" width="24" height="24" alt="Twitter" style="display: block;" />
                    </a>
                  </td>
                  ` : ''}
                  ${socialLinks.instagram ? `
                  <td style="padding-right: 12px;">
                    <a href="${socialLinks.instagram}" style="text-decoration: none;">
                      <img src="https://cdn-icons-png.flaticon.com/512/733/733558.png" width="24" height="24" alt="Instagram" style="display: block;" />
                    </a>
                  </td>
                  ` : ''}
                  ${socialLinks.linkedin ? `
                  <td style="padding-right: 12px;">
                    <a href="${socialLinks.linkedin}" style="text-decoration: none;">
                      <img src="https://cdn-icons-png.flaticon.com/512/733/733561.png" width="24" height="24" alt="LinkedIn" style="display: block;" />
                    </a>
                  </td>
                  ` : ''}
                  ${socialLinks.youtube ? `
                  <td style="padding-right: 12px;">
                    <a href="${socialLinks.youtube}" style="text-decoration: none;">
                      <img src="https://cdn-icons-png.flaticon.com/512/733/733646.png" width="24" height="24" alt="YouTube" style="display: block;" />
                    </a>
                  </td>
                  ` : ''}
                </tr>
              </table>
              ` : ''}

              <!-- Contact information -->
              <p class="caption" style="font-size: 12px; color: #98a2b3; line-height: 1.6; margin-bottom: 8px;">
                <strong style="color: #667085;">HakiArdhi</strong><br>
                Land Rights Research & Resources Institute<br>
                P.O. Box 2775, Arusha, Tanzania<br>
                Email: info@hakiardhi.or.tz | Phone: +255 784 646 752
              </p>

              <!-- Copyright -->
              <p class="caption" style="font-size: 12px; color: #98a2b3; text-align: center; margin-top: 16px; margin-bottom: 0;">
                © ${currentYear} HakiArdhi. All rights reserved.
              </p>

              ${unsubscribeUrl ? `
              <!-- Unsubscribe link -->
              <p class="caption" style="font-size: 12px; color: #98a2b3; text-align: center; margin-top: 8px; margin-bottom: 0;">
                <a href="${unsubscribeUrl}" style="color: #D62828; text-decoration: underline;">Unsubscribe</a> from these emails
              </p>
              ` : ''}

            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
  `.trim();
}

/**
 * Helper: Generate simple text content block
 */
export function textBlock(content: string): string {
  return `<p style="font-size: 16px; color: #667085; line-height: 1.7; margin-bottom: 16px;">${content}</p>`;
}

/**
 * Helper: Generate heading
 */
export function heading(text: string, level: 1 | 2 | 3 = 2): string {
  const sizes = {
    1: { fontSize: '28px', marginBottom: '16px' },
    2: { fontSize: '22px', marginBottom: '12px' },
    3: { fontSize: '18px', marginBottom: '8px' },
  };

  const { fontSize, marginBottom } = sizes[level];

  return `<h${level} style="font-size: ${fontSize}; font-weight: ${level === 1 ? 700 : 600}; color: #101828; line-height: ${level === 1 ? 1.3 : level === 2 ? 1.4 : 1.5}; margin-bottom: ${marginBottom};">${text}</h${level}>`;
}

/**
 * Helper: Generate stat card (for impact metrics)
 */
export function statCard(number: string, label: string): string {
  return `
  <table cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom: 24px; background-color: #FBEAEA; border-radius: 12px; padding: 24px;">
    <tr>
      <td align="center">
        <p style="font-size: 48px; font-weight: 900; color: #D62828; line-height: 1; margin-bottom: 8px;">${number}</p>
        <p style="font-size: 14px; font-weight: 600; color: #667085; line-height: 1.4; margin: 0;">${label}</p>
      </td>
    </tr>
  </table>
  `;
}

/**
 * Helper: Generate horizontal stats row (for dashboards)
 */
export function statsRow(stats: Array<{ number: string; label: string }>): string {
  const columns = stats.map(stat => `
    <td width="${100 / stats.length}%" align="center" style="padding: 16px;">
      <p style="font-size: 32px; font-weight: 900; color: #D62828; line-height: 1; margin-bottom: 8px;">${stat.number}</p>
      <p style="font-size: 12px; font-weight: 600; color: #667085; line-height: 1.4; margin: 0;">${stat.label}</p>
    </td>
  `).join('');

  return `
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom: 24px; background-color: #FBEAEA; border-radius: 12px;">
    <tr>
      ${columns}
    </tr>
  </table>
  `;
}

/**
 * Helper: Generate alert box (info, success, warning, error)
 */
export function alertBox(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info'): string {
  const colors = {
    info: { bg: '#EBF5FF', border: '#0ba5ec', text: '#0086c9' },
    success: { bg: '#ECFDF3', border: '#12b76a', text: '#039855' },
    warning: { bg: '#FEF6EE', border: '#f79009', text: '#dc6803' },
    error: { bg: '#FEF3F2', border: '#f04438', text: '#d92d20' },
  };

  const color = colors[type];

  return `
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom: 24px;">
    <tr>
      <td style="padding: 16px; background-color: ${color.bg}; border-left: 4px solid ${color.border}; border-radius: 8px;">
        <p style="font-size: 14px; color: ${color.text}; line-height: 1.6; margin: 0;">${message}</p>
      </td>
    </tr>
  </table>
  `;
}

/**
 * Helper: Generate bullet list
 */
export function bulletList(items: string[]): string {
  const listItems = items.map(item => `
    <tr>
      <td style="padding-bottom: 8px;">
        <table cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td style="width: 24px; vertical-align: top; padding-top: 4px;">
              <span style="display: inline-block; width: 6px; height: 6px; background-color: #D62828; border-radius: 50%;"></span>
            </td>
            <td style="font-size: 16px; color: #667085; line-height: 1.7;">${item}</td>
          </tr>
        </table>
      </td>
    </tr>
  `).join('');

  return `
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom: 24px;">
    ${listItems}
  </table>
  `;
}
