const options = {
    method: 'GET',
    headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    }
};

const provinciasSelect = document.getElementById('provincias');
const municipiosSelect = document.getElementById('municipios');
const timeTitle = document.getElementById('timeTitle')
const todayTime = document.getElementById('todayTime');
const tomorrowTime = document.getElementById('tomorrowTime');

provinciasSelect.addEventListener("change", getProvinciaTime, false);
municipiosSelect.addEventListener("change", getMunicipioTime, false);

async function getTodayTomorrowTime() {
    await fetch('https://www.el-tiempo.net/api/json/v2/home', options)
        .then(res => res.json())
        .then(json => {
            // Agregar el contenido de las previsiones
            todayTime.textContent = json.today.p.join(' ');
            tomorrowTime.textContent = json.tomorrow.p.join(' ');

            // Rellenar el select con las provincias
            const provincia = json.provincias;
            provincia.forEach(provincia => {
                const option = document.createElement('option');
                option.value = provincia.CODPROV;
                option.text = provincia.NOMBRE_PROVINCIA;
                provinciasSelect.appendChild(option);
            });
        });
}

async function getProvinciaTime() {
    const cod_prov = this.value;
    await fetch(`https://www.el-tiempo.net/api/json/v2/provincias/${cod_prov}`)
        .then(res => res.json())
        .then(json => {
            // Cambiar el título
            timeTitle.textContent = json.title;

            // Cambiar las previsiones
            todayTime.textContent = json.today.p;
            tomorrowTime.textContent = json.tomorrow.p;
        });
    addMunicipiosToSelect(cod_prov);
}

async function addMunicipiosToSelect(cod_prov) {
    municipiosSelect.innerHTML = "";

    await fetch(`https://www.el-tiempo.net/api/json/v2/provincias/${cod_prov}/municipios`)
        .then(res => res.json())
        .then(json => {
            // Añadir una opción por defecto
            const defaultOption = document.createElement('option');
            defaultOption.text = 'Elige un municipio';
            defaultOption.selected = true;
            defaultOption.disabled = true;
            municipiosSelect.appendChild(defaultOption);

            // Añadir cada uno de los municipios a la lista desplegable
            json.municipios.forEach(municipio => {
                const option = document.createElement('option');
                option.value = municipio.CODIGOINE;
                option.text = municipio.NOMBRE;
                municipiosSelect.appendChild(option);
            });
        });
}

async function getMunicipioTime() {
    const cod_mun = this.value.substring(0, 5);
    const cod_prov = provinciasSelect.options[provinciasSelect.selectedIndex].value;
    const mun_name = municipiosSelect.options[municipiosSelect.selectedIndex].text;

    await fetch(`https://www.el-tiempo.net/api/json/v2/provincias/${cod_prov}/municipios/${cod_mun}`)
        .then(res => res.json())
        .then(json => {

            const temp = json.pronostico.manana.temperatura.map(Number);
            const temp_min = Math.min(...temp);
            const temp_max = Math.max(...temp);

            // Mostrar el nombre del municipio en el título
            timeTitle.textContent = mun_name;

            // Mostrar las previsiones de las temperaturas del municipio
            todayTime.textContent = `${json.stateSky.description} ${json.temperatura_actual}°C (max: ${json.temperaturas.max}°C | min: ${json.temperaturas.min}°C)`;
            tomorrowTime.textContent = `(max: ${temp_max}°C | min: ${temp_min}°C)`;
        });
}

getTodayTomorrowTime();