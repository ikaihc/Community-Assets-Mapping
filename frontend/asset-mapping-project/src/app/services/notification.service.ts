import { Injectable } from '@angular/core';

export interface NotificationConfig {
  message: string;
  title?: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor() { }

  success(message: string, title?: string, duration: number = 3000): void {
    this.show({
      message,
      title,
      type: 'success',
      duration
    });
  }

  error(message: string, title?: string, duration: number = 5000): void {
    this.show({
      message,
      title,
      type: 'error',
      duration
    });
  }

  warning(message: string, title?: string, duration: number = 4000): void {
    this.show({
      message,
      title,
      type: 'warning',
      duration
    });
  }

  info(message: string, title?: string, duration: number = 3000): void {
    this.show({
      message,
      title,
      type: 'info',
      duration
    });
  }

  private show(config: NotificationConfig): void {
    // Simple console logging for now - can be enhanced with toast library later
    const typePrefix = config.type ? `[${config.type.toUpperCase()}]` : '[INFO]';
    const titleText = config.title ? `${config.title}: ` : '';
    console.log(`${typePrefix} ${titleText}${config.message}`);

    // You can replace this with a proper toast/notification library like:
    // - Angular Material Snackbar
    // - ngx-toastr
    // - Custom notification component
  }
}
