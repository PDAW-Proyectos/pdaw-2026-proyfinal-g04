export class DependencyInjector {
    #registrations = new Map();
    #singletonInstances = new Map();

    registerSingleton(token, factory) {
        this.#registrations.set(token, { factory, lifecycle: "singleton" });
    }

    registerTransient(token, factory) {
        this.#registrations.set(token, { factory, lifecycle: "transient" });
    }

    async resolve(token) {
        const registration = this.#registrations.get(token);
        if (!registration) {
            throw new Error(`No registration for "${token}"`);
        }

        if (registration.lifecycle === "singleton") {
            if (!this.#singletonInstances.has(token)) {
                const instancia = Promise.resolve().then(() => registration.factory(this));
                this.#singletonInstances.set(token, instancia);
            }

            return await this.#singletonInstances.get(token);
        }

        return await registration.factory(this);
    }
}
