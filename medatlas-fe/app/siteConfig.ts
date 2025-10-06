export const siteConfig = {
  name: 'Medatles',
  url: 'http://localhost:3000',
  description: 'Uberizing inventory management.',
  baseLinks: {
    home: '/dashboard',
    timesheets: {
      verification: '/timesheets',
      management: '/timesheets/management',
      approvals: '/timesheets/approvals',
    },
    incidents: {
      incidentsList: '/incidents',
      incidentsCreate: '/incidents/create',
      goback: '/incidents',
    },
    setting: {
      profile: '/settings',
      account: '/settings/account',
      invites: '/settings/invited',
    },
  },
} as const;

export type SiteConfig = typeof siteConfig;
