import React, { useState, useEffect } from 'react';
import { Graph } from '../Graph/Graph';
import styles from './Board.module.css';
import { mapValues } from 'lodash';
import { Dropdown, Slider, ProgressIndicator } from '@fluentui/react';
import { edgeOptions, algoOptions } from '../../configs/readOnly';
import { optionButtonStyles, sliderOptions } from './BoardStyles';
import appIcon from '../../images/logo.svg';

const Board = () => {
  const [options, setOptions] = useState({
    drawNode: true,
    moveNode: false,
    deleteNode: false,
    reset: false,
    editEdge: false,
    deleteEdge: false,
  });
  const [isPullDownMenuOpen, setPullDownMenuState] = useState(false);
  const [nodeSelection, setNodeSelection] = useState({
    isStartNodeSelected: false,
    isEndNodeSelected: false,
  });
  const [selectedEdge, setSelectedEdge] = useState(edgeOptions[0]);
  const [selectedAlgo, setSelectedAlgo] = useState(algoOptions[0]);
  const [isVisualizing, setVisualizingState] = useState(false);
  const [visualizationSpeed, setVisualizationSpeed] = useState(250);

  useEffect(() => {
    if (!isVisualizing) {
      setSelectedAlgo({ key: 'select', text: 'Select Algorithm' });
      // setNodeSelection({...options})
    }
  }, [isVisualizing]);

  //Activates the desired option from control panel.
  const activateOption = (option) => {
    const updatedOptions = mapValues(options, (_value, key) =>
      key === option ? true : false
    );
    setSelectedEdge({ key: 'select', text: 'Select Edge' });
    setSelectedAlgo({ key: 'select', text: 'Select Algorithm' });
    setNodeSelection(
      Object.assign(Object.assign({}, nodeSelection), {
        isStartNodeSelected: false,
        isEndNodeSelected: false,
      })
    );
    setOptions(updatedOptions);
    setPullDownMenuState(false);
  };

  //handles the selection of edge options and corresponding toggles for other options in control panel.
  const handleEdgeOptions = (_event, option) => {
    const updatedOptions = mapValues(options, () => false);
    setOptions(updatedOptions);
    setSelectedAlgo({ key: 'select', text: 'Select Algorithm' });
    setSelectedEdge(option);
    setPullDownMenuState(false);
  };

  //handles the selection of algo options and corresponding toggles for other options in control panel.
  const handleAlgoOptions = (_event, option) => {
    setSelectedAlgo(option);
    setSelectedEdge({ key: 'select', text: 'Select Edge' });
    if (
      (option === null || option === void 0 ? void 0 : option.key) === 'select'
    ) {
      const updatedOptions = mapValues(options, () => false);
      setOptions(updatedOptions);
    } else if (
      (option === null || option === void 0 ? void 0 : option.data) ===
      'traversal'
    ) {
      setNodeSelection(
        Object.assign(Object.assign({}, nodeSelection), {
          isStartNodeSelected: true,
        })
      );
      const updatedOptions = mapValues(options, () => false);
      setOptions(updatedOptions);
    } else if (
      (option === null || option === void 0 ? void 0 : option.data) ===
      'pathfinding'
    ) {
      setNodeSelection(
        Object.assign(Object.assign({}, nodeSelection), {
          isStartNodeSelected: true,
          isEndNodeSelected: true,
        })
      );
      const updatedOptions = mapValues(options, () => false);
      setOptions(updatedOptions);
    }
    setPullDownMenuState(false);
  };

  const handlePullDownMenu = () => {
    setPullDownMenuState(!isPullDownMenuOpen);
  };

  return (
    <>
      <div className={styles.board}>
        <div className={styles.controlPanel}>
          <div
            className={styles.appIconContainer}
            onClick={() => activateOption('reset')}
          >
            <img className={styles.appIcon} src={appIcon} alt="App Icon"></img>
            <div className={styles.appName}>Graph-Visualizer</div>
          </div>
          <div className={styles.nodeOptions}>
            <button
              className={`${styles.optionButtons} 
              ${options.drawNode && styles.selectedButtonOption}`}
              onClick={() => activateOption('drawNode')}
              disabled={isVisualizing}
            >
              <i className={`${styles.icon} fas fa-circle`}></i>
              Draw Node
            </button>
            <button
              className={`${styles.optionButtons} ${
                options.moveNode && styles.selectedButtonOption
              }`}
              onClick={() => activateOption('moveNode')}
              disabled={isVisualizing}
            >
              <i className={`${styles.icon} fas fa-arrows-alt`}></i>
              Move Node
            </button>
            <button
              className={`${styles.optionButtons} ${
                options.deleteNode && styles.selectedButtonOption
              }`}
              onClick={() => activateOption('deleteNode')}
              disabled={isVisualizing}
            >
              <i className={`${styles.icon} fas fa-trash`}></i>
              Delete Node
            </button>
          </div>
          <div className={styles.edgeOptions}>
            <Dropdown
              className={`${styles.dropdownWrapper} ${
                selectedEdge?.key !== 'select' && styles.selectedDropdownOption
              }`}
              options={edgeOptions}
              styles={optionButtonStyles.edgeDropdown}
              placeholder="Select Edge"
              selectedKey={selectedEdge && selectedEdge.key}
              onChange={handleEdgeOptions}
              disabled={isVisualizing}
            />
            <button
              className={`${styles.optionButtons} ${
                options.editEdge && styles.selectedButtonOption
              }`}
              onClick={() => activateOption('editEdge')}
              disabled={isVisualizing}
            >
              <i className={`${styles.icon} fas fa-pen`}></i>
              Add Weight
            </button>
            <button
              className={`${styles.optionButtons} ${
                options.deleteEdge && styles.selectedButtonOption
              }`}
              onClick={() => activateOption('deleteEdge')}
              disabled={isVisualizing}
            >
              <i className={`${styles.icon} fas fa-trash`}></i>
              Delete Edge
            </button>
          </div>
          <div className={styles.visualizeControls}>
            <Dropdown
              className={`${styles.dropdownWrapper} ${
                selectedAlgo?.key !== 'select' && styles.selectedDropdownOption
              }`}
              options={algoOptions}
              styles={optionButtonStyles.algoDropdown}
              placeholder="Select Algorithm"
              selectedKey={selectedAlgo && selectedAlgo.key}
              onChange={handleAlgoOptions}
              disabled={isVisualizing}
            />
            <Slider
              className={styles.speedSlider}
              label="Visual Delay"
              styles={sliderOptions}
              min={100}
              max={2000}
              step={200}
              value={visualizationSpeed}
              onChange={setVisualizationSpeed}
              disabled={isVisualizing}
            />
          </div>
          <div className={styles.miscellaneous}>
            <button
              className={`${styles.optionButtons} ${
                options.reset && styles.selectedButtonOption
              }`}
              onClick={() => activateOption('reset')}
              disabled={isVisualizing}
            >
              <i className={`${styles.icon} fas fa-undo-alt`}></i>
              Reset
            </button>
          </div>
        </div>

        {isVisualizing && (
          <div className={styles.visualizerProgress}>
            <ProgressIndicator styles={{ itemProgress: { padding: '0' } }} />
          </div>
        )}
        <div className={styles.graphContainer}>
          <Graph
            options={options}
            selectedAlgo={selectedAlgo}
            selectedEdge={selectedEdge}
            visualizationSpeed={visualizationSpeed}
            setVisualizingState={setVisualizingState}
            isVisualizing={isVisualizing}
            nodeSelection={nodeSelection}
            setNodeSelection={setNodeSelection}
          />
          <div className={styles.pullDownMenu} onClick={handlePullDownMenu}>
            <div
              className={styles.pullDownMenuButton}
              style={
                isPullDownMenuOpen
                  ? { transform: 'rotate(225deg)' }
                  : { transform: 'rotate(45deg' }
              }
            ></div>
          </div>
        </div>
      </div>
    </>
  );
};
export default Board;
