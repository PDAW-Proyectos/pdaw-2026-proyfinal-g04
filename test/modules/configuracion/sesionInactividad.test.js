import { jest } from "@jest/globals";
import { iniciarControlInactividad } from "../../../public/common/utils/sesionInactividad.js";

describe("iniciarControlInactividad", () => {
    let listeners;
    let originalWindow;
    let fetch;

    beforeEach(() => {
        jest.useFakeTimers();
        listeners = {};
        originalWindow = globalThis.window;
        globalThis.window = {
            addEventListener: (evento, callback) => {
                listeners[evento] = callback;
            },
            location: { replace: jest.fn() },
        };
        fetch = jest.spyOn(globalThis, "fetch").mockImplementation(async (url) => ({
            ok: true,
            status: 200,
            json: async () => String(url).endsWith("/configuracion/sesion")
                ? { sessionExpiringTime: 60000 }
                : {},
        }));
    });

    afterEach(() => {
        jest.restoreAllMocks();
        jest.useRealTimers();
        if (originalWindow === undefined) {
            delete globalThis.window;
        } else {
            globalThis.window = originalWindow;
        }
    });

    test("cierra sesión y redirige al login al superar la duración configurada", async () => {
        await iniciarControlInactividad();

        await jest.advanceTimersByTimeAsync(60000);

        expect(fetch).toHaveBeenCalledWith("/api/auth/logout", { method: "POST" });
        expect(window.location.replace).toHaveBeenCalledWith("/login.html");
    });

    test("reinicia el vencimiento cuando el usuario tiene actividad", async () => {
        await iniciarControlInactividad();
        await jest.advanceTimersByTimeAsync(40000);

        listeners.pointerdown();
        await Promise.resolve();
        await jest.advanceTimersByTimeAsync(59999);
        expect(window.location.replace).not.toHaveBeenCalled();

        await jest.advanceTimersByTimeAsync(1);

        expect(window.location.replace).toHaveBeenCalledWith("/login.html");
    });
});
