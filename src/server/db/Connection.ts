import dotenv from "dotenv";
import { MongoClient, Db } from "mongodb";
dotenv.config();

class Connection {
    private client: MongoClient;
    private db: Db | undefined;

    constructor() {
        this.client = new MongoClient(this.getUri());
    }

    private getUri(): string {
        return `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_CLUSTER}.${process.env.DB_IDENTIFIER}.mongodb.net/?retryWrites=true&w=majority`;
    }

    public async connect(): Promise<void> {
        try {
            await this.client.connect();
            this.db = this.client.db("mongoIncidencias");
        } catch (error) {
            console.error("Error al conectar con la base de datos:", error);
            throw error;
        }
    }

    public getDatabase(): Db {
        if (!this.db) {
            throw new Error("No hay una conexión establecida.");
        }
        return this.db;
    }

    public async close(): Promise<void> {
        try {
            await this.client.db().command({ ping: 1 });
            await this.client.close();
        } catch (error) {
            console.error("Error al cerrar la conexión:", error);
        }
    }
}
export default Connection;