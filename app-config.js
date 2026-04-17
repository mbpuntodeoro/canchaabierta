const PadelUtils = {
    fmtDinero: (val) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(val || 0),
    copiarLink: (url) => { navigator.clipboard.writeText(url).then(() => alert("¡Link copiado!")); },
    puedeSuspender: (fecha, hora) => {
        const ahora = new Date(); const evento = new Date(fecha + 'T' + hora);
        return ((evento - ahora) / 3600000) > 2; 
    },
    calcularSiguienteFecha: (fechaActual, diasRecurrencia) => {
        const date = new Date(fechaActual + 'T12:00:00');
        date.setDate(date.getDate() + 7);
        return date.toISOString().split('T')[0];
    }
};

const PadelSaaS = {
    analizarCuenta: function(cuenta, movsObj) {
        if (!cuenta) return null;
        const ahora = Date.now();
        const movimientos = movsObj ? Object.values(movsObj) : [];

        let deudaCanchas = 0;
        let deudaAbono = 0;

        movimientos.forEach(m => {
            if (m.estado === 'pendiente') {
                if (m.tipo === 'abono') deudaAbono += (m.monto || 0);
                else deudaCanchas += (m.monto || 0);
            }
        });

        const limiteTotal = cuenta.limiteCredito || 0;
        const vencimientoAbono = cuenta.vencimientoAbono || ahora;
        const disponible = Math.max(0, limiteTotal - deudaCanchas);

        const bloqueadoAbono = ahora > vencimientoAbono;
        const bloqueadoLimite = deudaCanchas > limiteTotal;
        const bloqueadoAdmin = cuenta.cuentaSuspendida === true;

        const isBlocked = bloqueadoAbono || bloqueadoLimite || bloqueadoAdmin;
        
        let msgLocked = "";
        if (bloqueadoAdmin) msgLocked = "Cuenta suspendida por administración.";
        else if (bloqueadoAbono) msgLocked = "Abono mensual vencido. Por favor, regularice su plan.";
        else if (bloqueadoLimite) msgLocked = "Límite de crédito excedido. Salde su deuda de canchas.";

        return {
            deudaCanchas,
            deudaAbono,
            limiteTotal,
            disponible,
            vencimientoAbono,
            isBlocked,
            msgLocked,
            bloqueadoAbono
        };
    },
    fmtFecha: function(ms) {
        if (!ms) return '--/--/----';
        const d = new Date(ms);
        return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
    }
};
