export function mostrarAntiguedad(fechaIngresoStr) {
    const fechaIngreso = new Date(fechaIngresoStr);
    const hoy = new Date();

    let anios = hoy.getFullYear() - fechaIngreso.getFullYear();
    let meses = hoy.getMonth() - fechaIngreso.getMonth();
    let dias = hoy.getDate() - fechaIngreso.getDate();

    if (dias < 0) {
        meses -= 1;
        dias += new Date(hoy.getFullYear(), hoy.getMonth(), 0).getDate();
    }

    if (meses < 0) {
        anios -= 1;
        meses += 12;
    }

    const elAntiguedad = document.getElementById("antiguedad-cajero");
    if (elAntiguedad) {
        elAntiguedad.textContent = `${anios} años, ${meses} meses, ${dias} días`;
    }
}
