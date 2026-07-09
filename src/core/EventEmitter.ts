export type EventHandler<T = any> = (payload: T) => void;

export class EventEmitter {

    private listeners = new Map<
        string,
        Set<EventHandler>
    >();

    on(event: string, handler: EventHandler) {

        if (!this.listeners.has(event)) {

            this.listeners.set(
                event,
                new Set()
            );

        }

        this.listeners
            .get(event)!
            .add(handler);

    }

    off(
        event: string,
        handler: EventHandler
    ) {

        this.listeners
            .get(event)
            ?.delete(handler);

    }

    emit<T>(
        event: string,
        payload?: T
    ) {

        this.listeners
            .get(event)
            ?.forEach(fn => fn(payload));

    }

    clear() {

        this.listeners.clear();

    }

}