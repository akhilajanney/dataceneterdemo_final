import React, { useEffect } from "react";
import Chart from "chart.js/auto";
import "chartjs-plugin-dragdata";
import $ from "jquery";

const labels = [
  // "00:00",
  "01:00",
  "02:00",
  "03:00",
  "04:00",
  "05:00",
  "06:00",
  "07:00",
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
  "21:00",
  "22:00",
  "23:00",
  "23:59",
  ""
];

export default function Serverposition() {
  useEffect(() => {
    if ($("#chartCanvas").children().length !== 0) $("#tempChart").remove();
    var cnvs = document.createElement("canvas");
    $(cnvs).attr("id", "tempChart");
    $(cnvs).attr("width", "1100px");
    $(cnvs).attr("height", "500px");
    $(cnvs).css("margin", "30px");
    $("#chartCanvas").append(cnvs);
    // chart displaying code
    const tempChart = $("#tempChart");
    new Chart(tempChart, {
      type: "bar",
      data: {
        labels: labels,
        scaleLabel: {
          display: true,
          labelString: 'Some Axis...'
        },
        datasets: [
          {
          
            
            label: "CPU",
            yAxisID: "y",
            data: [
              100,
              96,
              84,
              76,
              69,
              100,
              96,
              84,
              76,
              69,
              100,
              96,
              84,
              76,
              69,
              100,
              96,
              84,
              76,
              69,
              100,
              96,
              84,
              76
            ],
            pointHitRadius: 10,
            fill: true,
            pointHoverRadius: 8,
            borderWidth: 1,
            backgroundColor: "rgba(20, 93, 230, 0.6)",
            tension: 0.3
          }
        ]
      },
      options: {
        barPercentage: 1,
        categoryPercentage: 1.05,
        legend: {
          display: false
        },
        scales: {
          y: {
            ticks: {
              beginAtZero: false
            }
          },
          x: {
            gridLines: {
              display: false
            },
            ticks: {
              display: true,
              align: "end",
              min: 10,
              max: labels.length,
              // stepSize:,
              callback: (v, i) => (i == 0 ? "" : labels[i - 1])
            },
          }
        },
        onHover: function (e) {
          const point = e.chart.getElementsAtEventForMode(
            e,
            "nearest",
            { intersect: true },
            false
          );
          if (point.length) e.native.target.style.cursor = "";
          else e.native.target.style.cursor = "";
        },
        
        responsive: false,
        plugins: {
          dragData: {
            round: 5,
            showTooltip: true,
            onDragStart: function (e) {
              // console.log(e)
            },
            onDrag: function (e, datasetIndex, index, value) {
              e.target.style.cursor = "grabbing";
              // console.log(e, datasetIndex, index, value);
            },
            onDragEnd: function (e, datasetIndex, index, value) {
              e.target.style.cursor = "default";
              console.log(datasetIndex, "=====", index, "=====", value);
            }
          }
        }
      }
    });
  }, []);
  return (
    <div>
    <p className="larger-text"></p>
    <div id="chartCanvas">
      <div id="time">00:00</div>
    </div>
    </div>
  )
}

