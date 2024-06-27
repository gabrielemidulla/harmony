import { Harmony } from "./Harmony.js";

async function foo(params) {
    await new Promise(r => setTimeout(r, params.timeout));
    console.log("Foo");
    return {key: "V"};
}

async function bar(params) {
    await new Promise(r => setTimeout(r, params.timeout));
    console.log("Bar");
    return {key: "C"};
}


(async () => {
    const harmony = new Harmony();
    const myFoo = await harmony.run(foo, { timeout: 1000 });
    const myBar = await harmony.run(bar, { timeout: 2000 });

    myFoo.on('begin', function(run) {
        console.log("Foo has begun!");
        console.log(run);
    });

    myFoo.on('success', function(run) {
        console.log("Foo Succeeded!");
        myBar.destroy();
    });

    myFoo.on('fail', function (run, e) {
        console.log("Foo Run failed. ERR: " + e.message);
    });


    myBar.on('begin', function(run) {
        console.log("Bar has begun!");
    });

    myBar.on('success', function(run) {
        console.log("Bar Succeeded!");
    });

    myBar.on('fail', function (run, e) {
        console.log("Bar Run failed. ERR: " + e.message);
    });

    myBar.on('destroy', function(run) {
        console.log("Bar destroyed");
    });
})();