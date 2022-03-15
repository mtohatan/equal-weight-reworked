import _ from "lodash"; // Import the entire lodash library

import { sampleProducts } from "../Data/no-weight";
//import { sampleProducts } from "../Data/sample-products";
//import { sampleProducts } from "../Data/no-products";
//import { sampleProducts } from "../Data/some-weight";

export const originalData = () => getItems();

export const loadGridData = (state) => {
  //load data into the new state and return the new state
  let newState = _.cloneDeep(state);

  let newItems = originalData();
  let noWeight = newState.noWeightPreset;

  const equalWeight = checkEqualWeight(newItems);

  if (equalWeight && newItems.length !== 0) {
    //data has items, all items have no weight
    let newWeight = calculateWeight(newItems);
    for (const [i, product] of newItems.entries()) {
      product.Weight = newWeight;
    }
    noWeight = true;
  } else if (newItems.length === 0) {
    //data has no items
    noWeight = true;
  } else {
    //data has items and at least one item has preset weight
    noWeight = false;
  }

  newState = { data: newItems, noWeightPreset: noWeight };
  //console.log("New state: " + JSON.stringify(newState));

  return newState;
};

export const reloadGridData = (state) => {
  //load data into the new state and return the new state
  let newState = _.cloneDeep(state);
  let newItems = originalData();
  //modify a copy
  let newData = _.cloneDeep(newItems);

  let noWeight = state.noWeightPreset;

  const equalWeight = true;

  if (equalWeight && newItems.length !== 0) {
    //data has items, all items have no weight
    let newWeight = calculateWeight(newData);
    for (const [i, product] of newData.entries()) {
      product.Weight = newWeight;
    }
    noWeight = true;
  } else if (newItems.length === 0) {
    //data has no items
    noWeight = true;
  } else {
    //data has items and at least one item has preset weight
    noWeight = false;
  }
  newState = { data: newItems, noWeightPreset: noWeight };
  //console.log("New state: " + JSON.stringify(newState));

  return newState;
};

//distribute equal weight only to items that have not been manually updated
export const remove = (dataItem, state) => {
  const dataClone = _.cloneDeep(state.data);
  const newData = deleteItem(dataItem, dataClone);

  let updatedData = newData;
  if (state.noWeightPreset) {
    //Calculate weight sum of updated items
    //Subtract the sum from 100 and reset remaining items with the new weight

    updatedData = resetWeight(newData, state.updatedItems);
  }

  return updatedData;
};

export const add = (dataItem, state) => {
  dataItem.inEdit = true;

  const dataClone = _.cloneDeep(state.data);
  const newData = insertItem(dataItem, dataClone);

  let updatedData = newData;
  if (state.noWeightPreset) {
    //Calculate weight sum of updated items
    //Subtract the sum from 100 and reset remaining items with the new weight

    updatedData = resetWeight(newData, state.updatedItems);
  }
  //the state should be updated again here
  return updatedData;
};

export const update = (dataItem, state) => {
  dataItem.inEdit = false;
  //modify a copy
  const dataClone = _.cloneDeep(state.data);
  const stateClone = _.cloneDeep(state);
  const newData = updateItem(dataItem, dataClone);
  let updatedData = newData;

  //update the array of updated items if needed
  let newUpdatedItems = [];
  if (state.updatedItems.indexOf(dataItem.ProductID) < 0) {
    newUpdatedItems = [...state.updatedItems, dataItem.ProductID];
  } else {
    newUpdatedItems = [...state.updatedItems];
  }

  stateClone.updatedItems = newUpdatedItems;
  if (stateClone.noWeightPreset) {
    if (stateClone.updatedItems.length > 0) {
      updatedData = resetWeight(dataClone, stateClone.updatedItems);
    }
  }
  let newState = { data: updatedData, updatedItems: stateClone.updatedItems };
  return newState;
};

export const discard = (state) => {
  const stateClone = _.cloneDeep(state);
  const newData = [...stateClone.data];
  newData.splice(0, 1);
  return newData;
};

export const cancel = (dataItem, state) => {
  const dataClone = _.cloneDeep(state.data);
  const originalItem = originalData().find(
    (p) => p.ProductID === dataItem.ProductID
  );
  const newData = dataClone.map((item) =>
    item.ProductID === originalItem.ProductID ? originalItem : item
  );

  return newData;
};

export const itemChange = (event, state) => {
  const dataClone = _.cloneDeep(state.data);
  const newData = dataClone.map((item) =>
    item.ProductID === event.dataItem.ProductID
      ? { ...item, [event.field || ""]: event.value }
      : item
  );
  //this.setState({ data: newData });
  return newData;
};

//-------------------- The Services layer begins here --------------------------

const generateId = (dt) =>
  dt.reduce((acc, current) => Math.max(acc, current.ProductID), 0) + 1;

const insertItem = (item, data) => {
  data.shift(item);

  item.ProductID = generateId(data);
  item.inEdit = false;

  data.unshift(item);

  return data;
};

const getItems = () => {
  let data = [...sampleProducts];
  return data;
};

const updateItem = (item, data) => {
  let index = data.findIndex((record) => record.ProductID === item.ProductID);
  data[index] = item;
  return data;
};

const deleteItem = (item, source) => {
  let index = source.findIndex((record) => record.ProductID === item.ProductID);
  source.splice(index, 1);

  return source;
};

//calculate the weight to be equally distributed
const calculateWeight = (data) => {
  let weight = 100 / data.length;

  weight = (Math.round(weight * 100) / 100).toFixed(2);
  return weight;
};

//find out if the logic for setting equal weight can be applied to the data set
const checkEqualWeight = (data) => {
  //check if there is data
  if (data.length === 0) {
    return true;
  } else {
    //check if there is any weight value
    //if a value is found return false,
    //otherwise return true
    for (const [i, product] of data.entries()) {
      if (product.Weight !== undefined) {
        return false;
      } else {
        return true;
      }
    }
  }
};

const resetWeight = (data, updated) => {
  let sum = 0;
  let weightLeft = 100;
  let equalWeight = 0;

  for (const [i, product] of data.entries()) {
    if (updated.includes(product.ProductID)) {
      //sum up the weight of the updated
      sum += product.Weight;
    }
  }
  weightLeft = weightLeft - sum;

  //avoid dividing by zero
  if (data.length === updated.length) return data;
  equalWeight = Math.round(weightLeft / (data.length - updated.length)).toFixed(
    2
  );

  for (const [i, product] of data.entries()) {
    if (updated.includes(product.ProductID)) {
      continue;
    } else {
      product.Weight = equalWeight;
    }
  }

  return data;
};
