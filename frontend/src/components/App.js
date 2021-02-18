import React, {Component} from "react";
import { render } from "react-dom";
import Homepage from "./Homepage"


const App = props =>{
    return(<div class="center">
            <Homepage/>
        </div>);
}



const appDiv = document.getElementById("app");
render(<App/>,appDiv);