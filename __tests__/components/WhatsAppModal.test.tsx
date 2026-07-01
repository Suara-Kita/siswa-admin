import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WhatsAppModal from '@/components/WhatsAppModal';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('WhatsAppModal', () => {
  it('renders the contact name, phone, and pre-filled default message', () => {
    render(
      <WhatsAppModal nama="Ali" phone="0177466905" defaultMessage="Salam Ali," onClose={vi.fn()} />
    );

    expect(screen.getByText('Ali · 0177466905')).toBeInTheDocument();
    expect(screen.getByLabelText('Mesej')).toHaveValue('Salam Ali,');
  });

  it('lets the user edit the message before sending', async () => {
    const user = userEvent.setup();
    render(
      <WhatsAppModal nama="Ali" phone="0177466905" defaultMessage="Salam Ali," onClose={vi.fn()} />
    );

    const textarea = screen.getByLabelText('Mesej');
    await user.clear(textarea);
    await user.type(textarea, 'Mesej tersuai.');

    expect(textarea).toHaveValue('Mesej tersuai.');
  });

  it('calls onClose when Cancel (Batal) is clicked', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <WhatsAppModal nama="Ali" phone="0177466905" defaultMessage="Salam Ali," onClose={onClose} />
    );

    await user.click(screen.getByRole('button', { name: 'Batal' }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onClose when the backdrop is clicked, but not when the panel is clicked', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <WhatsAppModal nama="Ali" phone="0177466905" defaultMessage="Salam Ali," onClose={onClose} />
    );

    await user.click(screen.getByText(/Ali ·/));
    expect(onClose).not.toHaveBeenCalled();

    await user.click(screen.getByRole('dialog'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onClose when Escape is pressed', () => {
    const onClose = vi.fn();
    render(
      <WhatsAppModal nama="Ali" phone="0177466905" defaultMessage="Salam Ali," onClose={onClose} />
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('disables Continue when the message is emptied out', async () => {
    const user = userEvent.setup();
    render(
      <WhatsAppModal nama="Ali" phone="0177466905" defaultMessage="Salam Ali," onClose={vi.fn()} />
    );

    const continueButton = screen.getByRole('button', { name: 'Teruskan' });
    expect(continueButton).toBeEnabled();

    await user.clear(screen.getByLabelText('Mesej'));
    expect(continueButton).toBeDisabled();
  });

  it('disables Continue when the message is only whitespace', async () => {
    const user = userEvent.setup();
    render(
      <WhatsAppModal nama="Ali" phone="0177466905" defaultMessage="Salam Ali," onClose={vi.fn()} />
    );

    const textarea = screen.getByLabelText('Mesej');
    await user.clear(textarea);
    await user.type(textarea, '   ');

    expect(screen.getByRole('button', { name: 'Teruskan' })).toBeDisabled();
  });

  it('opens the wa.me URL with the edited message and closes on Continue', async () => {
    const onClose = vi.fn();
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    const user = userEvent.setup();
    render(
      <WhatsAppModal nama="Ali" phone="0177466905" defaultMessage="Salam Ali," onClose={onClose} />
    );

    const textarea = screen.getByLabelText('Mesej');
    await user.clear(textarea);
    await user.type(textarea, 'Mesej akhir.');

    await user.click(screen.getByRole('button', { name: 'Teruskan' }));

    expect(openSpy).toHaveBeenCalledWith(
      'https://wa.me/60177466905?text=Mesej%20akhir.',
      '_blank',
      'noopener,noreferrer'
    );
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('focuses the message textarea on mount', () => {
    render(
      <WhatsAppModal nama="Ali" phone="0177466905" defaultMessage="Salam Ali," onClose={vi.fn()} />
    );

    expect(screen.getByLabelText('Mesej')).toHaveFocus();
  });
});
