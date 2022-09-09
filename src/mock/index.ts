export const end = jest.fn();

export const json = jest.fn(() => ({
  end,
}));

export const res = {
  status: jest.fn(() => {
    return {
      json,
      end,
    };
  }),
};
export const next = jest.fn();

export const logger = {
  log: jest.fn(),
};
