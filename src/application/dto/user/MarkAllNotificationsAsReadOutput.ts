export interface MarkAllNotificationsAsReadOutputData {
    success: boolean;
    userId: string;
    markedCount: number;
    message?: string;
}

export class MarkAllNotificationsAsReadOutput {
    private constructor(private readonly data: MarkAllNotificationsAsReadOutputData) { }

    static create(data: MarkAllNotificationsAsReadOutputData): MarkAllNotificationsAsReadOutput {
        return new MarkAllNotificationsAsReadOutput(data);
    }

    static success(userId: string, markedCount: number, message?: string): MarkAllNotificationsAsReadOutput {
        return new MarkAllNotificationsAsReadOutput({
            success: true,
            userId,
            markedCount,
            message: message || `${markedCount} notifications marked as read successfully`
        });
    }

    static failure(userId: string, message?: string): MarkAllNotificationsAsReadOutput {
        return new MarkAllNotificationsAsReadOutput({
            success: false,
            userId,
            markedCount: 0,
            message: message || 'Failed to mark notifications as read'
        });
    }

    isSuccess(): boolean {
        return this.data.success;
    }

    getUserId(): string {
        return this.data.userId;
    }

    getMarkedCount(): number {
        return this.data.markedCount;
    }

    getMessage(): string | undefined {
        return this.data.message;
    }

    toData(): MarkAllNotificationsAsReadOutputData {
        return { ...this.data };
    }
}