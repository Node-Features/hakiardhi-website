/**
 * Logger Utility for Hakiardhi Digital Ecosystem
 *
 * Provides consistent logging across the application with:
 * - Timestamped messages
 * - Log levels (debug, info, warn, error)
 * - Environment-aware logging
 * - Structured metadata support
 */

export enum LogLevel {
    DEBUG = 'DEBUG',
    INFO = 'INFO',
    WARN = 'WARN',
    ERROR = 'ERROR'
}

interface LogMetadata {
    [key: string]: any;
}

class Logger {
    private isDevelopment: boolean;
    private isProduction: boolean;

    constructor() {
        this.isDevelopment = process.env.NODE_ENV === 'development';
        this.isProduction = process.env.NODE_ENV === 'production';
    }

    /**
     * Get formatted timestamp
     */
    private getTimestamp(): string {
        return new Date().toISOString();
    }

    /**
     * Format log message with timestamp and level
     */
    private formatMessage(level: LogLevel, message: string, context?: string): string {
        const timestamp = this.getTimestamp();
        const contextStr = context ? `[${context}]` : '';
        return `${timestamp} ${level} ${contextStr} ${message}`;
    }

    /**
     * Log debug messages (only in development)
     */
    debug(message: string, metadata?: LogMetadata, context?: string): void {
        if (this.isDevelopment) {
            console.log(this.formatMessage(LogLevel.DEBUG, message, context));
            if (metadata) {
                console.log('Metadata:', JSON.stringify(metadata, null, 2));
            }
        }
    }

    /**
     * Log informational messages
     */
    info(message: string, metadata?: LogMetadata, context?: string): void {
        console.log(this.formatMessage(LogLevel.INFO, message, context));
        if (metadata && !this.isProduction) {
            console.log('Metadata:', JSON.stringify(metadata, null, 2));
        }
    }

    /**
     * Log warning messages
     */
    warn(message: string, metadata?: LogMetadata, context?: string): void {
        console.warn(this.formatMessage(LogLevel.WARN, message, context));
        if (metadata) {
            console.warn('Metadata:', JSON.stringify(metadata, null, 2));
        }
    }

    /**
     * Log error messages
     */
    error(message: string, error?: Error | any, context?: string): void {
        console.error(this.formatMessage(LogLevel.ERROR, message, context));

        if (error) {
            if (error instanceof Error) {
                console.error('Error Details:', {
                    name: error.name,
                    message: error.message,
                    stack: this.isDevelopment ? error.stack : undefined
                });
            } else {
                console.error('Error Details:', error);
            }
        }
    }

    /**
     * Log API request
     */
    logRequest(method: string, path: string, metadata?: LogMetadata): void {
        this.info(`${method} ${path}`, metadata, 'API');
    }

    /**
     * Log API response
     */
    logResponse(method: string, path: string, statusCode: number, duration?: number): void {
        const metadata: LogMetadata = { statusCode };
        if (duration) {
            metadata.duration = `${duration}ms`;
        }

        if (statusCode >= 500) {
            this.error(`${method} ${path}`, metadata, 'API');
        } else if (statusCode >= 400) {
            this.warn(`${method} ${path}`, metadata, 'API');
        } else {
            this.info(`${method} ${path}`, metadata, 'API');
        }
    }

    /**
     * Log database operation
     */
    logDatabase(operation: string, table: string, metadata?: LogMetadata): void {
        this.debug(`${operation} on ${table}`, metadata, 'DATABASE');
    }

    /**
     * Log file operation
     */
    logFile(operation: string, fileName: string, metadata?: LogMetadata): void {
        this.info(`${operation}: ${fileName}`, metadata, 'FILE');
    }

    /**
     * Log storage operation
     */
    logStorage(operation: string, bucket: string, metadata?: LogMetadata): void {
        this.info(`${operation} in bucket: ${bucket}`, metadata, 'STORAGE');
    }

    /**
     * Log authentication event
     */
    logAuth(event: string, metadata?: LogMetadata): void {
        this.info(event, metadata, 'AUTH');
    }

    /**
     * Log validation error
     */
    logValidation(message: string, errors?: any): void {
        this.warn(message, { errors }, 'VALIDATION');
    }

    /**
     * Log performance metric
     */
    logPerformance(operation: string, duration: number, metadata?: LogMetadata): void {
        const perfData = { duration: `${duration}ms`, ...metadata };

        if (duration > 1000) {
            this.warn(`Slow operation: ${operation}`, perfData, 'PERFORMANCE');
        } else {
            this.debug(`${operation} completed`, perfData, 'PERFORMANCE');
        }
    }

    /**
     * Create a child logger with specific context
     */
    withContext(context: string) {
        return {
            debug: (message: string, metadata?: LogMetadata) => this.debug(message, metadata, context),
            info: (message: string, metadata?: LogMetadata) => this.info(message, metadata, context),
            warn: (message: string, metadata?: LogMetadata) => this.warn(message, metadata, context),
            error: (message: string, error?: Error | any) => this.error(message, error, context)
        };
    }
}

// Export singleton instance
export const logger = new Logger();

// Export convenience functions
export const log = {
    debug: (message: string, metadata?: LogMetadata, context?: string) =>
        logger.debug(message, metadata, context),

    info: (message: string, metadata?: LogMetadata, context?: string) =>
        logger.info(message, metadata, context),

    warn: (message: string, metadata?: LogMetadata, context?: string) =>
        logger.warn(message, metadata, context),

    error: (message: string, error?: Error | any, context?: string) =>
        logger.error(message, error, context),

    request: (method: string, path: string, metadata?: LogMetadata) =>
        logger.logRequest(method, path, metadata),

    response: (method: string, path: string, statusCode: number, duration?: number) =>
        logger.logResponse(method, path, statusCode, duration),

    database: (operation: string, table: string, metadata?: LogMetadata) =>
        logger.logDatabase(operation, table, metadata),

    file: (operation: string, fileName: string, metadata?: LogMetadata) =>
        logger.logFile(operation, fileName, metadata),

    storage: (operation: string, bucket: string, metadata?: LogMetadata) =>
        logger.logStorage(operation, bucket, metadata),

    auth: (event: string, metadata?: LogMetadata) =>
        logger.logAuth(event, metadata),

    validation: (message: string, errors?: any) =>
        logger.logValidation(message, errors),

    performance: (operation: string, duration: number, metadata?: LogMetadata) =>
        logger.logPerformance(operation, duration, metadata)
};

export default logger;
