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


// =======================================================
// A PARTIR DE ACÁ, PEGÁS LA LÓGICA QUE TE PASÉ ANTES
// =======================================================

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
