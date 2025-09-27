import { LogStatus } from '@/types/itinerary/enums';

type LogLevel = 'silent' | 'error' | 'warn' | 'info' | 'debug';

interface LogEntry {
  stepNumber: number;
  action: string;
  fileName: string;
  functionName: string;
  timestamp: string;
  data: Record<string, any>;
  duration?: number;
  status: LogStatus;
}

class ConsoleLogger {
  private static instance: ConsoleLogger;
  private logLevel: LogLevel;
  private logs: LogEntry[] = [];
  private maxLogs = 1000; // Keep last 1000 logs

  private constructor() {
    this.logLevel = (process.env.ITINERARY_LOG_LEVEL as LogLevel) || 'info';
  }

  public static getInstance(): ConsoleLogger {
    if (!ConsoleLogger.instance) {
      ConsoleLogger.instance = new ConsoleLogger();
    }
    return ConsoleLogger.instance;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = ['silent', 'error', 'warn', 'info', 'debug'];
    const currentIndex = levels.indexOf(this.logLevel);
    const messageIndex = levels.indexOf(level);
    return messageIndex <= currentIndex;
  }

  public log(
    stepNumber: number,
    action: string,
    fileName: string,
    functionName: string,
    data: Record<string, any> = {},
    duration?: number,
    status: LogStatus = LogStatus.SUCCESS
  ): void {
    if (!this.shouldLog('info')) return;

    const logData: LogEntry = {
      stepNumber,
      action,
      fileName,
      functionName,
      timestamp: new Date().toISOString(),
      data,
      ...(duration !== undefined && { duration }),
      status
    };

    // Store log
    this.logs.push(logData);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift(); // Remove oldest
    }

    try {
      console.log(`Step ${stepNumber}: ${action} in ${fileName} - ${functionName}`, logData);
    } catch (error) {
      // Fallback logging if JSON serialization fails
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Step ${stepNumber}: Logging failed for ${action}`, { error: errorMessage });
    }
  }

  public error(
    stepNumber: number,
    action: string,
    fileName: string,
    functionName: string,
    error: Error | string,
    data: Record<string, any> = {}
  ): void {
    if (!this.shouldLog('error')) return;

    const errorMessage = error instanceof Error ? error.message : error;
    this.log(stepNumber, action, fileName, functionName, { ...data, error: errorMessage }, undefined, LogStatus.ERROR);
  }

  public warn(
    stepNumber: number,
    action: string,
    fileName: string,
    functionName: string,
    message: string,
    data: Record<string, any> = {}
  ): void {
    if (!this.shouldLog('warn')) return;

    this.log(stepNumber, action, fileName, functionName, { ...data, warning: message }, undefined, LogStatus.WARNING);
  }

  public debug(
    stepNumber: number,
    action: string,
    fileName: string,
    functionName: string,
    data: Record<string, any> = {}
  ): void {
    if (!this.shouldLog('debug')) return;

    this.log(stepNumber, `DEBUG: ${action}`, fileName, functionName, data, undefined, LogStatus.SUCCESS);
  }

  public getLogs(): LogEntry[] {
    return [...this.logs];
  }

  public clearLogs(): void {
    this.logs = [];
  }
}

export const logger = ConsoleLogger.getInstance();
