// app-config.js - V15.0 (Cerebro con Control de Suspensión)

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
    fmtFechaFull: (f) => {
        if (!f) return '--';
        const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const partes = f.split('-');
        const d = new Date(partes[0], partes[1] - 1, partes[2]); 
        return `${dias[d.getDay()]} ${partes[2]}/${partes[1]}/${partes[0]}`;
    },
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
        if (!diasArray || diasArray.length === 0) {
            let d = new Date(fechaActual + 'T12:00:00');
            d.setDate(d.getDate() + 7);
            return d.toISOString().split('T')[0];
        }
        const dayMap = { 'SU': 0, 'MO': 1, 'TU': 2, 'WE': 3, 'TH': 4, 'FR': 5, 'SA': 6 };
        const targetDays = diasArray.map(d => dayMap[d]);
        let d = new Date(fechaActual + 'T12:00:00');
        for (let i = 1; i <= 14; i++) {
            d.setDate(d.getDate() + 1);
            if (targetDays.includes(d.getDay())) return d.toISOString().split('T')[0];
        }
        return fechaActual;
    },
    // NUEVA: Verifica si falta más de 1 hora para el inicio
    puedeSuspender: (fecha, hora) => {
        const inicio = new Date(fecha + 'T' + hora).getTime();
        const ahora = Date.now();
        const diferenciaHoras = (inicio - ahora) / (1000 * 60 * 60);
        return diferenciaHoras > 1;
    }
};
