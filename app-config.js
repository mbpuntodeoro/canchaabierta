// app-config.js - CEREBRO INTEGRAL PADELAPP
const firebaseConfig = {
    apiKey: "AIzaSyA0g_t1wW1ZIeQP9KPR-SkjiEO7HAbWGjI",
    authDomain: "padelapp-e72af.firebaseapp.com",
    databaseURL: "https://padelapp-e72af-default-rtdb.firebaseio.com",
    projectId: "padelapp-e72af",
    storageBucket: "padelapp-e72af.appspot.com",
    messagingSenderId: "806914592971",
    appId: "1:806914592971:web:84720063fc36a882b40b4e"
};

// Inicialización de Firebase (si no está inicializado)
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();

// 2. UTILIDADES GENERALES (PadelUtils)
const PadelUtils = {
    fmtDinero: (val) => {
        return new Intl.NumberFormat('es-AR', { 
            style: 'currency', 
            currency: 'ARS', 
            minimumFractionDigits: 0 
        }).format(val || 0);
    },
    
    copiarLink: (url) => {
        navigator.clipboard.writeText(url).then(() => alert("¡Link copiado!"));
    },

    // Verifica si se puede suspender una cancha (ej: 2 horas antes)
    puedeSuspender: (fecha, hora) => {
        const ahora = new Date();
        const evento = new Date(fecha + 'T' + hora);
        const dif = (evento - ahora) / (1000 * 60 * 60);
        return dif > 2; // Ejemplo: 2 horas de anticipación
    },

    calcularSiguienteFecha: (fechaActual, diasRecurrencia) => {
        // Lógica para calcular la próxima fecha en base a los días (MO, TU, etc.)
        const date = new Date(fechaActual + 'T12:00:00');
        date.setDate(date.getDate() + 7);
        return date.toISOString().split('T')[0];
    }
};

// 3. MOTOR DE LÓGICA DE NEGOCIO (PadelSaaS) - EL CORAZÓN DEL SISTEMA
const PadelSaaS = {
    analizarCuenta: function(cuentaInfo, movimientosObj) {
        if (!cuentaInfo) return null;

        const ahora = Date.now();
        // El límite financiero SOLO aplica a las canchas (turnos)
        const limiteCredito = cuentaInfo.limiteCredito || 50000;
        const vencimientoAbono = cuentaInfo.vencimientoAbono || ahora;
        
        let deudaAbono = 0;
        let deudaCanchas = 0;
        let cantCanchasPendientes = 0;

        const movimientos = movimientosObj ? Object.values(movimientosObj) : [];
        
        movimientos.forEach(m => {
            if (m.estado === 'pendiente') {
                if (m.tipo === 'abono') deudaAbono += (m.monto || 0);
                if (m.tipo === 'turno') {
                    deudaCanchas += (m.monto || 0);
                    cantCanchasPendientes++;
                }
            }
        });

        // REGLAS DE SUSPENSIÓN SEPARADAS
        const bloqueadoPorTiempo = ahora > vencimientoAbono;
        const bloqueadoPorLimite = deudaCanchas > (limiteCredito * 1.05); // Margen del 5%
        const isBlocked = bloqueadoPorTiempo || bloqueadoPorLimite || cuentaInfo.cuentaSuspendida;

        let msgLocked = "";
        if (isBlocked) {
            if (cuentaInfo.cuentaSuspendida) msgLocked = "Cuenta suspendida administrativamente.";
            else if (bloqueadoPorTiempo) msgLocked = "Abono mensual vencido.";
            else if (bloqueadoPorLimite) msgLocked = "Límite de crédito por canchas excedido.";
        }

        const diasParaVencer = Math.ceil((vencimientoAbono - ahora) / 86400000);
        let uxStatus = { icon: "", text: "", color: "", btnColor: "", btnText: "RENOVAR" };

        if (isBlocked) {
            uxStatus = {
                icon: bloqueadoPorTiempo ? "🔴 Abono Vencido" : "🔴 Límite Excedido",
                text: bloqueadoPorTiempo ? "Venció el " + this.fmtFecha(vencimientoAbono) : "Debe saldar canchas",
                color: "var(--danger)", btnColor: "var(--danger)", btnText: "ACTIVAR"
            };
        } else {
            uxStatus = {
                icon: `🟢 Activo (Vence ${this.fmtFecha(vencimientoAbono)})`,
                text: `Límite disponible: ${PadelUtils.fmtDinero(limiteCredito - deudaCanchas)}`,
                color: "var(--success)", btnColor: "var(--primary)", btnText: "RENOVAR"
            };
        }

        return {
            deudaAbono,
            deudaCanchas,
            cantCanchasPendientes,
            deudaTotal: deudaAbono + deudaCanchas,
            limiteCredito,
            isBlocked,
            msgLocked,
            diasParaVencer,
            vencimientoAbono,
            ux: uxStatus
        };
    },
    fmtFecha: function(ms) {
        const d = new Date(ms);
        return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
    }
};
