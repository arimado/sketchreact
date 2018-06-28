import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import './style.css';
import BenderImg from './bender.jpg';
import SimpleDesignData from './sketch/simple.sketch';
import QuoteCardData from './sketch/quote-card.sketch';
import { hot } from 'react-hot-loader';

const Star = (props) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" {...props}>
      <title>Star</title>
      <path
        d="M50.8,62.4c-0.2,0-0.3,0-0.5-0.1L32,52.5l-18.3,9.8c-0.4,0.2-0.8,0.2-1.1-0.1
c-0.3-0.2-0.5-0.6-0.4-1l3.5-20.7L0.8,25.8c-0.3-0.3-0.4-0.7-0.3-1.1C0.7,24.4,1,24.1,1.4,24l20.5-3l9.2-18.9
c0.4-0.7,1.5-0.7,1.9,0L42.1,21l20.5,3c0.4,0.1,0.7,0.3,0.8,0.7c0.1,0.4,0,0.8-0.3,1.1L48.4,40.5l3.5,20.7c0.1,0.4-0.1,0.8-0.4,1
C51.3,62.4,51,62.4,50.8,62.4"
      />
    </svg>
  );
};

const getColor = ({ alpha, blue, green, red }) => ({
  alpha,
  blue: Math.round(blue * 255),
  green: Math.round(green * 255),
  red: Math.round(red * 255)
});

const generateBgStyle = (style) => {
  const { color } = style;
  const { alpha, blue, green, red } = getColor(color);
  return {
    backgroundColor: `rgb(${red}, ${blue}, ${green})`
  };
};

const generateFillStyle = (style) => {
  const { color } = style;
  const { alpha, blue, green, red } = getColor(color);
  return {
    fill: `rgb(${red}, ${blue}, ${green})`
  };
};

const generateBorderStyle = (style) => {
  const { thickness, color } = style;
  const { alpha, blue, green, red } = getColor(color);
  return {
    border: `${thickness}px solid rgb(${red}, ${blue}, ${green})`
  };
};

const getStyles = (style) => {
  const styles = ['borders', 'fills', 'shadows', 'innerShadows'];
  return Object.entries(style)
    .filter(([key, val]) => styles.includes(key))
    .filter(([key, val]) => {
      if (val[0].hasOwnProperty('isEnabled') && val[0].isEnabled) {
        return true;
      } else if (val[0].hasOwnProperty('isEnabled')) {
        return false;
      }
      return true;
    })
    .map(([key, val]) => ({ ...val[0] }))
    .map((style) => {
      switch (style._class) {
        case 'border':
          return generateBorderStyle(style);
        case 'fill':
          return { ...generateBgStyle(style), ...generateFillStyle(style) };
        default:
          return {};
      }
    })
    .reduce((styles, currentStyle) => {
      return { ...styles, ...currentStyle };
    }, {});
};

const Frame = ({ x, y, width, height, children, styles, isVisible }) => {
  const visibilityStyles = isVisible ? {} : { display: 'none' };
  return (
    <div
      style={{
        width,
        height,
        position: 'absolute',
        top: y,
        left: x,
        ...styles,
        ...visibilityStyles
      }}
    >
      {children}
    </div>
  );
};

const Text = ({
  MSAttributedStringColorAttribute,
  MSAttributedStringFontAttribute,
  MSAttributedStringTextTransformAttribute,
  paragraphStyle,
  kerning,
  children
}) => {
  const { alpha, blue, green, red } = getColor(
    MSAttributedStringColorAttribute
  );
  const { size } = MSAttributedStringFontAttribute.attributes;
  const { maximumLineHeight } = paragraphStyle;
  const textTransformStyles = MSAttributedStringTextTransformAttribute
    ? { textTransform: 'uppercase' }
    : {};
  return (
    <span
      style={{
        color: `rgb(${red},${green},${blue})`,
        fontSize: `${size}px`,
        lineHeight: `${maximumLineHeight}px`,
        letterSpacing: `${kerning}px`,
        ...textTransformStyles
      }}
    >
      {children}
    </span>
  );
};

const Material = ({ layer, parentStyles, parentLayer }) => {
  const { _class, attributedString, frame, style } = layer;
  switch (_class) {
    case 'text':
      return (
        <Frame
          {...frame}
          isVisible={layer.isVisible}
          styles={{ overflow: 'hidden' }}
        >
          <Text {...style.textStyle.encodedAttributes}>
            {attributedString.string}
          </Text>
        </Frame>
      );
    case 'star':
    case 'rectangle':
    case 'shapePath':
    case 'bitmap':
    case 'oval':
    default:
      return <div style={{ display: 'none' }}>{_class}</div>;
  }
};

const Shape = (props) => {
  const { children, frame, layers, style, isVisible } = props;
  const shapeType = layers[0]._class;
  switch (shapeType) {
    case 'rectangle':
      return (
        <Frame
          {...frame}
          isVisible={isVisible}
          styles={{
            ...getStyles(style),
            borderRadius: layers[0].points[0].cornerRadius
          }}
        >
          {children}
        </Frame>
      );
    case 'oval':
      return (
        <Frame
          {...frame}
          isVisible={isVisible}
          styles={{ ...getStyles(style), borderRadius: '30px' }}
        >
          {children}
        </Frame>
      );
    case 'shapePath':
      return (
        <Frame
          {...frame}
          isVisible={true}
          styles={{ ...getStyles(style), borderRadius: '30px' }}
        >
          {children}
        </Frame>
      );
    case 'star':
      console.log(getStyles(style));
      return (
        <Frame {...frame} isVisible={true}>
          <Star {...frame} fill="rgb(221, 221, 221)" />
        </Frame>
      );
    case 'bitmap':
    default:
      return (
        <Frame {...frame} isVisible={isVisible}>
          {children}
        </Frame>
      );
  }
};

const buildLayers = (layers, parentStyles = null, parentLayer = null) => {
  return layers.map((layer) => {
    if (layer.layers && layer.layers.length) {
      switch (layer._class) {
        case 'shapeGroup':
          return (
            <Shape {...layer}>{buildLayers(layer.layers, layer.style)}</Shape>
          );
        default:
          return (
            <Frame {...layer.frame} isVisible={layer.isVisible}>
              {buildLayers(layer.layers, layer.style, layer)}
            </Frame>
          );
      }
    }
    return (
      <Material
        layer={layer}
        parentStyles={parentStyles}
        parentLayer={parentLayer}
      />
    );
  });
};

const renderTree = (data) => {
  return Object.entries(data.pages).map(([key, page]) =>
    buildLayers(page.layers)
  );
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
  }
  render() {
    const { data } = this.state;
    return (
      <div>
        <h1> Reactify </h1>
        <div style={{ position: 'relative' }}>{renderTree(data)}</div>
      </div>
    );
  }
}

ReactDOM.render(
  <DesignPresenter data={QuoteCardData} />,
  document.getElementById('sketchreactapp')
);
