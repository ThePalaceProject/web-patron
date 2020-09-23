const mockEnvConfig = {}

jest.mock('next/config', () => () => ({ publicRuntimeConfig: mockEnvConfig }));
