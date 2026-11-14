export function renderizarIconos(root = null) {
    if (typeof lucide === "undefined") return;

    if (root) {
        lucide.createIcons({ root });
        return;
    }

    lucide.createIcons();
}
