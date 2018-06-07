import React from 'react';


export default function Filter(props){
  
  return (
    <div className="info">
      <p>State: {props.state}</p>
      <p>County: {props.county}</p>
    </div>
  );
};
