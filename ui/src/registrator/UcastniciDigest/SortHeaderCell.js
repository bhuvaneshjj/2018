import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Cell } from 'fixed-data-table-2';
import { SortDirTypes } from './ucastniciDigestReducer';
import './SortHeaderCell.css';

const sortDirs = {};
sortDirs[SortDirTypes.NONE] = '';
sortDirs[SortDirTypes.ASC] = '↑';
sortDirs[SortDirTypes.DESC] = '↓';

class SortHeaderCell extends Component {
  sortDirChanged = event => {
    event.preventDefault();

    this.props.onSortDirChange();
  };

  render = () => (
    <Cell>
      <a onClick={this.sortDirChanged}>
        {this.props.children} {sortDirs[this.props.sortDir]}
      </a>
    </Cell>
  );
}

SortHeaderCell.propTypes = {
  onSortDirChange: PropTypes.func.isRequired,
  sortDir: PropTypes.oneOf([SortDirTypes.NONE, SortDirTypes.ASC, SortDirTypes.DESC]),
  children: PropTypes.node
};

export default SortHeaderCell;