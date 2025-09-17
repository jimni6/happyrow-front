import type { ConnectionRepository } from "../domain/ConnectionRepository";

export class CheckConnection {
    private repo: ConnectionRepository;

    constructor(repo: ConnectionRepository) {
        this.repo = repo;
    }

    async execute(): Promise<boolean> {
        return this.repo.checkConnection();
    }
}