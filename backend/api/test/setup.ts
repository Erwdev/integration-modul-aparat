process.env.NODE_ENV = 'test';

jest.setTimeout(10000);

global.console = {
  ...console,
  error: jest.fn(),
};

afterEach(() => {
  jest.clearAllMocks();
});

beforeAll(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterAll(() => {
  jest.restoreAllMocks();
});
