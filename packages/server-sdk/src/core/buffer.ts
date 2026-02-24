import type { ServerEvent } from './types';
import { sendBatch } from './transport';

/**
 * Buffers events in memory and flushes them in batches.
 * Flushes when buffer reaches flushSize or every flushInterval ms.
 */
export class EventBuffer {
  private buffer: ServerEvent[] = [];
  private timer: ReturnType<typeof setInterval> | null = null;
  private flushing = false;

  constructor(
    private readonly endpoint: string,
    private readonly flushSize: number,
    private readonly flushInterval: number,
    private readonly debug: boolean,
  ) {
    this.startTimer();
    this.registerShutdownHooks();
  }

  push(event: ServerEvent): void {
    this.buffer.push(event);

    if (this.buffer.length >= this.flushSize) {
      void this.flush();
    }
  }

  async flush(): Promise<void> {
    if (this.flushing || this.buffer.length === 0) {
      return;
    }

    this.flushing = true;
    const events = this.buffer.splice(0);

    try {
      await sendBatch(this.endpoint, events, this.debug);
      if (this.debug) {
        console.log(`[AgentPulse] Flushed ${events.length} events`);
      }
    } catch {
      // Fail silently — never crash host app
      if (this.debug) {
        console.error('[AgentPulse] Flush failed');
      }
    } finally {
      this.flushing = false;
    }
  }

  destroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    // Final flush
    void this.flush();
  }

  private startTimer(): void {
    this.timer = setInterval(() => {
      void this.flush();
    }, this.flushInterval);

    // Allow the Node.js process to exit even if the timer is running
    if (this.timer && typeof this.timer === 'object' && 'unref' in this.timer) {
      this.timer.unref();
    }
  }

  private registerShutdownHooks(): void {
    const onShutdown = () => {
      this.destroy();
    };

    process.once('SIGTERM', onShutdown);
    process.once('SIGINT', onShutdown);
    process.once('beforeExit', onShutdown);
  }
}
