# Error Handling Guide

This document outlines the comprehensive error handling system implemented throughout the web application.

## Overview

The error handling system provides:
- **Consistent error display** across all components
- **User-friendly error messages** instead of raw JSON responses
- **Proper error categorization** (validation, network, authentication, etc.)
- **Reusable error components** and utilities
- **Centralized error handling** logic

## Components

### 1. Error Handling Utilities (`/lib/error-handling.ts`)

Core utilities for parsing and formatting errors:

```typescript
import { parseApiError, isAuthError, isNetworkError, formatErrorForDisplay } from '@/lib/error-handling';

// Parse any error into a user-friendly format
const errorInfo = parseApiError(error);

// Check error types
if (isAuthError(error)) {
  // Handle authentication errors
}

if (isNetworkError(error)) {
  // Handle network errors
}
```

### 2. Error Display Components (`/components/ui/error-display.tsx`)

Reusable components for displaying errors:

```typescript
import { ErrorDisplay, FieldError, LoadingError } from '@/components/ui/error-display';

// Full error display
<ErrorDisplay 
  error={error} 
  variant="default" // or "compact" or "inline"
  onRetry={handleRetry}
  onDismiss={handleDismiss}
/>

// Field-specific error
<FieldError error="This field is required" />

// Loading state error
<LoadingError error={error} onRetry={handleRetry} />
```

### 3. Error Handling Hooks (`/hooks/use-error-handler.ts`)

Custom hooks for managing errors:

```typescript
import { useErrorHandler, useFormErrorHandler, useApiCall } from '@/hooks/use-error-handler';

// General error handling
const { error, isLoading, handleError, executeWithErrorHandling } = useErrorHandler({
  showToast: true,
  onAuthError: () => redirectToLogin(),
  onNetworkError: () => showRetryOption()
});

// Form-specific error handling
const { fieldErrors, generalError, handleFormError, clearAllErrors } = useFormErrorHandler({
  onFieldError: (field, message) => setFieldError(field, message),
  onGeneralError: (message) => setGeneralError(message)
});

// API call with error handling
const { execute, isLoading, error } = useApiCall(apiFunction, {
  onSuccess: (data) => handleSuccess(data),
  onError: (error) => handleError(error)
});
```

## Error Types

### 1. Authentication Errors (401/403)
- **Handling**: Automatic token clearing and redirect to login
- **Display**: User-friendly authentication failure messages
- **Example**: "Invalid employee code or password. Please check your credentials and try again."

### 2. Validation Errors (400/422)
- **Handling**: Field-specific error display
- **Display**: Individual field errors with clear messaging
- **Example**: "Email: This email is already registered"

### 3. Network Errors
- **Handling**: Retry options and connection status
- **Display**: Connection error messages with retry buttons
- **Example**: "Unable to connect to the server. Please check your internet connection and try again."

### 4. Server Errors (500+)
- **Handling**: Contact support options
- **Display**: Generic error messages with support contact
- **Example**: "Something went wrong on our end. Please contact support if the problem persists."

## Implementation Examples

### Login Page Error Handling

```typescript
const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);
  setLoading(true);
  
  try {
    // Validation
    if (!isValidEmployeeCode(email)) {
      setError({
        title: "Invalid Employee Code",
        message: "Please enter a valid employee code (e.g., C01-M-25-T-0068)",
        type: "error"
      });
      return;
    }
    
    const data = await loginWithEmailPassword(email, password);
    // Handle success...
    
  } catch (err: any) {
    if (isAuthError(err)) {
      setError({
        title: "Authentication Failed",
        message: "Invalid employee code or password. Please check your credentials and try again.",
        type: "error"
      });
    } else {
      const errorInfo = parseApiError(err);
      setError(errorInfo);
    }
  } finally {
    setLoading(false);
  }
};
```

### Form Error Handling

```typescript
const handleSubmit = async () => {
  try {
    const response = await fetch('/api/endpoint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      // Handle success
    } else {
      const errorText = await response.text();
      const error = new Error(errorText);
      (error as any).status = response.status;
      (error as any).response = errorText;
      
      handleFormError(error);
    }
  } catch (error) {
    handleFormError(error);
  }
};
```

## Best Practices

### 1. Always Use Error Handling Utilities
- Don't display raw error responses to users
- Use `parseApiError()` to convert errors to user-friendly messages
- Use appropriate error display components

### 2. Provide Context-Specific Messages
- Authentication errors: Clear credential guidance
- Validation errors: Specific field instructions
- Network errors: Retry options
- Server errors: Support contact information

### 3. Handle Loading States
- Show loading indicators during API calls
- Disable form submissions during processing
- Provide clear feedback on operation status

### 4. Implement Proper Error Recovery
- Provide retry mechanisms for transient errors
- Clear errors when user starts new actions
- Maintain form state during error conditions

### 5. Log Errors for Debugging
- Always log errors to console for development
- Include relevant context in error logs
- Don't expose sensitive information in user messages

## Error Message Guidelines

### Do's ✅
- Use clear, actionable language
- Provide specific guidance when possible
- Include retry options for recoverable errors
- Maintain consistent tone and style

### Don'ts ❌
- Display raw JSON error responses
- Use technical jargon
- Blame the user for system errors
- Show sensitive information

## Migration from Old Error Handling

### Before (Raw Error Display)
```typescript
catch (err: any) {
  setError(err?.response || err?.message || "Login failed");
}
```

### After (Proper Error Handling)
```typescript
catch (err: any) {
  if (isAuthError(err)) {
    setError({
      title: "Authentication Failed",
      message: "Invalid employee code or password. Please check your credentials and try again.",
      type: "error"
    });
  } else {
    const errorInfo = parseApiError(err);
    setError(errorInfo);
  }
}
```

## Testing Error Handling

### 1. Test Different Error Scenarios
- Invalid credentials
- Network connectivity issues
- Server errors
- Validation failures

### 2. Verify User Experience
- Error messages are clear and helpful
- Retry mechanisms work correctly
- Loading states are properly managed
- Error dismissal functions correctly

### 3. Check Error Recovery
- Users can retry failed operations
- Form state is preserved during errors
- Navigation works correctly after errors

This comprehensive error handling system ensures a better user experience by providing clear, actionable feedback for all error conditions throughout the application.
