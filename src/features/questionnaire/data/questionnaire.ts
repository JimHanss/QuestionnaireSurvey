import { QuestionDefinition, QuestionnaireValues, SectionDefinition } from '../types';

export const sections: SectionDefinition[] = [
  {
    id: 'project-frame',
    title: 'Project Frame',
    summary:
      'Capture the product context, audience, and the business signal that justifies the build.'
  },
  {
    id: 'scope-shaping',
    title: 'Scope Shaping',
    summary:
      'Decide which capability branches are relevant, what modules matter most, and where integrations appear.'
  },
  {
    id: 'delivery-guardrails',
    title: 'Delivery Guardrails',
    summary:
      'Collect delivery constraints, platform expectations, and the quality bar for acceptance.'
  }
];

export const questionnaireQuestions: QuestionDefinition[] = [
  {
    id: 'projectType',
    sectionId: 'project-frame',
    type: 'radio',
    title: 'What kind of software initiative are we shaping?',
    helperText: 'This answer influences the follow-up path and the final report narrative.',
    required: true,
    skippable: false,
    options: [
      { label: 'Internal business system', value: 'internal' },
      { label: 'Customer-facing SaaS product', value: 'saas' },
      { label: 'Mobile-first experience', value: 'mobile' }
    ]
  },
  {
    id: 'targetUsers',
    sectionId: 'project-frame',
    type: 'textarea',
    title: 'Who are the primary users and what problem should this system solve for them?',
    helperText: 'A short problem statement keeps later scope decisions grounded.',
    placeholder: 'Example: Operations managers need a faster way to approve vendor requests...',
    required: true,
    skippable: false
  },
  {
    id: 'businessCriticality',
    sectionId: 'project-frame',
    type: 'select',
    title: 'How critical is this system to day-to-day operations?',
    helperText: 'Optional if the business impact is still being discussed.',
    required: false,
    skippable: true,
    options: [
      { label: 'Select one', value: '' },
      { label: 'Nice to have', value: 'low' },
      { label: 'Important but not blocking', value: 'medium' },
      { label: 'Mission-critical workflow', value: 'high' }
    ]
  },
  {
    id: 'expectedAudienceSize',
    sectionId: 'project-frame',
    type: 'select',
    title: 'What is the expected user scale in the first release?',
    helperText: 'This helps frame non-functional expectations.',
    required: false,
    skippable: true,
    options: [
      { label: 'Select one', value: '' },
      { label: 'Under 100 users', value: 'small' },
      { label: '100 to 1,000 users', value: 'mid' },
      { label: 'More than 1,000 users', value: 'large' }
    ]
  },
  {
    id: 'requiresAuthentication',
    sectionId: 'scope-shaping',
    type: 'radio',
    title: 'Does the product require authentication and role-based access?',
    helperText: 'If yes, we will ask one more question about roles.',
    required: true,
    skippable: false,
    options: [
      { label: 'Yes', value: 'yes' },
      { label: 'No', value: 'no' }
    ]
  },
  {
    id: 'roleModel',
    sectionId: 'scope-shaping',
    type: 'checkbox',
    title: 'Which roles should be available in the first release?',
    helperText: 'Select every role that needs dedicated permissions.',
    required: true,
    skippable: false,
    visibleWhen: {
      questionId: 'requiresAuthentication',
      operator: 'equals',
      value: 'yes'
    },
    options: [
      { label: 'Administrator', value: 'admin' },
      { label: 'Manager', value: 'manager' },
      { label: 'Standard user', value: 'member' },
      { label: 'Read-only stakeholder', value: 'viewer' }
    ]
  },
  {
    id: 'coreModules',
    sectionId: 'scope-shaping',
    type: 'checkbox',
    title: 'Which modules are definitely in scope for version 1?',
    helperText: 'Choose the smallest set that must exist for launch.',
    required: true,
    skippable: false,
    options: [
      { label: 'User management', value: 'user-management' },
      { label: 'Workflow dashboard', value: 'workflow-dashboard' },
      { label: 'Reporting and analytics', value: 'reporting' },
      { label: 'Notifications', value: 'notifications' }
    ]
  },
  {
    id: 'needsIntegration',
    sectionId: 'scope-shaping',
    type: 'radio',
    title: 'Will the product integrate with any third-party or internal systems?',
    helperText: 'Optional if discovery is still early.',
    required: false,
    skippable: true,
    options: [
      { label: 'Yes', value: 'yes' },
      { label: 'No', value: 'no' },
      { label: 'Unknown yet', value: 'unknown' }
    ]
  },
  {
    id: 'integrationDetails',
    sectionId: 'scope-shaping',
    type: 'textarea',
    title: 'Which systems need to be connected and why?',
    helperText: 'Capture APIs, ERP platforms, payment providers, or data feeds if known.',
    placeholder: 'Example: Sync customer status from Salesforce every hour...',
    required: false,
    skippable: true,
    visibleWhen: {
      questionId: 'needsIntegration',
      operator: 'equals',
      value: 'yes'
    }
  },
  {
    id: 'supportedPlatforms',
    sectionId: 'delivery-guardrails',
    type: 'checkbox',
    title: 'Which delivery platforms must be supported at launch?',
    helperText: 'The answer affects responsive design and QA scope.',
    required: true,
    skippable: false,
    options: [
      { label: 'Desktop web', value: 'desktop-web' },
      { label: 'Tablet web', value: 'tablet-web' },
      { label: 'Mobile web', value: 'mobile-web' },
      { label: 'Native mobile later', value: 'native-later' }
    ]
  },
  {
    id: 'launchWindow',
    sectionId: 'delivery-guardrails',
    type: 'select',
    title: 'What is the desired launch window?',
    helperText: 'Required so the report can flag schedule pressure.',
    required: true,
    skippable: false,
    options: [
      { label: 'Select one', value: '' },
      { label: 'Less than 1 month', value: 'urgent' },
      { label: '1 to 3 months', value: 'near-term' },
      { label: '3 to 6 months', value: 'planned' },
      { label: 'More than 6 months', value: 'open' }
    ]
  },
  {
    id: 'qualityExpectations',
    sectionId: 'delivery-guardrails',
    type: 'checkbox',
    title: 'Which non-functional expectations must be addressed?',
    helperText: 'Pick the quality signals that the team cannot trade away.',
    required: true,
    skippable: false,
    options: [
      { label: 'Audit trail', value: 'audit' },
      { label: 'Performance under load', value: 'performance' },
      { label: 'Accessibility compliance', value: 'accessibility' },
      { label: 'Security hardening', value: 'security' }
    ]
  },
  {
    id: 'openRisks',
    sectionId: 'delivery-guardrails',
    type: 'textarea',
    title: 'Are there open risks, assumptions, or blockers we should surface now?',
    helperText: 'Optional, but useful for the final report.',
    placeholder: 'Example: Legacy API documentation is incomplete...',
    required: false,
    skippable: true
  }
];

export const createInitialValues = (
  questions: QuestionDefinition[]
): QuestionnaireValues =>
  questions.reduce<QuestionnaireValues>((accumulator, question) => {
    accumulator[question.id] = question.type === 'checkbox' ? [] : '';
    return accumulator;
  }, {});
