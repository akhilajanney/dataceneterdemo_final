import "./styles.css";
import React, { Component } from "react";
import Chart from "chart.js/auto";
import "chartjs-plugin-dragdata";
import $ from "jquery";
import axios from "axios";

export default class ServerPositioning extends Component {
    constructor() {
        super();
        this.state = {
            loading: false,
            labels: [
                "01:00", "02:00", "03:00", "04:00", "05:00", "06:00", "07:00", "08:00",
                "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00",
                "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00", "23:59", ""
            ],
            values: [
                10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10,
                10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10
            ],
        }
    }

    componentDidMount() {
        this.graphDatas(this);
    }

    graphDatas = (this_key) => {
        const { labels, values } = this.state;
        if ($("#chartCanvas").children().length !== 0) $("#tempChart").remove();
        var cnvs = document.createElement("canvas");
        $(cnvs).attr("id", "tempChart");
        $(cnvs).attr("width", "1100px");
        $(cnvs).attr("height", "400px");
        $(cnvs).css("margin", "10px");
        $("#chartCanvas").append(cnvs);
        const tempChart = $("#tempChart");
        new Chart(tempChart, {
            type: "bar",
            data: {
                labels: labels,
                datasets: [
                    {
                        label: "CPU",
                        yAxisID: "y",
                        data: values,
                        pointHitRadius: 10,
                        fill: true,
                        pointHoverRadius: 8,
                        borderWidth: 1,
                        backgroundColor: "rgba(54, 162, 235, 0.4)",
                        borderColor: "rgba(54, 162, 235, 1)",
                        tension: 0.3
                    }
                ]
            },
            options: {
                barPercentage: 1,
                categoryPercentage: 1.01,
                scales: {
                    y: {
                        suggestedMin: 0,
                        suggestedMax: 100,
                        ticks: {
                            beginAtZero: true,
                        }
                    },
                    x: {
                        gridLines: {
                            display: false
                        },
                        ticks: {
                            display: true,
                            align: "end",
                            callback: (v, i) => (i == 0 ? "" : labels[i - 1])
                        }
                    }
                },
                onHover: function (e) {
                    const point = e.chart.getElementsAtEventForMode(
                        e,
                        "nearest",
                        { intersect: true },
                        false
                    );
                    if (point.length) e.native.target.style.cursor = "grab";
                    else e.native.target.style.cursor = "default";
                },
                responsive: false,
                plugins: {
                    legend: {
                        display: false,
                        position: 'right',
                    },
                    tooltip: {
                        callbacks: {
                            title: function (tooltipItems, data) {
                                let ind = tooltipItems[0].dataIndex;
                                let labtime = "";
                                if (ind === 0) {
                                    labtime = "00:00";
                                } else {
                                    labtime = labels[tooltipItems[0].dataIndex - 1]
                                }
                                let lab = labtime + " - " + tooltipItems[0].label
                                return "Time: " + lab;
                            },
                            label: function (tooltipItems, data) {
                                return "Usage: " + tooltipItems.formattedValue + "%";
                            }
                        }
                    },
                    dragData: {
                        round: 0,
                        showTooltip: true,
                        onDragStart: function (e) {
                            // console.log(e)
                        },
                        onDrag: function (e, datasetIndex, index, value) {
                            e.target.style.cursor = "grabbing";
                            if (value < 0.5) return false;
                        },
                        onDragEnd: function (e, datasetIndex, index, value) {
                            e.target.style.cursor = "default";
                            this_key.changeGraphData(index, value);
                        }
                    }
                }
            }
        });

    }

    changeGraphData = (index, val) => {
        const { values } = this.state;
        let ddd = [];
        for (let i = 0; i < values.length; i++) {
            if (i === index) {
                ddd.push(val);
            } else {
                ddd.push(values[i]);
            }
        }
        console.log("---------====>", ddd);
    }

    sendGraphData = () => {
        const { labels, values } = this.state;
        let graph_data = []
        for (let i = 0; i < values.length; i++) {
            graph_data.push({ time: labels[i], cpu: values[i] });
        }
        console.log("sendGraphData--------->", graph_data);

        axios({ method: 'POST', url: '/api/server/position', data: graph_data })
            .then((response) => {
                console.log(response)
                let data = response.data;
                $("#server_table tbody").empty();
                $("#server_table thead").empty();
                if (response.status === 200 || response.status === 201) {
                    if (data.length > 0) {
                        $("#server_table thead").append(
                            "<tr>" +
                            "<th>SNO</th>" +
                            "<th>RACK ID</th>" +
                            "<th>RACK NAME</th>" +
                            "<th>ULOCATION</th>" +
                            "<th>COOLER</th>" +
                            "<th>RACK LOCATION</th>" +
                            "</tr>"
                        );
                        for (let i = 0; i < data.length; i++) {
                            $("#server_table tbody").append(
                                "<tr>" +
                                "<td>" + (i + 1) + "</td>" +
                                "<td>" + data[i].macid + "</td>" +
                                "<td>" + data[i].name + "</td>" +
                                "<td>" + data[i].Uloc + "</td>" +
                                "<td>" + data[i].coolerload + "</td>" +
                                "<td><div class='imgdiv' id='rackloc" + i + "'><i class='fas fa-location-circle'></i></div></td> " +
                                "</tr>"
                            );
                            $("#rackloc" + i).on("click", () => {
                                this.redirection(data[i].macid);
                            })
                        }
                        $("html").animate({ scrollTop: 300 }, "slow");
                    }
                }
            })
            .catch((error) => {
                // this.setState({ loading: false });
                console.log('Error====', error);
                if (error.response.status === 403) {
                    $("#displayModal").css("display", "block");
                }
            })
    }
    redirection = (rackid) => {
        window.location.pathname = "/realtime"
    }

    render() {
        return (
            <div id='divheight'
                style={{
                    position: "relative",
                    // overflow: loading === true ? "hidden" : "none",
                    height: "auto",
                }}>
                <div style={{ marginTop: "30px", }}>
                    <div id="chartCanvas">
                        <div id="charttime">00:00</div>
                    </div>
                </div>

                <button className="fancy-button" style={{ width: '120px', marginLeft: '4%' }}
                    onClick={this.sendGraphData}>Submit</button>

                <div id="common_table" style={{ paddingBottom: "50px", marginLeft: '3%' }}>
                    <div className="table_det">

                        <table style={{ width: "91%", position: "relative" }} id="server_table">
                            <thead></thead>
                            <tbody></tbody>
                        </table>
                    </div>

                </div>
            </div>
        )
    }
}