import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import './style.css';
import BenderImg from './bender.jpg';
import DesignData from './sketch/design.sketch';

const SketchReactContainer = () => {
  return (
    <div>
      <img src={BenderImg} />
    </div>
  )
};

ReactDOM.render(<SketchReactContainer />, document.getElementById('sketchreactapp'));



