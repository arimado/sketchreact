import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import './style.css';
import BenderImg from './bender.jpg';
import SimpleDesignData from './sketch/simple.sketch';
import CreditPackData from './sketch/credit-pack-tile.sketch';
import { hot } from 'react-hot-loader';
import Design from './components/Design/Design.jsx';

const HotDesign = hot(module)(Design);

const getStyles = (style) => {
  const styles = ['borders', 'fills', 'shadows', 'innerShadows'];
  return Object.entries(style)
    .filter(([key, val]) => styles.includes(key))
    .map(([key, val]) => ({ [key]: val }));
};

const buildRectangle = (layer) => {
  const {
    frame: { height, width, x, y },
    style
  } = layer;
  return (
    <div
      className={layer.do_objectID}
      style={{
        width,
        height,
        position: 'absolute',
        top: y,
        left: x,
        background: 'blue'
      }}
    />
  );
};

const buildShapeGroup = (layer) => {
  switch (layer.name) {
    case 'Rectangle':
      return buildRectangle(layer);
    case 'shapeGroup':
      return buildShapeGroup(layer);
    default:
      return null;
  }
};

const buildLayers = (layers) => {
  return layers.map((layer) => {
    switch (layer._class) {
      case 'shapeGroup':
        return buildShapeGroup(layer);
      case 'group':
        return buildLayers(layer.layers);
      default:
        return null;
    }
  });
};

const buildDomTree = (layers) => {
  if (layers.length === undefined) {
    return <div>layers</div>;
  }
  return (
    <div>
      layer
      {layers.map((node) => {
        if (
          node &&
          node.$$typeof &&
          node.$$typeof === 'Symbol(react.element)'
        ) {
          return <node />;
        }
        return buildDomTree(node);
      })}
    </div>
  );
};

const renderTree = (data) => {
  const layers = Object.entries(data.pages).map(([key, page]) =>
    buildLayers(page.layers)
  );
  return layers;
};

class DesignPresenter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: props.data
    };
  }
  componentDidMount() {
    const data = this.state.data;
    console.log(data);
  }
  render() {
    const { data } = this.state;
    return (
      <div>
        <h1> Design Presenter </h1>
        {renderTree(data)}
      </div>
    );
  }
}

ReactDOM.render(
  <DesignPresenter data={CreditPackData} />,
  document.getElementById('sketchreactapp')
);
