import React, { Component } from 'react';
import reloadIcon from './images/reload.png';

 export default class Button extends Component{ 
    render() {
        return (
            <button 
                className='reset' 
                onClick={() => this.props.onClick()}>
                <img alt='Reset' src={reloadIcon} />
            </button>
        );  
    }
};