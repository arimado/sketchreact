import React from 'react';

class Design extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: props.data
    };
  }
  componentDidMount() {
    console.log(this.state.data);
  }
  render() {
    return <div>Design Component</div>;
  }
}
