let register: any, Counter: any, Histogram: any;
let buttonClickCounter: any, authEventCounter: any, attendanceEventCounter: any, httpRequestDuration: any;

// Only initialize metrics on server side
if (typeof window === 'undefined') {
  const promClient = require('prom-client');
  register = promClient.register;
  Counter = promClient.Counter;
  Histogram = promClient.Histogram;
  
  // Collect default metrics
  promClient.collectDefaultMetrics({ register });

  buttonClickCounter = new Counter({
    name: 'facemark_button_clicks_total',
    help: 'Total number of button clicks',
    labelNames: ['button_type', 'page'],
    registers: [register]
  });

  authEventCounter = new Counter({
    name: 'facemark_auth_events_total',
    help: 'Total number of authentication events',
    labelNames: ['event_type', 'provider'],
    registers: [register]
  });

  attendanceEventCounter = new Counter({
    name: 'facemark_attendance_events_total',
    help: 'Total number of attendance events',
    labelNames: ['event_type', 'user_id'],
    registers: [register]
  });

  httpRequestDuration = new Histogram({
    name: 'facemark_http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'],
    registers: [register]
  });
} else {
  // Client-side mock implementations
  const mockMetric = {
    inc: () => {},
    observe: () => {}
  };
  
  buttonClickCounter = mockMetric;
  authEventCounter = mockMetric;
  attendanceEventCounter = mockMetric;
  httpRequestDuration = mockMetric;
}

export { register, buttonClickCounter, authEventCounter, attendanceEventCounter, httpRequestDuration }; 