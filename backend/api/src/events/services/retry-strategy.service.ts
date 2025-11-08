import { Injectable, Logger } from '@nestjs/common';
import { RetryConfig } from 'rxjs';

export interface retryConfig {
  maxRetries: number;
  baseDelay: number; //base delay in seconds for exponential backoff
  maxDelay: number; //max delay in seconds
  exponentialFactor: number; //multiplier for exponential backoff
}

@Injectable()
export class RetryStrategyService {
  private readonly logger = new Logger(RetryStrategyService.name);

  private readonly defaultConfig: retryConfig = {
    maxRetries: 5,
    baseDelay: 1,
    maxDelay: 300,
    exponentialFactor: 2,
  };

  calculateNextRetryTime(
    retryCount: number,
    config: Partial<RetryConfig> = {},
  ): Date {
    const finalConfig = { ...this.defaultConfig, ...config };

    let delaySeconds =
      finalConfig.baseDelay *
      Math.pow(finalConfig.exponentialFactor, retryCount); //delay = baseDelay * (exponentialFactor ^ retryCount)

    const jitter = delaySeconds * 0.1 * (Math.random() * 2 - 1);
    delaySeconds += jitter;

    const nextRetryAt = new Date();
    nextRetryAt.setSeconds(nextRetryAt.getSeconds() + delaySeconds);

    this.logger.debug(
      `Calculated next retry time: ${nextRetryAt.toISOString()} (retryCount=${retryCount}, delay=${delaySeconds.toFixed(2)}s)`,
    );

    return nextRetryAt;
  }

  // Check if event shall be retried
  shouldRetry(retryCount: number, maxRetries: number): boolean {
    return retryCount < maxRetries;
  } // just returning boolean for hardcoded retry limit

  // check if event is ready for retry
  isReadyForRetry(nextRetryAt: Date): boolean {
    if (!nextRetryAt) return true; // no retry is in the schedule, ready for retry
    return new Date() >= nextRetryAt;
  }

  getRetryDelay(retryCount: number, config: Partial<RetryConfig> = {}): string {
    const finalConfig = { ...this.defaultConfig, ...config };

    let delaySeconds =
      finalConfig.baseDelay *
      Math.pow(finalConfig.exponentialFactor, retryCount);

    delaySeconds = Math.min(delaySeconds, finalConfig.maxDelay); //cap to max delay based on config

    if (delaySeconds < 60) {
      return `${Math.round(delaySeconds)}s`;
    } else if (delaySeconds < 3600) {
      return `${Math.round(delaySeconds / 60)}m`;
    } else {
      return `${Math.round(delaySeconds / 3600)}h`;
    }
  }
}
