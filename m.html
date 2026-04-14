<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Master Dashboard - Cancha Abierta</title>
    <style>
        :root { --primary: #007aff; --bg: #f2f2f7; --card: #ffffff; --text: #1c1c1e; --sub: #8e8e93; }
        body { font-family: -apple-system, system-ui, sans-serif; background: var(--bg); color: var(--text); margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: auto; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
        .header h1 { font-size: 24px; font-weight: 800; letter-spacing: -1px; margin: 0; }
        
        /* TARJETAS DE ORGANIZADOR */
        .org-card { background: var(--card); border-radius: 20px; padding: 20px; margin-bottom: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); border: 1px solid rgba(0,0,0,0.02); }
        .org-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
        .org-name { font-size: 18px; font-weight: 700; color: var(--text); text-transform: uppercase; }
        .badge { background: #e1f0ff; color: var(--primary); padding: 4px 10px; border-radius: 8px; font-size: 11px; font-weight: 700; }
        
        .actions { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .btn { padding: 12px; border-radius: 12px; border: none; font-size: 13px; font-weight: 600; cursor: pointer; text-decoration: none; text-align: center; transition: 0.2s; }
        .btn-view { background: #f2f2f7; color: var(--text); }
        .btn-admin { background: var(--primary); color: white; }
        .btn:active { transform: scale(0.96); }

        .btn-add { background: #1c1c1e; color: white; width: 100%; margin-top: 20px; padding: 15px; border-radius: 15px; font-weight: 700; border: none; cursor: pointer; }
        
        .hidden { display: none; }
        .event-list { margin-top: 15px; border-top: 1px solid #f2f2f7; padding-top: 15px; }
        .event-item { font-size: 13px; padding: 8px 0; display: flex; justify-content: space-between; border-bottom: 1px solid #f9f9fb; }
        .event-item a { color: var(--primary); text-decoration: none; font-weight: 600; }
    </style>
</head>
<body>

<div class="container">
    <div class="header">
        <h1>Centro de Mandos</h1>
        <div style="font-size: 20px;">🚀</div>
    </div>

    <div id="org-list">
        </div>

    <button class="btn-add" onclick="nuevoOrg()">+ Agregar Organizador</button>
</div>

<script type="module">
    import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
    import { getDatabase, ref, onValue, get } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

    const firebaseConfig = { databaseURL: "https://padelapp-e72af-default-rtdb.firebaseio.com" };
    const app = initializeApp(firebaseConfig);
    const db = getDatabase(app);

    // Cargar todos los Hubs (Organizadores)
    onValue(ref(db, 'hubs'), (snap) => {
        const hubs = snap.val() || {};
        const container = document.getElementById('org-list');
        container.innerHTML = "";

        Object.keys(hubs).forEach(orgId => {
            const eventCount = hubs[orgId].length;
            const card = document.createElement('div');
            card.className = 'org-card';
            card.innerHTML = `
                <div class="org-header">
                    <span class="org-name">${orgId}</span>
                    <span class="badge">${eventCount} CANCHAS</span>
                </div>
                <div class="actions">
                    <a href="v.html?org=${orgId}" target="_blank" class="btn btn-view">Ver Cartelera</a>
                    <button class="btn btn-admin" onclick="toggleEvents('${orgId}')">Gestionar Canchas</button>
                </div>
                <div id="list-${orgId}" class="event-list hidden">
                    <p style="font-size: 10px; font-weight: 800; color: #8e8e93; margin-bottom: 10px;">SELECCIONAR CANCHA PARA EDITAR:</p>
                    <div id="items-${orgId}">Cargando...</div>
                </div>
            `;
            container.appendChild(card);
            
            // Cargar los nombres de los eventos de este hub
            hubs[orgId].forEach(id => {
                get(ref(db, 'eventos/' + id)).then(s => {
                    const d = s.val();
                    const link = document.createElement('div');
                    link.className = 'event-item';
                    link.innerHTML = `
                        <span>${d.organiza || id}</span>
                        <a href="v.html?id=${id}" target="_blank">EDITAR ⚙️</a>
                    `;
                    const listDiv = document.getElementById('items-' + orgId);
                    if(listDiv.innerHTML === "Cargando...") listDiv.innerHTML = "";
                    listDiv.appendChild(link);
                });
            });
        });
    });

    window.toggleEvents = (id) => {
        document.getElementById('list-' + id).classList.toggle('hidden');
    };

    window.nuevoOrg = () => {
        alert("Función para crear nuevo org desde aquí próximamente. Por ahora crealo en Firebase como 'hubs/nombre-nuevo'");
    };
</script>
</body>
</html>
