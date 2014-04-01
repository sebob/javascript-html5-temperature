google.load("visualization", "1", {packages: ["corechart"]});

var getTime = function (strTime) {
    'use strict';
    var tabData = strTime.split("-"),
        tabTime = tabData[3].split(":");

    return {
        millisecond: 0,
        second: 0,
        minute: parseFloat(tabTime[1]),
        hour: parseFloat(tabTime[0]),
        day: parseFloat(tabData[2]),
        month: (parseInt(tabData[1], 10) - 1),
        year: parseFloat(tabData[0])
    };
};

var wykres2 = function (dane, start, stop, p_czas, czas_od, czas_do) {
    'use strict';
    var czas = Date.today().set(getTime(start)),
        list = [],
        ilosc_minut = null,
        przedzial = null,
        chart = null,
        jsCzasu = (19 * ilosc_minut),
        test = [],
        tablicaCzasow = [],
        select_data_od = $('<select name="czas_od" />'),
        select_data_do = $('<select name="czas_do" />'),
        data = new google.visualization.DataTable(),
        options = {};

    ilosc_minut = p_czas;

    $.each(dane, function (index, value) {
        list.push(
            [
                czas.toString('HH:mm'),
                parseInt(value, 16),
                czas.toString('yyyy/M/d'),
                czas.getTime()
            ]
        );
        czas.addSeconds(3.158);
    });

    test.push(['Wybierz', 0, 0]);


    $.each(list, function (index, val) {
        if (index % jsCzasu === 0) {
            if (val[3] >= parseInt(czas_od, 10) && val[3] <= new Date(parseInt(czas_do, 10)).getTime() && czas_od <= czas_do) {
                tablicaCzasow.push([val[0], val[1]]);
            }

            if (parseInt(czas_od, 10) === 0 || parseInt(czas_do, 10) === 0 || czas_od > czas_do) {
                tablicaCzasow.push([val[0], val[1]]);
            }
        }
        if ((index % 1440) === 0) {
            test.push([new Date(val[3]).toString('d/M/yyyy HH:mm'), val[3]]);
        }
    });
    if ($('select[name="czas_od"] option').length === 0 && $('select[name="czas_do"] option').length === 0) {
        $.each(test, function(key, value) {
            $(select_data_od).append($("<option></option>").attr("value", value[1]).text(value[0]));
            $(select_data_do).append($("<option></option>").attr("value", value[1]).text(value[0]));
        });

        $('select[name="czas"]').after(select_data_do);
        $('select[name="czas"]').after(select_data_od);
    }

    data.addColumn('string', 'Czas t[' + p_czas + 'm]');
    data.addColumn('number', 'Temperatura \u00B0 C');
    data.addRows(tablicaCzasow);

    przedzial = (parseInt(czas_od, 10) > 0 && parseInt(czas_do, 10) > 0) ? '| Wybrany przedział czasu: '
        + new Date(parseInt(czas_od, 10)).toString('d/M/yyyy HH:mm')
        + ' - '
        + new Date(parseInt(czas_do, 10)).toString('d/M/yyyy HH:mm') : '';

    options = {
        title: 'Wykres temperatury od:' + start + ((stop > 0) ? ' do: ' + stop : '') + ', co ' + ilosc_minut + " minut.",
        width: 1400,
        height: 340,
        enableInteractivity: true,
        focusTarget: true,
        strictFirstColumnType: true,
        showRowNumber: true,
        showValue: true,
        legend: true,
        pointSize: 2,
        series: [{color: '#9797E5', visibleInLegend: true}, {}, {}, {color: 'red', visibleInLegend: false}],
        tooltop: {textStyle: {color: '#FF0000'}, showColorCode: true},
        showAxisLines: true,

        hAxes: [{title: 'Czas t[' + p_czas + 'm] \u000A' + przedzial, textStyle: {color: 'red', fontSize: 12}}],
        vAxes: [
            {title: 'Temperatura \u00B0 C', textStyle: {color: 'red', fontSize: 11}}
        ],
        hAxis: {title: 'Czas t[' + p_czas + 'm] ', titleTextStyle: {color: 'black', fontSize: 12, fontName: 'Verdana, Arial'}},
        vAxis: {titlePosition: 'out', title: 'Temperatura \u00B0 C', titleTextStyle: {color: '#9797E5', fontSize: 12, fontName: 'Verdana, Arial'}},
        chartArea: {left: 40, top: 60}
    };

    chart = new google.visualization.LineChart(document.getElementById('chart_div'));
    chart.draw(data, options);
};


var diffTime = function (time1, time2) {
    'use strict';
    return time1 - time2;
};

function readBlob(opt_startByte, opt_stopByte, czas, czas_od, czas_do) {

    var files = document.getElementById('files').files,
        file = null,
        start = null,
        stop = null,
        reader = new FileReader(),
        blob = null;

    if (!files.length) {
        alert('Wybierz plik!');
        return null;
    }

    file = files[0];
    start = parseInt(opt_startByte) || 0;
    stop = parseInt(opt_stopByte) || file.size - 1;

    // If we use onloadend, we need to check the readyState.
    reader.onloadend = function (evt) {
        if (evt.target.readyState === FileReader.DONE) { // DONE == 2
            var plik = new String(evt.target.result),
                reg = /\d{4}-\d{2}-\d{2}\s-\s\d{2}:\d{2}:\d{2}/g,
                tablicaWynikow = plik.match(reg),
                reg_dane = /\w{2}/gm,
                dane2 = plik.replace(reg, ""),
                dane3 = dane2.replace("Terminal log file", ""),
                dane4 = dane3.replace("Date:", ""),
                dane5 = dane4.replace("-", ""),
                dane6 = dane5.replace("End log file", ""),
                dane7 = dane6.replace("Date", ""),
                dane8 = dane7.replace(/(\r\n|\n|\r|\W)/gm, ""),
                dane_docelowe1 = dane8.match(reg_dane);
            wykres2(dane_docelowe1, tablicaWynikow[0], tablicaWynikow[1], czas, czas_od, czas_do);
            ['Read bytes: ', start + 1, ' - ', stop + 1, ' of ', file.size, ' byte file'].join('');
        }
    };

    if (file.webkitSlice) {
        blob = file.webkitSlice(start, stop + 1);
    } else if (file.mozSlice) {
        blob = file.mozSlice(start, stop + 1);
    }
    reader.readAsBinaryString(blob);
}

document.querySelector('.readBytesButtons').addEventListener('click', function (evt) {
    'use strict';
    if (evt.target.tagName.toLowerCase() === 'button') {
        var startByte = evt.target.getAttribute('data-startbyte'),
            endByte = evt.target.getAttribute('data-endbyte'),
            czas = $('select[name="czas"] option:selected').val(),
            czas_od = ($('select[name="czas_od"] option').length > 0) ? $('select[name="czas_od"] option:selected').val() : 0,
            czas_do = ($('select[name="czas_do"] option').length > 0) ? $('select[name="czas_do"] option:selected').val() : 0;

        readBlob(startByte, endByte, parseInt(czas, 10), czas_od, czas_do);
    }
}, false);