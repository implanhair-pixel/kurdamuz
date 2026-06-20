import type { CertificateTemplate, CertificateType } from '@/types/learning-paths';

/**
 * Default certificate templates for different certificate types
 */
export const CERTIFICATE_TEMPLATES: Record<CertificateType, CertificateTemplate> = {
  program_completion: {
    id: 'program-completion-template',
    name: 'Program Completion Certificate',
    type: 'program_completion',
    design: {
      backgroundColor: '#1a365d',
      textColor: '#ffffff',
      accentColor: '#ffd700',
      logoUrl: '/assets/logos/kurdamuz-logo.png',
      signatureUrl: '/assets/signatures/director-signature.png',
    },
    layout: {
      titlePosition: { x: 50, y: 50 },
      recipientPosition: { x: 50, y: 120 },
      datePosition: { x: 50, y: 180 },
      certificateNumberPosition: { x: 50, y: 220 },
    },
  },
  path_completion: {
    id: 'path-completion-template',
    name: 'Learning Path Completion Certificate',
    type: 'path_completion',
    design: {
      backgroundColor: '#2d3748',
      textColor: '#ffffff',
      accentColor: '#48bb78',
      logoUrl: '/assets/logos/kurdamuz-logo.png',
      signatureUrl: '/assets/signatures/director-signature.png',
    },
    layout: {
      titlePosition: { x: 50, y: 50 },
      recipientPosition: { x: 50, y: 120 },
      datePosition: { x: 50, y: 180 },
      certificateNumberPosition: { x: 50, y: 220 },
    },
  },
  skill_certificate: {
    id: 'skill-certificate-template',
    name: 'Skill Certificate',
    type: 'skill_certificate',
    design: {
      backgroundColor: '#553c9a',
      textColor: '#ffffff',
      accentColor: '#f6ad55',
      logoUrl: '/assets/logos/kurdamuz-logo.png',
      signatureUrl: '/assets/signatures/instructor-signature.png',
    },
    layout: {
      titlePosition: { x: 50, y: 50 },
      recipientPosition: { x: 50, y: 120 },
      datePosition: { x: 50, y: 180 },
      certificateNumberPosition: { x: 50, y: 220 },
    },
  },
  achievement_certificate: {
    id: 'achievement-certificate-template',
    name: 'Achievement Certificate',
    type: 'achievement_certificate',
    design: {
      backgroundColor: '#c53030',
      textColor: '#ffffff',
      accentColor: '#fbd38d',
      logoUrl: '/assets/logos/kurdamuz-logo.png',
      signatureUrl: '/assets/signatures/director-signature.png',
    },
    layout: {
      titlePosition: { x: 50, y: 50 },
      recipientPosition: { x: 50, y: 120 },
      datePosition: { x: 50, y: 180 },
      certificateNumberPosition: { x: 50, y: 220 },
    },
  },
};

/**
 * Get a certificate template by type
 */
export function getCertificateTemplate(type: CertificateType): CertificateTemplate {
  return CERTIFICATE_TEMPLATES[type];
}

/**
 * Get a certificate template by ID
 */
export function getCertificateTemplateById(id: string): CertificateTemplate | null {
  const templates = Object.values(CERTIFICATE_TEMPLATES);
  return templates.find(t => t.id === id) || null;
}

/**
 * Create a custom certificate template
 */
export function createCustomTemplate(
  baseType: CertificateType,
  customizations: Partial<CertificateTemplate>
): CertificateTemplate {
  const baseTemplate = CERTIFICATE_TEMPLATES[baseType];
  
  return {
    ...baseTemplate,
    ...customizations,
    id: `custom-${baseType}-${Date.now()}`,
    design: {
      ...baseTemplate.design,
      ...customizations.design,
    },
    layout: {
      ...baseTemplate.layout,
      ...customizations.layout,
    },
  };
}

/**
 * Validate a certificate template
 */
export function validateTemplate(template: CertificateTemplate): boolean {
  if (!template.id || !template.name || !template.type) {
    return false;
  }

  if (!template.design || !template.layout) {
    return false;
  }

  const requiredDesignFields = ['backgroundColor', 'textColor', 'accentColor'];
  for (const field of requiredDesignFields) {
    if (!(field in template.design)) {
      return false;
    }
  }

  const requiredLayoutFields = ['titlePosition', 'recipientPosition', 'datePosition'];
  for (const field of requiredLayoutFields) {
    if (!(field in template.layout)) {
      return false;
    }
  }

  return true;
}
