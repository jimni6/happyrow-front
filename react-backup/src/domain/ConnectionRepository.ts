export interface ConnectionRepository {
    checkConnection(): Promise<boolean>;
}