import { Server as SocketIOServer } from 'socket.io';

// Type definitions for WebSocket events
export interface WhatsAppMessage {
    id: string;
    conversationId: string;
    fromNumber: string;
    toNumber: string;
    content: string;
    messageType: string;
    direction: 'INBOUND' | 'OUTBOUND';
    status: 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
    timestamp: Date;
    customerId?: string;
}

export interface ConversationUpdate {
    id: string;
    phoneNumber: string;
    customerName?: string;
    customerId?: string;
    lastMessage?: Date;
    unreadCount: number;
    isActive: boolean;
}

export interface TypingIndicator {
    userId: string;
    conversationId: string;
    isTyping: boolean;
}

export interface MessageStatusUpdate {
    messageId: string;
    status: 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
    timestamp: Date;
}

// Get the global Socket.IO instance
function getSocketIOServer(): SocketIOServer | null {
    return (global as any).io || null;
}

// Emit new message to conversation participants
export function emitNewMessage(conversationId: string, message: WhatsAppMessage) {
    const io = getSocketIOServer();
    if (io) {
        io.to(`conversation-${conversationId}`).emit('new-message', message);
        console.log(`Emitted new message to conversation ${conversationId}`);
    }
}

// Emit message status updates
export function emitMessageStatusUpdate(
    conversationId: string,
    messageId: string,
    status: MessageStatusUpdate['status']
) {
    const io = getSocketIOServer();
    if (io) {
        const update: MessageStatusUpdate = {
            messageId,
            status,
            timestamp: new Date(),
        };
        io.to(`conversation-${conversationId}`).emit('message-status-update', update);
        console.log(`Emitted status update for message ${messageId}: ${status}`);
    }
}

// Emit conversation updates (new conversation, unread count changes, etc.)
export function emitConversationUpdate(conversationId: string, update: ConversationUpdate) {
    const io = getSocketIOServer();
    if (io) {
        io.to(`conversation-${conversationId}`).emit('conversation-update', update);
        console.log(`Emitted conversation update for ${conversationId}`);
    }
}

// Emit typing indicators
export function emitTypingIndicator(conversationId: string, userId: string, isTyping: boolean) {
    const io = getSocketIOServer();
    if (io) {
        io.to(`conversation-${conversationId}`).emit('user-typing', {
            userId,
            isTyping,
        });
    }
}

// Emit to all users (for system-wide notifications)
export function emitToAllUsers(event: string, data: any) {
    const io = getSocketIOServer();
    if (io) {
        io.emit(event, data);
        console.log(`Emitted ${event} to all users`);
    }
}

// Emit to specific user
export function emitToUser(userId: string, event: string, data: any) {
    const io = getSocketIOServer();
    if (io) {
        io.to(`user-${userId}`).emit(event, data);
        console.log(`Emitted ${event} to user ${userId}`);
    }
}

// WhatsApp QR Code specific events
export interface QRCodeStatusUpdate {
    instanceName: string;
    status: 'generating' | 'active' | 'expired' | 'used' | 'error';
    qrCode?: string;
    qrCodeBase64?: string;
    expiresAt?: Date;
    error?: string;
    timestamp: Date;
}

export interface ConnectionStatusUpdate {
    instanceName: string;
    status: 'disconnected' | 'connecting' | 'connected' | 'error';
    lastStatusCheck: Date;
    connectionDetails?: any;
    errorMessage?: string;
}

// Emit QR Code status updates
export function emitQRCodeStatusUpdate(instanceName: string, update: QRCodeStatusUpdate) {
    const io = getSocketIOServer();
    if (io) {
        io.to(`qrcode-${instanceName}`).emit('qrcode-status-update', update);
        console.log(`Emitted QR code status update for instance ${instanceName}: ${update.status}`);
    }
}

// Emit connection status updates for QR Code system
export function emitConnectionStatusUpdate(instanceName: string, update: ConnectionStatusUpdate) {
    const io = getSocketIOServer();
    if (io) {
        io.to(`connection-status-${instanceName}`).emit('connection-status-update', update);
        console.log(`Emitted connection status update for instance ${instanceName}: ${update.status}`);
    }
}

// Emit QR Code expiration warning
export function emitQRCodeExpirationWarning(instanceName: string, timeRemaining: number) {
    const io = getSocketIOServer();
    if (io) {
        io.to(`qrcode-${instanceName}`).emit('qrcode-expiration-warning', {
            instanceName,
            timeRemaining,
            timestamp: new Date(),
        });
        console.log(`Emitted QR code expiration warning for instance ${instanceName}: ${timeRemaining}ms remaining`);
    }
}

// Emit QR Code generation success
export function emitQRCodeGenerated(instanceName: string, qrCodeData: any) {
    const io = getSocketIOServer();
    if (io) {
        const update: QRCodeStatusUpdate = {
            instanceName,
            status: 'active',
            qrCode: qrCodeData.qrCode,
            qrCodeBase64: qrCodeData.qrCodeBase64,
            expiresAt: qrCodeData.expiresAt,
            timestamp: new Date(),
        };
        io.to(`qrcode-${instanceName}`).emit('qrcode-generated', update);
        console.log(`Emitted QR code generated for instance ${instanceName}`);
    }
}

// Emit connection success (when QR code is scanned and connected)
export function emitConnectionSuccess(instanceName: string) {
    const io = getSocketIOServer();
    if (io) {
        const statusUpdate: ConnectionStatusUpdate = {
            instanceName,
            status: 'connected',
            lastStatusCheck: new Date(),
        };

        const qrCodeUpdate: QRCodeStatusUpdate = {
            instanceName,
            status: 'used',
            timestamp: new Date(),
        };

        // Emit to both rooms
        io.to(`connection-status-${instanceName}`).emit('connection-success', statusUpdate);
        io.to(`qrcode-${instanceName}`).emit('qrcode-used', qrCodeUpdate);

        console.log(`Emitted connection success for instance ${instanceName}`);
    }
}

// Emit user notification for QR Code expiration
export function emitQRCodeUserNotification(instanceName: string, notificationData: {
    instanceName: string;
    warningType: 'warning_2min' | 'warning_1min' | 'warning_30sec';
    timeRemaining: number;
    timeInSeconds: number;
    timeInMinutes: number;
    message: string;
    urgency: 'low' | 'medium' | 'high' | 'critical';
}) {
    const io = getSocketIOServer();
    if (io) {
        io.to(`qrcode-${instanceName}`).emit('qrcode-user-notification', {
            ...notificationData,
            timestamp: new Date(),
        });
        console.log(`Emitted user notification for instance ${instanceName}: ${notificationData.urgency} - ${notificationData.message}`);
    }
}

// Check if Socket.IO server is available
export function isWebSocketAvailable(): boolean {
    return getSocketIOServer() !== null;
}