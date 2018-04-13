import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { DragDropContext, DropTarget } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { DragTypes } from '../../constants';
import StartujiciPanel from './StartujiciPanel';

const collect = (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver()
});

class DroppableStartujiciPanel extends Component {
  constructor(props) {
    super(props);
    const { dropType, onDrop } = this.props;

    const dropTarget = {
      drop: (dropProps, monitor) => {
        onDrop(monitor.getItem().id);
      }
    };

    this.Droppable = DropTarget(dropType, dropTarget, collect)(StartujiciPanel);
  }

  render = () => {
    const { dropType, onDrop, ...rest } = this.props;
    const { Droppable } = this;

    return <Droppable {...rest} />;
  };
}

DroppableStartujiciPanel.propTypes = {
  dropType: PropTypes.oneOf([DragTypes.STARTUJICI_PRIHLASEN, DragTypes.STARTUJICI_ODSTARTOVAN])
    .isRequired,
  onDrop: PropTypes.func.isRequired
};

// :TODO: When decorators are supported by babel for ES7, do: @DragDropContext(HTML5Backend)
export default DragDropContext(HTML5Backend)(DroppableStartujiciPanel);