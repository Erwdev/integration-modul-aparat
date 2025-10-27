export const APP_CONSTANTS = {
    DEFAULT_PORT: 3000,
    DEFAULT_HOST: 'localhost',
    DEFAULT_DB_PORT: 5432,
    APP_NAME: 'Aparat Backend API - Sprint 1',
    APP_VERSION: '1.0.0',
    STATUS: {
        ACTIVE: 'active',
        INACTIVE: 'inactive',
        MAINTENANCE: 'maintenance',
    },
    ROLES: {
        ADMIN: 'ADMIN',
        USER: 'USER',
        MODERATOR: 'MODERATOR',
    },
} as const;