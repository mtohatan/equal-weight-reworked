import * as React from "react";

import {
  Grid,
  GridColumn as Column,
  GridToolbar,
} from "@progress/kendo-react-grid";

import { MyCommandCell } from "./MyCommandCell";

import * as WeightController from "../Services/WeightController";

const editField = "inEdit";

class ClsProductsGrid extends React.Component {
  constructor(props) {
    super(props);

    //updatedItems is array of ids
    //noWeightPreset is true when there are no items or
    //the data has items but for all the weight is empty
    this.state = { data: [], updatedItems: [], noWeightPreset: true };
    //---------------
    this.enterEdit = this.enterEdit.bind(this);
    this.remove = this.remove.bind(this);
    this.add = this.add.bind(this);
    this.discard = this.discard.bind(this);
    this.update = this.update.bind(this);
    this.cancel = this.cancel.bind(this);
  }

  //Component is loading
  componentDidMount() {
    this.loadGridData();
  } // modify the data in the store, db etc

  componentDidUpdate(prevProps) {
    if (this.props.worstBasket !== prevProps.worstBasket) {
      this.setState({ data: [], updatedItems: [], noWeightPreset: true });
      this.reloadGridData();
    }
  }

  loadGridData() {
    let newState = WeightController.loadGridData(this.state);
    this.setState({
      data: newState.data,
      noWeightPreset: newState.noWeightPreset,
    });
  }

  reloadGridData() {
    let newState = WeightController.reloadGridData(this.state);
    this.setState({
      data: newState.data,
      noWeightPreset: newState.noWeightPreset,
    });
  }

  //distribute equal weight only to items that have not been manually updated
  remove = (dataItem) => {
    let updatedData = WeightController.remove(dataItem, this.state);
    //the state should be updated again here
    this.setState({ data: updatedData });
  };

  add = (dataItem) => {
    let updatedData = WeightController.add(dataItem, this.state);
    this.setState({ data: updatedData });
  };

  update = (dataItem) => {
    let updatedState = WeightController.update(dataItem, this.state);
    this.setState({
      data: updatedState.data,
      updatedItems: updatedState.updatedItems,
    });
  };

  discard = () => {
    let newData = WeightController.discard(this.state);
    this.setState({ data: newData });
  };

  cancel = (dataItem) => {
    let newData = WeightController.cancel(dataItem, this.state);
    this.setState({ data: newData });
  };

  enterEdit = (dataItem) => {
    const editData = this.state.data.map((item) =>
      item.ProductID === dataItem.ProductID ? { ...item, inEdit: true } : item
    );
    this.setState({ data: editData });
  };

  itemChange = (event) => {
    const newData = WeightController.itemChange(event, this.state);
    this.setState({ data: newData });
  };

  addNew = () => {
    const newDataItem = {
      inEdit: true,
      Discontinued: false,
    };
    this.setState({ data: [newDataItem, ...this.state.data] });
  };

  CommandCell = (props) => (
    <MyCommandCell
      {...props}
      edit={this.enterEdit}
      remove={this.remove}
      add={this.add}
      discard={this.discard}
      update={this.update}
      cancel={this.cancel}
      editField={editField}
    />
  );

  render() {
    return (
      <div>
        <Grid
          style={{
            height: "560px",
            width: "1200px",
          }}
          data={this.state.data}
          onItemChange={this.itemChange}
          editField={editField}
        >
          <GridToolbar>
            <button
              title="Add new"
              className="k-button k-button-md k-rounded-md k-button-solid k-button-solid-primary"
              onClick={this.addNew}
            >
              Add new
            </button>
          </GridToolbar>
          <Column
            field="ProductID"
            title="Id"
            width="50px"
            editable={false}
            filterable={false}
          />
          <Column field="ProductName" title="Product Name" width="200px" />
          <Column
            field="FirstOrderedOn"
            title="First Ordered"
            editor="date"
            format="{0:d}"
            width="150px"
            filterable={false}
          />
          <Column
            field="UnitsInStock"
            title="Units"
            width="120px"
            editor="numeric"
            filterable={false}
          />
          <Column
            field="Discontinued"
            title="Discontinued"
            editor="boolean"
            filterable={false}
          />
          <Column
            field="Weight"
            title="Weight"
            width="120px"
            editor="numeric"
            filterable={false}
          />
          <Column cell={this.CommandCell} width="200px" filterable={false} />
        </Grid>
      </div>
    );
  }
}

export default ClsProductsGrid;
