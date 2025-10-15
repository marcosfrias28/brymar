export interface MarkNotificationAsReadOutputData {
    success: boolean;
    notificationId: string;
    message?: string;
}

export class MarkNotificationAsReadOutput {
    private constructor(private readonly data: MarkNotificationAsReadOutputData) { }

    static create(data: MarkNotificationAsReadOutputData): MarkNotificationAsReadOutput {
        return new MarkNotificationAsReadOutput(data);
    }

    static success(notificationId: string, message?: string): MarkNotificationAsReadOutput {
        return new MarkNotificationAsReadOutput({
            success: true,
            notificationId,
            message: message || 'Notification marked as read successfully'
        });
    }

    static failure(notificationId: string, message?: string): MarkNotificationAsReadOutput {
        return new MarkNotificationAsReadOutput({
            success: false,
            notificationId,
            message: message || 'Failed to mark notification as read'
        });
    }

    isSuccess(): boolean {
        return this.data.success;
    }

    getNotificationId(): string {
        return this.data.notificationId;
    }

    getMessage(): string | undefined {
        return this.data.message;
    }

    toData(): MarkNotificationAsReadOutputData {
        return { ...this.data };
    }
}