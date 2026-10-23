export class DependencyInjector {
    #registrations = new Map();
    #singletonInstances = new Map();

    registerSingleton(token, factory) {
        this.#registrations.set(token, { factory, lifecycle: "singleton" });
    }

    registerTransient(token, factory) {
        this.#registrations.set(token, { factory, lifecycle: "transient" });
    }

    resolve(token) {
        const registration = this.#registrations.get(token);
        if (!registration) throw new Error(`No registration for "${token}"`);

        if (registration.lifecycle === "singleton") {
            if (!this.#singletonInstances.has(token)) {
                this.#singletonInstances.set(token, registration.factory(this));
            }
            return this.#singletonInstances.get(token);
        }
        return registration.factory(this);
    }
}

