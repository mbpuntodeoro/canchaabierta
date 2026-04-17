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
        // 1. Validaciones iniciales
        if (!cuentaInfo || !cuentaInfo.nombreOrg) return null;

        const ahora = Date.now();
        const limite = cuentaInfo.limiteCredito || 50000;
        const vencimientoAbono = cuentaInfo.vencimientoAbono || cuentaInfo.trialExpiryDate || ahora;
        
        let deudaAbono = 0;
        let deudaTurnos = 0;
        let cantTurnosPendientes = 0;
        let pagadoEsteMes = 0;
        const mesActual = new Date().getMonth();

        // 2. Procesar el Libro Mayor (Ledger)
        const movimientos = movimientosObj ? Object.values(movimientosObj) : [];
        
        movimientos.forEach(m => {
            if (m.estado === 'pendiente') {
                if (m.tipo === 'abono') deudaAbono += (m.monto || 0);
                if (m.tipo === 'turno') {
                    deudaTurnos += (m.monto || 0);
                    cantTurnosPendientes++;
                }
            } else if (m.estado === 'pagado') {
                const d = new Date(m.fechaPago || m.fecha);
                if (d.getMonth() === mesActual) {
                    pagadoEsteMes += (m.monto || 0);
                }
            }
        });

        const deudaTotal = deudaAbono + deudaTurnos;
        const disponible = Math.max(0, limite - deudaTotal);

        // 3. Evaluar el Doble Candado
        const bloqueoPorLimite = deudaTotal > (limite * 1.05);
        const bloqueoPorTiempo = ahora > vencimientoAbono;
        const isBlocked = bloqueoPorLimite || bloqueoPorTiempo || cuentaInfo.cuentaSuspendida;

        // 4. Determinar Textos de Alertas y UX
        let msgLocked = "";
        if (isBlocked) {
            if (bloqueoPorTiempo) msgLocked = "Abono vencido. Regularice su pago.";
            else if (bloqueoPorLimite) msgLocked = "Límite de crédito excedido.";
            else msgLocked = "Cuenta suspendida administrativamente.";
        }

        const diasParaVencer = Math.ceil((vencimientoAbono - ahora) / 86400000);
        let uxStatus = { icon: "", text: "", color: "", btnColor: "", btnText: "RENOVAR AHORA" };

        if (isBlocked) {
            uxStatus = {
                icon: bloqueoPorTiempo ? "🔴 Abono Vencido" : "🔴 Cuenta Suspendida",
                text: bloqueoPorTiempo ? "Venció el " + this.fmtFecha(vencimientoAbono) : "Operación bloqueada",
                color: "var(--danger)", btnColor: "var(--danger)", btnText: "ACTIVAR PLAN"
            };
        } else if (diasParaVencer <= 3 && diasParaVencer > 0) {
            uxStatus = {
                icon: `⚠️ Vence en ${diasParaVencer} ${diasParaVencer === 1 ? 'día' : 'días'}`,
                text: "Aboná para evitar el corte",
                color: "var(--danger)", btnColor: "var(--danger)", btnText: "RENOVAR AHORA"
            };
        } else if (diasParaVencer <= 7) {
            uxStatus = {
                icon: "🟡 Activo hasta el " + this.fmtFecha(vencimientoAbono),
                text: "Tu plan vence pronto",
                color: "var(--warning)", btnColor: "var(--primary)", btnText: "RENOVAR AHORA"
            };
        } else {
            uxStatus = {
                icon: "🟢 Activo hasta el " + this.fmtFecha(vencimientoAbono),
                text: "Te quedan " + diasParaVencer + " días",
                color: "var(--success)", btnColor: "var(--primary)", btnText: "RENOVAR AHORA"
            };
        }

        // 5. Retornar la "Foto" Financiera completa
        return {
            deudaAbono,
            deudaTurnos,
            cantTurnosPendientes,
            pagadoEsteMes,
            deudaTotal,
            limite,
            disponible,
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
