import React from "react";

export default jest.fn(function ReactAce(props) {
  return <div id={props.name}>ReactAce</div>;
});
