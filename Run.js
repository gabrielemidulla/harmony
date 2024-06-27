export class Run {
    constructor(id) {
        this.id = id;
        this.listeners = [];
    }

    on(event, callback) {
        const listener = { event, callback };
        this.listeners.push(listener);
    }

    destroy()
    {
        this.emit('destroy');
    }

    emit(event, ...args) {
        this.listeners.forEach(listener => {
            if (listener.event === event) {
                listener.callback(...args);
            }
        });
    }
}