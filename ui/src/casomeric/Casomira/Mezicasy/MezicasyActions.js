let nextMezicasId = 0;
export const setHighestMezicasId = highestId => {
  nextMezicasId = highestId + 1;
};

export const addMezicas = duration => ({
  type: 'ADD_MEZICAS',
  // eslint-disable-next-line no-plusplus
  id: nextMezicasId++,
  duration: duration.toJSON ? duration.toJSON() : duration
});

export const removeMezicas = id => ({
  type: 'REMOVE_MEZICAS',
  id
});