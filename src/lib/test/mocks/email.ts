import { expect, vi, type Mock } from "vitest";

export type EmailMocks = {
  sendPurchaseConfirmation: Mock;
  sendInquiryNotification: Mock;
  sendContactConfirmation: Mock;
  sendEstimatorLeadNotification: Mock;
  escapeHtml: Mock;
};

export function buildEmailMocks(): EmailMocks {
  return createEmailMocks();
}

export function createEmailMocks(): EmailMocks {
  return {
    sendPurchaseConfirmation: vi.fn().mockResolvedValue(undefined),
    sendInquiryNotification: vi.fn().mockResolvedValue(undefined),
    sendContactConfirmation: vi.fn().mockResolvedValue(undefined),
    sendEstimatorLeadNotification: vi.fn().mockResolvedValue(undefined),
    escapeHtml: vi.fn((value: string) => value),
  };
}

export function createEmailMockModule(emailMocks: EmailMocks) {
  return emailMocks;
}

export function expectEmailSent(
  mock: Mock,
  expected: { email: string; productName?: string },
): void {
  expect(mock).toHaveBeenCalledTimes(1);
  expect(mock).toHaveBeenCalledWith(
    expect.objectContaining({
      email: expected.email,
      ...(expected.productName
        ? { productName: expected.productName }
        : {}),
    }),
  );
}

export function resetEmailMocks(mocks: EmailMocks): void {
  for (const mock of Object.values(mocks)) {
    mock.mockReset();
    if (mock.getMockName() !== "escapeHtml") {
      mock.mockResolvedValue(undefined);
    }
  }
  mocks.escapeHtml.mockImplementation((value: string) => value);
}
