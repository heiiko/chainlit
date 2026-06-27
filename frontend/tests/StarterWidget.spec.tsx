import { fireEvent, render, screen } from '@testing-library/react';
import { RecoilRoot } from 'recoil';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import StarterWidget from '@/components/chat/StarterWidget';

const { callActionMock, sendMessageMock } = vi.hoisted(() => ({
  callActionMock: vi.fn(),
  sendMessageMock: vi.fn()
}));

vi.mock('@chainlit/react-client', async () => {
  const React = await import('react');
  const { atom } = await import('recoil');

  return {
    ChainlitContext: React.createContext({
      buildEndpoint: (path: string) => path,
      callAction: callActionMock
    }),
    modesState: atom({
      key: 'StarterWidgetModesState',
      default: []
    }),
    sessionIdState: atom({
      key: 'StarterWidgetSessionIdState',
      default: 'session-123'
    }),
    useAuth: vi.fn(() => ({ user: { identifier: 'test-user' } })),
    useChatData: vi.fn(() => ({ loading: false, connected: true })),
    useChatInteract: vi.fn(() => ({ sendMessage: sendMessageMock }))
  };
});

describe('StarterWidget', () => {
  beforeEach(() => {
    callActionMock.mockClear();
    sendMessageMock.mockClear();

    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn()
    }));
  });

  it('renders all starter sections in one overview and sends starter messages', () => {
    const autoScrollRef = { current: false };
    const StarterWidgetWithProps = StarterWidget as any;

    render(
      <RecoilRoot>
        <StarterWidgetWithProps
          autoScrollRef={autoScrollRef}
          widget={{
            tabs: [
              {
                key: 'while-you-were-away',
                label: 'Wat heb ik gemist?',
                heading: 'Wat heb ik gemist?',
                byline: 'Krijg een samenvatting van de voorbije 24 uur',
                variant: 'pills',
                starters: [
                  {
                    label: 'In het nieuws (voorbije 24 uur)',
                    message: 'Vat het nieuws samen'
                  },
                  {
                    label: 'Markten (voorbije 24 uur)',
                    message: 'Vat de markten samen'
                  }
                ]
              },
              {
                key: 'trending-questions',
                label: 'In het nieuws',
                heading: 'Actuele vragen',
                byline: 'Op basis van het nieuws van vandaag',
                variant: 'list',
                starters: [
                  {
                    label: 'Waarom groeit de chipsector?',
                    message: 'Waarom groeit de chipsector?',
                    icon: 'https://img.test/chips.jpg'
                  }
                ]
              }
            ]
          }}
        />
      </RecoilRoot>
    );

    expect(
      screen.getByRole('heading', { name: 'Wat heb ik gemist?' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Wat heb ik gemist?' })
    ).toHaveClass('text-[16px]');
    expect(
      screen.getByText('Krijg een samenvatting van de voorbije 24 uur')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Krijg een samenvatting van de voorbije 24 uur')
    ).toHaveClass('text-[14px]');
    expect(
      screen.getByRole('heading', { name: 'Actuele vragen' })
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Actuele vragen' })).toHaveClass(
      'text-[16px]'
    );
    expect(
      screen.getByText('Op basis van het nieuws van vandaag')
    ).toBeInTheDocument();
    expect(screen.getByText('Op basis van het nieuws van vandaag')).toHaveClass(
      'text-[14px]'
    );
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
    const pillRail = screen.getByRole('button', {
      name: 'In het nieuws'
    }).parentElement;
    expect(pillRail).toHaveClass('gap-[10px]');
    const newsPill = screen.getByRole('button', { name: 'In het nieuws' });
    expect(newsPill).toHaveClass(
      'gap-2',
      'rounded-[12px]',
      'bg-[rgb(87,152,252)]',
      'border-[rgb(87,152,252)]',
      'px-[15px]',
      'py-2.5',
      'text-white'
    );
    expect(newsPill.querySelector('svg')).toHaveClass(
      'h-[17px]',
      'w-[17px]',
      'text-white'
    );
    expect(screen.getByText('In het nieuws')).toHaveClass(
      'text-[13px]',
      'font-bold',
      'uppercase'
    );
    expect(
      screen.getByRole('button', { name: 'Waarom groeit de chipsector?' })
    ).toBeInTheDocument();
    expect(screen.getByAltText('')).toHaveClass(
      'h-[54px]',
      'w-[54px]',
      'rounded-[9px]'
    );
    expect(screen.getByText('Waarom groeit de chipsector?')).toHaveClass(
      'text-[16px]',
      'leading-[1.38]'
    );

    fireEvent.click(screen.getByRole('button', { name: 'In het nieuws' }));

    expect(autoScrollRef.current).toBe(true);
    expect(sendMessageMock).toHaveBeenCalledWith(
      expect.objectContaining({
        output: 'Vat het nieuws samen',
        type: 'user_message'
      }),
      []
    );
  });

  it('styles the missed-news pill section as a blue card', () => {
    const StarterWidgetWithProps = StarterWidget as any;

    render(
      <RecoilRoot>
        <StarterWidgetWithProps
          widget={{
            tabs: [
              {
                key: 'while-you-were-away',
                label: 'Wat heb ik gemist?',
                heading: 'Wat heb ik gemist?',
                byline: 'Krijg een samenvatting van de voorbije 24 uur',
                variant: 'pills',
                starters: [
                  {
                    label: 'In het nieuws (voorbije 24 uur)',
                    message: 'Vat het nieuws samen'
                  }
                ]
              }
            ]
          }}
        />
      </RecoilRoot>
    );

    const heading = screen.getByRole('heading', {
      name: 'Wat heb ik gemist?'
    });
    const missedNewsSection = heading.closest('section');

    expect(missedNewsSection).toHaveClass(
      'bg-[rgb(73,129,251)]',
      'p-4',
      'rounded-[20px]',
      '!text-white',
      'shadow-[0_18px_30px_-22px_rgba(14,42,76,0.85),0_8px_16px_-12px_rgba(14,42,76,0.45)]'
    );
    expect(heading).toHaveClass('!text-white');
    expect(
      screen.getByText('Krijg een samenvatting van de voorbije 24 uur')
    ).toHaveClass('!text-white');
    expect(screen.getByRole('button', { name: 'In het nieuws' })).toHaveClass(
      'bg-[rgb(87,152,252)]',
      'border-[rgb(87,152,252)]',
      'text-white'
    );
    expect(
      screen.getByRole('button', { name: 'In het nieuws' }).querySelector('svg')
    ).toHaveClass('text-white');
  });

  it('ignores legacy article briefings content', () => {
    const StarterWidgetWithProps = StarterWidget as any;

    render(
      <RecoilRoot>
        <StarterWidgetWithProps
          widget={{
            tabs: [
              {
                key: 'news',
                label: 'News',
                starters: [
                  {
                    label: 'Top stories',
                    message: 'Tell me the top stories'
                  }
                ]
              }
            ],
            articleBriefings: {
              title: 'Hoofdpunten',
              audioActionName: 'readaloud_action',
              labels: {
                listen: 'Voorlezen',
                open: 'Lees het artikel'
              },
              articles: [
                {
                  urn: 'urn:article:1',
                  headline: 'Chipsector trekt de beurs hoger',
                  bullets: [
                    'De technologiesector wint terrein.',
                    'Beleggers kijken naar nieuwe cijfers.',
                    'Analisten blijven voorzichtig.'
                  ],
                  imageUrl: 'https://img.test/chips.jpg?ratio=16/9&width=1280',
                  articleUrl: 'https://www.tijd.be/chips'
                }
              ]
            }
          }}
        />
      </RecoilRoot>
    );

    expect(screen.queryByRole('heading', { name: 'Hoofdpunten' })).toBeNull();
    expect(
      screen.queryByRole('heading', { name: 'Chipsector trekt de beurs hoger' })
    ).toBeNull();
    expect(callActionMock).not.toHaveBeenCalled();
  });
});
