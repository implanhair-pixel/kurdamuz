/**
 * Environment Validation Utility
 * 
 * Implements safe startup mode:
 * - DEV: graceful startup with warnings for missing env vars
 * - PRODUCTION: hard fail if required env vars are missing
 */

const PLACEHOLDER_PATTERNS = [
  'placeholder',
  'helium',
  'ep-xxx',
  'localhost:5432/kurdamuz_dev',
  'user:password@',
  'your-project.supabase.co',
  'your-anon-key',
  'your-service-role-key',
  'generate-a-random-32-byte-hex-string',
];

function isPlaceholderValue(value: string): boolean {
  return PLACEHOLDER_PATTERNS.some((pattern) => value.includes(pattern));
}

export interface EnvValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateEnvironment(): EnvValidationResult {
  const isProduction = process.env.NODE_ENV === 'production';
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required production variables
  const requiredVars = [
    'DATABASE_URL',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
  ];

  // Optional but recommended variables
  const recommendedVars = [
    'NEXT_PUBLIC_APP_URL',
    'NEXT_PUBLIC_SITE_URL',
    'CRON_SECRET',
    'CSRF_SECRET',
    'API_SECRET',
  ];

  // Validate required variables
  for (const varName of requiredVars) {
    const value = process.env[varName];
    
    if (!value) {
      const message = `Missing required environment variable: ${varName}`;
      if (isProduction) {
        errors.push(message);
      } else {
        warnings.push(`${message} (DEV mode: using placeholder)`);
      }
    } else if (isPlaceholderValue(value)) {
      const message = `Environment variable ${varName} appears to be a placeholder value`;
      if (isProduction) {
        errors.push(message);
      } else {
        warnings.push(`${message} (DEV mode: placeholder allowed)`);
      }
    }
  }

  // Validate recommended variables
  for (const varName of recommendedVars) {
    const value = process.env[varName];
    
    if (!value) {
      warnings.push(`Missing recommended environment variable: ${varName}`);
    } else if (isPlaceholderValue(value)) {
      warnings.push(`Environment variable ${varName} appears to be a placeholder value`);
    }
  }

  // In production, any error is a failure
  const isValid = isProduction ? errors.length === 0 : true;

  // Log warnings in development
  if (!isProduction && warnings.length > 0) {
    console.warn('⚠️  Environment Configuration Warnings:');
    warnings.forEach((warning) => console.warn(`  - ${warning}`));
  }

  // Log errors in production
  if (isProduction && errors.length > 0) {
    console.error('❌ Environment Configuration Errors:');
    errors.forEach((error) => console.error(`  - ${error}`));
  }

  return { isValid, errors, warnings };
}

/**
 * Get environment variable with safe fallback for development
 */
export function getEnvVar(name: string, devFallback?: string): string | undefined {
  const value = process.env[name];
  
  if (value) {
    return value;
  }
  
  // In development, allow fallback
  if (process.env.NODE_ENV !== 'production' && devFallback) {
    console.warn(`⚠️  Using fallback for ${name} in development`);
    return devFallback;
  }
  
  return undefined;
}

/**
 * Validate environment on startup - call this in your app entry point
 */
export function validateEnvOnStartup(): void {
  const validation = validateEnvironment();
  
  if (!validation.isValid) {
    throw new Error(
      'Environment validation failed. Please check the error messages above.'
    );
  }
  
  if (validation.warnings.length > 0) {
    console.log('✅ Environment validated with warnings (development mode)');
  } else {
    console.log('✅ Environment validated successfully');
  }
}
