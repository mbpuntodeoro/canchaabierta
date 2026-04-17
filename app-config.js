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
