// app-config.js - El Cerebro Único de PadelApp

// 1. Configuración de Firebase (Se centraliza aquí)
const firebaseConfig = {
    apiKey: "AIzaSyA0g_t1wW1ZIeQP9KPR-SkjiEO7HAbWGjI",
    authDomain: "padelapp-e72af.firebaseapp.com",
    databaseURL: "https://padelapp-e72af-default-rtdb.firebaseio.com",
    projectId: "padelapp-e72af",
    storageBucket: "padelapp-e72af.appspot.com",
    messagingSenderId: "806914592971",
    appId: "1:806914592971:web:84720063fc36a882b40b4e"
};

// Inicialización de Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();

// 2. Utilidades Globales (Si arreglamos algo aquí, se arregla en todos lados)
const PadelUtils = {
    // FECHA HUMANA COMPLETA: Miércoles 22/04/2026
    fmtFechaFull: (f) => {
        if (!f) return '--';
        const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const partes = f.split('-'); // f viene como "2026-04-22"
        const d = new Date(partes[0], partes[1] - 1, partes[2]); 
        const diaNombre = dias[d.getDay()];
        const diaNum = partes[2];
        const mesNum = partes[1];
        const anioNum = partes[0];
        return `${diaNombre} ${diaNum}/${mesNum}/${anioNum}`;
    },

    // FECHA CORTA: Mié 22/04
    fmtFechaCorta: (f) => {
        if (!f) return '--';
        const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        const partes = f.split('-');
        const d = new Date(partes[0], partes[1] - 1, partes[2]);
        return `${dias[d.getDay()]} ${partes[2]}/${partes[1]}`;
    },

    // FORMATO DINERO
    fmtDinero: (n) => "$" + (n || 0).toLocaleString('es-AR'),

    // COPIAR AL PORTAPAPELES
    copiarLink: (url) => {
        const t = document.createElement("input");
        document.body.appendChild(t);
        t.value = url;
        t.select();
        document.execCommand("copy");
        document.body.removeChild(t);
        alert("¡Link copiado con éxito!");
    }
};
