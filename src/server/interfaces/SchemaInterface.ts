import { Db, Collection } from "mongodb";

export interface SchemasInterface{
    database: Db;
    entity: string;
    collection: Collection
}