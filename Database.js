import sqlite3 from 'sqlite3';
import { v4 as uuidv4 } from 'uuid';

export class Database {
    constructor() {
        this.database = new sqlite3.Database('harmony.sqlite');
        this.initialize();
    }

    async initialize() {
        return new Promise((resolve, reject) => {
            this.database.run(`
                CREATE TABLE IF NOT EXISTS runs (
                    id VARCHAR(36) PRIMARY KEY,
                    data JSON DEFAULT NULL,
                    status TEXT CHECK(status IN ('succeded','failed','in_progress','destroyed','expired')) NOT NULL DEFAULT 'in_progress',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
            `, (err) => {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
    async destroyRun(runID)
    {
        await this.initialize();
        return new Promise((resolve, reject) => {
            this.database.run(`
                DELETE FROM runs WHERE id = ?
            `, [runID], (res, err) => {
                if (err)
                {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
    async setRunData(id, data, callback)
    {
        await this.initialize();
        return new Promise((resolve, reject) => {
            this.database.run(`
                UPDATE runs SET data = ? WHERE id = ?
            `, [JSON.stringify(data), id], function(err) {
                if (err) {
                    console.error(err);
                    callback(false, err);
                    reject(err);
                } else {
                    callback(true, null); // Return the ID of the run
                    resolve();
                }
            });
        });
    }
    async setRunStatus(id, status, callback)
    {
        await this.initialize();
        return new Promise((resolve, reject) => {
            this.database.run(`
                UPDATE runs SET status = ? WHERE id = ?
            `, [status, id], function(err) {
                if (err) {
                    console.error(err);
                    callback(false, err);
                    reject(err);
                } else {
                    callback(true, null); // Return the ID of the run
                    resolve();
                }
            });
        });
    }
    async addRun(callback) {
        await this.initialize();
        const id = uuidv4();
        return new Promise((resolve, reject) => {
            this.database.run(`
                INSERT INTO runs (id) VALUES (?);
            `, [id], function(err) {
                if (err) {
                    console.error(err);
                    callback(null, err);
                    reject(err);
                } else {
                    callback(id, err); // Return the ID of the run
                    resolve();
                }
            });
        });
    }
    
}
