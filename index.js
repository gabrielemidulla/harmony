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

class Run {
    constructor(id) {
        this.id = id;
        this.listeners = [];
    }

    on(event, callback) {
        const listener = { event, callback };
        this.listeners.push(listener);
    }
}

class Harmony {
    constructor() {
        this.activeRuns = [];
    }

    run(func, params) {
        let run;
        const runID = this.activeRuns.length;
        run = new Run(runID);
        this.activeRuns.push(run);

        func = func.appendInstruction(async function() {
            const successListeners = run.listeners.filter(listener => listener.event === 'success');
            for (const listener of successListeners)
            {
                listener.callback.call(this);
            }
        });
        setTimeout(async () => {
            try {
                const beginListeners = run.listeners.filter(listener => listener.event === 'begin' || listener.event === 'start');
                for (const listener of beginListeners) {
                    listener.callback.call(this); // Ensure correct context
                }

                // Call the asynchronous task (foo function)
                await func(params);

                // We cannot determine the exact time when 'foo' will complete, so we don't trigger the 'success' event here
            } catch (e) {
                const failListener = run.listeners.find(listener => listener.event === 'fail' || listener.event === 'error');
                if (failListener) {
                    failListener.callback.call(this, e); // Ensure correct context
                }
            }
        }, 0);

        return run;
    }
}

async function foo(params) {
    await new Promise(r => setTimeout(r, params.timeout));
    console.log("Foo");
}

async function bar(params) {
    await new Promise(r => setTimeout(r, params.timeout));
    console.log("Bar");
}


const harmony = new Harmony();
const myFoo = harmony.run(foo, { timeout: 1000 });
const myBar = harmony.run(bar, { timeout: 2000 });


myFoo.on('begin', function() {
    console.log("Foo has begun!");
});

myFoo.on('success', function() {
    console.log("Foo Succeeded!");
});

myFoo.on('fail', function (e) {
    console.log("Foo Run failed. ERR: " + e.message);
});


myBar.on('begin', function() {
    console.log("Bar has begun!");
});

myBar.on('success', function() {
    console.log("Bar Succeeded!");
});

myBar.on('fail', function (e) {
    console.log("Bar Run failed. ERR: " + e.message);
});