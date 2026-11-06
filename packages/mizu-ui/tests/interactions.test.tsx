// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ImageUpload, MessageComposer, OfferForm } from '../src/index.js';

afterEach(() => cleanup());

it('validates image type and keeps a selected file available after an upload failure', async () => {
  const user = userEvent.setup({ applyAccept: false });
  const upload = vi.fn().mockRejectedValueOnce(new Error('Network interrupted')).mockResolvedValueOnce(undefined);
  const { container } = render(<ImageUpload onFileSelect={upload} />);
  const input = container.querySelector('input[type="file"]') as HTMLInputElement;

  await user.upload(input, new File(['wrong'], 'notes.txt', { type: 'text/plain' }));
  expect(screen.getByRole('alert').textContent).toContain('PNG or JPG');
  expect(upload).not.toHaveBeenCalled();

  await user.upload(input, new File(['image'], 'kohaku.jpg', { type: 'image/jpeg' }));
  await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('Network interrupted'));
  expect(upload).toHaveBeenCalledTimes(1);

  await user.upload(input, new File(['image'], 'kohaku.jpg', { type: 'image/jpeg' }));
  await waitFor(() => expect(screen.getByText('kohaku.jpg')).toBeTruthy());
  expect(screen.getByText('Replace image')).toBeTruthy();
});

it('preserves an unsent message and permits retry after failure', async () => {
  const user = userEvent.setup();
  const send = vi.fn().mockRejectedValueOnce(new Error('Service unavailable')).mockResolvedValueOnce(undefined);
  render(<MessageComposer onSend={send} />);
  const field = screen.getByLabelText('Message to seller') as HTMLInputElement;
  await user.type(field, 'Can we arrange Saturday collection?');
  await user.click(screen.getByRole('button', { name: 'Send' }));
  await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('Service unavailable'));
  expect(field.value).toBe('Can we arrange Saturday collection?');
  await user.click(screen.getByRole('button', { name: 'Send' }));
  await waitFor(() => expect(field.value).toBe(''));
  expect(send).toHaveBeenCalledTimes(2);
});

it('validates an offer and preserves its draft when submission fails', async () => {
  const user = userEvent.setup();
  const submit = vi.fn().mockRejectedValue(new Error('Offer service unavailable'));
  render(<OfferForm askingPrice="$2,400" specimen="Kohaku" currency="USD" handoverOptions={[{ value: 'pondside', label: 'Pondside collection' }]} onSubmit={submit} />);
  await user.click(screen.getByRole('button', { name: 'Send offer & open thread' }));
  expect(screen.getByText('Enter an amount greater than zero.')).toBeTruthy();
  expect(screen.getByText('Choose a handover preference.')).toBeTruthy();
  expect(screen.getByText('Add a message before sending.')).toBeTruthy();

  const amount = screen.getByLabelText('Your offer (USD)') as HTMLInputElement;
  const handover = screen.getByLabelText('Handover preference') as HTMLSelectElement;
  const message = screen.getByLabelText('Message to seller') as HTMLTextAreaElement;
  await user.type(amount, '2300');
  await user.selectOptions(handover, 'pondside');
  await user.type(message, 'I can collect this week.');
  await user.click(screen.getByRole('button', { name: 'Send offer & open thread' }));
  await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('Offer service unavailable'));
  expect(submit).toHaveBeenCalledWith({ amount: '2300', handover: 'pondside', message: 'I can collect this week.' });
  expect(amount.value).toBe('2300');
  expect(message.value).toBe('I can collect this week.');
});
