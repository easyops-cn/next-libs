import React from "react";

export const FontAwesomeIcon = jest.fn(function FontAwesomeIcon(props) {
  return <div>{props.icon}</div>;
});
