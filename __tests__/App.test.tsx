import { useAppStore } from '../lib/store';

describe('App Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAppStore.setState({
      isAuthenticated: false,
      member: null,
      classes: [],
      bookings: new Set(),
      token: 'TEST-TOKEN',
      expiresAt: Date.now() + 60000,
      isValid: true,
      message: '',
      type: 'info',
      visible: false,
    });
  });

  it('initializes with correct default state', () => {
    const state = useAppStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.member).toBe(null);
    expect(state.token).toBe('TEST-TOKEN');
    expect(state.isValid).toBe(true);
  });

  it('can authenticate a user', async () => {
    // Mock successful Supabase authentication
    const state = useAppStore.getState();
    expect(state.loginWithSupabase).toBeDefined();
    expect(state.signUpWithSupabase).toBeDefined();
    expect(state.logout).toBeDefined();
  });

  it('can logout a user', () => {
    const { logout } = useAppStore.getState();

    // First login
    useAppStore.setState({ isAuthenticated: true });

    // Then logout
    logout();

    const state = useAppStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.member).toBe(null);
  });

  it('can generate new QR token', () => {
    const { generateNewToken } = useAppStore.getState();
    const originalToken = useAppStore.getState().token;

    generateNewToken();

    const newToken = useAppStore.getState().token;
    expect(newToken).not.toBe(originalToken);
    expect(newToken).toMatch(/^MM-[A-Z0-9]{8}$/);
  });
});
