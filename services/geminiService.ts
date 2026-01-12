// Frontend service - calls Vercel serverless functions
// API key is now safely stored server-side

const withTimeout = <T>(promise: Promise<T>, ms: number = 15000): Promise<T> => {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Transmission timeout - signal lost in the void')), ms)
  );
  return Promise.race([promise, timeout]);
};

export const getOracleResponse = async (query: string, cartContext?: string): Promise<string> => {
  try {
    const response = await withTimeout(
      fetch('/api/oracle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, cartContext }),
      }),
      15000
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.text || data.error;
  } catch (error) {
    console.error('Oracle failed:', error);
    return 'The transmission is clouded. 1/137 resonance lost. Adjust your frequency.';
  }
};

export const generateTransmission = async (): Promise<string> => {
  try {
    const response = await withTimeout(
      fetch('/api/transmission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }),
      10000
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.text || data.error;
  } catch (error) {
    return 'The coupling constant is drifting. 137 signal lost.';
  }
};
