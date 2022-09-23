import React, { Component } from 'react'
import { getPagination, TableDetails, SessionOut, DataLoading } from "./Common";
import axios from 'axios';
import $ from 'jquery';
import "../Pages/styles.css";
import { linkClicked } from "../sidebar/Leftsidebar";
import GhostServer from './GhostServer';
import ServerPositioning from './ServerPositioning';

export default class Tools extends Component {
    optionList = [false, false];
    constructor() {
        super();
        this.state = {
            message: "",
            error: false,
            loading: false,
            flag: false,
        };
    }
    componentDidMount() {
        this.setState({ flag: true })
        this.optionList[0] = true;
        $("#opt0").css({ "background": "#00629B", "color": "white" });
    }

    btnOption = (e) => {
        $(".myDIV").parent().find('button').removeClass("active");
        this.setState({ flag: true });
        this.optionList = [false, false];
        this.optionList[e.target.id - 1] = true;
        $("#" + e.target.id).addClass("active");
    }
    render() {
        const { error, message, loading, message1 } = this.state;
        return (
            <div id='divheight'
                style={{
                    float: "right", width: "95%", background: '#E5EEF0',
                    marginLeft: '60px', position: "relative",
                    overflow: loading === true ? "hidden" : "none",
                    height: loading === true ? "100vh" : "auto",
                }}>
                <div style={{ marginTop: "30px", marginLeft: "60px", }}>
                    <span className="main_header">TOOLS</span>
                    <div className="underline"></div>

                    {error && (
                        <div
                            style={{ color: "red", marginTop: "20px" }}>
                            <strong>{message}</strong>
                        </div>
                    )}

                    <div className="myDIV" style={{ marginTop: '20px' }}>
                        <button id="1" onClick={this.btnOption} className="fancy-button active">Ghost Server</button>
                        <button id="2" onClick={this.btnOption} className="fancy-button">Server Positioning</button>
                    </div>
                    <div>
                        {this.optionList[0] && (<GhostServer />)}
                        {this.optionList[1] && (<ServerPositioning />)}
                    </div>
                </div>



                {/* SessionOut Component used here!  */}
                <SessionOut />
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
