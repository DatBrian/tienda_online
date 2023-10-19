import express, { Application, NextFunction, Request, Response } from "express";
import { RoutesInterface } from "./interfaces/RoutesInterface";
import routemap from "express-routemap";
import chalk from "chalk";
import morgan from "morgan";
import cors from "cors";
import Connection from "./db/Connection";
import dotenv from "dotenv";
import resError from "./utils/ResError";
import SetupDB from "./db/SetupDB";
import { schemas } from "./models/schemas";
import http from "http";
import { CustomError } from "./interfaces/CustomErrorInterface";
import { SchemasInterface } from "./interfaces/SchemaInterface";

dotenv.config();

class App extends Connection {
    public app: Application;
    public port: number;
    public server!: http.Server;
    private setupDB: SetupDB;
    private collections: SchemasInterface[];

    constructor(routes: RoutesInterface[]) {
        super();
        this.app = express();
        this.port = Number(process.env.PORT) || 5000;
        this.collections = schemas;
        this.setupDB = new SetupDB(this.getDatabase());
        this.initMiddlewares();
        this.initConnection();
        this.initRoutes(routes);
    }

    public getServer() {
        return this.app;
    }

    public closeServer(done?: any): void {
        this.server = this.app.listen(this.port, () => {
            done();
        });
    }

    private async initConnection(): Promise<void> {
        try {
            const connection = await this.connect();
            console.log(chalk.bgGreen.black("✔️  Conexión establecida 🔌 "));
            console.log(
                chalk.blue(
                    "---------------------------------------------------------------------------------"
                )
            );
            console.log(
                chalk.green.bold(
                    `🌐 ¡Se ha establecido la conexión a: ${process.env.DB_NAME}!`
                )
            );
            console.log(
                chalk.blue(
                    "---------------------------------------------------------------------------------"
                )
            );
            await this.setupDB.setupCollections(this.collections);
            return connection;
        } catch (error) {
            console.error(
                chalk.bgRed.white("❌ Error al establecer la conexión:")
            );
            console.error(error);
            throw new Error("Error al establecer la conexión");
        }
    }

    private initMiddlewares(): void {
        this.app.use(express.json());
        this.app.use(cors());
        this.app.use(morgan("dev"));
        this.app.use(
            (
                err: CustomError,
                _req: Request,
                res: Response,
                _next: NextFunction
            ): void => {
                const { statusCode, message } = err;
                resError(res, statusCode, message);
            }
        );
    }

    private initRoutes(routes: RoutesInterface[]): void {
        routes.forEach((route) => {
            this.app.use(`/api${route.path}`, route.router);
        });
    }

    public listen(): void {
        this.app.listen(this.port, () => {
            console.log();
            console.log(chalk.bgCyan.white.bold("🗺️  Rutas disponibles: 🚴 "));
            routemap(this.app);
            console.log(chalk.bgGreen.black("✨ Servidor en línea ✨ "));
            console.log(
                chalk.blue(
                    "--------------------------------------------------------------------------------"
                )
            );
            console.log(
                chalk.green.bold(
                    `🚀 ¡El servidor se ha levantado exitosamente en http://${process.env.HOST}:${process.env.PORT}!`
                )
            );
            console.log(
                chalk.blue(
                    "--------------------------------------------------------------------------------"
                )
            );
        });
    }
}
export default App;
