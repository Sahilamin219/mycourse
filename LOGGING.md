# Logging System Documentation

This project now has a comprehensive centralized logging system for both frontend and backend.

## Backend Logging

### Logger Service Location
- **File**: `backend/app/utils/logger.py`

### Features
- Color-coded console output (DEBUG, INFO, WARNING, ERROR, CRITICAL)
- Structured JSON logging with context
- Support for error stack traces
- Timestamp and logger name in every log

### Pre-configured Loggers
```python
from app.utils.logger import api_logger, db_logger, auth_logger, service_logger, websocket_logger

# Usage examples
api_logger.info("User signed in", {"user_id": user.id})
auth_logger.error("Login failed", {"email": email}, exc_info=True)
service_logger.debug("Processing request", {"session_id": session_id})
```

### Log Levels
- **DEBUG**: Detailed information for debugging
- **INFO**: General informational messages
- **WARNING**: Warning messages for potentially harmful situations
- **ERROR**: Error messages for serious problems
- **CRITICAL**: Critical messages for very serious errors

## Frontend Logging

### Logger Service Location
- **File**: `src/utils/logger.ts`

### Features
- Color-coded browser console logs
- Structured logging with context objects
- Performance tracking with `time()` and `timeEnd()`
- Error tracking with stack traces
- Log grouping for related operations

### Pre-configured Loggers
```typescript
import { apiLogger, authLogger, uiLogger, wsLogger, rtcLogger } from './utils/logger';

// Usage examples
apiLogger.info('Fetching user data', { userId: '123' });
authLogger.error('Sign in failed', error, { email: 'user@example.com' });
rtcLogger.debug('WebRTC connection established', { peerId: 'abc' });
```

### Performance Tracking
```typescript
apiLogger.time('API Request');
// ... do work
apiLogger.timeEnd('API Request');
```

### Log Grouping
```typescript
apiLogger.group('User Registration Flow');
apiLogger.info('Step 1: Validating email');
apiLogger.info('Step 2: Creating user');
apiLogger.groupEnd();
```

## Where Logging Is Implemented

### Backend
- ✅ All API routes (auth, debates, notifications, resources)
- ✅ All service layers (auth_service, debate_service)
- ✅ Application startup and health checks

### Frontend
- ✅ All API calls (authentication, debates, resources, notifications)
- ✅ Auth context (sign in, sign up, sign out, session restoration)
- ✅ WebRTC connection management
- ✅ Video call lifecycle

## Best Practices

### When to Use Each Log Level

**Backend:**
- `DEBUG`: Request parameters, database queries, internal state
- `INFO`: Successful operations, user actions, API calls
- `WARNING`: Deprecated features, recoverable errors, validation failures
- `ERROR`: Failed operations, exceptions, integration errors
- `CRITICAL`: System failures, database connection loss

**Frontend:**
- `debug()`: UI state changes, component lifecycle, data transformations
- `info()`: User actions, successful API calls, navigation
- `warn()`: Deprecated features, non-critical issues
- `error()`: Failed API calls, caught exceptions, validation errors

### Context Objects
Always include relevant context with your logs:

```python
# Backend
api_logger.info("Debate session created", {
    "session_id": session.id,
    "user_id": user.id,
    "topic": session.topic
})
```

```typescript
// Frontend
apiLogger.error('Failed to fetch data', error, {
    endpoint: '/api/debates',
    userId: user.id,
    timestamp: Date.now()
});
```

## Viewing Logs

### Backend (Python)
Logs appear in the console with color coding:
- 🔵 DEBUG (Cyan)
- 🟢 INFO (Green)
- 🟡 WARNING (Yellow)
- 🔴 ERROR (Red)
- 🟣 CRITICAL (Magenta)

### Frontend (Browser)
Open browser DevTools console (F12) to see logs with:
- Timestamps
- Logger name
- Context objects
- Color-coded levels

## Creating Custom Loggers

### Backend
```python
from app.utils.logger import StructuredLogger

custom_logger = StructuredLogger('my_module')
custom_logger.info("Custom log message")
```

### Frontend
```typescript
import { createLogger } from './utils/logger';

const myLogger = createLogger('MyComponent');
myLogger.info('Component initialized');
```
