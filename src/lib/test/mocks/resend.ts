import { vi, type Mock } from "vitest";

export type ResendEmailsMock = {
  send: Mock;
};

export type ResendMock = {
  emails: ResendEmailsMock;
};

export function createResendMock(): ResendMock {
  return {
    emails: {
      send: vi.fn().mockResolvedValue({ data: { id: "email_test_id" }, error: null }),
    },
  };
}

export function mockResendError(mock: ResendMock, message: string): void {
  mock.emails.send.mockResolvedValue({ data: null, error: { message, name: "ResendError" } });
}

export function mockResendThrow(mock: ResendMock, error: Error): void {
  mock.emails.send.mockRejectedValue(error);
}

export function resetResendMock(mock: ResendMock): void {
  mock.emails.send
    .mockReset()
    .mockResolvedValue({ data: { id: "email_test_id" }, error: null });
}
