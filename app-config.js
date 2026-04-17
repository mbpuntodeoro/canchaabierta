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

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const PadelUtils = {
    // Miércoles 22/04/2026
    fmtFechaFull: (f) => {
        if (!f) return '--';
        const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const partes = f.split('-');
        const d = new Date(partes[0], partes[1] - 1, partes[2]); 
        return `${dias[d.getDay()]} ${partes[2]}/${partes[1]}/${partes[0]}`;
    },
    // Mié 22/04
    fmtFechaCorta: (f) => {
        if (!f) return '--';
        const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        const partes = f.split('-');
        const d = new Date(partes[0], partes[1] - 1, partes[2]);
        return `${dias[d.getDay()]} ${partes[2]}/${partes[1]}`;
    },
    fmtDinero: (n) => "$" + (n || 0).toLocaleString('es-AR'),
    
    copiarLink: (url) => {
        const t = document.createElement("input");
        document.body.appendChild(t); t.value = url; t.select();
        document.execCommand("copy"); document.body.removeChild(t);
        alert("¡Link copiado!");
    },

    calcularSiguienteFecha: (fechaActual, diasArray) => {
        const dayMap = { 'SU': 0, 'MO': 1, 'TU': 2, 'WE': 3, 'TH': 4, 'FR': 5, 'SA': 6 };
        let d = new Date(fechaActual + 'T12:00:00');
        
        if (!diasArray || diasArray.length === 0) {
            d.setDate(d.getDate() + 7);
            return d.toISOString().split('T')[0];
        }
        
        const targetDays = diasArray.map(d => dayMap[d]);
        for (let i = 1; i <= 14; i++) {
            d.setDate(d.getDate() + 1);
            if (targetDays.includes(d.getDay())) return d.toISOString().split('T')[0];
        }
        return fechaActual;
    },

    puedeSuspender: (fecha, hora) => {
        const inicio = new Date(fecha + 'T' + hora).getTime();
        const ahora = Date.now();
        const diffHoras = (inicio - ahora) / (1000 * 60 * 60);
        return diffHoras > 1; // True si falta más de una hora
    }
};

// ==========================================
// MOTOR SAAS: Lógica Financiera y Candados
// ==========================================
const PadelSaaS = {
    analizarCuenta: function(cuentaInfo, movimientosObj) {
        if (!cuentaInfo) return null;

        const ahora = Date.now();
        const limiteAsignado = cuentaInfo.limiteCredito || 50000;
        const vencimientoAbono = cuentaInfo.vencimientoAbono || ahora;
        
        let deudaAbonoPendiente = 0;
        let deudaCanchasPendiente = 0;
        let cantCanchasPendientes = 0;

        const movimientos = movimientosObj ? Object.values(movimientosObj) : [];
        
        movimientos.forEach(m => {
            if (m.estado === 'pendiente') {
                if (m.tipo === 'abono') deudaAbonoPendiente += (m.monto || 0);
                if (m.tipo === 'turno') {
                    deudaCanchasPendiente += (m.monto || 0);
                    cantCanchasPendientes++;
                }
            }
        });

        const disponibleLimite = Math.max(0, limiteAsignado - deudaCanchasPendiente);
        const porcentajeConsumido = Math.min(100, (deudaCanchasPendiente / limiteAsignado) * 100);

        // REGLAS DE SUSPENSIÓN INDEPENDIENTES
        const bloqueadoPorTiempo = ahora > vencimientoAbono;
        const bloqueadoPorLimite = deudaCanchasPendiente > (limiteAsignado * 1.05);
        const isBlocked = bloqueadoPorTiempo || bloqueadoPorLimite || cuentaInfo.cuentaSuspendida;

        let msgLocked = "";
        if (isBlocked) {
            if (cuentaInfo.cuentaSuspendida) msgLocked = "Cuenta suspendida por administración.";
            else if (bloqueadoPorTiempo) msgLocked = "Abono mensual vencido. Acceso restringido.";
            else if (bloqueadoPorLimite) msgLocked = "Límite de canchas excedido. Salde deuda para continuar.";
        }

        return {
            deudaAbonoPendiente,
            deudaCanchasPendiente,
            cantCanchasPendientes,
            limiteAsignado,
            disponibleLimite,
            porcentajeConsumido,
            isBlocked,
            msgLocked,
            vencimientoAbono,
            ux: {
                colorAbono: bloqueadoPorTiempo ? 'var(--danger)' : 'var(--success)',
                colorLimite: bloqueadoPorLimite ? 'var(--danger)' : 'var(--success)'
            }
        };
    },
    fmtFecha: function(ms) {
        const d = new Date(ms);
        return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
    }
};
