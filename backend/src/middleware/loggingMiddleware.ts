import morgan from 'morgan';

/**
 * HTTP request logger middleware.
 * Logs all incoming requests to show request method, URL, status code, and response time.
 */
export const createLogger = () => {
  // Use 'combined' format to include detailed information
  if (process.env.NODE_ENV === 'production') {
    return morgan('combined');
  }
  // Use 'dev' format for cleaner development output
  return morgan('dev');
};
