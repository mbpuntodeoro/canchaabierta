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
    analizarCuenta: function(cuenta, movsObj) {
        if (!cuenta) return null;
        
        const ahora = Date.now();
        const movimientos = movsObj ? (Array.isArray(movsObj) ? movsObj : Object.values(movsObj)) : [];
        
        let deudaCanchasPendiente = 0;
        let deudaAbonoPendiente = 0;

        // Procesar movimientos del Ledger
        movimientos.forEach(m => {
            if (m.estado === 'pendiente') {
                if (m.tipo === 'abono') {
                    deudaAbonoPendiente += (m.monto || 0);
                } else {
                    deudaCanchasPendiente += (m.monto || 0);
                }
            }
        });

        const limiteAsignado = cuenta.limiteCredito || 0;
        const vencimientoAbono = cuenta.vencimientoAbono || ahora;
        
        // REGLAS INDEPENDIENTES DE SUSPENSIÓN
        const bloqueadoPorTiempo = ahora > vencimientoAbono;
        const bloqueadoPorLimite = deudaCanchasPendiente > (limiteAsignado * 1.05);
        const bloqueadoAdministrativo = cuenta.cuentaSuspendida === true;

        const isBlocked = bloqueadoPorTiempo || bloqueadoPorLimite || bloqueadoAdministrativo;

        // Definir mensaje de error
        let msgLocked = "";
        if (bloqueadoAdministrativo) msgLocked = "Cuenta suspendida por administración.";
        else if (bloqueadoPorTiempo) msgLocked = "Abono mensual vencido.";
        else if (bloqueadoPorLimite) msgLocked = "Límite de crédito por canchas excedido.";

        return {
            vencimientoAbono: vencimientoAbono,
            deudaCanchas: deudaCanchasPendiente,
            deudaAbono: deudaAbonoPendiente,
            limiteTotal: limiteAsignado,
            disponible: Math.max(0, limiteAsignado - deudaCanchasPendiente),
            porcentaje: limiteAsignado > 0 ? (deudaCanchasPendiente / limiteAsignado) * 100 : 0,
            isBlocked: isBlocked,
            msgLocked: msgLocked,
            statusTime: bloqueadoPorTiempo ? 'vencido' : 'ok',
            statusLimit: bloqueadoPorLimite ? 'vencido' : 'ok'
        };
    },

    fmtFecha: function(ms) {
        if (!ms) return '--/--/----';
        const d = new Date(ms);
        return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
    }
};
