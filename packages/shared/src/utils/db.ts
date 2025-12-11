import mongoose from 'mongoose';
import { env } from '../env';

/**
 * MongoDB连接管理
 */
class DatabaseConnection {
  private static instance: DatabaseConnection;
  private isConnected: boolean = false;

  private constructor() {}

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  /**
   * 连接到MongoDB
   */
  public async connect(): Promise<void> {
    if (this.isConnected) {
      console.log('✅ Already connected to MongoDB');
      return;
    }

    try {
      await mongoose.connect(env.MONGODB_URI);
      this.isConnected = true;
      console.log('✅ MongoDB connected successfully');

      mongoose.connection.on('error', (error) => {
        console.error('❌ MongoDB connection error:', error);
        this.isConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        console.log('⚠️  MongoDB disconnected');
        this.isConnected = false;
      });
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error);
      throw error;
    }
  }

  /**
   * 断开MongoDB连接
   */
  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    await mongoose.disconnect();
    this.isConnected = false;
    console.log('MongoDB disconnected');
  }

  /**
   * 获取连接状态
   */
  public getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

export const db = DatabaseConnection.getInstance();
