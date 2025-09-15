import type { ConnectionRepository } from "../domain/ConnectionRepository";

export class ConnectionApiRepository implements ConnectionRepository {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    async checkConnection(): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseUrl}/health`);
            return response.ok;
        } catch (error) {
            console.error("Erreur connexion API:", error);
            return false;
        }
    }
}