'use strict';
import { h, html, render, useEffect, useState } from './preact.min.js';


const Configuration = function (props) {
  const [url, setUrl] = useState(props.config.url || '');
  const [pub, setPub] = useState(props.config.pub || '');
  const [sub, setSub] = useState(props.config.sub || '');

  useEffect(() => {
    setUrl(props.config.url);
    setPub(props.config.pub);
    setSub(props.config.sub);
  }, [props.config]);

  const update = (name, val) =>
    fetch('/api/config/set', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        [name]: val
      })
    })
      .catch(err => {
        console.log(err);
        enable(false);
      });

  const updateurl = ev => update('url', url);
  const updatepub = ev => update('pub', pub);
  const updatesub = ev => update('sub', sub);

  /*return html`
<h3 style="background: #4b6cb7; color: #fff; padding: 0.4em;">
  Device Configuration</h3>
<div style="margin: 0.5em 0; display: flex;">
  <span class="addon nowrap">Embedded Server:</span>
  <input type="text" style="flex: 1 100%;"
        value=${url} onchange=${updateurl}
        oninput=${ev => setUrl(ev.target.value)} />
  <button class="btn" disabled=${!url} onclick=${updateurl}
    style="margin-left: 1em; background: #8aa;">Update</button>
</div>
<div style="margin: 0.5em 0; display: flex; ">
  <span class="addon nowrap">Subscribe topic:</span>
  <input type="text" style="flex: 1 100%;"
      value=${sub} onchange=${updatesub}
      oninput=${ev => setSub(ev.target.value)} />
  <button class="btn" disabled=${!sub} onclick=${updatesub}
    style="margin-left: 1em; background: #8aa;">Update</button>
</div>
<div style="margin: 0.5em 0; display: flex;">
  <span class="addon nowrap">Publish topic:</span>
  <input type="text" style="flex: 1 100%;"
        value=${pub} onchange=${updatepub}
        oninput=${ev => setPub(ev.target.value)} />
  <button class="btn" disabled=${!pub} onclick=${updatepub}
    style="margin-left: 1em; background: #8aa;">Update</button>
</div>`;*/
};
//
const CurrentChart = ({ data }) => {
    useEffect(() => {
        if (data.length > 0) {
            const ctx = document.getElementById("currentChart").getContext("2d");
            new Chart(ctx, {
                type: "line",
                data: {
                    labels: data.map((item) => `${item.Fecha} ${item.Hora}`), // Se concatena Fecha y Hora
                    datasets: [
                        {
                            label: "Corriente",
                            data: data.map((item) => item["Corriente RMS"]),
                            borderColor: "rgba(75, 192, 192, 1)",
                            fill: false,
                        },
                    ],
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true,
                        },
                    },
                },
            });
        }
    }, [data]);

    return (
        data.length > 0
    );
};

const VoltageChart = ({ data }) => {
    useEffect(() => {
        if (data.length > 0) {
            const ctx = document.getElementById("voltageChart").getContext("2d");
            new Chart(ctx, {
                type: "bar",
                data: {
                    labels: data.map((item) => `${item.Fecha} ${item.Hora}`), // Se concatena Fecha y Hora
                    datasets: [
                        {
                            label: "Voltaje",
                            data: data.map((item) => item["Voltaje RMS"]),
                            backgroundColor: "rgba(75, 192, 192, 0.2)",
                            borderColor: "rgba(75, 192, 192, 1)",
                            borderWidth: 1,
                        },
                    ],
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true,
                        },
                    },
                },
            });
        }
    }, [data]);

    return (
        data.length > 0
    );
};

//
const DataList = ({ data }) => (
    data.length > 0 && html`
    <h3>Datos de la base de datos</h3>
    <ul>
        ${data.map((item) => html`
        <li>
            ID: ${item["ID"]},
            Fecha: ${item["Fecha"]},
            Hora: ${item["Hora"]},
            Voltaje RMS: ${item["Voltaje RMS"]},
            Línea de Frecuencia: ${item["Línea de Frecuencia"]},
            Factor de Potencia: ${item["Factor de Potencia"]},
            Corriente RMS: ${item["Corriente RMS"]},
            Potencia Activa: ${item["Potencia Activa"]},
            Potencia Reactiva: ${item["Potencia Reactiva"]},
            Potencia Aparente: ${item["Potencia Aparente"]}
        </li>`)}
    </ul>
  `
);


const App = function (props) {
    const [config, setConfig] = useState({});
    const [data, setData] = useState([]);
    const [showGraph, setShowGraph] = useState(false); // Nuevo estado para controlar la visualización de la gráfica

    const getconfig = () =>
        fetch('/api/config/get')
            .then(r => r.json())
            .then(r => setConfig(r))
            .catch(err => console.log(err));

    //control cantidad de datos
    const getData = () =>
        fetch('/api/data/get')
            .then(r => r.json())
            .then(r => {
                console.log("Datos recibidos:", r);
                setData(r.slice(-15) // Modificar esta línea para mostrar sólo los primeros 10 registros
                );
            });

    useEffect(() => {
        getconfig();
        getData(); // Obtener los datos inmediatamente después de que el componente se monte
    }, []);

    return html`
        
        ${h(CurrentChart, { data })}
        ${h(VoltageChart, { data })}
        `; // Añade esta línea para mostrar u ocultar la gráfica según el estado showGraph
    /*
    ${h(Configuration, { config })}
       ${h(DataList, { data })}
        */
};

//window.onload = () => render(h(App), document.body);
window.onload = () => {
    render(h(App), document.body);
    (function ($) {
        "use strict";

        // Navbar on scrolling
        $(window).scroll(function () {
            if ($(this).scrollTop() > 200) {
                $('.navbar').fadeIn('slow').css('display', 'flex');
            } else {
                $('.navbar').fadeOut('slow').css('display', 'none');
            }
        });


        // Smooth scrolling on the navbar links
        $(".navbar-nav a, .btn-scroll").on('click', function (event) {
            if (this.hash !== "") {
                event.preventDefault();

                $('html, body').animate({
                    scrollTop: $(this.hash).offset().top - 45
                }, 1500, 'easeInOutExpo');

                if ($(this).parents('.navbar-nav').length) {
                    $('.navbar-nav .active').removeClass('active');
                    $(this).closest('a').addClass('active');
                }
            }
        });


        // Scroll to Bottom
        $(window).scroll(function () {
            if ($(this).scrollTop() > 100) {
                $('.scroll-to-bottom').fadeOut('slow');
            } else {
                $('.scroll-to-bottom').fadeIn('slow');
            }
        });


        // Portfolio isotope and filter
        var portfolioIsotope = $('.portfolio-container').isotope({
            itemSelector: '.portfolio-item',
            layoutMode: 'fitRows'
        });
        $('#portfolio-flters li').on('click', function () {
            $("#portfolio-flters li").removeClass('active');
            $(this).addClass('active');

            portfolioIsotope.isotope({filter: $(this).data('filter')});
        });


        // Back to top button
        $(window).scroll(function () {
            if ($(this).scrollTop() > 200) {
                $('.back-to-top').fadeIn('slow');
            } else {
                $('.back-to-top').fadeOut('slow');
            }
        });
        $('.back-to-top').click(function () {
            $('html, body').animate({scrollTop: 0}, 1500, 'easeInOutExpo');
            return false;
        });

    })(jQuery);
};