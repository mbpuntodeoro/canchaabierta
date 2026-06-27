// 1. ACÁ VAN TUS LLAVES DE FIREBASE (¡No las borres!)
const firebaseConfig = {
  apiKey: "AIzaSyA0g_t1wW1ZIeQP9KPR-SkjiEO7HAbWGjI",
  authDomain: "padelapp-e72af.firebaseapp.com",
  databaseURL: "https://padelapp-e72af-default-rtdb.firebaseio.com",
  projectId: "padelapp-e72af",
  storageBucket: "padelapp-e72af.firebasestorage.app",
  messagingSenderId: "806914592971",
  appId: "1:806914592971:web:84720063fc36a882b40b4e"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();


// 2. UTILIDADES Y MOTOR FINANCIERO
const PadelUtils = {
    fmtDinero: (val) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(val || 0),
    copiarLink: (url) => { navigator.clipboard.writeText(url).then(() => alert("¡Copiado al portapapeles!")); },
    puedeSuspender: (fecha, hora) => {
        const ahora = new Date(); const evento = new Date(fecha + 'T' + hora);
        return ((evento - ahora) / 3600000) > 2; 
    },
    calcularSiguienteFecha: (fechaActual, diasRecurrencia) => {
        const date = new Date(fechaActual + 'T12:00:00');
        date.setDate(date.getDate() + 7);
        return date.toISOString().split('T')[0];
    },
    fmtFechaFull: (f) => {
        if(!f) return '--';
        const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const m = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const d = new Date(f + 'T12:00:00');
        return `${dias[d.getDay()]} ${d.getDate()} de ${m[d.getMonth()]}`;
    },
    fmtFechaCorta: (f) => {
        if(!f) return '--';
        const d = new Date(f + 'T12:00:00');
        return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
    }
};

const PadelSaaS = {
    analizarCuenta: function(cuenta, movsObj) {
        if (!cuenta) return null;
        const ahora = Date.now();
        const movimientos = movsObj ? Object.values(movsObj) : [];

        let deudaCanchas = 0;
        let deudaAbono = 0;
        let cantTurnosPendientes = 0;
        let consumoBonificado = 0;
        let cantTurnosBonificados = 0;

        movimientos.forEach(m => {
            if (m.estado === 'pendiente') {
                if (m.tipo === 'abono') deudaAbono += (m.monto || 0);
                else { deudaCanchas += (m.monto || 0); cantTurnosPendientes++; }
            } else if (m.estado === 'bonificado') {
                consumoBonificado += (m.monto || 0);
                cantTurnosBonificados++;
            }
        });

    
       // --- LÓGICA DE TRIAL POR TIEMPO ---
let enTrial = cuenta.enTrial === true;

const vencimientoAbono = cuenta.vencimientoAbono || ahora;

const fechaVencObj = new Date(vencimientoAbono);
fechaVencObj.setHours(23, 59, 59, 999);

const vencimientoReal = fechaVencObj.getTime();

const trialVencido =
    enTrial && ahora > vencimientoReal;

if (trialVencido) {
    enTrial = false;
}

        // --- CÁLCULO DE DISPONIBLE (Esquema $29k / 8 canchas / $5k extra) ---
        // Si no es trial, el límite de crédito debería ser suficiente para cubrir extras
        const limiteCreditoBase = cuenta.limiteCredito || 50000;
        const disponible = enTrial ? 999999 : Math.max(0, limiteCreditoBase - deudaCanchas);
        
        const bloqueadoAbono = ahora > vencimientoReal; 
        const bloqueadoLimite = enTrial ? false : (deudaCanchas > limiteCreditoBase);
        const bloqueadoAdmin = cuenta.cuentaSuspendida === true;

        const isBlocked = !enTrial && (bloqueadoAbono || bloqueadoLimite || bloqueadoAdmin);
        
        let msgLocked = "";

if (bloqueadoAdmin) {
    msgLocked = "Cuenta suspendida por administración.";
} else if (trialVencido) {
    msgLocked = "Prueba gratuita finalizada. Activá el abono para continuar.";
} else if (bloqueadoAbono) {
    msgLocked = "Abono mensual vencido. Regularice su plan para continuar.";
} else if (bloqueadoLimite) {
    msgLocked = "Límite de crédito excedido.";
}

        return {
    deudaCanchas,
    deudaAbono,
    cantTurnosPendientes,

    consumoBonificado,
    cantTurnosBonificados,

    disponible,
    vencimientoAbono,

    trialVencido,

    isBlocked,
    msgLocked,
    enTrial
};
    },
    fmtFecha: function(ms) {
        if (!ms) return '--/--/----';
        const d = new Date(ms);
        return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
    }
};
