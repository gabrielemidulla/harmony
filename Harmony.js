import { Database } from "./Database.js";
import { Run } from "./Run.js";

Function.prototype.appendInstruction = function(instruction) {
    const originalFunction = this;
    return async function(...args) {
        const result = originalFunction.apply(this, args);
        if (result instanceof Promise) {
            await result;
        }
        // Your appended instruction
        instruction();
        return result;
    };
};

export class Harmony {
    constructor() {
        this.activeRuns = [];
        this.database = new Database();
    }

    async run(func, params) {
        let run, runID;
        await this.database.addRun((res, err) => runID = res);
        run = new Run(runID);
        this.activeRuns.push(run);
        run.on('destroy', () => {
            this.activeRuns = this.activeRuns.filter(run => run.id !== runID);
            this.database.destroyRun(runID);
        });
        func = func.appendInstruction(async function() {
            const successListeners = run.listeners.filter(listener => listener.event === 'success');
            for (const listener of successListeners)
            {
                listener.callback.call(this, { id: run.id, data: run.data });
            }
        });
        setTimeout(async () => {
            try {
                const beginListeners = run.listeners.filter(listener => listener.event === 'begin' || listener.event === 'start');
                for (const listener of beginListeners) {
                    listener.callback.call(this, { id: run.id }); // Ensure correct context
                }

                // Call the asynchronous task (foo function)
                const result = await func(params);
                await this.database.setRunStatus(runID, 'succeded', (res, err) => {});
                await this.database.setRunData(runID, result, (res, err) => {});
                
                // We cannot determine the exact time when 'foo' will complete, so we don't trigger the 'success' event here
            } catch (e) {
                const failListener = run.listeners.find(listener => listener.event === 'fail' || listener.event === 'error');
                if (failListener) {
                    failListener.callback.call(this, { id: run.id }, e); // Ensure correct context
                }
            }
        }, 0);

        return run;
    }
}