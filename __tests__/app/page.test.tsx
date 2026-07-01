import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Home from '@/app/page';

const rows = [
  {
    id: '1',
    ic: '020509011190',
    nama: 'Ali bin Abu',
    alamat: 'Alamat A',
    ipta: 'Universiti Malaya',
    no_tel: '0177466905',
    alt_number: '0123456789',
    email: 'ali@example.com',
    daerah_mengundi: 'D1',
    lokaliti: 'L1',
    parlimen: 'Sekijang',
    dun: 'Pemanis',
    source_document: 'x.pdf',
    created_at: '2026-01-01',
    age: 24,
  },
  {
    id: '2',
    ic: '020509011191',
    nama: 'Bakar bin Osman',
    alamat: 'Alamat B',
    ipta: 'Universiti Malaya',
    no_tel: null, // the real API returns null (not '') for an absent phone number
    alt_number: '123',
    email: 'bakar@example.com',
    daerah_mengundi: 'D2',
    lokaliti: 'L2',
    parlimen: 'Sekijang',
    dun: 'Kemelah',
    source_document: 'x.pdf',
    created_at: '2026-01-01',
    age: 25,
  },
  {
    id: '3',
    ic: '020509011192',
    nama: 'Chong Wei',
    alamat: 'Alamat C',
    ipta: 'Universiti Malaya',
    no_tel: '0122223333',
    alt_number: null,
    email: 'chong@example.com',
    daerah_mengundi: 'D3',
    lokaliti: 'L3',
    parlimen: 'Sekijang',
    dun: 'Pemanis',
    source_document: 'x.pdf',
    created_at: '2026-01-01',
    age: 23,
  },
];

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      json: () => Promise.resolve(rows),
    })
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

async function renderLoaded() {
  render(<Home />);
  await waitFor(() => expect(screen.getByText('Ali bin Abu')).toBeInTheDocument());
}

describe('Home phone number → WhatsApp flow', () => {
  it('renders phone numbers as clickable buttons when present', async () => {
    await renderLoaded();

    expect(screen.getByRole('button', { name: /0177466905/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /0123456789/ })).toBeInTheDocument();
  });

  it('gives each phone button an accessible label describing the action', async () => {
    await renderLoaded();

    expect(
      screen.getByRole('button', { name: 'Hantar mesej WhatsApp kepada Ali bin Abu, 0177466905' })
    ).toBeInTheDocument();
  });

  it('renders "-" instead of a button when a row has no phone number', async () => {
    await renderLoaded();

    const row = screen.getByText('Bakar bin Osman').closest('tr');
    expect(row).not.toBeNull();
    expect(within(row as HTMLElement).getAllByText('-')).toHaveLength(1);
  });

  it('renders a too-short/placeholder value as plain text instead of a clickable button', async () => {
    await renderLoaded();

    const row = screen.getByText('Bakar bin Osman').closest('tr');
    expect(row).not.toBeNull();
    // alt_number is "123" — truthy but not a plausible phone number, so it
    // should still be visible (not hidden as '-') but not clickable.
    expect(within(row as HTMLElement).getByText('123')).toBeInTheDocument();
    expect(within(row as HTMLElement).queryByRole('button')).not.toBeInTheDocument();
  });

  it('opens the WhatsApp modal with the row contact and DUN-aware template on click', async () => {
    const user = userEvent.setup();
    await renderLoaded();

    await user.click(screen.getByRole('button', { name: /0177466905/ }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/Ali bin Abu ·/)).toBeInTheDocument();
    expect((screen.getByLabelText('Mesej') as HTMLTextAreaElement).value).toContain('DUN Pemanis');
  });

  it('opens the modal for the alt_number column independently of no_tel', async () => {
    const user = userEvent.setup();
    await renderLoaded();

    await user.click(screen.getByRole('button', { name: /0123456789/ }));

    expect(within(screen.getByRole('dialog')).getByText(/0123456789/)).toBeInTheDocument();
  });

  it('returns focus to the clicked phone button after closing the modal', async () => {
    const user = userEvent.setup();
    await renderLoaded();

    const phoneButton = screen.getByRole('button', { name: /0177466905/ });
    await user.click(phoneButton);
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Batal' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(phoneButton).toHaveFocus();
  });

  it('resets the message instead of reusing stale text when the active contact changes while the modal is open', async () => {
    const user = userEvent.setup();
    await renderLoaded();

    await user.click(screen.getByRole('button', { name: /0177466905/ }));
    const textarea = screen.getByLabelText('Mesej') as HTMLTextAreaElement;
    await user.clear(textarea);
    await user.type(textarea, 'Mesej khas untuk Ali sahaja.');
    expect(textarea.value).toBe('Mesej khas untuk Ali sahaja.');

    // Simulate the active contact switching directly to a different row
    // (e.g. reached via keyboard focus escaping the modal) without the
    // dialog ever closing first.
    fireEvent.click(screen.getByRole('button', { name: /0122223333/ }));

    const newTextarea = screen.getByLabelText('Mesej') as HTMLTextAreaElement;
    expect(newTextarea.value).not.toContain('Mesej khas untuk Ali sahaja.');
    expect(screen.getByText(/Chong Wei ·/)).toBeInTheDocument();
  });

  it('shows a loading state before data arrives and an empty state when there are no rows', async () => {
    let resolveFetch!: (value: unknown) => void;
    vi.stubGlobal(
      'fetch',
      vi.fn().mockReturnValue(
        new Promise((resolve) => {
          resolveFetch = resolve;
        })
      )
    );

    render(<Home />);
    expect(screen.getByText('Memuatkan data...')).toBeInTheDocument();

    resolveFetch({ json: () => Promise.resolve([]) });
    await waitFor(() => expect(screen.getByText('Tiada data ditemui')).toBeInTheDocument());
  });
});
