import { vi, type Mock } from "vitest";

export type StripeMocks = {
  checkout: {
    sessions: {
      retrieve: Mock;
    };
  };
  webhooks: {
    constructEvent: Mock;
  };
  disputes: {
    update: Mock;
  };
};

export type StripeClientMock = StripeMocks;

export function buildStripeMocks(): {
  stripe: StripeClientMock;
  mocks: StripeMocks;
} {
  return createStripeMock();
}

export function createStripeMock(): {
  stripe: StripeClientMock;
  mocks: StripeMocks;
} {
  const mocks: StripeMocks = {
    checkout: {
      sessions: {
        retrieve: vi.fn(),
      },
    },
    webhooks: {
      constructEvent: vi.fn(),
    },
    disputes: {
      update: vi.fn().mockResolvedValue({}),
    },
  };

  return { stripe: mocks, mocks };
}

export function resetStripeMock(mocks: StripeMocks): void {
  mocks.checkout.sessions.retrieve.mockReset();
  mocks.webhooks.constructEvent.mockReset();
  mocks.disputes.update.mockReset().mockResolvedValue({});
}
