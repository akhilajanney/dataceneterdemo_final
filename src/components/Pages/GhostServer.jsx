import React, { Component } from 'react'
import axios from 'axios';
import $ from 'jquery';
import "../Pages/styles.css";
import mqtt from "mqtt";
import { linkClicked } from "../sidebar/Leftsidebar";
import { login_api } from '../urls/api';
import { getPagination, TableDetails, SessionOut, DataLoading } from "./Common";

export default class GhostServer extends Component {
    constructor() {
        super();
        this.state = {
            message: "",
            error: false,
            loading: true,
            username: '',
            primID: "",
            statusOnOff: "",
            password: '',
            message1: ''
        };
    }
    componentDidMount() {
        linkClicked(6);
        this.getGhostDetails("first");
        this.interval = setInterval(() => {
            this.getGhostDetails("repeat")
        }, 15 * 1000)
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    getGhostDetails = (callStatus) => {
        this.setState({ error: false, message: "" });
        if (callStatus === "first") {
            this.setState({ loading: true });
        } else {
            this.setState({ loading: false });
        }
        // $(".pagination").hide();
        // $("#rangeDropdown").hide();
        axios({ method: 'GET', url: "/api/asset/ghost" })
            .then((response) => {
                console.log("response====>", response)
                let data = response.data;
                $("#ghost_table tbody").empty();
                $("#ghost_table thead").empty();
                if (response.status === 200 || response.status === 201) {
                    if (data.length !== 0) {
                        $("#ghost_table thead").append(
                            "<tr>" +
                            "<th>SNO</th>" +
                            "<th>SERVER NAME</th>" +
                            "<th>RACK NAME</th>" +
                            "<th>MAKE</th>" +
                            "<th>MODEL</th>" +
                            "<th>U-LOCATION</th>" +
                            "<th>AVG.POWER</th>" +
                            "<th>MAX DEVIATION</th>" +
                            "<th>ACTION</th>" +
                            "</tr>"
                        );
                        for (let i = 0; i < data.length; i++) {
                            let status = '';
                            if (data[i].status === 'ON') {
                                status = "<div class='ghostbutton btnON' id='ghostbutton_" + data[i].id + "'><span class='ghostTxt'>" + data[i].status + "</span></div>";
                            } else {
                                status = "<div class='ghostbutton btnOFF' id='ghostbutton_" + data[i].id + "'><span class='ghostTxt'>" + data[i].status + "</span></div>";
                            }
                            let make = data[i].make.length > 0 ? data[i].model : "--";
                            let model = data[i].model.length > 0 ? data[i].model : "--";
                            $("#ghost_table tbody").append(
                                "<tr class=row_" + (i + 1) + ">" +
                                "<td>" + (i + 1) + "</td>" +
                                "<td>" + data[i].name + "</td>" +
                                "<td>" + data[i].rack + "</td>" +
                                "<td>" + make + "</td>" +
                                "<td>" + model + "</td>" +
                                "<td>" + data[i].location + "</td>" +
                                "<td>" + data[i].power.toFixed(2) + "</td>" +
                                "<td>" + data[i].deviation.toFixed(2) + "</td>" +
                                "<td>" + status + "</td> " +
                                "</tr>"
                            );
                            $("#ghostbutton_" + data[i].id).on("click",
                                // () => this.mqttGhost(this, data[i].id, data[i].status));
                                () => {
                                    this.setState({ primID: data[i].id, statusOnOff: data[i].status })
                                    this.authentication(this, data[i].id, data[i].status)
                                });
                        }
                        if (data.length > 25) {
                            $(".pagination").show();
                            $("#rangeDropdown").show();
                            getPagination(this, "#ghost_table");
                        }
                        this.setState({ loading: false });
                    } else {
                        this.setState({ message: "No Ghost Data Found!", error: true, loading: false });
                    }
                }
            })
            .catch((error) => {
                console.log("error======>", error)
                this.setState({ loading: false });
                if (error.response.status === 404) {
                    this.setState({ message: "No Ghost Data Found!", error: true });
                } else if (error.response.status === 403) {
                    $("#displayModal").css("display", "block");
                }
            })
    }
    authentication = (this_key, id, status) => {
        this.setState({ error: false, message1: '', });
        $('.textinput').val('')
        $('.modal_ghost').show();
        window.scrollTo(0, 500)
        $('.authenticate').css('display', 'block');

    }

    mqttGhost = (this_key, id, status) => {
        this.setState({ error: false, loading: true, message: "" });
        let self = this_key;
        if (status === 'OFF') {
            status = "ON";
        } else {
            status = "OFF";
        }
        const clientId = 'mqttjs_' + Math.random().toString(16).substring(2, 8)
        const host = "ws://192.168.0.73:9001";
        const options = {
            keepalive: 60,
            clientId: clientId,
            protocolId: "MQTT",
            protocolVersion: 4,
            clean: true,
            reconnectPeriod: 1000,
            connectTimeout: 30 * 1000,
            will: {
                topic: "WillMsg",
                payload: "Connection Closed abnormally..!",
                qos: 0,
                retain: false,
            },
        };
        const client = mqtt.connect(host)
        client.on('connect', function () {
            console.log("CONNECTED======>")
            client.subscribe('/ghost/statuschange', function (err) {
                if (!err) {
                    let pub = client.publish('/ghost/statuschange', status, options);
                    console.log("Publisher=====>", pub)
                    self.ghostStatusChange(id, status);

                } else {
                    console.log("ERROR======>")
                }
            })
        })

    }

    ghostStatusChange = (id, status) => {
        clearInterval(this.interval);
        let cll = $("#ghostbutton_" + id).attr("class");
        let cl = "";
        if (cll === 'ghostbutton btnOFF') {
            cl = "ghostbutton btnON";
            status = "ON";
        } else {
            cl = "ghostbutton btnOFF";
            status = "OFF";
        }
        this.setState({ error: false, message: "" });
        axios({
            method: 'PATCH', url: "/api/asset/ghost",
            data: { id: id, status: status }
        })
            .then((response) => {
                console.log("response====>", response)
                if (response.status === 200 || response.status === 201) {
                    $("#ghostbutton_" + id).removeClass(cll);
                    $("#ghostbutton_" + id).addClass(cl);
                    $("#ghostbutton_" + id + " > span").text(status);
                    // this.getGhostDetails();
                    this.componentDidMount();
                }
            })
            .catch((error) => {
                this.componentDidMount();
                console.log("error======>", error)
                this.setState({ loading: false });
                if (error.response.status === 404) {
                    this.setState({ message: "No Ghost Data Found!", error: true });
                } else if (error.response.status === 403) {
                    $("#displayModal").css("display", "block");
                }
            })
    }
    inputHandler = (event) => {
        this.setState({ [event.target.name]: event.target.value })
    }
    autenticateSubmit = (e) => {
        e.preventDefault();
        let uname = $("#username").val();
        let pwd = $("#password").val();
        const { statusOnOff, primID } = this.state;
        if (uname && pwd) {
            this.setState({ loading: true });
            $('.modal_ghost').hide();
            axios({
                method: "POST",
                url: login_api,
                data: { username: uname, password: pwd },
            })
            
                .then((response) => {
                    if (response.status === 200 || response.status === 201) {
                        this.mqttGhost(this, primID, statusOnOff);
                    }
                    else {
                        this.setState({ error: true, loading: false, message1: "Request Failed!" });
                    }
                })
                .catch((error) => {
                    $('.modal_ghost').show();
                    this.setState({ error: true, loading: false, message1: "Invalid Credentials!" });
                    $('.textinput').val('');
                    if (error.response.status === 403) {
                        $("#displayModal").css("display", "block");
                    }
                });
        }
        else {
            this.setState({ error: true, message1: "Required Credentials!" });
        }
    }
    render() {
        const { error, message, loading, message1 } = this.state;
        return (
            <div   style={{
                position:'relative',
                overflow: loading === true ? "hidden" : "none",
                height: loading === true ? "90vh" : "auto",
            }}>
                <div style={{ marginTop: "10px", }}>
                    {error && (
                        <div
                            style={{ color: "red", marginTop: "20px" }}>
                            <strong>{message}</strong>
                        </div>
                    )}

                    <div id="common_table" style={{ paddingBottom: "100px" }}>
                        <div className="table_det">
                            <div
                                id="rangeDropdown"
                                style={{
                                    float: "right",
                                    position: "relative",
                                    right: "6%",
                                    marginBottom: "20px",
                                    marginTop: "0%",
                                }}>
                                <select name="state" style={{ width: "120px" }} id="maxRows">
                                    <option value="25">25</option>
                                    <option value="50">50</option>
                                    <option value="75">75</option>
                                    <option value="100">100</option>
                                </select>
                            </div>
                            <table style={{ width: "95%", position: "relative" }} id="ghost_table">
                                <thead></thead>
                                <tbody></tbody>
                            </table>
                        </div>
                        <div className="pagination">
                            <button
                                id="prev1"
                                className="moving"
                                data-page="prev"
                                style={{ marginRight: "30px" }}>
                                Prev
                            </button>
                            <button className="moving" data-page="next" id="prev">
                                Next
                            </button>
                        </div>
                    </div>

                </div>

                {/* SessionOut Component used here!  */}
                <SessionOut />

                <div className="modal_ghost">
                    <div className='authenticate'>
                        <div className='authenticate_header'>
                            <div className='authenticate_icon'>
                                <i className="fas fa-times-circle" onClick={() => {
                                    $('.modal_ghost').hide();
                                    $('.textinput').val('')
                                }}></i>
                            </div>
                            <span>Authentication Required!</span>
                        </div>

                        <form>
                            {error && (
                                <span style={{ color: "red", textAlign: 'center' }}>
                                    <strong>{message1}</strong>
                                </span>
                            )}
                            <div style={{ textAlign: 'center', marginTop: '-10px', padding: '15px' }}>
                                <div>
                                    <input style={{ width: '200px', padding: '5px' }}
                                        type="text" id="username" name="username"
                                        placeholder=" Enter Username"
                                        required="required"
                                        autoComplete={"off"}
                                        className='textinput'
                                        onChange={this.inputHandler}
                                    />
                                </div>
                                <div>
                                    <input style={{ width: '200px', padding: '5px' }}
                                        type="password" id="password"
                                        name="password" placeholder="Enter Password"
                                        required="required" autoComplete="off"
                                        className='textinput'
                                        onChange={this.inputHandler}
                                    />
                                </div>
                                <div className="buttons" style={{ textAlign: "center", }}>
                                    <button style={{ cursor: 'pointer' }}
                                        onClick={this.autenticateSubmit}
                                    >Submit</button>
                                </div>
                            </div>
                        </form>

                    </div>
                </div>

                {loading === true && (
                    <div
                        style={{
                            top: "0%",
                            left: "0%",
                        }} className="frame">
                        <DataLoading />
                    </div>
                )}
            </div>
        )
    }
}