import * as React from "react";
import $ from "jquery";

class SidebarButton extends React.Component {
    render() {
        return (
            <button 
                role="button" 
                className="btn btn-secondary position-absolute p-2" 
                style={{top: "1rem", left: "1rem"}}
                onClick={() => {$("#sidebar, .overlay").addClass("active");}} >&#9776;</button>
        )
    }
}

function Page(props) {
    return (
        <div className="mt-5">
            <SidebarButton />
            {props.children}
        </div>
    )
}

export { Page, SidebarButton }
export default Page;