export interface ILoggingService {
    error(message: string, context?: any): void;
    warn(message: string, context?: any): void;
    info(message: string, context?: any): void;
    debug(message: string, context?: any): void;
}

export class StubLoggingService implements ILoggingService {
    error(_message: string, _context?: any): void {
        // Note: In production, would use proper logging service
    }

    warn(_message: string, _context?: any): void {
        // Note: In production, would use proper logging service
    }

    info(_message: string, _context?: any): void {
        // Note: In production, would use proper logging service
    }

    debug(_message: string, _context?: any): void {
        // Note: In production, would use proper logging service
    }
}